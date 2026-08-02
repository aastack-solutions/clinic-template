'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, MessageCircle, Phone } from 'lucide-react';

import { useScrolled } from '@/hooks/useUi';
import { cn } from '@/lib/utils';

type FloatingActionsProps = {
  whatsappHref?: string;
  phoneHref?: string;
  whatsappLabel?: string;
};

/**
 * Persistent conversion shortcuts. On mobile — where a tap-to-call is the most
 * likely action — the call and WhatsApp buttons sit within thumb reach; on
 * desktop only the back-to-top control remains so the layout stays uncluttered.
 */
export function FloatingActions({ whatsappHref, phoneHref, whatsappLabel }: FloatingActionsProps) {
  const scrolled = useScrolled(600);

  if (!whatsappHref && !phoneHref) {
    return <BackToTop visible={scrolled} />;
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <AnimatePresence>
            {scrolled ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
              >
                <ScrollTopButton />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {phoneHref ? (
            <a
              href={phoneHref}
              aria-label="Call the clinic"
              className={cn(
                'grid size-13 place-items-center rounded-full bg-primary-800 text-on-primary shadow-[var(--shadow-float)]',
                'transition-transform duration-300 hover:scale-105 active:scale-95 sm:hidden',
              )}
            >
              <Phone className="size-5" aria-hidden="true" />
            </a>
          ) : null}

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={whatsappLabel ?? 'Chat with us on WhatsApp'}
              className={cn(
                'group grid size-13 place-items-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-float)]',
                'transition-transform duration-300 hover:scale-105 active:scale-95',
              )}
            >
              <MessageCircle className="size-6" aria-hidden="true" />
              <span className="sr-only">{whatsappLabel ?? 'Chat on WhatsApp'}</span>
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}

function BackToTop({ visible }: { visible: boolean }) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {visible ? (
          <motion.div
            className="pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            <ScrollTopButton />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ScrollTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="grid size-11 place-items-center rounded-full border border-ink/10 bg-surface/90 text-ink/70 shadow-[var(--shadow-lift)] backdrop-blur transition-colors hover:border-primary-700/35 hover:text-primary-800"
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </button>
  );
}
