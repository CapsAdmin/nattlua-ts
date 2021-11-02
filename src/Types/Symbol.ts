import { BaseType, TypeErrors } from "./BaseType"
import { TAny } from "./Any"

export const LuaNil = Symbol("LuaNil")
export const LuaTrue = Symbol("LuaTrue")
export const LuaFalse = Symbol("LuaFalse")

export class TSymbol extends BaseType {
	override Type = "symbol" as const
	override Truthy = true
	override Falsy = false

	override toString() {
		return `${this.Data}`
	}

	override Copy() {
		return new TSymbol(this.Data)
	}

	override Equal(B: TSymbol) {
		return this.Data === B.Data
	}

	override IsSubsetOf(B: TSymbol | TAny) {
		const A = this

		if (B.Type == "any") return true
		if (A.Type !== B.Type) return TypeErrors.TypeMismatch(A, B)
		if (A.Data !== B.Data) return TypeErrors.ValueMismatch(A, B)

		return true
	}

	MakeTruthy() {
		this.Truthy = true
		return this
	}

	MakeFalsy() {
		this.Falsy = false
		return this
	}
}

export const Nil = () => new TSymbol(LuaNil).MakeFalsy()
export const True = () => new TSymbol(LuaTrue).MakeTruthy()
export const False = () => new TSymbol(LuaFalse).MakeFalsy()
