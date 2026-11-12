import ServiceDetail from '@/components/sections/ServiceDetail';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta('AI Automation & Workflow', 'Agents, integrations and pipelines that remove repetitive work.', '/services/ai-automation');
export default function Page() { return <ServiceDetail slug="ai-automation" />; }
