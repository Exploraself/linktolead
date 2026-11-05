// Good People Win (functions/_gpw.js): the door for exploraself.com, and the
// open pixel.
//
// POST { first, email, source, consent: true, tz }
//   From a name + email form on exploraself.com, in the visitor's browser,
//   after they said yes to letters. `source` names the form
//   ("exploraself-<form>", small letters and dashes). Letter 1 goes at once,
//   inside the mail limits (functions/_mail.js allowed: 3 per address and 10
//   per connection an hour); over the limit nothing is joined. An address
//   already in the letters is not started again. { ok, status }
// GET ?o=<id>
//   The 1 × 1 picture at the end of each letter: marks that letter opened.
//   Always the same transparent picture, never cached.
// OPTIONS
//   The browser's check before the POST (exploraself.com is another site).

import { db, clean, looksLikeEmail, accountTables } from '../_shared.js';
import { gpwJoin, sendFirst, markOpened, gpwMode } from '../_gpw.js';
import { allowed, origin } from '../_mail.js';

/** The sites whose pages may post here from a browser. */
export const ORIGINS = [/^https:\/\/(www\.)?exploraself\.com$/, /^https:\/\/[a-z0-9-]+\.lovable\.app$/, /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/];
const cors = (request) => {
  const o = request.headers.get('origin') || '';
  return ORIGINS.some((r) => r.test(o)) ? { 'access-control-allow-origin': o, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'origin' } : {};
};
const reply = (request, data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...cors(request) } });

// A transparent 1 × 1 GIF.
const GIF = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), (c) => c.charCodeAt(0));
const pixel = () => new Response(GIF, { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store, max-age=0', 'content-length': String(GIF.length) } });

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: cors(request) });
}

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('o');
  const D = db(env);
  if (D && id) { try { await markOpened(D, id); } catch { /* the picture still shows */ } }
  return pixel();
}

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return reply(request, { ok: false, error: 'Not available right now.' }, 503);
  let body;
  try { body = await request.json(); } catch { return reply(request, { ok: false, error: 'Could not read that.' }, 400); }
  const email = clean(body.email, 200).toLowerCase();
  const first = clean(body.first, 60).replace(/[<>"]/g, '');
  if (!looksLikeEmail(email)) return reply(request, { ok: false, error: 'That email does not look complete.' }, 400);
  if (body.consent !== true) return reply(request, { ok: false, error: 'We send these letters only with your yes.' }, 400);
  if (gpwMode(env) === 'off') return reply(request, { ok: true, status: 'off' });
  const src = clean(body.source, 40).toLowerCase();
  const source = /^exploraself-[a-z0-9-]{1,28}$/.test(src) ? src : 'exploraself';
  await accountTables(D);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!(await allowed(D, email, ip))) return reply(request, { ok: false, error: 'We have sent several emails to this address in the last hour. Try again in an hour.' }, 429);
  const r = await gpwJoin(env, D, { email, first, source, tz: clean(body.tz, 60) });
  if (r.status === 'ok') {
    const job = sendFirst(env, D, origin(request), email, ip).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  return reply(request, { ok: true, status: r.status });
}
