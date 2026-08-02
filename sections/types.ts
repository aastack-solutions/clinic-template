import type { Clinic } from '@/types/clinic';

/**
 * Every section receives exactly this. Sections read their own slice of the
 * content file and are handed the background tone by the layout engine, which
 * is what keeps them clinic-agnostic and reorderable.
 */
export type SectionProps = {
  clinic: Clinic;
  tone: 'surface' | 'muted';
};
