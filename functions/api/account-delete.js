// "Delete my account", from the profile menu. Two steps on the page (a plain
// warning, then the founder types their email); this route needs both the
// token and the email. Everything kept for them goes. In Mailchimp they are
// unsubscribed, never hard-deleted. Logged without their details.

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';
import { deleteFounder } from '../_account.js';

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Not found.', 404);
  if (clean(body.confirm, 200).toLowerCase() !== String(me.email).toLowerCase()) return bad('Type your email exactly as you signed up with it, to confirm.');
  const mc = await deleteFounder(env, D, me);
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind('mentor', 'founder-deleted-self', now(), `mailchimp ${mc.status}`).run();
  return json({ ok: true });
}
