import LegalPage from '@/components/sections/LegalPage';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta('Privacy Policy', 'How PixelateBanana collects, uses and protects your data.', '/privacy-policy');
export default function Page() {
  return <LegalPage title="Privacy Policy" updated="November 2026" parts={[
    ['What we collect', 'Details you submit in our quote and contact forms: name, company, email, phone, service, budget and message.'],
    ['How we use it', 'To reply to your enquiry, prepare quotes and improve our services. We do not sell your data.'],
    ['Analytics', 'We use privacy-friendly analytics to measure page views, call-to-action clicks and form submissions.'],
    ['Advertising', 'If advertising is enabled on our Insights pages, Google AdSense may use cookies to serve ads. Ads and the AdSense script load only after you accept in our consent banner, and you can change your choice at any time with the Ad preferences link in the footer. You can also manage ad settings in your Google account.'],
    ['Your rights', 'You may request access to, correction of or deletion of your data by emailing hello@pixelatebanana.com.'],
  ]} />;
}
