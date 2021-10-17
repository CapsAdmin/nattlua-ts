import { Code } from "./Code"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"
import { LuaParser } from "./LuaParser"

const check = (codeString: string, expectedCode?: string) => {
	let code = new Code(codeString)
	let lexer = new LuaLexer(code)
	let parser = new LuaParser(lexer.GetTokens(), code)
	let statements = parser.ReadStatements()
	let emitter = new LuaEmitter()
	emitter.EmitStatements(statements)
	expect(emitter.GetCode()).toBe(expectedCode || codeString)
}

test("expression", () => {
	check("return 1 + 2")
	check("return 1 - 2")
	check("return 1 * 2")
	check("return 1 / 2")
	check("return 1 % 2")
	check("return 1 ^ 2")
	check("return 1 + (1+2)")
	check("return 1 .. 2")
	check("return foo:Bar(1,2,3)")
	check("local a = a++")
	check("local a = -a")
})

test("smoke", () => {
	check("return 1+1")
	check("return\n1+ 1")
})

test("type code", () => {
	check("§foo")
})

test("parser code", () => {
	check("£foo")
})

test("table", () => {
	check("return {1}")
	check("return {[key] = val}")
	check("return {key = val}")
	check("return {1,2}")
	check("return {1,2,}")
	check("return {a, ...foo}", "return table.mergetables {a,foo}")
})

test("idiv", () => {
	check("return 10//3", "return 10/idiv/3")
})

test("function", () => {
	check("function foo(lol) return 1+1 end")
	check("function foo(lol, ...) end")
	check("function foo.bar(lol, ...) end")
	check("function foo.bar:Faz(lol, ...) end")
	check("local function foo(lol, ...) return 1+1 end")
	check("local x = function(lol, ...) return 1+1 end")
})

test("analyzer function", () => {
	check("analyzer function foo(lol: any, lol2: any) return 1+1 end")
	check("analyzer function foo(lol: any, ...: ...any) end")
	check("analyzer function foo.bar(lol: any, ...: ...any) end")
	check("analyzer function foo.bar:Faz(lol: any, ...: ...any) end")
	check("local analyzer function foo(lol: any, ...: ...any) return 1+1 end")
	check("local x = analyzer function(lol: any, ...: ...any) return 1+1 end")
})

test("if", () => {
	check("if true then end")
	check("if true then elseif true then end")
	check("if true then elseif true then else end")
	check("if true then else end")
})

test("semicolon", () => {
	check("local x = 1;")
	check("local x = 1;;;")
	check(";;;")
})
test("goto", () => {
	check("goto foo")
	check("::foo::")
})

test("for", () => {
	check("for i = 1, 10 do end")
	check("for i = 1, 10, 4 do end")
	check("for i = 1+2, 1-10, 4+2 do continue end")
	check("for a,b,c in 1+2,3+4,4+5 do break end")
})

test("assignment", () => {
	check("local foo = 1")
	check("local foo, bar = 1, 2")
	check("local foo, bar")

	check("foo.bar = 1")
	check("foo.bar, foo.faz = 1, 2")

	check("local {a,b,c} = {1,2,3}", 'local a,b,c =table.destructure( {1,2,3}, {"a", "b", "c"})')
	check("{a,b,c} = {1,2,3}", 'a,b,c =table.destructure( {1,2,3}, {"a", "b", "c"})')
})

test("do statement", () => {
	check("do end")
	check("while true do end")
})

test("call", () => {
	check("foo.bar['faz'][1+2](1,2)")
	check("foo.bar()")
	check("foo.bar(1,2)")
	check("bar{}")
	check('bar""')
	check("bar''")
	check("bar[[]]")
	check("foo:bar(1,2)")
})

test("repeat", () => {
	check("repeat until true")
})
