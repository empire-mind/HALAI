import { appName, indexable, siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

export function GET(): Response {
  const revision = process.env.HALAI_RELEASE_REVISION?.trim();
  return Response.json({
    product: appName,
    origin: siteUrl,
    revision: revision && /^[0-9a-f]{40}$/i.test(revision) ? revision.toLowerCase() : null,
    indexable,
  });
}
