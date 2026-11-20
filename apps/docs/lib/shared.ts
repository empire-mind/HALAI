import { HALAI_PRODUCT } from '../../../shared/halai-product';

export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';
export const appName = HALAI_PRODUCT.name;
export const gitConfig = { user: HALAI_PRODUCT.owner, repo: HALAI_PRODUCT.repo, branch: HALAI_PRODUCT.branch };

const configured = process.env.HALAI_SITE_ORIGIN?.trim();
const origin = new URL(configured || 'http://127.0.0.1:3000');
const local = origin.protocol === 'http:' && ['127.0.0.1', '[::1]', 'localhost'].includes(origin.hostname);
if ((!local && origin.protocol !== 'https:') || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('HALAI_SITE_ORIGIN must be an HTTPS origin or a loopback HTTP origin');
}
export const siteUrl = origin.origin;
export const indexable = Boolean(configured && !local && process.env.HALAI_SITE_INDEXABLE === '1');

export function sitePageUrl(path: string): string {
  return path === '/' ? siteUrl : new URL(path, siteUrl).href;
}
