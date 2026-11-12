import type { Post, Work } from '@/lib/content';

const clean = (v: unknown, max: number, multi = false) => {
  const x = String(v ?? '');
  return (multi ? x.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '') : x.replace(/[\u0000-\u001f\u007f]/g, ' ')).trim().slice(0, max);
};
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
const IMAGE = /^\/uploads\/[a-z0-9-]+\.(?:png|jpg|webp|gif)$/;
/** Returns '' when empty, null when invalid, otherwise the normalised http(s) address. */
function cleanUrl(v: unknown): string | null {
  const x = String(v ?? '').trim();
  if (!x) return '';
  if (x.length > 300) return null;
  try { const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(x) ? x : 'https://' + x); return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.') ? u.href : null; } catch { return null; }
}
const cleanImage = (v: unknown) => { const x = String(v ?? '').trim(); return IMAGE.test(x) ? x : ''; };
type R<T> = { item: T } | { error: string };

export function parseWork(r: Record<string, unknown>): R<Work> {
  const title = clean(r.title, 80), category = clean(r.category, 60);
  const slug = clean(r.slug, 80).toLowerCase() || slugify(title);
  const [scenario, challenge, strategy, execution, value] = ['scenario', 'challenge', 'strategy', 'execution', 'value'].map((k) => clean(r[k], 1000, true));
  const deliverables = String(r.deliverables ?? '').split('\n').map((x) => clean(x, 100)).filter(Boolean).slice(0, 10);
  if (title.length < 2) return { error: 'Title is required.' };
  if (category.length < 2) return { error: 'Category is required.' };
  if (!SLUG.test(slug)) return { error: 'Slug may contain lowercase letters, numbers and hyphens only.' };
  if (!scenario || !challenge || !strategy || !execution || !value) return { error: 'Scenario, challenge, strategy, execution and business value are required.' };
  if (!deliverables.length) return { error: 'Add at least one deliverable (one per line).' };
  const url = cleanUrl(r.url);
  if (!url) return { error: url === null ? 'Enter a valid website URL (for example https://example.com).' : 'Website URL is required for a case study.' };
  const image = cleanImage(r.image);
  const images = (Array.isArray(r.images) ? r.images : []).map(cleanImage).filter(Boolean).slice(0, 12);
  const seed = ([...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % 90) + 4;
  return { item: { slug, title, category, concept: r.concept !== false, seed, scenario, challenge, strategy, execution, deliverables, value, url, ...(image ? { image } : {}), ...(images.length ? { images } : {}) } };
}

export function parsePost(r: Record<string, unknown>): R<Post> {
  const title = clean(r.title, 120), excerpt = clean(r.excerpt, 300), date = clean(r.date, 10);
  const slug = clean(r.slug, 80).toLowerCase() || slugify(title);
  const body = String(r.body ?? '').split(/\n\s*\n/).map((x) => clean(x, 2000, true)).filter(Boolean).slice(0, 20);
  if (title.length < 2) return { error: 'Title is required.' };
  if (!SLUG.test(slug)) return { error: 'Slug may contain lowercase letters, numbers and hyphens only.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) return { error: 'Date must be a real date in YYYY-MM-DD format.' };
  if (excerpt.length < 10) return { error: 'Excerpt is required (10+ characters).' };
  if (!body.length) return { error: 'Add at least one paragraph of body text (separate paragraphs with a blank line).' };
  const url = cleanUrl(r.url);
  if (url === null) return { error: 'Enter a valid website URL (for example https://example.com), or leave it empty.' };
  const image = cleanImage(r.image);
  return { item: { slug, title, date, excerpt, body, ...(url ? { url } : {}), ...(image ? { image } : {}) } };
}
