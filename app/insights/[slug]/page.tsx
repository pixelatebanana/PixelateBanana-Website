import { notFound } from 'next/navigation';
import { pageMeta } from '@/lib/seo';
import JsonLd from '@/components/ui/JsonLd';
import AdSlot from '@/components/ui/AdSlot';
import UploadedImage from '@/components/ui/UploadedImage';
import VisitButton from '@/components/ui/VisitButton';
import CtaBand from '@/components/sections/CtaBand';
import { POSTS } from '@/lib/content';
import { SITE } from '@/lib/site';
export const dynamicParams = false;
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = POSTS.find((x) => x.slug === params.slug);
  return p ? pageMeta(p.title, p.excerpt, `/insights/${p.slug}`) : {};
}
export default function Post({ params }: { params: { slug: string } }) {
  const p = POSTS.find((x) => x.slug === params.slug); if (!p) notFound();
  return (
    <>
      <article className="wrap page-pad">
        <time dateTime={p.date} style={{ fontFamily: 'var(--mono)' }}>{p.date}</time><h1 className="big" style={{ margin: '12px 0 30px' }}>{p.title}</h1>
        {p.image && <div style={{ maxWidth: 700, marginBottom: 24 }}><UploadedImage src={p.image} label={p.title} /></div>}
        {p.url && <p><VisitButton url={p.url} /></p>}
        {p.body.map((t, i) => <div key={i}><p style={{ maxWidth: 700, fontSize: 18 }}>{t}</p>{i === 0 && <AdSlot placement="article" />}</div>)}
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, author: { '@type': 'Organization', name: SITE.name }, mainEntityOfPage: `${SITE.url}/insights/${p.slug}` }} />
      </article>
      <CtaBand label={`post_${p.slug}`} />
    </>
  );
}
