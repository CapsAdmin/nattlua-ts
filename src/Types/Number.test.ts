import { TAny } from "./Any.ts";
import { LNumberFromString, TNumber } from "./Number.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

const any = new TAny();

const all_numbers = new TNumber();

const _32_to_52 = new TNumber(32, 52);
const _40_to_45 = new TNumber(40, 45);
const _42 = new TNumber(42);

Deno.test("a literal number should be contained within all numbers", () => {
  expect(_42.IsSubsetOf(all_numbers)).toEqual([
    true,
    "literal contains number",
  ]);
});

Deno.test("all numbers should not be contained within a literal number", () => {
  expect(all_numbers.IsSubsetOf(_42)).toContain(false);
});

Deno.test("42 should be contained within any", () => {
  expect(_42.IsSubsetOf(any)).toEqual([true, "B is any"]);
});

Deno.test("any should be contained within 42", () => {
  expect(any.IsSubsetOf(_42)).toEqual([
    true,
    "any is always a subset of something",
  ]);
});

Deno.test("42 should be contained within 32..52", () => {
  expect(_42.IsSubsetOf(_32_to_52)).toEqual([true, "range match"]);
});

Deno.test("32..52 should not be contained within 42", () => {
  expect(_32_to_52.IsSubsetOf(_42)).toContain(false);
});

Deno.test("operators", () => {
  const _42 = new TNumber(42);
  const _21 = new TNumber(21);

  expect(_21.LogicalComparison(_42, "<=")).toBe(true);
  expect(_21.LogicalComparison(_42, ">=")).toBe(false);
  expect(_21.LogicalComparison(_42, "<")).toBe(true);
  expect(_21.LogicalComparison(_42, ">")).toBe(false);
  expect(new TNumber(42).LogicalComparison(_42, ">=")).toBe(true);
  expect(new TNumber(42).LogicalComparison(_42, "<=")).toBe(true);

  expect(_32_to_52.LogicalComparison(_21, ">=")).toBe(true);
  expect(_32_to_52.LogicalComparison(_21, "<=")).toBe(false);
  expect(_32_to_52.LogicalComparison(_42, "<=")).toBe(undefined); // 42 is less than 52, but not less than 32, so it's undefined

  expect(_32_to_52.LogicalComparison(_40_to_45, "<=")).toBe(undefined);
  expect(_32_to_52.LogicalComparison(_40_to_45, ">=")).toBe(undefined);
});

Deno.test("tostring", () => {
  expect(new TNumber().toString()).toBe("number");
  expect(new TNumber(NaN).toString()).toBe("nan");
  expect(new TNumber(Infinity).toString()).toBe("inf");
  expect(new TNumber(-Infinity).toString()).toBe("-inf");
  expect(_32_to_52.toString()).toBe("32..52");
  expect(_40_to_45.toString()).toBe("40..45");
  expect(_42.toString()).toBe("42");
});

Deno.test("string to number", () => {
  expect(LNumberFromString("0xDEADBEEF").Data).toBe(0xdeadbeef);
  expect(LNumberFromString("0b10101").Data).toBe(0b10101);
  expect(LNumberFromString("10ull").Data).toBe(10);
  expect(LNumberFromString("10ll").Data).toBe(10);
  expect(LNumberFromString("0.5").Data).toBe(0.5);
});
