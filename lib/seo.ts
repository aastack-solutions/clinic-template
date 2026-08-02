import type { Metadata } from 'next';

import type { Clinic } from '@/types/clinic';

import { formatAddress } from './utils';

/** Every piece of metadata is derived from `clinic.json` — nothing is hardcoded. */
export function buildMetadata(clinic: Clinic): Metadata {
  const { seo, clinic: identity } = clinic;
  const siteUrl = seo.siteUrl.replace(/\/$/, '');
  const ogImage = seo.ogImage ?? clinic.hero?.image ?? clinic.about?.images[0];
  const title = seo.title;

  return {
    metadataBase: new URL(siteUrl),
    title: seo.titleTemplate
      ? { default: title, template: seo.titleTemplate }
      : title,
    description: seo.description,
    keywords: seo.keywords.length > 0 ? seo.keywords : undefined,
    applicationName: identity.name,
    authors: [{ name: identity.legalName ?? identity.name, url: siteUrl }],
    creator: identity.legalName ?? identity.name,
    publisher: identity.legalName ?? identity.name,
    alternates: { canonical: siteUrl },
    robots: seo.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    verification: seo.verification
      ? { google: seo.verification.google, other: seo.verification.bing ? { 'msvalidate.01': seo.verification.bing } : undefined }
      : undefined,
    openGraph: {
      type: 'website',
      siteName: identity.name,
      title,
      description: seo.description,
      url: siteUrl,
      locale: seo.locale,
      images: ogImage
        ? [
            {
              url: ogImage.src,
              width: ogImage.width ?? 1200,
              height: ogImage.height ?? 630,
              alt: ogImage.alt ?? `${identity.name} — ${identity.tagline ?? seo.description}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: seo.description,
      site: seo.twitterHandle,
      creator: seo.twitterHandle,
      images: ogImage ? [ogImage.src] : undefined,
    },
    icons: identity.logo?.icon
      ? { icon: identity.logo.icon.src, apple: identity.logo.icon.src }
      : undefined,
    other: compact({
      'geo.placename': clinic.contact.address?.city,
      'geo.region': clinic.contact.address?.country,
      'business:contact_data:street_address': formatAddress(clinic.contact.address),
      'business:contact_data:phone_number': clinic.contact.phones[0]?.number,
    }),
  };
}

/** Drops empty values so the head never carries hollow meta tags. */
function compact(record: Record<string, string | undefined>) {
  const entries = Object.entries(record).filter((entry): entry is [string, string] => Boolean(entry[1]));
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}
