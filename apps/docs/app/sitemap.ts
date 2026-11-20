import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { sitePaths } from '@/lib/halai-site';
import { sitePageUrl } from '@/lib/shared';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...sitePaths, ...source.getPages().map((page) => page.url)];
  return paths.map((path) => ({ url: sitePageUrl(path) }));
}
