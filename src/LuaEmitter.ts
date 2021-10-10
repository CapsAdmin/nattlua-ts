import { BaseEmitter } from "./BaseEmitter"
import {
	AnyParserNode,
	AssignmentStatement,
	BinaryOperatorExpression,
	CallExpressionStatement,
	DestructureAssignmentStatement,
	FunctionStatement,
	GenericForStatement,
	IfStatement,
	LocalAssignmentStatement,
	LocalDestructureAssignmentStatement,
	LocalFunctionStatement,
	NumericForStatement,
	PostfixCallExpression,
	PostfixIndexExpression,
	ReturnStatement,
	TableExpression,
	AnalyzerDebugCodeStatement,
	ParserDebugCodeStatement,
	ExpressionNode,
	StatementNode,
	DoStatement,
	WhileStatement,
	PostfixOperatorExpression,
	PrefixOperatorExpression,
	FunctionExpression,
	BreakStatement,
	ContinueStatement,
	SemicolonStatement,
	GotoStatement,
	GotoLabelStatement,
	RepeatStatement,
} from "./LuaParser"
import { Token } from "./Token"

export class LuaEmitter extends BaseEmitter {
	EmitStatement(statement: StatementNode) {
		if (statement.Kind == "return") {
			this.EmitReturnStatement(statement)
		} else if (statement.Kind == "function") {
			this.EmitFunction(statement)
		} else if (statement.Kind == "local_function") {
			this.EmitFunction(statement)
		} else if (statement.Kind == "if") {
			this.EmitIf(statement)
		} else if (statement.Kind == "generic_for") {
			this.EmitGenericFor(statement)
		} else if (statement.Kind == "numeric_for") {
			this.EmitNumericFor(statement)
		} else if (statement.Kind == "local_assignment") {
			this.EmitLocalAssignment(statement)
		} else if (statement.Kind == "local_destructure_assignment" || statement.Kind == "destructure_assignment") {
			this.EmitDestructureAssignment(statement)
		} else if (statement.Kind == "call_expression") {
			this.EmitCallExpressionStatement(statement)
		} else if (statement.Kind == "assignment") {
			this.EmitAssignment(statement)
		} else if (statement.Kind == "parser_debug_code") {
			this.EmitParserDebugCode(statement)
		} else if (statement.Kind == "analyzer_debug_code") {
			this.EmitAnalyzerDebugCode(statement)
		} else if (statement.Kind == "do") {
			this.EmitDo(statement)
		} else if (statement.Kind == "break") {
			this.EmitBreak(statement)
		} else if (statement.Kind == "continue") {
			this.EmitContinue(statement)
		} else if (statement.Kind == "semicolon") {
			this.EmitSemicolon(statement)
		} else if (statement.Kind == "goto") {
			this.EmitGoto(statement)
		} else if (statement.Kind == "goto_label") {
			this.EmitGotoLabel(statement)
		} else if (statement.Kind == "while") {
			this.EmitWhile(statement)
		} else if (statement.Kind == "repeat") {
			this.EmitRepeat(statement)
		} else {
			throw new Error("Unknown statement kind: " + statement.Kind)
		}
	}

	EmitBreak(statement: BreakStatement) {
		this.EmitToken(statement.Tokens["break"])
	}
	EmitRepeat(statement: RepeatStatement) {
		this.EmitToken(statement.Tokens["repeat"])
		this.EmitStatements(statement.statements)
		this.EmitToken(statement.Tokens["until"])
		this.EmitExpression(statement.expression)
	}
	EmitContinue(statement: ContinueStatement) {
		this.EmitToken(statement.Tokens["continue"])
	}
	EmitSemicolon(statement: SemicolonStatement) {
		this.EmitToken(statement.Tokens[";"])
	}
	EmitGoto(statement: GotoStatement) {
		this.EmitToken(statement.Tokens["goto"])
		this.EmitToken(statement.identifier)
	}
	EmitGotoLabel(statement: GotoLabelStatement) {
		this.EmitToken(statement.Tokens["::left"])
		this.EmitToken(statement.identifier)
		this.EmitToken(statement.Tokens["::right"])
	}

	EmitDo(statement: DoStatement) {
		this.EmitToken(statement.Tokens["do"])
		this.EmitStatements(statement.statements)
		this.EmitToken(statement.Tokens["end"])
	}

	EmitWhile(statement: WhileStatement) {
		this.EmitToken(statement.Tokens["while"])
		this.EmitExpression(statement.expression)
		this.EmitToken(statement.Tokens["do"])
		this.EmitStatements(statement.statements)
		this.EmitToken(statement.Tokens["end"])
	}

	EmitParserDebugCode(statement: ParserDebugCodeStatement) {
		this.EmitToken(statement.Tokens["£"])
		this.EmitExpression(statement.lua_code)
	}

	EmitAnalyzerDebugCode(statement: AnalyzerDebugCodeStatement) {
		this.EmitToken(statement.Tokens["§"])
		this.EmitExpression(statement.lua_code)
	}

	EmitCallExpressionStatement(statement: CallExpressionStatement) {
		this.EmitExpression(statement.expression)
	}

	EmitAssignment(statement: AssignmentStatement) {
		this.EmitExpressionList(statement.left, statement.Tokens["left,"])
		this.EmitToken(statement.Tokens["="])
		this.EmitExpressionList(statement.right, statement.Tokens["right,"])
	}

	EmitDestructureAssignment(node: LocalDestructureAssignmentStatement | DestructureAssignmentStatement) {
		this.Whitespace("\t")

		if (node.Kind == "local_destructure_assignment") {
			this.EmitToken(node.Tokens["local"])
		}

		if (node.default) {
			this.EmitToken(node.Tokens["{"], "")
			this.EmitToken(node.default.value)
			this.EmitToken(node.default_comma)
		} else {
			this.EmitToken(node.Tokens["{"], "")
		}

		this.Whitespace(" ")
		this.EmitExpressionList(node.left, node.Tokens[","])
		this.EmitToken(node.Tokens["}"], "")
		this.Whitespace(" ")
		this.EmitToken(node.Tokens["="])
		this.Whitespace(" ")
		this.EmitNonSpace("table.destructure(")
		this.EmitExpression(node.right)
		this.EmitNonSpace(",")
		this.EmitSpace(" ")
		this.EmitNonSpace("{")

		for (let i = 0; i < node.left.length; i++) {
			this.EmitNonSpace('"')
			this.Emit(node.left[i]!.value.value)
			this.EmitNonSpace('"')

			if (i < node.left.length - 1) {
				this.EmitNonSpace(",")
				this.EmitSpace(" ")
			}
		}

		this.EmitNonSpace("}")

		if (node.default) {
			this.EmitNonSpace(",")
			this.EmitSpace(" ")
			this.EmitNonSpace("true")
		}

		this.EmitNonSpace(")")
	}

	EmitIf(node: IfStatement) {
		let i = 0
		for (let statements of node.statements) {
			this.EmitToken(node.Tokens["if/else/elseif"][i]!)
			if (node.expressions[i]) {
				this.EmitExpression(node.expressions[i]!)
				this.EmitToken(node.Tokens["then"][i]!)
			}
			this.EmitStatements(statements)
			i++
		}
		this.EmitToken(node.Tokens["end"])
	}

	EmitLocalAssignment(node: LocalAssignmentStatement) {
		this.EmitToken(node.Tokens["local"])

		{
			let i = 0
			for (let identifier of node.identifiers) {
				this.EmitExpression(identifier)
				if (node.Tokens["left,"][i]) {
					this.EmitToken(node.Tokens["left,"][i]!)
				}
				i++
			}
		}

		if (node.Tokens["="]) {
			this.EmitToken(node.Tokens["="])
		}

		{
			let i = 0
			for (let expression of node.expressions) {
				this.EmitExpression(expression)
				if (node.Tokens["right,"][i]) {
					this.EmitToken(node.Tokens["right,"][i]!)
				}
				i++
			}
		}
	}

	EmitGenericFor(node: GenericForStatement) {
		this.EmitToken(node.Tokens["for"])
		this.EmitExpressionList(node.identifiers, node.Tokens["left,"])
		this.EmitToken(node.Tokens["in"])
		this.EmitExpressionList(node.expressions, node.Tokens["right,"])
		this.EmitToken(node.Tokens["do"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["end"])
	}

	EmitNumericFor(node: NumericForStatement) {
		this.EmitToken(node.Tokens["for"])
		this.EmitToken(node.identifier)
		this.EmitToken(node.Tokens["="])
		this.EmitExpression(node.init_expression)
		this.EmitToken(node.Tokens[",2"][0]!)
		this.EmitExpression(node.max_expression)
		if (node.Tokens[",2"][1] && node.step_expression) {
			this.EmitToken(node.Tokens[",2"][1])
			this.EmitExpression(node.step_expression)
		}
		this.EmitToken(node.Tokens["do"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["end"])
	}

	EmitFunction(node: FunctionStatement | LocalFunctionStatement | FunctionExpression) {
		if (node.Kind == "local_function") {
			this.EmitToken(node.Tokens["local"])
		}

		this.EmitToken(node.Tokens["function"])

		if (node.Type == "statement") {
			this.EmitToken(node.identifier)
		}

		this.EmitToken(node.Tokens["arguments("])
		this.EmitExpressionList(node.arguments, node.Tokens["arguments,"])
		this.EmitToken(node.Tokens["arguments)"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["end"])
	}

	EmitLocalFunction(node: LocalFunctionStatement) {}

	EmitStatements(statements: StatementNode[]) {
		for (let statement of statements) {
			this.EmitStatement(statement)
		}
	}

	EmitReturnStatement(node: ReturnStatement) {
		this.EmitToken(node.Tokens["return"])
		if (node.expressions.length > 0) {
			this.Whitespace(" ")
			this.EmitExpressionList(node.expressions, node.Tokens[","])
		}
	}

	EmitExpressionList(expressions: ExpressionNode[], separator: Token[]) {
		let i = 0
		for (let expression of expressions) {
			this.EmitExpression(expression)
			if (separator[i]) {
				this.EmitToken(separator[i]!)
			}
			i++
		}
	}

	EmitBinaryOperator(expression: BinaryOperatorExpression) {
		this.EmitExpression(expression.left)
		this.EmitToken(expression.operator)
		this.EmitExpression(expression.right)
	}
	EmitPrefixOperator(expression: PrefixOperatorExpression) {
		this.EmitToken(expression.operator)
		this.EmitExpression(expression.right)
	}

	EmitPostfixOperator(expression: PostfixOperatorExpression) {
		this.EmitExpression(expression.left)
		this.EmitToken(expression.operator)
	}
	EmitTable(tree: TableExpression) {
		if (tree.spread) {
			this.EmitNonSpace(" table.mergetables")
		}

		let during_spread = false
		this.EmitToken(tree.Tokens["{"])

		if (tree.children.length > 0) {
			let i = 0
			for (let node of tree.children) {
				if (node.Kind == "table_index_value") {
					if (node.spread) {
						if (during_spread) {
							this.EmitNonSpace("},")
							during_spread = false
						}

						this.EmitExpression(node.spread.expression)
					} else {
						this.EmitExpression(node.value_expression)
					}
				} else if (node.Kind == "table_key_value") {
					if (node.spread && !during_spread) {
						during_spread = true
						this.EmitNonSpace("{")
					}

					this.EmitToken(node.identifier)
					this.EmitToken(node.Tokens["="])
					this.EmitExpression(node.value_expression)
				} else if (node.Kind == "table_expression_value") {
					this.EmitToken(node.Tokens["["])
					this.EmitExpression(node.key_expression)
					this.EmitToken(node.Tokens["]"])
					this.EmitToken(node.Tokens["="])
					this.EmitExpression(node.value_expression)
				}

				if (tree.Tokens.separators[i]) {
					this.EmitToken(tree.Tokens.separators[i]!)
				}
				i++
			}
		}

		if (during_spread) {
			this.EmitNonSpace("}")
		}

		this.EmitToken(tree.Tokens["}"])
	}

	EmitCallExpression(node: PostfixCallExpression) {
		this.EmitExpression(node.left)
		if (node.Tokens["arguments("]) this.EmitToken(node.Tokens["arguments("])

		this.EmitExpressionList(node.arguments, node.Tokens[","])

		if (node.Tokens["arguments)"]) this.EmitToken(node.Tokens["arguments)"])
	}

	EmitPostfixExpressionIndex(node: PostfixIndexExpression) {
		this.EmitExpression(node.left)
		this.EmitToken(node.Tokens["["])
		this.EmitExpression(node.index)
		this.EmitToken(node.Tokens["]"])
	}

	EmitExpression(expression: ExpressionNode) {
		if (expression.Tokens["("]) {
			for (let token of expression.Tokens["("]) {
				this.EmitToken(token)
			}
		}

		if (expression.Kind == "value") {
			this.EmitToken(expression.value)
		} else if (expression.Kind == "binary_operator") {
			this.EmitBinaryOperator(expression)
		} else if (expression.Kind == "prefix_operator") {
			this.EmitPrefixOperator(expression)
		} else if (expression.Kind == "postfix_operator") {
			this.EmitPostfixOperator(expression)
		} else if (expression.Kind == "table") {
			this.EmitTable(expression)
		} else if (expression.Kind == "postfix_call") {
			this.EmitCallExpression(expression)
		} else if (expression.Kind == "postfix_expression_index") {
			this.EmitPostfixExpressionIndex(expression)
		} else if (expression.Kind == "function") {
			this.EmitFunction(expression)
		} else {
			throw new Error("Unknown expression kind: " + expression.Kind)
		}

		if (expression.Tokens[")"]) {
			for (let token of expression.Tokens[")"]) {
				this.EmitToken(token)
			}
		}
	}
}
