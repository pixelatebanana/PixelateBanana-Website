'use client';
import { CONSENT_MODE, resetConsent } from '@/lib/consent';
export default function AdPreferences() {
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT || CONSENT_MODE === 'google') return null;
  return <> · <button type="button" className="linkbtn" onClick={resetConsent}>Ad preferences</button></>;
}
