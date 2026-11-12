export const SITE = {
  name: 'PixelateBanana',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pixelatebanana.com',
  email: 'hello@pixelatebanana.com',
  description: 'PixelateBanana is a digital agency for web design & development, app development, AI automation workflows and creative brand positioning.',
};
export const NAV = [['Home', '/'], ['Services', '/services'], ['Work', '/work'], ['Insights', '/insights'], ['About', '/about'], ['Contact', '/contact']] as const;
// TODO: replace with your real profile links (WhatsApp: https://wa.me/<number-with-country-code>)
export const SOCIAL = {
  instagram: 'https://www.instagram.com/pixelatebanana',
  linkedin: 'https://www.linkedin.com/company/pixelatebanana',
  whatsapp: 'https://wa.me/',
} as const;
