'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Row } from '@/lib/admin/store';

type Kind = 'work' | 'posts';
type Msg = { ok: boolean; t: string } | null;

export default function AdminPanel({ work, posts, storage }: { work: Row[]; posts: Row[]; storage: 'github' | 'local file' }) {
  const router = useRouter();
  const [tab, setTab] = useState<Kind>('work');
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function call(method: 'POST' | 'DELETE', body: unknown): Promise<boolean> {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/admin/content', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { router.refresh(); return false; }
      if (!r.ok) { setMsg({ ok: false, t: j.error || 'Request failed.' }); return false; }
      setMsg({ ok: true, t: storage === 'github' ? 'Saved to GitHub. The live site updates once Vercel finishes redeploying (about a minute).' : 'Saved to the local file data/admin-content.json.' });
      router.refresh(); return true;
    } catch { setMsg({ ok: false, t: 'Network error. Please try again.' }); return false; } finally { setBusy(false); }
  }
  async function add(e: FormEvent<HTMLFormElement>, type: Kind) {
    e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form);
    const item: Record<string, unknown> = Object.fromEntries(fd.entries());
    delete item.image; delete item.images;
    if (type === 'work') item.concept = fd.get('concept') === 'on';
    const main = fd.get('image');
    const more = fd.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
    const files: { key: 'image' | 'images'; file: File }[] = [
      ...(main instanceof File && main.size > 0 ? [{ key: 'image' as const, file: main }] : []),
      ...more.map((file) => ({ key: 'images' as const, file })),
    ];
    if (files.length) {
      setBusy(true); setMsg(null);
      try {
        const extra: string[] = [];
        for (const { key, file } of files) {
          const up = new FormData(); up.append('file', file);
          const r = await fetch('/api/admin/upload', { method: 'POST', body: up });
          const j = await r.json().catch(() => ({}));
          if (r.status === 401) { router.refresh(); return; }
          if (!r.ok) { setMsg({ ok: false, t: j.error || 'Image upload failed.' }); return; }
          if (key === 'image') item.image = j.path; else extra.push(j.path);
        }
        if (extra.length) item.images = extra;
      } catch { setMsg({ ok: false, t: 'Network error while uploading the images. Please try again.' }); return; } finally { setBusy(false); }
    }
    if (await call('POST', { type, item })) form.reset();
  }
  async function remove(type: Kind, r: Row) {
    if (!window.confirm(`Remove "${r.title}"? This also removes its page.`)) return;
    await call('DELETE', { type, slug: r.slug });
  }
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    router.refresh();
  }
  const rows = tab === 'work' ? work : posts;

  return (
    <div className="tech">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Admin</h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Link className="btn y" href="/login/admin/live-projects">Live projects</Link><button type="button" className="btn" onClick={logout}>Log out</button></div>
      </div>
      <p style={{ marginTop: 16 }}>Storage: {storage}. Changes to the live site appear after a redeploy.</p>
      <div style={{ display: 'flex', gap: 10, margin: '20px 0' }} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'work'} className={`btn ${tab === 'work' ? 'y' : ''}`} onClick={() => { setTab('work'); setMsg(null); }}>Work ({work.length})</button>
        <button type="button" role="tab" aria-selected={tab === 'posts'} className={`btn ${tab === 'posts' ? 'y' : ''}`} onClick={() => { setTab('posts'); setMsg(null); }}>Insights ({posts.length})</button>
      </div>
      <div aria-live="polite">{msg && <div className={msg.ok ? 'ok' : 'err'} role={msg.ok ? 'status' : 'alert'} style={{ marginBottom: 20 }}>{msg.ok ? '✅ ' : '❌ '}{msg.t}</div>}</div>

      <h2 style={{ font: '700 20px var(--mono)', textTransform: 'none', margin: '10px 0' }}>Current {tab === 'work' ? 'work' : 'insights'}</h2>
      {rows.length === 0 && <p>Nothing here yet.</p>}
      {rows.map((r) => (
        <div key={r.slug} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', borderTop: '1px solid var(--ink)', padding: '12px 0', flexWrap: 'wrap' }}>
          <div><b>{r.title}</b><br /><small>{r.meta} · /{tab === 'work' ? 'work' : 'insights'}/{r.slug} · {r.source}</small></div>
          <button type="button" className="btn" disabled={busy} onClick={() => remove(tab, r)}>Remove</button>
        </div>
      ))}

      <h2 style={{ font: '700 20px var(--mono)', textTransform: 'none', margin: '40px 0 14px' }}>Add {tab === 'work' ? 'a case study' : 'an insight'}</h2>
      {tab === 'work' ? (
        <form onSubmit={(e) => add(e, 'work')} aria-label="Add case study">
          <label>Title *<input name="title" maxLength={80} required /></label>
          <label>Category *<input name="category" maxLength={60} required /></label>
          <label>Image (optional: PNG, JPG, WebP or GIF, up to 4 MB)<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
          <label>Images &amp; mockups: picture 1 (optional, up to 4 MB)<input name="images" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
          <label>Images &amp; mockups: picture 2 (optional, up to 4 MB)<input name="images" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
          <label>Images &amp; mockups: picture 3 (optional, up to 4 MB)<input name="images" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
          <label>Website URL *<input name="url" type="url" inputMode="url" placeholder="https://example.com" maxLength={300} required /></label>
          <label><input type="checkbox" name="concept" defaultChecked style={{ width: 'auto', marginRight: 8 }} />Concept project (shows the disclaimer)</label>
          <label>Business scenario *<textarea name="scenario" rows={3} maxLength={1000} required /></label>
          <label>The challenge *<textarea name="challenge" rows={3} maxLength={1000} required /></label>
          <label>Proposed strategy *<textarea name="strategy" rows={3} maxLength={1000} required /></label>
          <label>Creative or technical execution *<textarea name="execution" rows={3} maxLength={1000} required /></label>
          <label>Final deliverables * (one per line)<textarea name="deliverables" rows={4} required /></label>
          <label>Intended business value *<textarea name="value" rows={3} maxLength={1000} required /></label>
          <button className="btn" type="submit" disabled={busy}>{busy ? '⏳ Saving…' : 'Add case study'}</button>
        </form>
      ) : (
        <form onSubmit={(e) => add(e, 'posts')} aria-label="Add insight">
          <label>Title *<input name="title" maxLength={120} required /></label>
          <label>Date *<input name="date" type="date" defaultValue={today} required /></label>
          <label>Image (optional: PNG, JPG, WebP or GIF, up to 4 MB)<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
          <label>Website URL (optional)<input name="url" type="url" inputMode="url" placeholder="https://example.com" maxLength={300} /></label>
          <label>Excerpt *<textarea name="excerpt" rows={2} maxLength={300} required /></label>
          <label>Body * (separate paragraphs with a blank line)<textarea name="body" rows={10} required /></label>
          <button className="btn" type="submit" disabled={busy}>{busy ? '⏳ Saving…' : 'Add insight'}</button>
        </form>
      )}
    </div>
  );
}