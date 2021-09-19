import { LuaLexer } from "./LuaLexer"

let lexer = new LuaLexer("local foo = 100ull")
for (let token of lexer.GetTokens()) {
	console.log(token)
}
