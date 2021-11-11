import { BaseLexer } from "./BaseLexer.ts";
import { LuaRuntimeSyntax } from "./LuaRuntimeSyntax.ts";
import { LuaTypesystemSyntax } from "./LuaTypesystemSyntax.ts";
import { TokenType } from "./Token.ts";

const B = (str: string) => str.charCodeAt(0);

export const syntax_typesystem = new LuaTypesystemSyntax();
syntax_typesystem.Build();

export const syntax = new LuaRuntimeSyntax();
syntax.Build();

export class LuaLexer extends BaseLexer {
  comment_escape = false;
  ReadSpace(): TokenType | false {
    if (syntax.IsSpace(this.GetCurrentByteChar())) {
      while (!this.TheEnd()) {
        this.Advance(1);
        if (!syntax.IsSpace(this.GetCurrentByteChar())) {
          break;
        }
      }
      return "space";
    }
    return false;
  }
  ReadCommentEscape(): TokenType | false {
    if (
      this.IsValue("-", 0) &&
      this.IsValue("-", 1) &&
      this.IsValue("[", 2) &&
      this.IsValue("[", 3) &&
      this.IsValue("#", 4)
    ) {
      this.Advance(5);
      this.comment_escape = true;
      return "comment_escape";
    }
    return false;
  }
  ReadRemainingCommentEscape(): TokenType | false {
    if (this.comment_escape && this.IsValue("]", 0) && this.IsValue("]", 1)) {
      this.Advance(2);
      return "comment_escape";
    }
    return false;
  }
  ReadMultilineCComment(): TokenType | false {
    if (this.IsValue("/", 0) && this.IsValue("*", 1)) {
      this.Advance(2);
      while (!this.TheEnd()) {
        if (this.IsValue("*", 0) && this.IsValue("/", 1)) {
          this.Advance(2);
          break;
        }
        this.Advance(1);
      }
      return "multiline_comment";
    }
    return false;
  }
  ReadLineCComment(): TokenType | false {
    if (this.IsValue("/", 0) && this.IsValue("/", 1)) {
      this.Advance(2);
      while (!this.TheEnd()) {
        if (this.IsCurrentValue("\n")) break;
        this.Advance(1);
      }
      return "line_comment";
    }
    return false;
  }
  ReadLineComment(): TokenType | false {
    if (this.IsValue("-", 0) && this.IsValue("-", 1)) {
      this.Advance(2);
      while (!this.TheEnd()) {
        if (this.IsCurrentValue("\n")) break;
        this.Advance(1);
      }
      return "line_comment";
    }
    return false;
  }
  ReadMultilineComment(): TokenType | false {
    if (
      this.IsValue("-", 0) &&
      this.IsValue("-", 1) &&
      this.IsValue("[", 2) &&
      (this.IsValue("[", 3) || this.IsValue("=", 3))
    ) {
      const start = this.GetPosition();
      this.Advance(3);

      while (this.IsCurrentValue("=")) {
        this.Advance(1);
      }

      if (!this.IsCurrentValue("[")) {
        this.SetPosition(start);
        return false;
      }

      this.Advance(1);

      const pos = this.FindNearest(
        "]" + "=".repeat(this.GetPosition() - start - 4) + "]",
      );
      if (pos) {
        this.SetPosition(pos);
        return "multiline_comment";
      }

      this.Error("Unclosed multiline comment", start, start + 1);
      this.SetPosition(start + 2);
    }
    return false;
  }

  ReadInlineTypeCode(): TokenType | false {
    // this is '§'
    if (this.IsByte(194, 0) && this.IsByte(167, 1)) {
      this.Advance(1);

      while (!this.TheEnd()) {
        if (this.IsCurrentValue("\n")) break;
        this.Advance(1);
      }
      return "analyzer_debug_code";
    }
    return false;
  }
  ReadInlineParserCode(): TokenType | false {
    // this is '£'
    if (this.IsByte(194, 0) && this.IsByte(163, 1)) {
      this.Advance(1);

      while (!this.TheEnd()) {
        if (this.IsCurrentValue("\n")) break;
        this.Advance(1);
      }
      return "parser_debug_code";
    }
    return false;
  }

  private ReadNumberPowExponent(what: "pow" | "exponent") {
    this.Advance(1);

    if (this.IsCurrentValue("+") || this.IsCurrentValue("-")) {
      this.Advance(1);

      if (!syntax.IsNumber(this.GetCurrentByteChar())) {
        this.Error(
          "malformed " + what + " expected number, got " +
            this.GetCurrentByteChar().toString(),
          this.GetPosition() - 2,
        );
      }
    }

    while (!this.TheEnd()) {
      if (!syntax.IsNumber(this.GetCurrentByteChar())) break;
      this.Advance(1);
    }

    return true;
  }
  private ReadNumberAnnotations(what: "hex" | "decimal" | "binary") {
    if (what == "hex") {
      if (this.IsCurrentValue("p") || this.IsCurrentValue("P")) {
        return this.ReadNumberPowExponent("pow");
      }
    } else if (what == "decimal") {
      if (this.IsCurrentValue("e") || this.IsCurrentValue("E")) {
        return this.ReadNumberPowExponent("exponent");
      }
    }
    return this.ReadFromArray(syntax.NumberAnnotations);
  }
  private ReadHexNumber() {
    this.Advance(2);
    let dot = false;

    while (!this.TheEnd()) {
      if (this.IsCurrentValue("_")) {
        this.Advance(1);
      }

      if (this.IsCurrentValue(".")) {
        if (dot) {
          this.Error("dot can only be placed once");
        }
        dot = true;
        this.Advance(1);
      }

      if (this.ReadNumberAnnotations("hex")) break;

      if (syntax.IsValidHex(this.GetCurrentByteChar())) {
        this.Advance(1);
      } else if (
        syntax.IsSpace(this.GetCurrentByteChar()) ||
        syntax.IsSymbol(this.GetCurrentByteChar())
      ) {
        break;
      } else if (this.GetCurrentByteChar() != 0) {
        this.Error(
          "malformed number " + this.GetCurrentByteChar().toString() +
            " in hex notation",
        );
      }
    }
  }

  private ReadBinaryNumber() {
    this.Advance(2);

    while (!this.TheEnd()) {
      if (this.IsCurrentValue("_")) {
        this.Advance(1);
      }

      if (this.IsCurrentValue("1") || this.IsCurrentValue("0")) {
        this.Advance(1);
      } else if (syntax.IsSpace(this.GetCurrentByteChar())) {
        break;
      } else {
        this.Error(
          "malformed number " + this.GetCurrentByteChar().toString() +
            " in binary notation",
        );
        return;
      }

      if (this.ReadNumberAnnotations("binary")) {
        break;
      }
    }
  }
  private ReadDecimalNumber() {
    let dot = false;

    while (!this.TheEnd()) {
      if (this.IsCurrentValue("_")) {
        this.Advance(1);
      }

      if (this.IsCurrentValue(".")) {
        if (this.IsValue(".", 1)) {
          return;
        }

        if (dot) {
          return;
        }

        dot = true;

        this.Advance(1);
      }
      if (this.ReadNumberAnnotations("decimal")) {
        break;
      }
      if (syntax.IsNumber(this.GetCurrentByteChar())) {
        this.Advance(1);
      } else {
        break;
      }
    }
  }

  ReadNumber(): TokenType | false {
    if (
      syntax.IsNumber(this.GetCurrentByteChar()) ||
      (this.IsCurrentValue(".") && syntax.IsNumber(this.GetByteCharOffset(1)!))
    ) {
      if (this.IsValue("x", 1) || this.IsValue("X", 1)) {
        this.ReadHexNumber();
      } else if (this.IsValue("b", 1) || this.IsValue("B", 1)) {
        this.ReadBinaryNumber();
      } else {
        this.ReadDecimalNumber();
      }

      return "number";
    }

    return false;
  }

  ReadMultilineString(): TokenType | false {
    if (
      this.IsValue("[", 0) && (this.IsValue("[", 1) || this.IsValue("=", 1))
    ) {
      const start = this.GetPosition();
      this.Advance(1);

      if (this.IsCurrentValue("=")) {
        while (!this.TheEnd()) {
          this.Advance(1);
          if (!this.IsCurrentValue("=")) break;
        }
      }

      if (!this.IsCurrentValue("[")) {
        this.Error(
          "expected multiline string " +
            this.GetString(start, this.GetPosition() - 1) +
            "[" +
            " got " +
            this.GetString(start, this.GetPosition()),
          start,
          start + 1,
        );
        return false;
      }

      this.Advance(1);

      const closing = "]" + "=".repeat(this.GetPosition() - start - 2) + "]";
      const pos = this.FindNearest(closing);

      if (pos !== undefined) {
        this.SetPosition(pos);
        return "string";
      }

      this.Error(
        "expected multiline string " + closing + " reached end of code",
        start,
        start + 1,
      );
    }

    return false;
  }

  ReadQuotedString(name: string, quote: string): TokenType | false {
    if (!this.IsCurrentValue(quote)) return false;

    const start = this.GetPosition();
    this.Advance(1);

    while (!this.TheEnd()) {
      const char = this.ReadChar();

      if (char == B("\\")) {
        const char = this.ReadChar();

        if (char == B("z") && !this.IsCurrentValue(quote)) {
          this.ReadSpace();
        }
      } else if (char == B("\n")) {
        this.Advance(-1);
        this.Error(
          "expected " + name + " quote to end",
          start,
          this.GetPosition() - 1,
        );
      } else if (char == B(quote)) {
        return "string";
      }
    }

    this.Error(
      "expected " + name + " quote to end: reached end of file",
      start,
      this.GetPosition() - 1,
    );

    return "string";
  }
  ReadSingleQuoteString() {
    return this.ReadQuotedString("single", "'");
  }

  ReadDoubleQuoteString() {
    return this.ReadQuotedString("double", '"');
  }
  ReadLetter(): TokenType | false {
    if (syntax.IsLetter(this.GetCurrentByteChar())) {
      while (!this.TheEnd()) {
        this.Advance(1);
        if (!syntax.IsDuringLetter(this.GetCurrentByteChar())) {
          break;
        }
      }
      return "letter";
    }

    return false;
  }

  ReadSymbol(): TokenType | false {
    if (this.ReadFromArray(syntax.GetSymbols())) return "symbol";
    if (this.ReadFromArray(syntax_typesystem.GetSymbols())) return "symbol";
    return false;
  }

  override Read(): [TokenType | undefined, boolean] {
    if (this.ReadRemainingCommentEscape()) return ["discard", false];

    {
      const name = this.ReadSpace() ||
        this.ReadCommentEscape() ||
        this.ReadMultilineCComment() ||
        this.ReadLineCComment() ||
        this.ReadMultilineComment() ||
        this.ReadLineComment();
      if (name) return [name, true];
    }

    {
      const name = this.ReadInlineTypeCode() ||
        this.ReadInlineParserCode() ||
        this.ReadNumber() ||
        this.ReadMultilineString() ||
        this.ReadSingleQuoteString() ||
        this.ReadDoubleQuoteString() ||
        this.ReadLetter() ||
        this.ReadSymbol();

      if (name) return [name, false];
    }

    return [undefined, false];
  }
}
