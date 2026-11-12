import { createSign } from 'crypto';
/** Optional: append a row to Google Sheets. Needs GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY (server-only). */
export const sheetsConfigured = () => !!(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
const b64 = (x: string) => Buffer.from(x).toString('base64url');
const safe = (v: string) => (/^[=+\-@]/.test(v) ? "'" + v : v); // stop spreadsheet formula injection

async function accessToken(): Promise<string> {
  const email = process.env.GOOGLE_CLIENT_EMAIL as string;
  const key = (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const head = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64(JSON.stringify({ iss: email, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = createSign('RSA-SHA256').update(`${head}.${claim}`).sign(key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }),
  });
  if (!r.ok) throw new Error('Google token error ' + r.status);
  return (await r.json()).access_token as string;
}

/** Columns: Time, Name, Company, Contact, Phone, Service, Budget, Message. Tabs: "Quotes" and "Chat". */
export async function appendRow(tab: 'Quotes' | 'Chat', cells: string[]) {
  const token = await accessToken();
  const range = encodeURIComponent(`${tab}!A:H`);
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [[new Date().toISOString(), ...cells.map(safe)]] }),
  });
  if (!r.ok) throw new Error('Google Sheets error ' + r.status);
}
