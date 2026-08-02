'use client';

import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

type CounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
  className?: string;
};

/**
 * Count-up figure. The final value is rendered into the DOM for assistive tech
 * and crawlers via `aria-label`, while the animated digits are hidden from the
 * accessibility tree so screen readers don't announce a stream of numbers.
 */
export function Counter({ value, prefix, suffix, decimals = 0, delay = 0, className }: CounterProps) {
  const { ref, formatted } = useCountUp(value, { decimals, delay });
  const finalValue = `${prefix ?? ''}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix ?? ''}`;

  return (
    <span ref={ref} className={cn('tabular-nums', className)} aria-label={finalValue}>
      <span aria-hidden="true">
        {prefix}
        {formatted}
        {suffix}
      </span>
    </span>
  );
}
