import crypto from 'node:crypto';
import { isAdmin, json, sameOrigin } from '@/lib/admin/auth';
import { makeParty, newPassword } from '@/lib/crm/auth';
import { addMessage, getMessages, getProject, listProjects, nextProjectNumber, saveProject, updateProject, type Project, type Role } from '@/lib/crm/store';
import { adminView } from '@/lib/crm/admin';
import { sendCrmInvite } from '@/lib/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const line = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const now = () => new Date().toISOString();
const note = (id: string, text: string) => addMessage(id, { from: 'system', name: 'System', text, at: now() });
const fail = (e: unknown) => { console.error('admin projects error', e); return json({ error: 'Could not save. Check the CRM storage settings (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).' }, 500); };

async function invite(p: Project, role: Role, password: string): Promise<boolean> {
  try { await sendCrmInvite({ to: p[role].email, name: p[role].name, role, project: p.title, password }); return true; }
  catch (e) { console.error('crm invite failed', role, e); return false; }
}

export async function GET(req: Request) {
  if (!isAdmin()) return json({ error: 'Unauthorized' }, 401);
  const id = new URL(req.url).searchParams.get('id');
  try {
    if (!id) return json({ projects: (await listProjects()).map(adminView) });
    const p = await getProject(id);
    if (!p) return json({ error: 'Project not found.' }, 404);
    return json({ project: adminView(p), messages: await getMessages(id) });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  if (!isAdmin()) return json({ error: 'Unauthorized' }, 401);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  try {
    if (b.action === undefined || b.action === 'create') {
      const title = line(b.title, 100), brief = line(b.brief, 600);
      const cName = line(b.clientName, 80), cMail = line(b.clientEmail, 200).toLowerCase();
      const sName = line(b.specialistName, 80), sMail = line(b.specialistEmail, 200).toLowerCase();
      if (title.length < 2) return json({ error: 'Project title is required.' }, 400);
      if (cName.length < 2 || sName.length < 2) return json({ error: 'Enter a name for the client and for the specialist.' }, 400);
      if (!EMAIL.test(cMail) || !EMAIL.test(sMail)) return json({ error: 'Enter a valid email address for the client and for the specialist.' }, 400);
      if (cMail === sMail) return json({ error: 'The client and the specialist need different email addresses.' }, 400);
      const pc = newPassword(), ps = newPassword();
      const p: Project = { id: crypto.randomBytes(8).toString('hex'), number: await nextProjectNumber(), title, brief, stage: 'specification', chat: 'open', created: now(), client: makeParty(cName, cMail, pc), specialist: makeParty(sName, sMail, ps) };
      await saveProject(p);
      await note(p.id, 'Project created. The specification is being agreed.');
      const [client, specialist] = await Promise.all([invite(p, 'client', pc), invite(p, 'specialist', ps)]);
      return json({ ok: true, id: p.id, mail: { client, specialist } });
    }

    const id = line(b.id, 40);
    const action = b.action;
    if (action === 'message') {
      const p = await getProject(id);
      if (!p) return json({ error: 'Project not found.' }, 404);
      if (p.chat !== 'open' || (p.stage !== 'specification' && p.stage !== 'design')) return json({ error: 'This conversation is closed.' }, 403);
      const text = String(b.text ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, 2000);
      if (!text) return json({ error: 'Write a message first.' }, 400);
      await addMessage(id, { from: 'admin', name: 'Admin', text, at: now() });
      return json({ ok: true });
    }
    if (action === 'resend') {
      const who = b.who === 'client' || b.who === 'specialist' ? [b.who] as Role[] : (['client', 'specialist'] as Role[]);
      const pw: Partial<Record<Role, string>> = {};
      const r = await updateProject(id, (p) => {
        if (p.stage === 'complete') return 'This project is complete, so its passwords have ended.';
        p.chat = 'open'; // a re-invite restores a revoked conversation; the messages are still there
        for (const role of who) { pw[role] = newPassword(); p[role] = { ...p[role], ...makeParty(p[role].name, p[role].email, pw[role] as string) }; }
        return p;
      });
      if ('error' in r) return json({ error: r.error }, 409);
      const mail: Partial<Record<Role, boolean>> = {};
      for (const role of who) mail[role] = await invite(r.project, role, pw[role] as string);
      return json({ ok: true, mail });
    }

    const steps: Record<string, { from: Project['stage'][]; to: Project['stage']; text: string }> = {
      'approve-spec': { from: ['specification'], to: 'design', text: 'The specification is approved. The specialist can now share design work and the client approves the design.' },
      'to-delivery': { from: ['production'], to: 'delivery', text: 'Production is finished. The project is now in delivery.' },
      complete: { from: ['specification', 'design', 'production', 'delivery'], to: 'complete', text: 'The project is complete. Passwords for this project have ended.' },
    };
    if (action === 'revoke') {
      const r = await updateProject(id, (p) => { if (p.chat === 'revoked') return 'The conversation is already revoked.'; p.chat = 'revoked'; return p; });
      if ('error' in r) return json({ error: r.error }, 409);
      await note(id, 'Admin revoked this conversation. The client and the specialist can no longer see or send messages.');
      return json({ ok: true });
    }
    const step = typeof action === 'string' ? steps[action] : undefined;
    if (!step) return json({ error: 'Invalid request' }, 400);
    const r = await updateProject(id, (p) => {
      if (!step.from.includes(p.stage)) return 'That step is not available at the current stage.';
      p.stage = step.to;
      if (step.to === 'complete') for (const role of ['client', 'specialist'] as Role[]) p[role] = { ...p[role], salt: '', hash: '' };
      return p;
    });
    if ('error' in r) return json({ error: r.error }, 409);
    await note(id, step.text);
    return json({ ok: true });
  } catch (e) { return fail(e); }
}
