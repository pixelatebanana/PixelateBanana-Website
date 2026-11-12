import { pageMeta } from '@/lib/seo';
import WorkCard from '@/components/cards/WorkCard';
import CtaBand from '@/components/sections/CtaBand';
import { WORK } from '@/lib/content';
export const metadata = pageMeta('Work', 'Concept case studies showing how PixelateBanana approaches web, app and AI automation projects.', '/work');
export default function Work() {
  return (
    <>
      <div className="wrap page-pad"><h1 className="big">Case<br />studies.</h1>
        <p className="note" role="note">These are concept projects created to demonstrate our process.</p>
        <div className="cards">{WORK.map((w) => <WorkCard key={w.slug} w={w} />)}</div>
      </div>
      <CtaBand label="work_index" />
    </>
  );
}
