import LegalPage from '@/components/sections/LegalPage';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta('Terms of Service', 'Terms for using the PixelateBanana website and services.', '/terms-of-service');
export default function Page() {
  return <LegalPage title="Terms of Service" updated="November 2026" parts={[
    ['Use of this site', 'Content is provided for general information. Do not misuse the site or attempt to disrupt it.'],
    ['Concept projects', 'Case studies marked as concept projects are demonstrations and do not describe real client results.'],
    ['Quotes and projects', 'Quotes are estimates until a written agreement is signed. Project terms are set in that agreement.'],
    ['Intellectual property', 'Site content and branding belong to PixelateBanana unless stated otherwise.'],
    ['Liability', 'The site is provided as is, to the extent permitted by law.'],
  ]} />;
}
