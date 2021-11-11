import { TAny } from "./Any.ts";
import { LStringFromString, TString } from "./String.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

const foo = new TString("foo");
const all_letters = new TString();
const foo_bar = new TString("foo bar");

Deno.test("foo should be contained within all letters", () => {
  expect(foo.IsSubsetOf(all_letters)).toEqual([true, "string"]);
});

Deno.test("all letters should not be contained within foo", () => {
  expect(all_letters.IsSubsetOf(foo)).toEqual([false, "string"]);
});

Deno.test("foo should be contained in any", () => {
  expect(foo.IsSubsetOf(new TAny())).toContain(true);
});

Deno.test("any should be contained within foo", () => {
  expect(new TAny().IsSubsetOf(foo)).toContain(true);
});

Deno.test("string pattern", () => {
  const pattern = new TString();
  pattern.PatternContract = "^FOO_.*";

  expect(new TString("FOO_BAR").IsSubsetOf(pattern)).toEqual([
    true,
    "pattern match",
  ]);
  expect(new TString("LOL_BAR").IsSubsetOf(pattern)).toContain(false);

  expect(pattern.IsSubsetOf(new TString("FOO_BAR"))).toContain(false);
  expect(pattern.IsSubsetOf(new TString("LOL_BAR"))).toContain(false);
});

Deno.test("string comparison", () => {
  expect(new TString("AAA").LogicalComparison(new TString("BBB"), ">")).toBe(
    false
  );
  expect(new TString("AAA").LogicalComparison(new TString("BBB"), "<")).toBe(
    true
  );
  expect(new TString("AAA").LogicalComparison(new TString("AAA"), "<=")).toBe(
    true
  );
  expect(new TString("AAA").LogicalComparison(new TString("AAA"), "=>")).toBe(
    true
  );
  expect(new TString("AAA").LogicalComparison(new TString(), "=>")).toBe(
    undefined
  );
  expect(new TString().LogicalComparison(new TString("AAA"), "=>")).toBe(
    undefined
  );
});

Deno.test("tostring", () => {
  expect(new TString("AAA").toString()).toBe('"AAA"');
  expect(new TString().toString()).toBe("string");
  const pattern = new TString();
  pattern.PatternContract = "^FOO_.*";
  expect(pattern.toString()).toBe("$(^FOO_.*)");
});

Deno.test("subset", () => {
  expect(new TString().IsSubsetOf(new TString())).toEqual([
    undefined,
    "string may be a subset of string",
  ]);
});

Deno.test("copy", () => {
  const str = new TString("1337");
  expect(str.Copy().Equal(str)).toBe(true);

  str.PatternContract = "lol";
  expect(str.Copy().Equal(str)).toBe(true);
});

Deno.test("lua string", () => {
  expect(LStringFromString("[[foo]]").Data).toBe("foo");
  expect(LStringFromString("'foo'").Data).toBe("foo");
  expect(LStringFromString('"foo"').Data).toBe("foo");
});
