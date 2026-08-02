import { resolveCtas } from '@/lib/utils';

import { CtaGroup } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * The closing conversion moment. A full-bleed brand panel that interrupts the
 * page rhythm right before the practical details, so the booking decision is
 * offered at the point of highest intent.
 */
export function CtaBanner({ clinic }: SectionProps) {
  const banner = clinic.ctaBanner;
  if (!banner?.title) return null;

  const ctas = resolveCtas(banner.ctas, clinic);
  const hasImage = Boolean(banner.image?.src);

  return (
    <section
      id="book"
      aria-labelledby="book-title"
      className="relative scroll-mt-24 bg-surface py-14 sm:py-18 lg:py-22"
    >
      <Container size="wide">
        <div className="grain relative isolate overflow-hidden rounded-panel bg-primary-900 px-7 py-14 text-white sm:px-12 sm:py-18 lg:px-16 lg:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 -left-16 size-[26rem] rounded-full bg-primary-600/35 blur-[110px]" />
            <div className="absolute -right-20 -bottom-28 size-[24rem] rounded-full bg-accent-500/25 blur-[110px]" />
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="max-w-2xl">
              {banner.eyebrow ? <Eyebrow tone="dark">{banner.eyebrow}</Eyebrow> : null}

              <Reveal>
                <h2
                  id="book-title"
                  className="mt-5 font-display text-[clamp(1.9rem,1.2rem+2.8vw,3.4rem)] leading-[1.06] font-medium"
                >
                  {banner.title}
                </h2>
              </Reveal>

              {banner.description ? (
                <Reveal delay={0.08}>
                  <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/65">{banner.description}</p>
                </Reveal>
              ) : null}

              {ctas.length > 0 ? (
                <Reveal delay={0.14}>
                  <CtaGroup ctas={ctas} size="lg" className="mt-9" />
                </Reveal>
              ) : null}
            </div>

            {hasImage ? (
              <Reveal direction="left" delay={0.1} className="hidden lg:block">
                <SmartImage
                  image={banner.image}
                  alt={`${clinic.clinic.name} reception`}
                  ratio="aspect-[5/4]"
                  rounded="rounded-card"
                  sizes="40vw"
                  fallbackIcon="CalendarCheck"
                  className="shadow-[var(--shadow-float)]"
                />
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
