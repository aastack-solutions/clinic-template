import { ArrowUpRight } from 'lucide-react';

import { TestimonialCarousel } from '@/components/testimonials/TestimonialCarousel';
import { Rating } from '@/components/ui/Rating';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';

import type { SectionProps } from './types';

/** Patient voices, with the aggregate score surfaced beside the heading. */
export function Testimonials({ clinic, tone }: SectionProps) {
  const testimonials = clinic.testimonials;
  if (!testimonials || testimonials.items.length === 0) return null;

  const summary = testimonials.summary;

  return (
    <Section
      id="testimonials"
      tone={tone}
      ariaLabel={testimonials.title ? undefined : testimonials.navLabel ?? 'Patient reviews'}
    >
      <SectionHeading
        id="testimonials"
        eyebrow={testimonials.eyebrow}
        title={testimonials.title}
        description={testimonials.description}
        align="left"
        className="mb-12 lg:mb-16"
        aside={
          summary ? (
            <div className="flex items-center gap-5 rounded-card border border-ink/8 bg-surface px-6 py-5 shadow-[var(--shadow-soft)]">
              <p className="font-display text-4xl leading-none font-medium text-ink">
                {summary.averageRating.toFixed(1)}
              </p>
              <div>
                <Rating
                  value={summary.averageRating}
                  size="md"
                  label={`Average rating ${summary.averageRating} out of 5`}
                />
                <p className="mt-1.5 text-sm text-ink/55">
                  {summary.totalReviews ? `${summary.totalReviews.toLocaleString()} reviews` : 'Verified reviews'}
                  {summary.source ? ` on ${summary.source}` : ''}
                </p>
                {summary.url ? (
                  <a
                    href={summary.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-primary-950"
                  >
                    Read all reviews
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : undefined
        }
      />

      <Reveal>
        <TestimonialCarousel items={testimonials.items} ratingSuffix={summary?.source} />
      </Reveal>
    </Section>
  );
}
