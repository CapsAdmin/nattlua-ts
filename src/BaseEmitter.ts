import { Token } from "./Token"

export class BaseEmitter {
	level: number = 0
	last_non_space_index = 0
	last_newline_index = 0
	config: {
		preserve_whitespace?: boolean
		no_newlines?: boolean
	} = {}
	out: string[] = []
	Whitespace(str: "\t" | "\t+" | "\t-" | "\n" | " ", force?: boolean) {
		if (this.config.preserve_whitespace == undefined && !force) {
			return
		}

		if (str == "\t") {
			if (this.config.no_newlines) {
				this.Emit(" ")
			} else {
				this.Emit("\t".repeat(this.level))
				this.last_newline_index = this.out.length
			}
		} else if (str == "\t+") {
			this.Indent()
		} else if (str == "\t-") {
			this.Outdent()
		} else if (str == " ") {
			this.Emit(" ")
		} else if (str == "\n") {
			this.Emit(this.config.no_newlines ? " " : "\n")
			this.last_newline_index = this.out.length
		}
	}
	Emit(str: string) {
		this.out.push(str)
	}

	EmitNonSpace(str: string) {
		this.Emit(str)
		this.last_non_space_index = this.out.length
	}

	EmitSpace(str: string) {
		this.Emit(str)
	}

	Indent() {
		this.level++
	}

	Outdent() {
		this.level--
	}

	GetPrevChar() {
		let prev = this.out[this.out.length - 1]
		if (prev == undefined) {
			return ""
		}
		return prev.charCodeAt(0)
	}

	EmitWhitespace(token: Token) {
		if (this.config.preserve_whitespace == false && token.type == "space") return
		this.EmitToken(token)

		if (token.type != "space") {
			this.Whitespace("\n")
			this.Whitespace("\t")
		}
	}

	GetCode() {
		return this.out.join("")
	}

	EmitToken(node: Token, translate?: { [key: string]: string } | ((node: Token | string) => string) | string) {
		if (node.whitespace) {
			if (this.config.preserve_whitespace == false) {
				let emit_all_whitespace = false

				for (let _i = 0, _len = node.whitespace.length; _i < _len; _i++) {
					let token = node.whitespace[_i]!

					if (token.type == "line_comment" || token.type == "multiline_comment") {
						emit_all_whitespace = true

						break
					}
				}

				if (emit_all_whitespace) {
					if (this.last_non_space_index) {
						for (let i = this.last_non_space_index + 1; i < this.out.length; i++) {
							this.out[i] = ""
						}
					}

					for (let token of node.whitespace) {
						this.EmitToken(token)
					}
				}
			} else {
				for (let token of node.whitespace) {
					this.EmitWhitespace(token)
				}
			}
		}

		if (this.TranslateToken) {
			translate = this.TranslateToken(node) || translate
		}

		if (translate !== undefined) {
			if (typeof translate == "object") {
				this.Emit(translate[node.value] || node.value)
			} else if (typeof translate == "function") {
				this.Emit(translate(node.value))
			} else if (translate !== "") {
				this.Emit(translate)
			}
		} else {
			this.Emit(node.value)
		}

		if (node.type != "line_comment" && node.type != "multiline_comment" && node.type != "space") {
			this.last_non_space_index = this.out.length - 1
		}
	}

	TranslateToken(node: string | Token) {
		return ""
	}
}
