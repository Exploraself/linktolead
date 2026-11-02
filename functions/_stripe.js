// Payments with Stripe (Alexandru, 2 Nov 2026): a founder pays for the next
// step, the step opens the moment Stripe confirms the payment, and an
// "It's unlocked" letter says what opened, which sessions they now have and
// how to book them.
//
// Settings in Cloudflare (never in this repo, never in a chat):
//   STRIPE_SECRET_KEY  a restricted key (rk_test_… first, then rk_live_…) with
//                      Checkout Sessions: Write and Webhook Endpoints: Write.
// The webhook is connected by the site itself, the first time it is needed:
// it creates its own endpoint in Stripe and keeps the endpoint's signing
// secret in the database (stripe_setting), one per mode, so moving from the
// test key to the live key connects the live webhook on its own.
//
// A step opens only when Stripe itself says the payment is paid: through the
// signed webhook, or when the founder comes back from Stripe and the site asks
// Stripe about that exact session. Both paths go through applyPaid(), which
// records the session once, so a step never opens twice and a letter never
// goes twice (AGENTS.md rule 6: never claim a payment we have not seen).

import { now } from './_shared.js';
import { send, mailState } from './_mail.js';
import { unlockedLetter, FIRST_NEW } from './_letters.js';
import { syncFounder } from './_mailchimp.js';
import { unsubLink } from './_account.js';
import { letterContext } from './_mentor.js';

/** What each step costs (cents, USD) and what it opens. Prices = LADDER in
 *  public/content.js (a test holds them equal). */
export const STEPS = {
  session: { amount: 2700, name: 'The Boardroom', product: 'The Boardroom · one session with Alexandru', opens: 'Levels 04 and 05', first: 4,
    sessions: 'one 1:1 session with Alexandru; Alexandru and the team read your first three levels before you speak' },
  lab: { amount: 9700, name: 'The LAB', product: 'Personal Leadership LAB', opens: 'Levels 06 to 09, and the library', first: 6,
    sessions: 'two 1:1 sessions with Alexandru' },
  hub: { amount: 75000, name: 'The HUB', product: 'Business Growth HUB · the full Blueprint', opens: 'every level up to 12, with the LAB included', first: 10,
    sessions: 'three 1:1 sessions with Alexandru in total, including the one from the LAB' },
  premium: { amount: 198900, name: 'The Summit', product: 'The Summit · everything, and Alexandru every week', opens: 'all twelve levels, the LAB, the HUB and every resource', first: 4,
    sessions: 'Alexandru mentoring you every week' },
};
/** The ladder's order (functions/_mailchimp.js TIER_ORDER). */
export const ORDER = ['free', 'session', 'lab', 'hub', 'premium'];
export const above = (step, tier) => ORDER.indexOf(step) > ORDER.indexOf(tier || 'free');
export const dollars = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;

/** The key as pasted, forgiving quote marks and a "Bearer " in front. */
const key = (env) => String((env && env.STRIPE_SECRET_KEY) || '').trim()
  .replace(/^bearer\s+/i, '').replace(/^(["'`])(.*)\1$/s, '$2').trim();
/** Why the key in Cloudflare cannot be used, in plain words ('' when it can).
 *  It names the kind of value only, never the value itself. */
export function keyProblem(env) {
  const k = key(env);
  if (!k) return 'STRIPE_SECRET_KEY is not set in Cloudflare.';
  if (/^(rk|sk)_(test|live)_\S+$/.test(k)) return '';
  const fix = ' In Cloudflare, edit STRIPE_SECRET_KEY and paste the restricted key from Stripe: it starts with rk_test_.';
  if (/^pk_/.test(k)) return 'STRIPE_SECRET_KEY holds the publishable key (it starts with pk_). That one cannot take payments.' + fix;
  if (/^whsec_/.test(k)) return 'STRIPE_SECRET_KEY holds a webhook signing secret (it starts with whsec_). The code makes its own.' + fix;
  if (/\s/.test(k)) return 'STRIPE_SECRET_KEY has spaces or extra words in it.' + fix;
  return `STRIPE_SECRET_KEY is set, but it is not a Stripe key (${k.length} characters, and it does not start with rk_test_).` + fix;
}
/** 'test', 'live' or '' (no key, or not a Stripe key). */
export function stripeMode(env) {
  const k = key(env);
  if (keyProblem(env)) return '';
  if (/^(rk|sk)_test_/.test(k)) return 'test';
  if (/^(rk|sk)_live_/.test(k)) return 'live';
  return '';
}

/** Stripe's form encoding: { a: { b: 1 }, c: ['x'] } → a[b]=1&c[0]=x. */
export function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null) continue;
    const name = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, name, out);
    else out.append(name, String(v));
  }
  return out;
}

/** One call to Stripe. Never throws: { ok, status, data, why }. */
export async function stripe(env, method, path, params) {
  const k = key(env);
  if (!stripeMode(env)) return { ok: false, status: 0, why: 'Stripe is not connected yet: ' + keyProblem(env) };
  try {
    const body = method === 'GET' ? null : form(params).toString();
    const q = method === 'GET' && params ? `?${form(params)}` : '';
    const r = await fetch(`https://api.stripe.com/v1/${path}${q}`, { method,
      headers: { authorization: `Bearer ${k}`, ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}), 'stripe-version': '2024-06-20' }, ...(body ? { body } : {}) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, status: r.status, data, why: (data && data.error && data.error.message) || `Stripe said no (HTTP ${r.status}).` };
    return { ok: true, status: r.status, data };
  } catch (e) {
    return { ok: false, status: 0, why: `Could not reach Stripe: ${String((e && e.message) || e).slice(0, 160)}` };
  }
}

async function tables(D) {
  await D.batch([
    D.prepare('CREATE TABLE IF NOT EXISTS stripe_setting (k TEXT PRIMARY KEY, v TEXT NOT NULL, at TEXT NOT NULL)'),
    D.prepare(`CREATE TABLE IF NOT EXISTS payment (session TEXT PRIMARY KEY, student_id TEXT NOT NULL, step TEXT NOT NULL,
      amount INTEGER NOT NULL, currency TEXT NOT NULL, mode TEXT NOT NULL, from_tier TEXT, at TEXT NOT NULL)`),
  ]);
}

const WEBHOOK_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
/** The webhook for this mode: { id, secret }, made the first time it is
 *  needed. An older endpoint for the same address (whose secret we no longer
 *  hold) is removed first, so Stripe never calls twice. */
export async function ensureWebhook(env, D, base) {
  const mode = stripeMode(env);
  if (!mode) return { ok: false, why: 'Stripe is not connected yet.' };
  await tables(D);
  const k = `webhook.${mode}`;
  const row = await D.prepare('SELECT v FROM stripe_setting WHERE k = ?').bind(k).first();
  if (row) { try { const v = JSON.parse(row.v); if (v.secret) return { ok: true, ...v }; } catch { /* rebuild below */ } }
  const url = `${base}/api/stripe-webhook`;
  const list = await stripe(env, 'GET', 'webhook_endpoints', { limit: 100 });
  if (list.ok) for (const e of list.data.data || []) if (e.url === url) await stripe(env, 'DELETE', `webhook_endpoints/${e.id}`);
  const made = await stripe(env, 'POST', 'webhook_endpoints', { url, enabled_events: WEBHOOK_EVENTS, description: 'ExploraSelf: open the step that was paid' });
  if (!made.ok) return { ok: false, why: made.why };
  const v = { id: made.data.id, secret: made.data.secret, url };
  await D.prepare('INSERT OR REPLACE INTO stripe_setting (k, v, at) VALUES (?,?,?)').bind(k, JSON.stringify(v), now()).run();
  return { ok: true, ...v };
}

/** A Stripe Checkout page for one founder and one step. */
export async function checkout(env, D, base, me, step) {
  const S = STEPS[step];
  if (!S) return { ok: false, why: 'There is no such step.' };
  if (!above(step, me.tier)) return { ok: false, why: `${S.name} is already open for you.`, open: true };
  await ensureWebhook(env, D, base).catch(() => null); // best effort: coming back from Stripe also opens the step
  const r = await stripe(env, 'POST', 'checkout/sessions', {
    mode: 'payment',
    line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: S.amount, product_data: { name: S.product, description: `Opens ${S.opens}. Includes ${S.sessions}.` } } }],
    customer_email: me.email,
    client_reference_id: me.id,
    metadata: { student: me.id, step },
    payment_intent_data: { metadata: { student: me.id, step } },
    success_url: `${base}/pay/?step=${step}&cs={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/pay/?step=${step}&cancelled=1`,
  });
  return r.ok ? { ok: true, url: r.data.url, id: r.data.id } : { ok: false, why: r.why };
}

/** Stripe's signature: "t=…,v1=…". HMAC-SHA256 of "t.payload" with the
 *  endpoint's secret, within five minutes. */
export async function verifySignature(payload, header, secret, at = Date.now(), tolerance = 300) {
  const parts = Object.fromEntries(String(header || '').split(',').map((p) => p.split('=')).filter((p) => p.length === 2).map(([a, b]) => [a.trim(), b.trim()]));
  const all = String(header || '').split(',').filter((p) => p.trim().startsWith('v1=')).map((p) => p.trim().slice(3));
  const t = Number(parts.t);
  if (!secret || !t || !all.length || Math.abs(at / 1000 - t) > tolerance) return false;
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${t}.${payload}`)));
  const hex = [...sig].map((b) => b.toString(16).padStart(2, '0')).join('');
  const same = (a, b) => { if (a.length !== b.length) return false; let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0; };
  return all.some((v) => same(v, hex));
}

/**
 * A Checkout Session Stripe says is paid: record it once, open the step (a
 * step only ever goes up), log it on the founder's climb, send the step tags
 * to Mailchimp, and send the "It's unlocked" letter. Returns { ok, opened,
 * already, step, why }.
 */
export async function applyPaid(env, D, base, s) {
  if (!s || s.object !== 'checkout.session' || s.payment_status !== 'paid') return { ok: false, why: 'Not paid yet.' };
  const step = s.metadata && s.metadata.step, id = (s.metadata && s.metadata.student) || s.client_reference_id;
  const S = STEPS[step];
  if (!S || !id) return { ok: false, why: 'This payment is not for a step.' };
  if (Number(s.amount_total) !== S.amount || String(s.currency).toLowerCase() !== 'usd') return { ok: false, why: 'The amount does not match the step.' };
  await tables(D);
  const me = await D.prepare('SELECT id, email, name, tier FROM student WHERE id = ?').bind(id).first();
  if (!me) return { ok: false, why: 'No such founder.' };
  const put = await D.prepare('INSERT OR IGNORE INTO payment (session, student_id, step, amount, currency, mode, from_tier, at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(s.id, me.id, step, S.amount, 'usd', s.livemode ? 'live' : 'test', me.tier || 'free', now()).run();
  if (!put.meta || !put.meta.changes) {
    const was = await D.prepare('SELECT from_tier FROM payment WHERE session = ?').bind(s.id).first();
    return { ok: true, already: true, step, first: FIRST_NEW[(was && was.from_tier) || 'free'] || 4 };
  }
  const opened = above(step, me.tier);
  if (opened) {
    await D.prepare('UPDATE student SET tier = ? WHERE id = ?').bind(step, me.id).run();
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
      .bind(me.id, 'mentor-step', now(), JSON.stringify({ from: me.tier || 'free', to: step, by: 'stripe', session: s.id })).run();
    await syncFounder(env, D, me.id, 'tags').catch(() => null);
  }
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'paid', now(), JSON.stringify({ step, amount: S.amount, session: s.id })).run();
  if (mailState(env).ready) {
    const p = await D.prepare('SELECT unsub_id FROM student_profile WHERE student_id = ?').bind(me.id).first();
    const ctx = await letterContext(D, me.id);
    const first = String(me.name || '').trim().split(/\s+/)[0] || '';
    // A receipt of what they bought: sent even to a founder who turned
    // letters off, because it is about their own payment.
    const r = await send(env, { to: me.email, ...unlockedLetter(base, { first, to: me.email, step, from: me.tier || 'free', ...ctx }),
      why: `You paid for ${S.name} at linktolead.exploraself.com.`, unsubUrl: unsubLink(base, p) });
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, r.ok ? 'unlocked-letter' : 'unlocked-letter-failed', now(), r.ok ? step : (r.why || step)).run();
  }
  return { ok: true, opened, step, first: FIRST_NEW[me.tier || 'free'] || 4 };
}

/** The signing secret of this mode's webhook (STRIPE_WEBHOOK_SECRET in
 *  Cloudflare wins, for a webhook made by hand in Stripe). */
export async function webhookSecret(D, env) {
  const set = String((env && env.STRIPE_WEBHOOK_SECRET) || '').trim();
  if (set) return set;
  const mode = stripeMode(env);
  if (!mode) return '';
  await tables(D);
  const row = await D.prepare('SELECT v FROM stripe_setting WHERE k = ?').bind(`webhook.${mode}`).first();
  try { return row ? JSON.parse(row.v).secret || '' : ''; } catch { return ''; }
}
export { WEBHOOK_EVENTS };

/** The payments for /mentor, newest first. */
export async function payments(D, limit = 30) {
  await tables(D);
  const rows = await D.prepare(`SELECT p.session, p.step, p.amount, p.mode, p.from_tier, p.at, s.name, s.email FROM payment p
    LEFT JOIN student s ON s.id = p.student_id ORDER BY p.at DESC LIMIT ?`).bind(limit).all();
  return rows.results || [];
}
export async function webhookState(D, env) {
  const mode = stripeMode(env);
  if (!mode) return { mode: '', connected: false, problem: keyProblem(env) };
  await tables(D);
  const row = await D.prepare('SELECT v, at FROM stripe_setting WHERE k = ?').bind(`webhook.${mode}`).first();
  return { mode, connected: !!row, at: row ? row.at : null };
}
