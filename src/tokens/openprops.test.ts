import { describe, expect, test } from "bun:test";
import {
  transformOpenPropsCSS,
  prefixOpenPropsCSS,
  generateOpenPropsCSS,
} from "./openprops";

describe("transformOpenPropsCSS", () => {
  test("removes @import statements", () => {
    const input = `@import 'props.media.css';
:where(html) {
  --size-1: 1rem;
}`;
    const result = transformOpenPropsCSS(input, "sizes", 220);
    expect(result).not.toContain("@import");
    expect(result).toContain("--size-1: 1rem;");
  });

  test("converts :where(html) to :root", () => {
    const input = `:where(html) {
  --size-1: 1rem;
}`;
    const result = transformOpenPropsCSS(input, "sizes", 220);
    expect(result).toContain(":root {");
    expect(result).not.toContain(":where(html)");
  });

  test("converts @media (--OSdark) to prefers-color-scheme", () => {
    const input = `@media (--OSdark) {
  :where(html) {
    --shadow-color: 220 40% 2%;
  }
}`;
    const result = transformOpenPropsCSS(input, "shadows", 220);
    expect(result).toContain("@media (prefers-color-scheme: dark)");
    expect(result).not.toContain("--OSdark");
  });

  test("injects shadow color for shadows file", () => {
    const input = `:where(html) {
  --shadow-color: 220 3% 15%;
  --shadow-1: 0 1px 2px hsl(var(--shadow-color) / 10%);
}

@media (--OSdark) {
  :where(html) {
    --shadow-color: 220 40% 2%;
  }
}`;
    const result = transformOpenPropsCSS(input, "shadows", 180);

    // Light mode shadow-color should use seed hue
    expect(result).toContain("--shadow-color: 180 10% 15%;");
  });

  test("does not inject shadow color for non-shadow files", () => {
    const input = `:where(html) {
  --size-1: 1rem;
}`;
    const result = transformOpenPropsCSS(input, "sizes", 180);
    expect(result).not.toContain("shadow-color");
  });

  test("trims whitespace", () => {
    const input = `\n\n:where(html) {\n  --size-1: 1rem;\n}\n\n`;
    const result = transformOpenPropsCSS(input, "sizes", 220);
    expect(result).not.toMatch(/^\n/);
    expect(result).not.toMatch(/\n$/);
  });
});

describe("prefixOpenPropsCSS", () => {
  test("prefixes property definitions", () => {
    const input = `:root {
  --size-1: 1rem;
  --size-2: 2rem;
}`;
    const result = prefixOpenPropsCSS(input, "op");
    expect(result).toContain("--op-size-1: 1rem;");
    expect(result).toContain("--op-size-2: 2rem;");
  });

  test("prefixes multiple properties", () => {
    const input = `:root {
  --font-sans: system-ui;
  --font-mono: monospace;
}`;
    const result = prefixOpenPropsCSS(input, "op");
    expect(result).toContain("--op-font-sans: system-ui;");
    expect(result).toContain("--op-font-mono: monospace;");
  });

  test("works with custom prefix", () => {
    const input = `:root {
  --size-1: 1rem;
}`;
    const result = prefixOpenPropsCSS(input, "custom");
    expect(result).toContain("--custom-size-1: 1rem;");
  });
});

describe("generateOpenPropsCSS", () => {
  test("includes header with title", () => {
    const content = `:where(html) {
  --size-1: 1rem;
}`;
    const result = generateOpenPropsCSS("sizes", content, "op", 220);
    expect(result).toContain("Sizes Tokens");
    expect(result).toContain("Open Props");
  });

  test("includes DO NOT EDIT warning", () => {
    const content = `:where(html) {
  --size-1: 1rem;
}`;
    const result = generateOpenPropsCSS("sizes", content, "op", 220);
    expect(result).toContain("DO NOT EDIT");
  });

  test("transforms and prefixes content", () => {
    const content = `:where(html) {
  --size-1: 1rem;
}`;
    const result = generateOpenPropsCSS("sizes", content, "op", 220);
    expect(result).toContain(":root {");
    expect(result).toContain("--op-size-1: 1rem;");
  });

  test("capitalizes file name for title", () => {
    const content = `:where(html) { --font-sans: system-ui; }`;
    const result = generateOpenPropsCSS("fonts", content, "op", 220);
    expect(result).toContain("Fonts Tokens");
  });
});
