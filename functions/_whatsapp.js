// WhatsApp from the ExploraSelf business number (Alexandru, 3 Nov 2026: "I do
// already have a number, only for WhatsApp … you just simply send me a
// message to my WhatsApp, and we send them a message … from this WhatsApp").
//
// Through GREEN-API: the WhatsApp-only number is linked once by scanning a QR
// code in its console, the way WhatsApp Web is linked. Then one request sends
// a message: POST {apiUrl}/waInstance{id}/sendMessage/{token} with
// { chatId: '<digits>@c.us', message }.
//
// Off until these are set in Cloudflare (never in this public repo):
//   WA_API_URL    the apiUrl the GREEN-API console shows (https://….api.green-api.com)
//   WA_INSTANCE   the idInstance (a number)
//   WA_TOKEN      the apiTokenInstance (a secret)
//   WA_ALERT_TO   Alexandru's own WhatsApp number, for the alerts (+39 …)
// Every send is logged on the request; a failed send never stops a booking,
// and the page says a WhatsApp went only when this said ok (AGENTS.md rule 6).

import { whenText, answersText, cityOf, KINDS, RULES, waDigits } from './_booking.js';

const SEND_MS = 8000;

/** Ready to send? { ready, alert } — alert: an alert number is set too. */
export function waState(env) {
  const url = waUrl(env);
  const ready = !!(url && /^\d{4,20}$/.test(String(env && env.WA_INSTANCE || '').trim()) && String(env && env.WA_TOKEN || '').trim());
  return { ready, alert: ready && waDigits(env.WA_ALERT_TO).length >= 7 };
}
const waUrl = (env) => {
  const u = String(env && env.WA_API_URL || '').trim().replace(/\/+$/, '');
  return /^https:\/\/[a-z0-9.-]+$/i.test(u) ? u : '';
};
/** A WhatsApp chat id from a phone in any form: digits, then @c.us. */
export const chatIdOf = (phone) => { const d = waDigits(phone); return d.length >= 7 ? `${d}@c.us` : ''; };

/** Send one text. { ok, id } or { ok: false, why } — never throws. */
export async function waSend(env, phone, message) {
  if (!waState(env).ready) return { ok: false, why: 'WhatsApp is not set up.' };
  const chatId = chatIdOf(phone);
  if (!chatId) return { ok: false, why: 'No phone number.' };
  const url = `${waUrl(env)}/waInstance${String(env.WA_INSTANCE).trim()}/sendMessage/${String(env.WA_TOKEN).trim()}`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), SEND_MS);
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chatId, message: String(message).slice(0, 4000) }), signal: ctl.signal });
    const j = await r.json().catch(() => null);
    if (r.ok && j && j.idMessage) return { ok: true, id: String(j.idMessage) };
    return { ok: false, why: `GREEN-API answered ${r.status}${j && j.message ? `: ${String(j.message).slice(0, 120)}` : ''}` };
  } catch (e) {
    return { ok: false, why: e && e.name === 'AbortError' ? 'GREEN-API did not answer in time.' : 'GREEN-API could not be reached.' };
  } finally { clearTimeout(timer); }
}

const timeWords = (iso, tz) => { const w = whenText(iso, tz); return w.same ? `${w.rome} (Rome)` : `${w.mine} (${w.romeShort} in Rome)`; };

/** To the person who asked for a call, from the business number: thanks,
 *  their time, "I'll confirm within 24 hours by email", reply here. The same
 *  words as their email copy (functions/_letters.js bookingLetter). */
export function bookingWhatsApp({ first = '', kind = 'discovery', times = [], tz = '' } = {}) {
  const one = kind === 'boardroom', many = times.length > 1;
  return [
    `Hi ${first || 'there'},`,
    one ? `Thank you for choosing your ${many ? 'times' : 'time'}. I’m looking forward to our hour together.` : 'Thank you for asking for a free discovery call. I’m glad you did.',
    `${many ? 'Your times' : 'Your time'} for ${one ? 'your 1:1' : 'our call'} (${KINDS[kind].minutes} minutes, online):\n${times.map((t) => `· ${timeWords(t, tz)}`).join('\n')}`,
    `I’ll confirm ${many ? 'one of them' : 'it'} within ${RULES.confirmHours} hours by email, with the ${RULES.where} link. If ${many ? 'none of these works' : 'the time no longer works'}, just reply here.`,
    'Alexandru Cojocari · ExploraSelf',
  ].join('\n\n');
}

/** To Alexandru's own WhatsApp: everything they gave, and where to confirm. */
export function bookingAlert(base, { name = '', email = '', phone = '', kind = 'discovery', times = [], answers = {}, tz = '', step = '', account = false } = {}) {
  const one = kind === 'boardroom';
  const told = answersText(kind, answers).map(([l, w]) => `· ${l}: ${w}`).join('\n');
  return [
    `*New ${one ? 'Boardroom 1:1' : 'free discovery call'}* (${KINDS[kind].minutes} min${one && step ? `, ${step}` : ''})`,
    [name || 'Someone', email, phone ? `${phone} · https://wa.me/${waDigits(phone)}` : '', account ? 'With an account' : 'Without an account'].filter(Boolean).join('\n'),
    `*${times.length > 1 ? 'Their times' : 'Their time'}, Rome*\n${times.map((t) => `· ${whenText(t, tz).rome}`).join('\n')}${tz && tz !== RULES.zone ? `\n(they are in ${cityOf(tz)})` : ''}`,
    told ? `*What they told us*\n${told}` : '',
    `Confirm in /mentor: ${base}/mentor/#inbox`,
  ].filter(Boolean).join('\n\n');
}
