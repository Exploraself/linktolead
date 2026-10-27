// A founder joins: five fields, the ten answers they just gave, and the stage
// the referee put them in. Returns the token their browser keeps. Joining
// again with the same email returns the same record rather than a second one.
//
// Mailchimp is fired after the response goes back, so a slow or unhappy list
// never makes a founder wait and never costs them their reading.

import { json, bad, db, now, newToken, clean, looksLikeEmail } from '../_shared.js';
import { subscribe } from '../_mailchimp.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('The account service is not configured yet.', 503);

  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const email = clean(body.email, 200).toLowerCase();
  const first = clean(body.first, 60);
  const last = clean(body.last, 60);
  const company = clean(body.company, 120);
  const phone = clean(body.phone, 60);
  // Older copies of the page sent one combined name. Accept either.
  const whole = clean(body.name, 120);
  const name = (first || last) ? `${first} ${last}`.trim() : whole;

  if (!looksLikeEmail(email)) return bad('That does not look like an email address.');
  if (!name) return bad('A name, so Alexandru and the team know who they are reading.');

  const stage = ['build', 'grow', 'scale'].includes(body.stage) ? body.stage : null;
  const thin = ['self', 'people', 'work', 'market'].includes(body.thin) ? body.thin : null;
  const diag = body.diag && typeof body.diag === 'object' ? JSON.stringify(body.diag).slice(0, 4000) : null;

  const found = await D.prepare('SELECT id, mailchimp_sent FROM student WHERE email = ?').bind(email).first();

  let id, returning;
  if (found) {
    id = found.id; returning = true;
    await D.prepare(`UPDATE student SET name=?, phone=?, company=COALESCE(NULLIF(?,''),company),
        stage=COALESCE(?,stage), thin_domain=COALESCE(?,thin_domain),
        diag_json=COALESCE(?,diag_json), last_seen_at=? WHERE id=?`)
      .bind(name, phone, company, stage, thin, diag, now(), id).run();
  } else {
    id = newToken(); returning = false;
    await D.prepare(`INSERT INTO student
        (id,email,name,phone,company,stage,tier,thin_domain,diag_json,joined_at,last_seen_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, email, name, phone, company, stage, 'free', thin, diag, now(), now()).run();
    await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(id, 'joined', now()).run();
  }

  // Onto the list, once per founder, after the reply has gone.
  if (!found || !found.mailchimp_sent) {
    const send = (async () => {
      const r = await subscribe({ first, last, email, company, phone });
      await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
        .bind(id, r.ok ? 'mailchimp' : 'mailchimp-failed', now(), r.why || null).run()
        .catch(() => {});
      if (r.ok) await D.prepare('UPDATE student SET mailchimp_sent=1 WHERE id=?').bind(id).run().catch(() => {});
    })();
    if (typeof waitUntil === 'function') waitUntil(send); else await send;
  }

  return json({ ok: true, token: id, returning });
}
