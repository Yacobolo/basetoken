/**
 * Semantic CSS Generator
 * Generates semantic.css with --ui-* tokens using light-dark()
 */

import type { SchemeColors } from "../types";
import type { ColorFormat, Prefixes, SemanticConfig } from "./config";
import { formatColor } from "./colors";
import { generateHeader } from "./css";

/**
 * Color role mapping from Material camelCase to semantic kebab-case
 * Order defines output order in the CSS file
 */
const COLOR_ROLE_MAP: Array<{ schemeKey: keyof SchemeColors; semanticName: string; group: string }> = [
  // Primary
  { schemeKey: "primary", semanticName: "primary", group: "Primary" },
  { schemeKey: "onPrimary", semanticName: "primary-on", group: "Primary" },
  { schemeKey: "primaryContainer", semanticName: "primary-container", group: "Primary" },
  { schemeKey: "onPrimaryContainer", semanticName: "primary-container-on", group: "Primary" },
  
  // Secondary
  { schemeKey: "secondary", semanticName: "secondary", group: "Secondary" },
  { schemeKey: "onSecondary", semanticName: "secondary-on", group: "Secondary" },
  { schemeKey: "secondaryContainer", semanticName: "secondary-container", group: "Secondary" },
  { schemeKey: "onSecondaryContainer", semanticName: "secondary-container-on", group: "Secondary" },
  
  // Tertiary
  { schemeKey: "tertiary", semanticName: "tertiary", group: "Tertiary" },
  { schemeKey: "onTertiary", semanticName: "tertiary-on", group: "Tertiary" },
  { schemeKey: "tertiaryContainer", semanticName: "tertiary-container", group: "Tertiary" },
  { schemeKey: "onTertiaryContainer", semanticName: "tertiary-container-on", group: "Tertiary" },
  
  // Surface
  { schemeKey: "surface", semanticName: "surface", group: "Surface" },
  { schemeKey: "onSurface", semanticName: "surface-on", group: "Surface" },
  { schemeKey: "surfaceVariant", semanticName: "surface-variant", group: "Surface" },
  { schemeKey: "onSurfaceVariant", semanticName: "surface-variant-on", group: "Surface" },
  { schemeKey: "surfaceContainer", semanticName: "surface-container", group: "Surface" },
  { schemeKey: "surfaceContainerLow", semanticName: "surface-container-low", group: "Surface" },
  { schemeKey: "surfaceContainerLowest", semanticName: "surface-container-lowest", group: "Surface" },
  { schemeKey: "surfaceContainerHigh", semanticName: "surface-container-high", group: "Surface" },
  { schemeKey: "surfaceContainerHighest", semanticName: "surface-container-highest", group: "Surface" },
  { schemeKey: "surfaceDim", semanticName: "surface-dim", group: "Surface" },
  { schemeKey: "surfaceBright", semanticName: "surface-bright", group: "Surface" },
  
  // Background
  { schemeKey: "background", semanticName: "background", group: "Background" },
  { schemeKey: "onBackground", semanticName: "background-on", group: "Background" },
  
  // Error
  { schemeKey: "error", semanticName: "error", group: "Error" },
  { schemeKey: "onError", semanticName: "error-on", group: "Error" },
  { schemeKey: "errorContainer", semanticName: "error-container", group: "Error" },
  { schemeKey: "onErrorContainer", semanticName: "error-container-on", group: "Error" },
  
  // Outline
  { schemeKey: "outline", semanticName: "outline", group: "Outline" },
  { schemeKey: "outlineVariant", semanticName: "outline-variant", group: "Outline" },
  
  // Inverse
  { schemeKey: "inverseSurface", semanticName: "inverse-surface", group: "Inverse" },
  { schemeKey: "inverseOnSurface", semanticName: "inverse-surface-on", group: "Inverse" },
  { schemeKey: "inversePrimary", semanticName: "inverse-primary", group: "Inverse" },
  
  // Utility
  { schemeKey: "scrim", semanticName: "scrim", group: "Utility" },
  { schemeKey: "shadow", semanticName: "shadow-color", group: "Utility" },
  { schemeKey: "surfaceTint", semanticName: "surface-tint", group: "Utility" },
];

/** Semantic category definitions matching Go reference order */
const SEMANTIC_CATEGORIES: Array<{ key: keyof SemanticConfig; displayName: string; prefix: string }> = [
  { key: "space", displayName: "Spacing Scale", prefix: "space" },
  { key: "space-fluid", displayName: "Fluid Spacing", prefix: "space-fluid" },
  { key: "type-size", displayName: "Typography Sizes", prefix: "type-size" },
  { key: "leading", displayName: "Line Heights", prefix: "leading" },
  { key: "weight", displayName: "Font Weights", prefix: "weight" },
  { key: "font", displayName: "Font Families", prefix: "font" },
  { key: "radius", displayName: "Border Radii", prefix: "radius" },
  { key: "border", displayName: "Border Widths", prefix: "border" },
  { key: "shadow", displayName: "Shadows", prefix: "shadow" },
  { key: "layer", displayName: "Z-Index Layers", prefix: "layer" },
  { key: "ease", displayName: "Easings", prefix: "ease" },
  { key: "duration", displayName: "Durations", prefix: "duration" },
  { key: "content-width", displayName: "Content Widths", prefix: "content-width" },
  { key: "breakpoint", displayName: "Breakpoints", prefix: "breakpoint" },
];

// --- Sorting logic (ported from Go) ---

/** T-shirt size sort order */
const TSHIRT_SIZE_ORDER: Record<string, number> = {
  xxs: 1,
  xs: 2,
  sm: 3,
  base: 4,
  md: 5,
  lg: 6,
  xl: 7,
  "2xl": 8,
  "3xl": 9,
  "4xl": 10,
  "5xl": 11,
};

/** Font weight sort order */
const WEIGHT_ORDER: Record<string, number> = {
  thin: 1,
  light: 2,
  normal: 3,
  medium: 4,
  semibold: 5,
  bold: 6,
  extrabold: 7,
  black: 8,
};

/** Line height sort order */
const LEADING_ORDER: Record<string, number> = {
  none: 1,
  tight: 2,
  snug: 3,
  normal: 4,
  relaxed: 5,
  loose: 6,
};

/** Z-index layer sort order */
const LAYER_ORDER: Record<string, number> = {
  base: 1,
  raised: 2,
  dropdown: 3,
  sticky: 4,
  modal: 5,
};

/**
 * Sort semantic keys in a logical order for the category.
 * Known keys come first in their defined order, unknown keys sort
 * alphabetically at the end.
 */
export function sortSemanticKeys(
  group: Record<string, unknown>,
  category: string
): string[] {
  const keys = Object.keys(group);

  // Select the appropriate order map based on category
  let orderMap: Record<string, number> | null = null;

  switch (category) {
    case "space":
    case "space-fluid":
    case "type-size":
    case "radius":
    case "shadow":
    case "border":
    case "duration":
    case "breakpoint":
    case "content-width":
      orderMap = TSHIRT_SIZE_ORDER;
      break;
    case "weight":
      orderMap = WEIGHT_ORDER;
      break;
    case "leading":
      orderMap = LEADING_ORDER;
      break;
    case "layer":
      orderMap = LAYER_ORDER;
      break;
    default:
      // Alphabetical for others (font, ease, etc.)
      return [...keys].sort();
  }

  const map = orderMap;
  return [...keys].sort((a, b) => {
    const oa = map[a];
    const ob = map[b];

    if (oa !== undefined && ob !== undefined) {
      return oa - ob;
    }
    if (oa !== undefined) return -1;
    if (ob !== undefined) return 1;

    return a.localeCompare(b);
  });
}

/**
 * Get the color group name for a semantic color role (for CSS comments).
 */
export function getColorGroup(role: string): string {
  if (role.startsWith("primary")) return "Primary";
  if (role.startsWith("secondary")) return "Secondary";
  if (role.startsWith("tertiary")) return "Tertiary";
  if (role.startsWith("surface")) return "Surface";
  if (role.startsWith("background")) return "Background";
  if (role.startsWith("error")) return "Error";
  if (role.startsWith("outline")) return "Outline";
  if (role.startsWith("inverse")) return "Inverse";
  if (role === "scrim" || role === "shadow-color") return "Utility";
  return "Other";
}

/**
 * Format a semantic value for CSS output.
 * - "0" or "none" -> raw value
 * - Quoted values like '"1"' -> strip quotes (raw value)
 * - Numeric values starting with a digit (e.g., "150ms") -> raw value
 * - Everything else -> var(--op-<value>) token reference
 */
export function formatSemanticValue(value: string, primitivesPrefix: string): string {
  // Raw values
  if (value === "0" || value === "none") {
    return value;
  }

  // Quoted raw values (e.g., '"1"' -> '1')
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  // Numeric values starting with a digit (e.g., "150ms", "1.5")
  if (/^\d/.test(value)) {
    return value;
  }

  // Token reference - wrap with var()
  return `var(--${primitivesPrefix}-${value})`;
}

/**
 * Generate semantic.css content with light-dark() for colors
 */
export function generateSemanticCSS(
  lightScheme: SchemeColors,
  darkScheme: SchemeColors,
  semantic: SemanticConfig,
  prefixes: Prefixes,
  format: ColorFormat,
  seedHue: number
): string {
  const header = generateHeader(
    "Semantic Tokens (Tier 2) - THE APPLICATION API",
    "Generated from seed color",
    `Naming: --${prefixes.semantic}-[category]-[role]

This is the ONLY file developers should reference.
All tokens start with --${prefixes.semantic}-

Uses CSS light-dark() for reactive theming.`
  );

  const lines: string[] = [];
  lines.push(header);

  // Start CSS layer
  lines.push("@layer ui.theme {");
  lines.push("  :root {");
  lines.push("    color-scheme: light dark;");
  lines.push("");

  // Generate color tokens with light-dark()
  let currentGroup = "";
  for (const role of COLOR_ROLE_MAP) {
    const lightValue = lightScheme[role.schemeKey];
    const darkValue = darkScheme[role.schemeKey];

    if (!lightValue || !darkValue) continue;

    // Add group comment when group changes
    if (role.group !== currentGroup) {
      if (currentGroup !== "") {
        lines.push("");
      }
      lines.push(`    /* ${role.group} */`);
      currentGroup = role.group;
    }

    const lightFormatted = formatColor(lightValue, format);
    const darkFormatted = formatColor(darkValue, format);
    const cssVar = `--${prefixes.semantic}-color-${role.semanticName}`;
    
    lines.push(`    ${cssVar}: light-dark(${lightFormatted}, ${darkFormatted});`);
  }

  // Shadow color token (for atomic shadows)
  lines.push("");
  lines.push("    /* Shadow Color (for atomic shadows) */");
  lines.push(`    --${prefixes.semantic}-color-shadow: light-dark(oklch(0 0 0 / 0.1), oklch(0 0 0 / 0.6));`);

  // Shadow hue derived from seed
  lines.push("");
  lines.push("    /* Shadow Hue (derived from seed color) */");
  lines.push(`    --${prefixes.semantic}-shadow-hue: ${Math.round(seedHue)};`);

  // Generate non-color semantic tokens
  for (const category of SEMANTIC_CATEGORIES) {
    const tokens = semantic[category.key];
    if (!tokens || Object.keys(tokens).length === 0) continue;

    lines.push("");
    lines.push(`    /* ${category.displayName} */`);

    // Sort keys using category-aware sorting
    const sortedKeys = sortSemanticKeys(tokens, category.key);

    for (const key of sortedKeys) {
      const value = tokens[key];
      const cssVar = `--${prefixes.semantic}-${category.prefix}-${key}`;
      const cssValue = formatSemanticValue(value, prefixes.primitives);
      lines.push(`    ${cssVar}: ${cssValue};`);
    }
  }

  lines.push("  }");
  lines.push("");

  // Theme toggle selectors
  lines.push("  /* Theme Toggles */");
  lines.push('  :root[data-theme="light"] { color-scheme: light; }');
  lines.push('  :root[data-theme="dark"] { color-scheme: dark; }');

  // Close layer
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}
