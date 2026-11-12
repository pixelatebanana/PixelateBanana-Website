import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { SERVICES, WORK, POSTS } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = ['', '/about', '/services', '/work', '/insights', '/contact', '/chat', '/start-a-project', '/privacy-policy', '/terms-of-service'];
  const paths = [...base, ...SERVICES.map((s) => '/services/' + s.slug), ...WORK.map((w) => '/work/' + w.slug), ...POSTS.map((p) => '/insights/' + p.slug)];
  return paths.map((p) => ({ url: SITE.url + p, lastModified: new Date() }));
}
