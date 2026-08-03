import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Container } from './Container';
import { Reveal } from './Reveal';

type Tone = 'surface' | 'muted' | 'ink' | 'primary';

const TONES: Record<Tone, string> = {
  surface: 'bg-surface text-ink',
  muted: 'bg-muted text-ink',
  ink: 'bg-ink text-white',
  primary: 'bg-primary-950 text-white',
};

const SPACING = {
  none: '',
  sm: 'py-14 sm:py-16',
  md: 'py-18 sm:py-24 lg:py-28',
  lg: 'py-22 sm:py-28 lg:py-36',
} as const;

type SectionProps = {
  id: string;
  children: ReactNode;
  tone?: Tone;
  spacing?: keyof typeof SPACING;
  className?: string;
  containerClassName?: string;
  containerSize?: 'narrow' | 'default' | 'wide';
  /** Skip the container when a section needs to bleed to the viewport edge. */
  bleed?: boolean;
  /** Announced by screen readers as the name of the landmark. */
  ariaLabel?: string;
};

/**
 * The vertical rhythm of the page. Every section is a labelled landmark with a
 * consistent id (so navigation, scroll-spy and anchor CTAs all agree) and a
 * background tone assigned by the layout engine rather than by the section itself.
 */
export function Section({
  id,
  children,
  tone = 'surface',
  spacing = 'md',
  className,
  containerClassName,
  containerSize = 'default',
  bleed = false,
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabel ? undefined : `${id}-title`}
      aria-label={ariaLabel}
      className={cn('relative scroll-mt-24', TONES[tone], SPACING[spacing], className)}
    >
      {bleed ? (
        children
      ) : (
        <Container size={containerSize} className={containerClassName}>
          {children}
        </Container>
      )}
    </section>
  );
}

type SectionHeadingProps = {
  id: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
  /** Rendered to the right of the heading on desktop (usually a CTA). */
  aside?: ReactNode;
};

/**
 * Shared section header. The `<h2>` always carries `${id}-title` so the parent
 * `<section aria-labelledby>` resolves, keeping the landmark list meaningful.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  className,
  aside,
}: SectionHeadingProps) {
  if (!eyebrow && !title && !description) return null;

  const centered = align === 'center';
  const dark = tone === 'dark';

  return (
    <div
      className={cn(
        'flex flex-col gap-8',
        aside ? 'lg:flex-row lg:items-end lg:justify-between' : centered && 'items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && !aside && 'text-center')}>
        {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}

        {title ? (
          <Reveal>
            <h2
              id={`${id}-title`}
              className={cn(
                'mt-5 font-display text-[clamp(1.9rem,1.2rem+2.6vw,3.25rem)] leading-[1.08] font-medium',
                dark ? 'text-white' : 'text-ink',
              )}
            >
              {title}
            </h2>
          </Reveal>
        ) : null}

        {description ? (
          <Reveal delay={0.08}>
            <p
              className={cn(
                'mt-5 text-[1.0625rem] leading-relaxed',
                dark ? 'text-white/70' : 'text-ink/65',
              )}
            >
              {description}
            </p>
          </Reveal>
        ) : null}
      </div>

      {aside ? (
        <Reveal delay={0.12} className={cn(centered && 'self-center lg:self-end')}>
          {aside}
        </Reveal>
      ) : null}
    </div>
  );
}

/** Small uppercase label above a section title, the section "kicker". */
export function Eyebrow({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <Reveal direction="none">
      <p
        className={cn(
          'text-[0.6875rem] font-semibold uppercase tracking-[0.22em]',
          tone === 'dark' ? 'text-accent-500' : 'text-primary-700',
          className,
        )}
      >
        {children}
      </p>
    </Reveal>
  );
}
