import { Helpers } from "./Helpers.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

const code = "foo\nbar\nfaz";

Deno.test("LinePositionToSubPosition", () => {
  expect(Helpers.LinePositionToSubPosition(code, 0, 0)).toBe(0);
  expect(code.substr(Helpers.LinePositionToSubPosition(code, 1, 0))).toBe(
    "\nbar\nfaz",
  );
  expect(code.substr(Helpers.LinePositionToSubPosition(code, 1, 1))).toBe(
    "bar\nfaz",
  );
});

Deno.test("SubPositionToLinePosition", () => {
  expect(Helpers.SubPositionToLinePosition(code, 4)).toBe({
    line: 1,
    character: 0,
  });

  expect(Helpers.SubPositionToLinePosition(code, 5)).toBe({
    line: 1,
    character: 1,
  });
});

Deno.test("FindNearest", () => {
  const input = new TextEncoder().encode("§foolbars");
  const find = new TextEncoder().encode("olb");

  const pos = Helpers.FindNearest(input, find);

  expect(new TextDecoder().decode(input.slice(pos))).toBe("ars");
});
