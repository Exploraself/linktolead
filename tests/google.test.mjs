// "Continue with Google" (31 Oct 2026): Google proves the email, so an
// existing account opens and a new address gets the free account, with the
// consent the founder ticked and the page they came from. Nothing from the
// token counts before it is checked: our client id, Google as issuer, a
// verified address, not expired. Off until GOOGLE_CLIENT_ID is set.

import fs from 'node:fs';
import { onRequestGet as gGet, onRequestPost as gPost } from '../functions/api/google.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { verifyGoogle } from '../functions/_google.js';
import { fakeD1, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('google');
const CID = '1234-abc.apps.googleusercontent.com';
const exp = String(Math.floor(Date.now() / 1000) + 600);
const base = { iss: 'https://accounts.google.com', aud: CID, email_verified: 'true', exp, sub: '42' };
const TOKENS = {
  'tok-new-founder-000000001': { ...base, email: 'Nina@Example.com', given_name: 'Nina', family_name: 'Moss', name: 'Nina Moss' },
  'tok-existing-00000000001': { ...base, email: 'sam@example.com', given_name: 'Samuel', family_name: 'R' },
  'tok-paused-0000000000001': { ...base, email: 'pat@example.com', given_name: 'Pat' },
  'tok-other-aud-0000000001': { ...base, aud: 'someone-else.apps.googleusercontent.com', email: 'x@example.com' },
  'tok-bad-iss-000000000001': { ...base, iss: 'evil.example.com', email: 'x@example.com' },
  'tok-unverified-000000001': { ...base, email_verified: 'false', email: 'x@example.com' },
  'tok-expired-000000000001': { ...base, exp: String(Math.floor(Date.now() / 1000) - 5), email: 'x@example.com' },
};
const sent = [];
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://oauth2.googleapis.com/tokeninfo')) {
    const p = TOKENS[new URL(u).searchParams.get('id_token')];
    return p ? { ok: true, json: async () => p } : { ok: false, json: async () => ({ error: 'invalid_token' }) };
  }
  if (u.includes('api.resend.com')) { sent.push(JSON.parse(opts.body)); return { ok: true }; }
  return { ok: false, status: 503, headers: new Headers(), text: async () => 'offline', json: async () => ({}) };
};
const J = async (r) => [r.status, await r.json()];

// ── Off until the client id is set ──────────────────────────────────────────
const DB = fakeD1();
let [code, out] = await J(gGet({ env: { DB } }));
ok(code === 200 && out.ready === false && !out.clientId, 'GET: off without GOOGLE_CLIENT_ID, so no button shows');
[code] = await J(await gPost({ request: post('/api/google', { credential: 'tok-new-founder-000000001' }), env: { DB } }));
ok(code === 503, 'POST: refused while it is off');

const env = { DB, GOOGLE_CLIENT_ID: CID, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
[code, out] = await J(gGet({ env }));
ok(out.ready === true && out.clientId === CID, 'GET: on, with the public client id');

// ── The checks on the token ─────────────────────────────────────────────────
for (const t of ['tok-other-aud-0000000001', 'tok-bad-iss-000000000001', 'tok-unverified-000000001', 'tok-expired-000000000001', 'tok-unknown-0000000000001', 'short']) {
  ok((await verifyGoogle(env, t)) === null, `verify: refused (${t})`);
}
[code, out] = await J(await gPost({ request: post('/api/google', { credential: 'tok-other-aud-0000000001' }), env }));
ok(code === 401 && /Google could not confirm/.test(out.error), 'POST: a token for another app is refused, in plain words');

// ── A new address: the free account, as the simple form makes it ───────────
[code, out] = await J(await gPost({ request: post('/api/google', { credential: 'tok-new-founder-000000001', consent: true, landing: 'north3', source: 'sales-page', utm: { utm_source: 'meta' } }), env }));
ok(code === 200 && out.token && out.existing === false && out.me.email === 'nina@example.com' && out.me.first === 'Nina', 'new: an account, signed in, the email in lower case');
ok(out.missing.join() === 'company,interest,industry,password', 'new: it says what a full account still lacks');
const nina = DB.raw.prepare("SELECT s.name, p.signup_type, p.landing, p.utm_source, p.consent FROM student s JOIN student_profile p ON p.student_id = s.id WHERE s.email = 'nina@example.com'").get();
ok(nina && nina.name === 'Nina Moss' && nina.signup_type === 'simple' && nina.landing === 'north3' && nina.utm_source === 'meta' && nina.consent, 'new: name, landing page, utm and consent kept');
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'signup' AND detail = 'sales-page · google'").get().n === 1, 'new: the sign-up is logged as Google');
ok(sent.length === 1 && sent[0].to[0] === 'nina@example.com' && Array.isArray(sent[0].attachments), 'new + consent: the North Star welcome, with the plan attached');
const st = await (await stateGet({ request: get(`/api/state?t=${out.token}`), env })).json();
ok(st.me.missing.length === 4 && st.me.hasPassword === false, 'new: the Blueprint will ask once for the rest, as for every account');

// No consent: the account, and nothing emailed.
TOKENS['tok-quiet-0000000000001'] = { ...base, email: 'quiet@example.com', given_name: 'Q' };
await gPost({ request: post('/api/google', { credential: 'tok-quiet-0000000000001' }), env });
ok(sent.length === 1, 'new without consent: nothing is emailed');

// ── An address that already has an account: it opens ────────────────────────
const [, s1] = await J(await signup({ request: post('/api/signup', { first: 'Sam', last: 'Ray', email: 'sam@example.com', type: 'simple', landing: 'road3' }), env }));
[code, out] = await J(await gPost({ request: post('/api/google', { credential: 'tok-existing-00000000001', consent: true }), env }));
ok(code === 200 && out.token === s1.token && out.existing === true && out.me.first === 'Sam', 'existing: the same account opens, with its own name');
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM student WHERE email = 'sam@example.com'").get().n === 1, 'existing: never a second account');
ok(sent.length === 1, 'existing: no welcome letter again');

// ── A paused account stays closed ──────────────────────────────────────────
await signup({ request: post('/api/signup', { first: 'Pat', last: 'Lee', email: 'pat@example.com', type: 'full', company: 'Lee Co', interest: 'Steady clients', industry: 'Other', password: 'a long enough secret', confirm: 'a long enough secret' }), env });
DB.raw.exec("UPDATE account_auth SET paused = 1 WHERE student_id = (SELECT id FROM student WHERE email = 'pat@example.com')");
[code, out] = await J(await gPost({ request: post('/api/google', { credential: 'tok-paused-0000000000001' }), env }));
ok(code === 403 && !out.token, 'paused: told so, no token');

// ── Wiring ──────────────────────────────────────────────────────────────────
ok(/'\/api\/google': google/.test(fs.readFileSync('worker.js', 'utf8')), 'worker.js routes /api/google');
const box = fs.readFileSync('public/account-box.js', 'utf8'), app = fs.readFileSync('public/app.js', 'utf8'), ns = fs.readFileSync('public/northstar/app.js', 'utf8');
ok(box.includes("googleSlot('j-consent')") && app.includes('${googleSlot()}') && ns.includes("gSlot('g-consent')") && ns.includes("gSlot('')"), 'the button sits in the sales-page box, the Blueprint sign-in, and the North Star sign-in and gate');
ok(fs.readFileSync('public/google.js', 'utf8').includes('hidden') && !/client_secret/i.test(fs.readFileSync('functions/_google.js', 'utf8')), 'hidden until switched on; no secret anywhere');

done();
