import { Fragment } from 'react';
import { pageMeta } from '@/lib/seo';
import PostCard from '@/components/cards/PostCard';
import AdSlot from '@/components/ui/AdSlot';
import { POSTS } from '@/lib/content';
export const metadata = pageMeta('Insights', 'Articles on web performance, AI automation and brand positioning from PixelateBanana.', '/insights');
export default function Insights() {
  return (
    <div className="wrap page-pad"><h1 className="big">Insights</h1>
      <div className="blog">
        <div style={{ marginTop: 30 }}>{POSTS.map((p, i) => <Fragment key={p.slug}><PostCard p={p} />{i < POSTS.length - 1 && <AdSlot placement="feed" />}</Fragment>)}</div>
        <aside className="side" aria-label="Advertisement"><AdSlot placement="sidebar" /></aside>
      </div>
    </div>
  );
}
