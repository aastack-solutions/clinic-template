'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Expand } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import type { Gallery } from '@/types/clinic';

import { Lightbox } from '@/components/ui/Lightbox';
import { SmartImage } from '@/components/ui/SmartImage';

type GalleryGridProps = {
  items: Gallery['items'];
  categories: Gallery['categories'];
  /** Used for alt-text fallbacks. */
  clinicName: string;
  allLabel?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Filterable mosaic with a lightbox. Filtering animates with FLIP layout
 * transitions so images glide to their new positions instead of snapping, and
 * every tile is a real button so the gallery is fully keyboard-operable.
 */
export function GalleryGrid({ items, categories, clinicName, allLabel = 'All' }: GalleryGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Only offer filters that actually match something in the data.
  const usableCategories = useMemo(
    () => categories.filter((category) => items.some((item) => item.category === category.id)),
    [categories, items],
  );

  const visible = useMemo(
    () => (active === 'all' ? items : items.filter((item) => item.category === active)),
    [active, items],
  );

  return (
    <>
      {usableCategories.length > 0 ? (
        <div className="mb-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Filter gallery"
            className="no-scrollbar edge-fade flex max-w-full gap-1.5 overflow-x-auto rounded-pill border border-ink/8 bg-surface p-1.5 shadow-[var(--shadow-soft)]"
          >
            {[{ id: 'all', label: allLabel }, ...usableCategories].map((category) => {
              const selected = active === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(category.id)}
                  className={cn(
                    'relative shrink-0 rounded-pill px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300',
                    selected ? 'text-on-primary' : 'text-ink/60 hover:text-ink',
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="gallery-pill"
                      className="absolute inset-0 -z-10 rounded-pill bg-primary-800"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  ) : null}
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <motion.ul layout={!prefersReducedMotion} className="grid auto-rows-[13rem] grid-cols-2 gap-4 sm:auto-rows-[15rem] lg:grid-cols-4 lg:gap-5">
        <AnimatePresence mode="popLayout">
          {visible.map((item, index) => (
            <motion.li
              key={item.id}
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.42, ease: EASE }}
              className={cn(
                item.size === 'tall' && 'row-span-2',
                item.size === 'wide' && 'col-span-2',
              )}
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group relative block size-full overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                <SmartImage
                  image={item.image}
                  alt={item.caption ?? `${clinicName} gallery image`}
                  rounded="rounded-card"
                  sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 24vw"
                  fallbackIcon="Camera"
                  zoomOnHover
                  className="size-full"
                />

                <span className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

                <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-surface/85 text-ink/70 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="size-4" aria-hidden="true" />
                </span>

                {item.caption ? (
                  <span className="absolute inset-x-4 bottom-4 translate-y-2 text-left text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {item.caption}
                  </span>
                ) : null}

                <span className="sr-only">Open image{item.caption ? `: ${item.caption}` : ''}</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <Lightbox
        items={visible.map((item) => ({ id: item.id, image: item.image, caption: item.caption }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
