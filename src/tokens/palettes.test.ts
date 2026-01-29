import { describe, expect, test } from "bun:test";
import { generatePalettesCSS } from "./palettes";
import type { Palettes } from "../types";
import { DEFAULT_CONFIG } from "./config";

/** Minimal palettes for testing (subset of fixture data) */
const testPalettes: Palettes = {
  primary: {
    "0": "#000000",
    "5": "#151100",
    "10": "#221B00",
    "15": "#2D2500",
    "20": "#3A3000",
    "25": "#463B00",
    "30": "#534600",
    "35": "#615200",
    "40": "#6E5D00",
    "50": "#8B7600",
    "60": "#A88F00",
    "70": "#C7AA00",
    "80": "#E5C524",
    "90": "#FFE25E",
    "95": "#FFF1BE",
    "98": "#FFF9EE",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
  secondary: {
    "0": "#000000",
    "5": "#151100",
    "10": "#211B01",
    "15": "#2C2506",
    "20": "#373010",
    "25": "#433B1A",
    "30": "#4F4724",
    "35": "#5B522F",
    "40": "#675E3A",
    "50": "#817750",
    "60": "#9B9168",
    "70": "#B7AB80",
    "80": "#D3C69A",
    "90": "#F0E2B4",
    "95": "#FEF1C1",
    "98": "#FFF9EE",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
  tertiary: {
    "0": "#000000",
    "5": "#001508",
    "10": "#00210F",
    "15": "#002D17",
    "20": "#083820",
    "25": "#16442A",
    "30": "#234F35",
    "35": "#2F5B40",
    "40": "#3B684B",
    "50": "#548163",
    "60": "#6D9B7B",
    "70": "#87B695",
    "80": "#A1D2AF",
    "90": "#BDEECA",
    "95": "#CBFDD8",
    "98": "#E9FFEC",
    "99": "#F5FFF4",
    "100": "#FFFFFF",
  },
  neutral: {
    "0": "#000000",
    "5": "#12110C",
    "10": "#1D1B16",
    "15": "#282620",
    "20": "#32302A",
    "25": "#3E3B35",
    "30": "#494640",
    "35": "#55524B",
    "40": "#615E57",
    "50": "#7A776F",
    "60": "#949088",
    "70": "#AFABA2",
    "80": "#CBC6BD",
    "90": "#E7E2D9",
    "95": "#F6F0E7",
    "98": "#FFF9EF",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
  "neutral-variant": {
    "0": "#000000",
    "5": "#131107",
    "10": "#1E1B10",
    "15": "#29261A",
    "20": "#343024",
    "25": "#3F3B2E",
    "30": "#4B4739",
    "35": "#575244",
    "40": "#635E50",
    "50": "#7C7767",
    "60": "#969080",
    "70": "#B1AB9A",
    "80": "#CDC6B4",
    "90": "#EAE2D0",
    "95": "#F8F0DD",
    "98": "#FFF9EE",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
};

describe("generatePalettesCSS", () => {
  test("contains header with seed info", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    expect(result).toContain("Material Design Palettes (Tier 1 Primitives)");
    expect(result).toContain("#FFDE3F");
    expect(result).toContain("DO NOT EDIT");
  });

  test("contains :root selector", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    expect(result).toContain(":root {");
    expect(result).toContain("}");
  });

  test("generates all palette groups", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    expect(result).toContain("/* Primary palette */");
    expect(result).toContain("/* Secondary palette */");
    expect(result).toContain("/* Tertiary palette */");
    expect(result).toContain("/* Neutral palette */");
    expect(result).toContain("/* Neutral Variant palette */");
  });

  test("uses correct variable naming with md prefix", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    expect(result).toContain("--md-palette-primary-0:");
    expect(result).toContain("--md-palette-primary-100:");
    expect(result).toContain("--md-palette-neutral-variant-50:");
  });

  test("generates all 18 tone steps per palette", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );

    const toneSteps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
    for (const step of toneSteps) {
      expect(result).toContain(`--md-palette-primary-${step}:`);
    }
  });

  test("formats colors as oklch", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    expect(result).toContain("oklch(");
  });

  test("formats colors as hex when requested", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "hex"
    );
    // Black should be #000000
    expect(result).toContain("#000000");
    // White should be #FFFFFF
    expect(result).toContain("#FFFFFF");
  });

  test("black tone-0 is correct", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    expect(result).toContain("--md-palette-primary-0: oklch(0.00 0 0);");
  });

  test("white tone-100 is correct", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    expect(result).toContain("--md-palette-primary-100: oklch(1.00 0 0);");
  });

  test("generates error palette", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    // Error palette is generated from material-color-utilities
    // It should appear in the output if present in palettes
    // Our test palettes don't include error, so it should be absent
    expect(result).not.toContain("/* Error palette */");
  });

  test("custom prefix works", () => {
    const customPrefixes = { ...DEFAULT_CONFIG.prefixes, palette: "custom" };
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      customPrefixes,
      "oklch"
    );
    expect(result).toContain("--custom-palette-primary-0:");
  });

  test("palette order: primary, secondary, tertiary, error, neutral, neutral-variant", () => {
    const result = generatePalettesCSS(
      testPalettes,
      "#FFDE3F",
      DEFAULT_CONFIG.prefixes,
      "oklch"
    );
    const primaryIdx = result.indexOf("/* Primary palette */");
    const secondaryIdx = result.indexOf("/* Secondary palette */");
    const tertiaryIdx = result.indexOf("/* Tertiary palette */");
    const neutralIdx = result.indexOf("/* Neutral palette */");
    const neutralVariantIdx = result.indexOf("/* Neutral Variant palette */");

    expect(primaryIdx).toBeLessThan(secondaryIdx);
    expect(secondaryIdx).toBeLessThan(tertiaryIdx);
    expect(tertiaryIdx).toBeLessThan(neutralIdx);
    expect(neutralIdx).toBeLessThan(neutralVariantIdx);
  });
});
