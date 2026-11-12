'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
export default function CtaLink({ href, label, variant = '', children }: { href: string; label: string; variant?: 'y' | ''; children: ReactNode }) {
  return <Link href={href} className={`btn ${variant}`.trim()} onClick={() => track('cta_click', { label, href })}>{children}</Link>;
}
