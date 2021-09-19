export type TokenWhitespaceType = "line_comment" | "multiline_comment" | "comment_escape" | "space"
export type TokenType =
	| "type_code"
	| "parser_code"
	| "letter"
	| "string"
	| "number"
	| "symbol"
	| "end_of_file"
	| "shebang"
	| "discard"
	| "unknown"
	| TokenWhitespaceType

export interface WhitespaceToken {
	type: TokenWhitespaceType
	value: string
	start: number
	stop: number
}

export class Token {
	type: TokenType
	value: string
	is_whitespace: boolean
	start: number
	stop: number
	whitespace?: Array<WhitespaceToken>

	constructor(type: TokenType, is_whitespace: boolean, start: number, stop: number) {
		this.type = type
		this.is_whitespace = is_whitespace
		this.start = start
		this.stop = stop
		this.value = ""
	}
}
