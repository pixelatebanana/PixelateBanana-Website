import Link from 'next/link';
import Reveal from '../animations/Reveal';
import PixelArt from '../ui/PixelArt';
import UploadedImage from '../ui/UploadedImage';
import VisitButton from '../ui/VisitButton';
import type { Work } from '@/lib/content';
export default function WorkCard({ w }: { w: Work }) {
  return (
    <Reveal className="card">
      {w.image ? <UploadedImage src={w.image} label={`${w.title} artwork`} crop /> : <PixelArt seed={w.seed} label={`${w.title} concept artwork`} />}
      <span className="chip" style={{ marginTop: 14 }}>{w.category}</span><h3>{w.title}</h3><p>{w.challenge}</p>
      <Link href={`/work/${w.slug}`}><b>Read case study →</b></Link>
      {w.url && <div style={{ marginTop: 16 }}><VisitButton url={w.url} /></div>}
    </Reveal>
  );
}
