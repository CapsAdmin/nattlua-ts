import { Code } from "./Code"
import { Helpers } from "./Helpers"
import { AnyParserNode, StatementNode } from "./LuaParser"
import { Token } from "./Token"

export class ParserNode {
	Type: "expression" | "statement" = "statement"
	Kind: string = "unknown"
	id: number = 0
	Code: Code
	Parent: ParserNode | undefined
	Parser: BaseParser

	standalone_letter?: ParserNode
	parser_call?: boolean
	type_expression?: ParserNode

	identifier?: Token | null

	constructor(parser: BaseParser, code: Code) {
		this.Parser = parser
		this.Code = code
	}

	Tokens: {
		["("]?: Token[]
		[")"]?: Token[]
		[":"]?: Token
		["as"]?: Token
		["is"]?: Token
	} = {}

	ToString() {}
	IsWrappedInParenthesis() {
		return this.Tokens["("] && this.Tokens[")"]
	}

	GetLength() {}
	End() {
		this.Parser.Nodes.splice(1, 1)[0]
		return this
	}
}

let id = 0

export class BaseParser<NodeTypes extends ParserNode> {
	Tokens: Token[] = []
	Nodes: ParserNode[] = []
	CurrentStatement?: ParserNode
	CurrentExpression?: ParserNode
	Code: Code
	config: {
		path?: string
		on_statement?: <T>(node: T) => T | undefined
	} = {}
	i: number = 0
	constructor(tokens: Token[], code: Code) {
		this.Tokens = tokens
		this.Code = code
	}
	GetToken(offset = 0) {
		return this.Tokens[this.i + offset]
	}
	GetLength() {
		return this.Tokens.length
	}
	Advance(offset: number) {
		this.i += offset
	}
	IsType(token_type: Token["type"], offset: number = 0) {
		let tk = this.GetToken(offset)
		return tk && tk.type == token_type
	}
	IsValue(value: string, offset: number = 0) {
		let tk = this.GetToken(offset)
		return tk && tk.value == value
	}
	OnError(message: string, start: number, stop: number, ...args: any[]) {
		let reg = new RegExp(/(\$\d)/g)
		let indexString // $1, $2, $3, etc
		while ((indexString = reg.exec(message))) {
			let found = indexString[0]
			if (!found) break
			let index = parseInt(found.slice(1))
			message = message.replace(found, "「" + args[index - 1] + "」")
		}

		let code = this.Code.GetString()
		let { line: startLine, character: startCharacter } = Helpers.SubPositionToLinePosition(code, start)
		let { line: stopLine, character: stopCharacter } = Helpers.SubPositionToLinePosition(code, stop)

		let before = this.Code.Substring(0, start)
		let middle = this.Code.Substring(start, stop)
		let after = this.Code.Substring(stop, this.Code.GetLength())

		let name = this.Code.Name + ":" + startLine + ":" + startCharacter

		throw new Error(message)
	}
	Error(msg: string, start_token?: Token, stop_token?: Token, ...args: any[]) {
		let tk = this.GetToken()
		let start = start_token ? start_token.start : tk ? tk.start : 0
		let stop = stop_token ? stop_token.start : tk ? tk.stop : 0

		this.OnError(msg, start, stop, ...args)
	}
	private ErrorExpect(str: string, what: keyof Token, start?: Token, stop?: Token) {
		let tk = this.GetToken()
		if (!tk) {
			return this.Error("expected $1 $2: reached end of code", start, stop, what, str)
		}
		this.Error("expected $1 $2: got $3", start, stop, what, str, tk[what])
	}
	ExpectType(token_type: Token["type"], error_start?: Token, error_stop?: Token) {
		if (!this.IsType(token_type)) {
			this.ErrorExpect(token_type, "type", error_start, error_stop)
		}
		return this.ReadToken()!
	}
	ExpectValue(value: string, error_start?: Token, error_stop?: Token) {
		if (!this.IsValue(value)) {
			this.ErrorExpect(value, "value", error_start, error_stop)
		}
		return this.ReadToken()!
	}

	ReadToken() {
		let tk = this.GetToken()
		if (!tk) return null
		this.Advance(1)
		tk.parent = this.Nodes[0]
		return tk
	}

	Node<
		Type extends Extract<NodeTypes, { Kind: Kind }>["Type"],
		Kind extends Extract<NodeTypes, { Type: Type }>["Kind"],
	>(type: Type, kind: Kind): Extract<NodeTypes, { Type: Type; Kind: Kind }> {
		id++

		let node = new ParserNode(this, this.Code) as NodeTypes
		node.Type = type
		node.Kind = kind

		if (type == "expression") {
			this.CurrentExpression = node
		} else {
			this.CurrentStatement = node
		}

		this.OnNode(node)

		node.Parent = this.Nodes[0]
		this.Nodes.unshift(node)

		return node as Extract<NodeTypes, { Type: Type; Kind: Kind }>
	}

	OnNode(node: ParserNode) {}

	AddTokens(tokens: Token[]) {
		let eof = this.Tokens.pop()

		if (!eof) return

		let i = 0
		for (let token of tokens) {
			if (token.type == "end_of_file") break
			this.Tokens.splice(this.i + i, 1, token)
			i++
		}

		this.Tokens.push(eof)
	}

	GetPreferTypesystem() {
		return false
	}

	ReadStatements(stop_token: { [key: string]: boolean }) {
		let out = []
		for (let i = 0; i < this.GetLength(); i++) {
			let tk = this.GetToken()
			if (!tk) break
			if (stop_token && stop_token[tk.value]) break
			let node = this.ReadStatement()
			if (!node) break
			out[i] = node

			if (this.config && this.config.on_statement) {
				out[i] = this.config.on_statement(out[i]!) || out[i]!
			}
		}
		return out
	}
	ReadStatement(): StatementNode | undefined {
		if (this.IsType("end_of_file")) return undefined

		return undefined
	}
}
