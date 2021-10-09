import { BaseParser } from "./BaseParser"
import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LuaParser } from "./LuaParser"

let code = new Code("local {a,b,c} = {1,2,3}")
let lexer = new LuaLexer(code)
let tokens = lexer.GetTokens()
let parser = new LuaParser(tokens, code)
let ast = parser.ReadNode()
let emitter = new LuaEmitter()
emitter.EmitStatement(ast)
console.log(emitter.GetCode())
