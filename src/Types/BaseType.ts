import { String } from "./String"
export const TypeErrors = {
	Subset: function (a: BaseType, b: BaseType, reason?: string | string[]) {
		const msg = [a, " is not a subset of ", b]

		if (reason !== undefined) {
			msg.push(" because ")
			if (typeof reason === "string") {
				msg.push(reason)
			} else {
				for (const str of reason) {
					msg.push(str)
				}
			}
		}

		return [false, msg] as const
	},
	TypeMismatch(a: BaseType, b: BaseType) {
		return [false, a, " is not the same type as ", b] as const
	},
	Literal(a: BaseType) {
		return [false, a, " is not a literal"] as const
	},
	StringPattern(a: string, pattern: string) {
		return [false, a, " does not match the pattern " + pattern] as const
	},
}

export type TypeError = [false, ...string[]]

export class BaseType {
	Data: unknown
	Type = "unknown"
	Truthy = false
	Falsy = false
	toString() {
		return "unknown"
	}

	IsLiteral() {
		return this.Data !== undefined
	}

	Equal(other: BaseType): boolean {
		return false
	}

	CanBeNil() {
		return false
	}

	IsUncertain() {
		return this.Truthy && this.Falsy
	}

	IsSubsetOf(T: BaseType) {}

	Copy(): BaseType {
		return this
	}
}
