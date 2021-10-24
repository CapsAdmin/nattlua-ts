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

let A = new Number(42)
A.Literal = true

let B = new Number()

console.log(A.toString())
console.log(B.toString())

console.log(A.IsSubsetOf(B))
console.log(B.IsSubsetOf(A))

let C = new Number(50).SetLiteral(true)

console.log(A.LogicalComparison(C, "<"))
