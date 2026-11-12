import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { SERVICES } from '@/lib/content';
export const metadata = pageMeta('Services', 'Web and app development, AI automation and creative branding from PixelateBanana.', '/services');
export default function Services() {
  return (
    <div className="tech"><div className="wrap">
      <p style={{ fontSize: 13 }}>/services</p><h1>Three disciplines.<br />One clean system.</h1>
      <div style={{ marginTop: 50 }}>
        {SERVICES.map((s, i) => (
          <article className="svc" key={s.slug}><span className="n">0{i + 1}</span><div>
            <h2><Link href={`/services/${s.slug}`}>{s.title}</Link></h2><p>{s.intro}</p>
            <div className="tags">{s.items.map((it) => <span key={it.name}>{it.name}</span>)}</div>
          </div></article>
        ))}
      </div>
    </div></div>
  );
}
