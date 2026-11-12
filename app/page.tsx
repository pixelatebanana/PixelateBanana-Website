import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/sections/Marquee';
import ServicesGrid from '@/components/sections/ServicesGrid';
import AboutHome from '@/components/sections/AboutHome';
import CtaBand from '@/components/sections/CtaBand';
import WorkCard from '@/components/cards/WorkCard';
import Reveal from '@/components/animations/Reveal';
import CtaLink from '@/components/ui/CtaLink';
import { WORK } from '@/lib/content';
export const metadata: Metadata = { alternates: { canonical: '/' } };
export default function Home() {
  return (
    <>
      <Hero /><Marquee />
      <section className="sec"><div className="wrap">
        <Reveal><h2 className="big">We make brands<br />go <mark style={{ background: 'var(--pink)' }}>bananas</mark>.</h2></Reveal>
        <ServicesGrid />
      </div></section>
      <section className="sec" style={{ background: 'var(--pink)' }}><div className="wrap">
        <Reveal><h2 className="big">Selected<br />work.</h2></Reveal>
        <div className="cards">{WORK.map((w) => <WorkCard key={w.slug} w={w} />)}</div>
        <p style={{ marginTop: 40 }}><CtaLink href="/work" variant="y" label="home_work">All case studies →</CtaLink></p>
      </div></section>
      <AboutHome />
      <CtaBand />
    </>
  );
}
