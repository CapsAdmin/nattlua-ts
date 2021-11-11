import { AnyParserNode } from "../LuaParser.ts";
import { Upvalue } from "../Scope.ts";
import { TAny } from "./Any.ts";
import { TNumber } from "./Number.ts";
import { TString } from "./String.ts";
import { TSymbol } from "./Symbol.ts";
import { TUnion } from "./Union.ts";

export type Types = TString | TNumber | TUnion | TAny | TSymbol;

export const Success = (...args: Array<string | Types>) =>
  [true, ...args] as const;
export const Failure = (...args: Array<string | Types>) =>
  [false, ...args] as const;
export const Undefined = (...args: Array<string | Types>) =>
  [undefined, ...args] as const;
export const TypeErrors = {
  Subset: function (a: Types, b: Types, reason?: string | string[]) {
    const msg = [a, " is not a subset of ", b];

    if (reason !== undefined) {
      msg.push(" because ");
      if (typeof reason === "string") {
        msg.push(reason);
      } else {
        for (const str of reason) {
          msg.push(str);
        }
      }
    }

    return Failure(...msg);
  },
  TypeMismatch(a: Types, b: Types) {
    return Failure(a, " is not the same type as ", b);
  },
  ValueMismatch(a: Types, b: Types) {
    return Failure(a, " is not the same value as ", b);
  },
  Literal(a: Types) {
    return Failure(a, " is not a literal");
  },
  StringPattern(a: string, pattern: string) {
    return Failure(a, " does not match the pattern " + pattern);
  },
  MissingType(a: Types, b: Types, reason: string) {
    return Failure(a, " is missing type ", b, " because ", reason);
  },
  Other(...error: Array<string | Types>) {
    return Failure(...error);
  },
};

export class BaseType {
  Data: unknown;
  Type = "unknown";
  Truthy = false;
  Falsy = false;
  Node: AnyParserNode | undefined;
  upvalue: Upvalue | undefined;
  toString() {
    return "unknown";
  }

  IsLiteral() {
    return this.Data !== undefined;
  }

  Equal(other: unknown): boolean {
    return false;
  }

  CanBeNil() {
    return false;
  }

  IsUncertain() {
    return this.Truthy && this.Falsy;
  }

  IsSubsetOf(_T: Types) {
  }

  Copy(): BaseType {
    return this;
  }

  SetNode(node: AnyParserNode) {
    this.Node = node;
    return this;
  }

  SetUpvalue(upvalue: Upvalue) {
    this.upvalue = upvalue;
    return this;
  }

  constructor(data: unknown) {
    this.Data = data;
  }
}
