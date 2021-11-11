import { LuaAnalyzer } from "./Analyzer.ts";
import { Code } from "./Code.ts";
import { LuaLexer } from "./LuaLexer.ts";
import { LuaParser } from "./LuaParser.ts";
import { LexicalScope } from "./Scope.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

Deno.test("lol", () => {
  const code = new Code("return 1 + 1");
  const lexer = new LuaLexer(code);
  const tokens = lexer.GetTokens();
  const parser = new LuaParser(tokens, code);
  const statements = parser.ReadStatements();

  const analyzer = new LuaAnalyzer();
  const scope = new LexicalScope(undefined, 0);
  analyzer.PushScope(scope);
  analyzer.AnalyzeStatements(statements);
  analyzer.PopScope();

  expect(analyzer.returns[0]![0]?.Data).toEqual(2);
});
