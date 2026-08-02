import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/lib/icons';
import { cn, formatAddress, formatHours, hasItems, mailHref, resolveCta, telHref } from '@/lib/utils';
import type { Clinic } from '@/types/clinic';

import { Logo } from './Logo';

/**
 * Footer assembled entirely from the content file. Link columns, legal links,
 * hours, socials and the copyright line each disappear when their data is absent,
 * and the grid re-flows so the remaining columns stay balanced.
 */
export function Footer({ clinic }: { clinic: Clinic }) {
  const { footer, contact, social } = clinic;
  const address = formatAddress(contact.address);
  const year = new Date().getFullYear();
  const columns = footer.columns.filter((column) => hasItems(column.links));

  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 size-[32rem] rounded-full bg-primary-700/18 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-18 pb-10 sm:px-8 lg:px-12 lg:pt-22">
        <div
          className={cn(
            'grid gap-12 lg:gap-10',
            columns.length > 0 ? 'lg:grid-cols-[1.4fr_repeat(auto-fit,minmax(9rem,1fr))]' : 'lg:grid-cols-2',
          )}
        >
          <div className="max-w-sm">
            <Logo name={clinic.clinic.name} tagline={clinic.clinic.tagline} logo={clinic.clinic.logo?.dark ?? clinic.clinic.logo?.light} tone="dark" />

            {footer.description ?? clinic.clinic.shortDescription ? (
              <p className="mt-6 text-sm leading-relaxed text-white/55">
                {footer.description ?? clinic.clinic.shortDescription}
              </p>
            ) : null}

            {hasItems(social) ? (
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {social.map((item) => {
                  const Icon = SOCIAL_ICONS[item.platform];
                  return (
                    <li key={item.url}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label ?? SOCIAL_LABELS[item.platform] ?? item.platform}
                        className="grid size-10 place-items-center rounded-full border border-white/12 text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:text-white"
                      >
                        {Icon ? <Icon className="size-[1.05rem]" /> : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display text-sm font-medium tracking-[0.02em] text-white">{column.title}</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => {
                  const resolved = resolveCta(link, clinic);
                  if (!resolved) return null;
                  return (
                    <li key={`${resolved.label}-${resolved.href}`}>
                      <FooterLink href={resolved.href} external={resolved.external}>
                        {resolved.label}
                      </FooterLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-display text-sm font-medium tracking-[0.02em] text-white">
              {contact.title ?? 'Visit us'}
            </h2>
            <ul className="mt-5 flex flex-col gap-4 text-sm">
              {address ? (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary-300" aria-hidden="true" />
                  <span className="leading-relaxed text-white/60">{address}</span>
                </li>
              ) : null}
              {contact.phones.map((phone) => (
                <li key={phone.number} className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary-300" aria-hidden="true" />
                  <a href={telHref(phone.number)} className="transition-colors hover:text-white">
                    {phone.number}
                    {phone.label ? <span className="block text-xs text-white/40">{phone.label}</span> : null}
                  </a>
                </li>
              ))}
              {contact.emails.map((email) => (
                <li key={email.address} className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary-300" aria-hidden="true" />
                  <a href={mailHref(email.address)} className="break-all transition-colors hover:text-white">
                    {email.address}
                  </a>
                </li>
              ))}
              {hasItems(contact.hours) ? (
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary-300" aria-hidden="true" />
                  <ul className="flex flex-col gap-1.5 text-white/60">
                    {contact.hours.map((entry) => (
                      <li key={entry.days} className="flex flex-wrap gap-x-2">
                        <span className="text-white/75">{entry.days}</span>
                        <span className="tabular-nums">{formatHours(entry)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {footer.copyright ?? `© ${year} ${clinic.clinic.legalName ?? clinic.clinic.name}. All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.legalLinks.map((link) => {
              const resolved = resolveCta(link, clinic);
              if (!resolved) return null;
              return (
                <FooterLink key={resolved.href} href={resolved.href} external={resolved.external} className="text-xs">
                  {resolved.label}
                </FooterLink>
              );
            })}
          </div>
        </div>

        {footer.note || clinic.clinic.licenseNumber ? (
          <p className="mt-5 max-w-3xl text-[0.6875rem] leading-relaxed text-white/30">
            {[footer.note, clinic.clinic.licenseNumber ? `Licence ${clinic.clinic.licenseNumber}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  external,
  children,
  className,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    'text-sm text-white/55 transition-colors duration-300 hover:text-white',
    className,
  );

  if (external || /^(https?:|tel:|mailto:)/i.test(href)) {
    return (
      <a
        href={href}
        className={classes}
        {...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
