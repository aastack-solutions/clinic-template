import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
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
 * otherwise the clinic name is set as a plain typographic wordmark, so a site
 * looks finished before any artwork exists without inventing a fake monogram.
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
    <span className="flex min-w-0 flex-col leading-none">
      <span
        className={cn(
          'truncate font-display text-[1.1875rem] leading-tight font-medium tracking-[-0.02em] sm:text-xl',
          dark ? 'text-white' : 'text-ink',
        )}
      >
        {name}
      </span>
      {showTagline && tagline ? (
        <span
          className={cn(
            'mt-1.5 hidden truncate text-[0.625rem] font-medium tracking-[0.2em] uppercase sm:block',
            dark ? 'text-white/45' : 'text-ink/40',
          )}
        >
          {tagline}
        </span>
      ) : null}
    </span>
  );

  if (!asLink) return <span className={cn('inline-flex', className)}>{content}</span>;

  return (
    <Link
      href="/"
      aria-label={`${name} home page`}
      className={cn('inline-flex rounded-btn transition-opacity duration-300 hover:opacity-85', className)}
    >
      {content}
    </Link>
  );
}
