// A download from the library, for signed-in founders only.
//
// GET ?item=<key>&t=<token> logs a 'library-download' event with the key,
// tags the founder in Mailchimp "linktolead-library-<book>" the first time they take
// that item (API mode, after the reply; tags only accumulate), then sends the
// browser on to the file. Without an account it goes to the page that makes
// one. The tag shows on the founder's Mailchimp profile; /mentor lists what
// each founder took and when.
//
// HUB material (Alexandru, 4 Nov 2026): Built to Lead, the 99 practical
// tools, and The Founder’s Growth Manual, 8 modules, are not free. It opens only with The HUB and The Summit, from
// the private WORKBOOKS bucket (key in `r2`), never from a public address.
// Anyone else is sent to the HUB page; ?item=btl&check=1 (or fgm) says yes/no only,
// like /api/workbook?check=1.

import { bad, db, now, studentBy, accountTables } from '../_shared.js';
import { syncFounder } from '../_mailchimp.js';

/** The downloads: the same keys, names and files as LIBRARY in
 *  public/content.js (a test holds them equal). An item with `r2` is HUB
 *  material: no public file, only that key in the private bucket. */
export const LIBRARY_ITEMS = {
  build: { name: 'The Founder’s Blueprint · Building', slug: 'blueprint-building', file: '/library/blueprint-building.pdf' },
  grow: { name: 'The Founder’s Blueprint · Growing', slug: 'blueprint-growing', file: '/library/blueprint-growing.pdf' },
  scale: { name: 'The Founder’s Blueprint · Scaling', slug: 'blueprint-scaling', file: '/library/blueprint-scaling.pdf' },
  btl: { name: 'Built to Lead', slug: 'built-to-lead', r2: 'built-to-lead.pdf', as: 'Built-to-Lead.pdf' },
  wb: { name: 'Worth Building', slug: 'worth-building', file: '/library/worth-building.pdf' },
  nww: { name: 'A New Way of Winning', slug: 'a-new-way-of-winning', file: '/library/a-new-way-of-winning.pdf' },
  fgm: { name: 'The Founder’s Growth Manual', slug: 'founders-growth-manual', r2: 'founders-growth-manual.pdf', as: 'The-Founders-Growth-Manual.pdf' },
  mgp: { name: 'The Leader’s North Star · Massive Growth Plan', slug: 'massive-growth-plan', file: '/library/massive-growth-plan.pdf' },
  lgp: { name: 'The Leader’s Growth Planner 2027', slug: 'leaders-growth-planner', file: '/library/leaders-growth-planner-2027.pdf' },
};
/** The tag system (functions/_mailchimp.js): linktolead-library-<book>. */
export const libraryTag = (key) => `linktolead-library-${LIBRARY_ITEMS[key].slug}`;

/** The steps that open HUB material (functions/_stripe.js ORDER): The HUB and
 *  The Summit, never The LAB (it has its own workbook). */
export const HUB_BOOK_TIERS = ['hub', 'premium'];
export const holdsHubBook = (tier) => HUB_BOOK_TIERS.includes(tier || 'free');
/** Where a founder without the HUB is sent: the page that sells it. */
export const HUB_PAGE = 'https://exploraself.com/hub?utm_source=linktolead&utm_medium=library';
/** The private bucket's keys that belong to the library, so the LAB
 *  workbook's any-PDF fallback (functions/api/workbook.js) never picks one. */
export const LIBRARY_R2_KEYS = Object.values(LIBRARY_ITEMS).map((v) => v.r2).filter(Boolean);

const page = (status, title, text) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · ExploraSelf</title><link rel="stylesheet" href="/assets/fonts.css"><style>body{margin:0;font:17px/1.6 'Atkinson Hyperlegible',system-ui,sans-serif;color:#16130E;background:#fff}main{max-width:560px;margin:0 auto;padding:56px 18px}h1{font-size:28px;line-height:1.2;margin:0 0 12px}p{color:#5E574C;margin:0 0 20px}a{display:inline-block;background:#16130E;color:#fff;border-radius:12px;padding:14px 20px;font-weight:700;text-decoration:none}</style></head><body><main><h1>${title}</h1><p>${text}</p><a href="/ground-plan/#library">Back to my library</a></main></body></html>`,
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
const go = (request, path) => new Response(null, { status: 302, headers: { location: new URL(path, request.url).toString(), 'cache-control': 'no-store' } });

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('item') || '';
  if (!Object.hasOwn(LIBRARY_ITEMS, key)) return bad('There is no such book in the library.', 404);
  const item = LIBRARY_ITEMS[key];
  const B = env.WORKBOOKS && typeof env.WORKBOOKS.get === 'function' ? env.WORKBOOKS : null;
  // HUB material: can the site see the bucket and the file? Yes/no only.
  if (item.r2 && url.searchParams.has('check')) {
    const file = B ? !!(await B.get(item.r2).catch(() => null)) : false;
    return new Response(JSON.stringify({ ok: !!B && file, bucket: !!B, file }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
  }
  const D = db(env);
  if (!D) return bad('The library is not available right now.', 503);
  const t = url.searchParams.get('t');
  const me = await studentBy(D, t);
  // No account: off to make one. An account this browser holds but the site
  // does not know (an old sign-in): sign in again, then back to the Library.
  if (!me) return go(request, t ? `/ground-plan/?next=${encodeURIComponent('/ground-plan/#library')}#signin` : '/north3/#join');
  // HUB material opens only with The HUB or The Summit; anyone else is
  // shown the HUB, never the file.
  if (item.r2 && !holdsHubBook(me.tier)) return go(request, HUB_PAGE);
  const obj = item.r2 && B ? await B.get(item.r2).catch(() => null) : null;
  if (item.r2 && !obj) return page(503, `${item.name} is not ready to download yet`, 'It is yours with The HUB. Try again tomorrow, or reply to any of our emails and Alexandru and the team will send it to you.');
  await accountTables(D);
  const before = await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'library-download' AND detail = ? LIMIT 1").bind(me.id, key).first();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'library-download', now(), key).run();
  if (!before) {
    const job = syncFounder(env, D, me.id, 'tag', { tag: libraryTag(key) }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  if (obj) {
    return new Response(obj.body, { status: 200, headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${item.as}"`, 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' } });
  }
  // The file itself, as a download (4 Nov 2026): the button no longer needs the
  // browser's download attribute, which saved any page that came back (a
  // sign-in page, an error) as "download.html". Where the site's files can be
  // read here (env.ASSETS), the PDF comes back named, as an attachment;
  // otherwise the browser is sent on to it.
  const file = item.file;
  if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
    const r = await env.ASSETS.fetch(new Request(new URL(file, request.url))).catch(() => null);
    if (r && r.ok) {
      const h = new Headers(r.headers);
      h.set('content-type', 'application/pdf');
      h.set('content-disposition', `attachment; filename="${file.split('/').pop()}"`);
      h.set('cache-control', 'private, no-store');
      return new Response(r.body, { status: 200, headers: h });
    }
  }
  return go(request, file);
}
