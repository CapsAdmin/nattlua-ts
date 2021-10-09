import { Code } from "./Code"
import { Helpers } from "./Helpers"
import { Token, TokenType } from "./Token"

export class BaseLexer {
	private Code: Code
	private Position: number = 0

	// useful when step debugging
	private CurrentDebugChar: string = ""
	private CurrentDebugByte: number = 0

	GetLength(): number {
		return this.Code.GetLength()
	}

	GetString(start: number, stop: number) {
		return this.Code.Substring(start, stop)
	}

	GetByteCharOffset(offset: number): number {
		return this.Code.GetByte(this.Position + offset)
	}

	GetCurrentByteChar() {
		return this.Code.GetByte(this.Position)
	}

	ResetState() {
		this.SetPosition(0)
	}

	FindNearest(str: string) {
		return this.Code.FindNearest(str, this.Position)
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
		this.CurrentDebugChar = String.fromCharCode(this.GetCurrentByteChar())
		this.CurrentDebugByte = this.GetCurrentByteChar()
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

	OnError(code: Uint8Array, name: string, msg: string, start: number, stop: number) {}

	Error(msg: string, start?: number, stop?: number) {
		this.OnError(this.Code.Buffer, this.Code.Name, msg, start || this.Position, stop || this.Position)
	}

	NewToken(type: TokenType, is_whitespace: boolean, start: number, stop: number) {
		let token: Token = {
			type: type,
			is_whitespace: is_whitespace,
			start: start,
			stop: stop,
			value: "",
		} 
		
		return token
	}

	ReadFromArray(array: string[]) {
		for (let annotation of array) {
			if (this.GetString(this.GetPosition(), this.GetPosition() + annotation.length) == annotation) {
				this.Advance(annotation.length)
				return true
			}
		}
		return false
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

	Read(): [TokenType | undefined, boolean] {
		return this.ReadUnknown()
	}

	ReadSimple(): [TokenType, boolean, number, number] {
		if (this.ReadShebang()) {
			return ["shebang", false, 0, this.Position]
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

		return [type, is_whitespace, start, this.Position]
	}

	ReadToken() {
		let [token_type, is_whitespace, start, stop] = this.ReadSimple()
		return this.NewToken(token_type, is_whitespace, start, stop)
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
					token.whitespace = whitespace_buffer as Token[]
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

	private SkipBOMHeader() {
		if (this.IsByte(0xFEFF, 0)) {
			this.Advance(1)
		}

		if (this.IsByte(0xEF, 0) && this.IsByte(0xBB, 1) && this.IsByte(0xBF, 2)) {
			this.Advance(3)
		}
	}

	constructor(code: Code) {
		this.Code = code
		this.SetPosition(0)
		this.ResetState()
		this.SkipBOMHeader()
	}
}
