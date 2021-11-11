import { TAny } from "./Any.ts";
import { LStringFromString, TString } from "./String.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

const foo = new TString("foo");
const all_letters = new TString();
const foo_bar = new TString("foo bar");

Deno.test("foo should be contained within all letters", () => {
  expect(foo.IsSubsetOf(all_letters)).toBe(true);
});

Deno.test("all letters should not be containt within foo", () => {
  expect(all_letters.IsSubsetOf(foo)).toBe(true);
});

Deno.test("foo should be contained in any", () => {
  expect(foo.IsSubsetOf(new TAny())).toBe(true);
});

Deno.test("any should be contained within foo", () => {
  expect(new TAny().IsSubsetOf(foo)).toBe(true);
});

Deno.test("string pattern", () => {
  const pattern = new TString();
  pattern.PatternContract = "^FOO_.*";

  expect(new TString("FOO_BAR").IsSubsetOf(pattern)).toBe(true);
  expect(new TString("LOL_BAR").IsSubsetOf(pattern)).toContain(false);

  expect(pattern.IsSubsetOf(new TString("FOO_BAR"))).toBe(false);
  expect(pattern.IsSubsetOf(new TString("LOL_BAR"))).toBe(false);
});

Deno.test("string comparison", () => {
  expect(new TString("AAA").LogicalComparison(new TString("BBB"), ">")).toBe(
    false,
  );
  expect(new TString("AAA").LogicalComparison(new TString("BBB"), "<")).toBe(
    true,
  );
  expect(new TString("AAA").LogicalComparison(new TString("AAA"), "<=")).toBe(
    true,
  );
  expect(new TString("AAA").LogicalComparison(new TString("AAA"), "=>")).toBe(
    true,
  );
  expect(new TString("AAA").LogicalComparison(new TString(), "=>")).toBe(
    undefined,
  );
  expect(new TString().LogicalComparison(new TString("AAA"), "=>")).toBe(
    undefined,
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
  expect(new TString().IsSubsetOf(new TString())).toBe(undefined);
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
