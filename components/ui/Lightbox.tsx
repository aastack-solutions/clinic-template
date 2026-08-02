'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

import { useEscapeKey, useLockBodyScroll } from '@/hooks/useUi';
import { cn } from '@/lib/utils';
import type { ClinicImage } from '@/types/clinic';

export type LightboxItem = {
  id: string;
  image: ClinicImage;
  caption?: string;
};

type LightboxProps = {
  items: LightboxItem[];
  /** `null` closes the dialog. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

/**
 * Accessible image viewer: modal semantics, Escape to dismiss, arrow-key
 * navigation, focus moved into the dialog on open and returned to the trigger
 * on close, and a scroll lock that compensates for the scrollbar width.
 */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const isOpen = index !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useLockBodyScroll(isOpen);
  useEscapeKey(isOpen, onClose);

  const go = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onNavigate((index + delta + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [isOpen, go]);

  const current = index !== null ? items[index] : undefined;

  return (
    <AnimatePresence>
      {isOpen && current ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? 'Image viewer'}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-100 flex flex-col bg-ink/94 backdrop-blur-md focus:outline-none"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <p className="text-sm text-white/60 tabular-nums">
              {(index ?? 0) + 1} / {items.length}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close image viewer"
              className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-16">
            <NavButton
              direction="prev"
              onClick={() => go(-1)}
              hidden={items.length < 2}
              className="left-2 sm:left-5"
            />

            <AnimatePresence mode="wait">
              <motion.figure
                key={current.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full max-h-full w-full max-w-5xl flex-col items-center justify-center gap-4"
              >
                <div className="relative h-full max-h-[72vh] w-full">
                  <Image
                    src={current.image.src}
                    alt={current.image.alt ?? current.caption ?? 'Clinic photograph'}
                    fill
                    sizes="(max-width: 768px) 100vw, 1024px"
                    className="rounded-card object-contain"
                    priority
                  />
                </div>
                {current.caption ? (
                  <figcaption className="max-w-2xl text-center text-sm text-white/70">
                    {current.caption}
                  </figcaption>
                ) : null}
              </motion.figure>
            </AnimatePresence>

            <NavButton
              direction="next"
              onClick={() => go(1)}
              hidden={items.length < 2}
              className="right-2 sm:right-5"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function NavButton({
  direction,
  onClick,
  hidden,
  className,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  hidden?: boolean;
  className?: string;
}) {
  if (hidden) return null;
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous image' : 'Next image'}
      className={cn(
        'absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full',
        'border border-white/15 bg-ink/40 text-white/80 backdrop-blur-sm transition',
        'hover:border-white/40 hover:bg-white/10 hover:text-white sm:size-12',
        className,
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
