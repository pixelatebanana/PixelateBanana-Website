'use client';
import Script from 'next/script';
import { useConsent } from '@/lib/consent';
/** Loads the AdSense script only after consent (or immediately when Google's own CMP handles consent). */
export default function AdScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT, consent = useConsent();
  if (!client || consent !== 'granted') return null;
  return <Script async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} />;
}
