import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const COOKIE = 'pb_admin';
export const SESSION_SECONDS = 2 * 60 * 60;

const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set (32+ characters)');
  return s;
};
const sign = (p: string) => crypto.createHmac('sha256', secret()).update(p).digest('base64url');
const digest = (x: string) => crypto.createHash('sha256').update(x).digest();

export function checkCredentials(user: string, pass: string): boolean {
  const u = process.env.ADMIN_USERNAME, p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return false;
  const a = crypto.timingSafeEqual(digest(user), digest(u));
  const b = crypto.timingSafeEqual(digest(pass), digest(p));
  return a && b;
}
export function createSession(): string {
  const exp = String(Date.now() + SESSION_SECONDS * 1000);
  return `${exp}.${sign(exp)}`;
}
export function verifySession(token?: string): boolean {
  try {
    if (!token) return false;
    const [exp, sig] = token.split('.');
    if (!exp || !sig) return false;
    const a = Buffer.from(sig), b = Buffer.from(sign(exp));
    return a.length === b.length && crypto.timingSafeEqual(a, b) && Number(exp) > Date.now();
  } catch { return false; }
}
export function isAdmin(): boolean { return verifySession(cookies().get(COOKIE)?.value); }

/** State-changing requests must come from this site (the cookie is also SameSite=Strict). */
export function sameOrigin(req: Request): boolean {
  try { const o = req.headers.get('origin'); return !!o && new URL(o).host === req.headers.get('host'); } catch { return false; }
}
export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export const cookieOptions = (maxAge: number) => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge });
