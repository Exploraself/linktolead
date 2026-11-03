// Has this Stripe payment bought a product? (Alexandru, 3 Nov 2026:
// "everything to Stripe from exploraself".) exploraself.com asks, server to
// server, when a buyer comes back from Stripe with ?access=<session> or opens
// the link in their letter.
//
// GET ?session=cs_…   → { ok, paid, product }
//
// The session id is the buyer's access: Stripe makes it long and unguessable,
// and it only ever answers for a session whose metadata names a product
// (functions/_stripe.js PRODUCTS), never a ladder step. When Stripe says paid,
// the payment is recorded through applyPaid (once; the webhook does the same),
// so the letter goes even if the webhook is late. No personal data is sent back.

import { json, bad, db, accountTables, clean } from '../_shared.js';
import { origin } from '../_mail.js';
import { stripe, applyPaid, PRODUCTS } from '../_stripe.js';

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  const cs = clean(new URL(request.url).searchParams.get('session'), 200);
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(cs)) return bad('That access link is not complete.');
  const r = await stripe(env, 'GET', `checkout/sessions/${cs}`);
  if (!r.ok) return bad(r.status === 404 ? 'There is no such payment.' : 'We could not check this payment right now.', r.status === 404 ? 404 : 502);
  const s = r.data, step = s.metadata && s.metadata.step;
  if (!Object.hasOwn(PRODUCTS, step)) return bad('There is no such payment.', 404);
  if (s.payment_status !== 'paid') return json({ ok: true, paid: false, product: step });
  await accountTables(D);
  const out = await applyPaid(env, D, origin(request), s);
  if (!out.ok) return bad(out.why || 'We could not check this payment right now.', 409);
  return json({ ok: true, paid: true, product: step });
}
