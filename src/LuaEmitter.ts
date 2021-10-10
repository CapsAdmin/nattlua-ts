import { BaseEmitter } from "./BaseEmitter"
import {
	AnyParserNode,
	AssignmentStatement,
	BinaryOperatorExpression,
	CallExpressionStatement,
	DestructureAssignmentStatement,
	FunctionStatement,
	GenericFor,
	IfStatement,
	LocalAssignmentStatement,
	LocalDestructureAssignmentStatement,
	LocalFunctionStatement,
	NumericFor,
	PostfixCallExpressionNode,
	ReturnStatement,
	TableNode,
} from "./LuaParser"

export class LuaEmitter extends BaseEmitter {
	EmitStatement(statement: AnyParserNode) {
		if (statement.Type == "expression") {
			throw new Error("Attempting to emit expression node")
		}

		if (statement.Kind == "return") {
			this.EmitReturnStatement(statement)
		} else if (statement.Kind == "function") {
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
		} else {
			throw new Error("Unknown statement kind: " + statement.Kind)
		}
	}

	EmitCallExpressionStatement(statement: CallExpressionStatement) {
		this.EmitExpression(statement.expression)
	}

	EmitAssignment(statement: AssignmentStatement) {
		this.EmitExpressionList(statement.left)
		this.EmitToken(statement.Tokens["="])
		this.EmitExpressionList(statement.right)
	}

	EmitDestructureAssignment(statement: LocalDestructureAssignmentStatement | DestructureAssignmentStatement) {
		//this.EmitToken(statement.Tokens["local"])
		//this.EmitToken(statement.Tokens["="])
		//this.EmitExpression(statement.expression)
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
		for (let identifier of node.identifiers) {
			this.EmitExpression(identifier)
			if (identifier.Tokens[","]) {
				this.EmitToken(identifier.Tokens[","])
			}
		}

		if (node.Tokens["="]) {
			this.EmitToken(node.Tokens["="])
		}

		for (let expression of node.expressions) {
			this.EmitExpression(expression)
			if (expression.Tokens[","]) {
				this.EmitToken(expression.Tokens[","])
			}
		}
	}

	EmitGenericFor(statement: GenericFor) {
		this.EmitToken(statement.Tokens["for"])
		this.EmitExpressionList(statement.identifiers)
		this.EmitToken(statement.Tokens["in"])
		this.EmitExpressionList(statement.expressions)
		this.EmitToken(statement.Tokens["do"])
		this.EmitStatements(statement.statements)
		this.EmitToken(statement.Tokens["end"])
	}

	EmitNumericFor(statement: NumericFor) {
		this.EmitToken(statement.Tokens["for"])
		this.EmitToken(statement.identifier)
		this.EmitToken(statement.Tokens["="])
		this.EmitExpression(statement.init_expression)
		this.EmitToken(statement.Tokens[",2"][0]!)
		this.EmitExpression(statement.max_expression)
		if (statement.Tokens[",2"][1] && statement.step_expression) {
			this.EmitToken(statement.Tokens[",2"][1])
			this.EmitExpression(statement.step_expression)
		}
		this.EmitToken(statement.Tokens["do"])
		this.EmitStatements(statement.statements)
		this.EmitToken(statement.Tokens["end"])
	}

	EmitFunction(statement: FunctionStatement) {
		this.EmitToken(statement.Tokens["function"])
		this.EmitToken(statement.identifier)
		this.EmitToken(statement.Tokens["arguments("])
		this.EmitExpressionList(statement.arguments)
		this.EmitToken(statement.Tokens["arguments)"])
		this.EmitStatements(statement.statements)
		this.EmitToken(statement.Tokens["end"])
	}

	EmitLocalFunction(statement: LocalFunctionStatement) {}

	EmitStatements(statements: AnyParserNode[]) {
		for (let statement of statements) {
			this.EmitStatement(statement)
		}
	}

	EmitReturnStatement(statement: ReturnStatement) {
		this.EmitToken(statement.Tokens["return"])
		if (statement.expressions.length > 0) {
			this.Whitespace(" ")
			this.EmitExpressionList(statement.expressions)
		}
	}

	EmitExpressionList(expressions: AnyParserNode[]) {
		for (let expression of expressions) {
			this.EmitExpression(expression)
			if (expression.Tokens[","]) {
				this.EmitToken(expression.Tokens[","])
			}
		}
	}

	EmitBinaryOperator(expression: BinaryOperatorExpression) {
		this.EmitExpression(expression.left)
		this.EmitToken(expression.value)
		this.EmitExpression(expression.right)
	}
	EmitTable(tree: TableNode) {
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

	EmitCallExpression(node: PostfixCallExpressionNode) {
		this.EmitExpression(node.left)
		this.EmitToken(node.Tokens["call("])
		this.EmitExpressionList(node.expressions)
		this.EmitToken(node.Tokens["call)"])
	}

	EmitExpression(expression: AnyParserNode) {
		if (expression.Type == "statement") {
			throw new Error("Attempting to emit expression node")
		}

		if (expression.Kind == "value") {
			this.EmitToken(expression.value)
		} else if (expression.Kind == "binary_operator") {
			this.EmitBinaryOperator(expression)
		} else if (expression.Kind == "table") {
			this.EmitTable(expression)
		} else if (expression.Kind == "postfix_call") {
			this.EmitCallExpression(expression)
		} else {
			throw new Error("Unknown expression kind: " + expression.Kind)
		}
	}
}
