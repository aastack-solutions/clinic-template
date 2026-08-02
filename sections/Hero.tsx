import { getOptionalIcon } from '@/lib/icons';
import { cn, resolveCtas } from '@/lib/utils';

import { CtaGroup } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * The hero carries the entire first impression, so it is the one section with a
 * bespoke composition: a typographic left column against a layered image stack
 * with a floating credibility card. It collapses to a single readable column on
 * mobile without losing the accent imagery.
 */
export function Hero({ clinic }: SectionProps) {
  const hero = clinic.hero;
  if (!hero) return null;

  const ctas = resolveCtas(hero.ctas, clinic);
  const FloatingIcon = getOptionalIcon(hero.floatingCard?.icon);

  return (
    <Section
      id="home"
      spacing="none"
      className="grain isolate overflow-hidden pt-12 pb-18 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32"
      containerSize="wide"
    >
      {/* Ambient brand light — two soft washes rather than a flat colour block. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-[38rem] rounded-full bg-primary-100/70 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 size-[34rem] rounded-full bg-accent-100/60 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-surface" />
      </div>

      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 xl:gap-24">
        <div className="max-w-2xl">
          {hero.badge ? (
            <Reveal direction="none">
              <p className="inline-flex items-center gap-2.5 rounded-pill border border-primary-700/15 bg-surface/70 py-2 pr-4 pl-2.5 text-[0.75rem] font-medium text-primary-900 shadow-[var(--shadow-soft)] backdrop-blur-sm">
                <span className="grid size-5 place-items-center rounded-full bg-primary-700 text-[0.625rem] text-on-primary">
                  <span className="size-1.5 rounded-full bg-current" />
                </span>
                {hero.badge}
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={0.06}>
            <h1
              id="home-title"
              className="mt-6 font-display text-[clamp(2.4rem,1.4rem+4.2vw,4.5rem)] leading-[1.03] font-medium tracking-[-0.03em] text-ink"
            >
              {hero.headline}
              {hero.headlineAccent ? (
                <>
                  {' '}
                  <span className="text-gradient italic">{hero.headlineAccent}</span>
                </>
              ) : null}
            </h1>
          </Reveal>

          {hero.subheadline ? (
            <Reveal delay={0.14}>
              <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ink/65 sm:text-lg">
                {hero.subheadline}
              </p>
            </Reveal>
          ) : null}

          {ctas.length > 0 ? (
            <Reveal delay={0.22}>
              <CtaGroup ctas={ctas} size="lg" className="mt-9" />
            </Reveal>
          ) : null}

          {(hero.highlights.length > 0 || hero.rating) && (
            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-col gap-5 border-t border-ink/8 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
                {hero.rating ? (
                  <div className="flex items-center gap-3">
                    <Rating
                      value={hero.rating.score}
                      label={`Rated ${hero.rating.score} out of 5${
                        hero.rating.count ? ` from ${hero.rating.count} reviews` : ''
                      }`}
                    />
                    <p className="text-sm text-ink/60">
                      <span className="font-semibold text-ink">{hero.rating.score.toFixed(1)}</span>
                      {hero.rating.count ? ` · ${hero.rating.count.toLocaleString()} reviews` : ''}
                      {hero.rating.source ? ` on ${hero.rating.source}` : ''}
                    </p>
                  </div>
                ) : null}

                {hero.highlights.length > 0 ? (
                  <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {hero.highlights.map((highlight) => {
                      const Icon = getOptionalIcon(highlight.icon);
                      return (
                        <li key={highlight.label} className="flex items-center gap-2 text-sm text-ink/70">
                          {Icon ? <Icon className="size-4 text-primary-700" aria-hidden="true" /> : null}
                          {highlight.label}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          )}
        </div>

        {hero.image || hero.secondaryImage ? (
          <Reveal direction="left" delay={0.1} className="relative">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <SmartImage
                image={hero.image}
                alt={`${clinic.clinic.name} treatment room`}
                ratio="aspect-4/5 sm:aspect-[5/6] lg:aspect-4/5"
                rounded="rounded-panel"
                priority
                sizes="(max-width: 1024px) 90vw, 46vw"
                fallbackIcon="Stethoscope"
                className="shadow-[var(--shadow-float)]"
              />

              {hero.secondaryImage ? (
                <SmartImage
                  image={hero.secondaryImage}
                  alt={`${clinic.clinic.name} interior`}
                  ratio="aspect-square"
                  rounded="rounded-card"
                  sizes="200px"
                  fallbackIcon="Sparkles"
                  className="absolute -bottom-8 -left-6 hidden w-36 ring-8 ring-surface sm:block lg:-left-12 lg:w-44"
                />
              ) : null}

              {hero.floatingCard ? (
                <Stagger className="absolute -right-3 bottom-10 sm:-right-6 lg:-right-10">
                  <StaggerItem>
                    <div className="flex items-center gap-3.5 rounded-card border border-ink/6 bg-surface/92 px-4 py-3.5 shadow-[var(--shadow-lift)] backdrop-blur-md sm:px-5">
                      {FloatingIcon ? (
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-800">
                          <FloatingIcon className="size-5" aria-hidden="true" />
                        </span>
                      ) : null}
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">{hero.floatingCard.title}</span>
                        {hero.floatingCard.subtitle ? (
                          <span className="mt-0.5 block text-xs text-ink/55">{hero.floatingCard.subtitle}</span>
                        ) : null}
                      </span>
                    </div>
                  </StaggerItem>
                </Stagger>
              ) : null}

              <div
                aria-hidden="true"
                className={cn(
                  'absolute -top-6 -right-6 -z-10 hidden size-32 rounded-panel border border-accent-300/40 lg:block',
                )}
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
