import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getProject, type Project, type Role } from '@/lib/crm/store';

export const CRM_SESSION_SECONDS = 12 * 60 * 60;
export const cookieName = (role: Role) => `pb_${role}`;
export const isRole = (v: unknown): v is Role => v === 'client' || v === 'specialist';

const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set (32+ characters)');
  return s;
};
const sign = (role: Role, payload: string) => crypto.createHmac('sha256', secret()).update(`crm.${role}.${payload}`).digest('base64url');

/** The one-time password: 12 characters, no look-alikes (0/O, 1/I/L). Shown nowhere; sent by email once. */
export function newPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 12 }, () => chars[crypto.randomInt(chars.length)]).join('');
}
export const hashPassword = (pw: string, salt: string) => crypto.scryptSync(pw.trim().toUpperCase(), salt, 32).toString('hex');
export function makeParty(name: string, email: string, password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { name, email, salt, hash: hashPassword(password, salt) };
}
export function passwordMatches(pw: string, salt: string, hash: string): boolean {
  if (!salt || !hash) return false;
  const a = Buffer.from(hashPassword(pw, salt), 'hex'), b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** A session is tied to one project and to the current password: a re-sent invite or a completed project ends it. */
export function createSession(role: Role, p: Project): string {
  const payload = Buffer.from(JSON.stringify({ p: p.id, v: p[role].hash.slice(0, 16), e: Date.now() + CRM_SESSION_SECONDS * 1000 })).toString('base64url');
  return `${payload}.${sign(role, payload)}`;
}
export async function getSession(role: Role): Promise<Project | null> {
  try {
    const token = cookies().get(cookieName(role))?.value;
    if (!token) return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const a = Buffer.from(sig), b = Buffer.from(sign(role, payload));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const d = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { p: string; v: string; e: number };
    if (!(d.e > Date.now())) return null;
    const p = await getProject(d.p);
    if (!p || p.stage === 'complete' || !p[role].hash || p[role].hash.slice(0, 16) !== d.v) return null;
    return p;
  } catch { return null; }
}

/** What a client or specialist may see: names and project status, never an email address. */
export type CrmView = { id: string; number: string; title: string; brief: string; stage: Project['stage']; chat: Project['chat']; me: string; other: string };
export const toView = (p: Project, role: Role): CrmView => ({
  id: p.id, number: p.number, title: p.title, brief: p.brief, stage: p.stage, chat: p.chat,
  me: p[role].name, other: p[role === 'client' ? 'specialist' : 'client'].name,
});
