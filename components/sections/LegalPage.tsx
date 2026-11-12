export default function LegalPage({ title, updated, parts }: { title: string; updated: string; parts: [string, string][] }) {
  return (
    <div className="wrap page-pad tech"><h1>{title}</h1><p>Last updated: {updated}</p>
      <p className="note" role="note">Template text. Have it reviewed by a qualified professional before launch.</p>
      {parts.map(([h, t]) => <section key={h} style={{ margin: '28px 0' }}><h2 style={{ font: '700 20px var(--mono)', textTransform: 'none' }}>{h}</h2><p style={{ maxWidth: 720 }}>{t}</p></section>)}
    </div>
  );
}
