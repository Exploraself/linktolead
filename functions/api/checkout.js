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
// The founder's token comes in the x-account-token header (or `token`).

import { json, bad, db, accountTables, studentBy, clean } from '../_shared.js';
import { origin } from '../_mail.js';
import { checkout, stripe, applyPaid, STEPS, PRODUCTS, stripeMode, dollars } from '../_stripe.js';

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
  if (!me) return bad('Sign in to see this payment.', 401);
  if (!/^cs_[A-Za-z0-9_]+$/.test(cs)) return bad('That payment link is not complete.');
  const r = await stripe(env, 'GET', `checkout/sessions/${cs}`);
  if (!r.ok) return bad(r.why, 502);
  const s = r.data;
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
  const me = await studentBy(D, tokenOf(request, body));
  if (!me) return bad('Sign in first, then come back here.', 401);
  const r = await checkout(env, D, origin(request), me, clean(body.step, 20));
  if (!r.ok) return bad(r.why, r.open ? 409 : 502);
  return json({ ok: true, url: r.url });
}
