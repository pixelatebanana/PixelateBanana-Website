'use client';
import { useEffect } from 'react';
import { useConsent } from '@/lib/consent';

export type AdPlacement = 'sidebar' | 'feed' | 'article';
/** One AdSense ad unit per placement. Create the units in AdSense, then paste each ID into the matching env var. */
const SLOTS: Record<AdPlacement, string | undefined> = {
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  feed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED,
  article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE,
};

export default function AdSlot({ placement }: { placement: AdPlacement }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT, slot = SLOTS[placement], consent = useConsent();
  const live = !!client && !!slot;
  useEffect(() => {
    if (!live || consent !== 'granted') return;
    try { const w = window as unknown as { adsbygoogle?: unknown[] }; (w.adsbygoogle = w.adsbygoogle || []).push({}); } catch { /* ad blockers */ }
  }, [live, consent]);
  if (!live) return process.env.NODE_ENV === 'production' ? null : <div className="ad" aria-hidden="true">{placement} ad slot: set NEXT_PUBLIC_ADSENSE_CLIENT and NEXT_PUBLIC_ADSENSE_SLOT_{placement.toUpperCase()}</div>;
  if (consent !== 'granted') return null;
  return <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />;
}
