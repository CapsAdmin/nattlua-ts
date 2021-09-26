import { BaseParser } from "./BaseParser"
import { LuaLexer } from "./LuaLexer"

let lexer = new LuaLexer("§foo")
let parser = new BaseParser(lexer.GetTokens())
console.log(parser.ReadNode())
