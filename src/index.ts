import { Number } from "./Types/Number"
import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LexicalScope } from "./Scope"
import { String } from "./Types/String"

const scope = new LexicalScope(undefined, 0)
const T = new String()
scope.CreateValue("lol", T, "runtime")
const upvalue = scope.FindValue("lol", "runtime")
const upvalue2 = scope.FindValue("lol", "typesystem")
//expect(upvalue2).toBe(undefined)

console.log(scope.parent)
