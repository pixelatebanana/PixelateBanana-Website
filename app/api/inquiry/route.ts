import { NextResponse } from 'next/server';
import { validateInquiry } from '@/lib/validation';
import { sendInquiry, mailConfigured } from '@/lib/mail';
import { appendRow, sheetsConfigured } from '@/lib/sheets';

export const runtime = 'nodejs';
const hits = new Map<string, number[]>(); // best-effort limiter; use Upstash/Vercel KV for strict limits at scale
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== req.headers.get('host')) return json({ error: 'Forbidden' }, 403);
  } catch { return json({ error: 'Forbidden' }, 403); }
  if (Number(req.headers.get('content-length') || 0) > 10000) return json({ error: 'Payload too large' }, 413);

  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000);
  if (recent.length >= 5) return json({ error: 'Too many requests' }, 429);
  hits.set(ip, [...recent, now]);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  if (body.website) return json({ ok: true });                                           // honeypot filled: bot
  if (typeof body.startedAt !== 'number' || now - body.startedAt < 2500) return json({ ok: true }); // submitted too fast: bot

  const { data, errors } = validateInquiry(body);
  if (Object.keys(errors).length) return json({ errors }, 422);
  const mail = mailConfigured(), sheet = sheetsConfigured();
  try {
    if (!mail && !sheet) throw new Error('Mail environment variables are missing');
    if (mail) await sendInquiry(data);
    if (sheet) {
      try { await appendRow('Quotes', [data.name, data.company, data.email, data.phone, data.service, data.budget, data.message]); }
      catch (e) { console.error('sheet append failed', e); if (!mail) throw e; } // sheet is a bonus when mail works
    }
    return json({ ok: true });
  } catch (e) { console.error('inquiry failed', e); return json({ error: 'Send failed' }, 502); }
}
