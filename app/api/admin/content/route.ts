import { isAdmin, json, sameOrigin } from '@/lib/admin/auth';
import { parsePost, parseWork } from '@/lib/admin/validate';
import { addPost, addWork, removeItem } from '@/lib/admin/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try { const b = await req.json(); return b && typeof b === 'object' ? (b as Record<string, unknown>) : null; } catch { return null; }
}
const fail = (e: unknown) => { console.error('admin content error', e); return json({ error: 'Could not save. Check the storage settings (GITHUB_TOKEN / GITHUB_REPO).' }, 500); };

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  if (!isAdmin()) return json({ error: 'Unauthorized' }, 401);
  const b = await readBody(req);
  if (!b || (b.type !== 'work' && b.type !== 'posts')) return json({ error: 'Invalid request' }, 400);
  const raw = b.item && typeof b.item === 'object' ? (b.item as Record<string, unknown>) : {};
  try {
    if (b.type === 'work') {
      const p = parseWork(raw); if ('error' in p) return json({ error: p.error }, 400);
      const r = await addWork(p.item); return 'error' in r ? json({ error: r.error }, 409) : json({ ok: true });
    }
    const p = parsePost(raw); if ('error' in p) return json({ error: p.error }, 400);
    const r = await addPost(p.item); return 'error' in r ? json({ error: r.error }, 409) : json({ ok: true });
  } catch (e) { return fail(e); }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  if (!isAdmin()) return json({ error: 'Unauthorized' }, 401);
  const b = await readBody(req);
  if (!b || (b.type !== 'work' && b.type !== 'posts') || typeof b.slug !== 'string' || !b.slug) return json({ error: 'Invalid request' }, 400);
  try { const r = await removeItem(b.type, b.slug); return 'error' in r ? json({ error: r.error }, 404) : json({ ok: true }); } catch (e) { return fail(e); }
}
