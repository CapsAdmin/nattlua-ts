export const TypeErrors = {
	Subset: function (a: BaseType, b: BaseType, reason?: string | string[]) {
		let msg = [a, " is not a subset of ", b]

		if (reason) {
			msg.push(" because ")
			if (typeof reason === "string") {
				msg.push(reason)
			} else {
				for (let str of reason) {
					msg.push(str)
				}
			}
		}

		return [false, msg] as const
	},
}

export class BaseType {
	Data: unknown
	Type: string = "unknown"
	Truthy = false
	Falsy = false
	Literal = false

	toString() {
		return "unknown"
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
