import Reveal from '../animations/Reveal';
import CtaLink from '../ui/CtaLink';
const values = [['🍌', 'Ripe, not rushed', 'Clear scope, steady delivery and no surprises.'], ['🧱', 'Built to last', 'Reusable components, documentation and clean handover.'], ['🔒', 'Secure by default', 'Server-side validation and secrets kept out of the browser.']];
export default function AboutHome() {
  return (
    <section className="sec"><div className="wrap">
      <div className="about-grid">
        <Reveal><h2 className="big">About<br />us.</h2></Reveal>
        <Reveal>
          <p className="lead">PixelateBanana brings web design and development, app development, AI automation and brand positioning together, so your product, workflow and story feel like one thing.</p>
          <CtaLink href="/about" variant="y" label="home_about">More about us →</CtaLink>
        </Reveal>
      </div>
      <div className="cards">{values.map(([e, t, d]) => <Reveal key={t} className="card"><span aria-hidden="true">{e}</span><h3>{t}</h3><p>{d}</p></Reveal>)}</div>
    </div></section>
  );
}
