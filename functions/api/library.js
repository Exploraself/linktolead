// A download from the library, for signed-in founders only.
//
// GET ?item=<key>&t=<token> logs a 'library-download' event with the key,
// tags the founder in Mailchimp "linktolead-library-<book>" the first time they take
// that item (API mode, after the reply; tags only accumulate), then sends the
// browser on to the file. Without an account it goes to the page that makes
// one. The tag shows on the founder's Mailchimp profile; /mentor lists what
// each founder took and when.
//
// Every book is in the private WORKBOOKS bucket (key in `r2`), never at a
// public address (Alexandru, 4 Nov 2026: "putting the free full books behind
// the account, name and email, always: yes"). The free ones (`free: true`)
// open for any full account (Alexandru, 6 Nov 2026: "when they try to
// download anything, full account"); the free first pages (previews) stay
// public, and an account with only a name and email is asked for what it
// lacks first.
// HUB material (Alexandru, 4 Nov 2026): Built to Lead, the 99 practical
// tools, and The Founder’s Growth Manual, 8 modules, are not free. They open
// only with The HUB and The Summit; anyone else is sent to the HUB page.
// ?item=<key>&check=1 says yes/no only (can the site see the file?), like
// /api/workbook?check=1.

import { bad, db, now, studentBy, accountTables } from '../_shared.js';
import { syncFounder } from '../_mailchimp.js';
import { missingOf } from '../_profile.js';

/** The downloads: the same keys, names and bucket keys as LIBRARY in
 *  public/content.js (a test holds them equal). `r2` is the file's key in the
 *  private bucket (lowercase, exactly as uploaded), `as` the name it downloads
 *  under. `free: true` opens for any account; without it, HUB material. */
export const LIBRARY_ITEMS = {
  build: { name: 'The Founder’s Blueprint · Building', slug: 'blueprint-building', r2: 'blueprint-building.pdf', as: 'The-Founders-Blueprint-Building.pdf', free: true },
  grow: { name: 'The Founder’s Blueprint · Growing', slug: 'blueprint-growing', r2: 'blueprint-growing.pdf', as: 'The-Founders-Blueprint-Growing.pdf', free: true },
  scale: { name: 'The Founder’s Blueprint · Scaling', slug: 'blueprint-scaling', r2: 'blueprint-scaling.pdf', as: 'The-Founders-Blueprint-Scaling.pdf', free: true },
  btl: { name: 'Built to Lead', slug: 'built-to-lead', r2: 'built-to-lead.pdf', as: 'Built-to-Lead.pdf' },
  wb: { name: 'Worth Building', slug: 'worth-building', r2: 'worth-building.pdf', as: 'Worth-Building.pdf', free: true },
  nww: { name: 'A New Way of Winning', slug: 'a-new-way-of-winning', r2: 'a-new-way-of-winning.pdf', as: 'A-New-Way-of-Winning.pdf', free: true },
  fgm: { name: 'The Founder’s Growth Manual', slug: 'founders-growth-manual', r2: 'founders-growth-manual.pdf', as: 'The-Founders-Growth-Manual.pdf' },
  mgp: { name: 'The Leader’s North Star · Massive Growth Plan', slug: 'massive-growth-plan', r2: 'massive-growth-plan.pdf', as: 'North-Star-Massive-Growth-Plan.pdf', free: true },
  lgp: { name: 'The Leader’s Growth Planner 2027', slug: 'leaders-growth-planner', r2: 'leaders-growth-planner-2027.pdf', as: 'The-Leaders-Growth-Planner-2027.pdf', free: true },
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
  // Can the site see the bucket and the file? Yes/no only.
  if (url.searchParams.has('check')) {
    const file = B ? !!(await B.get(item.r2).catch(() => null)) : false;
    return new Response(JSON.stringify({ ok: !!B && file, bucket: !!B, file }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
  }
  const D = db(env);
  if (!D) return bad('The library is not available right now.', 503);
  const t = url.searchParams.get('t');
  const me = await studentBy(D, t);
  // No account: off to make one. An account this browser holds but the site
  // does not know (an old sign-in): sign in again, then back to the Library.
  // No account at all: the short box, first name and email (Alexandru, 5 Nov 2026).
  if (!me) return go(request, t ? `/ground-plan/?next=${encodeURIComponent('/ground-plan/#library')}#signin` : '/road3/#join');
  // HUB material opens only with The HUB or The Summit; anyone else is
  // shown the HUB, never the file.
  if (!item.free && !holdsHubBook(me.tier)) return go(request, HUB_PAGE);
  // Every download needs the full account (Alexandru, 6 Nov 2026: "when they
  // try to download anything, full account"). The library asks for only what
  // is missing, then sends them here again.
  const prof = await D.prepare('SELECT company, interest, industry, google_at FROM student_profile WHERE student_id = ?').bind(me.id).first();
  const auth = await D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(me.id).first();
  if (missingOf({ ...(prof || {}), hasPassword: !!(auth && auth.pass_hash) }).length) return go(request, '/ground-plan/#library');
  const obj = B ? await B.get(item.r2).catch(() => null) : null;
  if (!obj) return page(503, `${item.name} is not ready to download yet`, `${item.free ? 'It is yours, free with your account.' : 'It is yours with The HUB.'} Try again tomorrow, or reply to any of our emails and Alexandru and the team will send it to you.`);
  await accountTables(D);
  const before = await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'library-download' AND detail = ? LIMIT 1").bind(me.id, key).first();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'library-download', now(), key).run();
  if (!before) {
    const job = syncFounder(env, D, me.id, 'tag', { tag: libraryTag(key) }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  // The file itself, as a named download, never cached on the way.
  return new Response(obj.body, { status: 200, headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${item.as}"`, 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' } });
}
