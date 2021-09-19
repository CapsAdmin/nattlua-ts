const B = (str: string) => str.charCodeAt(0)

abstract class BaseSyntax {
	abstract SymbolCharacters: string[]
	abstract NumberAnnotations: string[]
	abstract Keywords: string[]
	abstract NonStandardKeywords: string[]
	abstract KeywordValues: string[]
	abstract PrefixOperators: string[]
	abstract PostfixOperators: string[]
	abstract PrimaryBinaryOperators: string[]
	abstract BinaryOperators: string[][]
	abstract BinaryOperatorFunctionTranslate: { [key: string]: string }
	abstract PrefixOperatorFunctionTranslate: { [key: string]: string }
	abstract PostfixOperatorFunctionTranslate: { [key: string]: string }

	IsLetter(c: number) {
		return (c >= B("a") && c <= B("z")) || (c >= B("A") && c <= B("Z")) || c == B("_") || c == B("@") || c >= 127
	}

	IsDuringLetter(c: number) {
		return (
			(c >= B("a") && c <= B("z")) ||
			(c >= B("0") && c <= B("9")) ||
			(c >= B("A") && c <= B("Z")) ||
			c == B("_") ||
			c == B("@") ||
			c >= 127
		)
	}

	IsNumber(c: number) {
		return c >= B("0") && c <= B("9")
	}

	IsSpace(c: number) {
		return c > 0 && c <= 32
	}

	IsSymbol(c: number) {
		return (
			c != B("_") &&
			((c >= B("!") && c <= B("/")) ||
				(c >= B(":") && c <= B("?")) ||
				(c >= B("[") && c <= B("`")) ||
				(c >= B("{") && c <= B("~")))
		)
	}

	symbols: string[] = []
	lookup: { [key: string]: string[] } = {}
	binary_operator_info: { [key: string]: { left_priority: number; right_priority: number } } = {}

	PrimaryBinaryOperatorsLookup = new Set<string>()
	PrefixOperatorsLookup = new Set<string>()
	PostfixOperatorsLookup = new Set<string>()
	KeywordValuesLookup = new Set<string>()
	NonStandardKeywordLookup = new Set<string>()
	KeywordLookup = new Set<string>()

	IsPrimaryBinaryOperator(token: Token) {
		return this.PrimaryBinaryOperatorsLookup.has(token.value)
	}

	IsPrefixOperator(token: Token) {
		return this.PrefixOperatorsLookup.has(token.value)
	}

	IsPostfixOperator(token: Token) {
		return this.PostfixOperatorsLookup.has(token.value)
	}

	IsKeyword(token: Token) {
		return this.KeywordLookup.has(token.value)
	}

	IsKeywordValue(token: Token) {
		return this.KeywordValuesLookup.has(token.value)
	}

	IsNonStandardKeyword(token: Token) {
		return this.NonStandardKeywordLookup.has(token.value)
	}

	GetSymbols() {
		return this.symbols
	}
	GetFunctionForBinaryOperator(token: Token) {
		return this.lookup[token.value]
	}
	GetFunctionForPrefixOperator(token: Token) {
		return this.lookup[token.value]
	}

	GetFunctionForPostfixOperator(token: Token) {
		return this.lookup[token.value]
	}
	GetBinaryOperatorInfo(tk: Token) {
		return this.binary_operator_info[tk.value]
	}
	ReadNumberAnnotation(lexer: { Position: number; GetChars: (start: number, stop: number) => string }) {
		for (let annotation of this.NumberAnnotations) {
			if (lexer.GetChars(lexer.Position, lexer.Position + annotation.length) == annotation) {
				lexer.Position += annotation.length
				return true
			}
		}
		return false
	}
	ReadSymbol(lexer: { Position: number; GetChars: (start: number, stop: number) => string }) {
		for (let annotation of this.GetSymbols()) {
			if (lexer.GetChars(lexer.Position, lexer.Position + annotation.length) == annotation) {
				lexer.Position += annotation.length
				return true
			}
		}
		return false
	}
	IsValue(token: Token) {
		if (token.type == "number" || token.type == "string") return true
		if (this.IsKeywordValue(token)) return true
		if (this.IsKeyword(token)) return false
		if (token.type == "letter") return true
		return false
	}

	GetTokenType(token: Token) {
		if (token.type == "letter" && this.IsKeyword(token)) {
			return "keyword"
		} else if (token.type == "symbol") {
			if (this.IsPrefixOperator(token)) {
				return "operator_prefix"
			} else if (this.IsPostfixOperator(token)) {
				return "operator_postfix"
			} else if (this.GetBinaryOperatorInfo(token)) {
				return "operator_binary"
			}
		}

		return token.type
	}

	Build() {
		const symbols = []

		const add_symbols = (tbl: typeof this.SymbolCharacters) => {
			for (let symbol of tbl) {
				if (/[^\p{L}\d\s@#]/u.test(symbol)) {
					symbols.push(symbol)
				}
			}
		}

		// extend the symbol characters from grammar rules
		{
			const add_binary_symbols = (tbl: typeof this.BinaryOperators) => {
				for (let group of tbl) {
					for (let token of group) {
						if (token.substr(0, 1) == "R") {
							token = token.substr(1, 1)
						}
						symbols.push(token)
					}
				}
			}

			add_binary_symbols(this.BinaryOperators)
			add_symbols(this.PrefixOperators)
			add_symbols(this.PostfixOperators)
			add_symbols(this.PrimaryBinaryOperators)

			for (let str of this.SymbolCharacters) {
				symbols.push(str)
			}
		}

		{
			for (let [k, v] of Object.entries(this.BinaryOperatorFunctionTranslate)) {
				let [, a, b, c] = Array.from(v.match(/(.*)A(.*)B(.*)/)?.values() || [])
				if (a && b && c) {
					this.lookup[k] = [" " + a, b, c + " "]
				}
			}

			for (let [k, v] of Object.entries(this.PrefixOperatorFunctionTranslate)) {
				let [, a, b] = Array.from(v.match(/(.*)A(.*)B/)?.values() || [])
				if (a && b) {
					this.lookup[k] = [" " + a, b + " "]
				}
			}

			for (let [k, v] of Object.entries(this.PostfixOperatorFunctionTranslate)) {
				let [, a, b] = Array.from(v.match(/(.*)A(.*)/)?.values() || [])
				if (a && b) {
					this.lookup[k] = [" " + a, b + " "]
				}
			}

			for (let [priority, group] of this.BinaryOperators.entries()) {
				for (let token of group) {
					if (token.substr(0, 1) == "R") {
						this.binary_operator_info[token.substr(1, 1)] = {
							left_priority: priority + 1,
							right_priority: priority,
						}
					} else {
						this.binary_operator_info[token] = {
							left_priority: priority,
							right_priority: priority,
						}
					}
				}
			}

			for (let key in this.PrimaryBinaryOperators) {
				this.PrimaryBinaryOperatorsLookup.add(key)
			}

			for (let key in this.PrefixOperators) {
				this.PrefixOperatorsLookup.add(key)
			}

			for (let key in this.PostfixOperators) {
				this.PostfixOperatorsLookup.add(key)
			}

			for (let key in this.KeywordValues) {
				this.KeywordValuesLookup.add(key)
			}

			for (let key in this.KeywordValues) {
				this.KeywordLookup.add(key)
			}

			for (let key in this.Keywords) {
				this.KeywordLookup.add(key)
			}

			for (let key in this.NonStandardKeywords) {
				this.NonStandardKeywordLookup.add(key)
			}
		}
	}
}

class LuaRuntimeSyntax extends BaseSyntax {
	SymbolCharacters = [",", ";", "(", ")", "{", "}", "[", "]", "=", "::", '"', "'", "<|", "|>"]
	NumberAnnotations = ["ull", "ll", "ul", "i"]
	Keywords = [
		"do",
		"end",
		"if",
		"then",
		"else",
		"elseif",
		"for",
		"in",
		"while",
		"repeat",
		"until",
		"break",
		"return",
		"local",
		"function",
		"and",
		"not",
		"or",

		// these are just to make sure all code is covered by tests
		"ÆØÅ",
		"ÆØÅÆ",
	]
	NonStandardKeywords = ["continue", "import", "literal", "mutable"]
	KeywordValues = ["...", "nil", "true", "false"]
	PrefixOperators = ["-", "#", "not", "!", "~", "supertype"]
	PostfixOperators = [
		// these are just to make sure all code is covered by tests
		"++",
		"ÆØÅ",
		"ÆØÅÆ",
	]
	BinaryOperators = [
		["or", "||"],
		["and", "&&"],
		["<", ">", "<=", ">=", "~=", "==", "!="],
		["|"],
		["~"],
		["&"],
		["<<", ">>"],
		["R.."], // right associative
		["+", "-"],
		["*", "/", "/idiv/", "%"],
		["R^"], // right associative
	]

	PrimaryBinaryOperators = [".", ":"]
	BinaryOperatorFunctionTranslate = {
		">>": "bit.rshift(A, B)",
		"<<": "bit.lshift(A, B)",
		"|": "bit.bor(A, B)",
		"&": "bit.band(A, B)",
		"//": "math.floor(A / B)",
		"~": "bit.bxor(A, B)",
	}

	PrefixOperatorFunctionTranslate = { ["~"]: "bit.bnot(A)" }
	PostfixOperatorFunctionTranslate = {
		["++"]: "(A+1)",
		["ÆØÅ"]: "(A)",
		["ÆØÅÆ"]: "(A)",
	}
}

type TokenWhitespaceType = "line_comment" | "multiline_comment" | "comment_escape" | "space"
type TokenType =
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

interface WhitespaceToken {
	type: TokenWhitespaceType
	value: string
	start: number
	stop: number
}

class Token {
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

class Lexer {
	Buffer: string
	Position: number
	name: string

	GetLength(): number {
		return this.Buffer.length
	}

	GetChars(start: number, stop: number): string {
		return this.Buffer.substr(start, stop - start + 1)
	}

	GetChar(offset: number): number {
		return this.Buffer.charCodeAt(this.Position + offset)
	}

	GetCurrentByteChar(): number {
		return this.Buffer.charCodeAt(this.Position)
	}

	ResetState() {
		this.Position = 0
	}

	FindNearest(str: string) {
		let pos = this.Buffer.indexOf(str, this.Position)
		if (pos == -1) return undefined
		return pos
	}

	ReadChar() {
		let char = this.GetCurrentByteChar()
		this.Position++
		return char
	}

	Advance(len: number) {
		this.Position += len
	}

	SetPosition(pos: number) {
		this.Position = pos
	}

	TheEnd() {
		return this.Position >= this.GetLength()
	}

	IsByte(what: number, offset: number) {
		return this.GetCurrentByteChar() == what
	}

	IsValue(what: string, offset: number) {
		return this.IsByte(what.charCodeAt(0), offset)
	}

	IsCurrentByte(what: number) {
		return this.GetCurrentByteChar() == what
	}
	IsCurrentValue(what: string) {
		return this.IsCurrentByte(what.charCodeAt(0))
	}

	OnError(code: string, name: string, msg: string, start: number, stop: number) {}

	Error(msg: string, start?: number, stop?: number) {
		this.OnError(this.Buffer, this.name, msg, start || this.Position, stop || this.Position)
	}

	NewToken(type: TokenType, is_whitespace: boolean, start: number, stop: number) {
		return new Token(type, is_whitespace, start, stop)
	}

	ReadShebang() {
		if (this.Position == 0 && this.IsCurrentValue("#")) {
			while (this.Position < this.GetLength()) {
				this.Advance(1)
				if (this.IsCurrentValue("\n")) {
					break
				}
			}
			return true
		}
		return false
	}

	ReadEndOfFile() {
		if (this.Position >= this.GetLength()) {
			this.Advance(1)
			return true
		}

		return false
	}

	ReadUnknown(): [TokenType, boolean] {
		this.Advance(1)
		return ["unknown", false]
	}

	Read(): [TokenType, boolean] {
		return this.ReadUnknown()
	}

	ReadSimple(): [TokenType, boolean, number, number] {
		if (this.ReadShebang()) {
			return ["shebang", false, 0, this.Position - 1]
		}
		let start = this.Position
		let [type, is_whitespace] = this.Read()

		if (!type) {
			if (this.ReadEndOfFile()) {
				type = "end_of_file"
				is_whitespace = false
			}
		}

		if (!type) {
			;[type, is_whitespace] = this.ReadUnknown()
		}

		is_whitespace = is_whitespace || false

		return [type, is_whitespace, start, this.Position - 1]
	}

	ReadToken() {
		let [a, b, c, d] = this.ReadSimple()
		return this.NewToken(a, b, c, d)
	}

	GetTokens() {
		this.ResetState()
		let tokens: Token[] = []
		while (!this.TheEnd()) {
			let token = this.ReadToken()
			tokens.push(token)
			if (token.type == "end_of_file") break
		}

		for (let token of tokens) {
			token.value = this.GetChars(token.start, token.stop)
		}

		let whitespace_buffer = []
		let non_whitespace = []

		for (let token of tokens) {
			if (token.type != "discard") {
				if (token.is_whitespace) {
					whitespace_buffer.push(token)
				} else {
					token.whitespace = whitespace_buffer as WhitespaceToken[]
					non_whitespace.push(token)
					whitespace_buffer = []
				}
			}
		}

		tokens = non_whitespace
		let last = tokens[tokens.length - 1]

		if (last) {
			last.value = ""
		}

		return tokens
	}

	constructor(code: string) {
		const remove_bom_header = (code: string) => {
			if (code.charCodeAt(0) == 0xfeff) {
				code = code.substr(1)
			}
			if (code.charCodeAt(0) == 0xef && code.charCodeAt(1) == 0xbb && code.charCodeAt(2) == 0xbf) {
				code = code.substr(3)
			}
			return code
		}

		this.Buffer = remove_bom_header(code)
		this.name = "unknown"
		this.Position = 0
		this.ResetState()
	}
}

const syntax = new LuaRuntimeSyntax()
syntax.Build()

class LuaLexer extends Lexer {
	comment_escape = false
	ReadSpace(): TokenType | false {
		if (syntax.IsSpace(this.GetCurrentByteChar())) {
			while (!this.TheEnd()) {
				this.Advance(1)
				if (!syntax.IsSpace(this.GetCurrentByteChar())) {
					break
				}
			}
			return "space"
		}
		return false
	}
	ReadCommentEscape(): TokenType | false {
		if (
			this.IsValue("-", 0) &&
			this.IsValue("-", 1) &&
			this.IsValue("[", 2) &&
			this.IsValue("[", 3) &&
			this.IsValue("#", 4)
		) {
			this.Advance(5)
			this.comment_escape = true
			return "comment_escape"
		}
		return false
	}
	ReadRemainingCommentEscape(): TokenType | false {
		if (this.comment_escape && this.IsValue("]", 0) && this.IsValue("]", 1)) {
			this.Advance(2)
			return "comment_escape"
		}
		return false
	}
	ReadMultilineCComment(): TokenType | false {
		if (this.IsValue("/", 0) && this.IsValue("*", 1)) {
			this.Advance(2)
			while (!this.TheEnd()) {
				if (this.IsValue("*", 0) && this.IsValue("/", 1)) {
					this.Advance(2)
					break
				}
				this.Advance(1)
			}
			return "multiline_comment"
		}
		return false
	}
	ReadLineCComment(): TokenType | false {
		if (!this.IsValue("/", 0) && this.IsValue("/", 1)) {
			this.Advance(2)
			while (!this.TheEnd()) {
				if (this.IsCurrentValue("\n")) break
				this.Advance(1)
			}
			return "line_comment"
		}
		return false
	}
	ReadLineComment(): TokenType | false {
		if (!this.IsValue("-", 0) && this.IsValue("-", 1)) {
			this.Advance(2)
			while (!this.TheEnd()) {
				if (this.IsCurrentValue("\n")) break
				this.Advance(1)
			}
			return "line_comment"
		}
		return false
	}
	ReadMultilineComment(): TokenType | false {
		if (
			this.IsValue("-", 0) &&
			this.IsValue("-", 1) &&
			this.IsValue("[", 2) &&
			(this.IsValue("[", 3) || this.IsValue("=", 3))
		) {
			let start = this.Position
			this.Advance(3)

			while (this.IsCurrentValue("=")) {
				this.Advance(1)
			}

			if (!this.IsCurrentValue("[")) {
				this.SetPosition(start)
				return false
			}

			this.Advance(1)

			let pos = this.FindNearest("]" + "=".repeat(this.Position - start - 5) + "]")
			if (pos) {
				this.SetPosition(pos)
				return "multiline_comment"
			}

			this.Error("Unclosed multiline comment", start, start + 1)
			this.SetPosition(start + 2)
		}
		return false
	}

	ReadInlineTypeCode(): TokenType | false {
		if (this.IsByte(194, 0) && this.IsByte(167, 1)) {
			this.Advance(1)

			while (!this.TheEnd()) {
				if (this.IsCurrentValue("\n")) break
				this.Advance(1)
			}
			return "type_code"
		}
		return false
	}
	ReadInlineParserCode(): TokenType | false {
		if (this.IsByte(194, 0) && this.IsByte(163, 1)) {
			this.Advance(1)

			while (!this.TheEnd()) {
				if (this.IsCurrentValue("\n")) break
				this.Advance(1)
			}
			return "parser_code"
		}
		return false
	}

	ReadNumber(): TokenType | false {
		const ReadNumberPowExponent = (what: "pow" | "exponent") => {
			this.Advance(1)

			if (this.IsCurrentValue("+") || this.IsCurrentValue("-")) {
				this.Advance(1)

				if (!syntax.IsNumber(this.GetCurrentByteChar())) {
					this.Error(
						"malformed " + what + " expected number, got " + this.GetCurrentByteChar().toString(),
						this.Position - 2,
					)
				}

				while (!this.TheEnd()) {
					if (!syntax.IsNumber(this.GetCurrentByteChar())) break
					this.Advance(1)
				}
			}

			return true
		}

		const ReadNumberAnnotations = (what: "hex" | "decimal" | "binary") => {
			if (what == "hex") {
				if (this.IsCurrentValue("p") || this.IsCurrentValue("P")) return ReadNumberPowExponent("pow")
				if (this.IsCurrentValue("e") || this.IsCurrentValue("E")) return ReadNumberPowExponent("exponent")
			}
			return syntax.ReadNumberAnnotation(this)
		}

		let hex_map = new Set<number>()
		for (let char of [
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
		]) {
			hex_map.add(char.charCodeAt(0))
		}

		const ReadHexNumber = () => {
			this.Advance(2)
			let dot = false

			while (!this.TheEnd()) {
				if (this.IsCurrentValue("_")) {
					this.Advance(1)
				}

				if (this.IsCurrentValue(".")) {
					if (dot) {
						// this.Error("dot can only be placed once")
						return
					}
					dot = true
					this.Advance(1)
				}

				if (ReadNumberAnnotations("hex")) break

				if (hex_map.has(this.GetCurrentByteChar())) {
					this.Advance(1)
				} else if (syntax.IsSpace(this.GetCurrentByteChar()) || syntax.IsSymbol(this.GetCurrentByteChar())) {
					break
				} else if (this.GetCurrentByteChar() != 0) {
					this.Error("malformed number " + this.GetCurrentByteChar().toString() + " in hex notation")
				}
			}
		}

		const ReadBinaryNumber = () => {
			this.Advance(2)

			while (!this.TheEnd()) {
				if (this.IsCurrentValue("_")) {
					this.Advance(1)
				}

				if (this.IsCurrentValue("1") || this.IsCurrentValue("0")) {
					this.Advance(1)
				} else if (syntax.IsSpace(this.GetCurrentByteChar())) {
					break
				} else {
					this.Error("malformed number " + this.GetCurrentByteChar().toString() + " in binary notation")
					return
				}

				if (ReadNumberAnnotations("binary")) {
					break
				}
			}
		}

		const ReadDecimalNumber = () => {
			let dot = false

			while (!this.TheEnd()) {
				if (this.IsCurrentValue("_")) {
					this.Advance(1)
				}

				if (this.IsCurrentValue(".")) {
					if (this.IsValue(".", 1)) {
						return
					}

					if (dot) {
						return
					}

					dot = true

					this.Advance(1)
				}
				if (ReadNumberAnnotations("decimal")) {
					break
				}
				if (syntax.IsNumber(this.GetCurrentByteChar())) {
					this.Advance(1)
				} else {
					break
				}
			}
		}

		if (
			syntax.IsNumber(this.GetCurrentByteChar()) ||
			(this.IsCurrentValue(".") && syntax.IsNumber(this.GetChar(1)))
		) {
			if (this.IsValue("x", 1) || this.IsValue("X", 1)) {
				ReadHexNumber()
			} else if (this.IsValue("b", 1) || this.IsValue("B", 1)) {
				ReadBinaryNumber()
			} else {
				ReadDecimalNumber()
			}

			return "number"
		}

		return false
	}

	ReadMultilineString(): TokenType | false {
		if (this.IsValue("[", 0) && this.IsValue("[", 1)) {
			let start = this.Position
			this.Advance(1)

			if (this.IsCurrentValue("=")) {
				while (!this.TheEnd) {
					this.Advance(1)
					if (!this.IsCurrentValue("=")) break
				}
			}

			if (!this.IsCurrentValue("[")) {
				this.Error(
					"expected multiline string " +
						this.GetChars(start, this.Position - 1) +
						"[" +
						" got " +
						this.GetChars(start, this.Position),
					start,
					start + 1,
				)
				return false
			}

			this.Advance(1)

			let closing = "]" + "=".repeat(this.Position - start - 2) + "]"
			let pos = this.FindNearest(closing)

			if (pos) {
				this.SetPosition(pos)
				return "string"
			}

			this.Error("expected multiline string " + closing + " reached end of code", start, start + 1)
		}

		return false
	}

	ReadQuotedString(name: string, quote: string): TokenType | false {
		if (!this.IsCurrentValue(quote)) return false

		let start = this.Position
		this.Advance(1)

		while (!this.TheEnd()) {
			let char = this.ReadChar()

			if (char == B("\\")) {
				let char = this.ReadChar()

				if (char == B("z") && !this.IsCurrentValue(quote)) {
					this.ReadSpace()
				}
			} else if (char == B("\n")) {
				this.Advance(-1)
				this.Error("expected " + name + " quote to end", start, this.Position - 1)
			} else if (char == B(quote)) {
				return "string"
			}
		}

		this.Error("expected " + name + " quote to end: reached end of file", start, this.Position - 1)

		return "string"
	}
	ReadSingleQuoteString() {
		return this.ReadQuotedString("single", "'")
	}

	ReadDoubleQuoteString() {
		return this.ReadQuotedString("double", '"')
	}
	ReadLetter(): TokenType | false {
		if (syntax.IsLetter(this.GetCurrentByteChar())) {
			while (!this.TheEnd()) {
				this.Advance(1)
				if (!syntax.IsDuringLetter(this.GetCurrentByteChar())) {
					break
				}
			}
			return "letter"
		}

		return false
	}

	ReadSymbol(): TokenType | false {
		if (syntax.ReadSymbol(this)) return "symbol"
		return false
	}

	override Read(): [TokenType, boolean] {
		if (this.ReadRemainingCommentEscape()) return ["discard", false]

		{
			let name =
				this.ReadSpace() ||
				this.ReadCommentEscape() ||
				this.ReadMultilineCComment() ||
				this.ReadLineCComment() ||
				this.ReadMultilineCComment() ||
				this.ReadLineComment()
			if (name) return [name, true]
		}

		{
			let name =
				this.ReadInlineTypeCode() ||
				this.ReadInlineParserCode() ||
				this.ReadNumber() ||
				this.ReadMultilineString() ||
				this.ReadSingleQuoteString() ||
				this.ReadDoubleQuoteString() ||
				this.ReadLetter() ||
				this.ReadSymbol()

			if (name) return [name, false]
		}

		return this.ReadUnknown()
	}
}

let lexer = new LuaLexer("local foo = 1")
console.log(lexer.GetTokens())
