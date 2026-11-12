import { isAdmin, json, sameOrigin } from '@/lib/admin/auth';
import { imageExt, MAX_IMAGE_BYTES, saveImage } from '@/lib/admin/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  if (!isAdmin()) return json({ error: 'Unauthorized' }, 401);
  let file: unknown;
  try { file = (await req.formData()).get('file'); } catch { return json({ error: 'Invalid upload.' }, 400); }
  if (!(file instanceof File) || file.size === 0) return json({ error: 'Choose an image to upload.' }, 400);
  if (file.size > MAX_IMAGE_BYTES) return json({ error: 'Image is too large (4 MB maximum).' }, 413);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = imageExt(buf);
  if (!ext) return json({ error: 'Use a PNG, JPG, WebP or GIF image.' }, 400);
  try { return json({ ok: true, path: await saveImage(buf, ext) }); }
  catch (e) { console.error('admin upload error', e); return json({ error: 'Could not save the image. Check the storage settings (GITHUB_TOKEN / GITHUB_REPO).' }, 500); }
}
