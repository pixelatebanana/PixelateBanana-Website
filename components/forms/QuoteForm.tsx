'use client';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { BUDGET_OPTIONS, SERVICE_OPTIONS, validateInquiry, type Errors } from '@/lib/validation';
import { track } from '@/lib/analytics';

type Status = 'idle' | 'sending' | 'success' | 'error';
const empty = { name: '', company: '', email: '', phone: '', service: '', budget: '', message: '' };
type K = keyof typeof empty;

function Field({ id, label, error, req, children }: { id: K; label: string; error?: string; req?: boolean; children: ReactNode }) {
  return <div><label htmlFor={`f-${id}`}>{label}{req ? ' *' : ''}</label>{children}{error && <div className="err" id={`e-${id}`}>{error}</div>}</div>;
}

export default function QuoteForm({ source = 'quote' }: { source?: string }) {
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const t0 = useRef(Date.now());
  const hp = useRef<HTMLInputElement>(null);
  const p = (k: K) => ({ id: `f-${k}`, name: k, value: v[k], 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `e-${k}` : undefined, onChange: (e: { target: { value: string } }) => setV((o) => ({ ...o, [k]: e.target.value })) });

  async function submit(e: FormEvent) {
    e.preventDefault(); if (status === 'sending') return;
    const { errors: er } = validateInquiry(v); setErrors(er);
    const first = Object.keys(er)[0];
    if (first) { document.getElementById(`f-${first}`)?.focus(); return; }
    setStatus('sending'); track('inquiry_submit', { source, service: v.service, budget: v.budget });
    try {
      const r = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, website: hp.current?.value || '', startedAt: t0.current }) });
      if (r.status === 422) { const j = await r.json(); setErrors(j.errors || {}); setStatus('idle'); return; }
      if (!r.ok) throw new Error(String(r.status));
      setStatus('success'); setV(empty); track('inquiry_success', { source });
    } catch { setStatus('error'); track('inquiry_error', { source }); }
  }

  if (status === 'success') return <div className="ok" role="status">✅ Thank you! Your request is in. We will reply within 24 hours.</div>;
  return (
    <form onSubmit={submit} noValidate aria-label="Get a quote">
      <Field id="name" label="Your name" req error={errors.name}><input {...p('name')} maxLength={80} autoComplete="name" /></Field>
      <Field id="company" label="Company name" error={errors.company}><input {...p('company')} maxLength={100} autoComplete="organization" /></Field>
      <Field id="email" label="Email address" req error={errors.email}><input {...p('email')} type="email" maxLength={120} autoComplete="email" /></Field>
      <Field id="phone" label="Phone number" error={errors.phone}><input {...p('phone')} type="tel" maxLength={25} autoComplete="tel" /></Field>
      <Field id="service" label="Service" req error={errors.service}>
        <select {...p('service')}><option value="">Select a service…</option>{SERVICE_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
      </Field>
      <Field id="budget" label="Budget" req error={errors.budget}>
        <select {...p('budget')}><option value="">Select a budget…</option>{BUDGET_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
      </Field>
      <Field id="message" label="Your message" req error={errors.message}><textarea {...p('message')} rows={5} maxLength={2000} /></Field>
      <input ref={hp} className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" defaultValue="" />
      <button className="btn" type="submit" disabled={status === 'sending'}>{status === 'sending' ? '⏳ Sending…' : 'Send request 🍌'}</button>
      <div aria-live="polite">{status === 'error' && <div className="err" role="alert">❌ Something went wrong. Please try again or email hello@pixelatebanana.com.</div>}</div>
    </form>
  );
}
