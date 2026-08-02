import { resolveCtas } from '@/lib/utils';

import { Accordion } from '@/components/ui/Accordion';
import { CtaGroup } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';

import type { SectionProps } from './types';

/**
 * Questions sit in a sticky left column on desktop so the heading stays with the
 * reader as they work down a long list — and the answers get the full column
 * width they need to stay comfortably readable.
 */
export function Faqs({ clinic, tone }: SectionProps) {
  const faqs = clinic.faqs;
  if (!faqs || faqs.items.length === 0) return null;

  const ctas = resolveCtas(faqs.ctas, clinic);

  return (
    <Section id="faqs" tone={tone} ariaLabel={faqs.title ? undefined : faqs.navLabel ?? 'Frequently asked questions'}>
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          {faqs.eyebrow ? <Eyebrow>{faqs.eyebrow}</Eyebrow> : null}

          {faqs.title ? (
            <Reveal>
              <h2
                id="faqs-title"
                className="mt-5 font-display text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] leading-[1.08] font-medium text-ink"
              >
                {faqs.title}
              </h2>
            </Reveal>
          ) : null}

          {faqs.description ? (
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink/65">{faqs.description}</p>
            </Reveal>
          ) : null}

          {ctas.length > 0 ? (
            <Reveal delay={0.12}>
              <CtaGroup ctas={ctas} size="md" className="mt-8" />
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={0.06}>
          <Accordion items={faqs.items} />
        </Reveal>
      </div>
    </Section>
  );
}
