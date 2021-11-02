import { BaseType, TypeErrors, Types } from "./BaseType"
import { TNumber } from "./Number"
import { TString } from "./String"

export class TUnion extends BaseType {
	override Type = "union" as const
	override Data: Types[] = []

	constructor(data: Types[] = []) {
		super(undefined)
		this.Data = []
		for (const v of data) {
			this.AddType(v)
		}
	}

	override Equal(type: TUnion) {
		if (this.Data.length !== type.Data.length) {
			return false
		}

		for (const a of this.Data) {
			for (const b of this.Data) {
				if (!a.Equal(b)) {
					return true
				}
			}
		}

		return true
	}

	AddType(type: Types) {
		if (type instanceof TUnion) {
			for (const v of type.Data) {
				this.AddType(v)
			}
			return this
		}

		for (const v of this.Data) {
			if (v.Equal(type)) {
				return this
			}
		}

		if (type.Type == "string" || type.Type == "number") {
			const sup = type

			for (let i = this.Data.length - 1; i >= 0; i--) {
				const sub = this.Data[i]!
				if (sub.Type == sup.Type) {
					if (sub.IsSubsetOf(sup)) {
						this.Data.splice(i, 1)
					}
				}
			}
		}

		this.Data.push(type)

		return this
	}

	Get(key: TString, from_table?: boolean) {
		if (from_table) {
			for (const obj of this.Data) {
				if (obj instanceof TUnion) {
					const val = obj.Get(key)
					if (val) {
						return val
					}
				}
			}
		}

		const errors = []

		for (const obj of this.Data) {
			if (obj instanceof TString) {
				const [ok, reason] = key.IsSubsetOf(obj)
				if (ok) return obj
				errors.push(reason)
			}
		}

		return TypeErrors.Other(errors)
	}

	IsSubsetOf(B: TUnion) {
		const A = this

		if (B.Type != "union") return A.IsSubsetOf(new TUnion([B]))

		for (const a of A.Data) {
			if (a.Type == "any") return true
		}

		for (const a of A.Data) {
			{
				const [b, reason] = B.Get(a)
				if (!b) return TypeErrors.MissingType(B, a, reason)
			}
			{
				const [ok, reason] = a.IsSubsetOf(b)
				if (!ok) return TypeErrors.Subset(a, b, reason)
			}
		}

		return true
	}

	RemoveType(type: Types) {
		if (type instanceof TUnion) {
			for (const v of type.Data) {
				this.RemoveType(v)
			}
			return this
		}

		for (let i = 0; i < this.Data.length; i++) {
			const sub = this.Data[i] as BaseType
			if (sub.Equal(type)) {
				this.Data.splice(i, 1)
				break
			}
		}

		return this
	}

	Clear() {
		this.Data = []
		return this
	}
	IsEmpty() {
		return this.Data.length === 0
	}

	override Copy() {
		const copy = new TUnion([])
		for (const v of this.Data) {
			copy.AddType(v.Copy())
		}
		return copy
	}

	GetTruthyUnion() {
		const copy = this.Copy()
		for (const v of this.Data) {
			if (!v.Truthy) {
				copy.RemoveType(v)
			}
		}
		return copy
	}

	override toString(): string {
		return this.Data.map((type) => type.toString()).join(" | ")
	}
}
