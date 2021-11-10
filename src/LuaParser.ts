import { BaseParser, ParserNode } from "./BaseParser"
import { BaseSyntax } from "./BaseSyntax"
import { Code } from "./Code"
import { LuaLexer, syntax, syntax_typesystem } from "./LuaLexer"
import { Token } from "./Token"

export type FunctionStatementNode =
	| FunctionAnalyzerStatement
	| FunctionLocalStatement
	| FunctionStatement
	| FunctionLocalAnalyzerStatement
	| FunctionLocalTypeStatement
	| FunctionTypeStatement
type FunctionNode = FunctionAnalyzerExpression | FunctionExpression | FunctionStatementNode | FunctionTypeExpression

type TableSubExpression =
	| TableExpressionKeyValueSubExpression
	| TableKeyValueSubExpression
	| TableIndexValueSubExpression

export type PrimaryExpressionNode =
	| BinaryOperatorExpression
	| ValueExpression
	| FunctionExpression
	| FunctionTypeExpression
	| FunctionAnalyzerExpression
	| FunctionSignatureTypeExpression
	| ImportExpression
	| PrefixOperatorExpression
	| TableExpression
	| EmptyUnionTypeExpression
	| VarargTypeExpression

	// this is needed for ReadCallOrAssignmentStatement
	| PostfixCallSubExpression

export type SubExpressionNode =
	| PostfixCallSubExpression
	| PostfixOperatorSubExpression
	| PostfixIndexSubExpression
	| FunctionArgumentSubExpression
	| FunctionReturnTypeSubExpression
	| TableSpreadSubExpression
	| TableSubExpression

export type StatementNode =
	| ReturnStatement
	| DebugAnalyzerCodeStatement
	| DebugParserCodeStatement
	| GotoStatement
	| GotoLabelStatement
	| BreakStatement
	| ContinueStatement
	| SemicolonStatement
	| RepeatStatement
	| FunctionStatementNode
	| DoStatement
	| IfStatement
	| WhileStatement
	| ForNumericStatement
	| ForGenericStatement
	| AssignmentLocalStatement
	| AssignmentStatement
	| AssignmentTypeStatement
	| AssignmentDestructureStatement
	| AssignmentLocalDestructureStatement
	| AssignmentLocalTypeStatement
	| CallExpressionStatement
	| EndOfFileStatement

export type AnyExpressionNode = PrimaryExpressionNode | SubExpressionNode
export type AnyParserNode = AnyExpressionNode | StatementNode
export interface EmptyUnionTypeExpression extends ParserNode {
	Type: "expression"
	Kind: "empty_union"

	Tokens: ParserNode["Tokens"] & {
		["|"]: Token
	}
}

export interface VarargTypeExpression extends ParserNode {
	Type: "expression"
	Kind: "type_vararg"
	expression: PrimaryExpressionNode

	Tokens: ParserNode["Tokens"] & {
		["..."]: Token
	}
}

export interface ValueExpression extends ParserNode {
	Type: "expression"
	Kind: "value"
	value: Token

	self_call: boolean
}

// function( foo: Bar )
export interface FunctionArgumentSubExpression extends ParserNode {
	Type: "expression"
	Kind: "function_argument"
	identifier?: Token
	type_expression: PrimaryExpressionNode
	Tokens: ParserNode["Tokens"] & {
		[":"]?: Token
	}
}

export interface FunctionReturnTypeSubExpression extends ParserNode {
	Type: "expression"
	Kind: "function_return_type"
	identifier?: Token
	type_expression: PrimaryExpressionNode
	Tokens: ParserNode["Tokens"] & {
		[":"]?: Token
	}
}

// { [key] = value }
export interface TableExpressionKeyValueSubExpression extends ParserNode {
	Type: "expression"
	Kind: "table_expression_value"
	expression_key: boolean
	key_expression: PrimaryExpressionNode
	value_expression: PrimaryExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
		["["]: Token
		["]"]: Token
	}
}

// { key = value }
export interface TableKeyValueSubExpression extends ParserNode {
	Type: "expression"
	Kind: "table_key_value"
	identifier: Token
	value_expression: PrimaryExpressionNode
	spread?: TableSpreadSubExpression
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
	}
}

// { value }
export interface TableIndexValueSubExpression extends ParserNode {
	Type: "expression"
	Kind: "table_index_value"
	value_expression: PrimaryExpressionNode
	spread?: TableSpreadSubExpression
	key: number
}

// { [key] = value, key = value, value }
export interface TableExpression extends ParserNode {
	Type: "expression"
	Kind: "table"
	children: TableSubExpression[]
	spread: boolean
	is_array: boolean
	is_dictionary: boolean
	Tokens: ParserNode["Tokens"] & {
		["{"]: Token
		["}"]: Token
		["separators"]: Token[]
	}
}

// foo(a,b,c)
export interface PostfixCallSubExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_call"
	arguments: PrimaryExpressionNode[]
	is_type_call: boolean
	left: PrimaryExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["arguments("]?: Token
		[","]: Token[]
		["arguments)"]?: Token
		// type call
		["!"]: Token
	}
}

export interface TableSpreadSubExpression extends ParserNode {
	Type: "expression"
	Kind: "table_spread"
	expression: PrimaryExpressionNode

	Tokens: ParserNode["Tokens"] & {
		["..."]: Token
	}
}

export interface PostfixIndexSubExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_expression_index"
	index: PrimaryExpressionNode
	left: PrimaryExpressionNode

	Tokens: ParserNode["Tokens"] & {
		["["]: Token
		["]"]: Token
	}
}
export interface EndOfFileStatement extends ParserNode {
	Type: "statement"
	Kind: "end_of_file"

	Tokens: ParserNode["Tokens"] & {
		["end_of_file"]: Token
	}
}

export interface DebugParserCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "parser_debug_code"
	lua_code: ValueExpression
	Tokens: ParserNode["Tokens"] & {
		["£"]: Token
	}
}

export interface DebugAnalyzerCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "analyzer_debug_code"
	lua_code: ValueExpression
	Tokens: ParserNode["Tokens"] & {
		["§"]: Token
	}
}

export interface ReturnStatement extends ParserNode {
	Type: "statement"
	Kind: "return"
	expressions: PrimaryExpressionNode[]
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
export interface FunctionAnalyzerStatement extends ParserNode {
	Type: "statement"
	Kind: "analyzer_function"
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
	statements: StatementNode[]
	index_expression: BinaryOperatorExpression | ValueExpression
	Tokens: ParserNode["Tokens"] & {
		["analyzer"]: Token
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}
export interface FunctionTypeStatement extends ParserNode {
	Type: "statement"
	Kind: "type_function"
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
	statements: StatementNode[]
	index_expression: BinaryOperatorExpression | ValueExpression
	Tokens: ParserNode["Tokens"] & {
		["type"]: Token
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}
export interface FunctionAnalyzerExpression extends ParserNode {
	Type: "expression"
	Kind: "analyzer_function"
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["analyzer"]: Token
		["function"]: Token
		["arguments)"]: Token
		["arguments("]: Token
		["arguments,"]: Token[]
		["return_types,"]: Token[]
		["end"]: Token
	}
}

export interface FunctionTypeExpression extends ParserNode {
	Type: "expression"
	Kind: "type_function"
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["type"]: Token
		["function"]: Token
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
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
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
export interface FunctionLocalStatement extends ParserNode {
	Type: "statement"
	Kind: "local_function"
	label: Token
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
	statements: StatementNode[]
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
export interface FunctionLocalTypeStatement extends ParserNode {
	Type: "statement"
	Kind: "local_type_function"
	label: Token
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["type"]: Token
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
	index_expression: BinaryOperatorExpression | ValueExpression
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
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
export interface FunctionLocalAnalyzerStatement extends ParserNode {
	Type: "statement"
	Kind: "local_analyzer_function"
	label: Token
	arguments: FunctionArgumentSubExpression[]
	return_types: FunctionReturnTypeSubExpression[]
	statements: StatementNode[]
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
	expressions: PrimaryExpressionNode[]
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
	left: AnyExpressionNode
	right: PrimaryExpressionNode
}

export interface PrefixOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "prefix_operator"
	operator: Token
	right: PrimaryExpressionNode
}

export interface PostfixOperatorSubExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_operator"
	operator: Token
	left: AnyExpressionNode
}

export interface RepeatStatement extends ParserNode {
	Type: "statement"
	Kind: "repeat"
	statements: StatementNode[]
	expression: PrimaryExpressionNode
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
	expressions: PrimaryExpressionNode[]
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
	expression: PrimaryExpressionNode
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["while"]: Token
		["do"]: Token
		["end"]: Token
	}
}

export interface ForNumericStatement extends ParserNode {
	Type: "statement"
	Kind: "numeric_for"
	identifier: Token
	init_expression: PrimaryExpressionNode
	max_expression: PrimaryExpressionNode
	step_expression?: PrimaryExpressionNode
	statements: StatementNode[]
	Tokens: ParserNode["Tokens"] & {
		["for"]: Token
		["="]: Token
		["do"]: Token
		["end"]: Token
		[",2"]: Token[]
	}
}

export interface ForGenericStatement extends ParserNode {
	Type: "statement"
	Kind: "generic_for"
	identifiers: PrimaryExpressionNode[]
	expressions: PrimaryExpressionNode[]
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

export interface AssignmentLocalStatement extends ParserNode {
	Type: "statement"
	Kind: "local_assignment"
	identifiers: PrimaryExpressionNode[]
	expressions: PrimaryExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["local"]: Token
		["left,"]: Token[]
		["="]?: Token
		["right,"]: Token[]
	}
}

export interface AssignmentLocalTypeStatement extends ParserNode {
	Type: "statement"
	Kind: "local_type_assignment"
	identifiers: PrimaryExpressionNode[]
	expressions: PrimaryExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["type"]: Token
		["local"]: Token
		["left,"]: Token[]
		["="]: Token
		["right,"]: Token[]
	}
}

export interface AssignmentDestructureStatement extends ParserNode {
	Type: "statement"
	Kind: "destructure_assignment"
	default?: ValueExpression
	default_comma: Token
	left: ValueExpression[]
	right: PrimaryExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["{"]: Token
		[","]: Token[]
		["}"]: Token
		["="]: Token
	}
}
export interface AssignmentLocalDestructureStatement extends ParserNode {
	Type: "statement"
	Kind: "local_destructure_assignment"
	default: ValueExpression
	default_comma: Token
	left: ValueExpression[]
	right: PrimaryExpressionNode
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
	left: PrimaryExpressionNode[]
	right: PrimaryExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["="]: Token
		["left,"]: Token[]
		["right,"]: Token[]
	}
}

export interface CallExpressionStatement extends ParserNode {
	Type: "statement"
	Kind: "call_expression"
	expression: PrimaryExpressionNode
}

export interface FunctionSignatureTypeExpression extends ParserNode {
	Type: "expression"
	Kind: "function_signature"

	stmnt: boolean // ???
	identifiers?: FunctionArgumentSubExpression[]
	return_types?: FunctionReturnTypeSubExpression[]

	Tokens: ParserNode["Tokens"] & {
		["function"]: Token
		["="]: Token
		["arguments)"]: Token
		["arguments,"]: Token[]
		["arguments("]: Token
		[">"]: Token
		["return("]: Token
		["return,"]: Token[]
		["return)"]: Token
	}
}

export interface AssignmentTypeStatement extends ParserNode {
	Type: "statement"
	Kind: "type_assignment"
	left: PrimaryExpressionNode[]
	right: PrimaryExpressionNode[]
	Tokens: ParserNode["Tokens"] & {
		["type"]: Token
		["^"]?: Token
		["="]: Token
		["left,"]: Token[]
		["right,"]: Token[]
	}
}

export class LuaParser extends BaseParser<AnyParserNode> {
	ReadEndOfFile() {
		if (!this.IsType("end_of_file")) return undefined

		const node = this.StartNode("statement", "end_of_file")
		node.Tokens["end_of_file"] = this.ExpectType("end_of_file")
		return this.EndNode(node)
	}

	override ReadStatement() {
		return (
			this.ReadEndOfFile() ||
			this.ReadAnalyzerDebugCodeStatement() ||
			this.ReadParserDebugCodeStatement() ||
			this.ReadReturnStatement() ||
			this.ReadBreakStatement() ||
			this.ReadContinueStatement() ||
			this.ReadSemicolonStatement() ||
			this.ReadGotoStatement() ||
			this.ReadGotoLabelStatement() ||
			this.ReadRepeatStatement() ||
			this.ReadAnalyzerFunctionStatement() ||
			this.ReadTypeFunctionStatement() ||
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
	ReadPrimaryExpression() {
		return (
			this.ReadParenthesisExpression() ||
			this.ReadPrefixOperatorExpression() ||
			this.ReadAnalyzerFunctionExpression() ||
			this.ReadTypeFunctionExpression() ||
			this.ReadFunctionExpression() ||
			this.ReadImportExpression() ||
			this.ReadValueExpression() ||
			this.ReadTableExpression()
		)
	}

	ReadPrimaryTypeExpression() {
		return (
			this.ReadParenthesisExpression() ||
			this.ReadEmptyUnionTypeExpression() ||
			this.ReadPrefixOperatorTypeExpression() ||
			this.ReadAnalyzerFunctionExpression() ||
			this.ReadTypeFunctionExpression() ||
			this.ReadFunctionSignatureTypeExpression() ||
			this.ReadFunctionExpression() ||
			this.ReadImportExpression() ||
			this.ReadVarargValueExpression() ||
			this.ReadValueTypeExpression() ||
			this.ReadTableExpression()
		)
	}

	ReadSubExpression(primary: PrimaryExpressionNode) {
		let node: AnyExpressionNode = primary
		for (let i = 0; i < this.GetLength(); i++) {
			const primary = node

			if (this.IsValue(":") && (!this.IsType("letter", 1) || !this.IsCallExpression(2))) {
				primary.Tokens[":"] = this.ExpectValue(":")
				primary.type_expression = this.ExpectTypeExpression(0)
			} else if (this.IsValue("as")) {
				primary.Tokens["as"] = this.ExpectValue("as")
				primary.type_expression = this.ExpectTypeExpression(0)
			}

			const sub =
				this.ReadIndexSubExpression() ||
				this.ReadSelfCallSubExpression() ||
				this.ReadCallSubExpression() ||
				this.ReadPostfixOperatorSubExpression() ||
				this.ReadPostfixIndexSubExpression()

			if (!sub) break
			sub.left = primary

			node = sub
		}

		return node as unknown as SubExpressionNode
	}

	ReadSubTypeExpression(primary: PrimaryExpressionNode) {
		let node: AnyExpressionNode = primary
		for (let i = 0; i < this.GetLength(); i++) {
			const primary = node

			if (this.IsValue("as")) {
				primary.Tokens["as"] = this.ExpectValue("as")
				primary.type_expression = this.ExpectTypeExpression(0)
			}

			const sub =
				this.ReadIndexSubExpression() ||
				this.ReadSelfCallSubExpression() ||
				this.ReadCallSubExpression() ||
				this.ReadPostfixOperatorSubExpression() ||
				this.ReadPostfixIndexSubExpression()

			if (!sub) break
			sub.left = primary

			node = sub
		}

		return node as SubExpressionNode
	}
	ReadAnalyzerDebugCodeStatement() {
		if (!this.IsType("analyzer_debug_code")) return undefined

		const node = this.StartNode("statement", "analyzer_debug_code")
		node.Tokens["§"] = this.ExpectType("analyzer_debug_code")
		const code = this.StartNode("expression", "value")
		code.value = this.ReadToken()!
		node.lua_code = this.EndNode(code)

		return this.EndNode(node)
	}

	ReadParserDebugCodeStatement() {
		if (!this.IsType("parser_debug_code")) return undefined

		const node = this.StartNode("statement", "parser_debug_code")
		node.Tokens["£"] = this.ExpectType("parser_debug_code")
		const code = this.StartNode("expression", "value")
		code.value = this.ReadToken()!
		node.lua_code = this.EndNode(code)

		return this.EndNode(node)
	}

	private ExpectArgumentIdentifier() {
		if (this.IsType("letter")) {
			return this.ExpectType("letter")
		}

		return this.ExpectValue("...")
	}

	private ReadTypeFunctionArgument() {
		const node = this.StartNode("expression", "function_argument")

		node.identifier = this.ExpectArgumentIdentifier()
		node.Tokens[":"] = this.ExpectValue(":")

		node.type_expression = this.ExpectTypeExpression()!

		return this.EndNode(node)
	}

	private ReadAnalyzerFunctionBody(node: FunctionNode) {
		node.Tokens["arguments,"] = []
		node.Tokens["arguments("] = this.ExpectValue("(")

		if (this.IsValue(")")) {
			node.arguments = []
		} else {
			node.arguments = this.ReadMultipleValues(
				Infinity,
				() => this.ReadTypeFunctionArgument(), // analyzer functions expect typed arguments
				node.Tokens["arguments,"],
			)
		}
		node.Tokens["arguments)"] = this.ExpectValue(")", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.Tokens["return_types,"] = []
			node.return_types = this.ReadMultipleValues(
				Infinity,
				() => this.ReadFunctionReturnTypeExpression(),
				node.Tokens["return_types,"],
			)
		}

		const start = this.GetToken()
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end", start, start)
	}

	private ReadFunctionArgument() {
		const node = this.StartNode("expression", "function_argument")
		node.identifier = this.ExpectArgumentIdentifier()

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.type_expression = this.ExpectTypeExpression()!
		}

		return this.EndNode(node)
	}
	private ReadFunctionBody(node: FunctionNode) {
		node.Tokens["arguments,"] = []
		node.Tokens["arguments("] = this.ExpectValue("(")
		if (this.IsValue(")")) {
			node.arguments = []
		} else {
			node.arguments = this.ReadMultipleValues(
				Infinity,
				() => this.ReadFunctionArgument(),
				node.Tokens["arguments,"],
			)
		}
		node.Tokens["arguments)"] = this.ExpectValue(")", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.Tokens["return_types,"] = []
			node.return_types = this.ReadMultipleValues(
				undefined,
				() => this.ReadFunctionReturnTypeExpression(),
				node.Tokens["return_types,"],
			)
		}

		node.statements = this.ReadStatements({ end: true })

		node.Tokens["end"] = this.ExpectValue("end")
	}

	ReadTypeFunctionStatement() {
		if (!(this.IsValue("type") && this.IsValue("function", 1))) return
		const node = this.StartNode("statement", "type_function")
		node.Tokens["type"] = this.ExpectValue("type")
		node.Tokens["function"] = this.ExpectValue("function")
		node.index_expression = this.ReadIndexExpression() // todo: read function index expression

		this.ReadFunctionBody(node)
		return this.EndNode(node)
	}

	ReadAnalyzerFunctionStatement() {
		if (!(this.IsValue("analyzer") && this.IsValue("function", 1))) return
		const node = this.StartNode("statement", "analyzer_function")
		node.Tokens["analyzer"] = this.ExpectValue("analyzer")
		node.Tokens["function"] = this.ExpectValue("function")
		node.index_expression = this.ReadIndexExpression() // todo: read function index expression

		this.ReadAnalyzerFunctionBody(node)
		return this.EndNode(node)
	}

	ReadAnalyzerFunctionExpression() {
		if (!(this.IsValue("analyzer") && this.IsValue("function", 1))) return
		const node = this.StartNode("expression", "analyzer_function")
		node.Tokens["analyzer"] = this.ExpectValue("analyzer")
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadAnalyzerFunctionBody(node)
		return this.EndNode(node)
	}
	ReadTypeFunctionExpression() {
		if (!(this.IsValue("type") && this.IsValue("function", 1))) return
		const node = this.StartNode("expression", "type_function")
		node.Tokens["type"] = this.ExpectValue("type")
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadFunctionBody(node)
		return this.EndNode(node)
	}

	ReadLocalFunctionStatement() {
		if (!(this.IsValue("local") && this.IsValue("function", 1))) return undefined

		const node = this.StartNode("statement", "local_function")
		node.Tokens["local"] = this.ExpectValue("local")
		node.Tokens["function"] = this.ExpectValue("function")
		node.label = this.ExpectType("letter")
		this.ReadFunctionBody(node)
		return this.EndNode(node)
	}

	ReadFunctionStatement() {
		if (!this.IsValue("function")) return undefined

		const node = this.StartNode("statement", "function")
		node.Tokens["function"] = this.ExpectValue("function")
		node.index_expression = this.ReadIndexExpression() // todo: read function index expression
		this.ReadFunctionBody(node)
		return this.EndNode(node)
	}

	ReadLocalAnalyzerFunctionStatement() {
		if (!(this.IsValue("local") && this.IsValue("analyzer", 1) && this.IsValue("function", 2))) return undefined

		const node = this.StartNode("statement", "local_analyzer_function")
		node.Tokens["local"] = this.ExpectValue("local")
		node.Tokens["analyzer"] = this.ExpectValue("analyzer")
		node.Tokens["function"] = this.ExpectValue("function")
		node.label = this.ExpectType("letter")

		this.ReadAnalyzerFunctionBody(node)

		return this.EndNode(node)
	}

	ReadReturnStatement() {
		if (!this.IsValue("return")) return undefined

		const node = this.StartNode("statement", "return")
		node.Tokens[","] = []
		node.Tokens["return"] = this.ExpectValue("return")
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens[","]) // TODO: avoid creating closure

		return this.EndNode(node)
	}

	ReadBreakStatement() {
		if (!this.IsValue("break")) return undefined

		const node = this.StartNode("statement", "break")
		node.Tokens["break"] = this.ExpectValue("break")
		return this.EndNode(node)
	}

	ReadContinueStatement() {
		if (!this.IsValue("continue")) return undefined

		const node = this.StartNode("statement", "continue")
		node.Tokens["continue"] = this.ExpectValue("continue")
		return this.EndNode(node)
	}
	ReadSemicolonStatement() {
		if (!this.IsValue(";")) return undefined

		const node = this.StartNode("statement", "semicolon")
		node.Tokens[";"] = this.ExpectValue(";")
		return this.EndNode(node)
	}
	ReadGotoStatement() {
		if (!this.IsValue("goto") || !this.IsType("letter", 1)) return undefined

		const node = this.StartNode("statement", "goto")
		node.Tokens["goto"] = this.ExpectValue("goto")
		node.identifier = this.ExpectType("letter")

		return this.EndNode(node)
	}

	ReadGotoLabelStatement() {
		if (!this.IsValue("::")) return undefined

		const node = this.StartNode("statement", "goto_label")

		node.Tokens["::left"] = this.ExpectValue("::")
		node.identifier = this.ExpectType("letter")
		node.Tokens["::right"] = this.ExpectValue("::")

		return this.EndNode(node)
	}

	ReadRepeatStatement() {
		if (!this.IsValue("repeat")) return undefined

		const node = this.StartNode("statement", "repeat")
		node.Tokens["repeat"] = this.ExpectValue("repeat")
		node.statements = this.ReadStatements({ until: true })
		node.Tokens["until"] = this.ExpectValue("until")
		node.expression = this.ExpectExpression()!
		return this.EndNode(node)
	}

	ReadLocalAssignmentStatement() {
		if (!this.IsValue("local") || !this.IsType("letter", 1)) return undefined

		const node = this.StartNode("statement", "local_assignment")
		node.Tokens["left,"] = []
		node.Tokens["right,"] = []

		node.Tokens["local"] = this.ExpectValue("local")

		node.identifiers = this.ReadMultipleValues(undefined, () => this.ExpectIdentifier(), node.Tokens["left,"])

		if (this.IsValue("=")) {
			node.Tokens["="] = this.ExpectValue("=")
		}
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens["right,"])

		return this.EndNode(node)
	}
	ReadDoStatement() {
		if (!this.IsValue("do")) return undefined

		const node = this.StartNode("statement", "do")
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return this.EndNode(node)
	}
	ReadIfStatement() {
		if (!this.IsValue("if")) return undefined

		const node = this.StartNode("statement", "if")
		node.Tokens["if/else/elseif"] = []
		node.Tokens["then"] = []
		node.expressions = []
		node.statements = []

		for (let i = 0; i < this.GetLength(); i++) {
			let token

			if (i == 0) {
				token = this.ExpectValue("if")
			} else if (this.IsValue("else")) {
				token = this.ExpectValue("else")
			} else if (this.IsValue("elseif")) {
				token = this.ExpectValue("elseif")
			} else {
				this.Error("Expected 'else' or 'elseif'")
			}

			if (!token) return undefined

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

		return this.EndNode(node)
	}

	ReadWhileStatement() {
		if (!this.IsValue("while")) return undefined

		const node = this.StartNode("statement", "while")
		node.Tokens["while"] = this.ExpectValue("while")
		node.expression = this.ExpectExpression(0)!
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return this.EndNode(node)
	}

	ReadNumericForStatement() {
		if (!this.IsValue("for") || !this.IsValue("=", 2)) return undefined

		const node = this.StartNode("statement", "numeric_for")
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
		return this.EndNode(node)
	}
	ReadGenericForStatement() {
		if (!this.IsValue("for")) return undefined

		const node = this.StartNode("statement", "generic_for")
		node.Tokens["left,"] = []
		node.Tokens["right,"] = []

		node.Tokens["for"] = this.ExpectValue("for")
		node.identifiers = this.ReadMultipleValues(undefined, () => this.ExpectIdentifier(), node.Tokens["left,"])
		node.Tokens["in"] = this.ExpectValue("in")
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(), node.Tokens["right,"])
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return this.EndNode(node)
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

		const node = this.StartNode("statement", "destructure_assignment")
		node.Tokens[","] = []

		if (this.IsType("letter")) {
			const val = this.StartNode("expression", "value")
			val.value = this.ReadToken()!
			node.default = this.EndNode(val)
			node.default_comma = this.ExpectValue(",")
		}

		node.Tokens["{"] = this.ExpectValue("{")
		node.left = this.ReadMultipleValues(undefined, () => this.ExpectIdentifier(), node.Tokens[","])
		node.Tokens["}"] = this.ExpectValue("}")
		node.Tokens["="] = this.ExpectValue("=")
		node.right = this.ReadExpression(0)!

		return this.EndNode(node)
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

		const node = this.StartNode("statement", "local_destructure_assignment")
		node.Tokens[","] = []
		node.Tokens["local"] = this.ExpectValue("local")

		if (this.IsType("letter")) {
			const val = this.StartNode("expression", "value")
			val.value = this.ReadToken()!
			node.default = this.EndNode(val)
			node.default_comma = this.ExpectValue(",")
		}

		node.Tokens["{"] = this.ExpectValue("{")
		node.left = this.ReadMultipleValues(undefined, () => this.ExpectIdentifier(), node.Tokens[","])
		node.Tokens["}"] = this.ExpectValue("}")
		node.Tokens["="] = this.ExpectValue("=")
		node.right = this.ReadExpression(0)!

		return this.EndNode(node)
	}
	ReadCallOrAssignmentStatement() {
		const start = this.GetToken()
		const left_commas: Token[] = []
		const left = this.ReadMultipleValues(Infinity, () => this.ReadExpression(0), left_commas)

		if (this.IsValue("=")) {
			const node = this.StartNode("statement", "assignment")
			node.Tokens["="] = this.ExpectValue("=")
			node.left = left
			node.Tokens["right,"] = []
			node.right = this.ReadMultipleValues(Infinity, () => this.ReadExpression(0), node.Tokens["right,"])
			node.Tokens["left,"] = left_commas
			return this.EndNode(node)
		}

		if (left[0] && (left[0].Kind == "postfix_call" || left[0].Kind == "import") && !left[1]) {
			const node = this.StartNode("statement", "call_expression")
			node.expression = left[0]
			return this.EndNode(node)
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
	ReadLocalTypeFunctionStatement() {
		if (!(this.IsValue("local") && this.IsValue("type", 1) && this.IsValue("function", 2))) return undefined

		const node = this.StartNode("statement", "local_type_function")
		node.environment = "typesystem"
		node.Tokens["local"] = this.ExpectValue("local")
		node.Tokens["type"] = this.ExpectValue("type")
		node.Tokens["function"] = this.ExpectValue("function")
		node.label = this.ExpectType("letter")
		this.ReadFunctionBody(node)
		return this.EndNode(node)
	}
	ReadLocalTypeAssignmentStatement() {
		if (!this.IsValue("local") || !this.IsValue("type", 1) || !this.IsType("letter", 2)) return undefined

		const node = this.StartNode("statement", "local_type_assignment")
		node.environment = "typesystem"
		node.Tokens["left,"] = []
		node.Tokens["right,"] = []

		node.Tokens["local"] = this.ExpectValue("local")
		node.Tokens["type"] = this.ExpectValue("type")

		node.identifiers = this.ReadMultipleValues(undefined, () => this.ExpectIdentifier(), node.Tokens["left,"])

		if (this.IsValue("=")) {
			node.Tokens["="] = this.ExpectValue("=")
		}
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0), node.Tokens["right,"])

		return this.EndNode(node)
	}

	ReadTypeAssignmentStatement() {
		if (!(this.IsValue("type") && (this.IsType("letter", 1) || this.IsValue("^", 1)))) return

		const node = this.StartNode("statement", "type_assignment")
		node.Tokens["type"] = this.ExpectValue("type")

		if (this.IsValue("^")) {
			node.Tokens["^"] = this.ExpectValue("^")
		}

		node.Tokens["left,"] = []
		node.left = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens["left,"])
		node.environment = "typesystem"

		if (this.IsValue("=")) {
			node.Tokens["="] = this.ExpectValue("=")
			node.Tokens["right,"] = []
			node.right = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0), node.Tokens["right,"])
		}

		return this.EndNode(node)
	}

	ReadFunctionExpression() {
		if (!this.IsValue("function")) return
		const node = this.StartNode("expression", "function")
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadFunctionBody(node)

		return this.EndNode(node)
	}
	ReadParenthesisExpression() {
		if (!this.IsValue("(")) return undefined

		const left_parentheses = this.ExpectValue("(")
		const node = this.ReadExpression(0) as PrimaryExpressionNode | undefined // we have to do to prevent infinite recursion in typescript

		if (!node) {
			this.Error("empty parentheses group", left_parentheses)
			return undefined
		}

		node.Tokens["("] = node.Tokens["("] || []
		node.Tokens["("].unshift(left_parentheses)

		node.Tokens[")"] = node.Tokens[")"] || []
		node.Tokens[")"].push(this.ExpectValue(")"))

		return node
	}

	ReadIndexSubExpression() {
		if (!(this.IsValue(".") && this.IsType("letter", 1))) return
		const node = this.StartNode("expression", "binary_operator")
		node.operator = this.ReadToken()!

		node.right = this.StartNode("expression", "value")
		node.right.value = this.ExpectType("letter")

		this.EndNode(node)
		return node
	}

	ReadSelfCallSubExpression() {
		if (!(this.IsValue(":") && this.IsType("letter", 1) && this.IsCallExpression(2))) return

		const node = this.StartNode("expression", "binary_operator")
		node.operator = this.ReadToken()!

		node.right = this.StartNode("expression", "value")
		node.right.value = this.ExpectType("letter")

		this.EndNode(node.right)

		return this.EndNode(node)
	}

	ReadCallSubExpression() {
		if (!this.IsCallExpression(0)) return

		const node = this.StartNode("expression", "postfix_call")
		node.Tokens[","] = []

		if (this.IsValue("{")) {
			node.arguments = [this.ReadTableExpression()!]
		} else if (this.IsType("string")) {
			const value = this.StartNode("expression", "value")
			value.value = this.ReadToken()!
			this.EndNode(value)

			node.arguments = [value]
		} else if (this.IsValue("<|")) {
			node.Tokens["arguments("] = this.ExpectValue("<|")
			node.arguments = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0), node.Tokens[","])
			node.Tokens["arguments)"] = this.ExpectValue("|>")
			node.is_type_call = true
		} else if (this.IsValue("!")) {
			node.Tokens["!"] = this.ExpectValue("!")
			node.Tokens["arguments("] = this.ExpectValue("(")
			node.arguments = this.ReadMultipleValues(undefined, () => this.ReadTypeExpression(0), node.Tokens[","])
			node.Tokens["arguments)"] = this.ExpectValue(")")
			node.is_type_call = true
		} else {
			node.Tokens["arguments("] = this.ExpectValue("(")
			node.arguments = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens[","])
			node.Tokens["arguments)"] = this.ExpectValue(")")
		}

		return this.EndNode(node)
	}
	ReadPostfixOperatorSubExpression() {
		if (!syntax.IsPostfixOperator(this.GetToken()!)) return

		const node = this.StartNode("expression", "postfix_operator")
		node.operator = this.ReadToken()!
		return this.EndNode(node)
	}

	ReadPostfixIndexSubExpression() {
		if (!this.IsValue("[")) return

		const node = this.StartNode("expression", "postfix_expression_index")
		node.Tokens["["] = this.ExpectValue("[")
		node.index = this.ExpectExpression(0)!
		node.Tokens["]"] = this.ExpectValue("]")
		return this.EndNode(node)
	}

	ReadPrefixOperatorExpression() {
		if (!syntax.IsPrefixOperator(this.GetToken()!)) return

		const node = this.StartNode("expression", "prefix_operator")
		node.operator = this.ReadToken()!
		node.right = this.ExpectExpression(Infinity)!
		return this.EndNode(node)
	}
	ReadPrefixOperatorTypeExpression() {
		if (!syntax_typesystem.IsPrefixOperator(this.GetToken()!)) return

		const node = this.StartNode("expression", "prefix_operator")
		node.operator = this.ReadToken()!
		node.right = this.ExpectTypeExpression(Infinity)!
		return this.EndNode(node)
	}

	ReadFunctionReturnTypeExpression() {
		const node = this.StartNode("expression", "function_return_type")

		if (this.IsType("letter") && this.IsValue(":", 1)) {
			node.identifier = this.ExpectArgumentIdentifier()
			node.Tokens[":"] = this.ExpectValue(":")
		}

		node.type_expression = this.ExpectTypeExpression()!

		return this.EndNode(node)
	}

	ReadIndexExpression() {
		let node = this.StartNode("expression", "value") as BinaryOperatorExpression | ValueExpression
		if (node.Kind == "value") {
			node.value = this.ExpectType("letter")
		}
		this.EndNode(node)

		const first = node

		while (this.IsValue(".") || this.IsValue(":")) {
			const left = node
			const self_call = this.IsValue(":")

			const binary = this.StartNode("expression", "binary_operator")
			binary.operator = this.ReadToken()!

			const value = this.StartNode("expression", "value")
			value.value = this.ExpectType("letter")
			value.self_call = !!self_call
			this.EndNode(value)

			binary.right = value
			this.EndNode(node)

			binary.left = left
			node = binary
		}

		first.standalone_letter = node

		return node
	}

	ReadImportExpression() {
		if (!(this.IsValue("import") && !this.IsValue("(", 1))) return
		const node = this.StartNode("expression", "import")
		node.Tokens["import"] = this.ExpectValue("import")

		node.Tokens["("] = node.Tokens["("] || []
		node.Tokens["("].push(this.ExpectValue("("))

		const start = this.GetToken()

		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens[","])

		const root = this.config.path && this.config.path // .path:match("(.+/)") or ""

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
		const node = this.StartNode("expression", "value")
		node.value = this.ReadToken()!
		return this.EndNode(node)
	}

	ReadValueTypeExpression() {
		if (!syntax_typesystem.IsTokenValue(this.GetToken()!)) return
		const node = this.StartNode("expression", "value")
		node.value = this.ReadToken()!
		return this.EndNode(node)
	}

	ReadVarargValueExpression() {
		if (!(this.IsValue("...") && this.IsType("letter", 1))) return
		const node = this.StartNode("expression", "type_vararg")
		node.Tokens["..."] = this.ExpectValue("...")
		node.expression = this.ExpectTypeExpression()!

		return this.EndNode(node)
	}

	private ReadTableSpread() {
		if (!(this.IsValue("...") && (this.IsType("letter", 1) || this.IsValue("{", 1) || this.IsValue("(", 1)))) return
		const node = this.StartNode("expression", "table_spread")
		node.Tokens["..."] = this.ExpectValue("...")
		node.expression = this.ExpectExpression(0)!
		return this.EndNode(node)
	}

	private ReadTableEntry(i: number) {
		if (this.IsValue("[")) {
			const node = this.StartNode("expression", "table_expression_value")
			node.expression_key = true
			node.Tokens["["] = this.ExpectValue("[")
			node.key_expression = this.ExpectExpression(0)!
			node.Tokens["]"] = this.ExpectValue("]")
			node.Tokens["="] = this.ExpectValue("=")
			node.value_expression = this.ExpectExpression(0)!
			return this.EndNode(node)
		} else if (this.IsType("letter") && this.IsValue("=", 1)) {
			const node = this.StartNode("expression", "table_key_value")
			node.identifier = this.ReadToken()!
			node.Tokens["="] = this.ExpectValue("=")

			const spread = this.ReadTableSpread()

			if (spread) {
				node.spread = spread
			} else {
				node.value_expression = this.ExpectExpression(0)!
			}

			return this.EndNode(node)
		}

		const node = this.StartNode("expression", "table_index_value")

		const spread = this.ReadTableSpread()

		if (spread) {
			node.spread = spread
		} else {
			node.value_expression = this.ExpectExpression(0)!
		}

		node.key = i

		return this.EndNode(node)
	}

	ReadTableExpression() {
		if (!this.IsValue("{")) return
		const tree = this.StartNode("expression", "table")
		tree.Tokens["{"] = this.ExpectValue("{")
		tree.children = []
		tree.Tokens["separators"] = []

		for (let i = 0; i < this.GetLength(); i++) {
			if (this.IsValue("}")) break

			const entry = this.ReadTableEntry(i)

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

		return this.EndNode(tree)
	}

	ReadEmptyUnionTypeExpression() {
		if (!this.IsValue("|")) return undefined

		const node = this.StartNode("expression", "empty_union")
		node.Tokens["|"] = this.ExpectValue("|")

		return this.EndNode(node)
	}

	ReadFunctionSignatureArgument() {
		const node = this.StartNode("expression", "function_argument")

		if (this.IsType("letter") && this.IsValue(":", 1)) {
			node.identifier = this.ExpectArgumentIdentifier()
			node.Tokens[":"] = this.ExpectValue(":")
		}

		node.type_expression = this.ExpectTypeExpression()!

		return this.EndNode(node)
	}
	ReadFunctionSignatureTypeExpression() {
		if (!(this.IsValue("function") && this.IsValue("=", 1))) return

		const node = this.StartNode("expression", "function_signature")

		node.stmnt = false
		node.Tokens["function"] = this.ExpectValue("function")
		node.Tokens["="] = this.ExpectValue("=")

		node.Tokens["arguments("] = this.ExpectValue("(")
		node.Tokens["arguments,"] = []
		if (!this.IsValue(")")) {
			node.identifiers = this.ReadMultipleValues(
				undefined,
				() => this.ReadFunctionSignatureArgument(),
				node.Tokens["arguments,"],
			)
		}
		node.Tokens["arguments)"] = this.ExpectValue(")")

		node.Tokens[">"] = this.ExpectValue(">")

		node.Tokens["return("] = this.ExpectValue("(")
		node.Tokens["return,"] = []

		if (!this.IsValue(")")) {
			node.return_types = this.ReadMultipleValues(
				undefined,
				() => this.ReadFunctionReturnTypeExpression(),
				node.Tokens["return,"],
			)
		}
		node.Tokens["return)"] = this.ExpectValue(")")

		return this.EndNode(node)
	}

	ExpectIdentifier() {
		const node = this.StartNode("expression", "value")

		node.value = this.ExpectType("letter")

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.type_expression = this.ExpectTypeExpression(0)
		}

		return this.EndNode(node)
	}

	ReadExpression(priority = 0) {
		return this.ReadExpressionGeneric(
			priority,
			() => this.ReadPrimaryExpression(),
			(node) => this.ReadSubExpression(node),
			syntax,
		)
	}

	ReadTypeExpression(priority = 0) {
		return this.ReadExpressionGeneric(
			priority,
			() => this.ReadPrimaryTypeExpression(),
			(node) => this.ReadSubTypeExpression(node),
			syntax_typesystem,
		)
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

	ReadMultipleValues<_, T extends () => AnyParserNode | undefined>(
		max: number | undefined,
		reader: T,
		comma_tokens: Token[],
	) {
		const out = []

		for (let i = 0; i < (max !== undefined ? max : this.GetLength()); i++) {
			const node = reader()
			if (!node) break
			out.push(node)

			if (!this.IsValue(",")) break

			comma_tokens.push(this.ExpectValue(","))
		}

		return out as NonNullable<ReturnType<T>>[]
	}
	private CheckIntegerDivision(token: Token) {
		if (!token.integer_division_resolved && token.whitespace) {
			for (let i = 0; i < token.whitespace.length; i++) {
				const whitespace = token.whitespace[i]

				if (!whitespace) break

				if (whitespace.value.indexOf("\n", 0) > -1) break

				if (whitespace.type == "line_comment" && whitespace.value.substring(0, 2) == "//") {
					token.whitespace.splice(i, 1)

					const tokens = new LuaLexer(new Code("/idiv" + whitespace.value.substring(1))).GetTokens()

					for (const token of tokens) {
						this.CheckIntegerDivision(token)
					}

					this.AddTokens(tokens)
					token.integer_division_resolved = true

					break
				}
			}
		}
	}
	ReadExpressionGeneric<
		_,
		Primary extends () => PrimaryExpressionNode | undefined,
		Sub extends (node: PrimaryExpressionNode) => SubExpressionNode | undefined,
	>(
		priority: number,
		primary_reader: Primary,
		sub_reader: Sub,
		syntax: BaseSyntax,
	): PrimaryExpressionNode | undefined {
		if (this.GetPreferTypesystem()) {
			return this.ReadTypeExpression(priority)
		}

		// read primary expression
		let node

		const primary = primary_reader()

		node = primary

		if (primary) {
			const sub = sub_reader(primary)

			if (sub) {
				if (primary.Kind == "value" && (primary.value.type == "letter" || primary.value.value == "...")) {
					primary.standalone_letter = sub
				}
			}

			node = sub
		}

		this.CheckIntegerDivision(this.GetToken()!)

		while (node) {
			const info = syntax.GetBinaryOperatorInfo(this.GetToken()!)
			if (!info || info.left_priority < priority) break

			const left_node = node
			node = this.StartNode("expression", "binary_operator")
			node.operator = this.ReadToken()!
			node.left = left_node
			node.left.Parent = node

			node.right = this.ExpectExpression(syntax.GetBinaryOperatorInfo(node.operator)!.right_priority)!

			if (!node.right) {
				const token = this.GetToken()
				this.Error(
					"expected right side to be an expression, got $1",
					undefined,
					undefined,
					token && ((token.value != "" && token.value) || token.type),
				)
				return
			}

			this.EndNode(node)
		}

		return node as unknown as PrimaryExpressionNode
	}
	IsStartOfExpression() {
		const token = this.GetToken()

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
			return false
		}

		return true
	}
	ExpectTypeExpression(priority = 0) {
		if (!this.IsStartOfExpression()) return

		return this.ReadTypeExpression(priority)
	}
	ExpectExpression(priority = 0) {
		if (!this.IsStartOfExpression()) return

		return this.ReadExpression(priority)
	}
}
