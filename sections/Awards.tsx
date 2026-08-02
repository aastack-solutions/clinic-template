import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { hoverLift, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * Recognition strip. Awards with artwork render as a logo wall; awards without
 * fall back to typographic cards, so the section never looks half-finished.
 */
export function Awards({ clinic, tone }: SectionProps) {
  const awards = clinic.awards;
  if (!awards || awards.items.length === 0) return null;

  return (
    <Section
      id="awards"
      tone={tone}
      spacing="sm"
      ariaLabel={awards.title ? undefined : awards.navLabel ?? 'Awards and recognition'}
    >
      <SectionHeading
        id="awards"
        eyebrow={awards.eyebrow}
        title={awards.title}
        description={awards.description}
        className="mb-12"
      />

      <Stagger
        as="ul"
        className={cn(
          'grid gap-5 sm:grid-cols-2',
          awards.items.length >= 3 && 'lg:grid-cols-3',
          awards.items.length % 4 === 0 && awards.items.length >= 4 && 'xl:grid-cols-4',
        )}
      >
        {awards.items.map((award) => {
          const Icon = getIcon(award.icon ?? 'Award');
          const hasImage = Boolean(award.image?.src);

          return (
            <StaggerItem as="li" key={`${award.title}-${award.year ?? ''}`} className="h-full">
              <article
                className={cn(
                  'flex h-full flex-col items-start gap-4 rounded-card border border-ink/8 bg-surface p-7',
                  'shadow-[var(--shadow-soft)]',
                  hoverLift,
                  'hover:border-accent-400/40',
                )}
              >
                {hasImage ? (
                  <SmartImage
                    image={award.image}
                    alt={award.organization ?? award.title}
                    ratio="aspect-[3/2]"
                    rounded="rounded-[0.75rem]"
                    sizes="180px"
                    className="w-28 bg-transparent"
                    imageClassName="object-contain"
                  />
                ) : (
                  <span className="grid size-12 place-items-center rounded-full bg-accent-100/70 text-accent-900">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                )}

                <div>
                  <h3 className="font-display text-[1.0625rem] leading-snug font-medium text-ink">{award.title}</h3>
                  {award.organization || award.year ? (
                    <p className="mt-1.5 text-sm text-ink/55">
                      {[award.organization, award.year].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {award.description ? (
                    <p className="mt-3 text-[0.875rem] leading-relaxed text-ink/60">{award.description}</p>
                  ) : null}
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
