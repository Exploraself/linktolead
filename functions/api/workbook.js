// The LAB workbook, for the founders who paid for it (Alexandru, 3 Nov 2026).
//
// GET ?t=<token> hands "Personal Leadership LAB · The Workbook" (a PDF) to a
// signed-in founder whose step holds it: The LAB, The HUB or The Summit. It
// is paid content: the file lives only in a private R2 bucket, bound to this
// app as WORKBOOKS, never in this public repo and never at a public address.
// Each download is logged as a 'workbook-download' event (seen in /mentor).
// No Mailchimp tag: a new tag name needs Alexandru's yes first (rule 17).
//
// Not signed in: to sign-in, then back. A step below the LAB: to /pay/ for the
// LAB. No bucket bound or no file in it yet: a plain page that says so, and
// never a broken download.

import { db, now, studentBy, accountTables } from '../_shared.js';
import { LIBRARY_R2_KEYS } from './library.js';

/** The steps that hold the workbook (functions/_stripe.js ORDER). */
export const WORKBOOK_TIERS = ['lab', 'hub', 'premium'];
/** The object's key in the WORKBOOKS bucket, and the name it downloads as. */
export const WORKBOOK_KEY = 'personal-leadership-lab-workbook-2026.pdf';
export const WORKBOOK_NAME = 'Personal-Leadership-LAB-Workbook.pdf';
export const holdsWorkbook = (tier) => WORKBOOK_TIERS.includes(tier || 'free');

/** The workbook in the bucket: WORKBOOK_KEY, or else the one PDF uploaded
 *  under any name (3 Nov 2026: so the file can go in straight from Drive,
 *  as it is named there, with nothing to rename). Never a library book that
 *  shares the bucket (LIBRARY_R2_KEYS, 4 Nov 2026: Built to Lead is HUB
 *  material, and a LAB founder must never be handed it as their workbook). */
export async function workbookFile(B) {
  if (!B || typeof B.get !== 'function') return null;
  const named = await B.get(WORKBOOK_KEY).catch(() => null);
  if (named || typeof B.list !== 'function') return named;
  const all = await B.list({ limit: 50 }).catch(() => null);
  const pdf = all && (all.objects || []).find((o) => /\.pdf$/i.test(o.key) && !LIBRARY_R2_KEYS.includes(o.key));
  return pdf ? B.get(pdf.key).catch(() => null) : null;
}

const go = (request, path) => new Response(null, { status: 302, headers: { location: new URL(path, request.url).toString(), 'cache-control': 'no-store' } });
const page = (status, title, text) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · ExploraSelf</title><link rel="stylesheet" href="/assets/fonts.css"><style>body{margin:0;font:17px/1.6 'Atkinson Hyperlegible',system-ui,sans-serif;color:#16130E;background:#fff}main{max-width:560px;margin:0 auto;padding:56px 18px}h1{font-size:28px;line-height:1.2;margin:0 0 12px}p{color:#5E574C;margin:0 0 20px}a{display:inline-block;background:#16130E;color:#fff;border-radius:12px;padding:14px 20px;font-weight:700;text-decoration:none}</style></head><body><main><h1>${title}</h1><p>${text}</p><a href="/ground-plan/#home">Back to my Base Camp</a></main></body></html>`,
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  // A check that shows nothing paid (4 Nov 2026): can the site see the
  // bucket, and is a workbook PDF in it? Yes/no only, so a missing binding is
  // found in a second instead of by a founder downloading an error page.
  if (url.searchParams.has('check')) {
    const bucket = !!(env.WORKBOOKS && typeof env.WORKBOOKS.get === 'function');
    const file = bucket ? !!(await workbookFile(env.WORKBOOKS)) : false;
    return new Response(JSON.stringify({ ok: bucket && file, bucket, file }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
  }
  const D = db(env);
  if (!D) return page(503, 'Not available right now', 'Your workbook can’t be reached right now. Try again in a few minutes.');
  const me = await studentBy(D, url.searchParams.get('t'));
  if (!me) return go(request, `/ground-plan/?next=${encodeURIComponent('/ground-plan/#home')}#signin`);
  if (!holdsWorkbook(me.tier)) return go(request, '/pay/?step=lab');
  const obj = await workbookFile(env.WORKBOOKS);
  if (!obj) return page(503, 'Your workbook is not ready to download yet', 'It is yours with your step. Try again tomorrow, or reply to any of our emails and Alexandru and the team will send it to you.');
  await accountTables(D);
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'workbook-download', now(), WORKBOOK_KEY).run();
  return new Response(obj.body, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${WORKBOOK_NAME}"`,
      'cache-control': 'private, no-store',
      'x-robots-tag': 'noindex',
    },
  });
}
