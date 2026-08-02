/**
 * Standalone content check — run `npm run validate` after dropping in a new
 * `content/clinic.json` to get a readable report before starting the dev server.
 *
 * It validates against the schema and then reports which sections will render,
 * which will be skipped for lack of data, and anything that looks like an
 * oversight rather than a deliberate omission.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ClinicSchema, SECTION_KEYS, type Clinic, type SectionKey } from '../types/clinic';

const CONTENT_PATH = resolve(process.cwd(), 'content/clinic.json');

const green = (text: string) => `[32m${text}[0m`;
const red = (text: string) => `[31m${text}[0m`;
const dim = (text: string) => `[2m${text}[0m`;
const yellow = (text: string) => `[33m${text}[0m`;
const bold = (text: string) => `[1m${text}[0m`;

const raw = JSON.parse(readFileSync(CONTENT_PATH, 'utf8')) as unknown;
const result = ClinicSchema.safeParse(raw);

if (!result.success) {
  console.error(`\n${red('✕ content/clinic.json is not valid')}\n`);
  for (const issue of result.error.issues) {
    console.error(`  ${red('•')} ${bold(issue.path.join('.') || '(root)')}: ${issue.message}`);
  }
  console.error(`\n${dim('The full contract is documented in types/clinic.ts')}\n`);
  process.exit(1);
}

const clinic: Clinic = result.data;

/** Mirrors `sectionHasContent` in lib/clinic.ts. */
const populated: Record<SectionKey, boolean> = {
  hero: Boolean(clinic.hero?.headline),
  stats: (clinic.stats?.items.length ?? 0) > 0,
  about:
    (clinic.about?.paragraphs.length ?? 0) > 0 ||
    (clinic.about?.highlights.length ?? 0) > 0 ||
    (clinic.about?.images.length ?? 0) > 0,
  services: (clinic.services?.items.length ?? 0) > 0,
  whyChooseUs: (clinic.whyChooseUs?.items.length ?? 0) > 0,
  doctors: (clinic.doctors?.items.length ?? 0) > 0,
  technologies: (clinic.technologies?.items.length ?? 0) > 0,
  gallery: (clinic.gallery?.items.length ?? 0) > 0,
  testimonials: (clinic.testimonials?.items.length ?? 0) > 0,
  awards: (clinic.awards?.items.length ?? 0) > 0,
  faqs: (clinic.faqs?.items.length ?? 0) > 0,
  ctaBanner: Boolean(clinic.ctaBanner?.title) && (clinic.ctaBanner?.ctas.length ?? 0) > 0,
  contact:
    clinic.contact.phones.length > 0 || clinic.contact.emails.length > 0 || Boolean(clinic.contact.address),
  map: Boolean(clinic.map?.embedUrl ?? clinic.contact.mapEmbedUrl),
};

console.log(`\n${green('✓')} ${bold(clinic.clinic.name)} — content is valid\n`);
console.log(`  ${dim('Sections')}`);

for (const key of SECTION_KEYS) {
  const hidden = (clinic[key as keyof Clinic] as { hidden?: boolean } | undefined)?.hidden;
  const status = hidden ? yellow('hidden') : populated[key] ? green('render') : dim('skip  ');
  console.log(`    ${status}  ${key}`);
}

const warnings: string[] = [];
if (!clinic.seo.ogImage) warnings.push('No seo.ogImage — social shares will fall back to the hero image.');
if (!clinic.contact.whatsapp && clinic.contact.form?.mode === 'whatsapp') {
  warnings.push('contact.form.mode is "whatsapp" but no contact.whatsapp number is set — the form cannot submit.');
}
if (clinic.contact.form?.mode === 'endpoint' && !clinic.contact.form.endpointUrl) {
  warnings.push('contact.form.mode is "endpoint" but contact.form.endpointUrl is missing.');
}
if (clinic.contact.hours.length === 0) warnings.push('No opening hours — the hours block and schema.org output are omitted.');
if (!clinic.contact.mapEmbedUrl && !clinic.map?.embedUrl) warnings.push('No map embed URL — the map section will not render.');

if (warnings.length > 0) {
  console.log(`\n  ${yellow('Warnings')}`);
  for (const warning of warnings) console.log(`    ${yellow('!')} ${warning}`);
}

console.log('');
