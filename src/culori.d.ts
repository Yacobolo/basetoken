declare module "culori" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Color = Record<string, any> | string;

  export function parse(color: string): Color | undefined;
  export function formatHex(color: Color): string;
  export function formatHsl(color: Color): string;
  export function formatRgb(color: Color): string;
  export function oklch(color: Color): Oklch | undefined;

  export interface Oklch {
    mode: "oklch";
    l: number;
    c: number;
    h?: number;
  }
}
