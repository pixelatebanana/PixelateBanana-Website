'use client';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { validateChat, type ChatErrors } from '@/lib/validation';
import { track } from '@/lib/analytics';

type Status = 'idle' | 'sending' | 'success' | 'error';
const empty = { name: '', company: '', contact: '', message: '' };
type K = keyof typeof empty;

function Field({ id, label, error, req, children }: { id: K; label: string; error?: string; req?: boolean; children: ReactNode }) {
  return <div><label htmlFor={`c-${id}`}>{label}{req ? ' *' : ''}</label>{children}{error && <div className="err" id={`ce-${id}`}>{error}</div>}</div>;
}

export default function ChatForm({ source = 'chat' }: { source?: string }) {
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<ChatErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const t0 = useRef(Date.now());
  const hp = useRef<HTMLInputElement>(null);
  const p = (k: K) => ({ id: `c-${k}`, name: k, value: v[k], 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `ce-${k}` : undefined, onChange: (e: { target: { value: string } }) => setV((o) => ({ ...o, [k]: e.target.value })) });

  async function submit(e: FormEvent) {
    e.preventDefault(); if (status === 'sending') return;
    const { errors: er } = validateChat(v); setErrors(er);
    const first = Object.keys(er)[0];
    if (first) { document.getElementById(`c-${first}`)?.focus(); return; }
    setStatus('sending'); track('chat_submit', { source });
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, website: hp.current?.value || '', startedAt: t0.current }) });
      if (r.status === 422) { const j = await r.json(); setErrors(j.errors || {}); setStatus('idle'); return; }
      if (!r.ok) throw new Error(String(r.status));
      setStatus('success'); setV(empty); track('chat_success', { source });
    } catch { setStatus('error'); track('chat_error', { source }); }
  }

  if (status === 'success') return <div className="ok" role="status">✅ Thank you! Your message is in. We will reply within 24 hours.</div>;
  return (
    <form onSubmit={submit} noValidate aria-label="Chat with us">
      <Field id="name" label="Your name" req error={errors.name}><input {...p('name')} maxLength={80} autoComplete="name" /></Field>
      <Field id="company" label="Company name" error={errors.company}><input {...p('company')} maxLength={100} autoComplete="organization" /></Field>
      <Field id="contact" label="Contact info (email or phone)" req error={errors.contact}><input {...p('contact')} maxLength={120} autoComplete="email" /></Field>
      <Field id="message" label="Message" req error={errors.message}><textarea {...p('message')} rows={5} maxLength={2000} /></Field>
      <input ref={hp} className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" defaultValue="" />
      <button className="btn" type="submit" disabled={status === 'sending'}>{status === 'sending' ? '⏳ Sending…' : 'Send message 💬'}</button>
      <div aria-live="polite">{status === 'error' && <div className="err" role="alert">❌ Something went wrong. Please try again or email hello@pixelatebanana.com.</div>}</div>
    </form>
  );
}
