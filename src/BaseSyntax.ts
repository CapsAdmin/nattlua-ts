import { BaseLexer } from "./BaseLexer"
import { LuaLexer } from "./LuaLexer"
import { Token } from "./Token"

const B = (str: string) => str.charCodeAt(0)
export abstract class BaseSyntax {
	abstract SymbolCharacters: string[]
	abstract NumberAnnotations: string[]
	abstract Keywords: string[]
	abstract NonStandardKeywords: string[]
	abstract KeywordValues: string[]
	abstract PrefixOperators: string[]
	abstract PostfixOperators: string[]
	abstract PrimaryBinaryOperators: string[]
	abstract BinaryOperators: string[][]
	abstract BinaryOperatorFunctionTranslate: { [key: string]: string }
	abstract PrefixOperatorFunctionTranslate: { [key: string]: string }
	abstract PostfixOperatorFunctionTranslate: { [key: string]: string }

	IsLetter(c: number) {
		return (c >= B("a") && c <= B("z")) || (c >= B("A") && c <= B("Z")) || c == B("_") || c == B("@") || c >= 127
	}

	IsDuringLetter(c: number) {
		return (
			(c >= B("a") && c <= B("z")) ||
			(c >= B("0") && c <= B("9")) ||
			(c >= B("A") && c <= B("Z")) ||
			c == B("_") ||
			c == B("@") ||
			c >= 127
		)
	}

	IsNumber(c: number) {
		return c >= B("0") && c <= B("9")
	}

	IsSpace(c: number) {
		return c > 0 && c <= 32
	}

	IsSymbol(c: number) {
		return (
			c != B("_") &&
			((c >= B("!") && c <= B("/")) ||
				(c >= B(":") && c <= B("?")) ||
				(c >= B("[") && c <= B("`")) ||
				(c >= B("{") && c <= B("~")))
		)
	}

	symbols: string[] = []
	lookup: { [key: string]: string[] } = {}
	binary_operator_info: { [key: string]: { left_priority: number; right_priority: number } } = {}

	PrimaryBinaryOperatorsLookup = new Set<string>()
	PrefixOperatorsLookup = new Set<string>()
	PostfixOperatorsLookup = new Set<string>()
	KeywordValuesLookup = new Set<string>()
	NonStandardKeywordLookup = new Set<string>()
	KeywordLookup = new Set<string>()

	IsPrimaryBinaryOperator(token: Token) {
		return this.PrimaryBinaryOperatorsLookup.has(token.value)
	}

	IsPrefixOperator(token: Token) {
		return this.PrefixOperatorsLookup.has(token.value)
	}

	IsPostfixOperator(token: Token) {
		return this.PostfixOperatorsLookup.has(token.value)
	}

	IsKeyword(token: Token) {
		return this.KeywordLookup.has(token.value)
	}

	IsKeywordValue(token: Token) {
		return this.KeywordValuesLookup.has(token.value)
	}

	IsNonStandardKeyword(token: Token) {
		return this.NonStandardKeywordLookup.has(token.value)
	}

	GetSymbols() {
		return this.symbols
	}
	GetFunctionForBinaryOperator(token: Token) {
		return this.lookup[token.value]
	}
	GetFunctionForPrefixOperator(token: Token) {
		return this.lookup[token.value]
	}

	GetFunctionForPostfixOperator(token: Token) {
		return this.lookup[token.value]
	}
	GetBinaryOperatorInfo(tk: Token) {
		return this.binary_operator_info[tk.value]
	}
	ReadNumberAnnotation(lexer: BaseLexer) {
		for (let annotation of this.NumberAnnotations) {
			if (lexer.GetString(lexer.GetPosition(), lexer.GetPosition() + annotation.length - 1) == annotation) {
				lexer.Advance(annotation.length)
				return true
			}
		}
		return false
	}
	ReadSymbol(lexer: BaseLexer) {
		for (let annotation of this.GetSymbols()) {
			if (lexer.GetString(lexer.GetPosition(), lexer.GetPosition() + annotation.length - 1) == annotation) {
				lexer.Advance(annotation.length)
				return true
			}
		}
		return false
	}
	IsValue(token: Token) {
		if (token.type == "number" || token.type == "string") return true
		if (this.IsKeywordValue(token)) return true
		if (this.IsKeyword(token)) return false
		if (token.type == "letter") return true
		return false
	}

	GetTokenType(token: Token) {
		if (token.type == "letter" && this.IsKeyword(token)) {
			return "keyword"
		} else if (token.type == "symbol") {
			if (this.IsPrefixOperator(token)) {
				return "operator_prefix"
			} else if (this.IsPostfixOperator(token)) {
				return "operator_postfix"
			} else if (this.GetBinaryOperatorInfo(token)) {
				return "operator_binary"
			}
		}

		return token.type
	}

	Build() {
		const add_symbols = (tbl: typeof this.SymbolCharacters) => {
			for (let symbol of tbl) {
				if (/[^\p{L}\d\s@#]/u.test(symbol)) {
					this.symbols.push(symbol)
				}
			}
		}

		// extend the symbol characters from grammar rules
		{
			const add_binary_symbols = (tbl: typeof this.BinaryOperators) => {
				for (let group of tbl) {
					for (let token of group) {
						if (token.substr(0, 1) == "R") {
							token = token.substr(1, 1)
						}
						this.symbols.push(token)
					}
				}
			}

			add_binary_symbols(this.BinaryOperators)
			add_symbols(this.PrefixOperators)
			add_symbols(this.PostfixOperators)
			add_symbols(this.PrimaryBinaryOperators)

			for (let str of this.SymbolCharacters) {
				this.symbols.push(str)
			}
		}

		{
			for (let [k, v] of Object.entries(this.BinaryOperatorFunctionTranslate)) {
				let [, a, b, c] = Array.from(v.match(/(.*)A(.*)B(.*)/)?.values() || [])
				if (a && b && c) {
					this.lookup[k] = [" " + a, b, c + " "]
				}
			}

			for (let [k, v] of Object.entries(this.PrefixOperatorFunctionTranslate)) {
				let [, a, b] = Array.from(v.match(/(.*)A(.*)B/)?.values() || [])
				if (a && b) {
					this.lookup[k] = [" " + a, b + " "]
				}
			}

			for (let [k, v] of Object.entries(this.PostfixOperatorFunctionTranslate)) {
				let [, a, b] = Array.from(v.match(/(.*)A(.*)/)?.values() || [])
				if (a && b) {
					this.lookup[k] = [" " + a, b + " "]
				}
			}

			for (let [priority, group] of this.BinaryOperators.entries()) {
				for (let token of group) {
					if (token.substr(0, 1) == "R") {
						this.binary_operator_info[token.substr(1, 1)] = {
							left_priority: priority + 1,
							right_priority: priority,
						}
					} else {
						this.binary_operator_info[token] = {
							left_priority: priority,
							right_priority: priority,
						}
					}
				}
			}

			for (let key in this.PrimaryBinaryOperators) {
				this.PrimaryBinaryOperatorsLookup.add(key)
			}

			for (let key in this.PrefixOperators) {
				this.PrefixOperatorsLookup.add(key)
			}

			for (let key in this.PostfixOperators) {
				this.PostfixOperatorsLookup.add(key)
			}

			for (let key in this.KeywordValues) {
				this.KeywordValuesLookup.add(key)
			}

			for (let key in this.KeywordValues) {
				this.KeywordLookup.add(key)
			}

			for (let key in this.Keywords) {
				this.KeywordLookup.add(key)
			}

			for (let key in this.NonStandardKeywords) {
				this.NonStandardKeywordLookup.add(key)
			}
		}
	}
}
