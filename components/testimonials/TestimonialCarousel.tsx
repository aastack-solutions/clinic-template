'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useMediaQuery } from '@/hooks/useUi';
import { chunk, cn } from '@/lib/utils';
import type { Testimonial } from '@/types/clinic';

import { Rating } from '@/components/ui/Rating';
import { SmartImage } from '@/components/ui/SmartImage';

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 7000;

/**
 * Review carousel showing one card on mobile and two on desktop.
 *
 * Autoplay pauses on hover, on focus, and whenever the tab is hidden, and stops
 * permanently after any manual interaction — an auto-advancing region that
 * ignores the reader is a well-known accessibility failure. Slides are wired up
 * as a labelled `aria-roledescription="carousel"` region with live-region updates.
 */
export function TestimonialCarousel({ items, ratingSuffix }: { items: Testimonial[]; ratingSuffix?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const perView = isDesktop ? 2 : 1;

  const slides = chunk(items, perView);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);

  // Clamp when the viewport changes the number of slides underneath us.
  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  const go = useCallback(
    (delta: number, manual = true) => {
      if (slides.length < 2) return;
      if (manual) setInteracted(true);
      setDirection(delta);
      setIndex((current) => (current + delta + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || interacted || prefersReducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) go(1, false);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, interacted, prefersReducedMotion, slides.length, go]);

  if (slides.length === 0) return null;

  const current = slides[index] ?? slides[0];

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Patient reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(1);
        if (event.key === 'ArrowLeft') go(-1);
      }}
    >
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.ul
            key={index}
            custom={direction}
            initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.5, ease: EASE }}
            aria-live="polite"
            aria-atomic="false"
            className="grid gap-6 lg:grid-cols-2"
          >
            {current.map((testimonial) => (
              <li key={testimonial.id} className="h-full">
                <TestimonialCard testimonial={testimonial} ratingSuffix={ratingSuffix} />
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>

      {slides.length > 1 ? (
        <div className="mt-9 flex items-center justify-between gap-6">
          <ul className="flex items-center gap-2">
            {slides.map((_, slideIndex) => {
              const selected = slideIndex === index;
              return (
                <li key={slideIndex}>
                  <button
                    type="button"
                    onClick={() => {
                      setInteracted(true);
                      setDirection(slideIndex > index ? 1 : -1);
                      setIndex(slideIndex);
                    }}
                    aria-label={`Go to review group ${slideIndex + 1} of ${slides.length}`}
                    aria-current={selected}
                    className={cn(
                      'h-1.5 rounded-pill transition-all duration-400',
                      selected ? 'w-8 bg-primary-700' : 'w-1.5 bg-ink/15 hover:bg-ink/30',
                    )}
                  />
                </li>
              );
            })}
          </ul>

          <div className="flex gap-2.5">
            <CarouselButton label="Previous reviews" onClick={() => go(-1)} icon="prev" />
            <CarouselButton label="Next reviews" onClick={() => go(1)} icon="next" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TestimonialCard({ testimonial, ratingSuffix }: { testimonial: Testimonial; ratingSuffix?: string }) {
  return (
    <figure className="flex h-full flex-col rounded-panel border border-ink/8 bg-surface p-8 shadow-[var(--shadow-soft)] sm:p-10">
      <Quote className="size-8 shrink-0 text-primary-200" aria-hidden="true" />

      <blockquote className="mt-6 flex-1">
        <p className="font-display text-[1.0625rem] leading-relaxed text-ink/80 sm:text-lg">
          “{testimonial.quote}”
        </p>
      </blockquote>

      <figcaption className="mt-8 flex items-center gap-4 border-t border-ink/8 pt-6">
        <SmartImage
          image={testimonial.image}
          alt={testimonial.name}
          ratio="aspect-square"
          rounded="rounded-full"
          sizes="52px"
          fallbackInitials
          className="w-13 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{testimonial.name}</p>
          <p className="mt-0.5 truncate text-sm text-ink/50">
            {[testimonial.treatment, testimonial.location].filter(Boolean).join(' · ')}
          </p>
        </div>

        {testimonial.rating ? (
          <Rating
            value={testimonial.rating}
            label={`Rated ${testimonial.rating} out of 5${ratingSuffix ? ` on ${ratingSuffix}` : ''}`}
          />
        ) : null}
      </figcaption>
    </figure>
  );
}

function CarouselButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: 'prev' | 'next';
}) {
  const Icon = icon === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full border border-ink/12 text-ink/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-700/35 hover:text-primary-800"
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}
