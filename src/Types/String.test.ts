import { TAny } from "./Any"
import { LStringFromString, TString } from "./String"

const foo = new TString("foo")
const all_letters = new TString()
const foo_bar = new TString("foo bar")

test("foo should be contained within all letters", () => {
	expect(foo.IsSubsetOf(all_letters)).toBe(true)
})

test("all letters should not be containt within foo", () => {
	expect(all_letters.IsSubsetOf(foo)).toBe(true)
})

test("foo should be contained in any", () => {
	expect(foo.IsSubsetOf(new TAny())).toBe(true)
})

test("any should be contained within foo", () => {
	expect(new TAny().IsSubsetOf(foo)).toBe(true)
})

test("string pattern", () => {
	const pattern = new TString()
	pattern.PatternContract = "^FOO_.*"

	expect(new TString("FOO_BAR").IsSubsetOf(pattern)).toBe(true)
	expect(new TString("LOL_BAR").IsSubsetOf(pattern)).toContain(false)

	expect(pattern.IsSubsetOf(new TString("FOO_BAR"))).toBe(false)
	expect(pattern.IsSubsetOf(new TString("LOL_BAR"))).toBe(false)
})

test("string comparison", () => {
	expect(new TString("AAA").LogicalComparison(new TString("BBB"), ">")).toBe(false)
	expect(new TString("AAA").LogicalComparison(new TString("BBB"), "<")).toBe(true)
	expect(new TString("AAA").LogicalComparison(new TString("AAA"), "<=")).toBe(true)
	expect(new TString("AAA").LogicalComparison(new TString("AAA"), "=>")).toBe(true)
	expect(new TString("AAA").LogicalComparison(new TString(), "=>")).toBe(undefined)
	expect(new TString().LogicalComparison(new TString("AAA"), "=>")).toBe(undefined)
})

test("tostring", () => {
	expect(new TString("AAA").toString()).toBe('"AAA"')
	expect(new TString().toString()).toBe("string")
	const pattern = new TString()
	pattern.PatternContract = "^FOO_.*"
	expect(pattern.toString()).toBe("$(^FOO_.*)")
})

test("subset", () => {
	expect(new TString().IsSubsetOf(new TString())).toBe(undefined)
})

test("copy", () => {
	const str = new TString("1337")
	expect(str.Copy().Equal(str)).toBe(true)

	str.PatternContract = "lol"
	expect(str.Copy().Equal(str)).toBe(true)
})

test("lua string", () => {
	expect(LStringFromString("[[foo]]").Data).toBe("foo")
	expect(LStringFromString("'foo'").Data).toBe("foo")
	expect(LStringFromString('"foo"').Data).toBe("foo")
})
