import { Code } from "./Code"
import { LuaLexer } from "./LuaLexer"
import { LuaRuntimeSyntax } from "./LuaRuntimeSyntax"
import { Token } from "./Token"

const tokenize = (codeString: string) => {
	let code = new Code(codeString)
	return new LuaLexer(code).GetTokens()
}

const one_token = (tokens: Token[]) => {
	expect(tokens).toHaveLength(2)
	expect(tokens[1]?.type).toBe("end_of_file")
	return tokens[0]!
}

test("unclosed multiline comment", () => {
	try {
		let tokens = tokenize("--[[")
	} catch (err: Error) {
		expect(err.message).toBe("Unclosed multiline comment")
	}
})

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

test("decimal number", () => {
	expect(tokenize("0.01")).toHaveLength(2)
	expect(tokenize("0.000_001")).toHaveLength(2)
	expect(tokenize("0.000_00.1")).toHaveLength(3)
})

test("luajit binary number", () => {
	expect(tokenize("0b010101")).toHaveLength(2)
	expect(tokenize("0b0_101_01 0b101")).toHaveLength(3)
})
test("...", () => {
	expect(one_token(tokenize("...")).type).toBe("symbol")
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

test("multiline comments", () => {
	expect(tokenize("--[[foo]]")).toHaveLength(1)
	expect(tokenize("--[=[foo]=]")).toHaveLength(1)
	expect(tokenize("--[==[foo]==]")).toHaveLength(1)
	expect(tokenize("--[=======[foo]=======]")).toHaveLength(1)
	expect(tokenize("--[=TESTSUITE\n-- utilities\nlocal ops = {}\n--]=]")).toHaveLength(6)
	expect(
		tokenize(
			"foo--[[]].--[[]]bar--[[]]:--[==[]==]test--[[]](--[=[]=]1--[[]]--[[]],2--[[]])--------[[]]--[[]]--[===[]]",
		),
	).toHaveLength(11)
})

test("unicode", () => {
	expect(tokenize("🐵=😍+🙅")).toHaveLength(6)
	expect(tokenize("foo(･✿ヾ╲｡◕‿◕｡╱✿･ﾟ)")).toHaveLength(5)
	expect(
		tokenize(
			"foo(ด้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็ด้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็ด้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็็้้้้้้้้็็็็็้้้้้็็็็)",
		),
	).toHaveLength(5)
})
test("glua", () => {
	expect(one_token(tokenize("/**/foo")).type).toBe("letter")
	expect(one_token(tokenize("/*B*/foo")).type).toBe("letter")
	expect(one_token(tokenize("/*-----*/foo")).type).toBe("letter")
	expect(one_token(tokenize("--asdafsadw\nfoo--awsad asd")).type).toBe("letter")

	const syntax = new LuaRuntimeSyntax()
	syntax.Build()
	expect(syntax.IsPrefixOperator(tokenize("!a")[0]!)).toBe(true)

	expect(syntax.GetBinaryOperatorInfo(tokenize("a != 1")[1]!)).toBeTruthy()
	expect(syntax.GetBinaryOperatorInfo(tokenize("a && b")[1]!)).toBeTruthy()
	expect(syntax.GetBinaryOperatorInfo(tokenize("a || b")[1]!)).toBeTruthy()
})

{
	const gen_all_passes = (out: string[], prefix: string, parts: string[], psign: string, powers: string[]) => {
		let passes = []
		for (let p of parts) {
			passes.push(p)
		}
		for (let p of parts) {
			passes.push("." + p)
		}
		for (let a of parts) {
			for (let b of parts) {
				passes.push(a + "." + b)
			}
		}
		for (let a of passes) {
			out.push(prefix + a)
			for (let b of powers) {
				out.push(prefix + a + psign + b)
				out.push(prefix + a + psign + "-" + b)
				out.push(prefix + a + psign + "+" + b)
			}
		}
	}

	const random = (max: number) => {
		return Math.floor(Math.random() * max)
	}

	const random_range = (min: number, max: number) => {
		return random(max - min) + min
	}

	const dec = "0123456789"
	const hex = "0123456789abcdefABCDEF"

	const r = (l: string, min: number, max: number) => {
		let out = []
		for (let i = 0; i < random_range(min, max); i++) {
			let x = random(l.length)
			out.push(l.charAt(x))
		}
		return out.join("")
	}

	let decs = ["0", "0" + r(dec, 1, 3), "1", r(dec, 1, 3)]
	let hexs = ["0", "0" + r(hex, 1, 3), "1", r(hex, 1, 3)]

	let passes: string[] = []
	gen_all_passes(passes, "", decs, "e", decs)
	gen_all_passes(passes, "", decs, "E", decs)
	gen_all_passes(passes, "0x", hexs, "p", decs)
	gen_all_passes(passes, "0x", hexs, "P", decs)
	gen_all_passes(passes, "0X", hexs, "p", decs)
	gen_all_passes(passes, "0X", hexs, "P", decs)

	test("valid number literals", () => {
		let lines = []
		for (let [i, p] of passes.entries()) {
			lines.push("local x" + (i + 1) + " = " + p)
		}
		let input = lines.join("\n")

		// make sure the amount of tokens
		let tokens = tokenize(input)
		expect(tokens.length).toBe(lines.length * 4 + 1)

		// make sure all the tokens are numbers
		for (let i = 0; i < tokens.length - 1; i += 4) {
			expect(tokens[i + 3]!.type).toBe("number")
		}
	})
}
