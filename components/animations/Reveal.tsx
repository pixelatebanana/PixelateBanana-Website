'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver((e) => e.forEach((x) => { if (x.isIntersecting) { el.classList.add('in'); io.disconnect(); } }), { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`.trim()}>{children}</div>;
}
