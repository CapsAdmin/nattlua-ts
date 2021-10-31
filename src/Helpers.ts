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
			for (const byte of find) {
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
		const reg = new RegExp(/(\$\d)/g)
		let indexString // $1, $2, $3, etc
		while ((indexString = reg.exec(message))) {
			const found = indexString[0]
			if (found == undefined) break
			const index = parseInt(found.slice(1))
			message = message.replace(found, "「" + args[index - 1] + "」")
		}

		const code_string = code.GetString()
		const { line: startLine, character: startCharacter } = Helpers.SubPositionToLinePosition(code_string, start)
		const { line: stopLine, character: stopCharacter } = Helpers.SubPositionToLinePosition(code_string, stop)

		const before = code.Substring(0, start)
		const middle = code.Substring(start, stop)
		const after = code.Substring(stop, code.GetLength())

		const name = code.Name + ":" + startLine + ":" + startCharacter

		return message
	}
}
