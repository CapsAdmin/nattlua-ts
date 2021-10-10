import { Code } from "./Code"

export class Helpers {
	static LinePositionToSubPosition(code: string, line: number, character: number): number {
		let subPosition = 0
		let lineCount = 0
		for (let i = 0; i < code.length; i++) {
			if (code[i] === "\n") {
				lineCount++
			}
			if (lineCount === line) {
				subPosition = i
				break
			}
		}
		return subPosition + character
	}

	static SubPositionToLinePosition(code: string, pos: number) {
		let line = 0
		let character = 0
		for (let i = 0; i < pos; i++) {
			if (code[i] === "\n") {
				line++
				character = 0
			} else {
				character++
			}
		}
		return { line, character }
	}

	static FindNearest(input: Uint8Array, find: Uint8Array, fromIndex = 0) {
		for (let i = fromIndex; i < input.byteLength; i++) {
			let found = true
			let i2 = 0
			for (let byte of find) {
				if (input[i + i2] != byte) {
					found = false
					break
				}

				i2++
			}

			if (found) {
				return i + i2
			}
		}

		return undefined
	}
	static FormatError(code: Code, message: string, start: number, stop: number, ...args: any[]) {
		let reg = new RegExp(/(\$\d)/g)
		let indexString // $1, $2, $3, etc
		while ((indexString = reg.exec(message))) {
			let found = indexString[0]
			if (!found) break
			let index = parseInt(found.slice(1))
			message = message.replace(found, "「" + args[index - 1] + "」")
		}

		let code_string = code.GetString()
		let { line: startLine, character: startCharacter } = Helpers.SubPositionToLinePosition(code_string, start)
		let { line: stopLine, character: stopCharacter } = Helpers.SubPositionToLinePosition(code_string, stop)

		let before = code.Substring(0, start)
		let middle = code.Substring(start, stop)
		let after = code.Substring(stop, code.GetLength())

		let name = code.Name + ":" + startLine + ":" + startCharacter

		return message
	}
}
