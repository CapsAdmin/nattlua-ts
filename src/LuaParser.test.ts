import { BaseParser } from "./BaseParser"
import { LuaEmitter } from "./LuaEmitter"
import { LuaLexer } from "./LuaLexer"

const check = (code: string) => {
    let lexer = new LuaLexer(code)
    let parser = new BaseParser(lexer.GetTokens())
    let ast = parser.ReadNode()
    let emitter = new LuaEmitter()
    emitter.EmitStatement(ast!)
    expect(emitter.Concat()).toBe(code)
}

test("smoke", () => {
    check("return 1+1")
    check("return\n1+ 1")
})