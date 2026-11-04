// The LAB workbook (GET /api/workbook): only for The LAB, The HUB and The
// Summit, served from the private WORKBOOKS bucket, logged, never public.

import { onRequestGet as workbook, WORKBOOK_TIERS, WORKBOOK_KEY, holdsWorkbook } from '../functions/api/workbook.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { fakeD1, post, tally } from './_d1.mjs';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const { ok, done } = tally('workbook');
globalThis.fetch = async (url) => ({ ok: true, status: 200, headers: new Headers(), text: async () => '{}', json: async () => ({}) });

const PDF = new TextEncoder().encode('%PDF-1.7 test');
const bucket = (has = true) => ({ get: async (k) => (has && k === WORKBOOK_KEY ? { body: PDF } : null) });
const env0 = (extra = {}) => ({ DB: fakeD1(), ...extra });
const join_ = async (env) => (await (await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true }), env })).json()).token;
const setTier = (env, tier) => env.DB.raw.prepare('UPDATE student SET tier = ?').run(tier);
const hit = (env, t) => workbook({ request: new Request(`https://x/api/workbook${t ? `?t=${t}` : ''}`), env });

ok(WORKBOOK_TIERS.join() === 'lab,hub,premium' && holdsWorkbook('lab') && holdsWorkbook('premium') && !holdsWorkbook('session') && !holdsWorkbook('free') && !holdsWorkbook(null), 'only The LAB, The HUB and The Summit hold the workbook');

let env = env0({ WORKBOOKS: bucket() });
let r = await hit(env);
ok(r.status === 302 && /\/ground-plan\/.*#signin$/.test(r.headers.get('location')), 'not signed in: to sign-in');
const t = await join_(env);
r = await hit(env, t);
ok(r.status === 302 && r.headers.get('location').endsWith('/pay/?step=lab'), 'a free founder is sent to pay for The LAB, never given the file');
setTier(env, 'session');
r = await hit(env, t);
ok(r.status === 302 && r.headers.get('location').endsWith('/pay/?step=lab'), 'The Boardroom does not hold the workbook');
for (const tier of ['lab', 'hub', 'premium']) {
  setTier(env, tier);
  r = await hit(env, t);
  const body = new Uint8Array(await r.arrayBuffer());
  ok(r.status === 200 && r.headers.get('content-type') === 'application/pdf' && /attachment/.test(r.headers.get('content-disposition')) && /no-store/.test(r.headers.get('cache-control')) && body.length === PDF.length, `${tier}: the PDF, as a private download`);
}
const logged = env.DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'workbook-download'").all()[0].n;
ok(logged === 3, 'each download is logged');

const env2 = env0();
const t2 = await join_(env2); setTier(env2, 'lab');
r = await hit(env2, t2);
ok(r.status === 503 && /not ready to download yet/.test(await r.text()), 'no bucket bound yet: a plain page that says so, never a broken file');
const env3 = env0({ WORKBOOKS: bucket(false) });
const t3 = await join_(env3); setTier(env3, 'hub');
r = await hit(env3, t3);
ok(r.status === 503, 'the bucket without the file: the same plain page');

// The page: the button shows only for the steps that hold it.
const app = readFileSync('public/app.js', 'utf8');
ok(/const WORKBOOK_TIERS = \['lab', 'hub', 'premium'\];/.test(app) && /if \(!WORKBOOK_TIERS\.includes\(state\.tier \|\| 'free'\)\) return '';/.test(app) && app.includes('Download your workbook'), 'Base Camp: “Download your workbook” only for The LAB, The HUB and The Summit');
ok(/\$\{workbookHTML\(\)\}/.test(app), 'Base Camp home shows it');

// Paid content never sits in this public repo.
const pdfs = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (f === 'node_modules' || f === '.git') continue; if (statSync(p).isDirectory()) walk(p); else if (/workbook/i.test(f) && /\.(pdf|pptx)$/i.test(f)) pdfs.push(p); } };
walk('.');
ok(pdfs.length === 0, 'no workbook PDF or PPTX in the repo: ' + pdfs.join(', '));

// The check (4 Nov 2026): yes/no only, nothing paid.
const chk = async (env) => (await workbook({ request: new Request('https://linktolead.exploraself.com/api/workbook?check=1'), env })).json();
const c1 = await chk(env0({ WORKBOOKS: bucket() })), c2 = await chk(env0({ WORKBOOKS: bucket(false) })), c3 = await chk(env0());
ok(c1.ok && c1.bucket && c1.file && !c2.ok && c2.bucket && !c2.file && !c3.ok && !c3.bucket, 'the check says whether the site sees the bucket and the PDF, and nothing more');
const appjs = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
ok(!/workbookHref\(\)\)\}" download>/.test(appjs) && !/libraryHref\([mb]\.k\)\)\}" download>/.test(appjs), 'no download attribute: a page that comes back is shown, never saved as download.html');
ok(/\[\[r2_buckets\]\]\s*binding = "WORKBOOKS"\s*bucket_name = "exploraself-workbooks"/.test(readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8')), 'the Worker deploy carries the workbook bucket');
done();
