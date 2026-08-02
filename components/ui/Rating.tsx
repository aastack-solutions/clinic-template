import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

type RatingProps = {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
  tone?: 'light' | 'dark';
  /** Accessible sentence; falls back to "4.9 out of 5". */
  label?: string;
};

/**
 * Star rating with true partial fills (a clipped overlay rather than rounding
 * to the nearest half), exposed to assistive tech as a single readable string.
 */
export function Rating({ value, max = 5, size = 'sm', className, tone = 'light', label }: RatingProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const starSize = size === 'sm' ? 'size-3.5' : 'size-[1.125rem]';

  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      role="img"
      aria-label={label ?? `${clamped} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.max(0, Math.min(1, clamped - index));
        return (
          <span key={index} className={cn('relative inline-block', starSize)} aria-hidden="true">
            <Star className={cn(starSize, 'absolute inset-0', tone === 'dark' ? 'text-white/25' : 'text-ink/15')} />
            {fill > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                {/* accent-800 rather than the raw brand gold: it clears the 3:1
                    non-text contrast threshold on a light surface. */}
                <Star className={cn(starSize, 'fill-accent-800 text-accent-800')} />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
