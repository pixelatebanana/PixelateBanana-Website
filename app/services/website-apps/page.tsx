import ServiceDetail from '@/components/sections/ServiceDetail';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta('We Design & Develop', 'We create web, cross-platform & native apps with cyber security as our first priority.', '/services/website-apps');
export default function Page() { return <ServiceDetail slug="website-apps" />; }
