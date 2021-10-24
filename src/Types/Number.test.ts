import { Any } from "./Any"
import { Number } from "./Number"

const any = new Any()

const all_numbers = new Number()

let _32_to_52 = new Number(32, 52)
let _40_to_45 = new Number(40, 45)
let _42 = new Number(42)

test("a literal number should be contained within all numbers", () => {
	expect(_42.IsSubsetOf(all_numbers)).toBe(true)
})

test("all numbers should not be contained within a literal number", () => {
	expect(all_numbers.IsSubsetOf(_42)).toContain(false)
})

test("42 should be contained within any", () => {
	expect(_42.IsSubsetOf(any)).toBe(true)
})

test("any should be contained within 42", () => {
	expect(any.IsSubsetOf(_42)).toBe(true)
})

test("42 should be contained within 32..52", () => {
	expect(_42.IsSubsetOf(_32_to_52)).toBe(true)
})

test("32..52 should not be contained within 42", () => {
	expect(_32_to_52.IsSubsetOf(_42)).toContain(false)
})

test("operators", () => {
	let _42 = new Number(42)
	let _21 = new Number(21)

	expect(_21.LogicalComparison(_42, "<=")).toBe(true)
	expect(_21.LogicalComparison(_42, ">=")).toBe(false)
	expect(_21.LogicalComparison(_42, "<")).toBe(true)
	expect(_21.LogicalComparison(_42, ">")).toBe(false)
	expect(new Number(42).LogicalComparison(_42, ">=")).toBe(true)
	expect(new Number(42).LogicalComparison(_42, "<=")).toBe(true)

	expect(_32_to_52.LogicalComparison(_21, ">=")).toBe(true)
	expect(_32_to_52.LogicalComparison(_21, "<=")).toBe(false)
	expect(_32_to_52.LogicalComparison(_42, "<=")).toBe(undefined) // 42 is less than 52, but not less than 32, so it's undefined

	expect(_32_to_52.LogicalComparison(_40_to_45, "<=")).toBe(undefined)
	expect(_32_to_52.LogicalComparison(_40_to_45, ">=")).toBe(undefined)
})

test("tostring", () => {
	expect(new Number(NaN).SetLiteral(true).toString()).toBe("nan")
	expect(new Number(Infinity).SetLiteral(true).toString()).toBe("inf")
	expect(new Number(-Infinity).SetLiteral(true).toString()).toBe("-inf")
	expect(_32_to_52.toString()).toBe("32..52")
	expect(_40_to_45.toString()).toBe("40..45")
	expect(_42.toString()).toBe("42")
})

test("range", () => {
	let high = new Number(0)
	let low = new Number(32)
})
