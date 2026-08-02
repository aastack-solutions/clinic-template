import { getOptionalIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { Counter } from '@/components/ui/Counter';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';

import type { SectionProps } from './types';

/** Social proof in numbers. Figures count up once, the first time they appear. */
export function Stats({ clinic, tone }: SectionProps) {
  const stats = clinic.stats;
  if (!stats || stats.items.length === 0) return null;

  const hasHeading = Boolean(stats.eyebrow || stats.title || stats.description);

  return (
    <Section
      id="results"
      tone={tone}
      spacing="sm"
      ariaLabel={hasHeading ? undefined : stats.navLabel ?? 'Clinic at a glance'}
    >
      {hasHeading ? (
        <SectionHeading
          id="results"
          eyebrow={stats.eyebrow}
          title={stats.title}
          description={stats.description}
          className="mb-14"
        />
      ) : null}

      <Stagger
        as="ul"
        className={cn(
          'grid gap-x-6 gap-y-10 sm:gap-x-10 lg:divide-x lg:divide-ink/8',
          // Real clinics rarely have exactly four figures. The column count
          // follows the data so three stats never leave a hole in the grid.
          stats.items.length === 1 && 'grid-cols-1',
          stats.items.length === 2 && 'grid-cols-2',
          stats.items.length === 3 && 'grid-cols-2 lg:grid-cols-3',
          stats.items.length >= 4 && 'grid-cols-2 lg:grid-cols-4',
        )}
      >
        {stats.items.map((item, index) => {
          const Icon = getOptionalIcon(item.icon);
          return (
            <StaggerItem
              as="li"
              key={item.label}
              className="flex flex-col items-start gap-2 lg:items-center lg:px-6 lg:text-center"
            >
              {Icon ? (
                <span className="mb-2 grid size-11 place-items-center rounded-full bg-primary-50 text-primary-800">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              ) : null}

              <p className="font-display text-[clamp(2.1rem,1.4rem+2.2vw,3.25rem)] leading-none font-medium text-ink">
                <Counter
                  value={item.value}
                  prefix={item.prefix}
                  suffix={item.suffix}
                  decimals={item.decimals}
                  delay={index * 0.08}
                />
              </p>

              <p className="text-sm leading-snug text-ink/60">{item.label}</p>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
