class Helpers {
    static LinePositionToSubPosition(code: string, line: number, character: number): number {
        let subPosition = 0;
        let lineCount = 0;
        for (let i = 0; i < code.length; i++) {
            if (code[i] === '\n') {
                lineCount++;
            }
            if (lineCount === line) {
                subPosition = i;
                break;
            }
        }
        return subPosition + character;
    }

    static SubPositionToLinePosition(code: string, start: number, stop: number): {
        characterStart: number,
        characterStop: number,

        lineStart: number,
        lineStop: number

        subLineBefore: [number, number],
        subLineAfter: [number, number]
    } {
        let lineStart = 0;
        let lineStop = 0;
        let characterStart = 0;
        let characterStop = 0;

        let subLineBefore = [0, 0] as [number, number];
        let subLineAfter = [0, 0] as [number, number];

        for (let i = 0; i < code.length; i++) {
            if (code[i] === '\n') {
                lineStart++;
                subLineBefore = [lineStart, i];
            }
            if (lineStart === start) {
                characterStart = i;
            }
            if (lineStart === stop) {
                characterStop = i;
                lineStop = lineStart;
                subLineAfter = [lineStart, i];
                break;
            }
        }

        return {
            characterStart,
            characterStop,
            lineStart,
            lineStop,
            subLineBefore,
            subLineAfter
        };
    }
}