import { ParserNode } from "./BaseParser"

export type TokenWhitespaceType = "line_comment" | "multiline_comment" | "comment_escape" | "space"
export type TokenType =
	| "type_code"
	| "parser_code"
	| "letter"
	| "string"
	| "number"
	| "symbol"
	| "end_of_file" // whitespace?
	| "shebang" // whitespace?
	| "discard"
	| "unknown"
	| TokenWhitespaceType

export interface Token {
	type: TokenType
	parent?: ParserNode | undefined
	value: string
	is_whitespace: boolean
	start: number
	stop: number
	whitespace?: Array<Token>
}