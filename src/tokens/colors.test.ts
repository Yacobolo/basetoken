import { describe, expect, test } from "vitest";
import { hexToOklch, hexToHsl, hexToRgb, normalizeHex, formatColor, getHue } from "./colors";

describe("hexToOklch", () => {
  test("converts a primary color", () => {
    const result = hexToOklch("#6750A4");
    expect(result).toMatch(/^oklch\(\d+\.\d+ \d+\.\d+ \d+\)$/);
  });

  test("pure black is achromatic", () => {
    const result = hexToOklch("#000000");
    expect(result).toBe("oklch(0.00 0 0)");
  });

  test("pure white is achromatic", () => {
    const result = hexToOklch("#FFFFFF");
    expect(result).toBe("oklch(1.00 0 0)");
  });

  test("mid-gray is achromatic", () => {
    const result = hexToOklch("#808080");
    expect(result).toMatch(/^oklch\(\d+\.\d+ 0 0\)$/);
  });

  test("formats L with 2 decimals, C with 3 decimals, H as integer", () => {
    const result = hexToOklch("#769CDF");
    const parts = result.match(/oklch\((\S+) (\S+) (\S+)\)/);
    expect(parts).not.toBeNull();
    // L: 2 decimal places
    expect(parts![1]).toMatch(/^\d+\.\d{2}$/);
    // C: 3 decimal places
    expect(parts![2]).toMatch(/^\d+\.\d{3}$/);
    // H: integer
    expect(parts![3]).toMatch(/^\d+$/);
  });

  test("throws on invalid hex", () => {
    expect(() => hexToOklch("not-a-color")).toThrow("Invalid hex color");
  });

  test("handles 3-char hex shorthand", () => {
    const result = hexToOklch("#fff");
    expect(result).toBe("oklch(1.00 0 0)");
  });

  test("handles hex without hash", () => {
    const result = hexToOklch("769CDF");
    expect(result).toMatch(/^oklch\(/);
  });
});

describe("hexToHsl", () => {
  test("converts a color to HSL string", () => {
    const result = hexToHsl("#6750A4");
    expect(result).toMatch(/^hsl\(/);
  });

  test("throws on invalid hex", () => {
    expect(() => hexToHsl("not-a-color")).toThrow("Invalid hex color");
  });
});

describe("hexToRgb", () => {
  test("converts a color to RGB string", () => {
    const result = hexToRgb("#6750A4");
    expect(result).toMatch(/^color\(|^rgb\(/);
  });

  test("throws on invalid hex", () => {
    expect(() => hexToRgb("not-a-color")).toThrow("Invalid hex color");
  });
});

describe("normalizeHex", () => {
  test("uppercases and adds hash", () => {
    expect(normalizeHex("6750a4")).toBe("#6750A4");
  });

  test("keeps existing hash and uppercases", () => {
    expect(normalizeHex("#6750a4")).toBe("#6750A4");
  });

  test("throws on invalid input", () => {
    expect(() => normalizeHex("not-a-color")).toThrow("Invalid hex color");
  });
});

describe("formatColor", () => {
  const hex = "#6750A4";

  test("formats as oklch", () => {
    expect(formatColor(hex, "oklch")).toMatch(/^oklch\(/);
  });

  test("formats as hex", () => {
    expect(formatColor(hex, "hex")).toBe("#6750A4");
  });

  test("formats as hsl", () => {
    expect(formatColor(hex, "hsl")).toMatch(/^hsl\(/);
  });

  test("formats as rgb", () => {
    const result = formatColor(hex, "rgb");
    expect(result).toMatch(/^(rgb|color)\(/);
  });
});

describe("getHue", () => {
  test("returns hue in degrees", () => {
    const hue = getHue("#769CDF");
    expect(hue).toBeGreaterThan(0);
    expect(hue).toBeLessThan(360);
  });

  test("returns 0 for achromatic colors", () => {
    const hue = getHue("#808080");
    expect(hue).toBe(0);
  });

  test("throws on invalid hex", () => {
    expect(() => getHue("not-a-color")).toThrow("Invalid hex color");
  });
});
