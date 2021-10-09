import { BaseEmitter } from "./BaseEmitter"
import {
	AnyParserNode,
	BinaryOperatorExpression,
	ReturnStatement,
	TableExpressionValueNode,
	TableNode,
} from "./BaseParser"

export class LuaEmitter extends BaseEmitter {
	EmitStatement(statement: AnyParserNode) {
		if (statement.Kind == "return") {
			this.EmitReturnStatement(statement)
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

	EmitExpression(expression: AnyParserNode) {
		if (expression.Kind == "value") {
			this.EmitToken(expression.value)
		} else if (expression.Kind == "binary_operator") {
			this.EmitBinaryOperator(expression)
		} else if (expression.Kind == "table") {
			this.EmitTable(expression)
		} else {
			throw new Error("Unknown expression kind: " + expression.Kind)
		}
	}
}
