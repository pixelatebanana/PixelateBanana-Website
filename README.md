# PixelateBanana (Next.js 14, App Router, TypeScript)

## Structure
`app/` routes and API · `components/{navigation,sections,cards,forms,animations,ui}` · `lib/` content, SEO, validation, mail, analytics · `styles/globals.css` · `public/{brand,projects,images}`.

## Run
```
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
npm run typecheck && npm run build
```

## Where things live
- **Edit copy/services/case studies/posts:** `lib/content.ts`. New case study = add one object; page, sitemap and metadata follow automatically.
- **Quote form:** `components/forms/QuoteForm.tsx` (UI) + `app/api/inquiry/route.ts` (server validation, honeypot, timing check, rate limit) + `lib/validation.ts` (shared rules).
- **Chat form:** `app/chat/page.tsx` + `components/forms/ChatForm.tsx` + `app/api/chat/route.ts` (name, company, contact info, message; same protections as the quote form).
- **Google Sheets (optional):** `lib/sheets.ts`. Set `GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` in `.env.local` / Vercel. Share the Sheet with the service-account email (Editor). Tabs `Quotes` and `Chat`, row 1: Time, Name, Company, Contact, Phone, Service, Budget, Message. Works alongside Resend email, or on its own.
- **Social links:** `SOCIAL` in `lib/site.ts` (placeholders: replace with your real profiles).
- **Secrets:** `RESEND_API_KEY`, `INQUIRY_FROM`, `INQUIRY_TO` are server-only env vars. Never prefix them with `NEXT_PUBLIC_`.
- **Analytics:** `<Analytics />` in `app/layout.tsx` for traffic. Custom events: `cta_click`, `inquiry_submit`, `inquiry_success`, `inquiry_error` (`lib/analytics.ts`). Enable Web Analytics in the Vercel project.
- **SEO:** per-page `pageMeta()` (title, description, canonical, OpenGraph), `app/sitemap.ts`, `app/robots.ts`, JSON-LD. Set `NEXT_PUBLIC_SITE_URL`.
- **AdSense:** three placements, one ad unit each (`sidebar`, `feed`, `article` in `components/ui/AdSlot.tsx`). Set `NEXT_PUBLIC_ADSENSE_CLIENT` plus `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR / _FEED / _ARTICLE`. Empty slot IDs render nothing in production. Ads and the AdSense script load only after the visitor accepts the consent banner (`components/ui/ConsentBanner.tsx`, `lib/consent.ts`). For EU/UK traffic Google requires a certified consent tool: turn on Google's *Privacy & messaging* in AdSense and set `NEXT_PUBLIC_CONSENT_MODE=google`. Update `public/ads.txt` after approval.
- **Admin uploads and links:** `/login/admin` forms take an optional image (PNG/JPG/WebP/GIF up to 4 MB, committed to `public/uploads/`) and a website URL (required for case studies, optional for insights). A URL adds a "Visit website" button on that case study / insight. Code: `lib/admin/upload.ts`, `app/api/admin/upload/route.ts`, `lib/admin/validate.ts`.
- **Project dashboards (CRM):** `/login/admin/live-projects` (admin adds a project with the client and specialist emails; invites with one-time passwords are emailed; admin monitors chats, advances stages, revokes the conversation) and `/login/client/dashboard`, `/login/specialist/dashboard` (not linked anywhere on the site). Flow: specification, design, production, delivery, complete. Chat is open only during specification and design; the client approving the design closes it. Passwords end when the project is complete. Code: `lib/crm/*`, `components/crm/*`, `app/api/crm/*`, `app/api/admin/projects`. Needs `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in production.
- **Images:** the demo uses generated pixel SVGs. Put real images in `public/projects/` and use `next/image` (AVIF/WebP, lazy-loaded).
- **Accessibility:** skip link, visible focus, labelled form fields with error text, `prefers-reduced-motion` support.

## Deploy
Push to GitHub, import the repo at vercel.com/new (framework: Next.js, defaults), add the env vars, deploy. Every push to `main` redeploys.

## Notes
All case studies are concept projects and are labelled as such. Legal pages are templates: have them reviewed. The in-memory rate limiter is best-effort; use Vercel KV/Upstash for strict limits.
