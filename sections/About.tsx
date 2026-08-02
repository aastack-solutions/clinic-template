import { getOptionalIcon } from '@/lib/icons';
import { cn, resolveCtas } from '@/lib/utils';

import { CtaGroup } from '@/components/ui/Button';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * Story section: an image collage on one side, the narrative and proof points on
 * the other. The collage adapts to however many images the clinic supplies —
 * one, two, or none — without leaving a hole in the layout.
 */
export function About({ clinic, tone }: SectionProps) {
  const about = clinic.about;
  if (!about) return null;

  const ctas = resolveCtas(about.ctas, clinic);
  const [primaryImage, secondaryImage] = about.images;
  const hasImages = Boolean(primaryImage);

  return (
    <Section id="about" tone={tone} ariaLabel={about.title ? undefined : about.navLabel ?? 'About the clinic'}>
      <div className={cn('grid items-center gap-14', hasImages && 'lg:grid-cols-2 lg:gap-20')}>
        {hasImages ? (
          <Reveal direction="right" className="relative">
            <div className="relative">
              <SmartImage
                image={primaryImage}
                alt={`Inside ${clinic.clinic.name}`}
                ratio={secondaryImage ? 'aspect-4/5' : 'aspect-[4/3]'}
                rounded="rounded-panel"
                sizes="(max-width: 1024px) 92vw, 44vw"
                fallbackIcon="Building"
                className="shadow-[var(--shadow-lift)]"
              />

              {secondaryImage ? (
                <SmartImage
                  image={secondaryImage}
                  alt={`${clinic.clinic.name} team at work`}
                  ratio="aspect-[4/3]"
                  rounded="rounded-card"
                  sizes="260px"
                  fallbackIcon="Users"
                  className={cn(
                    'absolute -right-4 -bottom-10 w-44 ring-8 sm:-right-8 sm:w-56 lg:-right-12',
                    tone === 'muted' ? 'ring-muted' : 'ring-surface',
                  )}
                />
              ) : null}

              {about.badge ? (
                <div className="absolute -top-5 -left-4 rounded-card bg-primary-900 px-5 py-4 text-white shadow-[var(--shadow-lift)] sm:-left-8">
                  <p className="font-display text-2xl leading-none font-medium">{about.badge.value}</p>
                  <p className="mt-1.5 text-[0.6875rem] tracking-[0.14em] text-white/60 uppercase">
                    {about.badge.label}
                  </p>
                </div>
              ) : null}
            </div>
          </Reveal>
        ) : null}

        <div className={cn(hasImages && secondaryImage && 'mt-10 lg:mt-0')}>
          {about.eyebrow ? <Eyebrow>{about.eyebrow}</Eyebrow> : null}

          {about.title ? (
            <Reveal>
              <h2
                id="about-title"
                className="mt-5 font-display text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] leading-[1.08] font-medium text-ink"
              >
                {about.title}
              </h2>
            </Reveal>
          ) : null}

          {about.paragraphs.length > 0 ? (
            <Reveal delay={0.08}>
              <div className="mt-6 flex flex-col gap-4 text-[1.0625rem] leading-relaxed text-ink/65">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          ) : null}

          {about.highlights.length > 0 ? (
            <Stagger as="ul" className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {about.highlights.map((highlight) => {
                const Icon = getOptionalIcon(highlight.icon);
                return (
                  <StaggerItem as="li" key={highlight.title} className="flex gap-4">
                    {Icon ? (
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-800">
                        <Icon className="size-[1.15rem]" aria-hidden="true" />
                      </span>
                    ) : null}
                    <span>
                      <span className="block font-display text-[1.0625rem] font-medium text-ink">
                        {highlight.title}
                      </span>
                      {highlight.description ? (
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink/60">
                          {highlight.description}
                        </span>
                      ) : null}
                    </span>
                  </StaggerItem>
                );
              })}
            </Stagger>
          ) : null}

          {about.signature ? (
            <Reveal delay={0.1}>
              <div className="mt-10 flex items-center gap-4 border-t border-ink/8 pt-8">
                <SmartImage
                  image={about.signature.image}
                  alt={about.signature.name}
                  ratio="aspect-square"
                  rounded="rounded-full"
                  sizes="56px"
                  fallbackInitials
                  className="w-14 shrink-0"
                />
                <div>
                  <p className="font-display text-[1.0625rem] font-medium text-ink">{about.signature.name}</p>
                  {about.signature.role ? (
                    <p className="mt-0.5 text-sm text-ink/55">{about.signature.role}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ) : null}

          {ctas.length > 0 ? (
            <Reveal delay={0.12}>
              <CtaGroup ctas={ctas} size="md" className="mt-9" />
            </Reveal>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
