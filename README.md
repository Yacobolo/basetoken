# OpenHue

Generate Material Design 3 color tokens from a seed color using the HCT color space.

Outputs CSS custom properties for light, dark, and contrast-adjusted schemes — ready to drop into any project.

**[Live Demo](https://yacobolo.github.io/openhue)**

## Features

- Full Material Design 3 color system from a single hex seed
- HCT (Hue, Chroma, Tone) color space for perceptually uniform palettes
- 7 scheme variants: tonal-spot, content, expressive, fidelity, monochrome, neutral, vibrant
- 3 contrast levels: standard, medium (AA+), high (AAA)
- Output as `oklch`, `hex`, `hsl`, or `rgb`
- Semantic tokens, tonal palettes, and surface roles
- Open Props–style CSS custom properties

## Quick Start

```bash
npx openhue --seed "#6750A4"
```

This generates a full set of CSS design tokens in `./tokens/`:

```
tokens/
  light.css       # Light scheme tokens
  dark.css        # Dark scheme tokens
  palettes.css    # Tonal palettes (primary, secondary, tertiary, neutral, error)
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --seed <hex>` | Seed color as hex (e.g. `#769CDF`) | **required** |
| `-o, --output <dir>` | Output directory | `./tokens` |
| `-f, --format <fmt>` | Color format: `oklch`, `hex`, `hsl`, `rgb` | `oklch` |
| `--scheme <variant>` | Scheme variant (see below) | `tonal-spot` |
| `--contrast <level>` | Contrast level: `standard`, `medium`, `high` | `standard` |

### Scheme Variants

| Variant | Description |
|---------|-------------|
| `tonal-spot` | Balanced, versatile — the M3 default |
| `content` | Colors derived from the seed, muted and harmonious |
| `expressive` | Vivid, high-chroma palettes |
| `fidelity` | Stays close to the exact seed hue and chroma |
| `monochrome` | Grayscale, zero chroma |
| `neutral` | Subtle, low-chroma palette |
| `vibrant` | Bold, saturated colors |

## Examples

```bash
# Expressive scheme in hex format
npx openhue --seed "#E8175D" --scheme expressive --format hex

# High contrast, custom output directory
npx openhue --seed "#1A73E8" --contrast high --output ./design-system/tokens

# Monochrome scheme
npx openhue --seed "#333333" --scheme monochrome
```

## Interactive Configurator

The [live demo site](https://yacobolo.github.io/openhue) lets you:

- Pick a seed color and see the generated scheme in real time
- Compare all 7 scheme variants side by side
- Toggle between light and dark modes
- Adjust contrast levels
- Copy the CLI command or individual color values

## Development

### Prerequisites

- [Bun](https://bun.sh) (CLI runtime)
- [Node.js](https://nodejs.org) 20+ (site build)

### CLI

```bash
# Install dependencies
bun install

# Run the CLI
bun src/index.ts --seed "#769CDF"

# Run tests
bun test
```

### Site (Configurator)

```bash
cd site

# Install dependencies
npm install

# Dev server
npm run dev

# Production build
npm run build
```

## Tech Stack

**CLI:** TypeScript, Bun, Commander.js, `@material/material-color-utilities`, Culori

**Site:** Lit 3 (Web Components), Vite 6, TypeScript — no UI framework, all CSS in Shadow DOM

## License

ISC
