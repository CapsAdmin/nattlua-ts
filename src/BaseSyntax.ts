import { BaseLexer } from "./BaseLexer.ts";
import { LuaLexer } from "./LuaLexer.ts";
import { Token } from "./Token.ts";

const B = (str: string) => str.charCodeAt(0);
export abstract class BaseSyntax {
  abstract SymbolCharacters: string[];
  abstract NumberAnnotations: string[];
  abstract Keywords: string[];
  abstract NonStandardKeywords: string[];
  abstract KeywordValues: string[];
  abstract PrefixOperators: string[];
  abstract PostfixOperators: string[];
  abstract PrimaryBinaryOperators: string[];
  abstract BinaryOperators: string[][];
  abstract BinaryOperatorFunctionTranslate: { [key: string]: string };
  abstract PrefixOperatorFunctionTranslate: { [key: string]: string };
  abstract PostfixOperatorFunctionTranslate: { [key: string]: string };

  IsLetter(c: number) {
    return (c >= B("a") && c <= B("z")) || (c >= B("A") && c <= B("Z")) ||
      c == B("_") || c == B("@") || c >= 127;
  }

  IsDuringLetter(c: number) {
    return (
      (c >= B("a") && c <= B("z")) ||
      (c >= B("0") && c <= B("9")) ||
      (c >= B("A") && c <= B("Z")) ||
      c == B("_") ||
      c == B("@") ||
      c >= 127
    );
  }

  IsNumber(c: number) {
    return c >= B("0") && c <= B("9");
  }

  IsSpace(c: number) {
    return c > 0 && c <= 32;
  }

  IsSymbol(c: number) {
    return (
      c != B("_") &&
      ((c >= B("!") && c <= B("/")) ||
        (c >= B(":") && c <= B("?")) ||
        (c >= B("[") && c <= B("`")) ||
        (c >= B("{") && c <= B("~")))
    );
  }

  private hex_map = new Set<number>();

  IsValidHex(byte: number) {
    return this.hex_map.has(byte);
  }

  symbols: string[] = [];
  lookup: { [key: string]: string[] } = {};
  binary_operator_info: {
    [key: string]: { left_priority: number; right_priority: number };
  } = {};

  PrimaryBinaryOperatorsLookup = new Set<string>();
  PrefixOperatorsLookup = new Set<string>();
  PostfixOperatorsLookup = new Set<string>();
  KeywordValuesLookup = new Set<string>();
  NonStandardKeywordLookup = new Set<string>();
  KeywordLookup = new Set<string>();

  IsPrimaryBinaryOperator(token: Token) {
    return this.PrimaryBinaryOperatorsLookup.has(token.value);
  }

  IsPrefixOperator(token: Token) {
    return this.PrefixOperatorsLookup.has(token.value);
  }

  IsPostfixOperator(token: Token) {
    return this.PostfixOperatorsLookup.has(token.value);
  }

  IsKeyword(token: Token) {
    return this.KeywordLookup.has(token.value);
  }

  IsKeywordValue(token: Token) {
    return this.KeywordValuesLookup.has(token.value);
  }

  IsNonStandardKeyword(token: Token) {
    return this.NonStandardKeywordLookup.has(token.value);
  }

  GetSymbols() {
    return this.symbols;
  }
  GetFunctionForBinaryOperator(token: Token) {
    return this.lookup[token.value];
  }
  GetFunctionForPrefixOperator(token: Token) {
    return this.lookup[token.value];
  }

  GetFunctionForPostfixOperator(token: Token) {
    return this.lookup[token.value];
  }
  GetBinaryOperatorInfo(tk: Token) {
    return this.binary_operator_info[tk.value];
  }

  IsTokenValue(token: Token) {
    if (token.type == "number" || token.type == "string") return true;
    if (this.IsKeywordValue(token)) return true;
    if (this.IsKeyword(token)) return false;
    if (token.type == "letter") return true;
    return false;
  }

  GetTokenType(token: Token) {
    if (token.type == "letter" && this.IsKeyword(token)) {
      return "keyword";
    } else if (token.type == "symbol") {
      if (this.IsPrefixOperator(token)) {
        return "operator_prefix";
      } else if (this.IsPostfixOperator(token)) {
        return "operator_postfix";
      } else if (this.GetBinaryOperatorInfo(token)) {
        return "operator_binary";
      }
    }

    return token.type;
  }

  Build() {
    const add_symbols = (tbl: typeof this.SymbolCharacters) => {
      for (const symbol of tbl) {
        if (/[^\p{L}\d\s@#]/u.test(symbol)) {
          this.symbols.push(symbol);
        }
      }
    };

    // extend the symbol characters from grammar rules
    {
      const add_binary_symbols = (tbl: typeof this.BinaryOperators) => {
        for (const group of tbl) {
          for (let token of group) {
            if (token.substr(0, 1) == "R") {
              token = token.substr(1);
            }
            this.symbols.push(token);
          }
        }
      };

      add_binary_symbols(this.BinaryOperators);
      add_symbols(this.Keywords);
      add_symbols(this.KeywordValues);
      add_symbols(this.PrefixOperators);
      add_symbols(this.PostfixOperators);
      add_symbols(this.PrimaryBinaryOperators);

      for (const str of this.SymbolCharacters) {
        this.symbols.push(str);
      }

      this.symbols.sort((a, b) => b.length - a.length);
    }

    {
      for (
        const [k, v] of Object.entries(this.BinaryOperatorFunctionTranslate)
      ) {
        const [, a, b, c] = Array.from(
          v.match(/(.*)A(.*)B(.*)/)?.values() || [],
        );
        if (a !== undefined && b !== undefined && c !== undefined) {
          this.lookup[k] = [" " + a, b, c + " "];
        }
      }

      for (
        const [k, v] of Object.entries(this.PrefixOperatorFunctionTranslate)
      ) {
        const [, a, b] = Array.from(v.match(/(.*)A(.*)B/)?.values() || []);
        if (a !== undefined && b !== undefined) {
          this.lookup[k] = [" " + a, b + " "];
        }
      }

      for (
        const [k, v] of Object.entries(this.PostfixOperatorFunctionTranslate)
      ) {
        const [, a, b] = Array.from(v.match(/(.*)A(.*)/)?.values() || []);
        if (a !== undefined && b !== undefined) {
          this.lookup[k] = [" " + a, b + " "];
        }
      }

      for (const [priority, group] of this.BinaryOperators.entries()) {
        for (const token of group) {
          if (token.substr(0, 1) == "R") {
            this.binary_operator_info[token.substr(1)] = {
              left_priority: priority + 1,
              right_priority: priority,
            };
          } else {
            this.binary_operator_info[token] = {
              left_priority: priority,
              right_priority: priority,
            };
          }
        }
      }

      for (const key of this.PrimaryBinaryOperators) {
        this.PrimaryBinaryOperatorsLookup.add(key);
      }

      for (const key of this.PrefixOperators) {
        this.PrefixOperatorsLookup.add(key);
      }

      for (const key of this.PostfixOperators) {
        this.PostfixOperatorsLookup.add(key);
      }

      for (const key of this.KeywordValues) {
        this.KeywordValuesLookup.add(key);
      }

      for (const key of this.KeywordValues) {
        this.KeywordLookup.add(key);
      }

      for (const key of this.Keywords) {
        this.KeywordLookup.add(key);
      }

      for (const key of this.NonStandardKeywords) {
        this.NonStandardKeywordLookup.add(key);
      }
    }

    for (
      const char of [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
      ]
    ) {
      this.hex_map.add(char.charCodeAt(0));
    }
  }
}
