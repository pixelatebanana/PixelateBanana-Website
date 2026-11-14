import type { ReactNode } from 'react';
import PixelArt from '../ui/PixelArt';
import UploadedImage from '../ui/UploadedImage';
import VisitButton from '../ui/VisitButton';
import CtaBand from './CtaBand';
import type { Work } from '@/lib/content';
const Block = ({ title, children }: { title: string; children: ReactNode }) => <section className="cs"><h2>{title}</h2>{children}</section>;
export default function CaseStudy({ w }: { w: Work }) {
  return (
    <>
      <article className="wrap page-pad">
        {/* 1. Title and category */}
        <span className="chip">{w.category}</span><h1 className="big" style={{ marginTop: 14 }}>{w.title}</h1>
        {/* 2. Concept disclaimer */}
        {w.concept && <aside className="note" role="note">Concept project: created to demonstrate our process. It is not a real client engagement and results are not claimed.</aside>}
        {w.url && <p><VisitButton url={w.url} /></p>}
        {w.image ? <UploadedImage src={w.image} label={`${w.title} hero image`} /> : <PixelArt seed={w.seed} label={`${w.title} hero artwork`} />}
        <Block title="Business scenario"><p>{w.scenario}</p></Block>
        <Block title="The challenge"><p>{w.challenge}</p></Block>
        <Block title="Proposed strategy"><p>{w.strategy}</p></Block>
        <Block title="Creative & technical execution"><p>{w.execution}</p></Block>
        <Block title="Final deliverables"><ul>{w.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></Block>
        <Block title="Images & mockups"><div className="mock" style={w.images?.length ? { gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' } : undefined}>{w.images?.length ? w.images.slice(0, 3).map((src, i) => <UploadedImage key={src} src={src} label={`${w.title} picture ${i + 1}`} />) : [1, 2, 3].map((n) => <PixelArt key={n} seed={w.seed * 10 + n} label={`${w.title} mockup ${n}`} />)}</div></Block>
        <Block title="Intended business value"><p>{w.value}</p></Block>
      </article>
      {/* 10. Inquiry CTA */}
      <CtaBand label={`case_${w.slug}`} />
    </>
  );
}