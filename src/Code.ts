import { Helpers } from "./Helpers.ts";

export class Code {
  Buffer: Uint8Array;
  Name: string;
  constructor(code: string, name?: string) {
    this.Buffer = new TextEncoder().encode(code);
    if (name !== undefined) {
      this.Name = name;
    } else {
      this.Name = this.Substring(0, 8) + "...";
    }
  }

  Substring(start: number, stop: number): string {
    const ab = this.Buffer.slice(start, stop);

    return new TextDecoder().decode(ab);
  }
  GetString(): string {
    return new TextDecoder().decode(this.Buffer);
  }

  GetLength(): number {
    return this.Buffer.length;
  }

  GetByte(pos: number): number {
    const byte = this.Buffer[pos];
    if (byte !== undefined) {
      return byte;
    }
    return 0;
  }

  FindNearest(str: string, from: number) {
    return Helpers.FindNearest(
      this.Buffer,
      new TextEncoder().encode(str),
      from,
    );
  }
}
