import rawClinic from '@/content/clinic.json';
import { ClinicSchema, SECTION_KEYS, type Clinic, type SectionKey } from '@/types/clinic';

import { hasItems } from './utils';

/* -------------------------------------------------------------------------- */
/* Load + validate                                                            */
/* -------------------------------------------------------------------------- */

const parsed = ClinicSchema.safeParse(rawClinic);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `\n\ncontent/clinic.json failed validation.\nFix the following and restart:\n\n${issues}\n\n` +
      `The full contract lives in types/clinic.ts.\n`,
  );
}

/**
 * The validated, fully-defaulted content for this build.
 * Every component reads from here — nothing in the codebase hardcodes copy.
 *
 * Import this module from Server Components only. Client components receive the
 * slice of content they need through props, so the JSON and the Zod runtime
 * never reach the browser bundle.
 */
export const clinic: Clinic = parsed.data;

/* -------------------------------------------------------------------------- */
/* Section metadata                                                           */
/* -------------------------------------------------------------------------- */

/** Stable DOM ids + default navigation labels for every section. */
export const SECTION_META: Record<SectionKey, { id: string; label: string }> = {
  hero: { id: 'home', label: 'Home' },
  stats: { id: 'results', label: 'Results' },
  about: { id: 'about', label: 'About' },
  services: { id: 'services', label: 'Services' },
  whyChooseUs: { id: 'why-us', label: 'Why us' },
  doctors: { id: 'team', label: 'Our team' },
  technologies: { id: 'technology', label: 'Technology' },
  gallery: { id: 'gallery', label: 'Gallery' },
  testimonials: { id: 'testimonials', label: 'Reviews' },
  awards: { id: 'awards', label: 'Awards' },
  faqs: { id: 'faqs', label: 'FAQs' },
  ctaBanner: { id: 'book', label: 'Book' },
  contact: { id: 'contact', label: 'Contact' },
  map: { id: 'find-us', label: 'Find us' },
};

/** Sections offered in the header when `layout.nav` is not specified. */
const DEFAULT_NAV: SectionKey[] = [
  'about',
  'services',
  'doctors',
  'technologies',
  'gallery',
  'testimonials',
  'faqs',
  'contact',
];

/* -------------------------------------------------------------------------- */
/* Missing-data handling                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The single rule that makes the engine work for any clinic: a section renders
 * only when it actually has content. No empty states, no placeholder cards, no
 * "Coming soon" — the section simply is not part of the page, and the nav,
 * scroll-spy and structured data adjust with it.
 */
export function sectionHasContent(source: Clinic, key: SectionKey): boolean {
  const section = source[key as keyof Clinic] as { hidden?: boolean } | undefined;
  if (section && typeof section === 'object' && 'hidden' in section && section.hidden) return false;

  switch (key) {
    case 'hero':
      return Boolean(source.hero?.headline);
    case 'stats':
      return hasItems(source.stats?.items);
    case 'about':
      return (
        hasItems(source.about?.paragraphs) ||
        hasItems(source.about?.highlights) ||
        hasItems(source.about?.images)
      );
    case 'services':
      return hasItems(source.services?.items);
    case 'whyChooseUs':
      return hasItems(source.whyChooseUs?.items);
    case 'doctors':
      return hasItems(source.doctors?.items);
    case 'technologies':
      return hasItems(source.technologies?.items);
    case 'gallery':
      return hasItems(source.gallery?.items);
    case 'testimonials':
      return hasItems(source.testimonials?.items);
    case 'awards':
      return hasItems(source.awards?.items);
    case 'faqs':
      return hasItems(source.faqs?.items);
    case 'ctaBanner':
      return Boolean(source.ctaBanner?.title) && hasItems(source.ctaBanner?.ctas);
    case 'contact':
      return (
        hasItems(source.contact.phones) ||
        hasItems(source.contact.emails) ||
        Boolean(source.contact.address)
      );
    case 'map':
      return Boolean(source.map?.embedUrl ?? source.contact.mapEmbedUrl);
    default:
      return false;
  }
}

/** Ordered list of the sections this clinic will actually render. */
export function getSectionOrder(source: Clinic = clinic): SectionKey[] {
  const requested = hasItems(source.layout.sections) ? source.layout.sections : [...SECTION_KEYS];
  const seen = new Set<SectionKey>();
  return requested.filter((key) => {
    if (seen.has(key)) return false;
    seen.add(key);
    return sectionHasContent(source, key);
  });
}

export type NavItem = { key: SectionKey; id: string; label: string };

/** Navigation derived from the rendered sections — never a hardcoded menu. */
export function getNavItems(source: Clinic = clinic): NavItem[] {
  const rendered = new Set(getSectionOrder(source));
  const requested = hasItems(source.layout.nav) ? source.layout.nav : DEFAULT_NAV;
  return requested
    .filter((key) => rendered.has(key))
    .map((key) => {
      const section = source[key as keyof Clinic] as { navLabel?: string } | undefined;
      return {
        key,
        id: SECTION_META[key].id,
        label: section?.navLabel ?? SECTION_META[key].label,
      };
    });
}

/** Alternating band backgrounds, computed from the *rendered* order. */
export function getSectionTones(source: Clinic = clinic): Record<string, 'surface' | 'muted'> {
  const order = getSectionOrder(source);
  const tones: Record<string, 'surface' | 'muted'> = {};
  if (!source.layout.alternateBackgrounds) {
    order.forEach((key) => (tones[key] = 'surface'));
    return tones;
  }
  // The hero and the CTA banner paint their own backgrounds and are excluded
  // from the rhythm so the alternation never doubles up around them.
  let index = 0;
  for (const key of order) {
    if (key === 'hero' || key === 'ctaBanner' || key === 'map') {
      tones[key] = 'surface';
      continue;
    }
    tones[key] = index % 2 === 0 ? 'surface' : 'muted';
    index += 1;
  }
  return tones;
}
