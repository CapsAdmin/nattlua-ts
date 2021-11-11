import { BaseType, TypeErrors } from "./BaseType.ts";
import { TAny } from "./Any.ts";

const operators = {
  [">"]: (a: number, b: number) => a > b,
  ["<"]: (a: number, b: number) => a < b,
  ["<="]: (a: number, b: number) => a <= b,
  [">="]: (a: number, b: number) => a >= b,
};

const compare = (
  val: number,
  min: number,
  max: number,
  operator: keyof typeof operators,
) => {
  const func = operators[operator];

  if (func(min, val) && func(max, val)) {
    return true;
  } else if (!func(min, val) && !func(max, val)) {
    return false;
  }

  return undefined;
};
export class TNumber extends BaseType {
  declare Data: number | undefined;
  override Type = "number" as const;
  override Truthy = true;
  override Falsy = false;

  Max: TNumber | undefined;

  LogicalComparison(
    B: TNumber,
    operator: keyof typeof operators,
  ): undefined | boolean {
    const A = this;

    if (A.Data === undefined || B.Data === undefined) {
      return undefined;
    }

    const a_val = A.Data;
    const b_val = B.Data;

    const a_max = A.Max?.Data;
    const b_max = B.Max?.Data;

    if (a_max !== undefined) {
      if (b_max !== undefined) {
        const res_a = compare(b_val, a_val, b_max, operator);
        if (res_a != undefined) {
          const res_b = compare(a_val, b_val, a_max, operator);
          if (res_a == res_b) return res_a;
        }
      } else {
        return compare(b_val, a_val, a_max, operator);
      }

      return undefined;
    }

    return operators[operator](a_val, b_val);
  }
  SetMax(max: TNumber) {
    if (max.Data !== undefined) {
      this.Max = max;
    } else {
      this.Data = undefined;
      this.Max = undefined;
    }

    return this;
  }

  override toString() {
    if (this.Data === undefined) {
      return "number";
    }

    let str;

    if (isNaN(this.Data)) {
      str = "nan";
    } else if (isFinite(this.Data)) {
      str = this.Data.toString();
    } else {
      str = (this.Data < 0 ? "-" : "") + "inf";
    }

    if (this.Max) {
      str += ".." + this.Max.toString();
    }

    return str;
  }

  constructor(data?: number, max?: number) {
    super(data);
    if (max !== undefined) {
      this.SetMax(new TNumber(max));
    }
  }

  override Copy() {
    return new TNumber(this.Data);
  }
  override Equal(B: TNumber) {
    if (this.Data === undefined) return false;
    if (B.Data === undefined) return false;
    if (!(B instanceof TNumber)) return false;

    return this.Data === B.Data;
  }

  override IsSubsetOf(B: TNumber | TAny) {
    const A = this;

    if (B instanceof TAny) return [true, "B is any"];

    if (A.Data !== undefined && B.Data !== undefined) {
      // compare against literals

      if (isNaN(A.Data) && isNaN(B.Data)) {
        return [true, "nan match"];
      }

      if (A.Data === B.Data) {
        return [true, "literal match"];
      }

      if (B.Max && B.Max.Data !== undefined) {
        if (A.Data >= B.Data && A.Data <= B.Max.Data) {
          return [true, "range match"];
        }
      }

      return TypeErrors.Subset(A, B);
    } else if (A.Data == undefined && B.Data == undefined) {
      // number contains number
      return [true, "number equals number"];
    } else if (A.Data !== undefined && B.Data === undefined) {
      // 42 subset of number
      return [true, "literal contains number"];
    } else if (A.Data === undefined && B.Data !== undefined) {
      // number subset of 42 ?
      return TypeErrors.Subset(A, B);
    }

    return [true, "number subset of number"];
  }
}

export const LNumber = (num: number | undefined) => new TNumber(num);

export const LNumberFromString = (str: string) => {
  const lower = str.toLowerCase();
  let num: number;

  if (lower.substr(0, 2) == "0b") {
    num = parseInt(str.substr(2), 2);
  } else if (lower.substr(0, 2) == "0x") {
    num = parseInt(str.substr(2), 16);
  } else if (lower.endsWith("ull")) {
    num = parseInt(str.substr(0, str.length - 3), 10);
  } else if (lower.endsWith("ll")) {
    num = parseInt(str.substr(0, str.length - 2), 10);
  } else if (str === "nan") {
    num = NaN;
  } else if (str === "inf") {
    num = Infinity;
  } else if (str === "-inf") {
    num = -Infinity;
  } else {
    num = parseFloat(str);
  }

  if (num == undefined || !isFinite(num)) {
    throw new Error("cannot convert number: " + str);
  }

  return new TNumber(num);
};
