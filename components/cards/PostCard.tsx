import Link from 'next/link';
import Reveal from '../animations/Reveal';
import UploadedImage from '../ui/UploadedImage';
import type { Post } from '@/lib/content';
export default function PostCard({ p }: { p: Post }) {
  return (
    <Reveal className="post">{p.image && <div style={{ marginBottom: 14 }}><UploadedImage src={p.image} label={p.title} crop /></div>}<time dateTime={p.date}>{p.date}</time><h2><Link href={`/insights/${p.slug}`}>{p.title}</Link></h2><p>{p.excerpt}</p></Reveal>
  );
}
