import { AnyParserNode } from "../LuaParser"
import { Upvalue } from "../Scope"
import { TAny } from "./Any"
import { TNumber } from "./Number"
import { TString } from "./String"
import { TSymbol } from "./Symbol"
import { TUnion } from "./Union"

export type Types = TString | TNumber | TUnion | TAny | TSymbol
export const TypeErrors = {
	Subset: function (a: Types, b: Types, reason?: string | string[]) {
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
	TypeMismatch(a: Types, b: Types) {
		return [false, a, " is not the same type as ", b] as const
	},
	ValueMismatch(a: Types, b: Types) {
		return [false, a, " is not the same value as ", b] as const
	},
	Literal(a: Types) {
		return [false, a, " is not a literal"] as const
	},
	StringPattern(a: string, pattern: string) {
		return [false, a, " does not match the pattern " + pattern] as const
	},
	MissingType(a: Types, b: Types, reason: string) {
		return [false, a, " is missing type ", b, " because ", reason] as const
	},
	Other(error: string[]) {
		return [false, error] as const
	},
}

export type TypeError = [false, ...string[]]

export class BaseType {
	Data: unknown
	Type = "unknown"
	Truthy = false
	Falsy = false
	Node: AnyParserNode | undefined
	upvalue: Upvalue | undefined
	toString() {
		return "unknown"
	}

	IsLiteral() {
		return this.Data !== undefined
	}

	Equal(other: unknown): boolean {
		return false
	}

	CanBeNil() {
		return false
	}

	IsUncertain() {
		return this.Truthy && this.Falsy
	}

	IsSubsetOf(T: unknown): readonly [boolean | undefined, string] {
		return [false, ""]
	}

	Copy(): BaseType {
		return this
	}

	SetNode(node: AnyParserNode) {
		this.Node = node
		return this
	}

	SetUpvalue(upvalue: Upvalue) {
		this.upvalue = upvalue
		return this
	}

	constructor(data: unknown) {
		this.Data = data
	}
}
