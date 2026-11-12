# Changes ported from the edited preview

Modified: .env.example, README.md, app/page.tsx, app/contact/page.tsx, app/start-a-project/page.tsx, app/services/page.tsx, app/sitemap.ts, app/api/inquiry/route.ts, components/cards/ServiceCard.tsx, components/forms/QuoteForm.tsx, components/navigation/{Header,Footer}.tsx, components/sections/Hero.tsx, lib/{content,mail,site,validation}.ts, next.config.mjs, styles/globals.css
Added: app/chat/page.tsx, app/api/chat/route.ts, components/forms/ChatForm.tsx, components/sections/AboutHome.tsx, components/ui/SocialLinks.tsx, lib/sheets.ts, app/services/{website-apps,ai-automation,creative-branding}/page.tsx
Deleted: app/services/{digital-solutions,creative-production,branding-strategy}/ (old URLs 308-redirect to the new ones in next.config.mjs)

# Admin uploads/URLs and project dashboards (CRM)

Modified: components/forms/AdminPanel.tsx (image upload, website URL instead of slug, Live projects link), lib/admin/{validate,store}.ts, lib/content.ts (optional `image`/`url`), components/cards/{WorkCard,PostCard}.tsx, components/sections/CaseStudy.tsx, app/insights/[slug]/page.tsx, lib/mail.ts (invite email added at the end), styles/globals.css (CRM block appended), .env.example, README.md, .gitignore
Added: lib/admin/upload.ts, app/api/admin/upload/, components/ui/{UploadedImage,VisitButton}.tsx, lib/crm/, components/crm/, app/api/crm/, app/api/admin/projects/, app/login/{client,specialist}/dashboard/, app/login/admin/live-projects/
