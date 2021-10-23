import { BaseType, TypeErrors } from "./BaseType"
import { Any } from "./Any"
export class Number extends BaseType {
	override Data: number | undefined
	override Type: string = "number"
	override Truthy = true
	override Falsy = false

	Max: Number | undefined

	SetLiteral(bool: boolean) {
		this.Literal = bool
		return this
	}

	SetMax(max: Number) {
		if (max.Literal) {
			this.Max = max
		} else {
			this.Literal = false
			this.Data = undefined
			this.Max = undefined
		}

		return this
	}

	override toString() {
		if (!this.Data) {
			return "number"
		}

		let str

		if (isNaN(this.Data)) {
			str = "nan"
		} else {
			str = this.Data.toString()
		}

		if (this.Max) {
			str += ".." + this.Max.toString()
		}

		if (this.Literal) return str

		return "number(" + str + ")"
	}

	constructor(data?: number) {
		super()
		this.Data = data
		if (data) {
			this.Literal = true
		}
	}

	override Copy() {
		return new Number(this.Data)
	}

	override IsSubsetOf(B: Number | Any) {
		const A = this

		if (B instanceof Any) return true

		if (A.Literal && B.Literal && A.Data && B.Data) {
			// compare against literals

			if (isNaN(A.Data) && isNaN(B.Data)) {
				return true
			}

			if (A.Data === B.Data) {
				return true
			}

			if (B.Max && B.Max.Data) {
				if (A.Data >= B.Data && A.Data <= B.Max.Data) {
					return true
				}
			}

			return TypeErrors.Subset(A, B)
		} else if (A.Data == undefined && B.Data == undefined) {
			// number contains number
			return true
		} else if (A.Literal && !B.Literal) {
			// 42 subset of number
			return true
		} else if (!A.Literal && B.Literal) {
			// number subset of 42 ?
			return TypeErrors.Subset(A, B)
		}

		return true
	}
}

export const LNumber = (num: number | undefined) => new Number(num).SetLiteral(true)

export const LNumberFromString = (str: string) => {
	let num = parseFloat(str)

	if (isNaN(num)) {
		let lower = str.toLowerCase()
		if (lower.substr(0, 2) == "0b") {
			num = parseInt(str.substr(2), 2)
		} else if (lower.substr(0, 2) == "0x") {
			num = parseInt(str.substr(2), 16)
		} else if (lower.endsWith("ull")) {
			num = parseInt(str.substr(0, str.length - 3), 10)
		} else if (lower.endsWith("ll")) {
			num = parseInt(str.substr(0, str.length - 2), 10)
		}
	}

	return new Number(num).SetLiteral(true)
}
