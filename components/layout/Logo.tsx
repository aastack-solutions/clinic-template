import Image from 'next/image';
import Link from 'next/link';

import { cn, initials } from '@/lib/utils';
import type { ClinicImage } from '@/types/clinic';

type LogoProps = {
  name: string;
  tagline?: string;
  logo?: ClinicImage;
  tone?: 'light' | 'dark';
  className?: string;
  /** Renders a plain element instead of a link (for the footer / open menu). */
  asLink?: boolean;
  showTagline?: boolean;
};

/**
 * Brand lockup. When the clinic supplies a logo image it is used verbatim;
 * otherwise a typographic monogram + wordmark is generated from the clinic name,
 * so a site still looks finished before any artwork exists.
 */
export function Logo({
  name,
  tagline,
  logo,
  tone = 'light',
  className,
  asLink = true,
  showTagline = true,
}: LogoProps) {
  const dark = tone === 'dark';

  const content = logo?.src ? (
    <span className="relative block h-9 w-[clamp(7rem,16vw,11rem)] sm:h-10">
      <Image
        src={logo.src}
        alt={logo.alt ?? name}
        fill
        sizes="200px"
        priority
        className="object-contain object-left"
      />
    </span>
  ) : (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-[0.7rem] font-display text-sm font-semibold sm:size-11',
          dark
            ? 'bg-white/10 text-white ring-1 ring-white/20'
            : 'bg-linear-to-br from-primary-700 to-primary-900 text-on-primary shadow-[var(--shadow-soft)]',
        )}
      >
        {initials(name)}
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            'truncate font-display text-[1.0625rem] leading-tight font-medium tracking-[-0.015em] sm:text-lg',
            dark ? 'text-white' : 'text-ink',
          )}
        >
          {name}
        </span>
        {showTagline && tagline ? (
          <span
            className={cn(
              'mt-1 hidden truncate text-[0.6875rem] tracking-[0.14em] uppercase sm:block',
              dark ? 'text-white/50' : 'text-ink/45',
            )}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!asLink) return <span className={cn('inline-flex', className)}>{content}</span>;

  return (
    <Link
      href="/"
      aria-label={`${name} — home`}
      className={cn('inline-flex rounded-btn transition-opacity duration-300 hover:opacity-85', className)}
    >
      {content}
    </Link>
  );
}
