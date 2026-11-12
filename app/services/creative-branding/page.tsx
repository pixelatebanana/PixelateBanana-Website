import ServiceDetail from '@/components/sections/ServiceDetail';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta('Creative & Branding', 'Campaign visuals, motion, brand positioning, identity systems and messaging.', '/services/creative-branding');
export default function Page() { return <ServiceDetail slug="creative-branding" />; }
