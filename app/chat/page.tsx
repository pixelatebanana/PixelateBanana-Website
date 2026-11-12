import { pageMeta } from '@/lib/seo';
import ChatForm from '@/components/forms/ChatForm';
export const metadata = pageMeta('Chat with us', 'Send PixelateBanana a quick message about your web, app, AI or brand project.', '/chat');
export default function Chat() {
  return (
    <div className="wrap page-pad"><h1 className="big">Chat<br />with us.</h1>
      <p style={{ margin: '20px 0 30px', maxWidth: 560 }}>Tell us a little about you and what you need. We reply within 24 hours.</p>
      <ChatForm source="chat" />
    </div>
  );
}
