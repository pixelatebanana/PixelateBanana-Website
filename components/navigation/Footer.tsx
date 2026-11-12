import Link from 'next/link';
import { SITE } from '@/lib/site';
import AdPreferences from '../ui/AdPreferences';
import SocialLinks from '../ui/SocialLinks';
export default function Footer() {
  return (
    <footer><div className="wrap">
      <p>© {new Date().getFullYear()} {SITE.name} · Web · Apps · AI · Brand · <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
      <p><Link href="/about">About</Link> · <Link href="/start-a-project">Start a project</Link> · <Link href="/privacy-policy">Privacy Policy</Link> · <Link href="/terms-of-service">Terms of Service</Link><AdPreferences /></p>
      <SocialLinks />
    </div></footer>
  );
}
