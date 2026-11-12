import Link from 'next/link';
import Reveal from '../animations/Reveal';
import type { Service } from '@/lib/content';
export default function ServiceCard({ s }: { s: Service }) {
  return (
    <Reveal className={`card${s.slug === 'creative-branding' ? ' feature' : ''}`}><span aria-hidden="true">{s.emoji}</span><h3>{s.title}</h3><p>{s.intro}</p><Link href={`/services/${s.slug}`}><b>Explore →</b></Link></Reveal>
  );
}
