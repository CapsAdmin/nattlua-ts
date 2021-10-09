import { BaseParser } from "./BaseParser"
import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"

let code = new Code("return 10//3", "unknown")
let lexer = new LuaLexer(code)
let tokens = lexer.GetTokens()
let parser = new BaseParser(tokens, code)
let ast = parser.ReadNode()
let emitter = new LuaEmitter()
emitter.EmitStatement(ast)
console.log(emitter.GetCode())
