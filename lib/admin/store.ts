import path from 'node:path';
import { BASE_POSTS, BASE_WORK, type Post, type Work } from '@/lib/content';

export type Extra = { work: Work[]; posts: Post[]; removed: { work: string[]; posts: string[] } };
export type Row = { slug: string; title: string; meta: string; source: 'built-in' | 'added' };

const FILE = 'data/admin-content.json';
const EMPTY = (): Extra => ({ work: [], posts: [], removed: { work: [], posts: [] } });
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const strs = (v: unknown) => arr<unknown>(v).filter((x): x is string => typeof x === 'string');
function norm(raw: unknown): Extra {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rm = (r.removed && typeof r.removed === 'object' ? r.removed : {}) as Record<string, unknown>;
  return { work: arr<Work>(r.work), posts: arr<Post>(r.posts), removed: { work: strs(rm.work), posts: strs(rm.posts) } };
}

/** Production: commit the JSON file to GitHub (Vercel then redeploys). Local dev: write the file directly. */
const gh = () => {
  const t = process.env.GITHUB_TOKEN, r = process.env.GITHUB_REPO;
  return t && r ? { t, r, b: process.env.GITHUB_BRANCH || 'main' } : null;
};
const headers = (t: string) => ({ Authorization: `Bearer ${t}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });

async function load(): Promise<{ data: Extra; sha?: string }> {
  const g = gh();
  if (g) {
    const r = await fetch(`https://api.github.com/repos/${g.r}/contents/${FILE}?ref=${encodeURIComponent(g.b)}`, { headers: headers(g.t), cache: 'no-store' });
    if (r.status === 404) return { data: EMPTY() };
    if (!r.ok) throw new Error('GitHub read failed: ' + r.status);
    const j = (await r.json()) as { content: string; sha: string };
    return { data: norm(JSON.parse(Buffer.from(j.content, 'base64').toString('utf8'))), sha: j.sha };
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Storage not configured: set GITHUB_TOKEN and GITHUB_REPO');
  const fs = await import('node:fs/promises');
  try { return { data: norm(JSON.parse(await fs.readFile(path.join(process.cwd(), FILE), 'utf8'))) }; } catch { return { data: EMPTY() }; }
}

/** Returns false when GitHub reports that the file changed in the meantime. */
async function save(data: Extra, sha: string | undefined, message: string): Promise<boolean> {
  const text = JSON.stringify(data, null, 2) + '\n';
  const g = gh();
  if (g) {
    const r = await fetch(`https://api.github.com/repos/${g.r}/contents/${FILE}`, {
      method: 'PUT',
      headers: { ...headers(g.t), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, content: Buffer.from(text).toString('base64'), branch: g.b, ...(sha ? { sha } : {}) }),
    });
    if (r.status === 409) return false;
    if (!r.ok) throw new Error('GitHub write failed: ' + r.status);
    return true;
  }
  const fs = await import('node:fs/promises');
  await fs.writeFile(path.join(process.cwd(), FILE), text, 'utf8');
  return true;
}

async function updateExtra(message: string, fn: (d: Extra) => Extra | string): Promise<{ ok: true } | { error: string }> {
  for (let i = 0; i < 3; i++) {
    const { data, sha } = await load();
    const next = fn(structuredClone(data));
    if (typeof next === 'string') return { error: next };
    if (await save(next, sha, message)) return { ok: true };
  }
  return { error: 'The content changed at the same time. Please try again.' };
}

function add<T extends { slug: string }>(key: 'work' | 'posts', base: T[], item: T) {
  return updateExtra(`admin: add ${key} ${item.slug}`, (d) => {
    const list = d[key] as unknown as T[];
    const taken = (s: string) => [...base, ...list].some((x) => x.slug === s) || d.removed[key].includes(s);
    let slug = item.slug;
    for (let n = 2; taken(slug); n++) slug = `${item.slug.slice(0, 70)}-${n}`;
    list.push({ ...item, slug });
    return d;
  });
}
export const addWork = (item: Work) => add('work', BASE_WORK, item);
export const addPost = (item: Post) => add('posts', BASE_POSTS, item);

export function removeItem(key: 'work' | 'posts', slug: string) {
  return updateExtra(`admin: remove ${key} ${slug}`, (d) => {
    const list = d[key] as unknown as { slug: string }[];
    const i = list.findIndex((x) => x.slug === slug);
    if (i >= 0) { list.splice(i, 1); return d; }
    const isBase = (key === 'work' ? BASE_WORK : BASE_POSTS).some((x) => x.slug === slug);
    if (!isBase || d.removed[key].includes(slug)) return 'Item not found.';
    d.removed[key].push(slug);
    return d;
  });
}

export async function getAdminLists(): Promise<{ work: Row[]; posts: Row[]; storage: 'github' | 'local file' }> {
  const { data } = await load();
  const work: Row[] = [
    ...BASE_WORK.filter((w) => !data.removed.work.includes(w.slug)).map((w) => ({ slug: w.slug, title: w.title, meta: w.category, source: 'built-in' as const })),
    ...data.work.map((w) => ({ slug: w.slug, title: w.title, meta: w.category, source: 'added' as const })),
  ];
  const posts: Row[] = [
    ...BASE_POSTS.filter((p) => !data.removed.posts.includes(p.slug)).map((p) => ({ slug: p.slug, title: p.title, meta: p.date, source: 'built-in' as const })),
    ...data.posts.map((p) => ({ slug: p.slug, title: p.title, meta: p.date, source: 'added' as const })),
  ];
  return { work, posts, storage: gh() ? 'github' : 'local file' };
}
