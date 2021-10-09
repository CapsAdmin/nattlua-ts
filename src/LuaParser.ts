import { BaseParser, ParserNode } from "./BaseParser"
import { Code } from "./Code"
import { LuaLexer, syntax } from "./LuaLexer"
import { Token } from "./Token"

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
export interface BreakStatement extends ParserNode {
	Type: "statement"
	Kind: "break"
	Tokens: ParserNode["Tokens"] & {
		["break"]: Token
	}
}
export interface ContinueStatement extends ParserNode {
	Type: "statement"
	Kind: "continue"
	Tokens: ParserNode["Tokens"] & {
		["continue"]: Token
	}
}

export interface SemicolonStatement extends ParserNode {
	Type: "statement"
	Kind: "semicolon"
	Tokens: ParserNode["Tokens"] & {
		[";"]: Token
	}
}

export interface GotoStatement extends ParserNode {
	Type: "statement"
	Kind: "goto"
	identifier: Token
	Tokens: ParserNode["Tokens"] & {
		["goto"]: Token
	}
}

export interface GotoLabelStatement extends ParserNode {
	Type: "statement"
	Kind: "goto_label"
	identifier: Token
	Tokens: ParserNode["Tokens"] & {
		["::left"]: Token
		["::right"]: Token
	}
}

export interface TableExpressionValueNode extends ParserNode {
	Type: "expression"
	Kind: "table_expression_value"

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
	identifier: Token
	value_expression: AnyParserNode
	spread?: TableSpreadExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
	}
}

export interface TableIndexValueNode extends ParserNode {
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

export interface RepeatStatement extends ParserNode {
	Type: "statement"
	Kind: "repeat"
	statements: AnyParserNode[]
	expression: AnyParserNode
	Tokens: ParserNode["Tokens"] & {
		["repeat"]: Token
		["until"]: Token
	}
}

export interface LocalFunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "local_function"
	identifier: Token
	return_type: AnyParserNode
	statements: AnyParserNode[]
	arguments: AnyParserNode[]
	Tokens: ParserNode["Tokens"] & {
		["local"]: Token
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["end"]: Token
	}
}

export type AnyParserNode =
	| ValueNode
	| TypeCodeStatement
	| ReturnStatement
	| TableExpressionValueNode
	| TableKeyValueNode
	| TableIndexValueNode
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
	| GotoStatement
	| GotoLabelStatement
	| BreakStatement
	| ContinueStatement
	| SemicolonStatement
	| RepeatStatement
	| LocalFunctionStatement

export class LuaParser extends BaseParser<AnyParserNode> {
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

			if (
				left_node.Type == "expression" &&
				left_node.Kind == "postfix_operator" &&
				left_node.value &&
				left_node.value.value
			) {
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
			node.identifier = this.ReadToken()!
			node.Tokens["="] = this.ExpectValue("=")

			let spread = this.ReadTableSpread()

			if (spread) {
				node.spread = spread
			} else {
				node.value_expression = this.ExpectExpression(0)!
			}

			return node.End()
		}

		let node = this.Node("expression", "table_index_value") as TableIndexValueNode

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
			if (this.IsValue("}")) break

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

	CheckIntegerDivision(token: Token) {
		if (!token.idiv_resolved && token.whitespace) {
			for (let i = 0; i < token.whitespace.length; i++) {
				let whitespace = token.whitespace[i]!

				if (whitespace.value.indexOf("\n", 0) > -1) break

				if (whitespace.type == "line_comment" && whitespace.value.substring(0, 2) == "//") {
					token.whitespace.splice(i, 1)

					let tokens = new LuaLexer(new Code("/idiv" + whitespace.value.substring(1))).GetTokens()

					for (let token of tokens) {
						this.CheckIntegerDivision(token)
					}

					this.AddTokens(tokens)
					token.idiv_resolved = true

					break
				}
			}
		}
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

		this.CheckIntegerDivision(this.GetToken()!)

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

	ReadTypeExpression(priority: number = 0): AnyParserNode | undefined {
		return undefined
	}

	ExpectTypeExpression(priority: number = 0): AnyParserNode {
		return {} as AnyParserNode
	}

	ReadBreak() {
		if (!this.IsValue("break")) return undefined

		let node = this.Node("statement", "break") as BreakStatement
		node.Tokens["break"] = this.ExpectValue("break")
		return node.End()
	}

	ReadContinue() {
		if (!this.IsValue("continue")) return undefined

		let node = this.Node("statement", "continue") as ContinueStatement
		node.Tokens["continue"] = this.ExpectValue("continue")
		return node.End()
	}
	ReadSemicolon() {
		if (!this.IsValue(";")) return undefined

		let node = this.Node("statement", "semicolon") as SemicolonStatement
		node.Tokens[";"] = this.ExpectValue(";")
		return node.End()
	}
	ReadGoto() {
		if (!this.IsValue("goto") || !this.IsType("letter", 1)) return undefined

		let node = this.Node("statement", "goto") as GotoStatement

		node.Tokens["goto"] = this.ExpectValue("goto")
		node.identifier = this.ExpectType("letter")

		return node.End()
	}

	ReadGotoLabel() {
		if (!this.IsValue("::")) return undefined

		let node = this.Node("statement", "goto_label") as GotoLabelStatement

		node.Tokens["::left"] = this.ExpectValue("::")
		node.identifier = this.ExpectType("letter")
		node.Tokens["::right"] = this.ExpectValue("::")

		return node.End()
	}

	ReadRepeat() {
		if (!this.IsValue("repeat")) return undefined

		let node = this.Node("statement", "repeat") as RepeatStatement
		node.Tokens["repeat"] = this.ExpectValue("repeat")
		node.statements = this.ReadNodes({ until: true })
		node.Tokens["until"] = this.ExpectValue("until")
		node.expression = this.ExpectExpression()!
		return node.End()
	}

	ReadLocalFunction() {
		if (!this.IsValue("function")) return undefined

		let node = this.Node("statement", "local_function") as LocalFunctionStatement
		node.Tokens["function"] = this.ExpectValue("function")
		node.identifier = this.ExpectType("letter")
		node.arguments = this.ReadFunctionArguments()
		node.statements = this.ReadNodes({ end: true })
		return node.End()
	}

	override ReadNode() {
		if (this.IsType("end_of_file")) return

		return (
			this.ReadDebugCode() ||
			this.ReadReturn() ||
			this.ReadBreak() ||
			this.ReadContinue() ||
			this.ReadSemicolon() ||
			this.ReadGoto() ||
			this.ReadGotoLabel() ||
			this.ReadRepeat() ||
			this.ReadAnalyzerFunction() ||
			this.ReadFunction() ||
			this.ReadLocalTypeFunction() ||
			this.ReadLocalFunction() ||
			this.ReadLocalAnalyzerFunction() ||
			this.ReadLocalTypeAssignment() ||
			this.ReadLocalDestructureAssignment() ||
			this.ReadLocalAssignment() ||
			this.ReadTypeAssignment() ||
			this.ReadDo() ||
			this.ReadIf() ||
			this.ReadWhile() ||
			this.ReadNumericFor() ||
			this.ReadGenericFor() ||
			this.ReadDestructureAssignment() ||
			this.ReadCallOrAssignment()
		)
	}
}
