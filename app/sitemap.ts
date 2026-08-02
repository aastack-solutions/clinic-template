import type { MetadataRoute } from 'next';

import { clinic } from '@/lib/clinic';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = clinic.seo.siteUrl.replace(/\/$/, '');

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
