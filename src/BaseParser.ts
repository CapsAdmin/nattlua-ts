import { Parser } from "prettier"
import { Helpers } from "./Helpers"
import { syntax } from "./LuaLexer"
import { Token, TokenType as string } from "./Token"

interface ValueNode extends ParserNode {
	Type: "expression"
	Kind: "value"
	value: Token
}

interface TypeCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "type_code"
	value: ValueNode
	lua_code: ValueNode
}

interface ReturnStatement extends ParserNode {
	Type: "statement"
	Kind: "return"
	expressions: AnyParserNode[]
	Tokens: ParserNode["Tokens"] & {
		["return"]: Token
	}
}

interface ParserCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "parser_code"
	value: ValueNode
	lua_code: ValueNode
}

interface AnalyzerFunctionExpression extends ParserNode {
	Type: "expression"
	Kind: "analyzer_function"
	value: ValueNode
	identifiers: AnyParserNode[]
	return_types: AnyParserNode[]
	statements: AnyParserNode[]
	Tokens: ParserNode["Tokens"] & {
		["analyzer"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["end"]: Token
	}
}

interface BinaryOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "binary_operator"
	value: Token
	left: AnyParserNode
	right: AnyParserNode
}

interface PrefixOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "binary_operator"
	value: Token
	right: AnyParserNode
	Tokens: ParserNode["Tokens"] & {
		["operator"]: Token
	}
}

type AnyParserNode = ValueNode | TypeCodeStatement | ParserCodeStatement | BinaryOperatorExpression

export class ParserNode {
	Type: "expression" | "statement" = "statement"
	Kind: string = "unknown"
	id: number = 0
	Code: string = ""
	Name: string = ""
	Parent: ParserNode | undefined
	Parser: BaseParser

	standalone_letter?: ParserNode
	parser_call?: boolean
	type_expression?: AnyParserNode

	constructor(parser: BaseParser, name: string, code: string) {
		this.Parser = parser
	}

	Tokens: {
		["("]?: Token[]
		[")"]?: Token[]
		[":"]?: Token
		[","]?: Token
	} = {}

	ToString() {}
	IsWrappedInParenthesis() {
		return this.Tokens["("] && this.Tokens[")"]
	}

	GetLength() {}
	End() {
		this.Parser.Nodes.splice(1, 1)[0]
		return this
	}
}

let id = 0

export class BaseParser {
	Tokens: Token[] = []
	Nodes: ParserNode[] = []
	CurrentStatement?: ParserNode
	CurrentExpression?: ParserNode
	Code: string = ""
	Name: string = ""
	config?: {
		on_statement: (node: AnyParserNode) => AnyParserNode | undefined
	}
	i: number = 0
	constructor(tokens: Token[]) {
		this.Tokens = tokens
	}
	GetToken(offset = 0) {
		return this.Tokens[this.i + offset]
	}
	GetLength() {
		return this.Tokens.length
	}
	Advance(offset: number) {
		this.i += offset
	}
	IsType(token_type: string, offset: number = 0) {
		let tk = this.GetToken(offset)
		return tk && tk.type == token_type
	}
	IsValue(value: string, offset: number = 0) {
		let tk = this.GetToken(offset)
		return tk && tk.value == value
	}
	OnError(code: string, name: string, message: string, start: number, stop: number, ...args: any[]) {
		console.error(name, message, start, stop, args)
		throw new Error(message)
	}
	Error(msg: string, start_token?: Token, stop_token?: Token, ...args: any[]) {
		let tk = this.GetToken()
		let start = start_token ? start_token.start : tk ? tk.start : 0
		let stop = start_token ? start_token.start : tk ? tk.start : 0

		this.OnError(this.Code, this.Name, msg, start, stop, ...args)
	}
	private ErrorExpect(str: string, what: keyof Token, start?: Token, stop?: Token) {
		let tk = this.GetToken()
		if (!tk) {
			return this.Error("expected $1 $2: reached end of code", start, stop, what, str)
		}
		this.Error("expected $1 $2: got $3", start, stop, what, str, tk[what])
	}
	ExpectType(token_type: string, error_start?: Token, error_stop?: Token) {
		if (!this.IsType(token_type)) {
			this.ErrorExpect(token_type, "type", error_start, error_stop)
		}
		return this.ReadToken()!
	}
	ExpectValue(value: string, error_start?: Token, error_stop?: Token) {
		if (!this.IsValue(value)) {
			this.ErrorExpect(value, "value", error_start, error_stop)
		}
		return this.ReadToken()!
	}

	ReadToken() {
		let tk = this.GetToken()
		if (!tk) return null
		this.Advance(1)
		tk.parent = this.Nodes[0]
		return tk
	}

	Node(type: ParserNode["Type"], kind: string) {
		id++

		let node = new ParserNode(this, this.Name, this.Code)
		node.Type = type
		node.Kind = kind

		if (type == "expression") {
			this.CurrentExpression = node
		} else {
			this.CurrentStatement = node
		}

		this.OnNode(node)

		node.Parent = this.Nodes[0]
		this.Nodes.unshift(node)

		return node
	}

	OnNode(node: ParserNode) {}

	ReadDebugCode() {
		if (this.IsType("type_code")) {
			let node = this.Node("statement", "type_code") as TypeCodeStatement
			let code = this.Node("expression", "value") as ValueNode
			code.value = this.ExpectType("type_code")
			code.End()
			node.lua_code = code
			return node.End()
		} else if (this.IsType("parser_code")) {
			let token = this.ExpectType("parser_code")
			let node = this.Node("statement", "parser_code") as ParserCodeStatement
			let code = this.Node("expression", "value") as ValueNode
			code.value = token
			node.lua_code = code.End()
			return node.End()
		}
	}

	private ReadMultipleValues<T>(max: number | undefined, reader: () => AnyParserNode | undefined) {
		let out: AnyParserNode[] = []

		for (let i = 1; i < (max || this.GetLength()); i++) {
			let node = reader()
			if (!node) break
			out.push(node)
			if (!this.IsValue(",")) break
			node.Tokens[","] = this.ExpectValue(",")!
		}

		return out
	}

	GetPreferTypesystem() {
		return false
	}

	private ReadParenthesisExpression() {
		if (!this.IsValue("(")) return

		let pleft = this.ExpectValue("(")
		let node = this.ReadExpression(0)

		if (!node) {
			this.Error("empty parentheses group", pleft)
			return
		}

		node.Tokens["("] = node.Tokens["("] || []
		node.Tokens["("].unshift(pleft)

		node.Tokens[")"] = node.Tokens[")"] || []
		node.Tokens[")"].push(this.ExpectValue(")"))

		return node
	}

	private ReadIndex() {
		if (!this.IsValue(".") && this.IsType("letter", 1)) return
		let node = this.Node("expression", "binary_operator") as BinaryOperatorExpression
		node.value = this.ReadToken()!
		node.right = this.Node("expression", "value") as ValueNode
		node.right.value = this.ExpectType("letter")
		node.End()
		return node
	}

	ReadNodes(stop_token: { [key: string]: boolean }) {
		let out: AnyParserNode[] = []
		for (let i = 1; i < this.GetLength(); i++) {
			let tk = this.GetToken()
			if (!tk) break
			if (stop_token && stop_token[tk.value]) break
			let node = this.ReadNode()
			if (!node) break
			out[i] = node

			if (this.config && this.config.on_statement) {
				out[i] = this.config.on_statement(out[i]!) || out[i]!
			}
		}
		return out
	}

	ReadSubExpression(node: AnyParserNode) {
		for (let i = 1; i < this.GetLength(); i++) {
			let left_node = node

			// 			read_and_add_explicit_type(parser, node)

			let found = this.ReadIndex() // ||
			//read_self_call(parser) or
			//read_call(parser) or
			//				read_postfix_operator(parser) or
			//read_postfix_index_expression(parser)

			if (!found) break
			found.left = left_node

			if (left_node.value && left_node.value.value) {
				found.parser_call = true
			}

			node = found
		}

		return node
	}

	ReadPrefixOperator() {
		if (!syntax.IsPrefixOperator(this.GetToken()!)) return

		let node = this.Node("expression", "prefix_operator") as PrefixOperatorExpression
		node.value = this.ReadToken()!
		node.Tokens["operator"] = node.value
		node.right = this.ExpectExpression(Infinity)!
		return node.End()
	}

	private ReadTypeFunctionArguments(expect_type: boolean) {
		if (this.IsValue(")")) return
		if (this.IsValue("...")) return

		if (expect_type || (this.IsType("letter") && this.IsValue(":", 1))) {
			let identifier = this.ReadToken()
			let token = this.ExpectValue(":")
			let exp = this.ExpectTypeExpression()
			exp.tokens[":"] = token
			exp.identifier = identifier
			return exp
		}

		return this.ExpectTypeExpression()
	}
	ReadAnalyzerFunctionBody(node: AnalyzerFunctionExpression, type_args: boolean) {
		node.Tokens["arguments("] = this.ExpectValue("(")
		node.identifiers = this.ReadMultipleValues(Infinity, () => this.ReadTypeFunctionArguments(type_args))
		if (this.IsValue("...")) {
			let vararg = this.Node("expression", "value") as ValueNode
			vararg.value = this.ExpectValue("...")

			if (this.IsValue(":") || type_args) {
				vararg.Tokens[":"] = this.ExpectValue(":")
				vararg.type_expression = this.ExpectTypeExpression()
			} else {
				if (this.IsType("letter")) {
					vararg.type_expression = this.ExpectTypeExpression()
				}
			}

			vararg.End()

			node.identifiers.push(vararg)
		}

		node.Tokens["arguments)"] = this.ExpectValue(")", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.return_types = this.ReadMultipleValues(Infinity, () => this.ReadTypeExpression())
		} else if (!this.IsValue(",")) {
			let start = this.GetToken()
			node.statements = this.ReadNodes({ end: true })
			node.Tokens["end"] = this.ExpectValue("end", start, start)
		}
	}
	ReadAnalyzerFunction() {
		if (!this.IsValue("analyzer") || !this.IsValue("function", 1)) return
		let node = this.Node("expression", "analyzer_function") as AnalyzerFunctionExpression
		node.Tokens["analyzer"] = this.ExpectValue("function")

		this.ReadAnalyzerFunctionBody(node, false)
		return node.End()
	}

	ReadExpression(priority: number = 0): AnyParserNode | undefined {
		if (this.GetPreferTypesystem()) {
			//return this.ReadTypeExpression(priority)
		}

		let node =
			this.ReadParenthesisExpression() ||
			this.ReadPrefixOperator() ||
			this.ReadAnalyzerFunction() ||
			this.ReadFunction() ||
			this.ReadImport() ||
			this.ReadValue() ||
			this.ReadTable()

		let first = node

		if (node && first) {
			node = this.ReadSubExpression(node)
			if (node) {
				if (first.Kind == "value" && (first.value.type == "letter" || first.value.value == "...")) {
					first.standalone_letter = node
				}
			}
		}

		// check_integer_division

		while (
			syntax.GetBinaryOperatorInfo(this.GetToken()!) &&
			syntax.GetBinaryOperatorInfo(this.GetToken()!)!.left_priority > priority
		) {
			let left_node = node
			node = this.Node("expression", "binary_operator") as BinaryOperatorExpression
			node.value = this.ReadToken()!
			node.left = left_node!

			if (node.left) {
				node.left.Parent = node
			}

			node.right = this.ExpectExpression(syntax.GetBinaryOperatorInfo(node.value)!.right_priority)!

			if (!node.right) {
				let token = this.GetToken()
				this.Error(
					"expected right side to be an expression, got $1",
					undefined,
					undefined,
					token && ((token.value != "" && token.value) || token.type),
				)
				return
			}

			node.End()
		}

		return node
	}

	ExpectExpression(priority = 0) {
		let token = this.GetToken()

		if (
			!token ||
			token.type == "end_of_file" ||
			token.value == "}" ||
			token.value == "," ||
			token.value == "]" ||
			(syntax.IsKeyword(token) &&
				!syntax.IsPrefixOperator(token) &&
				!syntax.IsTokenValue(token) &&
				token.value != "function")
		) {
			this.Error(
				"expected beginning of expression, got $1",
				undefined,
				undefined,
				token && ((token.value != "" && token.value) || token.type),
			)
			return
		}

		return this.ReadExpression(priority)
	}

	ReadReturn() {
		if (!this.IsValue("return")) return undefined

		let node = this.Node("statement", "return") as ReturnStatement
		node.Tokens["return"] = this.ExpectValue("return")
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0)) // TODO: avoid creating closure
	}

	ReadNode() {
		if (this.IsType("end_of_file")) return

		return this.ReadDebugCode()
	}
}
