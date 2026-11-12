'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Conversation from './Conversation';
import StageTracker from './StageTracker';
import type { CrmView } from '@/lib/crm/auth';
import type { Message, Role } from '@/lib/crm/shared';

export default function CrmDashboard({ role, initial, initialMessages, initialOpen }: { role: Role; initial: CrmView; initialMessages: Message[]; initialOpen: boolean }) {
  const router = useRouter();
  const [view, setView] = useState(initial);
  const [open, setOpen] = useState(initialOpen);
  const [messages, setMessages] = useState(initialMessages);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const next = useRef(initial.chat === 'revoked' ? 0 : initialMessages.length);

  const poll = useCallback(async () => {
    try {
      const r = await fetch(`/api/crm/chat?role=${role}&since=${next.current}`, { cache: 'no-store' });
      if (r.status === 401) { router.refresh(); return; }
      if (!r.ok) return;
      const j = (await r.json()) as { view: CrmView; open: boolean; messages: Message[]; next: number };
      setView(j.view); setOpen(j.open);
      if (j.view.chat === 'revoked') { setMessages([]); next.current = 0; return; }
      if (j.messages.length) setMessages((m) => [...m, ...j.messages]);
      next.current = j.next;
    } catch { /* try again on the next tick */ }
  }, [role, router]);
  useEffect(() => { const t = setInterval(poll, 5000); return () => clearInterval(t); }, [poll]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const form = e.currentTarget; const text = String(new FormData(form).get('text') || '').trim(); if (!text) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/crm/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, text }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { router.refresh(); return; }
      if (!r.ok) { setErr(j.error || 'Could not send.'); return; }
      form.reset(); await poll();
    } catch { setErr('Network error. Please try again.'); } finally { setBusy(false); }
  }
  async function approveDesign() {
    if (!window.confirm('Approve the design? The project moves to production and this conversation closes.')) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/crm/stage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve-design' }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { router.refresh(); return; }
      if (!r.ok) { setErr(j.error || 'Could not approve.'); return; }
      await poll();
    } catch { setErr('Network error. Please try again.'); } finally { setBusy(false); }
  }
  async function logout() {
    await fetch('/api/crm/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) }).catch(() => undefined);
    router.refresh();
  }

  const revoked = view.chat === 'revoked';
  const closedText = revoked ? 'The admin has closed this conversation.' : view.stage === 'production' || view.stage === 'delivery' ? 'Design approved. The conversation is closed while the project is in ' + view.stage + '.' : 'This conversation is closed.';
  return (
    <div className="tech">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>{role === 'client' ? 'Client' : 'Specialist'} dashboard</h1>
        <button type="button" className="btn" onClick={logout}>Log out</button>
      </div>
      <section className="crm-card" style={{ marginTop: 24 }}>
        <span className="chip">{role}</span>
        <h2 style={{ font: '700 24px var(--mono)', textTransform: 'none', margin: '10px 0 6px' }}>{view.number} · {view.title}</h2>
        {view.brief && <p style={{ margin: '0 0 12px' }}>{view.brief}</p>}
        <p style={{ margin: '0 0 16px' }}><small>You: {view.me} · {role === 'client' ? 'Specialist' : 'Client'}: {view.other}</small></p>
        <StageTracker stage={view.stage} />
      </section>

      <section className="crm-card" style={{ marginTop: 24 }}>
        <h2 style={{ font: '700 20px var(--mono)', textTransform: 'none', margin: '0 0 12px' }}>Conversation</h2>
        {revoked ? <p className="crm-empty">{closedText}</p> : <Conversation messages={messages} mine={role} empty="No messages yet. Say hello and share the project details." />}
        <div aria-live="polite">{err && <div className="err" role="alert" style={{ marginTop: 10 }}>❌ {err}</div>}</div>
        {open ? (
          <form onSubmit={send} aria-label="Send a message" style={{ marginTop: 16, maxWidth: 'none' }}>
            <label>Message<textarea name="text" rows={3} maxLength={2000} required placeholder={role === 'specialist' ? 'Share progress or a link to your work…' : 'Write to your specialist…'} /></label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn y" type="submit" disabled={busy}>{busy ? '⏳ Sending…' : 'Send'}</button>
              {role === 'client' && view.stage === 'design' && <button className="btn" type="button" disabled={busy} onClick={approveDesign}>Approve design</button>}
            </div>
          </form>
        ) : !revoked && <p className="crm-empty" style={{ marginTop: 14 }}>{closedText}</p>}
        {open && <p style={{ marginTop: 12 }}><small>{view.stage === 'specification' ? 'Agree the project specification here. The admin marks it approved.' : (role === 'client' ? 'The specialist shares design work here. Approve the design when you are happy with it.' : 'Share your design work here. The client approves it when ready.')}</small></p>}
      </section>
    </div>
  );
}
