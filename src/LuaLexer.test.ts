import { LuaLexer } from "./LuaLexer"
import { Token } from "./Token"

const tokenize = (code: string) => {
	return new LuaLexer(code).GetTokens()
}

const one_token = (tokens: Token[]) => {
	expect(tokens).toHaveLength(2)
	expect(tokens[1]?.type).toBe("end_of_file")
	return tokens[0]!
}

test("smoke", () => {
	expect(tokenize("")[0]?.type).toBe("end_of_file")
	expect(one_token(tokenize("a")).type).toBe("letter")
	expect(one_token(tokenize("1")).type).toBe("number")
	expect(one_token(tokenize("(")).type).toBe("symbol")
})

test("shebang", () => {
	expect(tokenize("#!/usr/bin/env node")[0]?.type).toBe("shebang")
})

test("single quote string", () => {
	expect(one_token(tokenize("'1'")).type).toBe("string")
})

test("double quote string", () => {
	expect(one_token(tokenize('"1"')).type).toBe("string")
})

test("z escaped string", () => {
	expect(one_token(tokenize('"a\\z\na"')).type).toBe("string")
})

test("number..number", () => {
	expect(tokenize("1..20")).toHaveLength(4)
})

test("comment escape", () => {
	let i = 0
	let tokens: Token[]
	let check = (what: string) => {
		expect(tokens[i]!.value).toBe(what)
		i++
	}

	tokens = tokenize("a--[[#1]]--[[#1]]a--[[#1]]")
	i = 0

	console.log(tokens)

	check("a")
	check("1")
	check("1")
	check("a")
	check("1")
	check("")

	tokens = tokenize("function foo(str--[[#: string]], idx--[[#: number]], msg--[[#: string]]) end")
	i = 0

	check("function")
	check("foo")
	check("(")
	check("str")
	check(":")
	check("string")
	check(",")
	check("idx")
	check(":")
	check("number")
	check(",")
	check("msg")
	check(":")
	check("string")
	check(")")
	check("end")
})
