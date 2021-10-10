import { BaseParser } from "./BaseParser"
import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LuaParser } from "./LuaParser"

let code = new Code("foo.bar['faz'][1+2](1,2)")
let lexer = new LuaLexer(code)
let tokens = lexer.GetTokens()
let parser = new LuaParser(tokens, code)
let ast = parser.ReadStatement()
let emitter = new LuaEmitter()
emitter.EmitStatement(ast)
console.log(emitter.GetCode())
