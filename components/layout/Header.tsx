'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Menu, Phone, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useEscapeKey, useLockBodyScroll, useScrolled } from '@/hooks/useUi';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/lib/icons';
import { cn, telHref, type ResolvedCta } from '@/lib/utils';
import type { ClinicImage, Social } from '@/types/clinic';

import { Button, CtaButton } from '@/components/ui/Button';
import { Logo } from './Logo';

export type HeaderNavItem = { id: string; label: string };

type HeaderProps = {
  name: string;
  tagline?: string;
  logo?: ClinicImage;
  navItems: HeaderNavItem[];
  cta: ResolvedCta | null;
  phone?: string;
  topbar?: { message?: string; showPhone: boolean; showHours: boolean };
  hoursSummary?: string;
  address?: string;
  socials: Social[];
  sticky: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Sticky header that starts transparent over the hero and settles into a frosted
 * bar once the page scrolls. The active link is driven by an IntersectionObserver
 * scroll-spy, and the mobile panel is a proper modal: focus-trapped by the scroll
 * lock, dismissible with Escape, and marked `aria-modal`.
 */
export function Header({
  name,
  tagline,
  logo,
  navItems,
  cta,
  phone,
  topbar,
  hoursSummary,
  address,
  socials,
  sticky,
}: HeaderProps) {
  const scrolled = useScrolled(24);
  const [menuOpen, setMenuOpen] = useState(false);
  const ids = useMemo(() => navItems.map((item) => item.id), [navItems]);
  const activeId = useScrollSpy(ids);

  useLockBodyScroll(menuOpen);
  useEscapeKey(menuOpen, () => setMenuOpen(false));

  // Close the panel if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent) => event.matches && setMenuOpen(false);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const solid = scrolled || menuOpen;
  const showTopbar = topbar && (topbar.message || (topbar.showPhone && phone) || (topbar.showHours && hoursSummary));

  return (
    <header
      className={cn(
        'top-0 z-50 w-full',
        sticky ? 'sticky' : 'relative',
        'transition-[background-color,box-shadow,border-color] duration-500 ease-out',
        solid
          ? 'border-b border-ink/8 bg-surface/85 shadow-[0_1px_24px_-12px_rgb(16_27_26/0.25)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      {showTopbar ? (
        <div
          className={cn(
            'hidden overflow-hidden bg-ink text-white/70 transition-[height,opacity] duration-500 lg:block',
            scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100',
          )}
        >
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-6 px-8 text-[0.75rem] lg:px-12">
            <p className="truncate">{topbar?.message}</p>
            <div className="flex shrink-0 items-center gap-6">
              {topbar?.showHours && hoursSummary ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {hoursSummary}
                </span>
              ) : null}
              {topbar?.showPhone && phone ? (
                <a
                  href={telHref(phone)}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="size-3.5" aria-hidden="true" />
                  {phone}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-[height] duration-500 sm:px-8 lg:px-12',
          scrolled ? 'h-16 sm:h-18' : 'h-18 sm:h-20',
        )}
      >
        <Logo name={name} tagline={tagline} logo={logo} showTagline={!scrolled} />

        {navItems.length > 0 ? (
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'relative inline-flex items-center rounded-btn px-3.5 py-2 text-[0.875rem] transition-colors duration-300',
                        active ? 'text-primary-900' : 'text-ink/65 hover:text-ink',
                      )}
                    >
                      {item.label}
                      {active ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-3 -bottom-0.5 h-px bg-primary-700"
                          transition={{ duration: 0.4, ease: EASE }}
                        />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        <div className="flex items-center gap-2 sm:gap-3">
          {phone ? (
            <a
              href={telHref(phone)}
              className="hidden items-center gap-2 rounded-btn px-3 py-2 text-sm text-ink/70 transition-colors hover:text-primary-800 xl:inline-flex"
            >
              <Phone className="size-4" aria-hidden="true" />
              <span className="font-medium">{phone}</span>
            </a>
          ) : null}

          <CtaButton cta={cta} size="sm" className="hidden sm:inline-flex" />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="grid size-11 place-items-center rounded-btn border border-ink/10 text-ink transition-colors hover:border-primary-700/35 hover:text-primary-800 lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-ink/8 bg-surface shadow-[var(--shadow-float)] lg:hidden"
          >
            <div className="px-5 py-7 sm:px-8">
              {navItems.length > 0 ? (
                <nav aria-label="Mobile">
                  <ul className="flex flex-col">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + index * 0.045, duration: 0.35, ease: EASE }}
                        className="border-b border-ink/6 last:border-0"
                      >
                        <a
                          href={`#${item.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between py-4 font-display text-xl text-ink transition-colors hover:text-primary-800"
                        >
                          {item.label}
                          <span aria-hidden="true" className="text-sm text-ink/25 tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
              ) : null}

              <div className="mt-7 flex flex-col gap-3">
                {cta ? (
                  <Button href={cta.href} variant="primary" size="lg" icon={cta.icon} external={cta.external} fullWidth>
                    {cta.label}
                  </Button>
                ) : null}
                {phone ? (
                  <Button href={telHref(phone)} variant="outline" size="lg" icon="Phone" iconPosition="left" fullWidth>
                    {phone}
                  </Button>
                ) : null}
              </div>

              {address ? <p className="mt-6 text-sm leading-relaxed text-ink/55">{address}</p> : null}

              {socials.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {socials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform];
                    return (
                      <li key={social.url}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label ?? SOCIAL_LABELS[social.platform] ?? social.platform}
                          className="grid size-10 place-items-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:border-primary-700/35 hover:text-primary-800"
                        >
                          {Icon ? <Icon className="size-4" /> : null}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
