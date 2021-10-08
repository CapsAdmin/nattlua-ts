import { Parser } from "prettier"
import { Helpers } from "./Helpers"
import { syntax } from "./LuaLexer"
import { Token, TokenType as string } from "./Token"

export interface ValueNode extends ParserNode {
	Type: "expression"
	Kind: "value"
	value: Token
}
export interface TableNode extends ParserNode {
	Type: "expression"
	Kind: "table"
	children: AnyParserNode[]
	spread: boolean
	is_array: boolean
	is_dictionary: boolean
	Tokens: ParserNode["Tokens"] & {
		["{"]: Token
		["}"]: Token
		["separators"]: Token[]
	}
}

export interface PostfixCallExpressionNode extends ParserNode {
	Type: "expression"
	Kind: "postfix_call"
	expressions: AnyParserNode[]
	type_call: boolean
	left: AnyParserNode
	Tokens: ParserNode["Tokens"] & {
		["call("]: Token
		["call)"]: Token
		["!"]: Token
	}
}

export interface TableSpreadExpressionNode extends ParserNode {
	Type: "expression"
	Kind: "table_spread"
	expression: AnyParserNode

	Tokens: ParserNode["Tokens"] & {
		["..."]: Token
	}
}

export interface PostfixOperatorExpressionNode extends ParserNode {
	Type: "expression"
	Kind: "postfix_operator"
	value: Token
	left: AnyParserNode
}

export interface PostfixIndexExpressionNode extends ParserNode {
	Type: "expression"
	Kind: "postfix_expression_index"
	index: AnyParserNode
	left: AnyParserNode

	Tokens: ParserNode["Tokens"] & {
		["["]: Token
		["]"]: Token
	}
}

export interface TypeCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "type_code"
	value: ValueNode
	lua_code: ValueNode
}

export interface ReturnStatement extends ParserNode {
	Type: "statement"
	Kind: "return"
	expressions: AnyParserNode[]
	Tokens: ParserNode["Tokens"] & {
		["return"]: Token
	}
}

export interface TableExpressionValueNode extends ParserNode {
	Type: "expression"
	Kind: "table_value"

	expression_key: boolean
	key_expression: AnyParserNode
	value_expression: AnyParserNode

	Tokens: ParserNode["Tokens"] & {
		["="]: Token
		["["]: Token
		["]"]: Token
	}
}

export interface TableKeyValueNode extends ParserNode {
	Type: "expression"
	Kind: "table_key_value"
	value_expression: AnyParserNode
	spread?: TableSpreadExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
	}
}

export interface TableIndexNode extends ParserNode {
	Type: "expression"
	Kind: "table_index_value"

	value_expression: AnyParserNode

	spread?: TableSpreadExpressionNode

	key: number
}

export interface ParserCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "parser_code"
	value: ValueNode
	lua_code: ValueNode
}

export interface AnalyzerFunctionExpression extends ParserNode {
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
export interface FunctionExpression extends ParserNode {
	Type: "expression"
	Kind: "function"
	value: ValueNode
	identifiers: AnyParserNode[]
	return_types: AnyParserNode[]
	statements: AnyParserNode[]
	Tokens: ParserNode["Tokens"] & {
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["end"]: Token
	}
}

export interface ImportExpression extends ParserNode {
	Type: "expression"
	Kind: "import"
	path: string
	expressions: AnyParserNode[]
	Tokens: ParserNode["Tokens"] & {
		["import"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["end"]: Token
	}
}

export interface BinaryOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "binary_operator"
	value: Token
	left: AnyParserNode
	right: AnyParserNode
}

export interface PrefixOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "prefix_operator"
	value: Token
	right: AnyParserNode
	Tokens: ParserNode["Tokens"] & {
		["operator"]: Token
	}
}

export type AnyParserNode =
	| ValueNode
	| TypeCodeStatement
	| ReturnStatement
	| TableExpressionValueNode
	| TableKeyValueNode
	| TableIndexNode
	| ParserCodeStatement
	| AnalyzerFunctionExpression
	| FunctionExpression
	| ImportExpression
	| BinaryOperatorExpression
	| PrefixOperatorExpression
	| TableNode
	| TableSpreadExpressionNode
	| PostfixCallExpressionNode
	| PostfixOperatorExpressionNode
	| PostfixIndexExpressionNode

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

	identifier?: Token | null

	constructor(parser: BaseParser, name: string, code: string) {
		this.Parser = parser
	}

	Tokens: {
		["("]?: Token[]
		[")"]?: Token[]
		[":"]?: Token
		[","]?: Token
		["as"]?: Token
		["is"]?: Token
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
	config: {
		path?: string
		on_statement?: (node: AnyParserNode) => AnyParserNode | undefined
	} = {}
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
		return undefined
	}

	private ReadMultipleValues<T>(max: number | undefined, reader: () => AnyParserNode | undefined) {
		let out: AnyParserNode[] = []

		for (let i = 0; i < (max || this.GetLength()); i++) {
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
		if (!(this.IsValue(".") && this.IsType("letter", 1))) return
		let node = this.Node("expression", "binary_operator") as BinaryOperatorExpression
		node.value = this.ReadToken()!
		node.right = this.Node("expression", "value") as ValueNode
		node.right.value = this.ExpectType("letter")
		node.End()
		return node
	}

	ReadNodes(stop_token: { [key: string]: boolean }) {
		let out: AnyParserNode[] = []
		for (let i = 0; i < this.GetLength(); i++) {
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

	ReadSelfCall() {
		if (!(this.IsValue(":") && this.IsType("letter", 1) && this.IsCallExpression(2))) return

		let node = this.Node("expression", "binary_operator") as BinaryOperatorExpression
		node.value = this.ReadToken()!
		node.right = this.Node("expression", "value") as ValueNode
		node.right.value = this.ExpectType("letter")
		node.right.End()

		return node.End()
	}

	IsCallExpression(offset: number) {
		return (
			this.IsValue("(", offset) ||
			this.IsValue("<|", offset) ||
			this.IsValue("{", offset) ||
			this.IsType("string", offset) ||
			(this.IsValue("!", offset) && this.IsValue("(", offset + 1))
		)
	}

	ReadCallExpression() {
		let node = this.Node("expression", "postfix_call") as PostfixCallExpressionNode

		if (this.IsValue("{")) {
			node.expressions = [this.ReadTable()!]
		} else if (this.IsType("string")) {
			let value = this.Node("expression", "value") as ValueNode
			value.value = this.ReadToken()!
			value.End()

			node.expressions = [value]
		} else if (this.IsValue("<|")) {
			node.Tokens["call("] = this.ExpectValue("<|")
			node.expressions = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0))
			node.Tokens["call)"] = this.ExpectValue("|>")
			node.type_call = true
		} else if (this.IsValue("!")) {
			node.Tokens["!"] = this.ExpectValue("!")
			node.Tokens["call("] = this.ExpectValue("(")
			node.expressions = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0))
			node.Tokens["call)"] = this.ExpectValue(")")
			node.type_call = true
		} else {
			node.Tokens["call("] = this.ExpectValue("(")
			node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0))
			node.Tokens["call)"] = this.ExpectValue(")")
		}

		return node.End()
	}

	ReadCall() {
		if (!this.IsCallExpression(0)) return

		return this.ReadCallExpression()
	}

	ReadPostfixOperator() {
		if (!syntax.IsPostfixOperator(this.GetToken()!)) return

		let node = this.Node("expression", "postfix_operator") as PostfixOperatorExpressionNode
		node.value = this.ReadToken()!
		return node.End()
	}

	ReadPostfixIndexExpression() {
		if (!this.IsValue("[")) return

		let node = this.Node("expression", "postfix_expression_index") as PostfixIndexExpressionNode
		node.Tokens["["] = this.ExpectValue("[")
		node.index = this.ExpectExpression(0)!
		node.Tokens["]"] = this.ExpectValue("]")
		return node.End()
	}

	ReadAndAddExplictiType(node: AnyParserNode) {
		if (this.IsValue(":") && (this.IsType("letter", 1) || this.IsCallExpression(2))) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.type_expression = this.ExpectTypeExpression(0)
		} else if (this.IsValue("as")) {
			node.Tokens["as"] = this.ExpectValue("as")
			node.type_expression = this.ExpectTypeExpression(0)
		} else if (this.IsValue("is")) {
			node.Tokens["is"] = this.ExpectValue("is")
			node.type_expression = this.ExpectTypeExpression(0)
		}
	}

	ReadSubExpression(node: AnyParserNode) {
		for (let i = 0; i < this.GetLength(); i++) {
			let left_node = node

			this.ReadAndAddExplictiType(left_node)

			let found =
				this.ReadIndex() ||
				this.ReadSelfCall() ||
				this.ReadCall() ||
				this.ReadPostfixOperator() ||
				this.ReadPostfixIndexExpression()

			if (!found) break
			found.left = left_node

			if (left_node.Type == "expression" && left_node.Kind == "postfix_operator" && left_node.value && left_node.value.value) {
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
			exp.Tokens[":"] = token
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
	ReadFunctionBody(node: FunctionExpression) {
		node.Tokens["arguments("] = this.ExpectValue("(")
		node.identifiers = this.ReadMultipleValues(Infinity, () => this.ReadIdentifier())
		node.Tokens["arguments)"] = this.ExpectValue("(", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.return_types = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(Infinity))
		}

		node.statements = this.ReadNodes({ end: true })

		node.Tokens["end"] = this.ExpectValue("end")
	}
	ReadIdentifier(expect_type?: boolean) {
		if (!this.IsType("letter") && !this.IsValue("...")) return
		let node = this.Node("expression", "value") as ValueNode

		if (this.IsValue("...")) {
			node.value = this.ExpectValue("...")
		} else {
			node.value = this.ExpectType("letter")
		}

		if (this.IsValue(":") || expect_type) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.type_expression = this.ExpectTypeExpression(0)
		}

		return node.End()
	}
	ReadAnalyzerFunction() {
		if (!this.IsValue("analyzer") || !this.IsValue("function", 1)) return
		let node = this.Node("expression", "analyzer_function") as AnalyzerFunctionExpression
		node.Tokens["analyzer"] = this.ExpectValue("function")

		this.ReadAnalyzerFunctionBody(node, false)
		return node.End()
	}
	ReadFunction() {
		if (!this.IsValue("analyzer") || !this.IsValue("function", 1)) return
		let node = this.Node("expression", "function") as FunctionExpression
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadFunctionBody(node)

		return node.End()
	}

	ReadImport() {
		if (!(this.IsValue("import") || this.IsValue("(", 1))) return
		let node = this.Node("expression", "import") as ImportExpression
		node.Tokens["import"] = this.ExpectValue("import")

		node.Tokens["("] = node.Tokens["("] || []
		node.Tokens["("].push(this.ExpectValue("("))

		let start = this.GetToken()

		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0))

		let root = this.config.path && this.config.path // .path:match("(.+/)") or ""

		if (node.expressions[0] && node.expressions[0].Kind == "value") {
			node.path = root + node.expressions[0]!.value.value
		}

		/*
		local nl = require("nattlua")
		local root, err = nl.ParseFile(parser:ResolvePath(node.path), parser.root)

		if not root then
			parser:Error("error importing file: $1", start, start, err)
		end

		node.root = root.SyntaxTree
		node.analyzer = root
		node.tokens[")"] = {parser:ExpectValue(")")}
		parser.root.imports = parser.root.imports or {}
		table.insert(parser.root.imports, node)*/

		return node
	}

	ReadValue() {
		if (!syntax.IsTokenValue(this.GetToken()!)) return
		let node = this.Node("expression", "value") as ValueNode
		node.value = this.ReadToken()!
		return node.End()
	}

	ReadTableSpread() {
		if (!(this.IsValue("...") && (this.IsType("letter", 1) || this.IsValue("{", 1) || this.IsValue("(", 1)))) return
		let node = this.Node("expression", "table_spread") as TableSpreadExpressionNode
		node.Tokens["..."] = this.ExpectValue("...")
		node.expression = this.ExpectExpression(0)!
		return node.End()
	}

	ReadTableEntry(i: number) {
		if (this.IsValue("[")) {
			let node = this.Node("expression", "table_expression_value") as TableExpressionValueNode
			node.expression_key = true
			node.Tokens["["] = this.ExpectValue("[")
			node.key_expression = this.ExpectExpression(0)!
			node.Tokens["]"] = this.ExpectValue("]")
			node.Tokens["="] = this.ExpectValue("=")
			node.value_expression = this.ExpectExpression(0)!
			return node.End()
		} else if (this.IsType("letter") && this.IsValue("=", 1)) {
			let node = this.Node("expression", "table_key_value") as TableKeyValueNode
			let spread = this.ReadTableSpread()

			if (spread) {
				node.spread = spread
			} else {
				node.value_expression = this.ExpectExpression(0)!
			}

			node.Tokens["="] = this.ExpectValue("=")
			return node.End()
		}

		let node = this.Node("expression", "table_index_node") as TableIndexNode

		let spread = this.ReadTableSpread()

		if (spread) {
			node.spread = spread
		} else {
			node.value_expression = this.ExpectExpression(0)!
		}

		node.key = i

		return node.End()
	}

	ReadTable() {
		if (!this.IsValue("{")) return
		let tree = this.Node("expression", "table") as TableNode
		tree.Tokens["{"] = this.ExpectValue("{")
		tree.children = []
		tree.Tokens["separators"] = []

		for (let i = 0; i < this.GetLength(); i++) {
			if (!this.IsValue("}")) break
			let entry = this.ReadTableEntry(i)

			if (entry.Kind == "table_index_value") {
				tree.is_array = true
			} else {
				tree.is_dictionary = true
			}

			if (entry.Kind == "table_index_value" || entry.Kind == "table_key_value") {
				if (entry.spread) {
					tree.spread = true
				}
			}

			tree.children[i] = entry

			if (!this.IsValue(",") && !this.IsValue(";") && !this.IsValue("}")) {
				this.Error(
					"expected $1 got $2",
					undefined,
					undefined,
					[",", ";", "}"],
					(this.GetToken() && this.GetToken()!.value) || "no token",
				)
				break
			}

			if (!this.IsValue("}")) {
				tree.Tokens["separators"][i] = this.ReadToken()!
			}
		}

		tree.Tokens["}"] = this.ExpectValue("}")

		return tree.End()
	}

	CheckIntegerDivision(node: AnyParserNode) {
		/*
		
		if node and not node.idiv_resolved then
			for i, token in ipairs(node.whitespace) do
				if token.value:find("\n", nil, true) then break end
				if token.type == "line_comment" and token.value:sub(1, 2) == "//" then
					table_remove(node.whitespace, i)
					local tokens = require("nattlua.lexer.lexer")("/idiv" .. token.value:sub(2)):GetTokens()

					for _, token in ipairs(tokens) do
						check_integer_division_operator(parser, token)
					end

					parser:AddTokens(tokens)
					node.idiv_resolved = true

					break
				end
			end
		end
		*/
		/*if (node && !node.idiv_resolved) {
			for (let i = 0; i < node.whitespace.length; i++) {
				let token = node.whitespace[i]

				if (token.value.indexOf("\n", 0) > -1) break

				if (token.type == "line_comment" && token.value.substring(0, 2) == "//") {
					node.whitespace.splice(i, 1)

					let tokens = lexer.Lexer.Lex("/idiv" + token.value.substring(2))

					for (let token of tokens) {
						this.CheckIntegerDivisionOperator(token)
					}

					this.AddTokens(tokens)
					node.idiv_resolved = true

					break
				}

			}
		}
		*/
	}

	ReadExpression(priority: number = 0): AnyParserNode | undefined {
		if (this.GetPreferTypesystem()) {
			return this.ReadTypeExpression(priority)
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

		return node.End()
	}

	ReadNode() {
		if (this.IsType("end_of_file")) return

		return this.ReadReturn()
	}

	ReadTypeExpression(priority: number = 0): AnyParserNode | undefined {
		return undefined
	}

	ExpectTypeExpression(priority: number = 0): AnyParserNode {
		return {} as AnyParserNode
	}
}
