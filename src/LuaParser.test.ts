import { BaseParser } from "./BaseParser"
import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"

const check = (codeString: string, expectedCode?: string) => {
	let code = new Code(codeString)
	let lexer = new LuaLexer(code)
	let parser = new BaseParser(lexer.GetTokens(), code)
	let ast = parser.ReadNode()
	let emitter = new LuaEmitter()
	emitter.EmitStatement(ast!)
	expect(emitter.GetCode()).toBe(expectedCode || codeString)
}

test("smoke", () => {
	check("return 1+1")
	check("return\n1+ 1")
})

test("table", () => {
	check("return {1}")
	check("return {1,2}")
	check("return {1,2,}")
	check("return {a, ...foo}", "return table.mergetables {a,foo}")
})

test("idiv", () => {
	check("return 10//3", "return 10/idiv/3")
})
