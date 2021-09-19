import { LuaLexer } from "./LuaLexer"

let lexer = new LuaLexer("a--[[#1]]--[[#1]]a--[[#1]]")
for (let token of lexer.GetTokens()) {
	console.log(token)
}
