/**
 * Token Generator Configuration
 * Opinionated defaults matching the Go reference implementation
 */

/** Supported color output formats */
export type ColorFormat = "oklch" | "hex" | "hsl" | "rgb";

/** CSS variable prefixes */
export interface Prefixes {
  primitives: string; // Open Props: --op-*
  palette: string; // Material palettes: --md-*
  semantic: string; // Semantic tokens: --ui-*
}

/** Output directory structure */
export interface OutputConfig {
  dir: string;
  paletteSubdir: string;
  openpropsSubdir: string;
}

/** Open Props configuration */
export interface OpenPropsConfig {
  baseUrl: string;
  files: string[];
}

/** Semantic token mappings - all categories from the Go reference */
export interface SemanticConfig {
  space: Record<string, string>;
  "space-fluid": Record<string, string>;
  "type-size": Record<string, string>;
  leading: Record<string, string>;
  weight: Record<string, string>;
  font: Record<string, string>;
  radius: Record<string, string>;
  border: Record<string, string>;
  shadow: Record<string, string>;
  layer: Record<string, string>;
  ease: Record<string, string>;
  duration: Record<string, string>;
  "content-width": Record<string, string>;
  breakpoint: Record<string, string>;
}

/** Complete configuration */
export interface TokenConfig {
  format: ColorFormat;
  prefixes: Prefixes;
  output: OutputConfig;
  openprops: OpenPropsConfig;
  semantic: SemanticConfig;
}

/** Default configuration - opinionated, ready to use */
export const DEFAULT_CONFIG: TokenConfig = {
  format: "oklch",

  prefixes: {
    primitives: "op",
    palette: "md",
    semantic: "ui",
  },

  output: {
    dir: "./tokens",
    paletteSubdir: "material",
    openpropsSubdir: "open-props",
  },

  openprops: {
    baseUrl:
      "https://raw.githubusercontent.com/argyleink/open-props/main/src",
    files: ["fonts", "sizes", "shadows", "borders", "easings"],
  },

  semantic: {
    space: {
      xs: "size-2",
      sm: "size-3",
      md: "size-4",
      lg: "size-5",
      xl: "size-6",
      "2xl": "size-7",
    },

    "space-fluid": {
      xs: "size-fluid-1",
      sm: "size-fluid-2",
      md: "size-fluid-3",
      lg: "size-fluid-4",
      xl: "size-fluid-5",
      "2xl": "size-fluid-6",
    },

    "type-size": {
      xs: "font-size-0",
      sm: "font-size-1",
      base: "font-size-2",
      md: "font-size-3",
      lg: "font-size-4",
      xl: "font-size-5",
      "2xl": "font-size-6",
      "3xl": "font-size-7",
      "4xl": "font-size-8",
    },

    leading: {
      none: "\"1\"",
      tight: "font-lineheight-1",
      snug: "font-lineheight-2",
      normal: "font-lineheight-3",
      relaxed: "font-lineheight-4",
      loose: "font-lineheight-5",
    },

    weight: {
      light: "font-weight-3",
      normal: "font-weight-4",
      medium: "font-weight-5",
      semibold: "font-weight-6",
      bold: "font-weight-7",
    },

    font: {
      body: "font-sans",
      heading: "font-sans",
      code: "font-mono",
    },

    radius: {
      none: "0",
      sm: "radius-2",
      md: "radius-3",
      lg: "radius-4",
      full: "radius-round",
    },

    border: {
      none: "0",
      sm: "border-size-1",
      md: "border-size-2",
      lg: "border-size-3",
    },

    shadow: {
      sm: "shadow-2",
      md: "shadow-3",
      lg: "shadow-4",
      xl: "shadow-5",
    },

    layer: {
      base: "\"1\"",
      raised: "\"10\"",
      dropdown: "\"100\"",
      sticky: "\"500\"",
      modal: "\"1000\"",
    },

    ease: {
      linear: "ease-1",
      default: "ease-2",
      in: "ease-in-2",
      out: "ease-out-2",
      "in-out": "ease-in-out-2",
    },

    duration: {
      instant: "0ms",
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },

    "content-width": {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },

    breakpoint: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
};

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  userConfig: Partial<TokenConfig>
): TokenConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    prefixes: { ...DEFAULT_CONFIG.prefixes, ...userConfig.prefixes },
    output: { ...DEFAULT_CONFIG.output, ...userConfig.output },
    openprops: { ...DEFAULT_CONFIG.openprops, ...userConfig.openprops },
    semantic: { ...DEFAULT_CONFIG.semantic, ...userConfig.semantic },
  };
}
