import { track as vercelTrack } from '@vercel/analytics';
/** Events: cta_click, inquiry_submit, inquiry_success, inquiry_error. Pageviews come from <Analytics />. */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  try { vercelTrack(event, props); } catch { /* analytics must never break the UI */ }
}
