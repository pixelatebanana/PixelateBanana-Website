export const SERVICE_OPTIONS = ['Web design & development', 'App development', 'AI automation & workflow', 'Creative design', 'Brand positioning', 'Not sure yet'] as const;
export const BUDGET_OPTIONS = ['Under $2,000', '$2,000 – $5,000', '$5,000 – $10,000', '$10,000 – $25,000', '$25,000+', 'Not sure yet'] as const;
export type Inquiry = { name: string; company: string; email: string; phone: string; service: string; budget: string; message: string };
export type Errors = Partial<Record<keyof Inquiry, string>>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const s = (v: unknown, max: number, multi = false) => {
  const x = String(v ?? '');
  return (multi ? x.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '') : x.replace(/[\u0000-\u001f\u007f]/g, ' ')).trim().slice(0, max);
};
/** Shared by the browser form AND the API route (server-side validation is the source of truth). */
export function validateInquiry(raw: Record<string, unknown>): { data: Inquiry; errors: Errors } {
  const d: Inquiry = { name: s(raw.name, 80), company: s(raw.company, 100), email: s(raw.email, 120).toLowerCase(), phone: s(raw.phone, 25), service: s(raw.service, 60), budget: s(raw.budget, 40), message: s(raw.message, 2000, true) };
  const e: Errors = {};
  if (d.name.length < 2) e.name = 'Please enter your name.';
  if (!EMAIL.test(d.email)) e.email = 'Please enter a valid email address.';
  if (d.phone && !/^[+\d][\d\s().-]{6,24}$/.test(d.phone)) e.phone = 'Please enter a valid phone number.';
  if (!(SERVICE_OPTIONS as readonly string[]).includes(d.service)) e.service = 'Please choose a service.';
  if (!(BUDGET_OPTIONS as readonly string[]).includes(d.budget)) e.budget = 'Please choose a budget.';
  if (d.message.length < 10) e.message = 'Please tell us a little more (10+ characters).';
  return { data: d, errors: e };
}

export type ChatMessage = { name: string; company: string; contact: string; message: string };
export type ChatErrors = Partial<Record<keyof ChatMessage, string>>;
/** Chat form: name, company (optional), contact info (email or phone), message. Shared by browser form and API route. */
export function validateChat(raw: Record<string, unknown>): { data: ChatMessage; errors: ChatErrors } {
  const d: ChatMessage = { name: s(raw.name, 80), company: s(raw.company, 100), contact: s(raw.contact, 120), message: s(raw.message, 2000, true) };
  const e: ChatErrors = {};
  if (d.name.length < 2) e.name = 'Please enter your name.';
  if (!(EMAIL.test(d.contact) || /^[+\d][\d\s().-]{6,24}$/.test(d.contact))) e.contact = 'Please enter a valid email address or phone number.';
  if (d.message.length < 10) e.message = 'Please tell us a little more (10+ characters).';
  return { data: d, errors: e };
}
