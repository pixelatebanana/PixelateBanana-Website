import CtaLink from '../ui/CtaLink';
import HeroScene from '../animations/HeroScene';
export default function Hero() {
  return (
    <header className="hero"><HeroScene />
      <div className="wrap">
        <h1>Ripe<br />digital<br />work.</h1>
        <p>We design, build &amp; automate. Websites, apps, AI workflows and brands, pixel-perfect and peel-fast.</p>
        <CtaLink href="/start-a-project" label="hero_quote">Get a quote →</CtaLink> <CtaLink href="/chat" variant="y" label="hero_chat">Chat with us 💬</CtaLink>
      </div>
    </header>
  );
}
