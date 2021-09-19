import { BaseSyntax } from "./BaseSyntax"

export class LuaRuntimeSyntax extends BaseSyntax {
	SymbolCharacters = [",", ";", "(", ")", "{", "}", "[", "]", "=", "::", '"', "'", "<|", "|>"]
	NumberAnnotations = ["ull", "ll", "ul", "i"]
	Keywords = [
		"do",
		"end",
		"if",
		"then",
		"else",
		"elseif",
		"for",
		"in",
		"while",
		"repeat",
		"until",
		"break",
		"return",
		"local",
		"function",
		"and",
		"not",
		"or",

		// these are just to make sure all code is covered by tests
		"ÆØÅ",
		"ÆØÅÆ",
	]
	NonStandardKeywords = ["continue", "import", "literal", "mutable"]
	KeywordValues = ["...", "nil", "true", "false"]
	PrefixOperators = ["-", "#", "not", "!", "~", "supertype"]
	PostfixOperators = [
		// these are just to make sure all code is covered by tests
		"++",
		"ÆØÅ",
		"ÆØÅÆ",
	]
	BinaryOperators = [
		["or", "||"],
		["and", "&&"],
		["<", ">", "<=", ">=", "~=", "==", "!="],
		["|"],
		["~"],
		["&"],
		["<<", ">>"],
		["R.."], // right associative
		["+", "-"],
		["*", "/", "/idiv/", "%"],
		["R^"], // right associative
	]

	PrimaryBinaryOperators = [".", ":"]
	BinaryOperatorFunctionTranslate = {
		">>": "bit.rshift(A, B)",
		"<<": "bit.lshift(A, B)",
		"|": "bit.bor(A, B)",
		"&": "bit.band(A, B)",
		"//": "math.floor(A / B)",
		"~": "bit.bxor(A, B)",
	}

	PrefixOperatorFunctionTranslate = { ["~"]: "bit.bnot(A)" }
	PostfixOperatorFunctionTranslate = {
		["++"]: "(A+1)",
		["ÆØÅ"]: "(A)",
		["ÆØÅÆ"]: "(A)",
	}
}
