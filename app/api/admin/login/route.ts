import { checkCredentials, cookieOptions, COOKIE, createSession, json, SESSION_SECONDS, sameOrigin } from '@/lib/admin/auth';

export const runtime = 'nodejs';
const fails = new Map<string, number[]>(); // best-effort limiter: 5 failed attempts per 15 minutes per IP

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (fails.get(ip) || []).filter((t) => now - t < 900000);
  if (recent.length >= 5) return json({ error: 'Too many attempts. Try again later.' }, 429);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const user = String(body.username ?? '').slice(0, 100), pass = String(body.password ?? '').slice(0, 200);

  let ok = false;
  try { ok = checkCredentials(user, pass); } catch { ok = false; }
  if (!ok) {
    fails.set(ip, [...recent, now]);
    await new Promise((r) => setTimeout(r, 500));
    return json({ error: 'Invalid username or password.' }, 401);
  }
  let token: string;
  try { token = createSession(); } catch { return json({ error: 'Admin is not configured on the server.' }, 500); }
  fails.delete(ip);
  const res = json({ ok: true });
  res.cookies.set(COOKIE, token, cookieOptions(SESSION_SECONDS));
  return res;
}
