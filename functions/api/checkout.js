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

import { json, bad, db, accountTables, studentBy, clean, looksLikeEmail } from '../_shared.js';
import { origin } from '../_mail.js';
import { checkout, stripe, applyPaid, guestOf, STEPS, PRODUCTS, stripeMode, dollars } from '../_stripe.js';

const tokenOf = (request, body) => (body && body.token) || request.headers.get('x-account-token') || new URL(request.url).searchParams.get('t') || '';
const steps = () => ({
  ...Object.fromEntries(Object.entries(STEPS).map(([k, s]) => [k, { name: s.name, price: dollars(s.amount), opens: s.opens, sessions: s.sessions, first: s.first }])),
  // One-off products from exploraself.com (3 Nov 2026): no level, no step.
  ...Object.fromEntries(Object.entries(PRODUCTS).map(([k, p]) => [k, { name: p.name, price: dollars(p.amount), opens: p.opens, product: true }])),
});

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Payments are not available right now.', 503);
  await accountTables(D);
  const me = await studentBy(D, tokenOf(request));
  const cs = clean(new URL(request.url).searchParams.get('cs'), 200);
  if (!cs) return json({ ok: true, on: !!stripeMode(env), test: stripeMode(env) === 'test', steps: steps(), tier: me ? me.tier || 'free' : null, signedIn: !!me });
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
    const base = { ok: true, paid: true, step: out.step || s.metadata.step, first: out.first || 4, email };
    if (made && !pass) return json({ ...base, token: who.id, fresh: true, name: who.name || '' });
    return json({ ...base, existing: true });
  }
  if (s.client_reference_id !== me.id && !(s.metadata && s.metadata.student === me.id)) return bad('This payment belongs to another account.', 403);
  if (s.payment_status !== 'paid') return json({ ok: true, paid: false, step: s.metadata && s.metadata.step });
  const out = await applyPaid(env, D, origin(request), s);
  const now = await D.prepare('SELECT tier FROM student WHERE id = ?').bind(me.id).first();
  return json({ ok: true, paid: true, step: out.step || (s.metadata && s.metadata.step), first: out.first || 4, tier: now ? now.tier : null });
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
    me = { id: '', email, tier: 'free', guest: { first, consent: body.consent === true, landing: clean(body.landing, 20) } };
  }
  const r = await checkout(env, D, origin(request), me, clean(body.step, 20));
  if (!r.ok) return bad(r.why, r.open ? 409 : 502);
  return json({ ok: true, url: r.url });
}
