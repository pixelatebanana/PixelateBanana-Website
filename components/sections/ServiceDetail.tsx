import { notFound } from 'next/navigation';
import CtaLink from '../ui/CtaLink';
import { SERVICES } from '@/lib/content';
export default function ServiceDetail({ slug }: { slug: string }) {
  const s = SERVICES.find((x) => x.slug === slug); if (!s) notFound();
  return (
    <div className="tech"><div className="wrap">
      <p style={{ fontSize: 13 }}>/services/{s.slug}</p><h1>{s.title}</h1><p style={{ maxWidth: 560 }}>{s.intro}</p>
      <div style={{ margin: '40px 0' }}>
        {s.items.map((it, i) => (
          <article className="svc" key={it.name}><span className="n">0{i + 1}</span><div>
            <h2>{it.name}</h2><p>{it.text}</p><div className="tags">{it.tags.map((t) => <span key={t}>{t}</span>)}</div>
          </div></article>
        ))}
      </div>
      <CtaLink href="/start-a-project" variant="y" label={`service_${s.slug}`}>Request a quote</CtaLink>
    </div></div>
  );
}
