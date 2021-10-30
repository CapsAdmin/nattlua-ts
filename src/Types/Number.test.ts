import { Any } from "./Any"
import { LNumberFromString, Number } from "./Number"

const any = new Any()

const all_numbers = new Number()

const _32_to_52 = new Number(32, 52)
const _40_to_45 = new Number(40, 45)
const _42 = new Number(42)

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
	const _42 = new Number(42)
	const _21 = new Number(21)

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
	expect(new Number().toString()).toBe("number")
	expect(new Number(NaN).toString()).toBe("nan")
	expect(new Number(Infinity).toString()).toBe("inf")
	expect(new Number(-Infinity).toString()).toBe("-inf")
	expect(_32_to_52.toString()).toBe("32..52")
	expect(_40_to_45.toString()).toBe("40..45")
	expect(_42.toString()).toBe("42")
})

test("string to number", () => {
	expect(LNumberFromString("0xDEADBEEF").Data).toBe(0xdeadbeef)
	expect(LNumberFromString("0b10101").Data).toBe(0b10101)
	expect(LNumberFromString("10ull").Data).toBe(10)
	expect(LNumberFromString("10ll").Data).toBe(10)
	expect(LNumberFromString("0.5").Data).toBe(0.5)
})
