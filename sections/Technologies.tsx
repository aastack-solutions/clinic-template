import { Check } from 'lucide-react';

import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { hoverLift, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * Equipment and technique. Alternating rows on desktop give each item room to
 * breathe and stop the section from reading as another card grid; on mobile the
 * order is always image-then-copy so the narrative stays consistent.
 */
export function Technologies({ clinic, tone }: SectionProps) {
  const technologies = clinic.technologies;
  if (!technologies || technologies.items.length === 0) return null;

  const anyImages = technologies.items.some((item) => Boolean(item.image?.src));

  return (
    <Section
      id="technology"
      tone={tone}
      ariaLabel={technologies.title ? undefined : technologies.navLabel ?? 'Our technology'}
    >
      <SectionHeading
        id="technology"
        eyebrow={technologies.eyebrow}
        title={technologies.title}
        description={technologies.description}
        className="mb-14 lg:mb-20"
      />

      {anyImages ? (
        <div className="flex flex-col gap-16 lg:gap-24">
          {technologies.items.map((item, index) => {
            const Icon = getIcon(item.icon);
            const reversed = index % 2 === 1;

            return (
              <Stagger
                key={item.name}
                className={cn(
                  'grid items-center gap-8 lg:grid-cols-2 lg:gap-16',
                  reversed && 'lg:[&>*:first-child]:order-2',
                )}
              >
                <StaggerItem>
                  <SmartImage
                    image={item.image}
                    alt={item.name}
                    ratio="aspect-[16/11]"
                    rounded="rounded-panel"
                    sizes="(max-width: 1024px) 92vw, 46vw"
                    fallbackIcon={item.icon ?? 'Cpu'}
                    className="shadow-[var(--shadow-lift)]"
                  />
                </StaggerItem>

                <StaggerItem>
                  <span className="grid size-12 place-items-center rounded-[0.9rem] bg-primary-50 text-primary-800">
                    <Icon className="size-[1.35rem]" aria-hidden="true" />
                  </span>

                  <h3 className="mt-6 font-display text-2xl leading-snug font-medium text-ink sm:text-[1.75rem]">
                    {item.name}
                  </h3>

                  {item.description ? (
                    <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-ink/60">{item.description}</p>
                  ) : null}

                  {item.benefits.length > 0 ? (
                    <ul className="mt-6 flex flex-col gap-3">
                      {item.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3 text-[0.9375rem] text-ink/65">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-800">
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </StaggerItem>
              </Stagger>
            );
          })}
        </div>
      ) : (
        <Stagger as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.items.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <StaggerItem as="li" key={item.name} className="h-full">
                <div
                  className={cn(
                    'flex h-full flex-col rounded-card border border-ink/8 bg-surface p-7',
                    'shadow-[var(--shadow-soft)]',
                    hoverLift,
                    'hover:border-primary-700/25',
                  )}
                >
                  <span className="grid size-12 place-items-center rounded-[0.9rem] bg-primary-50 text-primary-800">
                    <Icon className="size-[1.35rem]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-medium text-ink">{item.name}</h3>
                  {item.description ? (
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">{item.description}</p>
                  ) : null}
                  {item.benefits.length > 0 ? (
                    <ul className="mt-5 flex flex-col gap-2.5">
                      {item.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink/65">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary-700" aria-hidden="true" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </Section>
  );
}
