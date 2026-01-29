import { describe, expect, test } from "bun:test";
import {
  formatSemanticValue,
  sortSemanticKeys,
  getColorGroup,
  generateSemanticCSS,
} from "./semantic";
import type { SemanticConfig } from "./config";
import { DEFAULT_CONFIG } from "./config";
import type { SchemeColors } from "../types";

// --- Test helpers ---

/** Minimal light scheme for testing */
const lightScheme: Partial<SchemeColors> = {
  primary: "#6750A4",
  onPrimary: "#FFFFFF",
  primaryContainer: "#EADDFF",
  onPrimaryContainer: "#21005D",
  surface: "#FFFBFE",
  onSurface: "#1C1B1F",
  surfaceContainer: "#F3EDF7",
  error: "#B3261E",
  onError: "#FFFFFF",
  outline: "#79747E",
};

/** Minimal dark scheme for testing */
const darkScheme: Partial<SchemeColors> = {
  primary: "#D0BCFF",
  onPrimary: "#381E72",
  primaryContainer: "#4F378B",
  onPrimaryContainer: "#EADDFF",
  surface: "#1C1B1F",
  onSurface: "#E6E1E5",
  surfaceContainer: "#211F26",
  error: "#F2B8B5",
  onError: "#601410",
  outline: "#938F99",
};

// --- formatSemanticValue ---

describe("formatSemanticValue", () => {
  test("token reference", () => {
    expect(formatSemanticValue("size-3", "op")).toBe("var(--op-size-3)");
  });

  test("zero value", () => {
    expect(formatSemanticValue("0", "op")).toBe("0");
  });

  test("none value", () => {
    expect(formatSemanticValue("none", "op")).toBe("none");
  });

  test("numeric with unit", () => {
    expect(formatSemanticValue("150ms", "op")).toBe("150ms");
  });

  test("quoted raw value", () => {
    expect(formatSemanticValue('"1"', "op")).toBe("1");
  });

  test("complex token reference", () => {
    expect(formatSemanticValue("font-lineheight-3", "op")).toBe(
      "var(--op-font-lineheight-3)"
    );
  });

  test("zero milliseconds", () => {
    expect(formatSemanticValue("0ms", "op")).toBe("0ms");
  });

  test("custom prefix", () => {
    expect(formatSemanticValue("size-3", "custom")).toBe(
      "var(--custom-size-3)"
    );
  });
});

// --- sortSemanticKeys ---

describe("sortSemanticKeys", () => {
  test("t-shirt sizes", () => {
    const group: Record<string, unknown> = {
      lg: "size-5",
      xs: "size-2",
      md: "size-4",
      xxs: "size-1",
      xl: "size-6",
      sm: "size-3",
    };
    expect(sortSemanticKeys(group, "space")).toEqual([
      "xxs", "xs", "sm", "md", "lg", "xl",
    ]);
  });

  test("font weights", () => {
    const group: Record<string, unknown> = {
      bold: "font-weight-7",
      light: "font-weight-3",
      normal: "font-weight-4",
      semibold: "font-weight-6",
      medium: "font-weight-5",
    };
    expect(sortSemanticKeys(group, "weight")).toEqual([
      "light", "normal", "medium", "semibold", "bold",
    ]);
  });

  test("line heights", () => {
    const group: Record<string, unknown> = {
      loose: "font-lineheight-5",
      tight: "font-lineheight-1",
      normal: "font-lineheight-3",
      none: "1",
      relaxed: "font-lineheight-4",
      snug: "font-lineheight-2",
    };
    expect(sortSemanticKeys(group, "leading")).toEqual([
      "none", "tight", "snug", "normal", "relaxed", "loose",
    ]);
  });

  test("z-index layers", () => {
    const group: Record<string, unknown> = {
      modal: "layer-5",
      base: "layer-1",
      dropdown: "layer-3",
      sticky: "layer-4",
      raised: "layer-2",
    };
    expect(sortSemanticKeys(group, "layer")).toEqual([
      "base", "raised", "dropdown", "sticky", "modal",
    ]);
  });

  test("alphabetical fallback for font", () => {
    const group: Record<string, unknown> = {
      code: "font-mono",
      body: "font-sans",
      heading: "font-sans",
    };
    expect(sortSemanticKeys(group, "font")).toEqual([
      "body", "code", "heading",
    ]);
  });

  test("t-shirt size categories use same order", () => {
    const group: Record<string, unknown> = {
      lg: "v", md: "v", sm: "v",
    };

    // All these categories should use t-shirt size ordering
    for (const cat of ["space", "space-fluid", "type-size", "radius", "shadow", "border", "duration", "breakpoint", "content-width"]) {
      expect(sortSemanticKeys(group, cat)).toEqual(["sm", "md", "lg"]);
    }
  });

  test("mixed known and unknown keys", () => {
    const group: Record<string, unknown> = {
      custom: "value",
      sm: "size-3",
      lg: "size-5",
      other: "value",
      md: "size-4",
    };
    const result = sortSemanticKeys(group, "space");

    // Known T-shirt sizes come first in order
    expect(result[0]).toBe("sm");
    expect(result[1]).toBe("md");
    expect(result[2]).toBe("lg");

    // Unknown keys come after, alphabetically
    expect(result.slice(3)).toEqual(["custom", "other"]);
  });
});

// --- getColorGroup ---

describe("getColorGroup", () => {
  const cases: [string, string][] = [
    ["primary", "Primary"],
    ["primary-on", "Primary"],
    ["primary-container", "Primary"],
    ["secondary", "Secondary"],
    ["tertiary", "Tertiary"],
    ["surface", "Surface"],
    ["surface-container", "Surface"],
    ["background", "Background"],
    ["error", "Error"],
    ["outline", "Outline"],
    ["inverse-surface", "Inverse"],
    ["scrim", "Utility"],
    ["shadow-color", "Utility"],
    ["unknown", "Other"],
  ];

  for (const [role, expected] of cases) {
    test(`${role} -> ${expected}`, () => {
      expect(getColorGroup(role)).toBe(expected);
    });
  }
});

// --- generateSemanticCSS ---

describe("generateSemanticCSS", () => {
  const minimalSemantic: SemanticConfig = {
    ...DEFAULT_CONFIG.semantic,
    space: {
      sm: "size-3",
      md: "size-4",
      lg: "size-5",
    },
    radius: {
      none: "0",
      sm: "radius-2",
      md: "radius-3",
    },
    duration: {
      fast: "150ms",
      normal: "300ms",
    },
    // Zero out the others to keep output small
    "space-fluid": {},
    "type-size": {},
    leading: {},
    weight: {},
    font: {},
    border: {},
    shadow: {},
    layer: {},
    ease: {},
    "content-width": {},
    breakpoint: {},
  };

  test("contains header", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("Semantic Tokens (Tier 2)");
    expect(result).toContain("DO NOT EDIT");
  });

  test("contains CSS layer", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("@layer ui.theme {");
  });

  test("contains color-scheme", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("color-scheme: light dark;");
  });

  test("contains space tokens with correct prefix and ordering", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("/* Spacing Scale */");
    expect(result).toContain("--ui-space-sm: var(--op-size-3);");
    expect(result).toContain("--ui-space-md: var(--op-size-4);");
    expect(result).toContain("--ui-space-lg: var(--op-size-5);");
  });

  test("contains radius tokens with raw zero value", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("/* Border Radii */");
    expect(result).toContain("--ui-radius-none: 0;");
    expect(result).toContain("--ui-radius-sm: var(--op-radius-2);");
  });

  test("contains duration tokens with raw numeric values", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("/* Durations */");
    expect(result).toContain("--ui-duration-fast: 150ms;");
    expect(result).toContain("--ui-duration-normal: 300ms;");
  });

  test("contains shadow-hue from seed", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("--ui-shadow-hue: 180;");
  });

  test("uses light-dark() syntax for colors", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("--ui-color-primary: light-dark(oklch(");
    expect(result).toContain("--ui-color-primary-on: light-dark(oklch(");
    expect(result).toContain("--ui-color-surface: light-dark(oklch(");
  });

  test("contains shadow color token", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain(
      "--ui-color-shadow: light-dark(oklch(0 0 0 / 0.1), oklch(0 0 0 / 0.6));"
    );
  });

  test("contains theme toggles", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain(':root[data-theme="light"] { color-scheme: light; }');
    expect(result).toContain(':root[data-theme="dark"] { color-scheme: dark; }');
  });

  test("does not contain duplicate dark mode blocks", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).not.toContain('@media (prefers-color-scheme: dark)');
  });

  test("contains :root", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      minimalSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain(":root {");
  });
});

describe("generateSemanticCSS - empty semantic", () => {
  const emptySemantic: SemanticConfig = {
    space: {},
    "space-fluid": {},
    "type-size": {},
    leading: {},
    weight: {},
    font: {},
    radius: {},
    border: {},
    shadow: {},
    layer: {},
    ease: {},
    duration: {},
    "content-width": {},
    breakpoint: {},
  };

  test("still has header, layer, and root with empty semantic", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      emptySemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("Semantic Tokens (Tier 2)");
    expect(result).toContain("@layer ui.theme {");
    expect(result).toContain(":root {");
    expect(result).toContain("}");
  });

  test("still has color tokens from scheme", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      emptySemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("--ui-color-primary");
  });
});

describe("generateSemanticCSS - category order", () => {
  const orderedSemantic: SemanticConfig = {
    space: { sm: "size-3" },
    "space-fluid": {},
    "type-size": {},
    leading: {},
    weight: {},
    font: {},
    radius: { sm: "radius-2" },
    border: {},
    shadow: {},
    layer: { base: '"1"' },
    ease: {},
    duration: {},
    "content-width": {},
    breakpoint: {},
  };

  test("space comes before radius, radius before layer", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      orderedSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );

    const spaceIdx = result.indexOf("/* Spacing Scale */");
    const radiusIdx = result.indexOf("/* Border Radii */");
    const layerIdx = result.indexOf("/* Z-Index Layers */");

    expect(spaceIdx).toBeGreaterThan(0);
    expect(radiusIdx).toBeGreaterThan(0);
    expect(layerIdx).toBeGreaterThan(0);

    expect(spaceIdx).toBeLessThan(radiusIdx);
    expect(radiusIdx).toBeLessThan(layerIdx);
  });
});

describe("generateSemanticCSS - quoted values", () => {
  const quotedSemantic: SemanticConfig = {
    space: {},
    "space-fluid": {},
    "type-size": {},
    leading: { none: '"1"' },
    weight: {},
    font: {},
    radius: {},
    border: {},
    shadow: {},
    layer: { base: '"1"', raised: '"10"' },
    ease: {},
    duration: {},
    "content-width": {},
    breakpoint: {},
  };

  test("strips quotes from quoted values", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      quotedSemantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      180
    );
    expect(result).toContain("--ui-leading-none: 1;");
    expect(result).toContain("--ui-layer-base: 1;");
    expect(result).toContain("--ui-layer-raised: 10;");
  });
});

describe("generateSemanticCSS - all new categories", () => {
  test("generates all 14 semantic categories with defaults", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      DEFAULT_CONFIG.semantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      220
    );

    expect(result).toContain("/* Spacing Scale */");
    expect(result).toContain("/* Fluid Spacing */");
    expect(result).toContain("/* Typography Sizes */");
    expect(result).toContain("/* Line Heights */");
    expect(result).toContain("/* Font Weights */");
    expect(result).toContain("/* Font Families */");
    expect(result).toContain("/* Border Radii */");
    expect(result).toContain("/* Border Widths */");
    expect(result).toContain("/* Shadows */");
    expect(result).toContain("/* Z-Index Layers */");
    expect(result).toContain("/* Easings */");
    expect(result).toContain("/* Durations */");
    expect(result).toContain("/* Content Widths */");
    expect(result).toContain("/* Breakpoints */");
  });

  test("generates space-fluid tokens", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      DEFAULT_CONFIG.semantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      220
    );
    expect(result).toContain("--ui-space-fluid-sm: var(--op-size-fluid-2);");
  });

  test("generates type-size tokens", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      DEFAULT_CONFIG.semantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      220
    );
    expect(result).toContain("--ui-type-size-base: var(--op-font-size-2);");
  });

  test("generates font tokens", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      DEFAULT_CONFIG.semantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      220
    );
    expect(result).toContain("--ui-font-body: var(--op-font-sans);");
    expect(result).toContain("--ui-font-code: var(--op-font-mono);");
  });

  test("generates border tokens", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      DEFAULT_CONFIG.semantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      220
    );
    expect(result).toContain("--ui-border-none: 0;");
    expect(result).toContain("--ui-border-sm: var(--op-border-size-1);");
  });

  test("generates content-width tokens", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      DEFAULT_CONFIG.semantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      220
    );
    expect(result).toContain("--ui-content-width-sm: 640px;");
    expect(result).toContain("--ui-content-width-xl: 1280px;");
  });

  test("generates breakpoint tokens", () => {
    const result = generateSemanticCSS(
      lightScheme as SchemeColors,
      darkScheme as SchemeColors,
      DEFAULT_CONFIG.semantic,
      DEFAULT_CONFIG.prefixes,
      "oklch",
      220
    );
    expect(result).toContain("--ui-breakpoint-sm: 640px;");
    expect(result).toContain("--ui-breakpoint-xl: 1280px;");
  });
});
