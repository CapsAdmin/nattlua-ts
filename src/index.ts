import { Number } from "./Types/Number"
import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LuaParser } from "./LuaParser"

const code = new Code("local a = [==[test]==]")
const lexer = new LuaLexer(code)
const tokens = lexer.GetTokens()
const parser = new LuaParser(tokens, code)
const statements = parser.ReadStatements()
const emitter = new LuaEmitter()
emitter.EmitStatements(statements)
console.log(emitter.GetCode())

const A = new Number(30, 50)
const B = new Number(35)

console.log(A.LogicalComparison(B, "<="))
