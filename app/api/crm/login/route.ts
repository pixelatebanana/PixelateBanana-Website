import { cookieOptions, json, sameOrigin } from '@/lib/admin/auth';
import { cookieName, createSession, CRM_SESSION_SECONDS, hashPassword, isRole, passwordMatches } from '@/lib/crm/auth';
import { listProjects } from '@/lib/crm/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const fails = new Map<string, number[]>(); // best-effort limiter: 5 failed attempts per 15 minutes per IP

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (fails.get(ip) || []).filter((t) => now - t < 900000);
  if (recent.length >= 5) return json({ error: 'Too many attempts. Try again later.' }, 429);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  if (!isRole(body.role)) return json({ error: 'Invalid request' }, 400);
  const role = body.role;
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 200), pass = String(body.password ?? '').slice(0, 100);

  let match = null as Awaited<ReturnType<typeof listProjects>>[number] | null;
  try {
    const all = await listProjects();
    for (const p of all) {
      if (p.stage !== 'complete' && email && p[role].email.toLowerCase() === email && passwordMatches(pass, p[role].salt, p[role].hash)) { match = p; break; }
    }
    if (!match) hashPassword(pass, 'dummy-salt'); // keep timing similar when nothing matches
  } catch (e) { console.error('crm login error', e); return json({ error: 'The project dashboard is not available right now.' }, 500); }

  if (!match) {
    fails.set(ip, [...recent, now]);
    await new Promise((r) => setTimeout(r, 500));
    return json({ error: 'Invalid email or password, or the project is already complete.' }, 401);
  }
  let token: string;
  try { token = createSession(role, match); } catch { return json({ error: 'The dashboard is not configured on the server.' }, 500); }
  fails.delete(ip);
  const res = json({ ok: true });
  res.cookies.set(cookieName(role), token, cookieOptions(CRM_SESSION_SECONDS));
  return res;
}
