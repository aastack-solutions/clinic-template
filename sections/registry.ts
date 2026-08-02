import type { ComponentType } from 'react';

import type { SectionKey } from '@/types/clinic';

import { About } from './About';
import { Awards } from './Awards';
import { Contact } from './Contact';
import { CtaBanner } from './CtaBanner';
import { Doctors } from './Doctors';
import { Faqs } from './Faqs';
import { Gallery } from './Gallery';
import { Hero } from './Hero';
import { Map } from './Map';
import { Services } from './Services';
import { Stats } from './Stats';
import { Technologies } from './Technologies';
import { Testimonials } from './Testimonials';
import { WhyChooseUs } from './WhyChooseUs';
import type { SectionProps } from './types';

/**
 * The section registry — the seam that makes the page data-driven.
 *
 * `app/page.tsx` never names a section: it walks the order produced by
 * `getSectionOrder()` and looks each key up here. Adding a new section type to
 * the engine means adding a schema entry, a component, and one line below.
 */
export const SECTION_COMPONENTS: Record<SectionKey, ComponentType<SectionProps>> = {
  hero: Hero,
  stats: Stats,
  about: About,
  services: Services,
  whyChooseUs: WhyChooseUs,
  doctors: Doctors,
  technologies: Technologies,
  gallery: Gallery,
  testimonials: Testimonials,
  awards: Awards,
  faqs: Faqs,
  ctaBanner: CtaBanner,
  contact: Contact,
  map: Map,
};
