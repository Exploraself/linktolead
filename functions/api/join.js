// A founder joins: name, email, phone, and the nine answers they just gave.
// Returns the token their browser keeps. Joining again with the same email
// returns the same record rather than making a second one.

import { json, bad, db, now, newToken, clean, looksLikeEmail } from '../_shared.js';

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('The account service is not configured yet.', 503);

  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const email = clean(body.email, 200).toLowerCase();
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 60);
  if (!looksLikeEmail(email)) return bad('That does not look like an email address.');
  if (!name) return bad('A name, so Alexandru knows who he is reading.');

  const stage = ['build', 'grow', 'scale'].includes(body.stage) ? body.stage : null;
  const thin = ['self', 'people', 'work', 'market'].includes(body.thin) ? body.thin : null;
  const diag = body.diag && typeof body.diag === 'object' ? JSON.stringify(body.diag).slice(0, 4000) : null;

  const found = await D.prepare('SELECT id FROM student WHERE email = ?').bind(email).first();
  if (found) {
    await D.prepare('UPDATE student SET name=?, phone=?, stage=COALESCE(?,stage), thin_domain=COALESCE(?,thin_domain), diag_json=COALESCE(?,diag_json), last_seen_at=? WHERE id=?')
      .bind(name, phone, stage, thin, diag, now(), found.id).run();
    return json({ ok: true, token: found.id, returning: true });
  }

  const id = newToken();
  await D.prepare('INSERT INTO student (id,email,name,phone,stage,tier,thin_domain,diag_json,joined_at,last_seen_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id, email, name, phone, stage, 'free', thin, diag, now(), now()).run();
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(id, 'joined', now()).run();
  return json({ ok: true, token: id, returning: false });
}
