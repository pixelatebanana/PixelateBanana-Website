import { json, sameOrigin } from '@/lib/admin/auth';
import { getSession, isRole, toView } from '@/lib/crm/auth';
import { addMessage, chatOpen, getMessages } from '@/lib/crm/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Messages for the signed-in client or specialist. A revoked conversation shows nothing. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const role = u.searchParams.get('role');
  if (!isRole(role)) return json({ error: 'Invalid request' }, 400);
  const p = await getSession(role);
  if (!p) return json({ error: 'Unauthorized' }, 401);
  const since = Math.max(0, Number(u.searchParams.get('since')) || 0);
  try {
    const messages = p.chat === 'revoked' ? [] : await getMessages(p.id, since);
    return json({ view: toView(p, role), open: chatOpen(p), messages, next: p.chat === 'revoked' ? 0 : since + messages.length });
  } catch (e) { console.error('crm chat read error', e); return json({ error: 'Could not load messages.' }, 500); }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  if (!isRole(b.role)) return json({ error: 'Invalid request' }, 400);
  const p = await getSession(b.role);
  if (!p) return json({ error: 'Unauthorized' }, 401);
  if (!chatOpen(p)) return json({ error: 'This conversation is closed.' }, 403);
  const text = String(b.text ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, 2000);
  if (!text) return json({ error: 'Write a message first.' }, 400);
  try { await addMessage(p.id, { from: b.role, name: p[b.role].name, text, at: new Date().toISOString() }); return json({ ok: true }); }
  catch (e) { console.error('crm chat write error', e); return json({ error: 'Could not send the message.' }, 500); }
}
