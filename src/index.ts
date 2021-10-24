import { Number } from "./Types/Number"
import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LuaParser } from "./LuaParser"

let code = new Code("local a = [==[test]==]")
let lexer = new LuaLexer(code)
let tokens = lexer.GetTokens()
let parser = new LuaParser(tokens, code)
let statements = parser.ReadStatements()
let emitter = new LuaEmitter()
emitter.EmitStatements(statements)
console.log(emitter.GetCode())

let A = new Number(30, 50)
let B = new Number(35)

console.log(A.LogicalComparison(B, "<="))
