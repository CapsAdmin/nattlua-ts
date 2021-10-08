import { BaseEmitter } from "./BaseEmitter";
import { AnyParserNode, ReturnStatement } from "./BaseParser";

export class LuaEmitter extends BaseEmitter {
    EmitStatement(statement: AnyParserNode) {
        if (statement.Kind == "return") {
            this.EmitReturnStatement(statement);
        }
    }

    EmitReturnStatement(statement: ReturnStatement) {
        this.EmitToken(statement.Tokens["return"]);
        this.Whitespace(" ");
        this.EmitExpressionList(statement.expressions);
    }

    EmitExpressionList(expressions: AnyParserNode[]) {
        for (let expression of expressions) {
            this.EmitExpression(expression)
            if (expression.Tokens[","]) {
                this.EmitToken(expression.Tokens[","])
            }
        }
    }

    EmitExpression(expression: AnyParserNode) {
        if (expression.Kind == "value") {
            this.EmitToken(expression.value);
        } else if (expression.Kind == "binary_operator") {
            this.EmitExpression(expression.left);
            this.EmitToken(expression.value);
            this.EmitExpression(expression.right);
        }
    }
}