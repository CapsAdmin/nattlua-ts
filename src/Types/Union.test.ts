import { TNumber } from "./Number.ts";
import { TString } from "./String.ts";
import { TUnion } from "./Union.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

const Union = (args: unknown[]) => {
  const types = [];

  for (const arg of args) {
    if (typeof arg === "string") {
      types.push(new TString(arg));
    } else if (typeof arg === "number") {
      types.push(new TNumber(arg));
    }
  }

  return new TUnion(types);
};

const larger = Union(["a", "b", "c"]);
const smaller = Union(["a", "b"]);
const different = Union(["b", "x", "y"]);

Deno.test("a union should not contain duplicates", () => {
  expect(Union(["a", "b", "a", "a"]).Equal(Union(["a", "b"]))).toBe(true);
});

Deno.test("a smaller union should be a subset of a larger union", () => {
  console.log(smaller, larger);
  expect(smaller.IsSubsetOf(larger)).toContain(true);
});
