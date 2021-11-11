import { LuaRuntimeSyntax } from "./LuaRuntimeSyntax.ts";

export class LuaTypesystemSyntax extends LuaRuntimeSyntax {
  override PrefixOperators = [
    "-",
    "#",
    "not",
    "~",
    "typeof",
    "$",
    "unique",
    "mutable",
    "literal",
    "supertype",
    "expand",
  ];

  override PrimaryBinaryOperators = ["."];

  override BinaryOperators = [
    ["or"],
    ["and"],
    ["extends"],
    ["subsetof"],
    ["supersetof"],
    ["<", ">", "<=", ">=", "~=", "=="],
    ["|"],
    ["~"],
    ["&"],
    ["<<", ">>"],
    ["R.."],
    ["+", "-"],
    ["*", "/", "/idiv/", "%"],
    ["R^"],
  ];
}
