import { BaseParser, ParserNode } from "./BaseParser"
import { Code } from "./Code"
import { LuaLexer, syntax } from "./LuaLexer"
import { Token } from "./Token"

type TableExpressionNodes = TableExpressionValueExpression | TableKeyValueExpression | TableIndexValueExpression
type FunctionNode =
	| AnalyzerFunctionStatement
	| AnalyzerFunctionExpression
	| FunctionExpression
	| LocalFunctionStatement
	| FunctionStatement
	| LocalAnalyzerFunctionStatement

export type SubExpressionNode =
	| BinaryOperatorExpression
	| PostfixCallExpression
	| PostfixOperatorExpression
	| PostfixIndexExpression
export type ExpressionNode =
	| ValueExpression
	| FunctionExpression
	| ImportExpression
	| PrefixOperatorExpression
	| TableExpression
	| TableSpreadExpression
	| TableExpressionNodes
	| SubExpressionNode
	| AnalyzerFunctionExpression

export type StatementNode =
	| ReturnStatement
	| TypeCodeStatement
	| ParserCodeStatement
	| GotoStatement
	| GotoLabelStatement
	| BreakStatement
	| ContinueStatement
	| SemicolonStatement
	| RepeatStatement
	| LocalFunctionStatement
	| FunctionStatement
	| AnalyzerFunctionStatement
	| LocalAnalyzerFunctionStatement
	| DoStatement
	| IfStatement
	| WhileStatement
	| NumericForStatement
	| GenericForStatement
	| LocalAssignmentStatement
	| DestructureAssignmentStatement
	| LocalDestructureAssignmentStatement
	| AssignmentStatement
	| CallExpressionStatement

export type AnyParserNode = ExpressionNode | StatementNode

export interface ValueExpression extends ParserNode {
	Type: "expression"
	Kind: "value"
	value: Token
}
export interface TableExpression extends ParserNode {
	Type: "expression"
	Kind: "table"
	children: TableExpressionNodes[]
	spread: boolean
	is_array: boolean
	is_dictionary: boolean
	Tokens: ParserNode["Tokens"] & {
		["{"]: Token
		["}"]: Token
		["separators"]: Token[]
	}
}

export interface PostfixCallExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_call"
	expressions: ExpressionNode[]
	type_call: boolean
	left: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["call("]: Token
		["call)"]: Token
		["!"]: Token
		[","]: Token[]
	}
}

export interface TableSpreadExpression extends ParserNode {
	Type: "expression"
	Kind: "table_spread"
	expression: ExpressionNode

	Tokens: ParserNode["Tokens"] & {
		["..."]: Token
	}
}

export interface PostfixOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_operator"
	operator: Token
	left: ExpressionNode
}

export interface PostfixIndexExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_expression_index"
	index: ExpressionNode
	left: ExpressionNode

	Tokens: ParserNode["Tokens"] & {
		["["]: Token
		["]"]: Token
	}
}

export interface TypeCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "type_code"
	value: ValueExpression
	lua_code: ValueExpression
}

export interface ReturnStatement extends ParserNode {
	Type: "statement"
	Kind: "return"
	expressions: ExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["return"]: Token
		[","]: Token[]
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

export interface TableExpressionValueExpression extends ParserNode {
	Type: "expression"
	Kind: "table_expression_value"
	expression_key: boolean
	key_expression: ExpressionNode
	value_expression: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
		["["]: Token
		["]"]: Token
	}
}

export interface TableKeyValueExpression extends ParserNode {
	Type: "expression"
	Kind: "table_key_value"
	identifier: Token
	value_expression: ExpressionNode
	spread?: TableSpreadExpression
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
	}
}

export interface TableIndexValueExpression extends ParserNode {
	Type: "expression"
	Kind: "table_index_value"
	value_expression: ExpressionNode
	spread?: TableSpreadExpression
	key: number
}

export interface ParserCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "parser_code"
	value: ValueExpression
	lua_code: ValueExpression
}

export interface AnalyzerFunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "analyzer_function"
	value: ValueExpression
	arguments: ExpressionNode[]
	return_types: ExpressionNode[]
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["analyzer"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}
export interface AnalyzerFunctionExpression extends ParserNode {
	Type: "expression"
	Kind: "analyzer_function"
	value: ValueExpression
	arguments: ExpressionNode[]
	return_types: ExpressionNode[]
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["analyzer"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}
export interface FunctionExpression extends ParserNode {
	Type: "expression"
	Kind: "function"
	value: ValueExpression
	arguments: ExpressionNode[]
	return_types: ExpressionNode[]
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}
export interface LocalFunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "local_function"
	identifier: Token
	return_types: ExpressionNode[]
	statements: StatementNode[]
	arguments: ExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["local"]: Token
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}
export interface FunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "function"
	identifier: Token
	return_types: ExpressionNode[]
	statements: StatementNode[]
	arguments: ExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}
export interface LocalAnalyzerFunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "local_analyzer_function"
	identifier: Token
	return_types: ExpressionNode[]
	statements: StatementNode[]
	arguments: ExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["local"]: Token
		["analyzer"]: Token
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}

export interface ImportExpression extends ParserNode {
	Type: "expression"
	Kind: "import"
	path: string
	expressions: ExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["import"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		[","]: Token[]
		["end"]: Token
	}
}

export interface BinaryOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "binary_operator"
	operator: Token
	left: ExpressionNode
	right: ExpressionNode
}

export interface PrefixOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "prefix_operator"
	operator: Token
	right: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["operator"]: Token
	}
}

export interface RepeatStatement extends ParserNode {
	Type: "statement"
	Kind: "repeat"
	statements: StatementNode[]
	expression: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["repeat"]: Token
		["until"]: Token
	}
}

export interface DoStatement extends ParserNode {
	Type: "statement"
	Kind: "do"
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["do"]: Token
		["end"]: Token
	}
}

export interface IfStatement extends ParserNode {
	Type: "statement"
	Kind: "if"
	expressions: ExpressionNode[]
	statements: StatementNode[][]
	Tokens: ParserNode["Tokens"] & {
		["if/else/elseif"]: Token[]
		["then"]: Token[]
		["end"]: Token
	}
}

export interface WhileStatement extends ParserNode {
	Type: "statement"
	Kind: "while"
	expression: ExpressionNode
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["while"]: Token
		["do"]: Token
		["end"]: Token
	}
}

export interface NumericForStatement extends ParserNode {
	Type: "statement"
	Kind: "numeric_for"
	identifier: Token
	init_expression: ExpressionNode
	max_expression: ExpressionNode
	step_expression?: ExpressionNode
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["for"]: Token
		["="]: Token
		["do"]: Token
		["end"]: Token
		[",2"]: Token[]
	}
}

export interface GenericForStatement extends ParserNode {
	Type: "statement"
	Kind: "generic_for"
	identifiers: ExpressionNode[]
	expressions: ExpressionNode[]
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["for"]: Token
		["="]: Token
		["in"]: Token
		["do"]: Token
		["end"]: Token
		["left,"]: Token[]
		["right,"]: Token[]
	}
}

export interface LocalAssignmentStatement extends ParserNode {
	Type: "statement"
	Kind: "local_assignment"
	identifiers: ExpressionNode[]
	expressions: ExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["local"]: Token
		["left,"]: Token[]
		["="]: Token
		["right,"]: Token[]
	}
}

export interface DestructureAssignmentStatement extends ParserNode {
	Type: "statement"
	Kind: "destructure_assignment"
	default: ExpressionNode
	default_comma: Token
	left: ExpressionNode[]
	right: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["{"]: Token
		[","]: Token[]
		["}"]: Token
		["="]: Token
	}
}
export interface LocalDestructureAssignmentStatement extends ParserNode {
	Type: "statement"
	Kind: "local_destructure_assignment"
	default: ExpressionNode
	default_comma: Token
	left: ExpressionNode[]
	right: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["local"]: Token
		["{"]: Token
		[","]: Token[]
		["}"]: Token
		["="]: Token
	}
}

export interface AssignmentStatement extends ParserNode {
	Type: "statement"
	Kind: "assignment"
	left: ExpressionNode[]
	right: ExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
		["left,"]: Token[]
		["right,"]: Token[]
	}
}

export interface CallExpressionStatement extends ParserNode {
	Type: "statement"
	Kind: "call_expression"
	expression: ExpressionNode
}

export class LuaParser extends BaseParser<AnyParserNode> {
	ReadTypeCodeStatement() {
		if (!this.IsType("type_code")) return undefined

		let node = this.Node("statement", "type_code")
		let code = this.Node("expression", "value")
		code.value = this.ExpectType("type_code")
		code.End()
		node.lua_code = code

		return node.End()
	}
	ReadParserCodeStatement() {
		if (!this.IsType("parser_code")) return undefined

		let token = this.ExpectType("parser_code")
		let node = this.Node("statement", "parser_code")
		let code = this.Node("expression", "value")
		code.value = token
		node.lua_code = code.End()

		return node.End()
	}

	private ReadMultipleValues<_, T extends () => AnyParserNode | undefined>(
		max: number | undefined,
		reader: T,
		comma_tokens: Token[],
	) {
		let out = []

		for (let i = 0; i < (max || this.GetLength()); i++) {
			let node = reader()
			if (!node) break
			out.push(node)

			if (!this.IsValue(",")) break

			if (comma_tokens) {
				comma_tokens.push(this.ExpectValue(","))
			}
		}

		return out as NonNullable<ReturnType<T>>[]
	}
	private ReadParenthesisExpression() {
		if (!this.IsValue("(")) return

		let left_parentheses = this.ExpectValue("(")
		let node = this.ReadExpression(0)

		if (!node) {
			this.Error("empty parentheses group", left_parentheses)
			return
		}

		node.Tokens["("] = node.Tokens["("] || []
		node.Tokens["("].unshift(left_parentheses)

		node.Tokens[")"] = node.Tokens[")"] || []
		node.Tokens[")"].push(this.ExpectValue(")"))

		return node
	}

	private ReadIndexSubExpression() {
		if (!(this.IsValue(".") && this.IsType("letter", 1))) return
		let node = this.Node("expression", "binary_operator")
		node.operator = this.ReadToken()!

		node.right = this.Node("expression", "value")
		node.right.value = this.ExpectType("letter")

		node.End()
		return node
	}

	ReadSelfCallSubExpression() {
		if (!(this.IsValue(":") && this.IsType("letter", 1) && this.IsCallExpression(2))) return

		let node = this.Node("expression", "binary_operator")
		node.operator = this.ReadToken()!

		node.right = this.Node("expression", "value")
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
	ReadCallSubExpression() {
		if (!this.IsCallExpression(0)) return

		let node = this.Node("expression", "postfix_call")
		node.Tokens[","] = []

		if (this.IsValue("{")) {
			node.expressions = [this.ReadTableExpression()!]
		} else if (this.IsType("string")) {
			let value = this.Node("expression", "value")
			value.value = this.ReadToken()!
			value.End()

			node.expressions = [value]
		} else if (this.IsValue("<|")) {
			node.Tokens["call("] = this.ExpectValue("<|")
			node.expressions = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0), node.Tokens[","])
			node.Tokens["call)"] = this.ExpectValue("|>")
			node.type_call = true
		} else if (this.IsValue("!")) {
			node.Tokens["!"] = this.ExpectValue("!")
			node.Tokens["call("] = this.ExpectValue("(")
			node.expressions = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0), node.Tokens[","])
			node.Tokens["call)"] = this.ExpectValue(")")
			node.type_call = true
		} else {
			node.Tokens["call("] = this.ExpectValue("(")
			node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens[","])
			node.Tokens["call)"] = this.ExpectValue(")")
		}

		return node.End()
	}
	ReadPostfixOperatorSubExpression() {
		if (!syntax.IsPostfixOperator(this.GetToken()!)) return

		let node = this.Node("expression", "postfix_operator")
		node.operator = this.ReadToken()!
		return node.End()
	}

	ReadPostfixIndexSubExpression() {
		if (!this.IsValue("[")) return

		let node = this.Node("expression", "postfix_expression_index")
		node.Tokens["["] = this.ExpectValue("[")
		node.index = this.ExpectExpression(0)!
		node.Tokens["]"] = this.ExpectValue("]")
		return node.End()
	}

	ReadAndAddExplicitType(node: AnyParserNode) {
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

	ReadSubExpression(node: ExpressionNode) {
		for (let i = 0; i < this.GetLength(); i++) {
			let left_node = node

			this.ReadAndAddExplicitType(left_node)

			let found =
				this.ReadIndexSubExpression() ||
				this.ReadSelfCallSubExpression() ||
				this.ReadCallSubExpression() ||
				this.ReadPostfixOperatorSubExpression() ||
				this.ReadPostfixIndexSubExpression()

			if (!found) break
			found.left = left_node

			node = found
		}

		return node
	}

	ReadPrefixOperatorExpression() {
		if (!syntax.IsPrefixOperator(this.GetToken()!)) return

		let node = this.Node("expression", "prefix_operator")
		node.operator = this.ReadToken()!
		node.Tokens["operator"] = node.operator
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
	ReadAnalyzerFunctionBody(node: FunctionNode, type_args: boolean) {
		node.Tokens["arguments,"] = []
		node.Tokens["arguments("] = this.ExpectValue("(")
		node.arguments = this.ReadMultipleValues(
			Infinity,
			() => this.ReadTypeFunctionArguments(type_args),
			node.Tokens["arguments,"],
		)
		if (this.IsValue("...")) {
			let var_arg = this.Node("expression", "value")
			var_arg.value = this.ExpectValue("...")

			if (this.IsValue(":") || type_args) {
				var_arg.Tokens[":"] = this.ExpectValue(":")
				var_arg.type_expression = this.ExpectTypeExpression()
			} else {
				if (this.IsType("letter")) {
					var_arg.type_expression = this.ExpectTypeExpression()
				}
			}

			var_arg.End()

			node.arguments.push(var_arg)
		}

		node.Tokens["arguments)"] = this.ExpectValue(")", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.return_types = this.ReadMultipleValues(
				Infinity,
				() => this.ReadTypeExpression(),
				node.Tokens["return_types,"],
			)
		} else if (!this.IsValue(",")) {
			let start = this.GetToken()
			node.statements = this.ReadStatements({ end: true })
			node.Tokens["end"] = this.ExpectValue("end", start, start)
		}
	}
	ReadFunctionBody(node: FunctionNode) {
		node.Tokens["arguments,"] = []
		node.Tokens["arguments("] = this.ExpectValue("(")
		node.arguments = this.ReadMultipleValues(Infinity, () => this.ReadIdentifier(), node.Tokens["arguments,"])
		node.Tokens["arguments)"] = this.ExpectValue(")", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.return_types = this.ReadMultipleValues(
				undefined,
				() => this.ReadTypeExpression(Infinity),
				node.Tokens["return_types,"],
			)
		}

		node.statements = this.ReadStatements({ end: true })

		node.Tokens["end"] = this.ExpectValue("end")
	}
	ReadIdentifier(expect_type?: boolean) {
		if (!this.IsType("letter") && !this.IsValue("...")) return
		let node = this.Node("expression", "value")

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

	ReadAnalyzerFunctionStatement() {
		if (!(this.IsValue("analyzer") && this.IsValue("function", 1))) return
		let node = this.Node("statement", "analyzer_function")
		node.Tokens["analyzer"] = this.ExpectValue("function")

		this.ReadAnalyzerFunctionBody(node, false)
		return node.End()
	}

	ReadAnalyzerFunctionExpression() {
		if (!(this.IsValue("analyzer") && this.IsValue("function", 1))) return
		let node = this.Node("expression", "analyzer_function")
		node.Tokens["analyzer"] = this.ExpectValue("function")

		this.ReadAnalyzerFunctionBody(node, false)
		return node.End()
	}

	ReadFunctionExpression() {
		if (!this.IsValue("function", 1)) return
		let node = this.Node("expression", "function")
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadFunctionBody(node)

		return node.End()
	}

	ReadLocalFunctionStatement() {
		if (!(this.IsValue("local") && this.IsValue("function", 1))) return undefined

		let node = this.Node("statement", "local_function")
		node.Tokens["function"] = this.ExpectValue("function")
		node.identifier = this.ReadToken()!
		this.ReadFunctionBody(node)
		return node.End()
	}

	ReadFunctionStatement() {
		if (!this.IsValue("function")) return undefined

		let node = this.Node("statement", "function")
		node.Tokens["function"] = this.ExpectValue("function")
		node.identifier = this.ReadToken()! // todo: read function index expression
		this.ReadFunctionBody(node)
		return node.End()
	}

	ReadLocalAnalyzerFunctionStatement() {
		if (!(this.IsValue("local") && this.IsValue("analyzer", 1) && this.IsValue("function", 2))) return undefined

		let node = this.Node("statement", "local_analyzer_function")
		node.Tokens["analyzer"] = this.ExpectValue("analyzer")
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadFunctionBody(node)

		return node.End()
	}

	ReadImportExpression() {
		if (!(this.IsValue("import") && !this.IsValue("(", 1))) return
		let node = this.Node("expression", "import")
		node.Tokens["import"] = this.ExpectValue("import")

		node.Tokens["("] = node.Tokens["("] || []
		node.Tokens["("].push(this.ExpectValue("("))

		let start = this.GetToken()

		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens[","])

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

	ReadValueExpression() {
		if (!syntax.IsTokenValue(this.GetToken()!)) return
		let node = this.Node("expression", "value")
		node.value = this.ReadToken()!
		return node.End()
	}

	ReadTableSpread() {
		if (!(this.IsValue("...") && (this.IsType("letter", 1) || this.IsValue("{", 1) || this.IsValue("(", 1)))) return
		let node = this.Node("expression", "table_spread")
		node.Tokens["..."] = this.ExpectValue("...")
		node.expression = this.ExpectExpression(0)!
		return node.End()
	}

	ReadTableEntry(i: number) {
		if (this.IsValue("[")) {
			let node = this.Node("expression", "table_expression_value")
			node.expression_key = true
			node.Tokens["["] = this.ExpectValue("[")
			node.key_expression = this.ExpectExpression(0)!
			node.Tokens["]"] = this.ExpectValue("]")
			node.Tokens["="] = this.ExpectValue("=")
			node.value_expression = this.ExpectExpression(0)!
			return node.End()
		} else if (this.IsType("letter") && this.IsValue("=", 1)) {
			let node = this.Node("expression", "table_key_value")
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

		let node = this.Node("expression", "table_index_value")

		let spread = this.ReadTableSpread()

		if (spread) {
			node.spread = spread
		} else {
			node.value_expression = this.ExpectExpression(0)!
		}

		node.key = i

		return node.End()
	}

	ReadTableExpression() {
		if (!this.IsValue("{")) return
		let tree = this.Node("expression", "table")
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
		if (!token.integer_division_resolved && token.whitespace) {
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
					token.integer_division_resolved = true

					break
				}
			}
		}
	}

	ReadExpression(priority: number = 0): ExpressionNode | undefined {
		if (this.GetPreferTypesystem()) {
			return this.ReadTypeExpression(priority)
		}

		let node =
			this.ReadParenthesisExpression() ||
			this.ReadPrefixOperatorExpression() ||
			this.ReadAnalyzerFunctionExpression() ||
			this.ReadFunctionExpression() ||
			this.ReadImportExpression() ||
			this.ReadValueExpression() ||
			this.ReadTableExpression()

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
			node = this.Node("expression", "binary_operator")
			node.operator = this.ReadToken()!
			node.left = left_node!

			if (node.left) {
				node.left.Parent = node
			}

			node.right = this.ExpectExpression(syntax.GetBinaryOperatorInfo(node.operator)!.right_priority)!

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

	ReadReturnStatement() {
		if (!this.IsValue("return")) return undefined

		let node = this.Node("statement", "return")
		node.Tokens[","] = []
		node.Tokens["return"] = this.ExpectValue("return")
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens[","]) // TODO: avoid creating closure

		return node.End()
	}

	ReadTypeExpression(priority: number = 0): ExpressionNode | undefined {
		return undefined
	}

	ExpectTypeExpression(priority: number = 0): ExpressionNode {
		return {} as ExpressionNode
	}

	ReadBreakStatement() {
		if (!this.IsValue("break")) return undefined

		let node = this.Node("statement", "break")
		node.Tokens["break"] = this.ExpectValue("break")
		return node.End()
	}

	ReadContinueStatement() {
		if (!this.IsValue("continue")) return undefined

		let node = this.Node("statement", "continue")
		node.Tokens["continue"] = this.ExpectValue("continue")
		return node.End()
	}
	ReadSemicolonStatement() {
		if (!this.IsValue(";")) return undefined

		let node = this.Node("statement", "semicolon")
		node.Tokens[";"] = this.ExpectValue(";")
		return node.End()
	}
	ReadGotoStatement() {
		if (!this.IsValue("goto") || !this.IsType("letter", 1)) return undefined

		let node = this.Node("statement", "goto")

		node.Tokens["goto"] = this.ExpectValue("goto")
		node.identifier = this.ExpectType("letter")

		return node.End()
	}

	ReadGotoLabelStatement() {
		if (!this.IsValue("::")) return undefined

		let node = this.Node("statement", "goto_label")

		node.Tokens["::left"] = this.ExpectValue("::")
		node.identifier = this.ExpectType("letter")
		node.Tokens["::right"] = this.ExpectValue("::")

		return node.End()
	}

	ReadRepeatStatement() {
		if (!this.IsValue("repeat")) return undefined

		let node = this.Node("statement", "repeat")
		node.Tokens["repeat"] = this.ExpectValue("repeat")
		node.statements = this.ReadStatements({ until: true })
		node.Tokens["until"] = this.ExpectValue("until")
		node.expression = this.ExpectExpression()!
		return node.End()
	}

	ReadLocalAssignmentStatement() {
		if (!this.IsValue("local") || !this.IsType("letter", 1)) return undefined

		let node = this.Node("statement", "local_assignment")
		node.Tokens["left,"] = []
		node.Tokens["right,"] = []

		node.Tokens["local"] = this.ExpectValue("local")

		node.identifiers = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens["left,"])

		if (this.IsValue("=")) {
			node.Tokens["="] = this.ExpectValue("=")
		}
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens["right,"])

		return node.End()
	}
	ReadDoStatement() {
		if (!this.IsValue("do")) return undefined

		let node = this.Node("statement", "do")
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return node.End()
	}
	ReadIfStatement() {
		if (!this.IsValue("if")) return undefined

		let node = this.Node("statement", "if")
		node.Tokens["if/else/elseif"] = []
		node.Tokens["then"] = []
		node.expressions = []
		node.statements = []

		for (let i = 0; i < this.GetLength(); i++) {
			let token
			if (i == 0) {
				token = this.ExpectValue("if")
			} else {
				if (this.IsValue("else")) {
					token = this.ExpectValue("else")
				} else if (this.IsValue("elseif")) {
					token = this.ExpectValue("elseif")
				} else if (this.IsValue("end")) {
					token = this.ExpectValue("end")
				}
			}

			if (!token) return

			node.Tokens["if/else/elseif"][i] = token

			if (token.value != "else") {
				node.expressions[i] = this.ExpectExpression(0)!
				node.Tokens["then"][i] = this.ExpectValue("then")
			}

			node.statements[i] = this.ReadStatements({
				end: true,
				else: true,
				elseif: true,
			})

			if (this.IsValue("end")) break
		}

		node.Tokens["end"] = this.ExpectValue("end")

		return node.End()
	}

	ReadWhileStatement() {
		if (!this.IsValue("while")) return undefined

		let node = this.Node("statement", "while")
		node.Tokens["while"] = this.ExpectValue("while")
		node.expression = this.ExpectExpression(0)!
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return node.End()
	}

	ReadNumericForStatement() {
		if (!this.IsValue("for")) return undefined

		let node = this.Node("statement", "numeric_for")
		node.Tokens[",2"] = []

		node.Tokens["for"] = this.ExpectValue("for")
		node.identifier = this.ExpectType("letter")
		node.Tokens["="] = this.ExpectValue("=")
		node.init_expression = this.ExpectExpression(0)!

		node.Tokens[",2"][0] = this.ExpectValue(",")!
		node.max_expression = this.ExpectExpression(0)!

		if (this.IsValue(",")) {
			node.Tokens[",2"][1] = this.ExpectValue(",")
			node.step_expression = this.ExpectExpression(0)!
		}

		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return node.End()
	}
	ReadGenericForStatement() {
		if (!this.IsValue("for")) return undefined

		let node = this.Node("statement", "generic_for")
		node.Tokens["left,"] = []
		node.Tokens["right,"] = []

		node.Tokens["for"] = this.ExpectValue("for")
		node.identifiers = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens["left,"])
		node.Tokens["in"] = this.ExpectValue("in")
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(), node.Tokens["right,"])
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return node.End()
	}

	ReadDestructureAssignmentStatement() {
		if (
			!(
				(this.IsValue("{") && this.IsType("letter", 1)) ||
				(this.IsType("letter") && this.IsValue(",", 1) && this.IsValue("{", 2))
			)
		) {
			return undefined
		}

		let node = this.Node("statement", "destructure_assignment")
		node.Tokens[","] = []

		if (this.IsType("letter")) {
			let val = this.Node("expression", "value")
			val.value = this.ReadToken()!
			node.default = val.End()
			node.default_comma = this.ExpectValue(",")
		}

		node.Tokens["{"] = this.ExpectValue("{")
		node.left = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens[","])
		node.Tokens["}"] = this.ExpectValue("}")
		node.Tokens["="] = this.ExpectValue("=")
		node.right = this.ReadExpression(0)!

		return node.End()
	}
	ReadLocalDestructureAssignmentStatement() {
		if (
			!(
				this.IsValue("local") &&
				((this.IsValue("{", 1) && this.IsType("letter", 2)) ||
					(this.IsType("letter", 1) && this.IsValue(",", 2) && this.IsValue("{", 3)))
			)
		) {
			return undefined
		}

		let node = this.Node("statement", "local_destructure_assignment")
		node.Tokens[","] = []
		node.Tokens["local"] = this.ExpectValue("local")

		if (this.IsType("letter")) {
			let val = this.Node("expression", "value")
			val.value = this.ReadToken()!
			node.default = val.End()
			node.default_comma = this.ExpectValue(",")
		}

		node.Tokens["{"] = this.ExpectValue("{")
		node.left = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens[","])
		node.Tokens["}"] = this.ExpectValue("}")
		node.Tokens["="] = this.ExpectValue("=")
		node.right = this.ReadExpression(0)!

		return node.End()
	}
	ReadCallOrAssignmentStatement() {
		let start = this.GetToken()
		let left_commas: Token[] = []
		let left = this.ReadMultipleValues(Infinity, () => this.ReadExpression(0), left_commas)

		if (this.IsValue("=")) {
			let node = this.Node("statement", "assignment")
			node.Tokens["="] = this.ExpectValue("=")
			node.left = left
			node.Tokens["right,"] = []
			node.right = this.ReadMultipleValues(Infinity, () => this.ReadExpression(0), node.Tokens["right,"])
			node.Tokens["left,"] = left_commas
			return node.End()
		}

		if (left[0] && (left[0].Kind == "postfix_call" || left[0].Kind == "import") && !left[1]) {
			let node = this.Node("statement", "call_expression")
			node.expression = left[0]
			return node.End()
		}

		this.Error(
			"expected assignment or call expression got $1 ($2)",
			start,
			this.GetToken(),
			this.GetToken()!.type,
			this.GetToken()!.value,
		)

		return undefined
	}
	ReadIdentifierList() {
		let out = []
		while (true) {
			let node = this.ReadIdentifier()
			if (!node) break
			out.push(node)
			if (!this.IsValue(",")) break
			this.ExpectValue(",")
		}
		return out
	}

	ReadLocalTypeFunctionStatement() {}

	ReadTypeAssignmentStatement() {}

	ReadLocalTypeAssignmentStatement() {}

	override ReadStatement() {
		if (this.IsType("end_of_file")) return

		return (
			this.ReadTypeCodeStatement() ||
			this.ReadParserCodeStatement() ||
			this.ReadReturnStatement() ||
			this.ReadBreakStatement() ||
			this.ReadContinueStatement() ||
			this.ReadSemicolonStatement() ||
			this.ReadGotoStatement() ||
			this.ReadGotoLabelStatement() ||
			this.ReadRepeatStatement() ||
			this.ReadAnalyzerFunctionStatement() ||
			this.ReadLocalTypeFunctionStatement() ||
			this.ReadFunctionStatement() ||
			this.ReadLocalFunctionStatement() ||
			this.ReadLocalAnalyzerFunctionStatement() ||
			this.ReadLocalTypeAssignmentStatement() ||
			this.ReadLocalDestructureAssignmentStatement() ||
			this.ReadLocalAssignmentStatement() ||
			this.ReadTypeAssignmentStatement() ||
			this.ReadDoStatement() ||
			this.ReadIfStatement() ||
			this.ReadWhileStatement() ||
			this.ReadNumericForStatement() ||
			this.ReadGenericForStatement() ||
			this.ReadDestructureAssignmentStatement() ||
			this.ReadCallOrAssignmentStatement()
		)
	}
}
