import { TNumber } from "./Types/Number.ts";
import { Code } from "./Code.ts";
import { LuaEmitter } from "./LuaEmitter.ts";
import { LuaLexer } from "./LuaLexer.ts";
import { LexicalScope } from "./Scope.ts";
import { TString } from "./Types/String.ts";

const scope = new LexicalScope(undefined, 0);
const T = new TString();
scope.CreateValue("lol", T, "runtime");
const upvalue = scope.FindValue("lol", "runtime");
const upvalue2 = scope.FindValue("lol", "typesystem");
//expect(upvalue2).toBe(undefined)

console.log(scope.parent);
