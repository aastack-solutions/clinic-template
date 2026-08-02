import type { Clinic } from '@/types/clinic';

import { hasItems } from './utils';

/**
 * Structured data for rich results. Built entirely from `clinic.json`, so a new
 * clinic inherits correct LocalBusiness / Physician / FAQ / Breadcrumb markup
 * without anyone touching this file.
 */
export function buildJsonLd(clinic: Clinic) {
  const siteUrl = clinic.seo.siteUrl.replace(/\/$/, '');
  const { address, phones, emails, hours, coordinates } = clinic.contact;
  const graph: Record<string, unknown>[] = [];

  const businessId = `${siteUrl}/#organization`;

  const business: Record<string, unknown> = {
    '@type': ['MedicalBusiness', clinic.clinic.type].filter(
      (value, index, list) => list.indexOf(value) === index,
    ),
    '@id': businessId,
    name: clinic.clinic.name,
    legalName: clinic.clinic.legalName,
    description: clinic.clinic.description ?? clinic.seo.description,
    slogan: clinic.clinic.tagline,
    url: siteUrl,
    telephone: phones[0]?.number,
    email: emails[0]?.address,
    priceRange: clinic.clinic.priceRange,
    image: clinic.hero?.image?.src ?? clinic.seo.ogImage?.src,
    logo: clinic.clinic.logo?.light?.src ?? clinic.clinic.logo?.icon?.src,
    foundingDate: clinic.clinic.established,
  };

  if (address) {
    business.address = {
      '@type': 'PostalAddress',
      streetAddress: [address.line1, address.line2].filter(Boolean).join(', '),
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: address.country,
    };
  }

  if (coordinates) {
    business.geo = { '@type': 'GeoCoordinates', latitude: coordinates.lat, longitude: coordinates.lng };
    business.hasMap = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  }

  if (hasItems(hours)) {
    business.openingHoursSpecification = hours
      .filter((entry) => !entry.closed && entry.opens && entry.closes)
      .map((entry) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hasItems(entry.schemaDays) ? entry.schemaDays : undefined,
        opens: entry.opens,
        closes: entry.closes,
      }));
  }

  if (hasItems(clinic.social)) {
    business.sameAs = clinic.social.map((item) => item.url);
  }

  if (hasItems(clinic.services?.items)) {
    business.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: clinic.services?.title ?? 'Treatments',
      itemListElement: clinic.services!.items.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'MedicalProcedure',
          name: service.title,
          description: service.description,
        },
      })),
    };
  }

  const summary = clinic.testimonials?.summary;
  if (summary) {
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: summary.averageRating,
      reviewCount: summary.totalReviews,
      bestRating: 5,
    };
  }

  if (hasItems(clinic.testimonials?.items)) {
    business.review = clinic.testimonials!.items.slice(0, 10).map((testimonial) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: testimonial.name },
      datePublished: testimonial.date,
      reviewBody: testimonial.quote,
      reviewRating: testimonial.rating
        ? { '@type': 'Rating', ratingValue: testimonial.rating, bestRating: 5 }
        : undefined,
    }));
  }

  if (hasItems(clinic.doctors?.items)) {
    business.employee = clinic.doctors!.items.map((doctor) => ({
      '@type': 'Physician',
      name: doctor.name,
      jobTitle: doctor.role,
      description: doctor.bio,
      image: doctor.image?.src,
      knowsAbout: hasItems(doctor.specialties) ? doctor.specialties : undefined,
      knowsLanguage: hasItems(doctor.languages) ? doctor.languages : undefined,
    }));
  }

  graph.push(prune(business));

  graph.push({
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: clinic.clinic.name,
    description: clinic.seo.description,
    publisher: { '@id': businessId },
    inLanguage: clinic.seo.language,
  });

  if (hasItems(clinic.faqs?.items)) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: clinic.faqs!.items.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Recursively removes `undefined` / empty values so the JSON-LD stays clean. */
function prune<T extends Record<string, unknown>>(input: T): T {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    output[key] = value;
  }
  return output as T;
}
