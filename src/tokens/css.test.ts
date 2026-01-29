import { describe, expect, test } from "bun:test";
import { generateHeader, generateIndexCSS, generateAppCSS } from "./css";
import { DEFAULT_CONFIG } from "./config";

describe("generateHeader", () => {
  test("contains title", () => {
    const result = generateHeader("My Title");
    expect(result).toContain("My Title");
  });

  test("contains timestamp", () => {
    const result = generateHeader("Title");
    // Should contain a date-like pattern
    expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  });

  test("contains DO NOT EDIT warning", () => {
    const result = generateHeader("Title");
    expect(result).toContain("DO NOT EDIT");
  });

  test("includes source when provided", () => {
    const result = generateHeader("Title", "Some Source");
    expect(result).toContain("Source: Some Source");
  });

  test("includes description when provided", () => {
    const result = generateHeader("Title", undefined, "A description");
    expect(result).toContain("A description");
  });

  test("handles multiline description", () => {
    const result = generateHeader("Title", undefined, "Line 1\nLine 2");
    expect(result).toContain(" * Line 1");
    expect(result).toContain(" * Line 2");
  });

  test("wraps in CSS comment", () => {
    const result = generateHeader("Title");
    expect(result).toMatch(/^\/\*\*/);
    expect(result).toContain(" */");
  });
});

describe("generateIndexCSS", () => {
  test("contains header", () => {
    const result = generateIndexCSS(
      DEFAULT_CONFIG.openprops.files,
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    expect(result).toContain("Tokens Layer - Main Entry Point");
  });

  test("contains tier labels", () => {
    const result = generateIndexCSS(
      DEFAULT_CONFIG.openprops.files,
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    expect(result).toContain("Tier 1: Warehouses (Primitives)");
    expect(result).toContain("Tier 2: Showroom (Semantic)");
    expect(result).toContain("Tier 3: App-Specific");
  });

  test("imports palettes.css", () => {
    const result = generateIndexCSS(
      DEFAULT_CONFIG.openprops.files,
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    expect(result).toContain('@import "./material/palettes.css";');
  });

  test("imports all open props files", () => {
    const result = generateIndexCSS(
      DEFAULT_CONFIG.openprops.files,
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    expect(result).toContain('@import "./open-props/borders.css";');
    expect(result).toContain('@import "./open-props/easings.css";');
    expect(result).toContain('@import "./open-props/fonts.css";');
    expect(result).toContain('@import "./open-props/shadows.css";');
    expect(result).toContain('@import "./open-props/sizes.css";');
  });

  test("imports semantic.css", () => {
    const result = generateIndexCSS(
      DEFAULT_CONFIG.openprops.files,
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    expect(result).toContain('@import "./semantic.css";');
  });

  test("imports app.css", () => {
    const result = generateIndexCSS(
      DEFAULT_CONFIG.openprops.files,
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    expect(result).toContain('@import "./app.css";');
  });

  test("open props files are sorted alphabetically", () => {
    const result = generateIndexCSS(
      ["shadows", "fonts", "borders"],
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    const bordersIdx = result.indexOf("borders.css");
    const fontsIdx = result.indexOf("fonts.css");
    const shadowsIdx = result.indexOf("shadows.css");

    expect(bordersIdx).toBeLessThan(fontsIdx);
    expect(fontsIdx).toBeLessThan(shadowsIdx);
  });

  test("contains prefix legend", () => {
    const result = generateIndexCSS(
      DEFAULT_CONFIG.openprops.files,
      DEFAULT_CONFIG.prefixes,
      DEFAULT_CONFIG.output.paletteSubdir,
      DEFAULT_CONFIG.output.openpropsSubdir
    );
    expect(result).toContain("--md-palette-*");
    expect(result).toContain("--op-*");
    expect(result).toContain("--ui-*");
  });
});

describe("generateAppCSS", () => {
  test("contains comment about not being generated", () => {
    const result = generateAppCSS();
    expect(result).toContain("NOT generated");
  });

  test("contains :root selector", () => {
    const result = generateAppCSS();
    expect(result).toContain(":root {");
  });

  test("contains layout tokens", () => {
    const result = generateAppCSS();
    expect(result).toContain("--sidebar-width:");
    expect(result).toContain("--header-height:");
  });

  test("contains container width tokens", () => {
    const result = generateAppCSS();
    expect(result).toContain("--container-sm:");
    expect(result).toContain("--container-xl:");
  });
});
