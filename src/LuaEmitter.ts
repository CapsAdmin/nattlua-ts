import { BaseEmitter } from "./BaseEmitter"
import {
	AnalyzerDebugCodeStatement,
	AnalyzerFunctionExpression,
	AnalyzerFunctionStatement,
	AssignmentStatement,
	BinaryOperatorExpression,
	BreakStatement,
	CallExpressionStatement,
	ContinueStatement,
	DestructureAssignmentStatement,
	DoStatement,
	ExpressionNode,
	FunctionArgumentExpression,
	FunctionExpression,
	FunctionReturnTypeExpression,
	FunctionSignatureExpression,
	FunctionStatement,
	GenericForStatement,
	GotoLabelStatement,
	GotoStatement,
	IfStatement,
	LocalAnalyzerFunctionStatement,
	LocalAssignmentStatement,
	LocalDestructureAssignmentStatement,
	LocalFunctionStatement,
	NumericForStatement,
	ParserDebugCodeStatement,
	PostfixCallExpression,
	PostfixIndexExpression,
	PostfixOperatorExpression,
	PrefixOperatorExpression,
	RepeatStatement,
	ReturnStatement,
	SemicolonStatement,
	StatementNode,
	TableExpression,
	TypeAssignmentStatement,
	TypeVarargExpression,
	WhileStatement,
} from "./LuaParser"
import { Token } from "./Token"

export class LuaEmitter extends BaseEmitter {
	EmitStatement(node: StatementNode) {
		if (node.Kind == "return") {
			this.EmitReturnStatement(node)
		} else if (node.Kind == "function") {
			this.EmitFunction(node)
		} else if (node.Kind == "analyzer_function") {
			this.EmitAnalyzerFunction(node)
		} else if (node.Kind == "local_function") {
			this.EmitFunction(node)
		} else if (node.Kind == "if") {
			this.EmitIf(node)
		} else if (node.Kind == "generic_for") {
			this.EmitGenericFor(node)
		} else if (node.Kind == "numeric_for") {
			this.EmitNumericFor(node)
		} else if (node.Kind == "local_assignment") {
			this.EmitLocalAssignment(node)
		} else if (node.Kind == "local_destructure_assignment" || node.Kind == "destructure_assignment") {
			this.EmitDestructureAssignment(node)
		} else if (node.Kind == "call_expression") {
			this.EmitCallExpressionStatement(node)
		} else if (node.Kind == "assignment") {
			this.EmitAssignment(node)
		} else if (node.Kind == "parser_debug_code") {
			this.EmitParserDebugCode(node)
		} else if (node.Kind == "analyzer_debug_code") {
			this.EmitAnalyzerDebugCode(node)
		} else if (node.Kind == "do") {
			this.EmitDo(node)
		} else if (node.Kind == "break") {
			this.EmitBreak(node)
		} else if (node.Kind == "continue") {
			this.EmitContinue(node)
		} else if (node.Kind == "semicolon") {
			this.EmitSemicolon(node)
		} else if (node.Kind == "goto") {
			this.EmitGoto(node)
		} else if (node.Kind == "goto_label") {
			this.EmitGotoLabel(node)
		} else if (node.Kind == "while") {
			this.EmitWhile(node)
		} else if (node.Kind == "repeat") {
            this.EmitRepeat(node)
		} else if (node.Kind == "analyzer_function" || node.Kind == "local_analyzer_function") {
            this.EmitAnalyzerFunction(node)
		} else if (node.Kind == "type_assignment") {
            this.EmitTypeAssignment(node)
		} else {
			throw new Error("Unknown statement kind: " + node.Kind)
		}
	}
    
    EmitTypeAssignment(node: TypeAssignmentStatement) {
		this.EmitToken(node.Tokens["type"])
        this.EmitExpressionList(node.left, node.Tokens["left,"])
		this.EmitToken(node.Tokens["="])
		this.EmitExpressionList(node.right, node.Tokens["right,"])
    }

	EmitBreak(node: BreakStatement) {
		this.EmitToken(node.Tokens["break"])
	}
	EmitRepeat(node: RepeatStatement) {
		this.EmitToken(node.Tokens["repeat"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["until"])
		this.EmitExpression(node.expression)
	}
	EmitContinue(node: ContinueStatement) {
		this.EmitToken(node.Tokens["continue"])
	}
	EmitSemicolon(node: SemicolonStatement) {
		this.EmitToken(node.Tokens[";"])
	}
	EmitGoto(node: GotoStatement) {
		this.EmitToken(node.Tokens["goto"])
		this.EmitToken(node.identifier)
	}
	EmitGotoLabel(node: GotoLabelStatement) {
		this.EmitToken(node.Tokens["::left"])
		this.EmitToken(node.identifier)
		this.EmitToken(node.Tokens["::right"])
	}

	EmitDo(node: DoStatement) {
		this.EmitToken(node.Tokens["do"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["end"])
	}

	EmitWhile(node: WhileStatement) {
		this.EmitToken(node.Tokens["while"])
		this.EmitExpression(node.expression)
		this.EmitToken(node.Tokens["do"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["end"])
	}

	EmitParserDebugCode(node: ParserDebugCodeStatement) {
		this.EmitToken(node.Tokens["£"])
		this.EmitExpression(node.lua_code)
	}

	EmitAnalyzerDebugCode(node: AnalyzerDebugCodeStatement) {
		this.EmitToken(node.Tokens["§"])
		this.EmitExpression(node.lua_code)
	}

	EmitCallExpressionStatement(node: CallExpressionStatement) {
		this.EmitExpression(node.expression)
	}

	EmitAssignment(node: AssignmentStatement) {
		this.EmitExpressionList(node.left, node.Tokens["left,"])
		this.EmitToken(node.Tokens["="])
		this.EmitExpressionList(node.right, node.Tokens["right,"])
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

	EmitFunctionArgument(node: FunctionArgumentExpression) {
		if (node.identifier) {
			this.EmitToken(node.identifier)
		}

		if (node.Tokens[":"]) {
			this.EmitToken(node.Tokens[":"])
		}

        if (node.type_expression) {
            this.EmitExpression(node.type_expression)
        }
	}

    EmitFunctionReturnType(node: FunctionReturnTypeExpression) {
        this.EmitExpression(node.type_expression)
    }

	EmitFunction(node: FunctionStatement | LocalFunctionStatement | FunctionExpression) {
		if (node.Kind == "local_function") {
			this.EmitToken(node.Tokens["local"])
		}

		this.EmitToken(node.Tokens["function"])

		if (node.Type == "statement") {
			if (node.Kind == "local_function") {
				this.EmitToken(node.label)
			} else {
				this.EmitExpression(node.index_expression)
			}
		}

		this.EmitToken(node.Tokens["arguments("])
		this.EmitExpressionList(node.arguments, node.Tokens["arguments,"])
		this.EmitToken(node.Tokens["arguments)"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["end"])
	}

	EmitAnalyzerFunction(
		node: LocalAnalyzerFunctionStatement | AnalyzerFunctionStatement | AnalyzerFunctionExpression,
	) {
		if (node.Kind == "local_analyzer_function") {
			this.EmitToken(node.Tokens["local"])
		}

		this.EmitToken(node.Tokens["analyzer"])
		this.EmitToken(node.Tokens["function"])

		if (node.Type == "statement") {
			if (node.Kind == "local_analyzer_function") {
				this.EmitToken(node.label)
			} else {
				this.EmitExpression(node.index_expression)
			}
		}

		this.EmitToken(node.Tokens["arguments("])
		this.EmitExpressionList(node.arguments, node.Tokens["arguments,"])
		this.EmitToken(node.Tokens["arguments)"])
		this.EmitStatements(node.statements)
		this.EmitToken(node.Tokens["end"])
	}

    EmitFunctionSignature(node: FunctionSignatureExpression) {
        // check("function=(a, b, c)>boolean")

        this.EmitToken(node.Tokens["function"])
        this.EmitToken(node.Tokens["="])
        this.EmitToken(node.Tokens["arguments("])
        this.EmitExpressionList(node.identifiers, node.Tokens["arguments,"])
        this.EmitToken(node.Tokens["arguments)"])
        this.EmitToken(node.Tokens[">"])
        this.EmitToken(node.Tokens["return("])
        this.EmitExpressionList(node.return_types, node.Tokens["return,"])
        this.EmitToken(node.Tokens["return)"])
    }

	EmitLocalFunction(node: LocalFunctionStatement) {}

	EmitStatements(nodes: StatementNode[]) {
		for (let node of nodes) {
			this.EmitStatement(node)
		}
	}

	EmitReturnStatement(node: ReturnStatement) {
		this.EmitToken(node.Tokens["return"])
		if (node.expressions.length > 0) {
			this.Whitespace(" ")
			this.EmitExpressionList(node.expressions, node.Tokens[","])
		}
	}

	EmitExpressionList(nodes: ExpressionNode[], separator: Token[]) {
		let i = 0
		for (let node of nodes) {
			this.EmitExpression(node)
			if (separator[i]) {
				this.EmitToken(separator[i]!)
			}
			i++
		}
	}

	EmitBinaryOperator(node: BinaryOperatorExpression) {
		this.EmitExpression(node.left)
		this.EmitToken(node.operator)
		this.EmitExpression(node.right)
	}
	EmitPrefixOperator(node: PrefixOperatorExpression) {
		this.EmitToken(node.operator)
		this.EmitExpression(node.right)
	}

	EmitPostfixOperator(node: PostfixOperatorExpression) {
		this.EmitExpression(node.left)
		this.EmitToken(node.operator)
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

	EmitTypeVararg(node: TypeVarargExpression) {
		this.EmitToken(node.Tokens["..."])
		this.EmitExpression(node.expression)
	}

	EmitExpression(node: ExpressionNode) {
		if (node.Tokens["("]) {
			for (let token of node.Tokens["("]) {
				this.EmitToken(token)
			}
		}

		if (node.Kind == "value") {
			this.EmitToken(node.value)
		} else if (node.Kind == "binary_operator") {
			this.EmitBinaryOperator(node)
		} else if (node.Kind == "prefix_operator") {
			this.EmitPrefixOperator(node)
		} else if (node.Kind == "postfix_operator") {
			this.EmitPostfixOperator(node)
		} else if (node.Kind == "table") {
			this.EmitTable(node)
		} else if (node.Kind == "postfix_call") {
			this.EmitCallExpression(node)
		} else if (node.Kind == "postfix_expression_index") {
			this.EmitPostfixExpressionIndex(node)
		} else if (node.Kind == "function") {
			this.EmitFunction(node)
		} else if (node.Kind == "analyzer_function") {
			this.EmitAnalyzerFunction(node)
		} else if (node.Kind == "function_argument") {
			this.EmitFunctionArgument(node)
        } else if (node.Kind == "function_return_type") {
			this.EmitFunctionReturnType(node)
		} else if (node.Kind == "type_vararg") {
            this.EmitTypeVararg(node)
		} else if (node.Kind == "function_signature") {
            this.EmitFunctionSignature(node)
		} else {
			throw new Error("Unknown expression kind: " + node.Kind)
		}

		if (node.Tokens[")"]) {
			for (let token of node.Tokens[")"]) {
				this.EmitToken(token)
			}
		}
	}
}
