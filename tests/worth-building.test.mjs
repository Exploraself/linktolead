// Worth Building is HUB material (Alexandru, 4 Nov 2026): the 32 frameworks
// open only with The HUB and The Summit, from the private WORKBOOKS bucket,
// never from this public repo; the LAB workbook's fallback never picks it;
// no page or letter calls it free.

import { onRequestGet as library, LIBRARY_ITEMS, HUB_BOOK_TIERS, HUB_PAGE, LIBRARY_R2_KEYS, holdsHubBook } from '../functions/api/library.js';
import { workbookFile } from '../functions/api/workbook.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { LIBRARY } from '../public/content.js';
import { SERIES_LETTERS } from '../functions/_series-letters.js';
import { COURSE_LETTERS } from '../functions/_course-letters.js';
import { fakeD1, post, tally } from './_d1.mjs';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const { ok, done } = tally('worth-building');
globalThis.fetch = async () => ({ ok: true, status: 200, headers: new Headers(), text: async () => '{}', json: async () => ({}) });

const KEY = 'worth-building.pdf';
const PDF = new TextEncoder().encode('%PDF-1.7 worth building');
const bucket = (has = true) => ({ get: async (k) => (has && k === KEY ? { body: PDF } : null) });
const env0 = (extra = {}) => ({ DB: fakeD1(), ...extra });
const join_ = async (env) => (await (await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true }), env })).json()).token;
const setTier = (env, tier) => env.DB.raw.prepare('UPDATE student SET tier = ?').run(tier);
const hit = (env, t, extra = '') => library({ request: new Request(`https://linktolead.exploraself.com/api/library?item=wb${t ? `&t=${t}` : ''}${extra}`), env });

// ── Who opens it ────────────────────────────────────────────────────────────
ok(LIBRARY_ITEMS.wb.r2 === KEY && !LIBRARY_ITEMS.wb.file && LIBRARY_R2_KEYS.includes(KEY), 'Worth Building: a key in the private bucket, no public file');
ok(HUB_BOOK_TIERS.join() === 'hub,premium' && holdsHubBook('hub') && holdsHubBook('premium') && !holdsHubBook('lab') && !holdsHubBook('session') && !holdsHubBook('free') && !holdsHubBook(null), 'only The HUB and The Summit hold it, never The LAB');

const env = env0({ WORKBOOKS: bucket() });
const t = await join_(env);
for (const tier of ['free', 'session', 'lab']) {
  setTier(env, tier);
  const r = await hit(env, t);
  ok(r.status === 302 && r.headers.get('location') === HUB_PAGE, `${tier}: sent to the HUB page, never given the file`);
}
for (const tier of ['hub', 'premium']) {
  setTier(env, tier);
  const r = await hit(env, t);
  const body = new Uint8Array(await r.arrayBuffer());
  ok(r.status === 200 && r.headers.get('content-type') === 'application/pdf' && /attachment; filename="Worth-Building/.test(r.headers.get('content-disposition')) && /no-store/.test(r.headers.get('cache-control')) && body.length === PDF.length, `${tier}: the PDF, as a private download`);
}
const logged = env.DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'library-download' AND detail = 'wb'").all()[0].n;
ok(logged === 2, 'each HUB download is logged like any library book');
{
  const r = await hit(env, '');
  ok(r.status === 302 && /\/north3\/#join$/.test(r.headers.get('location')), 'not signed in: to the free account first, like every library book');
}
{
  const e2 = env0(); const t2 = await join_(e2); setTier(e2, 'hub');
  const r = await hit(e2, t2);
  ok(r.status === 503 && /not ready to download yet/.test(await r.text()), 'no bucket bound: a plain page that says so, never a broken file');
  const e3 = env0({ WORKBOOKS: bucket(false) }); const t3 = await join_(e3); setTier(e3, 'premium');
  ok((await hit(e3, t3)).status === 503, 'the bucket without the file: the same plain page');
}

// ── The check: yes/no only ─────────────────────────────────────────────────
const chk = async (e) => (await hit(e, '', '&check=1')).json();
const c1 = await chk(env0({ WORKBOOKS: bucket() })), c2 = await chk(env0({ WORKBOOKS: bucket(false) })), c3 = await chk(env0());
ok(c1.ok && c1.bucket && c1.file && !c2.ok && c2.bucket && !c2.file && !c3.ok && !c3.bucket && Object.keys(c1).join() === 'ok,bucket,file', '?check=1 says whether the site sees the bucket and the file, and nothing more');

// ── The LAB workbook never picks it ────────────────────────────────────────
{
  const only = { get: async (k) => (k === KEY ? { body: PDF, key: k } : null), list: async () => ({ objects: [{ key: KEY }] }) };
  ok((await workbookFile(only)) === null, 'a bucket holding only Worth Building: the LAB workbook finds nothing');
  const both = { get: async (k) => ({ body: PDF, key: k }), list: async () => ({ objects: [{ key: 'a-' + KEY }, { key: KEY }, { key: 'Manual Personal-Leadership-LAB-Workbook.pdf' }] }) };
  const order = { get: async (k) => (k === 'personal-leadership-lab-workbook-2026.pdf' ? null : { body: PDF, key: k }), list: async () => ({ objects: [{ key: KEY }, { key: 'Manual Personal-Leadership-LAB-Workbook.pdf' }] }) };
  ok((await workbookFile(both)).key !== KEY && (await workbookFile(order)).key === 'Manual Personal-Leadership-LAB-Workbook.pdf', 'with both in the bucket: the workbook, never Worth Building');
}

// ── Never in this public repo, and never called free ───────────────────────
ok(!existsSync('public/library/worth-building.pdf') && existsSync('public/library/worth-building-preview.pdf') && existsSync('public/library/cover-worth-building.jpg'), 'the full PDF is gone; the free preview and the cover stay');
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (f === 'node_modules' || f === '.git') continue; if (statSync(p).isDirectory()) walk(p); else if (/^worth-building\.pdf$/i.test(f)) files.push(p); } };
walk('.');
ok(files.length === 0, 'no worth-building.pdf anywhere in the repo: ' + files.join(', '));

const wb = LIBRARY.books.find((b) => b.k === 'wb');
ok(wb && wb.hub && !wb.file && wb.page === 'https://exploraself.com/worth-building' && /in the HUB/.test(wb.kicker), 'the library card: in the HUB, with its page, no file');
const app = readFileSync('public/app.js', 'utf8');
ok(/b\.hub\s*\n?[\s\S]{0,400}joined && hasHub \?[\s\S]{0,200}Download your copy[\s\S]{0,200}See what’s inside ↗/.test(app), 'Base Camp: Download for The HUB and The Summit, See what’s inside for everyone else');

const FREE = /Worth Building[^.\n]{0,60}\bfree\b|\bfree\b[^.\n]{0,40}Worth Building|Worth Building \(32 frameworks\)(?! with the HUB)|32 leadership frameworks, the digital copy/i;
const PAGES = ['public/app.js', 'public/cabinet.js', 'public/content.js', 'public/north2/index.html', 'public/north3/kit.js', 'public/road1/index.html', 'public/road3/index.html', 'public/toolkit/index.html'];
for (const p of PAGES) ok(!FREE.test(readFileSync(p, 'utf8').replace(/Worth Building (comes )?with the HUB/g, '')), `${p}: Worth Building is never called free`);

const letterText = JSON.stringify(SERIES_LETTERS) + JSON.stringify(COURSE_LETTERS);
ok(!/Worth Building is free|Worth Building, 32 frameworks \(free/.test(letterText), 'no letter calls Worth Building free');
ok((letterText.match(/Worth Building: 32 frameworks\. See what’s inside/g) || []).length === 6 && (letterText.match(/https:\/\/exploraself\.com\/worth-building/g) || []).length >= 6, 'the six letters: “Worth Building: 32 frameworks. See what’s inside” → its page');
done();
