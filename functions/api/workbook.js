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

/** The steps that hold the workbook (functions/_stripe.js ORDER). */
export const WORKBOOK_TIERS = ['lab', 'hub', 'premium'];
/** The object's key in the WORKBOOKS bucket, and the name it downloads as. */
export const WORKBOOK_KEY = 'personal-leadership-lab-workbook-2026.pdf';
export const WORKBOOK_NAME = 'Personal-Leadership-LAB-Workbook.pdf';
export const holdsWorkbook = (tier) => WORKBOOK_TIERS.includes(tier || 'free');

const go = (request, path) => new Response(null, { status: 302, headers: { location: new URL(path, request.url).toString(), 'cache-control': 'no-store' } });
const page = (status, title, text) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · ExploraSelf</title><link rel="stylesheet" href="/assets/fonts.css"><style>body{margin:0;font:17px/1.6 'Atkinson Hyperlegible',system-ui,sans-serif;color:#16130E;background:#fff}main{max-width:560px;margin:0 auto;padding:56px 18px}h1{font-size:28px;line-height:1.2;margin:0 0 12px}p{color:#5E574C;margin:0 0 20px}a{display:inline-block;background:#16130E;color:#fff;border-radius:12px;padding:14px 20px;font-weight:700;text-decoration:none}</style></head><body><main><h1>${title}</h1><p>${text}</p><a href="/ground-plan/#home">Back to my Base Camp</a></main></body></html>`,
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const D = db(env);
  if (!D) return page(503, 'Not available right now', 'Your workbook can’t be reached right now. Try again in a few minutes.');
  const me = await studentBy(D, url.searchParams.get('t'));
  if (!me) return go(request, `/ground-plan/?next=${encodeURIComponent('/ground-plan/#home')}#signin`);
  if (!holdsWorkbook(me.tier)) return go(request, '/pay/?step=lab');
  const obj = env.WORKBOOKS && typeof env.WORKBOOKS.get === 'function' ? await env.WORKBOOKS.get(WORKBOOK_KEY).catch(() => null) : null;
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
