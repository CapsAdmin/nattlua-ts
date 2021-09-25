import { Token, TokenType } from "./Token";

export class ParserNode {
    Type: "expression" | "statement" = "statement"
    Kind: string = "unknown"
    id: number = 0
    Code: string = ""
    Name: string = ""

    Tokens: { [key: string]: Token } = {};

    ToString() {

    }
    IsWrappedInParenthesis() {
        return this.Tokens["("] && this.Tokens[")"]
    }

    GetLength() {

    }
}