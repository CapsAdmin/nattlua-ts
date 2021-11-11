import { ParserNode } from "./BaseParser.ts";

export type TokenWhitespaceType =
  | "line_comment"
  | "multiline_comment"
  | "comment_escape"
  | "space";
export type TokenType =
  | "analyzer_debug_code"
  | "parser_debug_code"
  | "letter"
  | "string"
  | "number"
  | "symbol"
  | "end_of_file" // whitespace?
  | "shebang" // whitespace?
  | "discard"
  | "unknown"
  | TokenWhitespaceType;

export interface Token {
  type: TokenType;
  parent?: ParserNode | undefined;
  value: string;
  is_whitespace: boolean;
  start: number;
  stop: number;
  whitespace?: Array<Token>;

  // :(
  integer_division_resolved?: boolean;
}
