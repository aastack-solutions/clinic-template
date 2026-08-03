import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Clinic, Cta, ClinicImage, OpeningHours } from '@/types/clinic';

/** Tailwind-aware class merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True when a value is a non-empty array — the engine's "does this section exist" test. */
export function hasItems<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Sarah Al Mansouri" → "SA". Used by the avatar fallback. */
export function initials(name: string) {
  return name
    .replace(/(dr|prof|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

const digitsOnly = (value: string) => value.replace(/[^\d+]/g, '');

export function telHref(phone: string) {
  return `tel:${digitsOnly(phone)}`;
}

export function whatsappHref(number: string, message?: string) {
  const base = `https://wa.me/${number.replace(/\D/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailHref(address: string, subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return `mailto:${address}${query ? `?${query}` : ''}`;
}

export function formatAddress(address: Clinic['contact']['address']): string {
  if (!address) return '';
  return [address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
    .filter(Boolean)
    .join(', ');
}

export function directionsHref(clinic: Clinic) {
  const { address, coordinates } = clinic.contact;
  if (address?.mapsUrl) return address.mapsUrl;
  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  }
  const query = [clinic.clinic.name, formatAddress(address)].filter(Boolean).join(' ');
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
}

export type ResolvedCta = {
  label: string;
  href: string;
  variant: Cta['variant'];
  icon?: string;
  /** External links get `target="_blank"` + `rel`. */
  external: boolean;
};

/**
 * Turns a semantic CTA from `clinic.json` into a real link.
 * Returns `null` when the data it depends on is missing, which lets callers
 * silently drop the button instead of rendering a dead control.
 */
export function resolveCta(cta: Cta | undefined, clinic: Clinic): ResolvedCta | null {
  if (!cta) return null;
  const { contact } = clinic;
  const base = { label: cta.label, variant: cta.variant, icon: cta.icon };

  switch (cta.action) {
    case 'call': {
      const phone = contact.phones[0]?.number;
      return phone ? { ...base, href: telHref(phone), external: false } : null;
    }
    case 'whatsapp': {
      if (!contact.whatsapp) return null;
      const message = cta.message ?? contact.whatsapp.defaultMessage;
      return { ...base, href: whatsappHref(contact.whatsapp.number, message), external: true };
    }
    case 'email': {
      const email = contact.emails[0]?.address;
      return email
        ? { ...base, href: mailHref(email, `Appointment enquiry for ${clinic.clinic.name}`, cta.message), external: false }
        : null;
    }
    case 'directions': {
      const href = directionsHref(clinic);
      return href ? { ...base, href, external: true } : null;
    }
    case 'scroll': {
      return cta.target ? { ...base, href: `#${cta.target}`, external: false } : null;
    }
    case 'link':
    default: {
      if (!cta.href) return null;
      return { ...base, href: cta.href, external: /^https?:\/\//i.test(cta.href) };
    }
  }
}

/** Resolves a list of CTAs, dropping any that cannot be satisfied by the data. */
export function resolveCtas(ctas: Cta[] | undefined, clinic: Clinic): ResolvedCta[] {
  if (!ctas) return [];
  return ctas.map((cta) => resolveCta(cta, clinic)).filter((cta): cta is ResolvedCta => cta !== null);
}

/** `"09:00"` → `"9:00 AM"`. Falls back to the raw value if it isn't parseable. */
export function formatTime(value: string | undefined, locale = 'en-US') {
  if (!value) return '';
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const [, hoursRaw, minutes] = match;
  const hours = Number(hoursRaw);
  const date = new Date(Date.UTC(2000, 0, 1, hours, Number(minutes)));
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function formatHours(entry: OpeningHours, locale?: string) {
  if (entry.closed || (!entry.opens && !entry.closes)) return 'Closed';
  return `${formatTime(entry.opens, locale)} to ${formatTime(entry.closes, locale)}`;
}

/** Alt text is optional in the content file; derive something meaningful. */
export function imageAlt(image: ClinicImage | undefined, fallback: string) {
  return image?.alt?.trim() || fallback;
}

/** Chunk a list into `size`-length groups (used by the testimonial carousel). */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
}
