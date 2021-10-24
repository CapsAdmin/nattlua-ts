import { BaseType, TypeErrors } from "./BaseType"
import { Any } from "./Any"

const operators = {
	[">"]: (a: number, b: number) => a > b,
	["<"]: (a: number, b: number) => a < b,
	["<="]: (a: number, b: number) => a <= b,
	[">="]: (a: number, b: number) => a >= b,
}

const compare = (val: number, min: number, max: number, operator: keyof typeof operators) => {
	const func = operators[operator]

	if (func(min, val) && func(max, val)) {
		return true
	} else if (!func(min, val) && !func(max, val)) {
		return false
	}

	return undefined
}
export class Number extends BaseType {
	override Data: number | undefined
	override Type: string = "number"
	override Truthy = true
	override Falsy = false

	Max: Number | undefined

	LogicalComparison(B: Number, operator: keyof typeof operators): undefined | boolean {
		const A = this
		const a_val = A.Data
		const b_val = B.Data
		if (!a_val) return
		if (!b_val) return
		const a_max = A.Max?.Data
		const b_max = B.Max?.Data

		if (a_max) {
			if (b_max) {
				const res_a = compare(b_val, a_val, b_max, operator)
				if (res_a != undefined) {
					const res_b = compare(a_val, b_val, a_max, operator)
					if (res_a == res_b) return res_a
				}
				return undefined
			}
		}

		if (a_max) {
			return compare(b_val, a_val, a_max, operator)
		}

		return operators[operator](a_val, b_val)
	}

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
		if (this.Data === undefined) {
			return "number"
		}

		let str

		if (isNaN(this.Data)) {
			str = "nan"
		} else if (isFinite(this.Data)) {
			str = this.Data.toString()
		} else {
			str = (this.Data < 0 ? "-" : "") + "inf"
		}

		if (this.Max) {
			str += ".." + this.Max.toString()
		}

		if (this.Literal) return str

		return "number(" + str + ")"
	}

	constructor(data?: number, max?: number) {
		super()
		this.Data = data
		if (data !== undefined) {
			this.Literal = true
		}

		if (max) {
			this.SetMax(new Number(max).SetLiteral(true))
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
