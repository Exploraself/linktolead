// Stripe tells the site a payment went through (functions/_stripe.js). Only
// a correctly signed call is believed; the step opens through applyPaid(),
// which records each Checkout Session once.

import { json, db } from '../_shared.js';
import { origin } from '../_mail.js';
import { verifySignature, webhookSecret, applyPaid, WEBHOOK_EVENTS } from '../_stripe.js';

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return new Response('Not configured.', { status: 503 });
  const payload = await request.text();
  const secret = await webhookSecret(D, env);
  if (!(await verifySignature(payload, request.headers.get('stripe-signature'), secret))) return new Response('Signature not accepted.', { status: 400 });
  let e;
  try { e = JSON.parse(payload); } catch { return new Response('Could not read that.', { status: 400 }); }
  if (WEBHOOK_EVENTS.includes(e.type)) {
    const out = await applyPaid(env, D, origin(request), e.data && e.data.object);
    return json({ received: true, ...out });
  }
  return json({ received: true, ignored: e.type });
}
