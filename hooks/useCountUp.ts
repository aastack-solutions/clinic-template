'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

type Options = {
  duration?: number;
  decimals?: number;
  /** Delay before the count starts, in seconds. Used to stagger a stat row. */
  delay?: number;
};

/** Ease-out cubic — fast at the start, gentle landing. */
const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * Animates a number from 0 to `target` the first time it scrolls into view.
 * Driven by rAF rather than a state update per frame's worth of React work, and
 * it resolves instantly for visitors who prefer reduced motion.
 */
export function useCountUp(target: number, { duration = 1800, decimals = 0, delay = 0 }: Options = {}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const delayMs = delay * 1000;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start - delayMs;

      if (elapsed < 0) {
        frame = requestAnimationFrame(step);
        return;
      }

      const progress = Math.min(1, elapsed / duration);
      setValue(target * ease(progress));

      if (progress < 1) frame = requestAnimationFrame(step);
      else setValue(target);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration, delay, prefersReducedMotion]);

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return { ref, value, formatted };
}
