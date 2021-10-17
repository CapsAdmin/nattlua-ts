import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LuaParser } from "./LuaParser"

let code = new Code("analyzer function foo(): boolean end ")
let lexer = new LuaLexer(code)
let tokens = lexer.GetTokens()
let parser = new LuaParser(tokens, code)
let statements = parser.ReadStatements()
let emitter = new LuaEmitter()
emitter.EmitStatements(statements)
console.log(emitter.GetCode())
