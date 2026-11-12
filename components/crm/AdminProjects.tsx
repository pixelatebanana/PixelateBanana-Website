'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Conversation from './Conversation';
import StageTracker from './StageTracker';
import { chatOpen, STAGES, type Message } from '@/lib/crm/shared';
import type { AdminProject } from '@/lib/crm/admin';

type Msg = { ok: boolean; t: string } | null;
const NEXT: Record<string, { action: string; label: string }> = {
  specification: { action: 'approve-spec', label: 'Approve specification' },
  production: { action: 'to-delivery', label: 'Move to delivery' },
  delivery: { action: 'complete', label: 'Mark complete' },
};

export default function AdminProjects({ initial, storage }: { initial: AdminProject[]; storage: 'redis' | 'local file' }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/projects', { cache: 'no-store' });
      if (r.status === 401) { router.refresh(); return; }
      if (r.ok) setProjects(((await r.json()) as { projects: AdminProject[] }).projects);
      if (open) {
        const c = await fetch(`/api/admin/projects?id=${open}`, { cache: 'no-store' });
        if (c.ok) setMessages(((await c.json()) as { messages: Message[] }).messages);
      }
    } catch { /* try again on the next tick */ }
  }, [open, router]);
  useEffect(() => { refresh(); const t = setInterval(refresh, 6000); return () => clearInterval(t); }, [refresh]);

  async function post(body: Record<string, unknown>, ok: string): Promise<boolean> {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { router.refresh(); return false; }
      if (!r.ok) { setMsg({ ok: false, t: j.error || 'Request failed.' }); return false; }
      const mail = j.mail as Record<string, boolean> | undefined;
      const failed = mail ? Object.entries(mail).filter(([, v]) => !v).map(([k]) => k) : [];
      setMsg(failed.length ? { ok: false, t: `${ok} But the email to the ${failed.join(' and ')} could not be sent. Check RESEND_API_KEY and INQUIRY_FROM, then use "Resend invite".` } : { ok: true, t: ok });
      await refresh(); return true;
    } catch { setMsg({ ok: false, t: 'Network error. Please try again.' }); return false; } finally { setBusy(false); }
  }
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget;
    if (await post(Object.fromEntries(new FormData(form).entries()), 'Project created. Invitations with one-time passwords were emailed to the client and the specialist.')) form.reset();
  }
  const act = (p: AdminProject, action: string, ok: string, confirm?: string) => { if (confirm && !window.confirm(confirm)) return; post({ action, id: p.id }, ok); };
  async function say(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault(); const form = e.currentTarget; const text = String(new FormData(form).get('text') || '').trim(); if (!text) return;
    if (await post({ action: 'message', id, text }, 'Message sent.')) form.reset();
  }
  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined); router.refresh(); }

  return (
    <div className="tech">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Live projects</h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Link className="btn y" href="/login/admin">Back to admin</Link><button type="button" className="btn" onClick={logout}>Log out</button></div>
      </div>
      <p style={{ marginTop: 16 }}>Storage: {storage}. Clients and specialists sign in at /login/client/dashboard and /login/specialist/dashboard. Only you can see their email addresses.</p>
      <div aria-live="polite">{msg && <div className={msg.ok ? 'ok' : 'err'} role={msg.ok ? 'status' : 'alert'} style={{ margin: '16px 0' }}>{msg.ok ? '✅ ' : '❌ '}{msg.t}</div>}</div>

      <h2 style={{ font: '700 20px var(--mono)', textTransform: 'none', margin: '30px 0 10px' }}>Current projects ({projects.length})</h2>
      {projects.length === 0 && <p>No projects yet. Add one below.</p>}
      {projects.map((p) => {
        const step = NEXT[p.stage]; const live = p.stage !== 'complete';
        return (
          <section key={p.id} className="crm-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div><b>{p.number} · {p.title}</b><br /><small>Created {new Date(p.created).toLocaleDateString()}</small></div>
              <div><span className="chip">{STAGES.find((s) => s.key === p.stage)?.label}</span><span className="chip">{p.chat === 'revoked' ? 'conversation revoked' : chatOpen(p) ? 'conversation open' : 'conversation closed'}</span></div>
            </div>
            {p.brief && <p style={{ margin: '10px 0 0' }}>{p.brief}</p>}
            <p style={{ margin: '10px 0' }}><small>Client: {p.client.name} · {p.client.email}<br />Specialist: {p.specialist.name} · {p.specialist.email}</small></p>
            <StageTracker stage={p.stage} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              <button type="button" className="btn y" onClick={() => { setOpen(open === p.id ? null : p.id); setMessages([]); }}>{open === p.id ? 'Hide conversation' : 'View conversation'}</button>
              {step && <button type="button" className="btn" disabled={busy} onClick={() => act(p, step.action, `${step.label}: done.`)}>{step.label}</button>}
              {live && p.chat === 'open' && <button type="button" className="btn" disabled={busy} onClick={() => act(p, 'revoke', 'Conversation revoked.', 'Revoke this conversation? The client and the specialist will no longer see or send messages.')}>Revoke conversation</button>}
              {live && <button type="button" className="btn" disabled={busy} onClick={() => act(p, 'resend', 'New one-time passwords emailed. The old ones no longer work.' + (p.chat === 'revoked' ? ' The conversation is restored with its earlier messages.' : ''), 'Send new one-time passwords to the client and the specialist? The old ones stop working.')}>Resend invites</button>}
              {live && p.stage !== 'delivery' && <button type="button" className="btn" disabled={busy} onClick={() => act(p, 'complete', 'Project marked complete. Passwords have ended.', 'Mark this project complete? Both passwords stop working.')}>Mark complete</button>}
            </div>
            {open === p.id && (
              <div style={{ marginTop: 18 }}>
                <Conversation messages={messages} empty="No messages yet." />
                {chatOpen(p) ? (
                  <form onSubmit={(e) => say(e, p.id)} aria-label="Message as admin" style={{ marginTop: 12, maxWidth: 'none' }}>
                    <label>Message as admin<textarea name="text" rows={2} maxLength={2000} required /></label>
                    <div><button className="btn" type="submit" disabled={busy}>Send</button></div>
                  </form>
                ) : <p className="crm-empty" style={{ marginTop: 12 }}>The conversation is closed, so no new messages can be sent.</p>}
              </div>
            )}
          </section>
        );
      })}

      <h2 style={{ font: '700 20px var(--mono)', textTransform: 'none', margin: '40px 0 14px' }}>Add a project</h2>
      <form onSubmit={create} aria-label="Add project">
        <label>Project title *<input name="title" maxLength={100} required /></label>
        <label>Short description (optional)<textarea name="brief" rows={2} maxLength={600} /></label>
        <label>Client name *<input name="clientName" maxLength={80} required /></label>
        <label>Client email *<input name="clientEmail" type="email" maxLength={200} required /></label>
        <label>Specialist name *<input name="specialistName" maxLength={80} required /></label>
        <label>Specialist email *<input name="specialistEmail" type="email" maxLength={200} required /></label>
        <button className="btn" type="submit" disabled={busy}>{busy ? '⏳ Saving…' : 'Add project and email invites'}</button>
      </form>
    </div>
  );
}
