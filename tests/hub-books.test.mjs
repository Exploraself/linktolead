// The HUB books (Alexandru, 4 Nov 2026): Built to Lead (99 practical tools)
// and The Founder's Growth Manual (8 modules) open only with The HUB and The
// Summit, from the private WORKBOOKS bucket, never from this public repo. They
// stay on every shelf with the note "Only available with the HUB"; below the
// HUB there is no preview and no download, and the whole card opens the
// book's own page. The LAB workbook's fallback never picks them. No page or
// letter calls them free. Worth Building (32 frameworks) stays free.

import { onRequestGet as library, LIBRARY_ITEMS, HUB_BOOK_TIERS, HUB_PAGE, LIBRARY_R2_KEYS, holdsHubBook } from '../functions/api/library.js';
import { workbookFile } from '../functions/api/workbook.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { LIBRARY, HUB_NOTE } from '../public/content.js';
import { markup } from '../public/north3/kit.js';
import { SERIES_LETTERS } from '../functions/_series-letters.js';
import { COURSE_LETTERS } from '../functions/_course-letters.js';
import { launchpadWelcome } from '../functions/_letters.js';
import { fakeD1, post, tally } from './_d1.mjs';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const { ok, done } = tally('hub-books');
globalThis.fetch = async () => ({ ok: true, status: 200, headers: new Headers(), text: async () => '{}', json: async () => ({}) });

const BOOKS = {
  btl: { key: 'built-to-lead.pdf', as: 'Built-to-Lead.pdf', page: 'https://exploraself.com/built-to-lead', name: 'Built to Lead' },
  fgm: { key: 'founders-growth-manual.pdf', as: 'The-Founders-Growth-Manual.pdf', page: 'https://exploraself.com/founders-growth-manual', name: 'The Founder’s Growth Manual' },
};
ok(HUB_NOTE === 'Only available with the HUB', 'the note, word for word');
ok(JSON.stringify([...LIBRARY_R2_KEYS].sort()) === JSON.stringify(['built-to-lead.pdf', 'founders-growth-manual.pdf']), 'two HUB books in the private bucket, nothing else');
ok(LIBRARY_ITEMS.wb.file === '/library/worth-building.pdf' && !LIBRARY_ITEMS.wb.r2 && existsSync('public/library/worth-building.pdf'), 'Worth Building stays free, as before');
ok(HUB_BOOK_TIERS.join() === 'hub,premium' && holdsHubBook('hub') && holdsHubBook('premium') && !holdsHubBook('lab') && !holdsHubBook('session') && !holdsHubBook('free') && !holdsHubBook(null), 'only The HUB and The Summit hold them, never The LAB');

const PDF = new TextEncoder().encode('%PDF-1.7 a HUB book');
const env0 = (extra = {}) => ({ DB: fakeD1(), ...extra });
const join_ = async (env) => (await (await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true }), env })).json()).token;
const setTier = (env, tier) => env.DB.raw.prepare('UPDATE student SET tier = ?').run(tier);

for (const [k, B] of Object.entries(BOOKS)) {
  ok(LIBRARY_ITEMS[k].r2 === B.key && !LIBRARY_ITEMS[k].file && LIBRARY_ITEMS[k].name === B.name, `${B.name}: a key in the private bucket, no public file`);
  const bucket = (has = true) => ({ get: async (x) => (has && x === B.key ? { body: PDF } : null) });
  const hit = (env, t, extra = '') => library({ request: new Request(`https://linktolead.exploraself.com/api/library?item=${k}${t ? `&t=${t}` : ''}${extra}`), env });
  const env = env0({ WORKBOOKS: bucket() });
  const t = await join_(env);
  for (const tier of ['free', 'session', 'lab']) {
    setTier(env, tier);
    const r = await hit(env, t);
    ok(r.status === 302 && r.headers.get('location') === HUB_PAGE, `${k} · ${tier}: sent to the HUB page, never given the file`);
  }
  for (const tier of ['hub', 'premium']) {
    setTier(env, tier);
    const r = await hit(env, t);
    const body = new Uint8Array(await r.arrayBuffer());
    ok(r.status === 200 && r.headers.get('content-type') === 'application/pdf' && r.headers.get('content-disposition') === `attachment; filename="${B.as}"` && /no-store/.test(r.headers.get('cache-control')) && body.length === PDF.length, `${k} · ${tier}: the PDF, as a private download`);
  }
  ok(env.DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'library-download' AND detail = ?").all(k)[0].n === 2, `${k}: each HUB download is logged like any library book`);
  const e2 = env0(); const t2 = await join_(e2); setTier(e2, 'hub');
  const r2 = await hit(e2, t2);
  ok(r2.status === 503 && /not ready to download yet/.test(await r2.text()), `${k}: no bucket bound, a plain page that says so`);
  const chk = async (e) => (await hit(e, '', '&check=1')).json();
  const c1 = await chk(env0({ WORKBOOKS: bucket() })), c2 = await chk(env0({ WORKBOOKS: bucket(false) })), c3 = await chk(env0());
  ok(c1.ok && c1.bucket && c1.file && !c2.ok && c2.bucket && !c2.file && !c3.ok && !c3.bucket && Object.keys(c1).join() === 'ok,bucket,file', `${k}: ?check=1 says yes/no only`);
  ok(!existsSync(`public/library/${B.key}`) && existsSync(`public/library/cover-${B.key.replace('.pdf', '.jpg')}`), `${k}: no full PDF in the repo; the cover is there`);
  const card = LIBRARY.books.find((b) => b.k === k);
  ok(card && card.hub && !card.file && !card.preview && card.page === B.page, `${k}: the library card has its page, and no file and no preview`);
}

// ── The LAB workbook never picks a HUB book ────────────────────────────────
{
  const only = { get: async (k) => (LIBRARY_R2_KEYS.includes(k) ? { body: PDF, key: k } : null), list: async () => ({ objects: LIBRARY_R2_KEYS.map((key) => ({ key })) }) };
  ok((await workbookFile(only)) === null, 'a bucket holding only HUB books: the LAB workbook finds nothing');
  const order = { get: async (k) => (k === 'personal-leadership-lab-workbook-2026.pdf' ? null : { body: PDF, key: k }), list: async () => ({ objects: [{ key: 'built-to-lead.pdf' }, { key: 'founders-growth-manual.pdf' }, { key: 'Manual Personal-Leadership-LAB-Workbook.pdf' }] }) };
  ok((await workbookFile(order)).key === 'Manual Personal-Leadership-LAB-Workbook.pdf', 'with the HUB books listed first: the workbook, never a HUB book');
}

// ── Never in this public repo; no preview below the HUB ───────────────────
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (f === 'node_modules' || f === '.git') continue; if (statSync(p).isDirectory()) walk(p); else if (/^(built-to-lead|founders-growth-manual)(-preview)?\.pdf$/i.test(f)) files.push(p); } };
walk('.');
ok(files.length === 0, 'no HUB book and no preview of one anywhere in the repo: ' + files.join(', '));

// ── Every shelf: both books, the note, the whole card to the page ─────────
const app = readFileSync('public/app.js', 'utf8');
ok(/: b\.hub[\s\S]{0,400}hub-card[\s\S]{0,600}HUB_NOTE[\s\S]{0,300}joined && hasHub \?[\s\S]{0,200}Download your copy[\s\S]{0,200}class="hub-go" href="\$\{esc\(b\.page\)\}" target="_blank"/.test(app), 'Base Camp: Download for The HUB and The Summit; for everyone else the whole card opens the book’s page, with the note');
const css = readFileSync('public/style.css', 'utf8');
ok(/\.hub-card \.hub-go::after\{content:"";position:absolute;inset:0\}/.test(css) && /\.hub-card:focus-within\{outline/.test(css), 'the whole card is the link, and its focus shows');
const kit = markup(LIBRARY, 20);
ok((kit.match(/Only available with the HUB/g) || []).length === 2 && kit.includes('Built to Lead') && kit.includes('The Founder’s Growth Manual') && !/<a\s/i.test(kit), 'road2 kit (one button only, no links out): both books, with the note');
const SHELVES = ['public/road1/index.html', 'public/road3/index.html', 'public/north2/index.html', 'public/cabinet.js'];
{ const t = readFileSync('public/toolkit/index.html', 'utf8'); ok((t.match(/Only available with the HUB\./g) || []).length === 2 && t.includes('Built to Lead') && t.includes('The Founder’s Growth Manual'), 'the toolkit page (no links out): both books, with the note'); }
for (const p of SHELVES) {
  const s = readFileSync(p, 'utf8');
  ok(s.includes('https://exploraself.com/built-to-lead') && s.includes('https://exploraself.com/founders-growth-manual'), `${p}: both books, each to its page`);
  ok(/only available with the HUB|Only available with the HUB|HUB_NOTE/.test(s) && !/available with the hub/.test(s), `${p}: the note, with HUB in capitals`);
  ok(!/built-to-lead-preview|founders-growth-manual-preview/.test(s), `${p}: no preview below the HUB`);
}
const FREE = /(Built to Lead|Growth Manual)[^.\n]{0,60}\bfree\b|\bfree\b[^.\n]{0,40}(Built to Lead|Growth Manual)|Built to Lead \(99 tools\)(?!.{0,80}HUB)|99 practical tools, the digital copy/i;
for (const p of ['public/app.js', 'public/cabinet.js', 'public/content.js', 'public/north2/index.html', 'public/north3/kit.js', 'public/road1/index.html', 'public/road3/index.html', 'public/toolkit/index.html']) {
  ok(!FREE.test(readFileSync(p, 'utf8')), `${p}: a HUB book is never called free`);
}

// ── The letters ─────────────────────────────────────────────────────────────
const letterText = JSON.stringify(SERIES_LETTERS) + JSON.stringify(COURSE_LETTERS);
ok(!/open Built to Lead in your library|Built to Lead, 99 tools \(free/.test(letterText), 'no letter calls Built to Lead free');
ok((letterText.match(/P\.S\. Built to Lead: 99 practical tools\. See what’s inside: https:\/\/exploraself\.com\/built-to-lead/g) || []).length === 7, 'the seven pain letters: “Built to Lead: 99 practical tools. See what’s inside” → its page');
ok((JSON.stringify(COURSE_LETTERS).match(/open Worth Building in your library: 32 frameworks, free with your account/g) || []).length === 2, '12 Days: its two library lines now offer Worth Building, which is free');
ok(launchpadWelcome('https://linktolead.exploraself.com', { first: 'Sam', offer: 'library' }).text.includes('open Worth Building in your library: 32 frameworks, free with your account.'), 'the welcome’s library P.S. offers Worth Building');
done();
