'use client';
import dynamic from 'next/dynamic';
const Banana = dynamic(() => import('./BananaScene'), { ssr: false, loading: () => <div className="gl-load" aria-hidden="true">🍌</div> });
export default function HeroScene() { return <Banana />; }
