import type { MetadataRoute } from 'next';

import { clinic } from '@/lib/clinic';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = clinic.seo.siteUrl.replace(/\/$/, '');

  // Staging builds set `seo.noindex` to keep an unfinished clinic out of search.
  if (clinic.seo.noindex) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
