import crypto from 'node:crypto';
import path from 'node:path';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // stays under the ~4.5 MB request limit on Vercel

/** Identify the image by its first bytes, never by the file name or the browser's claim. */
export function imageExt(b: Buffer): 'png' | 'jpg' | 'gif' | 'webp' | null {
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 6 && b.subarray(0, 4).toString('latin1') === 'GIF8') return 'gif';
  if (b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

/** Production: commit the file to GitHub under public/uploads (Vercel then redeploys). Local dev: write it directly. */
export async function saveImage(buf: Buffer, ext: string): Promise<string> {
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(5).toString('hex')}.${ext}`;
  const t = process.env.GITHUB_TOKEN, r = process.env.GITHUB_REPO;
  if (t && r) {
    const res = await fetch(`https://api.github.com/repos/${r}/contents/public/uploads/${name}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${t}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `admin: upload image ${name}`, content: buf.toString('base64'), branch: process.env.GITHUB_BRANCH || 'main' }),
    });
    if (!res.ok) throw new Error('GitHub image upload failed: ' + res.status);
  } else {
    if (process.env.NODE_ENV === 'production') throw new Error('Storage not configured: set GITHUB_TOKEN and GITHUB_REPO');
    const fs = await import('node:fs/promises');
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
  }
  return `/uploads/${name}`;
}
