import type { Metadata } from 'next';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin/auth';
import { adminView } from '@/lib/crm/admin';
import { crmStorage, listProjects } from '@/lib/crm/store';
import AdminLoginForm from '@/components/forms/AdminLoginForm';
import AdminProjects from '@/components/crm/AdminProjects';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Live projects', robots: { index: false, follow: false } };

export default async function LiveProjectsPage() {
  if (!isAdmin()) return <div className="wrap page-pad"><h1 className="big">Admin</h1><AdminLoginForm /></div>;
  try {
    const projects = (await listProjects()).map(adminView);
    return <div className="wrap page-pad"><AdminProjects initial={projects} storage={crmStorage()} /></div>;
  } catch (e) {
    console.error('live projects load error', e);
    return (
      <div className="wrap page-pad"><h1 className="big">Live projects</h1>
        <p className="err" role="alert">Could not load projects. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.</p>
        <p><Link href="/login/admin"><b>← Back to admin</b></Link></p>
      </div>
    );
  }
}
