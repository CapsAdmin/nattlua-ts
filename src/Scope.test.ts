import { LexicalScope } from "./Scope.ts";
import { TNumber } from "./Types/Number.ts";
import { TString } from "./Types/String.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

Deno.test("create and find upvalue", () => {
  const scope = new LexicalScope(undefined, 0);
  const T = new TString();
  scope.CreateValue("lol", T, "runtime");

  const upvalue = scope.FindValue("lol", "runtime");
  expect(upvalue?.value).toBe(T);

  const non_existing_upvalue = scope.FindValue("lol", "typesystem");
  expect(non_existing_upvalue).toBe(undefined);

  expect(scope.upvalues.typesystem.list.length).toBe(0);
  expect(scope.upvalues.runtime.list.length).toBe(1);
});

Deno.test("shadowed upvalue", () => {
  const scope = new LexicalScope(undefined, 0);
  const str = new TString();
  const num = new TNumber();

  scope.CreateValue("lol", str, "runtime");
  scope.CreateValue("lol", num, "runtime");

  const upvalue = scope.FindValue("lol", "runtime");

  expect(upvalue?.value).toBe(num);
  expect(upvalue?.shadow?.value).toBe(str);

  expect(scope.upvalues.runtime.list.length).toBe(2);
});
