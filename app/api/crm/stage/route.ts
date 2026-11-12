import { json, sameOrigin } from '@/lib/admin/auth';
import { getSession } from '@/lib/crm/auth';
import { addMessage, updateProject } from '@/lib/crm/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Only the client can act here: approving the design moves the project to production and closes the chat. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  if (b.action !== 'approve-design') return json({ error: 'Invalid request' }, 400);
  const p = await getSession('client');
  if (!p) return json({ error: 'Unauthorized' }, 401);
  try {
    const r = await updateProject(p.id, (x) => {
      if (x.stage !== 'design' || x.chat !== 'open') return 'The design can only be approved while the design stage is open.';
      x.stage = 'production'; return x;
    });
    if ('error' in r) return json({ error: r.error }, 409);
    await addMessage(p.id, { from: 'system', name: 'System', text: `${p.client.name} approved the design. The project moves to production and this conversation is now closed.`, at: new Date().toISOString() });
    return json({ ok: true });
  } catch (e) { console.error('crm stage error', e); return json({ error: 'Could not save. Please try again.' }, 500); }
}
