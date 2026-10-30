// "Letters from your mentor: On/Off", from the profile menu. Off is an
// unsubscribe (here and in Mailchimp); On gives consent and joins the
// audience again (Mailchimp asks someone who had unsubscribed to confirm).
// Sign-in links and password letters still come: the founder asks for those.

import { json, bad, db, clean, accountTables, studentBy } from '../_shared.js';
import { profile, setLetters } from '../_account.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Not found.', 404);
  if (typeof body.on !== 'boolean') return bad('On or off?');
  await profile(D, me.id);
  const go = setLetters(env, D, me.id, body.on);
  // The founder's choice is saved before Mailchimp answers.
  if (typeof waitUntil === 'function') waitUntil(go); else await go;
  return json({ ok: true, letters: body.on });
}
