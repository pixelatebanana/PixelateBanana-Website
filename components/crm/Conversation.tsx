'use client';
import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/crm/shared';

const URL_RE = /(https?:\/\/[^\s<>"']+)/g;
/** Plain text with clickable links, so the specialist can share work (a Figma, Drive or staging link) without any HTML. */
function Linked({ text }: { text: string }) {
  return <>{text.split(URL_RE).map((part, i) => i % 2 ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part)}</>;
}
const label = (m: Message) => (m.from === 'admin' ? 'Admin' : m.from === 'system' ? 'System' : `${m.name} (${m.from})`);

export default function Conversation({ messages, mine, empty }: { messages: Message[]; mine?: Message['from']; empty: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = end.current?.parentElement; if (el) el.scrollTop = el.scrollHeight; }, [messages.length]);
  return (
    <div className="crm-chat" role="log" aria-live="polite" aria-label="Project conversation">
      {messages.length === 0 && <p className="crm-empty">{empty}</p>}
      {messages.map((m, i) => (
        <div key={i} className={`crm-msg ${m.from === 'system' ? 'sys' : m.from === mine ? 'me' : ''}`}>
          <small>{label(m)} · {new Date(m.at).toLocaleString()}</small>
          <p><Linked text={m.text} /></p>
        </div>
      ))}
      <div ref={end} />
    </div>
  );
}
