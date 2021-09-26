import { Parser } from "prettier";
import { Helpers } from "./Helpers";
import { Token, TokenType } from "./Token";

interface ValueNode extends ParserNode {
    value: Token
}

interface TypeCodeStatement extends ParserNode {
    value: ValueNode
    lua_code: ValueNode
}

interface ParserCodeStatement extends ParserNode {
    value: ValueNode
    lua_code: ValueNode
}

export class ParserNode {
    Type: "expression" | "statement" = "statement"
    Kind: string = "unknown"
    id: number = 0
    Code: string = ""
    Name: string = ""
    Parent: ParserNode | undefined
    Parser: BaseParser

    constructor(parser: BaseParser, name: string, code: string) {
        this.Parser = parser
    }

    Tokens: { [key: string]: Token } = {};

    ToString() {
       
    }
    IsWrappedInParenthesis() {
        return this.Tokens["("] && this.Tokens[")"]
    }

    GetLength() {

    }

    End() {
        this.Parser.Nodes.splice(1,1)[0]
        return this
    }
}

let id =0

export class BaseParser {
    Tokens: Token[] = []
    Nodes: ParserNode[] = []
    CurrentStatement?: ParserNode
    CurrentExpression?: ParserNode
    Code: string = ""
    Name: string = ""
    i: number = 0
    constructor(tokens: Token[]) {
        this.Tokens = tokens
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
    IsType(token_type: TokenType, offset: number = 0) {
        let tk = this.GetToken(offset)
        return tk && tk.type == token_type
    }
    OnError(code: string, name: string, message: string, start: number, stop: number, ...args: any[]) {
        console.error(name, message, start, stop, args)
        throw new Error(message)
    }
    Error(msg: string, start_token?: Token, stop_token?: Token, ...args: any[]) {
        let tk = this.GetToken()
        let start = start_token ? start_token.start : tk ? tk.start : 0
        let stop = start_token ? start_token.start : tk ? tk.start : 0

        this.OnError(this.Code, this.Name, msg, start, stop, ...args)
    }
    private ErrorExpect(str: string, what: keyof Token, start?: Token, stop?: Token) {
        let tk = this.GetToken()
        if (!tk) {
            return this.Error("expected $1 $2: reached end of code", start, stop, what, str)
        }
        this.Error("expected $1 $2: got $3", start, stop, what, str, tk[what])
    }
    ExpectType(token_type: TokenType, error_start?: Token, error_stop?: Token) {
        if (!this.IsType(token_type)) {
            this.ErrorExpect(token_type, "type", error_start, error_stop)
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

    Node(type: ParserNode["Type"], kind: string) {
        id++

        let node = new ParserNode(this, this.Name, this.Code)
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
        
        return node
    }


    OnNode(node: ParserNode) {
    }

    ReadDebugCode() {
        if (this.IsType("type_code")) {
            let node = this.Node("statement", "type_code") as TypeCodeStatement
            let code = this.Node("expression", "value") as ValueNode
            code.value = this.ExpectType("type_code")
            code.End();
            node.lua_code = code
            return node.End()
        } else if (this.IsType("parser_code")) {
            let token = this.ExpectType("parser_code")
            let node = this.Node("statement", "parser_code") as ParserCodeStatement
            let code = this.Node("expression", "value") as ValueNode
            code.value = token
            node.lua_code = code.End()
            return node.End()
        }
    }
 
    ReadNode() {
        if (this.IsType("end_of_file")) return

        return this.ReadDebugCode()
    }
}