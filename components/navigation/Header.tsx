'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV, SITE } from '@/lib/site';
export default function Header() {
  const p = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); }, [p]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('click', away);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('click', away); };
  }, [open]);
  const back = () => { if (window.history.length > 1) router.back(); else router.push('/'); };
  return (
    <nav aria-label="Main" ref={ref}>
      <div className="wrap">
        <div className="brand">
          {p !== '/' && <button id="back" type="button" aria-label="Go back to previous page" title="Back" onClick={back}>←</button>}
          <Link className="logo" href="/">{SITE.name}</Link>
        </div>
        <div className="links">
          <Link href="/start-a-project" className="quote">Get a quote</Link>
          <button id="menu" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="menu-panel" onClick={() => setOpen((o) => !o)}><i /><i /><i /></button>
        </div>
      </div>
      <div id="menu-panel" className={`menu${open ? ' open' : ''}`}><div className="wrap">
        {NAV.map(([l, h]) => { const on = p === h || (h !== '/' && p.startsWith(h + '/')); return <Link key={h} href={h} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>{l}</Link>; })}
      </div></div>
    </nav>
  );
}
