import type { Metadata } from 'next';
import CrmLoginForm from '@/components/crm/CrmLoginForm';
import CrmDashboard from '@/components/crm/CrmDashboard';
import { getSession, toView } from '@/lib/crm/auth';
import { chatOpen, getMessages } from '@/lib/crm/store';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Client dashboard', robots: { index: false, follow: false } };

export default async function Page() {
  const p = await getSession('client');
  if (!p) return <div className="wrap page-pad"><h1 className="big">Client dashboard</h1><CrmLoginForm role="client" /></div>;
  try {
    const messages = p.chat === 'revoked' ? [] : await getMessages(p.id);
    return <div className="wrap page-pad"><CrmDashboard role="client" initial={toView(p, 'client')} initialMessages={messages} initialOpen={chatOpen(p)} /></div>;
  } catch (e) {
    console.error('crm dashboard load error', e);
    return <div className="wrap page-pad"><h1 className="big">Client dashboard</h1><p className="err" role="alert">Could not load your project. Please try again in a moment.</p></div>;
  }
}
