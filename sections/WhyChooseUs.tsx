import { getIcon } from '@/lib/icons';
import { cn, resolveCtas } from '@/lib/utils';

import { CtaGroup } from '@/components/ui/Button';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * Differentiators, presented on a dark panel so the section reads as a deliberate
 * pause in the page rhythm. With an image it splits two-up; without one the
 * reasons expand into a three-column grid.
 */
export function WhyChooseUs({ clinic }: SectionProps) {
  const why = clinic.whyChooseUs;
  if (!why || why.items.length === 0) return null;

  const ctas = resolveCtas(why.ctas, clinic);
  const hasImage = Boolean(why.image?.src);

  return (
    <Section
      id="why-us"
      tone="ink"
      className="grain isolate overflow-hidden"
      ariaLabel={why.title ? undefined : why.navLabel ?? 'Why choose us'}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 -z-10 size-[34rem] rounded-full bg-primary-700/25 blur-[140px]"
      />

      <div className={cn('grid gap-14', hasImage && 'lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20')}>
        <div className={cn(!hasImage && 'mx-auto max-w-2xl text-center')}>
          {why.eyebrow ? <Eyebrow tone="dark">{why.eyebrow}</Eyebrow> : null}

          {why.title ? (
            <Reveal>
              <h2
                id="why-us-title"
                className="mt-5 font-display text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] leading-[1.08] font-medium text-white"
              >
                {why.title}
              </h2>
            </Reveal>
          ) : null}

          {why.description ? (
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/60">{why.description}</p>
            </Reveal>
          ) : null}

          {hasImage ? (
            <Reveal delay={0.14}>
              <SmartImage
                image={why.image}
                alt={`${clinic.clinic.name} environment`}
                ratio="aspect-[5/4]"
                rounded="rounded-panel"
                sizes="(max-width: 1024px) 92vw, 42vw"
                fallbackIcon="Sparkles"
                className="mt-10 shadow-[var(--shadow-float)]"
              />
            </Reveal>
          ) : null}

          {ctas.length > 0 && !hasImage ? (
            <CtaGroup ctas={ctas} size="md" className="mt-9 justify-center" />
          ) : null}
        </div>

        <div>
          <Stagger as="ul" className={cn('grid gap-x-10 gap-y-9', hasImage ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3')}>
            {why.items.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <StaggerItem as="li" key={item.title} className="group relative">
                  <div className="flex items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/5 text-accent-500 transition-colors duration-500 group-hover:border-accent-500/40 group-hover:bg-accent-500/10">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-sm text-white/25 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg leading-snug font-medium text-white">{item.title}</h3>

                  {item.description ? (
                    <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-white/55">{item.description}</p>
                  ) : null}
                </StaggerItem>
              );
            })}
          </Stagger>

          {ctas.length > 0 && hasImage ? <CtaGroup ctas={ctas} size="md" className="mt-12" /> : null}
        </div>
      </div>
    </Section>
  );
}
