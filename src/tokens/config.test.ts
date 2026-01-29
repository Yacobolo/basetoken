import { describe, expect, test } from "vitest";
import { DEFAULT_CONFIG, mergeConfig } from "./config";
import type { TokenConfig } from "./config";

describe("DEFAULT_CONFIG", () => {
  test("has oklch as default format", () => {
    expect(DEFAULT_CONFIG.format).toBe("oklch");
  });

  test("has correct default prefixes", () => {
    expect(DEFAULT_CONFIG.prefixes.primitives).toBe("op");
    expect(DEFAULT_CONFIG.prefixes.palette).toBe("md");
    expect(DEFAULT_CONFIG.prefixes.semantic).toBe("ui");
  });

  test("has correct default output paths", () => {
    expect(DEFAULT_CONFIG.output.dir).toBe("./tokens");
    expect(DEFAULT_CONFIG.output.paletteSubdir).toBe("material");
    expect(DEFAULT_CONFIG.output.openpropsSubdir).toBe("open-props");
  });

  test("has all 14 semantic categories", () => {
    const expectedCategories = [
      "space",
      "space-fluid",
      "type-size",
      "leading",
      "weight",
      "font",
      "radius",
      "border",
      "shadow",
      "layer",
      "ease",
      "duration",
      "content-width",
      "breakpoint",
    ];

    for (const cat of expectedCategories) {
      expect(DEFAULT_CONFIG.semantic).toHaveProperty(cat);
    }
  });

  test("space has correct defaults", () => {
    expect(DEFAULT_CONFIG.semantic.space).toEqual({
      xs: "size-2",
      sm: "size-3",
      md: "size-4",
      lg: "size-5",
      xl: "size-6",
      "2xl": "size-7",
    });
  });

  test("space-fluid has correct defaults", () => {
    expect(DEFAULT_CONFIG.semantic["space-fluid"]).toEqual({
      xs: "size-fluid-1",
      sm: "size-fluid-2",
      md: "size-fluid-3",
      lg: "size-fluid-4",
      xl: "size-fluid-5",
      "2xl": "size-fluid-6",
    });
  });

  test("type-size has correct defaults", () => {
    expect(DEFAULT_CONFIG.semantic["type-size"]).toEqual({
      xs: "font-size-0",
      sm: "font-size-1",
      base: "font-size-2",
      md: "font-size-3",
      lg: "font-size-4",
      xl: "font-size-5",
      "2xl": "font-size-6",
      "3xl": "font-size-7",
      "4xl": "font-size-8",
    });
  });

  test("leading uses quoted values for raw numbers", () => {
    expect(DEFAULT_CONFIG.semantic.leading.none).toBe('"1"');
  });

  test("layer uses quoted values for raw numbers", () => {
    expect(DEFAULT_CONFIG.semantic.layer.base).toBe('"1"');
    expect(DEFAULT_CONFIG.semantic.layer.modal).toBe('"1000"');
  });

  test("font has body, heading, and code", () => {
    expect(DEFAULT_CONFIG.semantic.font).toEqual({
      body: "font-sans",
      heading: "font-sans",
      code: "font-mono",
    });
  });

  test("border has correct defaults", () => {
    expect(DEFAULT_CONFIG.semantic.border).toEqual({
      none: "0",
      sm: "border-size-1",
      md: "border-size-2",
      lg: "border-size-3",
    });
  });

  test("content-width has correct defaults", () => {
    expect(DEFAULT_CONFIG.semantic["content-width"]).toEqual({
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    });
  });

  test("breakpoint has correct defaults", () => {
    expect(DEFAULT_CONFIG.semantic.breakpoint).toEqual({
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    });
  });

  test("openprops has 5 default files", () => {
    expect(DEFAULT_CONFIG.openprops.files).toEqual([
      "fonts", "sizes", "shadows", "borders", "easings",
    ]);
  });
});

describe("mergeConfig", () => {
  test("returns defaults when given empty config", () => {
    const result = mergeConfig({});
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  test("overrides format", () => {
    const result = mergeConfig({ format: "hex" });
    expect(result.format).toBe("hex");
    // Other fields should remain default
    expect(result.prefixes).toEqual(DEFAULT_CONFIG.prefixes);
  });

  test("merges prefixes partially", () => {
    const result = mergeConfig({
      prefixes: { primitives: "custom", palette: "md", semantic: "ui" },
    });
    expect(result.prefixes.primitives).toBe("custom");
    expect(result.prefixes.palette).toBe("md");
    expect(result.prefixes.semantic).toBe("ui");
  });

  test("merges output partially", () => {
    const result = mergeConfig({
      output: {
        dir: "./custom-dir",
        paletteSubdir: "material",
        openpropsSubdir: "open-props",
      },
    });
    expect(result.output.dir).toBe("./custom-dir");
    expect(result.output.paletteSubdir).toBe("material");
  });

  test("merges semantic categories", () => {
    const result = mergeConfig({
      semantic: {
        ...DEFAULT_CONFIG.semantic,
        space: { sm: "size-1", md: "size-2" },
      },
    });
    expect(result.semantic.space).toEqual({ sm: "size-1", md: "size-2" });
    // Other semantic categories should use defaults
    expect(result.semantic.radius).toEqual(DEFAULT_CONFIG.semantic.radius);
  });
});
