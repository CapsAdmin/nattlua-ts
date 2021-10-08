import { BaseParser } from "./BaseParser"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"

let lexer = new LuaLexer("return 1+2")
let parser = new BaseParser(lexer.GetTokens())
let ast = parser.ReadNode()
let emitter = new LuaEmitter()
emitter.EmitStatement(ast)
console.log(emitter.Concat())