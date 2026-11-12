import { notFound } from 'next/navigation';
import CaseStudy from '@/components/sections/CaseStudy';
import { pageMeta } from '@/lib/seo';
import { WORK } from '@/lib/content';
export const dynamicParams = false;
export function generateStaticParams() { return WORK.map((w) => ({ slug: w.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const w = WORK.find((x) => x.slug === params.slug);
  return w ? pageMeta(`${w.title}: ${w.category}`, w.challenge, `/work/${w.slug}`) : {};
}
export default function Page({ params }: { params: { slug: string } }) {
  const w = WORK.find((x) => x.slug === params.slug); if (!w) notFound();
  return <CaseStudy w={w} />;
}
