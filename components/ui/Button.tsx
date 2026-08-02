import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { getOptionalIcon } from '@/lib/icons';
import { cn, type ResolvedCta } from '@/lib/utils';

type Variant = NonNullable<ResolvedCta['variant']>;
type Size = 'sm' | 'md' | 'lg';

const BASE = cn(
  'group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap',
  'font-medium tracking-[-0.01em] rounded-btn',
  'transition-[background-color,color,box-shadow,transform,border-color] duration-300 ease-out',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
);

const VARIANTS: Record<Variant, string> = {
  primary: cn(
    'bg-primary-700 text-on-primary shadow-[var(--shadow-soft)]',
    'hover:bg-primary-800 hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5',
  ),
  secondary: cn(
    'bg-ink text-white shadow-[var(--shadow-soft)]',
    'hover:bg-primary-900 hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5',
  ),
  outline: cn(
    'border border-ink/12 bg-surface/70 text-ink backdrop-blur-sm',
    'hover:border-primary-700/35 hover:bg-primary-50 hover:text-primary-900 hover:-translate-y-0.5',
  ),
  ghost: cn('text-primary-800 hover:text-primary-950 hover:bg-primary-50/70'),
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-[0.8125rem]',
  md: 'h-12 px-6 text-[0.9375rem]',
  lg: 'h-14 px-8 text-base',
};

const ICON_SIZES: Record<Size, string> = {
  sm: 'size-4',
  md: 'size-[1.125rem]',
  lg: 'size-5',
};

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  icon?: string;
  /** Renders the icon after the label instead of before it. */
  iconPosition?: 'left' | 'right';
  external?: boolean;
  className?: string;
  fullWidth?: boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'>;

/**
 * The one button in the system. Renders a `next/link`, an `<a>` for external or
 * protocol URLs (`tel:`, `mailto:`, `https://`), or a real `<button>` — whichever
 * is semantically correct — so keyboard and screen-reader behaviour is always right.
 */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  external,
  className,
  fullWidth,
  ...buttonProps
}: ButtonProps) {
  const Icon = getOptionalIcon(icon);
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);

  const content = (
    <>
      {Icon && iconPosition === 'left' ? (
        <Icon className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />
      ) : null}
      <span>{children}</span>
      {Icon && iconPosition === 'right' ? (
        <Icon
          className={cn(ICON_SIZES[size], 'shrink-0 transition-transform duration-300 group-hover:translate-x-0.5')}
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (!href) {
    return (
      <button type="button" className={classes} {...buttonProps}>
        {content}
      </button>
    );
  }

  const isProtocolLink = /^(tel:|mailto:|sms:)/i.test(href);
  const isExternal = external ?? /^https?:\/\//i.test(href);

  if (isProtocolLink || isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal && !isProtocolLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

/** Renders a resolved CTA from `clinic.json`. Returns nothing when unresolvable. */
export function CtaButton({
  cta,
  size = 'md',
  className,
  fullWidth,
  variantOverride,
}: {
  cta: ResolvedCta | null | undefined;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
  variantOverride?: Variant;
}) {
  if (!cta) return null;
  return (
    <Button
      href={cta.href}
      variant={variantOverride ?? cta.variant}
      size={size}
      icon={cta.icon}
      external={cta.external}
      className={className}
      fullWidth={fullWidth}
    >
      {cta.label}
    </Button>
  );
}

/** Convenience for rendering a resolved CTA list with consistent spacing. */
export function CtaGroup({
  ctas,
  size = 'lg',
  className,
}: {
  ctas: ResolvedCta[];
  size?: Size;
  className?: string;
}) {
  if (ctas.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-3 sm:gap-4', className)}>
      {ctas.map((cta) => (
        <CtaButton key={`${cta.label}-${cta.href}`} cta={cta} size={size} />
      ))}
    </div>
  );
}
