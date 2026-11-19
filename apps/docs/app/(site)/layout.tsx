import type { ReactNode } from 'react';
import Link from 'next/link';
import '../../components/halai/site.css';

const navigation = [
  ['Product', '/product'],
  ['Solutions', '/solutions'],
  ['Guides', '/guides'],
  ['Docs', '/docs'],
] as const;

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="halai-site">
      <a className="halai-skip" href="#main-content">Skip to main content</a>
      <header className="halai-header">
        <div className="halai-container halai-header-grid">
          <Link className="halai-brand" href="/" aria-label="HALAI home">
            <img src="/app-icon.svg" alt="" width={34} height={34} />
            <span>HALAI</span>
          </Link>
          <nav aria-label="Main navigation">
            {navigation.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <Link className="halai-button halai-button-small" href="/download">Get started</Link>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="halai-footer">
        <div className="halai-container halai-footer-inner">
          <div><strong>HALAI</strong><p>By EmpireMind</p></div>
          <nav aria-label="Footer navigation">
            <Link href="/business">Business</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/security">Security</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/releases">Releases</Link>
            <Link href="https://github.com/empire-mind/HALAI">Source</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
