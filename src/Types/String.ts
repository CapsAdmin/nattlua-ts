import { BaseType, TypeErrors } from "./BaseType.ts";
import { TAny } from "./Any.ts";
import { Failure, Success, Undefined } from "./BaseType.ts";

const LuaStringMatch = (str: string, pattern: string) => {
  // TODO: use lua pattern matching instead of regex
  return str.match(pattern) != null;
};

export class TString extends BaseType {
  declare Data: string | undefined;
  PatternContract: string | undefined;
  override Type = "string" as const;
  override Truthy = true;
  override Falsy = false;

  LogicalComparison(
    B: TString,
    operator: "<" | ">" | "=>" | "<=",
  ): undefined | boolean {
    const A = this;

    if (A.Data === undefined) return undefined;
    if (B.Data === undefined) return undefined;

    if (operator == ">") {
      return A.Data > B.Data;
    } else if (operator == "<") {
      return A.Data < B.Data;
    } else if (operator == "=>") {
      return A.Data >= B.Data;
    } else if (operator == "<=") {
      return A.Data <= B.Data;
    }

    return undefined;
  }

  override toString() {
    if (this.PatternContract !== undefined) {
      return "$(" + this.PatternContract + ")";
    }

    if (this.Data === undefined) {
      return this.Type;
    }

    return `"${this.Data}"`;
  }

  constructor(data?: string) {
    super(data);
  }

  override Copy() {
    const t = new TString(this.Data);

    t.PatternContract = this.PatternContract;

    return t;
  }

  override Equal(B: TString) {
    if (this.Data === undefined) return false;
    if (B.Data === undefined) return false;

    if (this.PatternContract !== undefined) {
      if (B.PatternContract !== undefined) {
        return this.PatternContract === B.PatternContract;
      }
    }

    return this.Data === B.Data;
  }

  override IsSubsetOf(B: TString | TAny) {
    const A = this;

    if (B instanceof TAny) return Success("B is any");
    if (!(B instanceof TString)) return TypeErrors.TypeMismatch(A, B);

    if (A.Data !== undefined && B.Data !== undefined && A.Data == B.Data) {
      // "A" subsetof "B"
      return Success("identical data");
    }

    if (B.PatternContract !== undefined) {
      if (A.Data === undefined) return TypeErrors.Literal(A);

      if (!LuaStringMatch(A.Data, B.PatternContract)) {
        return TypeErrors.StringPattern(A.Data, B.PatternContract);
      }
      return Success("pattern match");
    }

    if (A.PatternContract !== undefined) {
      return Failure("pattern contract");
    }

    if (A.Data !== undefined && B.Data == undefined) {
      // "A" subsetof string
      return Success("string");
    }

    if (A.Data === undefined && B.Data !== undefined) {
      // string subsetof "B"
      return Failure("string");
    }

    if (A.Data == undefined && B.Data == undefined) {
      // string subsetof string
      return Undefined("string may be a subset of string");
    }

    return Undefined("not sure");
  }
}

export const LString = (x: string | undefined) => new TString(x);

export const LStringFromString = (str: string) => {
  if (str.startsWith("[")) {
    const start = str.match(/\[=*\[(.*)\]=*\]/);
    if (start && start[1] !== undefined) {
      return new TString(start[1]);
    } else {
    }
  } else {
    return new TString(str.substr(1, str.length - 2));
  }

  throw new Error("cannot convert string: " + str);
};
