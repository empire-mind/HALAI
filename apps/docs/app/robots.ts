import type { MetadataRoute } from 'next';
import { indexable, siteUrl } from '@/lib/shared';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexable ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
