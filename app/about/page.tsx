import { pageMeta } from '@/lib/seo';
import Reveal from '@/components/animations/Reveal';
import CtaBand from '@/components/sections/CtaBand';
export const metadata = pageMeta('About', 'PixelateBanana is a small digital agency combining web, app, AI automation and brand work under one roof.', '/about');
const values = [['🍌', 'Ripe, not rushed', 'Clear scope, steady delivery and no surprises.'], ['🧱', 'Built to last', 'Reusable components, documentation and clean handover.'], ['🔒', 'Secure by default', 'Server-side validation and secrets kept out of the browser.']];
export default function About() {
  return (
    <>
      <div className="wrap page-pad">
        <Reveal><h1 className="big">About<br />us.</h1></Reveal>
        <p style={{ maxWidth: 680, fontSize: 18, marginTop: 24 }}>PixelateBanana brings web design and development, app development, AI automation and brand positioning together, so your product, workflow and story feel like one thing.</p>
        <div className="cards">{values.map(([e, t, d]) => <Reveal key={t} className="card"><span aria-hidden="true">{e}</span><h3>{t}</h3><p>{d}</p></Reveal>)}</div>
      </div>
      <CtaBand label="about" />
    </>
  );
}
