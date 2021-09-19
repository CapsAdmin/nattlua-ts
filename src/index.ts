import { LuaLexer } from "./LuaLexer"

let lexer = new LuaLexer("local x2 = 0e0")
for (let token of lexer.GetTokens()) {
	console.log(token)
}
