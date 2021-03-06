import { syntax } from "./LuaLexer.ts";
import {
  AnyExpressionNode,
  AnyParserNode,
  BinaryOperatorExpression,
  PrimaryExpressionNode,
  ReturnStatement,
  StatementNode,
  ValueExpression,
} from "./LuaParser.ts";
import { LexicalScope } from "./Scope.ts";
import { BaseType, Types } from "./Types/BaseType.ts";
import { LNumberFromString, TNumber } from "./Types/Number.ts";
import { LStringFromString, TString } from "./Types/String.ts";
import { False, Nil, True, TSymbol } from "./Types/Symbol.ts";
export type Environment = "runtime" | "typesystem";
export class LuaAnalyzer {
  scope_stack: LexicalScope[] = [];
  scope: LexicalScope | undefined;

  AnalyzeStatements(nodes: StatementNode[]) {
    for (const node of nodes) {
      this.AnalyzeStatement(node);
    }
  }

  AnalyzeStatement(node: StatementNode) {
    if (node.Kind == "return") {
      this.AnalyzeReturnStatement(node);
    } else if (
      node.Kind == "function" ||
      node.Kind == "local_function" ||
      node.Kind == "local_type_function" ||
      node.Kind == "type_function"
    ) {
      //this.AnalyzeFunction(node);
    } else if (node.Kind == "if") {
      //this.AnalyzeIf(node);
    } else if (node.Kind == "generic_for") {
      //this.AnalyzeGenericFor(node);
    } else if (node.Kind == "numeric_for") {
      //this.AnalyzeNumericFor(node);
    } else if (
      node.Kind == "local_assignment" || node.Kind == "local_type_assignment"
    ) {
      //this.AnalyzeLocalAssignment(node);
    } else if (
      node.Kind == "local_destructure_assignment" ||
      node.Kind == "destructure_assignment"
    ) {
      //this.AnalyzeDestructureAssignment(node);
    } else if (node.Kind == "call_expression") {
      //this.AnalyzeCallExpressionStatement(node);
    } else if (node.Kind == "assignment") {
      //this.AnalyzeAssignment(node);
    } else if (node.Kind == "parser_debug_code") {
      //this.AnalyzeParserDebugCode(node);
    } else if (node.Kind == "analyzer_debug_code") {
      //this.AnalyzeAnalyzerDebugCode(node);
    } else if (node.Kind == "do") {
      //this.AnalyzeDo(node);
    } else if (node.Kind == "break") {
      //this.AnalyzeBreak(node);
    } else if (node.Kind == "continue") {
      //this.AnalyzeContinue(node);
    } else if (node.Kind == "semicolon") {
      //this.AnalyzeSemicolon(node);
    } else if (node.Kind == "goto") {
      //this.AnalyzeGoto(node);
    } else if (node.Kind == "goto_label") {
      //this.AnalyzeGotoLabel(node);
    } else if (node.Kind == "while") {
      //this.AnalyzeWhile(node);
    } else if (node.Kind == "repeat") {
      //this.AnalyzeRepeat(node);
    } else if (
      node.Kind == "analyzer_function" || node.Kind == "local_analyzer_function"
    ) {
      //this.AnalyzeFunction(node);
    } else if (node.Kind == "type_assignment") {
      //this.AnalyzeTypeAssignment(node);
    } else if (node.Kind == "end_of_file") {
    } else {
      const _shouldNeverHappen: never = node;
      throw new Error("Unknown statement kind: " + (node as any).Kind);
    }
  }

  returns: BaseType[][] = [];

  Return(node: AnyParserNode, types: Types[]) {
    this.returns.push(types);
  }

  AnalyzeReturnStatement(node: ReturnStatement) {
    const ret = this.AnalyzeExpressions(node.expressions, "runtime");
    if (ret) {
      this.Return(node, ret);
    }
  }

  AnalyzeExpressions(nodes: AnyExpressionNode[], env: Environment) {
    const out = [];
    for (const node of nodes) {
      const t = this.AnalyzeExpression(node, env);
      if (t) {
        out.push(t);
      }
    }
    return out;
  }

  BinaryOperator(
    node: BinaryOperatorExpression,
    env: Environment,
  ) {
    const left = this.AnalyzeExpression(node.left, env) as TNumber;
    const right = this.AnalyzeExpression(node.right, env) as TNumber;
    const op = node.operator.value;
    if (op === "+") {
      if (left.Data !== undefined && right.Data !== undefined) {
        return new TNumber(left.Data + right.Data).SetNode(node);
      } else {
        return new TNumber().SetNode(node);
      }
    }
  }

  AnalyzeExpression(
    node: AnyExpressionNode,
    env: Environment,
  ) {
    if (node.Kind == "value") {
      return this.AnalyzeAtomicValue(node, env);
    } else if (node.Kind == "binary_operator") {
      return this.BinaryOperator(node, env);
    }
    throw new Error("this should never be reached");
  }

  AnalyzeAtomicValue(node: ValueExpression, env: Environment) {
    const value = node.value.value;
    const type = syntax.GetTokenType(node.value);

    if (type == "keyword") {
      if (value == "nil") {
        return Nil().SetNode(node);
      } else if (value == "true") {
        return True().SetNode(node);
      } else if (value == "false") {
        return False().SetNode(node);
      }
    }

    if (type == "number") {
      return LNumberFromString(value).SetNode(node);
    } else if (type == "string") {
      return LStringFromString(value).SetNode(node);
    }

    /*const standalone_letter = type == "letter" && node.standalone_letter

		if (env == "typesystem" && standalone_letter && !node.force_upvalue) {
		}*/
  }

  PushScope(scope: LexicalScope) {
    this.scope_stack.push(scope);
    this.scope = scope;
  }

  PopScope() {
    this.scope_stack.pop();
    this.scope = this.scope_stack[this.scope_stack.length - 1];
  }
}
