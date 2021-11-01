import { BaseType, TypeErrors } from "./BaseType"
import { Any } from "./Any"

const LuaStringMatch = (str: string, pattern: string) => {
	// TODO: use lua pattern matching instead of regex
	return str.match(pattern) != null
}

export class String extends BaseType {
	override Data: string | undefined
	PatternContract: string | undefined
	override Type = "string" as const
	override Truthy = true
	override Falsy = false

	LogicalComparison(B: String, operator: "<" | ">" | "=>" | "<="): undefined | boolean {
		const A = this

		if (A.Data === undefined) return undefined
		if (B.Data === undefined) return undefined

		if (operator == ">") {
			return A.Data > B.Data
		} else if (operator == "<") {
			return A.Data < B.Data
		} else if (operator == "=>") {
			return A.Data >= B.Data
		} else if (operator == "<=") {
			return A.Data <= B.Data
		}

		return undefined
	}

	override toString() {
		if (this.PatternContract !== undefined) {
			return "$(" + this.PatternContract + ")"
		}

		if (this.Data === undefined) {
			return this.Type
		}

		return `"${this.Data}"`
	}

	constructor(data?: string) {
		super()
		this.Data = data
	}

	override Copy() {
		const t = new String(this.Data)

		t.PatternContract = this.PatternContract

		return t
	}

	override Equal(B: String) {
		if (this.Data === undefined) return false
		if (B.Data === undefined) return false

		if (this.PatternContract !== undefined) {
			if (B.PatternContract !== undefined) {
				return this.PatternContract === B.PatternContract
			}
		}

		return this.Data === B.Data
	}

	override IsSubsetOf(B: String | Any) {
		const A = this

		if (B instanceof Any) return true
		if (!(B instanceof String)) return TypeErrors.TypeMismatch(A, B)

		if (A.Data !== undefined && B.Data !== undefined && A.Data == B.Data) {
			// "A" subsetof "B"
			return true
		}

		if (B.PatternContract !== undefined) {
			if (A.Data === undefined) return TypeErrors.Literal(A)

			if (!LuaStringMatch(A.Data, B.PatternContract)) {
				return TypeErrors.StringPattern(A.Data, B.PatternContract)
			}
			return true
		}

		if (A.PatternContract !== undefined) {
			return false
		}

		if (A.Data !== undefined && B.Data == undefined) {
			// "A" subsetof string
			return true
		}

		if (A.Data === undefined && B.Data !== undefined) {
			// string subsetof "B"
			return true
		}

		if (A.Data == undefined && B.Data == undefined) {
			// string subsetof string
			return undefined
		}

		return undefined
	}
}

export const LString = (x: string | undefined) => new String(x)

export const LStringFromString = (str: string) => {
	if (str.startsWith("[")) {
		const start = str.match(/\[=*\[(.*)\]=*\]/)
		if (start && start[1] !== undefined) {
			return new String(start[1])
		} else {
		}
	} else {
		return new String(str.substr(1, str.length - 2))
	}

	throw new Error("cannot convert string: " + str)
}
