import path from 'node:path';

import type { Message, Project } from '@/lib/crm/shared';
export * from '@/lib/crm/shared';

/**
 * Storage. Chat needs a real database (every message would otherwise be a GitHub commit and a redeploy):
 * production uses Upstash Redis / Vercel KV over REST. Local development falls back to data/crm.json (git-ignored).
 */
const redisConf = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
};
export const crmStorage = (): 'redis' | 'local file' => (redisConf() ? 'redis' : 'local file');

async function redis(...args: (string | number)[]): Promise<unknown> {
  const c = redisConf(); if (!c) throw new Error('Redis not configured');
  const r = await fetch(c.url, { method: 'POST', headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args), cache: 'no-store' });
  if (!r.ok) throw new Error('CRM storage error ' + r.status);
  const j = (await r.json()) as { result?: unknown; error?: string };
  if (j.error) throw new Error('CRM storage error: ' + j.error);
  return j.result;
}

type FileData = { projects: Record<string, Project>; messages: Record<string, Message[]>; counter?: number };
const FILE = 'data/crm.json';
let chain: Promise<unknown> = Promise.resolve();
async function withFile<T>(fn: (d: FileData) => T | Promise<T>, write: boolean): Promise<T> {
  if (process.env.NODE_ENV === 'production') throw new Error('CRM storage not configured: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
  const run = async () => {
    const fs = await import('node:fs/promises');
    const file = path.join(process.cwd(), FILE);
    let d: FileData = { projects: {}, messages: {} };
    try { const raw = JSON.parse(await fs.readFile(file, 'utf8')) as Partial<FileData>; d = { projects: raw.projects || {}, messages: raw.messages || {}, counter: raw.counter }; } catch { /* first run */ }
    const out = await fn(d);
    if (write) await fs.writeFile(file, JSON.stringify(d, null, 2) + '\n', 'utf8');
    return out;
  };
  const next = chain.then(run, run);
  chain = next.catch(() => undefined);
  return next;
}

const parse = <T>(v: unknown): T | null => { try { return typeof v === 'string' ? (JSON.parse(v) as T) : null; } catch { return null; } };

export async function listProjects(): Promise<Project[]> {
  let all: Project[];
  if (redisConf()) {
    const ids = ((await redis('SMEMBERS', 'crm:projects')) as string[]) || [];
    const rows = ids.length ? ((await redis('MGET', ...ids.map((i) => `crm:project:${i}`))) as unknown[]) : [];
    all = rows.map((r) => parse<Project>(r)).filter((x): x is Project => !!x);
  } else all = await withFile((d) => Object.values(d.projects), false);
  return all.sort((a, b) => b.created.localeCompare(a.created));
}
export async function getProject(id: string): Promise<Project | null> {
  if (!/^[a-f0-9]{16}$/.test(id)) return null;
  if (redisConf()) return parse<Project>(await redis('GET', `crm:project:${id}`));
  return withFile((d) => d.projects[id] || null, false);
}
export async function saveProject(p: Project): Promise<void> {
  if (redisConf()) { await redis('SET', `crm:project:${p.id}`, JSON.stringify(p)); await redis('SADD', 'crm:projects', p.id); return; }
  await withFile((d) => { d.projects[p.id] = p; }, true);
}
export async function updateProject(id: string, fn: (p: Project) => Project | string): Promise<{ project: Project } | { error: string }> {
  const p = await getProject(id);
  if (!p) return { error: 'Project not found.' };
  const next = fn(structuredClone(p));
  if (typeof next === 'string') return { error: next };
  await saveProject(next);
  return { project: next };
}
export async function addMessage(id: string, m: Message): Promise<void> {
  if (redisConf()) { await redis('RPUSH', `crm:messages:${id}`, JSON.stringify(m)); return; }
  await withFile((d) => { (d.messages[id] ||= []).push(m); }, true);
}
/** Messages from position `from` onward (0 = all). */
export async function getMessages(id: string, from = 0): Promise<Message[]> {
  const start = Math.max(0, Math.floor(from));
  if (redisConf()) return (((await redis('LRANGE', `crm:messages:${id}`, start, -1)) as unknown[]) || []).map((r) => parse<Message>(r)).filter((x): x is Message => !!x);
  return withFile((d) => (d.messages[id] || []).slice(start), false);
}

/** Next unique project number: PB-001, PB-002, PB-003 and so on. */
export async function nextProjectNumber(): Promise<string> {
  const n = redisConf() ? Number(await redis('INCR', 'crm:counter')) : await withFile((d) => (d.counter = (d.counter || 0) + 1), true);
  return `PB-${String(n).padStart(3, '0')}`;
}
