'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const router = useRouter();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || 'Login failed.'); return; }
      router.refresh();
    } catch { setErr('Network error. Please try again.'); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} aria-label="Admin login" style={{ marginTop: 30 }}>
      <label>Username<input name="username" autoComplete="username" maxLength={100} required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" maxLength={200} required /></label>
      <button className="btn" type="submit" disabled={busy}>{busy ? '⏳ Signing in…' : 'Sign in'}</button>
      <div aria-live="polite">{err && <div className="err" role="alert">{err}</div>}</div>
    </form>
  );
}
