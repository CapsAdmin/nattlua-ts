import { Helpers } from "./Helpers"

let code = "foo\nbar\nfaz"

test("LinePositionToSubPosition", () => {
    expect(Helpers.LinePositionToSubPosition(code, 0, 0)).toBe(0)
    expect(code.substr(Helpers.LinePositionToSubPosition(code, 1, 0))).toBe("\nbar\nfaz")
    expect(code.substr(Helpers.LinePositionToSubPosition(code, 1, 1))).toBe("bar\nfaz")
})

test("SubPositionToLinePosition", () => {
    expect(Helpers.SubPositionToLinePosition(code, 4)).toMatchObject({
        line: 1,
        character: 0
    })

    expect(Helpers.SubPositionToLinePosition(code, 5)).toMatchObject({
        line: 1,
        character: 1
    })
})

test("FindNearest", () => {
    let input = new TextEncoder().encode("§foolbars")
    let find = new TextEncoder().encode("olb")

    let pos = Helpers.FindNearest(input, find)

    expect(new TextDecoder().decode(input.slice(pos))).toBe("ars")
})