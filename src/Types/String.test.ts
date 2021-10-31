import { Any } from "./Any"
import { String } from "./String"

const foo = new String("foo")
const all_letters = new String()
const foo_bar = new String("foo bar")

test("foo should be contained within all letters", () => {
	expect(foo.IsSubsetOf(all_letters)).toBe(true)
})

test("all letters should not be containt within foo", () => {
	expect(all_letters.IsSubsetOf(foo)).toBe(true)
})

test("foo should be contained in any", () => {
	expect(foo.IsSubsetOf(new Any())).toBe(true)
})

test("any should be contained within foo", () => {
	expect(new Any().IsSubsetOf(foo)).toBe(true)
})

test("string pattern", () => {
	const pattern = new String()
	pattern.PatternContract = "^FOO_.*"

	expect(new String("FOO_BAR").IsSubsetOf(pattern)).toBe(true)
	expect(new String("LOL_BAR").IsSubsetOf(pattern)).toContain(false)

	expect(pattern.IsSubsetOf(new String("FOO_BAR"))).toBe(false)
	expect(pattern.IsSubsetOf(new String("LOL_BAR"))).toBe(false)
})

test("string comparison", () => {
	expect(new String("AAA").LogicalComparison(new String("BBB"), ">")).toBe(false)
	expect(new String("AAA").LogicalComparison(new String("BBB"), "<")).toBe(true)
	expect(new String("AAA").LogicalComparison(new String("AAA"), "<=")).toBe(true)
	expect(new String("AAA").LogicalComparison(new String("AAA"), "=>")).toBe(true)
	expect(new String("AAA").LogicalComparison(new String(), "=>")).toBe(undefined)
	expect(new String().LogicalComparison(new String("AAA"), "=>")).toBe(undefined)
})

test("tostring", () => {
	expect(new String("AAA").toString()).toBe('"AAA"')
	expect(new String().toString()).toBe("string")
	const pattern = new String()
	pattern.PatternContract = "^FOO_.*"
	expect(pattern.toString()).toBe("$(^FOO_.*)")
})

test("subset", () => {
	expect(new String().IsSubsetOf(new String())).toBe(undefined)
})
