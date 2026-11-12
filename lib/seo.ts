import type { Metadata } from 'next';
import { SITE } from './site';
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'website', siteName: SITE.name },
    twitter: { card: 'summary_large_image', title, description },
  };
}
