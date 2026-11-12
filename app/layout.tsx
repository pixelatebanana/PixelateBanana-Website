import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import '@/styles/globals.css';
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';
import JsonLd from '@/components/ui/JsonLd';
import AdScript from '@/components/ui/AdScript';
import ConsentBanner from '@/components/ui/ConsentBanner';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Web, App, AI Automation & Brand Agency`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  icons: { icon: '/brand/logo.svg' },
  openGraph: { type: 'website', siteName: SITE.name },
  robots: { index: true, follow: true },
  // Lets AdSense verify the site even though the ad script waits for consent
  ...(process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? { other: { 'google-adsense-account': process.env.NEXT_PUBLIC_ADSENSE_CLIENT } } : {}),
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#FFE135' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <noscript><style>{'.reveal{opacity:1!important;transform:none!important}'}</style></noscript>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: SITE.name, url: SITE.url, email: SITE.email, description: SITE.description }} />
        <AdScript />
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
