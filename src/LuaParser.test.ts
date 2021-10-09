import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LuaParser } from "./LuaParser"

const check = (codeString: string, expectedCode?: string) => {
	let code = new Code(codeString)
	let lexer = new LuaLexer(code)
	let parser = new LuaParser(lexer.GetTokens(), code)
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

test("function", () => {
	check("function foo(lol) return 1+1 end")
})

test("if", () => {
	check("if true then end")
	check("if true then elseif true then end")
	check("if true then elseif true then else end")
	check("if true then else end")
})

test("for", () => {
	check("for i = 1, 10 do end")
	check("for i = 1, 10, 4 do end")
	check("for i = 1+2, 1-10, 4+2 do end")
})

test("local assignment", () => {
	check("local foo = 1")
	check("local foo, bar = 1, 2")
	check("local foo, bar")
})
