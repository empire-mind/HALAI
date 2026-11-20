import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { isSitePage, siteMetadata, sitePages } from '@/lib/halai-site';
import { Demo } from '@/components/halai/demo';
import { InstallerPicker } from '@/components/halai/installer-picker';
import { RolloutBrief, RolloutBriefFromPlan, TeamRolloutPlan } from '@/components/halai/rollout-brief';

type Props = { params: Promise<{ page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(sitePages).map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  if (!isSitePage(page)) notFound();
  return siteMetadata(`/${page}`, sitePages[page].title, sitePages[page].description);
}

export default async function Page({ params }: Props) {
  const { page } = await params;
  if (!isSitePage(page)) notFound();
  const content = sitePages[page];
  const email = process.env.HALAI_CONTACT_EMAIL?.trim() ?? '';
  const contactEmail = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email) ? email : '';

  return (
    <div className="halai-container halai-page">
      <header className="halai-page-heading">
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        {'action' in content && <Link className="halai-button" href={content.action.href}>{content.action.label}<ArrowRight size={17} aria-hidden="true" /></Link>}
      </header>
      {page === 'demo' && <Demo />}
      {page === 'contact' && (
        <Suspense fallback={<RolloutBrief email={contactEmail} />}>
          <RolloutBriefFromPlan email={contactEmail} />
        </Suspense>
      )}
      {'sections' in content && <div className="halai-sections">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {'link' in section && section.link && <Link className="halai-text-link" href={section.link.href}>{section.link.label} <ArrowRight size={15} aria-hidden="true" /></Link>}
          </section>
        ))}
      </div>}
      {page === 'pricing' && <TeamRolloutPlan />}
      {page === 'download' && <div className="halai-actions halai-page-actions">
        <InstallerPicker />
        <a className="halai-text-link" href="/halai-studio.mausbot-theme.json" download>Download HALAI Studio theme</a>
      </div>}
    </div>
  );
}
