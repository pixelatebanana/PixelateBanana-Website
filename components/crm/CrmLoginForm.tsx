'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/crm/shared';

export default function CrmLoginForm({ role }: { role: Role }) {
  const router = useRouter();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/crm/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, email: fd.get('email'), password: fd.get('password') }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || 'Login failed.'); return; }
      router.refresh();
    } catch { setErr('Network error. Please try again.'); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} aria-label={`${role} sign in`} style={{ marginTop: 30 }}>
      <p style={{ margin: 0 }}>Use the email address and one-time password from your project invitation. The password works until the project is complete.</p>
      <label>Email<input name="email" type="email" autoComplete="username" maxLength={200} required /></label>
      <label>One-time password<input name="password" type="password" autoComplete="current-password" maxLength={100} required /></label>
      <button className="btn" type="submit" disabled={busy}>{busy ? '⏳ Signing in…' : 'Sign in'}</button>
      <div aria-live="polite">{err && <div className="err" role="alert">{err}</div>}</div>
    </form>
  );
}
