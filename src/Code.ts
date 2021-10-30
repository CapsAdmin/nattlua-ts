import { Helpers } from "./Helpers"

export class Code {
	Buffer: Uint8Array
	Name: string
	constructor(code: string, name?: string) {
		this.Buffer = new TextEncoder().encode(code)
		this.Name = name || this.Substring(0, 8) + "..."
	}

	Substring(start: number, stop: number): string {
		const ab = this.Buffer.slice(start, stop)

		return new TextDecoder().decode(ab)
	}
	GetString(): string {
		return new TextDecoder().decode(this.Buffer)
	}

	GetLength(): number {
		return this.Buffer.length
	}

	GetByte(pos: number): number {
		return this.Buffer[pos] || 0
	}

	FindNearest(str: string, from: number) {
		return Helpers.FindNearest(this.Buffer, new TextEncoder().encode(str), from)
	}
}
