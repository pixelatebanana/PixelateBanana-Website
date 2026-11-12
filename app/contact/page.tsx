import { pageMeta } from '@/lib/seo';
import QuoteForm from '@/components/forms/QuoteForm';
import { SITE } from '@/lib/site';
export const metadata = pageMeta('Contact', 'Contact PixelateBanana to start a web, app, AI automation or branding project.', '/contact');
export default function Contact() {
  return (
    <div className="wrap page-pad"><h1 className="big">Let&apos;s<br />talk.</h1>
      <p style={{ margin: '20px 0 30px' }}>Email <a href={`mailto:${SITE.email}`}><b>{SITE.email}</b></a> or use the form. We reply within 24 hours.</p>
      <QuoteForm source="contact" />
    </div>
  );
}
