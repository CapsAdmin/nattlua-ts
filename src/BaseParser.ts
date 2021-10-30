import { Code } from "./Code"
import { Helpers } from "./Helpers"
import { AnyParserNode, StatementNode } from "./LuaParser"
import { Token } from "./Token"

export class ParserNode {
	Type: "expression" | "statement" = "statement"
	Kind = "unknown"
	id = 0
	Parent: ParserNode | undefined
	standalone_letter?: ParserNode
	type_expression: ParserNode | undefined

	environment: "runtime" | "typesystem" = "runtime"

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
	i = 0
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
	IsType(token_type: Token["type"], offset = 0) {
		const tk = this.GetToken(offset)
		return tk && tk.type == token_type
	}
	IsValue(value: string, offset = 0) {
		const tk = this.GetToken(offset)
		return tk && tk.value == value
	}
	OnError(message: string, start: number, stop: number, ...args: any[]) {
		throw new Error(Helpers.FormatError(this.Code, message, start, stop, args))
	}
	Error(msg: string, start_token?: Token, stop_token?: Token, ...args: any[]) {
		const tk = this.GetToken()
		const start = start_token ? start_token.start : tk ? tk.start : 0
		const stop = stop_token ? stop_token.start : tk ? tk.stop : 0

		this.OnError(msg, start, stop, ...args)
	}
	private ErrorExpect(str: string, what: keyof Token, start?: Token, stop?: Token) {
		const tk = this.GetToken()
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
		const tk = this.GetToken()
		if (!tk) return null
		this.Advance(1)
		tk.parent = this.Nodes[0]
		return tk
	}

	StartNode<
		Type extends Extract<NodeTypes, { Kind: Kind }>["Type"],
		Kind extends Extract<NodeTypes, { Type: Type }>["Kind"],
	>(type: Type, kind: Kind): Extract<NodeTypes, { Type: Type; Kind: Kind }> {
		id++

		const node = new ParserNode()
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

	EndNode<T>(node: T) {
		this.Nodes.splice(1, 1)[0]
		return node
	}

	OnNode(node: ParserNode) {}

	AddTokens(tokens: Token[]) {
		const eof = this.Tokens.pop()

		if (!eof) return

		let i = 0
		for (const token of tokens) {
			if (token.type == "end_of_file") break
			this.Tokens.splice(this.i + i, 1, token)
			i++
		}

		this.Tokens.push(eof)
	}

	GetPreferTypesystem() {
		return false
	}

	ReadStatements(stop_token?: { [key: string]: boolean }) {
		const out = []
		for (let i = 0; i < this.GetLength(); i++) {
			const tk = this.GetToken()
			if (!tk) break
			if (stop_token && stop_token[tk.value]) break
			const node = this.ReadStatement()
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
