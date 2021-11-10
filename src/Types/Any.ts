import { BaseType, TypeErrors } from "./BaseType"

export class TAny extends BaseType {
	override Type = "any" as const
	override Truthy = true
	override Falsy = true

	constructor() {
		super(undefined)
	}

	override Equal(t: TAny) {
		return false
	}

	override Copy() {
		return new TAny()
	}

	override toString() {
		return "any"
	}

	override IsSubsetOf(B: BaseType) {
		return [true, "any is always a subset of something"] as const
	}
}
