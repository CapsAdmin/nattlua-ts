import { Code } from "./Code.ts";
import { LuaLexer } from "./LuaLexer.ts";
import { LuaRuntimeSyntax } from "./LuaRuntimeSyntax.ts";
import { Token } from "./Token.ts";
import { expect } from "https://deno.land/x/tincan/mod.ts";

const tokenize = (codeString: string) => {
  const code = new Code(codeString);
  return new LuaLexer(code).GetTokens();
};

const one_token = (tokens: Token[]) => {
  expect(tokens).toHaveLength(2);
  expect(tokens[1]?.type).toBe("end_of_file");
  return tokens[0]!;
};

Deno.test("unclosed multiline comment", () => {
  expect(() => tokenize("--[[")).toThrow("Unclosed multiline comment");
});

Deno.test("smoke", () => {
  expect(tokenize("")[0]?.type).toBe("end_of_file");
  expect(one_token(tokenize("a")).type).toBe("letter");
  expect(one_token(tokenize("1")).type).toBe("number");
  expect(one_token(tokenize("(")).type).toBe("symbol");
});

Deno.test("shebang", () => {
  expect(tokenize("#!/usr/bin/env node\nfoo")[0]?.type).toBe("shebang");
});

Deno.test("single quote string", () => {
  expect(one_token(tokenize("'1'")).type).toBe("string");
  expect(() => tokenize("'1")).toThrow("quote to end");
  expect(() => tokenize("'1\n")).toThrow("quote to end");
});

Deno.test("double quote string", () => {
  expect(one_token(tokenize('"1"')).type).toBe("string");
  expect(() => tokenize('"1')).toThrow("quote to end");
  expect(() => tokenize('"1\n')).toThrow("quote to end");
});

Deno.test("unknown", () => {
  expect(one_token(tokenize("?")).type).toBe("unknown");
});

Deno.test("z escaped string", () => {
  expect(one_token(tokenize('"a\\z\na"')).type).toBe("string");
});

Deno.test("number..number", () => {
  expect(tokenize("1..20")).toHaveLength(4);
});

Deno.test("bom header", () => {
  expect(tokenize("1..20")).toHaveLength(4);
});

Deno.test("number annoation", () => {
  expect(tokenize("50ull")).toHaveLength(2);
  expect(tokenize("50uLL")).toHaveLength(2);
  expect(tokenize("50ULL")).toHaveLength(2);
  expect(tokenize("50LL")).toHaveLength(2);
  expect(tokenize("50lL")).toHaveLength(2);
});

Deno.test("decimal number", () => {
  expect(tokenize("0.01")).toHaveLength(2);
  expect(tokenize("0.000_001")).toHaveLength(2);
  expect(tokenize("0.000_00.1")).toHaveLength(3);
});

Deno.test("hex number", () => {
  expect(tokenize("0xABCDEF")).toHaveLength(2);
  expect(tokenize("0xabcdef")).toHaveLength(2);
  expect(tokenize("0xabc_def")).toHaveLength(2);
  expect(tokenize("0xabc_def.5")).toHaveLength(2);
  expect(() => tokenize("0xabc_def.5.5")).toThrow(
    "dot can only be placed once",
  );
  expect(() => tokenize("0xa??bc_def.5.5")).toThrow("malformed number");
});

Deno.test("bom header", () => {
  expect(tokenize("\xfe\xff1")).toHaveLength(2);
  expect(tokenize("\xef\xbb\xbf1")).toHaveLength(2);
});

Deno.test("luajit binary number", () => {
  expect(tokenize("0b010101")).toHaveLength(2);
  expect(tokenize("0b0_101_01 0b101")).toHaveLength(3);
  expect(tokenize("0b101ull")).toHaveLength(2);
  expect(() => tokenize("0b010101.5.5")).toThrow("malformed number");
});
Deno.test("...", () => {
  expect(one_token(tokenize("...")).type).toBe("symbol");
});

Deno.test("comment escape", () => {
  let i = 0;
  let tokens: Token[];
  const check = (what: string) => {
    expect(tokens[i]!.value).toBe(what);
    i++;
  };

  tokens = tokenize("a--[[#1]]--[[#1]]a--[[#1]]");
  i = 0;

  check("a");
  check("1");
  check("1");
  check("a");
  check("1");
  check("");

  tokens = tokenize(
    "function foo(str--[[#: string]], idx--[[#: number]], msg--[[#: string]]) end",
  );
  i = 0;

  check("function");
  check("foo");
  check("(");
  check("str");
  check(":");
  check("string");
  check(",");
  check("idx");
  check(":");
  check("number");
  check(",");
  check("msg");
  check(":");
  check("string");
  check(")");
  check("end");
});

Deno.test("multiline comments", () => {
  expect(tokenize("--[[foo]]")).toHaveLength(1);
  expect(tokenize("--[=[foo]=]")).toHaveLength(1);
  expect(tokenize("--[==[foo]==]")).toHaveLength(1);
  expect(tokenize("--[=======[foo]=======]")).toHaveLength(1);
  expect(tokenize("--[=TESTSUITE\n-- utilities\nlocal ops = {}\n--]=]"))
    .toHaveLength(6);
  expect(
    tokenize(
      "foo--[[]].--[[]]bar--[[]]:--[==[]==]test--[[]](--[=[]=]1--[[]]--[[]],2--[[]])--------[[]]--[[]]--[===[]]",
    ),
  ).toHaveLength(11);
});

Deno.test("comments", () => {
  expect(tokenize("local -- a\na")).toHaveLength(3);
  expect(tokenize("local // a\na")).toHaveLength(3);
  expect(tokenize("local /*f*/ a\na")).toHaveLength(4);
  expect(tokenize("local --[[f]] a\na")).toHaveLength(4);
});

Deno.test("multiline string", () => {
  expect(tokenize("a = [[a]]")).toHaveLength(4);
  expect(tokenize("a = [=[a]=]")).toHaveLength(4);
  expect(tokenize("a = [==[a]==]")).toHaveLength(4);
  expect(() => tokenize("a = [=a")).toThrow("expected multiline string");
  expect(() => tokenize("a = [[a")).toThrow("expected multiline string");
});

Deno.test("multiline error", () => {
  expect(() => {
    tokenize("--[[");
  }).toThrow("Unclosed multiline comment");
});

Deno.test("pow exponent error", () => {
  expect(() => {
    tokenize("local x = 0e+LOL");
  }).toThrow("malformed exponent expected number");
});

Deno.test("unicode", () => {
  expect(tokenize("????=????+????")).toHaveLength(6);
  expect(tokenize("foo(???????????????????????????????????????)")).toHaveLength(5);
  expect(
    tokenize(
      "foo(?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????)",
    ),
  ).toHaveLength(5);
});
Deno.test("glua", () => {
  expect(one_token(tokenize("/**/foo")).type).toBe("letter");
  expect(one_token(tokenize("/*B*/foo")).type).toBe("letter");
  expect(one_token(tokenize("/*-----*/foo")).type).toBe("letter");
  expect(one_token(tokenize("--asdafsadw\nfoo--awsad asd")).type).toBe(
    "letter",
  );

  const syntax = new LuaRuntimeSyntax();
  syntax.Build();
  expect(syntax.IsPrefixOperator(tokenize("!a")[0]!)).toBe(true);

  expect(syntax.GetBinaryOperatorInfo(tokenize("a != 1")[1]!)).toBeTruthy();
  expect(syntax.GetBinaryOperatorInfo(tokenize("a && b")[1]!)).toBeTruthy();
  expect(syntax.GetBinaryOperatorInfo(tokenize("a || b")[1]!)).toBeTruthy();
});

{
  const gen_all_passes = (
    out: string[],
    prefix: string,
    parts: string[],
    psign: string,
    powers: string[],
  ) => {
    const passes = [];
    for (const p of parts) {
      passes.push(p);
    }
    for (const p of parts) {
      passes.push("." + p);
    }
    for (const a of parts) {
      for (const b of parts) {
        passes.push(a + "." + b);
      }
    }
    for (const a of passes) {
      out.push(prefix + a);
      for (const b of powers) {
        out.push(prefix + a + psign + b);
        out.push(prefix + a + psign + "-" + b);
        out.push(prefix + a + psign + "+" + b);
      }
    }
  };

  const random = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  const random_range = (min: number, max: number) => {
    return random(max - min) + min;
  };

  const dec = "0123456789";
  const hex = "0123456789abcdefABCDEF";

  const r = (l: string, min: number, max: number) => {
    const out = [];
    for (let i = 0; i < random_range(min, max); i++) {
      const x = random(l.length);
      out.push(l.charAt(x));
    }
    return out.join("");
  };

  const decs = ["0", "0" + r(dec, 1, 3), "1", r(dec, 1, 3)];
  const hexs = ["0", "0" + r(hex, 1, 3), "1", r(hex, 1, 3)];

  const passes: string[] = [];
  gen_all_passes(passes, "", decs, "e", decs);
  gen_all_passes(passes, "", decs, "E", decs);
  gen_all_passes(passes, "0x", hexs, "p", decs);
  gen_all_passes(passes, "0x", hexs, "P", decs);
  gen_all_passes(passes, "0X", hexs, "p", decs);
  gen_all_passes(passes, "0X", hexs, "P", decs);

  Deno.test("valid number literals", () => {
    const lines = [];
    for (const [i, p] of passes.entries()) {
      lines.push("local x" + (i + 1) + " = " + p);
    }
    const input = lines.join("\n");

    // make sure the amount of tokens
    const tokens = tokenize(input);
    expect(tokens.length).toBe(lines.length * 4 + 1);

    // make sure all the tokens are numbers
    for (let i = 0; i < tokens.length - 1; i += 4) {
      expect(tokens[i + 3]!.type).toBe("number");
    }
  });
}
