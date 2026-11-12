'use client';
import Link from 'next/link';
import { CONSENT_MODE, saveConsent, useConsent } from '@/lib/consent';
export default function ConsentBanner() {
  const consent = useConsent();
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT || CONSENT_MODE === 'google' || consent !== 'unset') return null;
  return (
    <div className="consent" role="region" aria-label="Advertising consent">
      <p>We show Google ads on our Insights pages. Ads may use cookies to personalise content. Accept to see ads, or reject to browse without them. See our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      <div><button type="button" className="btn y" onClick={() => saveConsent('granted')}>Accept</button><button type="button" className="btn y" onClick={() => saveConsent('denied')}>Reject</button></div>
    </div>
  );
}
