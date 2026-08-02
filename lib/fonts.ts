import { Fraunces, Inter, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

import type { Theme } from '@/types/clinic';

/**
 * next/font requires statically analysable calls, so the engine ships a small
 * curated set of typefaces and `clinic.json` selects from it by key. Every face
 * is self-hosted at build time (no render-blocking request to Google) and only
 * the two selected families are ever applied to the document, so unused faces
 * are never downloaded by the browser.
 */

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-playfair',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-jakarta',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});

const DISPLAY_FONTS = {
  fraunces: { font: fraunces, cssVar: '--font-fraunces' },
  playfair: { font: playfair, cssVar: '--font-playfair' },
  jakarta: { font: jakarta, cssVar: '--font-jakarta' },
} as const;

const BODY_FONTS = {
  jakarta: { font: jakarta, cssVar: '--font-jakarta' },
  inter: { font: inter, cssVar: '--font-inter' },
} as const;

/**
 * Returns the `<html>` class list and the CSS that binds the chosen families to
 * the `--font-display` / `--font-body` slots consumed by Tailwind.
 */
export function resolveFonts(theme: Theme) {
  const display = DISPLAY_FONTS[theme.fonts.display];
  const body = BODY_FONTS[theme.fonts.body];

  const classNames = Array.from(
    new Set([display.font.variable, body.font.variable]),
  ).join(' ');

  // `--brand-font-*` are the slots Tailwind's `font-display` / `font-sans`
  // utilities read from (see the `@theme inline` block in app/globals.css).
  const css =
    `:root{--brand-font-display:var(${display.cssVar});` +
    `--brand-font-body:var(${body.cssVar});}`;

  return { classNames, css };
}
