import adminData from '@/data/admin-content.json';
export type ServiceItem = { name: string; text: string; tags: string[] };
export type Service = { slug: string; title: string; emoji: string; intro: string; items: ServiceItem[] };
export type Work = { slug: string; title: string; category: string; concept: boolean; seed: number; scenario: string; challenge: string; strategy: string; execution: string; deliverables: string[]; value: string; image?: string; images?: string[]; url?: string };
export type Post = { slug: string; title: string; date: string; excerpt: string; body: string[]; image?: string; url?: string };

export const SERVICES: Service[] = [
  { slug: 'website-apps', title: 'We Design & Develop', emoji: '🖥️', intro: 'We create web, cross-platform & native app with cyber security being our first priority.', items: [
    { name: 'Web design & development', text: 'Fast, accessible marketing sites, e-commerce and web apps built for search and speed.', tags: ['UX/UI', 'Next.js', 'SEO', 'CMS'] },
    { name: 'App development', text: 'Cross-platform and native apps with secure APIs and analytics from day one.', tags: ['iOS', 'Android', 'React Native', 'API'] },
    { name: 'Security first', text: 'Secure-by-default architecture, validation and secrets handling in every build.', tags: ['Auth', 'Encryption', 'Audits'] } ] },
  { slug: 'ai-automation', title: 'AI Automation & Workflow', emoji: '🤖', intro: 'Agents, integrations and pipelines that remove repetitive work.', items: [
    { name: 'AI agents & chatbots', text: 'Assistants that triage, answer and route work around the clock.', tags: ['LLM agents', 'Chatbots'] },
    { name: 'Integrations', text: 'CRM, email and internal tools connected into one flow.', tags: ['CRM sync', 'APIs', 'n8n'] },
    { name: 'Workflow automation', text: 'Reporting and approvals that run themselves.', tags: ['Pipelines', 'Reports'] } ] },
  { slug: 'creative-branding', title: 'Creative & Branding', emoji: '🎨', intro: 'Visual content and positioning that make you easy to choose and hard to forget.', items: [
    { name: 'Campaign visuals', text: 'Key art, ads and landing visuals with a consistent look.', tags: ['Art direction', 'Ads', 'Layout'] },
    { name: 'Motion & social content', text: 'Short-form video, animation and social templates.', tags: ['Motion', 'Reels', 'Templates'] },
    { name: 'Pixel illustration & icons', text: 'Custom pixel-inspired graphics and icon sets.', tags: ['Illustration', 'Icons', 'Pixel art'] },
    { name: 'Brand positioning', text: 'Audience, promise and difference, written down and tested.', tags: ['Research', 'Positioning', 'Workshops'] },
    { name: 'Identity systems', text: 'Logo, colour, type and usage guidelines ready for teams.', tags: ['Logo', 'Colour', 'Typography'] },
    { name: 'Messaging & tone', text: 'Taglines, voice and key messages for every touchpoint.', tags: ['Voice', 'Copy', 'Naming'] } ] },
];

export const BASE_WORK: Work[] = [
  { slug: 'fruitly-store-redesign', title: 'Fruitly', category: 'E-commerce redesign', concept: true, seed: 1,
    scenario: 'A fictional fresh-produce subscription brand with a dated store and a checkout that lost shoppers on mobile.',
    challenge: 'Slow pages, cluttered navigation and a seven-step checkout made repeat ordering harder than it should be.',
    strategy: 'Simplify the catalogue, cut checkout to three steps and lead with fast, mobile-first pages.',
    execution: 'Headless storefront on Next.js, a componentised design system, optimised imagery and structured product data for search.',
    deliverables: ['UX audit', 'Design system', 'Storefront build', 'SEO and analytics setup'],
    value: 'Intended to lift mobile conversion and repeat orders by making the path to checkout short and fast.' },
  { slug: 'orbit-pay-app', title: 'Orbit Pay', category: 'Fintech mobile app', concept: true, seed: 2,
    scenario: 'A fictional payments start-up preparing its first mobile app for everyday money transfers.',
    challenge: 'Users distrust unfamiliar finance apps, so onboarding had to feel safe, quick and clear.',
    strategy: 'Build trust through plain language, visible security cues and a two-minute onboarding.',
    execution: 'Cross-platform app with secure API design, biometric sign-in, clear empty states and event analytics.',
    deliverables: ['Product flows', 'UI kit', 'Mobile app build', 'API documentation'],
    value: 'Intended to raise onboarding completion and early activation while keeping security front and centre.' },
  { slug: 'nimbus-ops-automation', title: 'Nimbus Ops', category: 'AI workflow automation', concept: true, seed: 3,
    scenario: 'A fictional operations team drowning in support tickets and manual hand-offs between tools.',
    challenge: 'Triage, routing and reporting consumed hours every week and delayed customer replies.',
    strategy: 'Automate the repeatable steps, keep humans on judgement calls and measure time saved.',
    execution: 'AI triage agent, CRM and helpdesk integrations, approval steps and a weekly auto-generated report.',
    deliverables: ['Process map', 'Automation workflows', 'Agent configuration', 'Team handover guide'],
    value: 'Intended to cut manual handling time and shorten first-response time for customers.' },
];

export const BASE_POSTS: Post[] = [
  { slug: 'website-speed-is-seo', title: 'Why site speed is your best SEO move', date: '2026-10-20', excerpt: 'Fast pages rank better, convert better and cost less to serve.', body: [
    'Core Web Vitals measure how quickly a page loads, responds and stays stable. Search engines and visitors both notice when those numbers are poor.',
    'Start with the basics: compress and lazy-load images, ship less JavaScript and serve pages from a CDN.',
    'Measure before and after every change, so each optimisation earns its place.' ] },
  { slug: 'ai-automations-for-small-teams', title: '5 AI automations every small team should ship', date: '2026-10-05', excerpt: 'Lead routing, invoice matching, support triage, meeting notes and reports.', body: [
    'Small teams gain the most from automating work that is frequent, rule-based and easy to check.',
    'Begin with lead routing and support triage, then add invoice matching, meeting summaries and weekly reporting.',
    'Keep a human approval step on anything customer-facing until the workflow has proven itself.' ] },
  { slug: 'brand-positioning-in-one-sentence', title: 'Brand positioning in one sentence', date: '2026-09-18', excerpt: 'If you cannot say it in one sentence, your audience cannot either.', body: [
    'A strong position names who you serve, what you change for them and why you are different.',
    'Write the sentence, test it on customers and repeat it everywhere: site, pitch deck and social bios.' ] },
];

// Items added or removed through the admin area are stored in data/admin-content.json
type AdminData = { work: Work[]; posts: Post[]; removed: { work: string[]; posts: string[] } };
const admin = adminData as unknown as AdminData;
export const WORK: Work[] = [...BASE_WORK.filter((w) => !admin.removed.work.includes(w.slug)), ...admin.work];
export const POSTS: Post[] = [...BASE_POSTS.filter((p) => !admin.removed.posts.includes(p.slug)), ...admin.posts].sort((a, b) => b.date.localeCompare(a.date));
