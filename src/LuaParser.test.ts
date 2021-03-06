import { Code } from "./Code.ts";
import { LuaEmitter } from "./LuaEmitter.ts";
import { LuaLexer } from "./LuaLexer.ts";
import { LuaParser } from "./LuaParser.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

const check = (codeString: string, expectedCode?: string) => {
  const code = new Code(codeString);
  const lexer = new LuaLexer(code);
  const parser = new LuaParser(lexer.GetTokens(), code);
  const statements = parser.ReadStatements();
  const emitter = new LuaEmitter();
  emitter.EmitStatements(statements);
  expect(emitter.GetCode()).toBe(expectedCode || codeString);
};

Deno.test("smoke", () => {
  check("return 1+1");
  check("return\n1+ 1");
});

Deno.test("end of file comment", () => {
  check("--test");
});

Deno.test("parenthesis", () => {
  check("local a = 1 + (--[[bar]] 2 --[[faz]] + (3)--[[foo]])");
});

Deno.test("multiline string", () => {
  check("local a = [==[test]==] --foo");
  expect(() => check("a = [[a")).toThrow("expected multiline string");
});

Deno.test("expression", () => {
  check("return 1 + 2");
  check("return 1 - 2");
  check("return 1 * 2");
  check("return 1 / 2");
  check("return 1 % 2");
  check("return 1 ^ 2");
  check("return 1 + (1+2)");
  check("return 1 .. 2");
  check("return foo:Bar(1,2,3)");
  check("local a = a++");
  check("local a = -a");
});

Deno.test("type code", () => {
  check("§foo");
});

Deno.test("parser code", () => {
  check("£foo");
});

Deno.test("table", () => {
  check("return {1}");
  check("return {[key] = val}");
  check("return {key = val}");
  check("return {1,2}");
  check("return {1,2,}");
  check("return {...{}}", "return table.mergetables {{}}");
  check("return {...({})}", "return table.mergetables {({})}");
  check("return {a, ...foo}", "return table.mergetables {a,foo}");
  check(
    "return {a, foo=true, ...foo, lol=false}",
    "return table.mergetables {a,{ foo=true,},foo,{ lol=false}}",
  );
});

Deno.test("idiv", () => {
  check("return 10//3", "return 10/idiv/3");
});

Deno.test("function", () => {
  check("function foo(lol) return 1+1 end");
  check("function foo(lol, ...) end");
  check("function foo() end");
  check("function foo(): foo: bar end");
  check("function foo.bar(lol, ...) end");
  check("function foo.bar:Faz(lol, ...) end");
  check("function foo.bar:Faz(lol, ...): boolean end");
  check("function foo.bar:Faz(lol, ...): boolean, foo end");
  check("local function foo(lol, ...) return 1+1 end");
  check("local x = function(lol, ...) return 1+1 end");
});

Deno.test("analyzer function", () => {
  check("analyzer function foo() return 1+1 end");
  check("analyzer function foo(lol: any, lol2: any) return 1+1 end");
  check("analyzer function foo(lol: any, ...: ...any): boolean end");
  check("analyzer function foo(lol: any, ...: ...any): boolean, foo end");
  check("analyzer function foo(lol: any, ...: ...any) end");
  check("analyzer function foo.bar(lol: any, ...: ...any) end");
  check("analyzer function foo.bar:Faz(lol: any, ...: ...any) end");
  check("local analyzer function foo(lol: any, ...: ...any) return 1+1 end");
  check("local x = analyzer function(lol: any, ...: ...any) return 1+1 end");
});

Deno.test("type function", () => {
  check("type function foo(lol: any, lol2: any) return 1+1 end");
  check("type function foo(lol: any, ...: ...any) end");
  check("type function foo.bar(lol: any, ...: ...any) end");
  check("type function foo.bar:Faz(lol: any, ...: ...any) end");
  check("local type function foo(lol: any, ...: ...any) return 1+1 end");
  check("local x = type function(lol: any, ...: ...any) return 1+1 end");
});

Deno.test("if", () => {
  check("if true then end");
  check("if true then elseif true then end");
  check("if true then elseif true then else end");
  check("if true then else end");
  expect(() => check("if true then else")).toThrow("'else' or 'elseif'");
});

Deno.test("semicolon", () => {
  check("local x = 1;");
  check("local x = 1;;;");
  check(";;;");
});
Deno.test("goto", () => {
  check("goto foo");
  check("::foo::");
});

Deno.test("for", () => {
  check("for i = 1, 10 do end");
  check("for i = 1, 10, 4 do end");
  check("for i = 1+2, 1-10, 4+2 do continue end");
  check("for a,b,c in 1+2,3+4,4+5 do break end");
});

Deno.test("assignment", () => {
  check("local foo = 1");
  check("local foo, bar = 1, 2");
  check("local foo, bar");

  check("foo.bar = 1");
  check("foo.bar, foo.faz = 1, 2");

  check(
    "local {a,b,c} = {1,2,3}",
    'local a,b,c =table.destructure( {1,2,3}, {"a", "b", "c"})',
  );
  check(
    "local default, {a,b,c} = {1,2,3}",
    'local  default,a,b,c =table.destructure( {1,2,3}, {"a", "b", "c"}, true)',
  );
  check(
    "default, {a,b,c} = {1,2,3}",
    ' default,a,b,c =table.destructure( {1,2,3}, {"a", "b", "c"}, true)',
  );
  check(
    "{a,b,c} = {1,2,3}",
    'a,b,c =table.destructure( {1,2,3}, {"a", "b", "c"})',
  );
});

Deno.test("do statement", () => {
  check("do end");
  check("while true do end");
});

Deno.test("call", () => {
  check("foo.bar['faz'][1+2](1,2)");
  check("foo.bar()");
  check("foo.bar(1,2)");
  check("bar{}");
  check('bar""');
  check("bar''");
  check("bar[[]]");
  check("foo:bar(1,2)");
});

Deno.test("repeat", () => {
  check("repeat until true");
});

Deno.test("type assignment", () => {
  check("type a = 1");
  check("type a,b = 1,2");
  check("local type a = 1");
  check("local type a,b = 1,2");
  check("local a = x as boolean");
  check("local a: boolean = x");

  check("type a = x as boolean");
  check("type a: boolean = x");
  check("type ^string = foo");
  check("type MyTable = {[number] = string}");
});

Deno.test("function signature", () => {
  check("type a = function=()>()");
  check("type a = function=(a: number, b, c)>(boolean)");
  check("type a = function=(a: number, b, c)>(boolean, number)");
});

Deno.test("type string", () => {
  check("local type a = $'lol'");
});

Deno.test("union", () => {
  check("local type a = |");
});
