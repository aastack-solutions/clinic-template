import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { Section, SectionHeading } from '@/components/ui/Section';

import type { SectionProps } from './types';

/**
 * Server wrapper: the heading renders on the server and only the interactive
 * grid ships to the client, with just the gallery slice of the content file
 * crossing the boundary rather than the whole clinic object.
 */
export function Gallery({ clinic, tone }: SectionProps) {
  const gallery = clinic.gallery;
  if (!gallery || gallery.items.length === 0) return null;

  return (
    <Section id="gallery" tone={tone} ariaLabel={gallery.title ? undefined : gallery.navLabel ?? 'Gallery'}>
      <SectionHeading
        id="gallery"
        eyebrow={gallery.eyebrow}
        title={gallery.title}
        description={gallery.description}
        className="mb-12"
      />

      <GalleryGrid items={gallery.items} categories={gallery.categories} clinicName={clinic.clinic.name} />
    </Section>
  );
}
