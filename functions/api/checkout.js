// Paying for the next step (functions/_stripe.js, Alexandru 2 Nov 2026).
//
// GET                 what /pay/ needs: is Stripe on, the steps and prices,
//                     and (signed in) the founder's step now
// POST { step }       a Stripe Checkout page for the signed-in founder → { url }
// A product (PRODUCTS, from exploraself.com) is paid the same way; Stripe sends
// the buyer back to exploraself.com, which asks /api/access.
// GET ?cs=…           back from Stripe: asks Stripe about that exact session
//                     and, when Stripe says paid, opens the step (the same
//                     path as the webhook, recorded once)
// Not signed in (Alexandru, 3 Nov 2026: pay first, then the account): POST
// { step, first, email, consent, landing } pays as a guest. Back from Stripe,
// GET ?cs=… with no token makes the account from those (functions/_stripe.js
// guestAccount) and hands its token back only to the payment that made it,
// and only until a password is set. An email that already has an account is
// never signed in this way: the step opens on it, and they sign in as usual.
// The founder's token comes in the x-account-token header (or `token`).
// Already theirs (3 Nov 2026, the whole check): a guest whose email has an
// account that already holds the step (or a higher one) is not sent to pay
// again: { ok: false, signin: true } and the page offers the sign-in.
// The full account right after payment (Alexandru, 6 Nov 2026: "After
// payment: full account"): back from Stripe, the answer carries `missing`,
// what the account still lacks to be full (password, company, interest,
// industry; a Google account is asked for a password too, as at the North
// Star's locks), and /pay/ asks for it there, through /api/complete. A product
// (Unshakeable) also carries `access`, the link that opens it. GET with no cs
// carries `owned`: { product: access } for the signed-in account
// ("Already bought? Sign in" on exploraself.com).

import { json, bad, db, accountTables, studentBy, clean, looksLikeEmail } from '../_shared.js';
import { origin } from '../_mail.js';
import { checkout, stripe, applyPaid, guestOf, STEPS, PRODUCTS, stripeMode, dollars, above, accessUrl, productsOf } from '../_stripe.js';
import { missingOf } from '../_profile.js';

const tokenOf = (request, body) => (body && body.token) || request.headers.get('x-account-token') || new URL(request.url).searchParams.get('t') || '';
const steps = () => ({
  ...Object.fromEntries(Object.entries(STEPS).map(([k, s]) => [k, { name: s.name, price: dollars(s.amount), opens: s.opens, sessions: s.sessions, first: s.first }])),
  // One-off products from exploraself.com (3 Nov 2026): no level, no step.
  ...Object.fromEntries(Object.entries(PRODUCTS).map(([k, p]) => [k, { name: p.name, price: dollars(p.amount), opens: p.opens, product: true }])),
});

/** What an account still lacks to be full, Google or not (api/complete.js with full: true). */
async function fullMissing(D, id) {
  const p = (await D.prepare('SELECT company, interest, industry FROM student_profile WHERE student_id = ?').bind(id).first()) || {};
  const auth = await D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(id).first();
  return missingOf({ ...p, google_at: null, hasPassword: !!(auth && auth.pass_hash) });
}
/** The link that opens a product a session paid for, or nothing. */
const accessOf = (s) => {
  const step = s && s.metadata && s.metadata.step;
  return Object.hasOwn(PRODUCTS, step || '') ? accessUrl(PRODUCTS[step], s.id) : undefined;
};

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Payments are not available right now.', 503);
  await accountTables(D);
  const me = await studentBy(D, tokenOf(request));
  const cs = clean(new URL(request.url).searchParams.get('cs'), 200);
  if (!cs) {
    const owned = me ? Object.fromEntries((await productsOf(D, me.id)).map((p) => [p.step, p.access])) : {};
    return json({ ok: true, on: !!stripeMode(env), test: stripeMode(env) === 'test', steps: steps(), tier: me ? me.tier || 'free' : null, signedIn: !!me, email: me ? me.email : undefined, owned });
  }
  if (!/^cs_[A-Za-z0-9_]+$/.test(cs)) return bad('That payment link is not complete.');
  const r = await stripe(env, 'GET', `checkout/sessions/${cs}`);
  if (!r.ok) return bad(r.why, 502);
  const s = r.data;
  if (!me) {
    if (!guestOf(s)) return bad('Sign in to see this payment.', 401);
    if (s.payment_status !== 'paid') return json({ ok: true, paid: false, step: s.metadata.step });
    const out = await applyPaid(env, D, origin(request), s);
    const email = String(s.metadata.email).trim().toLowerCase();
    const who = await D.prepare('SELECT id, name, tier FROM student WHERE email = ? ORDER BY joined_at LIMIT 1').bind(email).first();
    const made = who && await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'signup' AND detail = ?").bind(who.id, `stripe · ${s.id}`).first();
    const pass = who && await D.prepare('SELECT 1 AS x FROM account_auth WHERE student_id = ? AND pass_hash IS NOT NULL').bind(who.id).first();
    const base = { ok: true, paid: true, step: out.step || s.metadata.step, first: out.first || 4, email, access: accessOf(s) };
    if (made && !pass) return json({ ...base, token: who.id, fresh: true, name: who.name || '', missing: await fullMissing(D, who.id) });
    // An email that already had an account: no token, but /pay/ may say whether
    // that account is full yet, so a short one is sent to sign in and finish it
    // (Alexandru, 6 Nov 2026: whoever pays has a full account). Only the payer,
    // who holds this session's id, ever asks.
    return json({ ...base, existing: true, full: who ? !(await fullMissing(D, who.id)).length : false });
  }
  // A guest payment is theirs when it was made with this account's email (the
  // page reloaded after the account was made here, or they signed in since).
  const mine = s.client_reference_id === me.id || (s.metadata && s.metadata.student === me.id)
    || (guestOf(s) && String(s.metadata.email || '').trim().toLowerCase() === String(me.email || '').trim().toLowerCase());
  if (!mine) return bad('This payment belongs to another account.', 403);
  if (s.payment_status !== 'paid') return json({ ok: true, paid: false, step: s.metadata && s.metadata.step });
  const out = await applyPaid(env, D, origin(request), s);
  const now = await D.prepare('SELECT tier FROM student WHERE id = ?').bind(me.id).first();
  return json({ ok: true, paid: true, step: out.step || (s.metadata && s.metadata.step), first: out.first || 4, tier: now ? now.tier : null,
    access: accessOf(s), name: me.name || '', email: me.email, missing: await fullMissing(D, me.id) });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Payments are not available right now.', 503);
  if (!stripeMode(env)) return bad('Payments are not switched on yet.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  let me = await studentBy(D, tokenOf(request, body));
  if (!me) {
    // Pay first: a first name and an email are enough to go to Stripe.
    const email = clean(body.email, 200).toLowerCase(), first = clean(body.first, 60);
    if (!first) return bad('Your first name, please.');
    if (!looksLikeEmail(email)) return bad('That email does not look complete.');
    const step = clean(body.step, 20);
    if (STEPS[step]) {
      const has = await D.prepare('SELECT tier FROM student WHERE lower(email) = ?').bind(email).first();
      if (has && !above(step, has.tier)) {
        return json({ ok: false, signin: true, error: `${STEPS[step].name} is already yours on ${email}. Sign in and it is waiting for you: no need to pay again.` }, 409);
      }
    }
    // A product already bought with this email (6 Nov 2026): sign in and open it, never a second payment.
    if (PRODUCTS[step]) {
      const has = await D.prepare('SELECT id FROM student WHERE lower(email) = ?').bind(email).first();
      if (has && (await productsOf(D, has.id)).some((p) => p.step === step)) {
        return json({ ok: false, signin: true, error: `${PRODUCTS[step].name} is already yours on ${email}: no need to pay again.` }, 409);
      }
    }
    me = { id: '', email, tier: 'free', guest: { first, consent: body.consent === true, landing: clean(body.landing, 20) } };
  }
  const r = await checkout(env, D, origin(request), me, clean(body.step, 20));
  if (!r.ok && r.owned) return json({ ok: false, owned: r.owned, error: r.why }, 409);
  if (!r.ok) return bad(r.why, r.open ? 409 : 502);
  return json({ ok: true, url: r.url });
}
