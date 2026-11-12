'use client';
import { useEffect, useState } from 'react';
export type Consent = 'granted' | 'denied' | 'unset';
const KEY = 'pb_consent';
/** 'builtin' = our banner gates ads. 'google' = you enabled Google's certified Privacy & messaging in AdSense, so our banner stays off. */
export const CONSENT_MODE = process.env.NEXT_PUBLIC_CONSENT_MODE === 'google' ? 'google' : 'builtin';
export function readConsent(): Consent {
  try { const v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : 'unset'; } catch { return 'unset'; }
}
export function saveConsent(v: 'granted' | 'denied') {
  try { localStorage.setItem(KEY, v); } catch { /* private mode */ }
  window.dispatchEvent(new Event('pb-consent'));
}
export function resetConsent() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
  window.dispatchEvent(new Event('pb-consent'));
}
/** null until mounted, which avoids hydration mismatches. */
export function useConsent(): Consent | null {
  const [c, setC] = useState<Consent | null>(null);
  useEffect(() => {
    const f = () => setC(CONSENT_MODE === 'google' ? 'granted' : readConsent());
    f(); window.addEventListener('pb-consent', f);
    return () => window.removeEventListener('pb-consent', f);
  }, []);
  return c;
}
