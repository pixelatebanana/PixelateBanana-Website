import { cookieOptions, json, sameOrigin } from '@/lib/admin/auth';
import { cookieName, isRole } from '@/lib/crm/auth';

export const runtime = 'nodejs';
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  let role: unknown; try { role = (await req.json()).role; } catch { role = undefined; }
  if (!isRole(role)) return json({ error: 'Invalid request' }, 400);
  const res = json({ ok: true });
  res.cookies.set(cookieName(role), '', cookieOptions(0));
  return res;
}
