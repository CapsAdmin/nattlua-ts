import { Any } from "./Any"
import { Number } from "./Number"

const any = new Any()

const all_numbers = new Number()

let _32_to_52 = new Number(32)
_32_to_52.SetMax(new Number(52))

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
