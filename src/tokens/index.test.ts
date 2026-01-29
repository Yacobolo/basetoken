import { describe, expect, test, afterEach } from "bun:test";
import { readdir, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { generateTokens } from "./index";

const TEST_OUTPUT_DIR = "./test-tokens-output";

async function cleanup() {
  try {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

afterEach(cleanup);

describe("generateTokens - integration", () => {
  test("creates output directory structure", async () => {
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "tonal-spot",
    });

    const entries = await readdir(TEST_OUTPUT_DIR);
    expect(entries).toContain("index.css");
    expect(entries).toContain("semantic.css");
    expect(entries).toContain("app.css");
    expect(entries).toContain("material");
    expect(entries).toContain("open-props");
  });

  test("creates material/palettes.css", async () => {
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "tonal-spot",
    });

    const palettesPath = join(TEST_OUTPUT_DIR, "material", "palettes.css");
    const content = await readFile(palettesPath, "utf-8");

    expect(content).toContain("Material Design Palettes");
    expect(content).toContain("--md-palette-primary-");
    expect(content).toContain("oklch(");
  });

  test("creates open-props files", async () => {
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "tonal-spot",
    });

    const openPropsDir = join(TEST_OUTPUT_DIR, "open-props");
    const entries = await readdir(openPropsDir);

    expect(entries).toContain("fonts.css");
    expect(entries).toContain("sizes.css");
    expect(entries).toContain("shadows.css");
    expect(entries).toContain("borders.css");
    expect(entries).toContain("easings.css");
  });

  test("semantic.css contains all token types", async () => {
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "tonal-spot",
    });

    const semanticPath = join(TEST_OUTPUT_DIR, "semantic.css");
    const content = await readFile(semanticPath, "utf-8");

    // Colors
    expect(content).toContain("--ui-color-primary:");
    expect(content).toContain("light-dark(");

    // All semantic categories
    expect(content).toContain("--ui-space-");
    expect(content).toContain("--ui-space-fluid-");
    expect(content).toContain("--ui-type-size-");
    expect(content).toContain("--ui-leading-");
    expect(content).toContain("--ui-weight-");
    expect(content).toContain("--ui-font-");
    expect(content).toContain("--ui-radius-");
    expect(content).toContain("--ui-border-");
    expect(content).toContain("--ui-shadow-");
    expect(content).toContain("--ui-layer-");
    expect(content).toContain("--ui-ease-");
    expect(content).toContain("--ui-duration-");
    expect(content).toContain("--ui-content-width-");
    expect(content).toContain("--ui-breakpoint-");
  });

  test("index.css imports all files", async () => {
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "tonal-spot",
    });

    const indexPath = join(TEST_OUTPUT_DIR, "index.css");
    const content = await readFile(indexPath, "utf-8");

    expect(content).toContain("material/palettes.css");
    expect(content).toContain("semantic.css");
    expect(content).toContain("app.css");
  });

  test("app.css is not overwritten if it exists", async () => {
    // First run creates app.css
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "tonal-spot",
    });

    const appPath = join(TEST_OUTPUT_DIR, "app.css");
    const firstContent = await readFile(appPath, "utf-8");

    // Modify app.css
    const { writeFile } = await import("node:fs/promises");
    await writeFile(appPath, "/* custom */");

    // Second run should not overwrite
    await generateTokens({
      seed: "#769CDF",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "tonal-spot",
    });

    const secondContent = await readFile(appPath, "utf-8");
    expect(secondContent).toBe("/* custom */");
  });

  test("supports hex color format", async () => {
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "hex",
      scheme: "tonal-spot",
    });

    const palettesPath = join(TEST_OUTPUT_DIR, "material", "palettes.css");
    const content = await readFile(palettesPath, "utf-8");

    expect(content).toContain("#000000");
    expect(content).toContain("#FFFFFF");
    // Palette values should be hex, not oklch (header may contain oklch for seed info)
    expect(content).toContain("--md-palette-primary-40: #");
    expect(content).not.toContain("--md-palette-primary-40: oklch(");
  });

  test("supports different scheme variants", async () => {
    // Should not throw
    await generateTokens({
      seed: "#FFDE3F",
      output: TEST_OUTPUT_DIR,
      format: "oklch",
      scheme: "expressive",
    });

    const palettesPath = join(TEST_OUTPUT_DIR, "material", "palettes.css");
    const info = await stat(palettesPath);
    expect(info.size).toBeGreaterThan(0);
  });
});
