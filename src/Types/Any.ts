import { BaseType, TypeErrors } from "./BaseType"

export class Any extends BaseType {
	override Type = "any"
	override Truthy = true
	override Falsy = true

	override toString() {
		return "any"
	}

	override IsSubsetOf(B: BaseType) {
		return true
	}
}
