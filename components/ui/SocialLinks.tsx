import { SOCIAL } from '@/lib/site';
const svg = { viewBox: '0 0 24 24', width: 22, height: 22, fill: 'none', stroke: '#fff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
export default function SocialLinks() {
  return (
    <div className="social">
      <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg {...svg}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="#fff" /></svg>
      </a>
      <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg {...svg}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 11v5M8 8v.01M12 16v-5M12 13c0-2 4-2.5 4 0v3" /></svg>
      </a>
      <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg {...svg}><path d="M3 21l1.6-4.8A9 9 0 1 1 8 19.4z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.6-2.2-1.3-1 .9c-1-.4-2-1.4-2.4-2.4l.9-1-1.3-2.2z" /></svg>
      </a>
    </div>
  );
}
