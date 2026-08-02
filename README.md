# Clinic Site Engine

One Next.js 15 project that generates unlimited premium clinic websites.

To launch a new clinic you replace **one file** — `content/clinic.json` — and nothing else.
No new project, no component edits, no hardcoded copy anywhere in the codebase.

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## The workflow

```bash
npm run use dental-clinic     # swap in a clinic from content/examples
npm run validate              # check the content file before you run anything
npm run dev                   # done — the whole site is that clinic now
```

For a real client:

1. Copy `content/examples/dental-clinic.json` to `content/clinic.json`.
2. Replace the values. Delete any section you don't have data for.
3. `npm run validate` — confirms the file parses and lists which sections will render.
4. `npm run build && npm run start`.

That's the entire process. Steps 2–4 never involve touching `.tsx`.

---

## Why the architecture holds up after 100 clinics

**One contract, one source of truth.** `types/clinic.ts` holds a Zod schema that both
validates the JSON *and* generates the TypeScript types every component consumes. Data and
types cannot drift. A malformed content file fails the build with a readable path-by-path
error instead of rendering a broken page.

**Sections are looked up, not listed.** `app/page.tsx` contains no section names. It walks
the order returned by `getSectionOrder()` and resolves each key through
`sections/registry.ts`. Reordering the page is a JSON edit:

```json
"layout": { "sections": ["hero", "services", "testimonials", "doctors", "contact"] }
```

**Missing data removes the section.** This is the rule that makes the engine reusable. If a
clinic has no gallery, the gallery section does not render, the nav entry disappears, the
alternating background rhythm recalculates around the gap, and the structured data omits it.
There are no empty states, placeholder cards or "coming soon" panels anywhere in the system.
The same logic applies field by field: no `secondaryImage` means the collage becomes a single
image; no phone number means the "call" CTA is dropped rather than rendered dead.

**Branding is generated, not authored.** You give two hex codes. `lib/theme.ts` derives a
full 50→950 ramp for each — eased lightness, chroma pulled back in the tints so they never go
neon — plus readable button foregrounds and the radius scale, and inlines the lot as CSS
custom properties in the first HTML byte. No theme flash, no client-side theming runtime.

**Nothing is clinic-specific.** There is no `LumenHero.tsx`. Components are named for what
they are (`Hero`, `Services`, `Doctors`) and receive everything through props.

---

## Project structure

```
app/
  layout.tsx           Root shell: theme injection, header, footer, JSON-LD
  page.tsx             Renders whatever sections the content file provides
  globals.css          Design tokens (@theme inline) + base layer
  icon.tsx             Favicon generated from the clinic name + brand colour
  sitemap.ts robots.ts not-found.tsx

sections/              One file per section type. Each takes { clinic, tone }.
  registry.ts          SectionKey → component. The seam that makes the page data-driven.

components/
  ui/                  Button, Section, Container, Reveal, Accordion, Lightbox,
                       Counter, Rating, SmartImage
  layout/              Header, Footer, Logo, SkipLink, FloatingActions
  gallery/ contact/ testimonials/    Client islands used by their server sections

lib/
  clinic.ts            Loads + validates the content file; section order & visibility
  theme.ts             Brand colour → full palette → CSS custom properties
  fonts.ts             Curated next/font registry, selected from the content file
  seo.ts jsonld.ts     Metadata and schema.org, both derived from the content file
  icons.ts             Curated Lucide registry (icons referenced by name in JSON)
  utils.ts             cn, CTA resolution, phone/WhatsApp/maps links, formatters

hooks/                 useCountUp, useScrollSpy, useUi (scroll, media query, escape, lock)
types/clinic.ts        THE CONTRACT — Zod schema + inferred types
content/
  clinic.json          The active clinic
  examples/            Reference clinics you can swap in
scripts/               validate-content.ts, use-clinic.ts
```

---

## The content file

Only `clinic.name`, `seo` and `contact` are required. **Every section is optional** — omit the
key and the section ceases to exist.

### Semantic CTAs

Buttons declare intent, not URLs, so a new clinic never rewrites link plumbing:

```json
{ "label": "Book now",  "action": "scroll",     "target": "contact" }
{ "label": "Call us",   "action": "call" }                  → tel: the primary phone
{ "label": "WhatsApp",  "action": "whatsapp", "message": "Hi!" }
{ "label": "Email",     "action": "email" }
{ "label": "Directions","action": "directions" }            → the address on Google Maps
{ "label": "Read more", "action": "link", "href": "/blog" }
```

If the data an action depends on is missing, the button is silently dropped instead of
rendering a broken link.

### Theme

```json
"theme": {
  "colors": { "primary": "#0E5C5A", "accent": "#C8A96A",
              "ink": "#101B1A", "surface": "#FFFFFF", "muted": "#F7F5F1" },
  "fonts":  { "display": "fraunces | playfair | jakarta",
              "body":    "jakarta | inter" },
  "radius": "sharp | soft | round"
}
```

`primary` is anchored at shade 700 — the shade the primary button uses — so the hex you type
is the colour you see on "Book appointment". Everything else is interpolated from it.

Fonts are a curated set because `next/font` needs statically analysable calls. All faces are
self-hosted at build time; only the two selected are ever downloaded by the browser.

### Icons

Icons are referenced by name (`"icon": "HeartPulse"`) and resolved through `lib/icons.ts`,
which is an explicit map of ~85 Lucide icons rather than a wildcard import — so the bundle
ships 85 icons, not 1,500. Names are matched case- and dash-insensitively
(`heart-pulse` works too). Unknown names fall back gracefully. To add one: add the import
and the map entry.

### Images

`"image": "https://..."` or `{ "src", "alt", "width", "height", "blurDataURL" }` — both are
accepted. Every image goes through `SmartImage`, which renders a branded placeholder when the
source is missing *or* fails to load, so a half-populated content file still looks deliberate.
Remote images are allowed over HTTPS from any host, since each clinic brings its own asset
host.

### The appointment form

Backend-free by default: `mode: "whatsapp"` composes the submission into a WhatsApp message,
`mode: "email"` into a mailto draft. Set `mode: "endpoint"` with an `endpointUrl` to POST JSON
to a CRM instead. Fields, labels, types and column spans are all data.

---

## Sections

| key | renders when |
|---|---|
| `hero` | `hero.headline` is set |
| `stats` | `stats.items` is non-empty |
| `about` | any of paragraphs / highlights / images |
| `services` `whyChooseUs` `doctors` `technologies` `gallery` `testimonials` `awards` `faqs` | `items` is non-empty |
| `ctaBanner` | a title *and* at least one CTA |
| `contact` | a phone, an email or an address |
| `map` | a map embed URL exists |

Any section also accepts `"hidden": true` to switch it off without deleting the content, and
`"navLabel"` to override its name in the navigation.

---

## Performance & quality

- Fully statically prerendered (`○ (Static)` for every route), ~180 kB first-load JS.
- Sections are Server Components. Only the genuinely interactive parts — gallery filter,
  testimonial carousel, contact form, header, count-ups — are client islands, and they
  receive their slice of the content rather than the whole clinic object.
- `next/image` throughout with AVIF/WebP, explicit `sizes`, and only the hero eager-loaded.
- Animations are transform + opacity only, and every one collapses to a no-op under
  `prefers-reduced-motion`.
- Semantic landmarks, one `<h1>`, `aria-labelledby` on every section, a skip link, visible
  focus rings, keyboard-operable accordion / carousel / lightbox, and generated palettes
  checked for WCAG AA text contrast and 3:1 on non-text marks.
- SEO: Open Graph, Twitter cards, canonical, sitemap, robots, and a schema.org graph
  (`MedicalBusiness` + the clinic's own type, `WebSite`, `FAQPage`) carrying hours, geo,
  reviews, aggregate rating, staff and a service catalogue — all from the content file.

---

## Scripts

| command | what it does |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `start` | production build and serve |
| `npm run validate` | validates the content file and reports render/skip per section |
| `npm run use <name>` | swap in a clinic from `content/examples` (backs up the current one) |
| `npm run typecheck` | `tsc --noEmit` |

---

## Adding a new section type to the engine

Rare, but it's three steps and no existing file grows a special case:

1. Add its schema to `types/clinic.ts` and its key to `SECTION_KEYS`.
2. Add a `has-content` case in `sectionHasContent()` and an id/label to `SECTION_META`.
3. Create `sections/YourSection.tsx` and register it in `sections/registry.ts`.
