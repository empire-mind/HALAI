import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { appName, indexable, siteUrl } from '@/lib/shared';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description: 'HALAI by EmpireMind. Run your AI team in a workspace you control.',
  robots: { index: indexable, follow: indexable },
  openGraph: {
    title: appName,
    siteName: appName,
    description: 'Run your AI team in a workspace you control.',
    type: 'website',
  },
  icons: {
    icon: '/app-icon.svg',
    apple: '/app-icon.svg',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
