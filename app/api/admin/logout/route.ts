import { COOKIE, cookieOptions, json, sameOrigin } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  const res = json({ ok: true });
  res.cookies.set(COOKIE, '', cookieOptions(0));
  return res;
}
