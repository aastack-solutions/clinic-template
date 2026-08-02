import { ArrowUpRight, MapPin } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { directionsHref, formatAddress } from '@/lib/utils';

import type { SectionProps } from './types';

/**
 * Location map. The iframe is lazy-loaded so it never competes with the hero for
 * bandwidth, and it is paired with a real "Get directions" link because an
 * embedded map alone is not an accessible way to convey an address.
 */
export function Map({ clinic }: SectionProps) {
  const config = clinic.map;
  const embedUrl = config?.embedUrl ?? clinic.contact.mapEmbedUrl;
  if (!embedUrl) return null;

  const address = formatAddress(clinic.contact.address);
  const directions = directionsHref(clinic);
  const height = config?.height ?? 460;

  return (
    <section
      id="find-us"
      aria-label={config?.navLabel ?? `Find ${clinic.clinic.name}`}
      className="relative scroll-mt-24 bg-surface pb-18 sm:pb-24"
    >
      <Container size="wide">
        <Reveal>
          <div className="overflow-hidden rounded-panel border border-ink/8 shadow-[var(--shadow-soft)]">
            {address || directions ? (
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/8 bg-surface px-6 py-5 sm:px-8">
                {address ? (
                  <p className="flex items-start gap-3 text-sm text-ink/70">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary-700" aria-hidden="true" />
                    {address}
                  </p>
                ) : null}

                {directions ? (
                  <a
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 transition-colors hover:text-primary-950"
                  >
                    Open in Google Maps
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            ) : null}

            <iframe
              src={embedUrl}
              title={`Map showing the location of ${clinic.clinic.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block w-full border-0 grayscale-[0.25] transition-[filter] duration-700 hover:grayscale-0"
              style={{ height: `${height}px` }}
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
