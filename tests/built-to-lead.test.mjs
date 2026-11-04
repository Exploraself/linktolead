// Built to Lead is HUB material (Alexandru, 4 Nov 2026): the 99 practical
// tools open only with The HUB and The Summit, from the private WORKBOOKS
// bucket, never from this public repo; the LAB workbook's fallback never picks
// it; it stays on every shelf, marked "in the HUB"; no page or letter calls it
// free. Worth Building (32 frameworks) stays free.

import { onRequestGet as library, LIBRARY_ITEMS, HUB_BOOK_TIERS, HUB_PAGE, LIBRARY_R2_KEYS, holdsHubBook } from '../functions/api/library.js';
import { workbookFile } from '../functions/api/workbook.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { LIBRARY } from '../public/content.js';
import { SERIES_LETTERS } from '../functions/_series-letters.js';
import { COURSE_LETTERS } from '../functions/_course-letters.js';
import { launchpadWelcome } from '../functions/_letters.js';
import { fakeD1, post, tally } from './_d1.mjs';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const { ok, done } = tally('built-to-lead');
globalThis.fetch = async () => ({ ok: true, status: 200, headers: new Headers(), text: async () => '{}', json: async () => ({}) });

const KEY = 'built-to-lead.pdf';
const PDF = new TextEncoder().encode('%PDF-1.7 built to lead');
const bucket = (has = true) => ({ get: async (k) => (has && k === KEY ? { body: PDF } : null) });
const env0 = (extra = {}) => ({ DB: fakeD1(), ...extra });
const join_ = async (env) => (await (await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true }), env })).json()).token;
const setTier = (env, tier) => env.DB.raw.prepare('UPDATE student SET tier = ?').run(tier);
const hit = (env, t, extra = '') => library({ request: new Request(`https://linktolead.exploraself.com/api/library?item=btl${t ? `&t=${t}` : ''}${extra}`), env });

// ── Who opens it ────────────────────────────────────────────────────────────
ok(LIBRARY_ITEMS.btl.r2 === KEY && !LIBRARY_ITEMS.btl.file && JSON.stringify(LIBRARY_R2_KEYS) === JSON.stringify([KEY]), 'Built to Lead: a key in the private bucket, no public file; the only HUB book');
ok(LIBRARY_ITEMS.wb.file === '/library/worth-building.pdf' && !LIBRARY_ITEMS.wb.r2 && existsSync('public/library/worth-building.pdf'), 'Worth Building stays free, as before');
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
  ok(r.status === 200 && r.headers.get('content-type') === 'application/pdf' && r.headers.get('content-disposition') === 'attachment; filename="Built-to-Lead.pdf"' && /no-store/.test(r.headers.get('cache-control')) && body.length === PDF.length, `${tier}: the PDF, as a private download`);
}
const logged = env.DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'library-download' AND detail = 'btl'").all()[0].n;
ok(logged === 2, 'each HUB download is logged like any library book');
{
  const r = await hit(env, '');
  ok(r.status === 302 && /\/north3\/#join$/.test(r.headers.get('location')), 'not signed in: to the account first, like every library book');
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
  ok((await workbookFile(only)) === null, 'a bucket holding only Built to Lead: the LAB workbook finds nothing');
  const order = { get: async (k) => (k === 'personal-leadership-lab-workbook-2026.pdf' ? null : { body: PDF, key: k }), list: async () => ({ objects: [{ key: KEY }, { key: 'Manual Personal-Leadership-LAB-Workbook.pdf' }] }) };
  ok((await workbookFile(order)).key === 'Manual Personal-Leadership-LAB-Workbook.pdf', 'with both in the bucket, Built to Lead listed first: the workbook, never Built to Lead');
}

// ── Never in this public repo; on every shelf; never called free ──────────
ok(!existsSync('public/library/built-to-lead.pdf') && existsSync('public/library/built-to-lead-preview.pdf') && existsSync('public/library/cover-built-to-lead.jpg'), 'the full PDF is gone; the free preview and the cover stay');
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (f === 'node_modules' || f === '.git') continue; if (statSync(p).isDirectory()) walk(p); else if (/^built-to-lead\.pdf$/i.test(f)) files.push(p); } };
walk('.');
ok(files.length === 0, 'no built-to-lead.pdf anywhere in the repo: ' + files.join(', '));

const btl = LIBRARY.books.find((b) => b.k === 'btl');
ok(btl && btl.hub && !btl.file && btl.preview === '/library/built-to-lead-preview.pdf' && btl.page === 'https://exploraself.com/built-to-lead' && /in the HUB/.test(btl.kicker), 'the library card: in the HUB, the free first pages, its page, no file');
const app = readFileSync('public/app.js', 'utf8');
ok(/b\.hub\s*\n?[\s\S]{0,400}joined && hasHub \?[\s\S]{0,200}Download your copy[\s\S]{0,200}See what’s inside ↗/.test(app), 'Base Camp: Download for The HUB and The Summit, See what’s inside for everyone else');

const SHELVES = { 'public/cabinet.js': 'In the HUB', 'public/road1/index.html': '99 practical tools · in the HUB', 'public/road3/index.html': 'Built to Lead with the HUB', 'public/north2/index.html': 'Built to Lead (99 tools) with the HUB', 'public/toolkit/index.html': '99 practical tools, with the HUB' };
for (const [p, mark] of Object.entries(SHELVES)) ok(readFileSync(p, 'utf8').includes('cover-built-to-lead.jpg') || readFileSync(p, 'utf8').includes(mark), `${p}: Built to Lead is still on the shelf`);
for (const [p, mark] of Object.entries(SHELVES)) ok(readFileSync(p, 'utf8').includes(mark), `${p}: marked “${mark}”`);
const FREE = /Built to Lead[^.\n]{0,60}\bfree\b|\bfree\b[^.\n]{0,40}Built to Lead|Built to Lead \(99 tools\)(?! with the HUB)|99 practical tools, the digital copy/i;
for (const p of ['public/app.js', 'public/cabinet.js', 'public/content.js', 'public/north2/index.html', 'public/north3/kit.js', 'public/road1/index.html', 'public/road3/index.html', 'public/toolkit/index.html']) {
  ok(!FREE.test(readFileSync(p, 'utf8').replace(/Built to Lead (comes )?with the HUB/g, '')), `${p}: Built to Lead is never called free`);
}

// ── The letters ─────────────────────────────────────────────────────────────
const letterText = JSON.stringify(SERIES_LETTERS) + JSON.stringify(COURSE_LETTERS);
ok(!/open Built to Lead in your library|Built to Lead, 99 tools \(free/.test(letterText), 'no letter calls Built to Lead free');
ok((letterText.match(/P\.S\. Built to Lead: 99 practical tools\. See what’s inside: https:\/\/exploraself\.com\/built-to-lead/g) || []).length === 7, 'the seven pain letters: “Built to Lead: 99 practical tools. See what’s inside” → its page');
ok((JSON.stringify(COURSE_LETTERS).match(/open Worth Building in your library: 32 frameworks, free with your account/g) || []).length === 2, '12 Days: its two library lines now offer Worth Building, which is free');
ok(launchpadWelcome('https://linktolead.exploraself.com', { first: 'Sam', offer: 'library' }).text.includes('open Worth Building in your library: 32 frameworks, free with your account.'), 'the welcome’s library P.S. offers Worth Building');
done();
