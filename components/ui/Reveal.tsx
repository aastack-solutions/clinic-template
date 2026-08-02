'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
};

/** A single easing curve across the whole site keeps motion feeling like one hand. */
const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  /** Adds a subtle scale-in on top of the translation. */
  scale?: boolean;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
  once?: boolean;
};

/**
 * Scroll-triggered entrance. Animates transform + opacity only — both are
 * compositor properties, so a page full of these still scrolls at 60fps — and
 * collapses to a no-op when the visitor prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  direction = 'up',
  scale = false,
  amount = 0.2,
  once = true,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = OFFSET[direction];

  if (prefersReducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: scale ? 0.96 : 1 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount, margin: '0px 0px -10% 0px' }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  as?: 'div' | 'ul' | 'ol';
};

/**
 * Parent for a list of `<StaggerItem>`s. Children inherit the animation state
 * from this element, so the whole group is driven by one viewport observer
 * instead of one per card.
 */
export function Stagger({ children, className, stagger = 0.09, amount = 0.15, as = 'div' }: StaggerProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = as === 'ul' ? motion.ul : as === 'ol' ? motion.ol : motion.div;

  if (prefersReducedMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      custom={stagger}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: '0px 0px -8% 0px' }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li';
}) {
  const prefersReducedMotion = useReducedMotion();
  const Component = as === 'li' ? motion.li : motion.div;

  if (prefersReducedMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  );
}

/** Shared hover treatment for cards: a small lift with a softer, deeper shadow. */
export const hoverLift = cn(
  'transition-[transform,box-shadow,border-color] duration-500 ease-out',
  'hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]',
);

export { EASE };
