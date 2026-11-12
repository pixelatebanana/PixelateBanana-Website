import type { Metadata } from 'next';
import { isAdmin } from '@/lib/admin/auth';
import { getAdminLists } from '@/lib/admin/store';
import AdminLoginForm from '@/components/forms/AdminLoginForm';
import AdminPanel from '@/components/forms/AdminPanel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!isAdmin()) return <div className="wrap page-pad"><h1 className="big">Admin</h1><AdminLoginForm /></div>;
  try {
    const lists = await getAdminLists();
    return <div className="wrap page-pad"><AdminPanel work={lists.work} posts={lists.posts} storage={lists.storage} /></div>;
  } catch (e) {
    console.error('admin load error', e);
    return <div className="wrap page-pad"><h1 className="big">Admin</h1><p className="err" role="alert">Could not load content. Check GITHUB_TOKEN and GITHUB_REPO.</p></div>;
  }
}
