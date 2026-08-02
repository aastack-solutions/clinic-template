import { z } from 'zod';

/**
 * ---------------------------------------------------------------------------
 * THE CLINIC CONTENT CONTRACT
 * ---------------------------------------------------------------------------
 * This file is the single source of truth for every website this engine can
 * produce. The Zod schema below both validates `content/clinic.json` at build
 * time and derives the TypeScript types consumed by every component, so the
 * data and the types can never drift apart.
 *
 * Rules of the contract:
 *  - Every *section* is optional. Omit it and it disappears from the site
 *    (navigation, schema.org output and page layout adapt automatically).
 *  - Every *cosmetic* field is optional and has a sensible default.
 *  - Only `clinic.name`, `seo` and `contact` are genuinely required, because a
 *    clinic website without a name or a way to get in touch is not a website.
 */

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

/** Accepts `"https://..."` or `{ src, alt, ... }` and always yields an object. */
export const ImageSchema = z.preprocess(
  (value) => (typeof value === 'string' ? { src: value } : value),
  z.object({
    src: z.string().min(1),
    alt: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    /** Base64 placeholder. When present the image blurs up while loading. */
    blurDataURL: z.string().optional(),
  }),
);

/**
 * How a call-to-action resolves at render time. Using semantic actions instead
 * of raw URLs means a new clinic never has to rewrite `tel:` / `wa.me` links.
 */
export const CtaActionSchema = z.enum([
  'link', // use `href` as-is
  'scroll', // smooth-scroll to `target` (a section id)
  'call', // tel: the clinic's primary phone
  'whatsapp', // wa.me the clinic's WhatsApp number, optionally with `message`
  'email', // mailto: the clinic's primary email
  'directions', // open the address in Google Maps
]);

export const CtaSchema = z.object({
  label: z.string().min(1),
  action: CtaActionSchema.default('link'),
  /** Used when `action` is `link`. */
  href: z.string().optional(),
  /** Section id when `action` is `scroll`. */
  target: z.string().optional(),
  /** Pre-filled body for `whatsapp` / `email` actions. */
  message: z.string().optional(),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  /** Lucide icon name, e.g. `"CalendarCheck"`. See `lib/icons.ts`. */
  icon: z.string().optional(),
});

const NonEmpty = <T extends z.ZodTypeAny>(schema: T) => z.array(schema).default([]);

/** Shared header for every section: small eyebrow, headline, supporting copy. */
const SectionHeaderSchema = {
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  /** Overrides the label used for this section in the navigation bar. */
  navLabel: z.string().optional(),
  /** Hide a section without deleting its content. */
  hidden: z.boolean().optional(),
};

/* -------------------------------------------------------------------------- */
/* Brand / theme                                                              */
/* -------------------------------------------------------------------------- */

const HexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Expected a hex colour such as "#0E5C5A"');

export const ThemeSchema = z
  .object({
    colors: z
      .object({
        /** Drives buttons, links, accents and the generated 50→950 ramp. */
        primary: HexColor.default('#0E5C5A'),
        /** Secondary highlight — used sparingly for a luxury feel. */
        accent: HexColor.default('#C8A96A'),
        /** Default text colour. */
        ink: HexColor.default('#101B1A'),
        /** Page background. */
        surface: HexColor.default('#FFFFFF'),
        /** Alternating "tinted" band background. */
        muted: HexColor.default('#F7F5F1'),
      })
      .default({}),
    fonts: z
      .object({
        display: z.enum(['fraunces', 'playfair', 'jakarta']).default('fraunces'),
        body: z.enum(['jakarta', 'inter']).default('jakarta'),
      })
      .default({}),
    /** Global corner rounding personality. */
    radius: z.enum(['sharp', 'soft', 'round']).default('soft'),
  })
  .default({});

/* -------------------------------------------------------------------------- */
/* Identity + SEO                                                             */
/* -------------------------------------------------------------------------- */

export const IdentitySchema = z.object({
  name: z.string().min(1),
  legalName: z.string().optional(),
  tagline: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  logo: z
    .object({
      light: ImageSchema.optional(),
      dark: ImageSchema.optional(),
      icon: ImageSchema.optional(),
    })
    .optional(),
  established: z.string().optional(),
  licenseNumber: z.string().optional(),
  /** Schema.org type, e.g. `Dentist`, `MedicalClinic`, `Physician`. */
  type: z.string().default('MedicalClinic'),
  priceRange: z.string().optional(),
});

export const SeoSchema = z.object({
  title: z.string().min(1),
  titleTemplate: z.string().optional(),
  description: z.string().min(1),
  keywords: NonEmpty(z.string()),
  siteUrl: z.string().url(),
  ogImage: ImageSchema.optional(),
  twitterHandle: z.string().optional(),
  locale: z.string().default('en_US'),
  language: z.string().default('en'),
  noindex: z.boolean().default(false),
  verification: z
    .object({ google: z.string().optional(), bing: z.string().optional() })
    .optional(),
});

/* -------------------------------------------------------------------------- */
/* Contact                                                                    */
/* -------------------------------------------------------------------------- */

export const OpeningHoursSchema = z.object({
  /** Human label, e.g. `"Monday – Friday"`. */
  days: z.string().min(1),
  /** 24h `"09:00"`. Omit both when `closed` is true. */
  opens: z.string().optional(),
  closes: z.string().optional(),
  closed: z.boolean().default(false),
  /** Machine-readable days for schema.org, e.g. `["Monday","Tuesday"]`. */
  schemaDays: NonEmpty(z.string()),
});

export const ContactSchema = z.object({
  ...SectionHeaderSchema,
  phones: NonEmpty(z.object({ label: z.string().optional(), number: z.string().min(1) })),
  whatsapp: z
    .object({
      /** Digits only, including country code. */
      number: z.string().min(1),
      defaultMessage: z.string().optional(),
      floatingButton: z.boolean().default(true),
    })
    .optional(),
  emails: NonEmpty(z.object({ label: z.string().optional(), address: z.string().email() })),
  address: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      /** Deep link used by the "Get directions" action. */
      mapsUrl: z.string().url().optional(),
    })
    .optional(),
  /** `https://www.google.com/maps/embed?pb=...` — the iframe `src`. */
  mapEmbedUrl: z.string().url().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  hours: NonEmpty(OpeningHoursSchema),
  emergencyNote: z.string().optional(),
  form: z
    .object({
      enabled: z.boolean().default(true),
      title: z.string().optional(),
      description: z.string().optional(),
      /**
       * `whatsapp` and `email` need no backend — the submission is composed
       * into a message. `endpoint` POSTs JSON to `endpointUrl`.
       */
      mode: z.enum(['whatsapp', 'email', 'endpoint']).default('whatsapp'),
      endpointUrl: z.string().url().optional(),
      submitLabel: z.string().default('Request appointment'),
      successMessage: z.string().default('Thank you — we will confirm your appointment shortly.'),
      consentText: z.string().optional(),
      /** Rendered in order. `select` requires `options`. */
      fields: NonEmpty(
        z.object({
          name: z.string().min(1),
          label: z.string().min(1),
          type: z.enum(['text', 'email', 'tel', 'date', 'textarea', 'select']).default('text'),
          placeholder: z.string().optional(),
          required: z.boolean().default(false),
          options: NonEmpty(z.string()),
          /** Column span on desktop. */
          span: z.enum(['half', 'full']).default('full'),
        }),
      ),
    })
    .optional(),
  ctas: NonEmpty(CtaSchema),
});

export const SocialSchema = z.object({
  platform: z.enum([
    'facebook',
    'instagram',
    'x',
    'twitter',
    'linkedin',
    'youtube',
    'tiktok',
    'whatsapp',
    'google',
  ]),
  url: z.string().url(),
  label: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

export const HeroSchema = z.object({
  ...SectionHeaderSchema,
  badge: z.string().optional(),
  headline: z.string().min(1),
  /** Rendered in the accent colour on its own emphasis span. */
  headlineAccent: z.string().optional(),
  subheadline: z.string().optional(),
  image: ImageSchema.optional(),
  /** Secondary image used in the layered composition. */
  secondaryImage: ImageSchema.optional(),
  ctas: NonEmpty(CtaSchema),
  /** Small trust chips under the CTAs. */
  highlights: NonEmpty(z.object({ icon: z.string().optional(), label: z.string().min(1) })),
  rating: z
    .object({
      score: z.number().min(0).max(5),
      count: z.number().int().nonnegative().optional(),
      source: z.string().optional(),
    })
    .optional(),
  /** Floating card over the hero image. */
  floatingCard: z
    .object({ icon: z.string().optional(), title: z.string(), subtitle: z.string().optional() })
    .optional(),
});

export const StatsSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(
    z.object({
      value: z.number(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      label: z.string().min(1),
      icon: z.string().optional(),
      /** Decimal places for the count-up animation. */
      decimals: z.number().int().min(0).max(2).default(0),
    }),
  ),
});

export const AboutSchema = z.object({
  ...SectionHeaderSchema,
  paragraphs: NonEmpty(z.string()),
  images: NonEmpty(ImageSchema),
  highlights: NonEmpty(
    z.object({ icon: z.string().optional(), title: z.string().min(1), description: z.string().optional() }),
  ),
  signature: z
    .object({ name: z.string(), role: z.string().optional(), image: ImageSchema.optional() })
    .optional(),
  /** Small badge overlaid on the image collage, e.g. "20 years of care". */
  badge: z.object({ value: z.string(), label: z.string() }).optional(),
  ctas: NonEmpty(CtaSchema),
});

export const ServicesSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional(),
      icon: z.string().optional(),
      image: ImageSchema.optional(),
      features: NonEmpty(z.string()),
      price: z
        .object({ from: z.string(), note: z.string().optional() })
        .optional(),
      duration: z.string().optional(),
      /** Featured services occupy a wider, image-led card. */
      featured: z.boolean().default(false),
      cta: CtaSchema.optional(),
    }),
  ),
  ctas: NonEmpty(CtaSchema),
});

export const WhyChooseUsSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(
    z.object({ icon: z.string().optional(), title: z.string().min(1), description: z.string().optional() }),
  ),
  image: ImageSchema.optional(),
  ctas: NonEmpty(CtaSchema),
});

export const DoctorsSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      role: z.string().optional(),
      credentials: z.string().optional(),
      bio: z.string().optional(),
      image: ImageSchema.optional(),
      specialties: NonEmpty(z.string()),
      languages: NonEmpty(z.string()),
      experienceYears: z.number().int().nonnegative().optional(),
      socials: NonEmpty(SocialSchema),
      cta: CtaSchema.optional(),
    }),
  ),
  ctas: NonEmpty(CtaSchema),
});

export const TechnologiesSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      icon: z.string().optional(),
      image: ImageSchema.optional(),
      benefits: NonEmpty(z.string()),
    }),
  ),
});

export const GallerySchema = z.object({
  ...SectionHeaderSchema,
  categories: NonEmpty(z.object({ id: z.string().min(1), label: z.string().min(1) })),
  items: NonEmpty(
    z.object({
      id: z.string().min(1),
      image: ImageSchema,
      caption: z.string().optional(),
      category: z.string().optional(),
      /** `tall` items span two rows in the mosaic. */
      size: z.enum(['normal', 'tall', 'wide']).default('normal'),
    }),
  ),
});

export const TestimonialsSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      quote: z.string().min(1),
      rating: z.number().min(0).max(5).optional(),
      location: z.string().optional(),
      treatment: z.string().optional(),
      image: ImageSchema.optional(),
      date: z.string().optional(),
    }),
  ),
  summary: z
    .object({
      averageRating: z.number().min(0).max(5),
      totalReviews: z.number().int().nonnegative().optional(),
      source: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
});

export const AwardsSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(
    z.object({
      title: z.string().min(1),
      organization: z.string().optional(),
      year: z.string().optional(),
      description: z.string().optional(),
      image: ImageSchema.optional(),
      icon: z.string().optional(),
    }),
  ),
});

export const FaqsSchema = z.object({
  ...SectionHeaderSchema,
  items: NonEmpty(z.object({ question: z.string().min(1), answer: z.string().min(1) })),
  ctas: NonEmpty(CtaSchema),
});

export const CtaBannerSchema = z.object({
  ...SectionHeaderSchema,
  image: ImageSchema.optional(),
  ctas: NonEmpty(CtaSchema),
});

export const MapSchema = z.object({
  ...SectionHeaderSchema,
  /** Falls back to `contact.mapEmbedUrl` when omitted. */
  embedUrl: z.string().url().optional(),
  height: z.number().int().positive().default(460),
});

/* -------------------------------------------------------------------------- */
/* Chrome (header / footer / layout)                                          */
/* -------------------------------------------------------------------------- */

/** Canonical render order. `layout.sections` may reorder or trim this list. */
export const SECTION_KEYS = [
  'hero',
  'stats',
  'about',
  'services',
  'whyChooseUs',
  'doctors',
  'technologies',
  'gallery',
  'testimonials',
  'awards',
  'faqs',
  'ctaBanner',
  'contact',
  'map',
] as const;

export const SectionKeySchema = z.enum(SECTION_KEYS);

export const LayoutSchema = z
  .object({
    /** Render order. Unknown keys are ignored; omitted keys are not rendered. */
    sections: NonEmpty(SectionKeySchema),
    /** Section ids to surface in the navigation bar (defaults to a sensible subset). */
    nav: NonEmpty(SectionKeySchema),
    stickyHeader: z.boolean().default(true),
    showFloatingActions: z.boolean().default(true),
    /** Alternate band backgrounds automatically. */
    alternateBackgrounds: z.boolean().default(true),
  })
  .default({});

export const HeaderSchema = z
  .object({
    /** Thin bar above the header — great for hours or an emergency line. */
    topbar: z
      .object({
        enabled: z.boolean().default(true),
        message: z.string().optional(),
        showPhone: z.boolean().default(true),
        showHours: z.boolean().default(true),
      })
      .optional(),
    cta: CtaSchema.optional(),
  })
  .default({});

export const FooterSchema = z
  .object({
    description: z.string().optional(),
    columns: NonEmpty(
      z.object({
        title: z.string().min(1),
        links: NonEmpty(CtaSchema),
      }),
    ),
    legalLinks: NonEmpty(CtaSchema),
    copyright: z.string().optional(),
    note: z.string().optional(),
  })
  .default({});

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

export const ClinicSchema = z.object({
  $schema: z.string().optional(),
  clinic: IdentitySchema,
  theme: ThemeSchema,
  seo: SeoSchema,
  layout: LayoutSchema,
  header: HeaderSchema,
  footer: FooterSchema,
  contact: ContactSchema,
  social: NonEmpty(SocialSchema),

  hero: HeroSchema.optional(),
  stats: StatsSchema.optional(),
  about: AboutSchema.optional(),
  services: ServicesSchema.optional(),
  whyChooseUs: WhyChooseUsSchema.optional(),
  doctors: DoctorsSchema.optional(),
  technologies: TechnologiesSchema.optional(),
  gallery: GallerySchema.optional(),
  testimonials: TestimonialsSchema.optional(),
  awards: AwardsSchema.optional(),
  faqs: FaqsSchema.optional(),
  ctaBanner: CtaBannerSchema.optional(),
  map: MapSchema.optional(),
});

/* -------------------------------------------------------------------------- */
/* Inferred types — import these everywhere instead of re-declaring shapes.   */
/* -------------------------------------------------------------------------- */

export type Clinic = z.infer<typeof ClinicSchema>;
export type SectionKey = (typeof SECTION_KEYS)[number];
export type ClinicImage = z.infer<typeof ImageSchema>;
export type Cta = z.infer<typeof CtaSchema>;
export type CtaAction = z.infer<typeof CtaActionSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Identity = z.infer<typeof IdentitySchema>;
export type Seo = z.infer<typeof SeoSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Hero = z.infer<typeof HeroSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type About = z.infer<typeof AboutSchema>;
export type Services = z.infer<typeof ServicesSchema>;
export type Service = Services['items'][number];
export type WhyChooseUs = z.infer<typeof WhyChooseUsSchema>;
export type Doctors = z.infer<typeof DoctorsSchema>;
export type Doctor = Doctors['items'][number];
export type Technologies = z.infer<typeof TechnologiesSchema>;
export type Gallery = z.infer<typeof GallerySchema>;
export type GalleryItem = Gallery['items'][number];
export type Testimonials = z.infer<typeof TestimonialsSchema>;
export type Testimonial = Testimonials['items'][number];
export type Awards = z.infer<typeof AwardsSchema>;
export type Faqs = z.infer<typeof FaqsSchema>;
export type CtaBanner = z.infer<typeof CtaBannerSchema>;
export type MapSection = z.infer<typeof MapSchema>;
export type Header = z.infer<typeof HeaderSchema>;
export type Footer = z.infer<typeof FooterSchema>;
export type Layout = z.infer<typeof LayoutSchema>;
