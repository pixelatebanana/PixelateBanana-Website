import type { Inquiry, ChatMessage } from './validation';
import { SITE } from './site';
const esc = (x: string) => x.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
export async function sendInquiry(d: Inquiry) {
  const key = process.env.RESEND_API_KEY, to = process.env.INQUIRY_TO, from = process.env.INQUIRY_FROM;
  if (!key || !to || !from) throw new Error('Mail environment variables are missing');
  const rows = [['Name', d.name], ['Company', d.company || '-'], ['Email', d.email], ['Phone', d.phone || '-'], ['Service', d.service], ['Budget', d.budget]];
  const html = `<table>${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join('')}</table><p>${esc(d.message).replace(/\n/g, '<br>')}</p>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: d.email, subject: `New quote request: ${d.service} (${d.name})`.replace(/[\r\n]/g, ' '), html }),
  });
  if (!r.ok) throw new Error('Mail provider error ' + r.status);
}

export const mailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.INQUIRY_TO && process.env.INQUIRY_FROM);
export async function sendChat(d: ChatMessage) {
  const key = process.env.RESEND_API_KEY, to = process.env.INQUIRY_TO, from = process.env.INQUIRY_FROM;
  if (!key || !to || !from) throw new Error('Mail environment variables are missing');
  const rows = [['Name', d.name], ['Company', d.company || '-'], ['Contact', d.contact]];
  const html = `<table>${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join('')}</table><p>${esc(d.message).replace(/\n/g, '<br>')}</p>`;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], ...(isEmail ? { reply_to: d.contact } : {}), subject: `New chat message (${d.name})`.replace(/[\r\n]/g, ' '), html }),
  });
  if (!r.ok) throw new Error('Mail provider error ' + r.status);
}

/** Invite for the project dashboard. Returns 'logged' (dev only, mail not set up: printed to the server console) or 'sent'. */
export async function sendCrmInvite(d: { to: string; name: string; role: 'client' | 'specialist'; project: string; password: string }): Promise<'sent' | 'logged'> {
  const key = process.env.RESEND_API_KEY, from = process.env.INQUIRY_FROM;
  const link = `${SITE.url}/login/${d.role}/dashboard`;
  if (!key || !from) {
    if (process.env.NODE_ENV === 'production') throw new Error('Mail environment variables are missing');
    console.log(`[crm invite] ${d.role} ${d.to} | ${link} | password: ${d.password}`);
    return 'logged';
  }
  const html = `<p>Hi ${esc(d.name)},</p><p>You have been added to the project <b>${esc(d.project)}</b> on ${esc(SITE.name)} as the ${d.role}.</p><p>Sign in here: <a href="${link}">${link}</a></p><p>Email: ${esc(d.to)}<br>One-time password: <b style="font-family:monospace;font-size:18px">${esc(d.password)}</b></p><p>Keep this password private. It works until the project is marked complete.</p>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [d.to], subject: `Join your ${SITE.name} project: ${d.project}`.replace(/[\r\n]/g, ' '), html }),
  });
  if (!r.ok) throw new Error('Mail provider error ' + r.status);
  return 'sent';
}
