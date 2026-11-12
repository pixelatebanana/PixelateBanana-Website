import Reveal from '../animations/Reveal';
import CtaLink from '../ui/CtaLink';
export default function CtaBand({ label = 'cta_band' }: { label?: string }) {
  return (
    <section className="sec" style={{ background: 'var(--banana)' }}><div className="wrap">
      <Reveal><h2 className="big">Got an idea?<br />Let&apos;s peel it.</h2></Reveal>
      <p style={{ marginTop: 30 }}><CtaLink href="/start-a-project" label={label}>Get a quote →</CtaLink></p>
    </div></section>
  );
}
