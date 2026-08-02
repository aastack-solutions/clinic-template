import type { Theme } from '@/types/clinic';

/**
 * Turns the two or three brand colours in `clinic.json` into a complete design
 * system: a 50→950 ramp per colour, readable foregrounds, and the radius scale.
 * Everything is emitted as CSS custom properties on `:root` from a Server
 * Component, so the branding is present in the very first HTML byte — no flash
 * of unstyled colour, no client-side theming runtime.
 */

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * The brand colour is anchored at stop 700 — the shade the primary button uses.
 * That makes the contract predictable for whoever edits `clinic.json`: the hex
 * you type is the colour you see on the "Book appointment" button. Everything
 * else is interpolated outward from it.
 */
const ANCHOR_INDEX = STOPS.indexOf(700);
const LIGHT_END = 0.975;

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;
  const int = Number.parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (channel: number) =>
    Math.round(Math.min(255, Math.max(0, channel)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / delta + 2) / 6;
  else h = ((rn - gn) / delta + 4) / 6;

  return { h: h * 360, s, l };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  if (s === 0) {
    const value = l * 255;
    return { r: value, g: value, b: value };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hueToChannel = (t: number) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };
  const hn = h / 360;
  return {
    r: hueToChannel(hn + 1 / 3) * 255,
    g: hueToChannel(hn) * 255,
    b: hueToChannel(hn - 1 / 3) * 255,
  };
}

/** Relative luminance (WCAG 2.1) — used to pick a readable foreground. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const normalised = value / 255;
    return normalised <= 0.03928 ? normalised / 12.92 : ((normalised + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Picks black or white text for a background, preferring whichever clears
 * WCAG AA. Keeps buttons legible no matter which brand colour a clinic sends.
 */
export function readableForeground(background: string, dark = '#0B1413', light = '#FFFFFF'): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/**
 * Light tints must not scream.
 *
 * Holding a saturated hue at high lightness produces neon — the classic failure
 * of auto-generated palettes. Chroma is therefore pulled back in proportion to
 * how far a stop has been lifted above the brand colour, so tints stay calm
 * while shades below the anchor keep their full richness.
 */
function saturationFactor(lightness: number, anchorL: number): number {
  if (lightness <= anchorL) return 1;
  const lift = (lightness - anchorL) / Math.max(0.001, LIGHT_END - anchorL);
  return 1 - 0.82 * lift ** 0.6;
}

/**
 * Builds a full 50→950 ramp from one brand colour.
 *
 * Lightness is eased rather than linear — the gaps are tight near white and open
 * up through the mid-tones, which is what makes a ramp feel designed instead of
 * mathematically generated.
 */
export function generateScale(hex: string): Record<(typeof STOPS)[number], string> {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));

  // The exact hex is preserved at the anchor. Ramp geometry uses a clamped
  // lightness so an extremely light or dark brand colour still yields a usable
  // scale instead of ten near-identical shades.
  const anchorL = Math.min(0.8, Math.max(0.12, l));
  const darkEnd = Math.max(0.05, anchorL * 0.42);

  const entries = STOPS.map((stop, index) => {
    if (index === ANCHOR_INDEX) return [stop, normaliseHex(hex)] as const;

    let lightness: number;
    if (index < ANCHOR_INDEX) {
      const t = (index / ANCHOR_INDEX) ** 1.6;
      lightness = LIGHT_END + (anchorL - LIGHT_END) * t;
    } else {
      const steps = STOPS.length - 1 - ANCHOR_INDEX;
      const t = ((index - ANCHOR_INDEX) / steps) ** 0.9;
      lightness = anchorL + (darkEnd - anchorL) * t;
    }

    const saturation = Math.min(1, s * saturationFactor(lightness, anchorL));
    return [stop, rgbToHex(hslToRgb({ h, s: saturation, l: lightness }))] as const;
  });

  return Object.fromEntries(entries) as Record<(typeof STOPS)[number], string>;
}

/** Expands `#abc` to `#aabbcc` and lowercases, so output is always comparable. */
function normaliseHex(hex: string): string {
  return rgbToHex(hexToRgb(hex));
}

const RADIUS_SCALE = {
  sharp: { btn: '0.5rem', card: '0.75rem', panel: '1rem', pill: '9999px' },
  soft: { btn: '0.875rem', card: '1.5rem', panel: '2rem', pill: '9999px' },
  round: { btn: '9999px', card: '2rem', panel: '2.75rem', pill: '9999px' },
} as const;

/**
 * Serialises the theme into a `:root { ... }` declaration block.
 * Consumed by `app/layout.tsx` and mapped onto Tailwind utilities in
 * `app/globals.css` via `@theme inline`.
 */
export function buildThemeCss(theme: Theme): string {
  const primary = generateScale(theme.colors.primary);
  const accent = generateScale(theme.colors.accent);
  const radius = RADIUS_SCALE[theme.radius];

  const declarations: string[] = [];

  for (const stop of STOPS) {
    declarations.push(`--c-primary-${stop}: ${primary[stop]};`);
    declarations.push(`--c-accent-${stop}: ${accent[stop]};`);
  }

  declarations.push(`--c-primary: ${theme.colors.primary};`);
  declarations.push(`--c-accent: ${theme.colors.accent};`);
  declarations.push(`--c-on-primary: ${readableForeground(theme.colors.primary)};`);
  declarations.push(`--c-on-accent: ${readableForeground(theme.colors.accent)};`);
  declarations.push(`--c-ink: ${theme.colors.ink};`);
  declarations.push(`--c-surface: ${theme.colors.surface};`);
  declarations.push(`--c-muted: ${theme.colors.muted};`);

  declarations.push(`--r-btn: ${radius.btn};`);
  declarations.push(`--r-card: ${radius.card};`);
  declarations.push(`--r-panel: ${radius.panel};`);
  declarations.push(`--r-pill: ${radius.pill};`);

  return `:root{${declarations.join('')}}`;
}

/** The `<meta name="theme-color">` value for mobile browser chrome. */
export function browserThemeColor(theme: Theme) {
  return theme.colors.primary;
}
