import { BaseParser, ParserNode } from "./BaseParser"
import { Code } from "./Code"
import { LuaLexer, syntax } from "./LuaLexer"
import { Token } from "./Token"

type FunctionNode =
	| AnalyzerFunctionStatement
	| AnalyzerFunctionExpression
	| FunctionExpression
	| LocalFunctionStatement
	| FunctionStatement
	| LocalAnalyzerFunctionStatement

type PrimaryExpressionNode =
	| ValueExpression
	| FunctionExpression
	| ImportExpression
	| PrefixOperatorExpression
	| TableExpression
	| AnalyzerFunctionExpression

export type SubExpressionNode =
	| BinaryOperatorExpression
	| PostfixCallExpression
	| PostfixOperatorExpression
	| PostfixIndexExpression
	| FunctionArgumentExpression
	| FunctionReturnTypeExpression
	
export type ExpressionNode =
	| ValueExpression
	| FunctionExpression
	| ImportExpression
	| PrefixOperatorExpression
	| TableExpression
	| AnalyzerFunctionExpression
	| TableSpreadExpression // sub
	| TableExpressionNodes // sub
	| SubExpressionNode // sub

export type StatementNode =
	| ReturnStatement
	| AnalyzerDebugCodeStatement
	| ParserDebugCodeStatement
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

// function( foo: Bar )
export interface FunctionArgumentExpression extends ParserNode {
	Type: "expression"
	Kind: "function_argument"
	identifier?: Token
	type_expression: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		[":"]?: Token
	}
}


export interface FunctionReturnTypeExpression extends ParserNode {
	Type: "expression"
	Kind: "function_return_type"
	identifier?: Token
	type_expression: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		[":"]?: Token
	}
}

// { [key] = value }
export interface TableExpressionKeyValueExpression extends ParserNode {
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

// { key = value }
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

// { value }
export interface TableIndexValueExpression extends ParserNode {
	Type: "expression"
	Kind: "table_index_value"
	value_expression: ExpressionNode
	spread?: TableSpreadExpression
	key: number
}

type TableExpressionNodes = TableExpressionKeyValueExpression | TableKeyValueExpression | TableIndexValueExpression

// { [key] = value, key = value, value }
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

// foo(a,b,c)
export interface PostfixCallExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_call"
	arguments: ExpressionNode[]
	is_type_call: boolean
	left: ExpressionNode
	Tokens: ParserNode["Tokens"] & {
		["arguments("]?: Token
		[","]: Token[]
		["arguments)"]?: Token
		// type call
		["!"]: Token
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

export interface ParserDebugCodeStatement extends ParserNode {
	Type: "statement"
	Kind: "parser_debug_code"
	lua_code: ValueExpression
	Tokens: ParserNode["Tokens"] & {
		["£"]: Token
	}
}

export interface AnalyzerDebugCodeStatement extends ParserNode {
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
export interface AnalyzerFunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "analyzer_function"
	arguments: FunctionArgumentExpression[]
	return_types: FunctionReturnTypeExpression[]
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
export interface AnalyzerFunctionExpression extends ParserNode {
	Type: "expression"
	Kind: "analyzer_function"
	arguments: FunctionArgumentExpression[]
	return_types: FunctionReturnTypeExpression[]
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
export interface FunctionExpression extends ParserNode {
	Type: "expression"
	Kind: "function"
	arguments: FunctionArgumentExpression[]
	return_types: FunctionReturnTypeExpression[]
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
	label: Token
	arguments: FunctionArgumentExpression[]
	return_types: FunctionReturnTypeExpression[]
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
export interface FunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "function"
	index_expression: BinaryOperatorExpression | ValueExpression
	arguments: FunctionArgumentExpression[]
	return_types: FunctionReturnTypeExpression[]
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
export interface LocalAnalyzerFunctionStatement extends ParserNode {
	Type: "statement"
	Kind: "local_analyzer_function"
	label: Token
	arguments: FunctionArgumentExpression[]
	return_types: FunctionReturnTypeExpression[]
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
}

export interface PostfixOperatorExpression extends ParserNode {
	Type: "expression"
	Kind: "postfix_operator"
	operator: Token
	left: ExpressionNode
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
	default: ValueExpression
	default_comma: Token
	left: ValueExpression[]
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
	default: ValueExpression
	default_comma: Token
	left: ValueExpression[]
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
	ReadAnalyzerDebugCodeStatement() {
		if (!this.IsType("analyzer_debug_code")) return undefined

		let node = this.StartNode("statement", "analyzer_debug_code")
		node.Tokens["§"] = this.ExpectType("analyzer_debug_code")
		let code = this.StartNode("expression", "value")
		code.value = this.ReadToken()!
		node.lua_code = this.EndNode(code)

		return this.EndNode(node)
	}

	ReadParserDebugCodeStatement() {
		if (!this.IsType("parser_debug_code")) return undefined

		let node = this.StartNode("statement", "parser_debug_code")
		node.Tokens["£"] = this.ExpectType("parser_debug_code")
		let code = this.StartNode("expression", "value")
		code.value = this.ReadToken()!
		node.lua_code = this.EndNode(code)

		return this.EndNode(node)
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
		if (!this.IsValue("(")) return undefined

		let left_parentheses = this.ExpectValue("(")
		let node = this.ReadExpression(0) as PrimaryExpressionNode

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

	private ReadIndexSubExpression() {
		if (!(this.IsValue(".") && this.IsType("letter", 1))) return
		let node = this.StartNode("expression", "binary_operator")
		node.operator = this.ReadToken()!

		node.right = this.StartNode("expression", "value")
		node.right.value = this.ExpectType("letter")

		this.EndNode(node)
		return node
	}

	ReadSelfCallSubExpression() {
		if (!(this.IsValue(":") && this.IsType("letter", 1) && this.IsCallExpression(2))) return

		let node = this.StartNode("expression", "binary_operator")
		node.operator = this.ReadToken()!

		node.right = this.StartNode("expression", "value")
		node.right.value = this.ExpectType("letter")

		this.EndNode(node.right)

		return this.EndNode(node)
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

		let node = this.StartNode("expression", "postfix_call")
		node.Tokens[","] = []

		if (this.IsValue("{")) {
			node.arguments = [this.ReadTableExpression()!]
		} else if (this.IsType("string")) {
			let value = this.StartNode("expression", "value")
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

		let node = this.StartNode("expression", "postfix_operator")
		node.operator = this.ReadToken()!
		return this.EndNode(node)
	}

	ReadPostfixIndexSubExpression() {
		if (!this.IsValue("[")) return

		let node = this.StartNode("expression", "postfix_expression_index")
		node.Tokens["["] = this.ExpectValue("[")
		node.index = this.ExpectExpression(0)!
		node.Tokens["]"] = this.ExpectValue("]")
		return this.EndNode(node)
	}

	ReadSubExpression(primary: PrimaryExpressionNode) {
		let node: PrimaryExpressionNode | SubExpressionNode = primary
		for (let i = 0; i < this.GetLength(); i++) {
			let primary = node

			if (this.IsValue(":") && (!this.IsType("letter", 1) || !this.IsCallExpression(2))) {
				primary.Tokens[":"] = this.ExpectValue(":")
				primary.type_expression = this.ExpectTypeExpression(0)
			} else if (this.IsValue("as")) {
				primary.Tokens["as"] = this.ExpectValue("as")
				primary.type_expression = this.ExpectTypeExpression(0)
			} else if (this.IsValue("is")) {
				primary.Tokens["is"] = this.ExpectValue("is")
				primary.type_expression = this.ExpectTypeExpression(0)
			}

			let sub =
				this.ReadIndexSubExpression() ||
				this.ReadSelfCallSubExpression() ||
				this.ReadCallSubExpression() ||
				this.ReadPostfixOperatorSubExpression() ||
				this.ReadPostfixIndexSubExpression()

			if (!sub) break
			sub.left = primary

			node = sub
		}

		return node
	}

	ReadPrefixOperatorExpression() {
		if (!syntax.IsPrefixOperator(this.GetToken()!)) return

		let node = this.StartNode("expression", "prefix_operator")
		node.operator = this.ReadToken()!
		node.right = this.ExpectExpression(Infinity)!
		return this.EndNode(node)
	}

    IsArgumentIdentifier() {
        return this.IsType("letter") || this.IsValue("...")
    }
    
    ExpectArgumentIdentifier() {
        if (this.IsType("letter")) {
            return this.ExpectType("letter")
        }

        return this.ExpectValue("...")
    }

	private ReadTypeFunctionArgument() {
        let node = this.StartNode("expression", "function_argument")

        node.identifier = this.ExpectArgumentIdentifier()
        node.Tokens[":"] = this.ExpectValue(":")

        node.type_expression = this.ExpectTypeExpression()
        
        return this.EndNode(node)
	}


	private ReadFunctionArgument() {
        let node = this.StartNode("expression", "function_argument")
        node.identifier = this.ExpectArgumentIdentifier()
        
		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
            node.type_expression = this.ExpectTypeExpression()
		}
        
        return this.EndNode(node)
	}

	private ReadFunctionReturnTypeExpression() {
        let node = this.StartNode("expression", "function_return_type")

		if (this.IsType("letter") && this.IsValue(":", 1)) {
			node.identifier = this.ExpectArgumentIdentifier()
			node.Tokens[":"] = this.ExpectValue(":")
		}

        node.type_expression = this.ExpectTypeExpression()
        
        return this.EndNode(node)
	}
	ReadAnalyzerFunctionBody(node: FunctionNode) {
		node.Tokens["arguments,"] = []
		node.Tokens["arguments("] = this.ExpectValue("(")
		node.arguments = this.ReadMultipleValues(
			Infinity,
			() => this.ReadTypeFunctionArgument(), // analyzer functions expect typed arguments
			node.Tokens["arguments,"],
		)
		node.Tokens["arguments)"] = this.ExpectValue(")", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.return_types = this.ReadMultipleValues(
				Infinity,
				() => this.ReadFunctionReturnTypeExpression(),
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
		node.arguments = this.ReadMultipleValues(Infinity, () => this.ReadFunctionArgument(), node.Tokens["arguments,"])
		node.Tokens["arguments)"] = this.ExpectValue(")", node.Tokens["arguments("])

		if (this.IsValue(":")) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.return_types = this.ReadMultipleValues(
				undefined,
				() => this.ReadFunctionReturnTypeExpression(),
				node.Tokens["return_types,"],
			)
		}

		node.statements = this.ReadStatements({ end: true })

		node.Tokens["end"] = this.ExpectValue("end")
	}
	ReadIdentifier(expect_type?: boolean) {
		if (!this.IsType("letter") && !this.IsValue("...")) return
		let node = this.StartNode("expression", "value")

		if (this.IsValue("...")) {
			node.value = this.ExpectValue("...")
		} else {
			node.value = this.ExpectType("letter")
		}

		if (this.IsValue(":") || expect_type) {
			node.Tokens[":"] = this.ExpectValue(":")
			node.type_expression = this.ExpectTypeExpression(0)
		}

		return this.EndNode(node)
	}

	ReadIndexExpression() {
		let node = this.StartNode("expression", "value") as BinaryOperatorExpression | ValueExpression
        if (node.Kind == "value") {
            node.value = this.ExpectType("letter")
        }
		this.EndNode(node)

		let first = node
			
		while (this.IsValue(".") || this.IsValue(":")) {
			
			let left = node
			let self_call = this.IsValue(":")
			
			let dotbinary = this.StartNode("expression", "binary_operator")
			dotbinary.operator = this.ReadToken()!

			let value = this.StartNode("expression", "value")
			value.value = this.ExpectType("letter")
			value.self_call = self_call // TODO
            this.EndNode(value)

            dotbinary.right = value
			this.EndNode(node)

			dotbinary.left = left
            node = dotbinary
		
		}

		first.standalone_letter = node

		return node
	}

	ReadAnalyzerFunctionStatement() {
		if (!(this.IsValue("analyzer") && this.IsValue("function", 1))) return
		let node = this.StartNode("statement", "analyzer_function")
		node.Tokens["analyzer"] = this.ExpectValue("analyzer")
		node.Tokens["function"] = this.ExpectValue("function")
		node.index_expression = this.ReadIndexExpression() // todo: read function index expression

		this.ReadAnalyzerFunctionBody(node)
		return this.EndNode(node)
	}

	ReadAnalyzerFunctionExpression() {
		if (!(this.IsValue("analyzer") && this.IsValue("function", 1))) return
		let node = this.StartNode("expression", "analyzer_function")
		node.Tokens["analyzer"] = this.ExpectValue("analyzer")
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadAnalyzerFunctionBody(node)
		return this.EndNode(node)
	}

	ReadFunctionExpression() {
		if (!this.IsValue("function")) return
		let node = this.StartNode("expression", "function")
		node.Tokens["function"] = this.ExpectValue("function")

		this.ReadFunctionBody(node)

		return this.EndNode(node)
	}

	ReadLocalFunctionStatement() {
		if (!(this.IsValue("local") && this.IsValue("function", 1))) return undefined

		let node = this.StartNode("statement", "local_function")
		node.Tokens["local"] = this.ExpectValue("local")
		node.Tokens["function"] = this.ExpectValue("function")
		node.label = this.ExpectType("letter")
		this.ReadFunctionBody(node)
		return this.EndNode(node)
	}

	ReadFunctionStatement() {
		if (!this.IsValue("function")) return undefined

		let node = this.StartNode("statement", "function")
		node.Tokens["function"] = this.ExpectValue("function")
		node.index_expression = this.ReadIndexExpression() // todo: read function index expression
		this.ReadFunctionBody(node)
		return this.EndNode(node)
	}

	ReadLocalAnalyzerFunctionStatement() {
		if (!(this.IsValue("local") && this.IsValue("analyzer", 1) && this.IsValue("function", 2))) return undefined

		let node = this.StartNode("statement", "local_analyzer_function")
		node.Tokens["local"] = this.ExpectValue("local")
		node.Tokens["analyzer"] = this.ExpectValue("analyzer")
		node.Tokens["function"] = this.ExpectValue("function")
		node.label = this.ExpectType("letter")

		this.ReadAnalyzerFunctionBody(node)

		return this.EndNode(node)
	}

	ReadImportExpression() {
		if (!(this.IsValue("import") && !this.IsValue("(", 1))) return
		let node = this.StartNode("expression", "import")
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
		let node = this.StartNode("expression", "value")
		node.value = this.ReadToken()!
		return this.EndNode(node)
	}

	ReadTableSpread() {
		if (!(this.IsValue("...") && (this.IsType("letter", 1) || this.IsValue("{", 1) || this.IsValue("(", 1)))) return
		let node = this.StartNode("expression", "table_spread")
		node.Tokens["..."] = this.ExpectValue("...")
		node.expression = this.ExpectExpression(0)!
		return this.EndNode(node)
	}

	ReadTableEntry(i: number) {
		if (this.IsValue("[")) {
			let node = this.StartNode("expression", "table_expression_value")
			node.expression_key = true
			node.Tokens["["] = this.ExpectValue("[")
			node.key_expression = this.ExpectExpression(0)!
			node.Tokens["]"] = this.ExpectValue("]")
			node.Tokens["="] = this.ExpectValue("=")
			node.value_expression = this.ExpectExpression(0)!
			return this.EndNode(node)
		} else if (this.IsType("letter") && this.IsValue("=", 1)) {
			let node = this.StartNode("expression", "table_key_value")
			node.identifier = this.ReadToken()!
			node.Tokens["="] = this.ExpectValue("=")

			let spread = this.ReadTableSpread()

			if (spread) {
				node.spread = spread
			} else {
				node.value_expression = this.ExpectExpression(0)!
			}

			return this.EndNode(node)
		}

		let node = this.StartNode("expression", "table_index_value")

		let spread = this.ReadTableSpread()

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
		let tree = this.StartNode("expression", "table")
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

		return this.EndNode(tree)
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

	ReadPrimaryExpression() {
		return (
			this.ReadParenthesisExpression() ||
			this.ReadPrefixOperatorExpression() ||
			this.ReadAnalyzerFunctionExpression() ||
			this.ReadFunctionExpression() ||
			this.ReadImportExpression() ||
			this.ReadValueExpression() ||
			this.ReadTableExpression()
		)
	}

	ReadExpression(priority: number = 0) {
		if (this.GetPreferTypesystem()) {
			return this.ReadTypeExpression(priority)
		}

		// read primary expression
		let node

		let primary = this.ReadPrimaryExpression()

		node = primary

		if (primary) {
			let sub = this.ReadSubExpression(primary)

			if (sub) {
				if (primary.Kind == "value" && (primary.value.type == "letter" || primary.value.value == "...")) {
					primary.standalone_letter = sub
				}
			}

			node = sub
		}

		this.CheckIntegerDivision(this.GetToken()!)

		while (node) {
			let info = syntax.GetBinaryOperatorInfo(this.GetToken()!)
			if (!info || info.left_priority < priority) break

			let left_node = node
			node = this.StartNode("expression", "binary_operator")
			node.operator = this.ReadToken()!
			node.left = left_node

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

			this.EndNode(node)
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

		let node = this.StartNode("statement", "return")
		node.Tokens[","] = []
		node.Tokens["return"] = this.ExpectValue("return")
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens[","]) // TODO: avoid creating closure

		return this.EndNode(node)
	}

	ReadTypeExpression(priority: number = 0): ExpressionNode | undefined {
		return undefined
	}

	ExpectTypeExpression(priority: number = 0): ExpressionNode {

        // TODO: these are just mocks

        if (this.IsValue("any")) {
            let node = this.StartNode("expression", "value")
            node.value = this.ExpectType("letter")
            return this.EndNode(node)
        }

        if (this.IsValue("...")) {
            let tk = this.ReadToken()!
            let node = this.StartNode("expression", "value")
            node.value = this.ExpectType("letter")
            node.value.value = " " + tk.value + node.value.value
            return this.EndNode(node)
        }

        // TODO: ^

		return {} as ExpressionNode
	}

	ReadBreakStatement() {
		if (!this.IsValue("break")) return undefined

		let node = this.StartNode("statement", "break")
		node.Tokens["break"] = this.ExpectValue("break")
		return this.EndNode(node)
	}

	ReadContinueStatement() {
		if (!this.IsValue("continue")) return undefined

		let node = this.StartNode("statement", "continue")
		node.Tokens["continue"] = this.ExpectValue("continue")
		return this.EndNode(node)
	}
	ReadSemicolonStatement() {
		if (!this.IsValue(";")) return undefined

		let node = this.StartNode("statement", "semicolon")
		node.Tokens[";"] = this.ExpectValue(";")
		return this.EndNode(node)
	}
	ReadGotoStatement() {
		if (!this.IsValue("goto") || !this.IsType("letter", 1)) return undefined

		let node = this.StartNode("statement", "goto")
		node.Tokens["goto"] = this.ExpectValue("goto")
		node.identifier = this.ExpectType("letter")

		return this.EndNode(node)
	}

	ReadGotoLabelStatement() {
		if (!this.IsValue("::")) return undefined

		let node = this.StartNode("statement", "goto_label")

		node.Tokens["::left"] = this.ExpectValue("::")
		node.identifier = this.ExpectType("letter")
		node.Tokens["::right"] = this.ExpectValue("::")

		return this.EndNode(node)
	}

	ReadRepeatStatement() {
		if (!this.IsValue("repeat")) return undefined

		let node = this.StartNode("statement", "repeat")
		node.Tokens["repeat"] = this.ExpectValue("repeat")
		node.statements = this.ReadStatements({ until: true })
		node.Tokens["until"] = this.ExpectValue("until")
		node.expression = this.ExpectExpression()!
		return this.EndNode(node)
	}

	ReadLocalAssignmentStatement() {
		if (!this.IsValue("local") || !this.IsType("letter", 1)) return undefined

		let node = this.StartNode("statement", "local_assignment")
		node.Tokens["left,"] = []
		node.Tokens["right,"] = []

		node.Tokens["local"] = this.ExpectValue("local")

		node.identifiers = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens["left,"])

		if (this.IsValue("=")) {
			node.Tokens["="] = this.ExpectValue("=")
		}
		node.expressions = this.ReadMultipleValues(undefined, () => this.ReadExpression(0), node.Tokens["right,"])

		return this.EndNode(node)
	}
	ReadDoStatement() {
		if (!this.IsValue("do")) return undefined

		let node = this.StartNode("statement", "do")
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return this.EndNode(node)
	}
	ReadIfStatement() {
		if (!this.IsValue("if")) return undefined

		let node = this.StartNode("statement", "if")
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

		return this.EndNode(node)
	}

	ReadWhileStatement() {
		if (!this.IsValue("while")) return undefined

		let node = this.StartNode("statement", "while")
		node.Tokens["while"] = this.ExpectValue("while")
		node.expression = this.ExpectExpression(0)!
		node.Tokens["do"] = this.ExpectValue("do")
		node.statements = this.ReadStatements({ end: true })
		node.Tokens["end"] = this.ExpectValue("end")
		return this.EndNode(node)
	}

	ReadNumericForStatement() {
		if (!this.IsValue("for") || !this.IsValue("=", 2)) return undefined

		let node = this.StartNode("statement", "numeric_for")
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

		let node = this.StartNode("statement", "generic_for")
		node.Tokens["left,"] = []
		node.Tokens["right,"] = []

		node.Tokens["for"] = this.ExpectValue("for")
		node.identifiers = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens["left,"])
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

		let node = this.StartNode("statement", "destructure_assignment")
		node.Tokens[","] = []

		if (this.IsType("letter")) {
			let val = this.StartNode("expression", "value")
			val.value = this.ReadToken()!
			node.default = this.EndNode(val)
			node.default_comma = this.ExpectValue(",")
		}

		node.Tokens["{"] = this.ExpectValue("{")
		node.left = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens[","])
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

		let node = this.StartNode("statement", "local_destructure_assignment")
		node.Tokens[","] = []
		node.Tokens["local"] = this.ExpectValue("local")

		if (this.IsType("letter")) {
			let val = this.StartNode("expression", "value")
			val.value = this.ReadToken()!
			node.default = this.EndNode(val)
			node.default_comma = this.ExpectValue(",")
		}

		node.Tokens["{"] = this.ExpectValue("{")
		node.left = this.ReadMultipleValues(undefined, () => this.ReadIdentifier(), node.Tokens[","])
		node.Tokens["}"] = this.ExpectValue("}")
		node.Tokens["="] = this.ExpectValue("=")
		node.right = this.ReadExpression(0)!

		return this.EndNode(node)
	}
	ReadCallOrAssignmentStatement() {
		let start = this.GetToken()
		let left_commas: Token[] = []
		let left = this.ReadMultipleValues(Infinity, () => this.ReadExpression(0), left_commas)

		if (this.IsValue("=")) {
			let node = this.StartNode("statement", "assignment")
			node.Tokens["="] = this.ExpectValue("=")
			node.left = left
			node.Tokens["right,"] = []
			node.right = this.ReadMultipleValues(Infinity, () => this.ReadExpression(0), node.Tokens["right,"])
			node.Tokens["left,"] = left_commas
			return this.EndNode(node)
		}

		if (left[0] && (left[0].Kind == "postfix_call" || left[0].Kind == "import") && !left[1]) {
			let node = this.StartNode("statement", "call_expression")
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
	ReadLocalTypeFunctionStatement() {}

	ReadTypeAssignmentStatement() {}

	ReadLocalTypeAssignmentStatement() {}

	override ReadStatement() {
		if (this.IsType("end_of_file")) return

		return (
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
