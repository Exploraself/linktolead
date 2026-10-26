// A founder joins: name, email, phone, and the nine answers they just gave.
// Returns the token their browser keeps. Joining again with the same email
// returns the same record rather than making a second one.

import { json, bad, db, now, newToken, clean, looksLikeEmail } from '../_shared.js';
import { subscribe } from '../_mailchimp.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('The account service is not configured yet.', 503);

  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const email = clean(body.email, 200).toLowerCase();
  const first = clean(body.first, 80);
  const last = clean(body.last, 80);
  const company = clean(body.company, 140);
  const phone = clean(body.phone, 60);
  const name = [first, last].filter(Boolean).join(' ');
  if (!looksLikeEmail(email)) return bad('That does not look like an email address.');
  if (!first || !last) return bad('First and last name, so Alexandru knows who he is reading.');
  if (!company) return bad('What the business is called.');
  if (!phone) return bad('A phone number, so he can reach you about the session.');

  const stage = ['build', 'grow', 'scale'].includes(body.stage) ? body.stage : null;
  const thin = ['self', 'people', 'work', 'market'].includes(body.thin) ? body.thin : null;
  const diag = body.diag && typeof body.diag === 'object' ? JSON.stringify(body.diag).slice(0, 4000) : null;

  const found = await D.prepare('SELECT id,mailchimp_sent FROM student WHERE email = ?').bind(email).first();
  const id = found ? found.id : newToken();

  if (found) {
    await D.prepare('UPDATE student SET name=?, phone=?, company=COALESCE(?,company), stage=COALESCE(?,stage), thin_domain=COALESCE(?,thin_domain), diag_json=COALESCE(?,diag_json), last_seen_at=? WHERE id=?')
      .bind(name, phone, company, stage, thin, diag, now(), id).run();
  } else {
    await D.prepare('INSERT INTO student (id,email,name,phone,company,stage,tier,thin_domain,diag_json,joined_at,last_seen_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, email, name, phone, company, stage, 'free', thin, diag, now(), now()).run();
    await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(id, 'joined', now()).run();
  }

  // The newsletter is a second, softer thing: it must never hold up the join,
  // and a failure there is recorded rather than shown.
  if (!found || !found.mailchimp_sent) {
    const task = subscribe({ email, first, last, phone, company }).then((r) =>
      r.ok ? D.prepare('UPDATE student SET mailchimp_sent=1 WHERE id=?').bind(id).run() : null).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(task);
  }

  return json({ ok: true, token: id, returning: !!found });
}
