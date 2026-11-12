import { pageMeta } from '@/lib/seo';
import QuoteForm from '@/components/forms/QuoteForm';
export const metadata = pageMeta('Get a quote', 'Tell PixelateBanana about your project and get a tailored quote for web, app, AI or brand work.', '/start-a-project');
export default function StartAProject() {
  return (
    <div className="wrap page-pad"><h1 className="big">Get a<br />quote.</h1>
      <div className="grid2" style={{ marginTop: 30 }}>
        <QuoteForm source="start-a-project" />
        <aside className="card"><h3>What happens next</h3><ol><li>We read your brief within 24 hours.</li><li>We reply with questions or a call invite.</li><li>You receive a scoped quote and timeline.</li></ol></aside>
      </div>
    </div>
  );
}
