const ads = !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const dev = process.env.NODE_ENV !== 'production';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}${ads ? ' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com' : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${ads ? ' https:' : ''}`,
  `connect-src 'self'${ads ? ' https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net' : ''}`,
  ads ? "frame-src https://googleads.g.doubleclick.net https://*.google.com https://*.googlesyndication.com" : "frame-src 'none'",
  "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return [
      { source: '/services/digital-solutions', destination: '/services/website-apps', permanent: true },
      { source: '/services/creative-production', destination: '/services/creative-branding', permanent: true },
      { source: '/services/branding-strategy', destination: '/services/creative-branding', permanent: true },
    ];
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ] }];
  },
};
