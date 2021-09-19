import { Token, TokenType, WhitespaceToken } from "./Token"

export class BaseLexer {
	private Buffer: string
	private Position: number = 0
	private Name: string

	// useful when step debugging
	private CurrentDebugChar: string = ""

	GetLength(): number {
		return this.Buffer.length
	}

	GetString(start: number, stop: number): string {
		return this.Buffer.substr(start, stop - start + 1)
	}

	GetByteCharOffset(offset: number): number | undefined {
		let byte = this.Buffer.charCodeAt(this.Position + offset)
		if (isFinite(byte)) {
			return byte
		}
		return undefined
	}

	GetCurrentByteChar(): number {
		return this.Buffer.charCodeAt(this.Position)
	}

	ResetState() {
		this.SetPosition(0)
	}

	FindNearest(str: string) {
		let pos = this.Buffer.indexOf(str, this.Position)
		if (pos == -1) return undefined
		return pos + str.length
	}

	ReadChar() {
		let char = this.GetCurrentByteChar()
		this.Advance(1)
		return char
	}

	Advance(len: number) {
		this.SetPosition(this.Position + len)
	}

	SetPosition(pos: number) {
		this.Position = pos
		this.CurrentDebugChar = this.GetString(this.Position, this.Position)
	}

	GetPosition() {
		return this.Position
	}

	TheEnd() {
		return this.Position >= this.GetLength()
	}

	IsByte(what: number, offset: number) {
		return this.GetByteCharOffset(offset) == what
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
		this.OnError(this.Buffer, this.Name, msg, start || this.Position, stop || this.Position)
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
		if (this.TheEnd()) {
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
		while (true) {
			let token = this.ReadToken()
			tokens.push(token)
			if (token.type == "end_of_file") break
		}

		for (let token of tokens) {
			token.value = this.GetString(token.start, token.stop)
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
		this.Name = "unknown"
		this.SetPosition(0)
		this.ResetState()
	}
}
