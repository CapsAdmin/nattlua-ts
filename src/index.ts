import { BaseParser } from "./BaseParser"
import { LuaLexer } from "./LuaLexer"

let lexer = new LuaLexer("return 1+2")
let parser = new BaseParser(lexer.GetTokens())
let ast = parser.ReadNode()
console.log(ast)
