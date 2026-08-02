'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { cn } from '@/lib/utils';

export type AccordionItem = {
  question: string;
  answer: string;
};

/**
 * Disclosure list built on real `<button aria-expanded>` semantics with
 * `aria-controls` wiring, so it is fully operable by keyboard and announced
 * correctly by screen readers. Height animates via Framer Motion's `auto`
 * support rather than a fixed max-height hack, so long answers never clip.
 */
export function Accordion({
  items,
  className,
  defaultOpen = 0,
  /** Allow several panels open at once. */
  multiple = false,
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpen?: number | null;
  multiple?: boolean;
}) {
  const baseId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState<number[]>(defaultOpen === null ? [] : [defaultOpen]);

  const toggle = (index: number) => {
    setOpen((current) => {
      const isOpen = current.includes(index);
      if (multiple) return isOpen ? current.filter((item) => item !== index) : [...current, index];
      return isOpen ? [] : [index];
    });
  };

  return (
    <div className={cn('divide-y divide-ink/8 border-y border-ink/8', className)}>
      {items.map((item, index) => {
        const isOpen = open.includes(index);
        const buttonId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className={cn(
                  'group flex w-full items-start justify-between gap-6 py-6 text-left',
                  'transition-colors duration-300 hover:text-primary-800',
                  isOpen ? 'text-primary-900' : 'text-ink',
                )}
              >
                <span className="font-display text-[1.0625rem] leading-snug font-medium sm:text-lg">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-400',
                    isOpen
                      ? 'rotate-45 border-primary-700 bg-primary-700 text-on-primary'
                      : 'border-ink/12 text-ink/50 group-hover:border-primary-700/40 group-hover:text-primary-700',
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[62ch] pr-12 pb-7 text-[0.9375rem] leading-relaxed text-ink/65">
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
