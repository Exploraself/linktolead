// The parts of an account the North Star added: the profile row beside each
// student (industry, consent, where they came from, unsubscribe), and the
// welcome letter.

import { now, newToken, clean, STUDENT_TABLES } from './_shared.js';
import { syncFounder } from './_mailchimp.js';
import { send } from './_mail.js';
import { launchpadWelcome } from './_letters.js';
import { letterContext } from './_mentor.js';

export const SOURCES = ['compass', 'sales-page', 'home'];
export const INDUSTRIES_MAX = 80;

/** The profile row for a student, made if missing. Industry and consent only
 *  ever fill in or turn on here; turning consent off is unsubscribing. */
export async function profile(D, studentId, { industry, consent, source } = {}) {
  const at = now();
  await D.prepare(`INSERT INTO student_profile (student_id, industry, consent, consent_at, source, unsub_id)
      VALUES (?,?,?,?,?,?) ON CONFLICT(student_id) DO UPDATE SET
        industry = COALESCE(NULLIF(student_profile.industry,''), excluded.industry),
        consent_at = CASE WHEN excluded.consent = 1 AND student_profile.consent = 0 THEN excluded.consent_at ELSE student_profile.consent_at END,
        consent = MAX(student_profile.consent, excluded.consent),
        source = COALESCE(student_profile.source, excluded.source)`)
    .bind(studentId, clean(industry, INDUSTRIES_MAX) || null, consent ? 1 : 0, consent ? at : null,
      SOURCES.includes(source) ? source : null, newToken()).run();
  return D.prepare('SELECT * FROM student_profile WHERE student_id = ?').bind(studentId).first();
}

export const unsubLink = (base, p) => (p && p.unsub_id ? `${base}/api/unsubscribe?u=${p.unsub_id}` : '');

/** The welcome ("launchpad-welcome"): sent once, when the account is made. */
export async function sendWelcome(env, base, { email, first, p, D, tz }) {
  const ctx = D && p ? await letterContext(D, p.student_id, tz) : {};
  return send(env, { to: email, ...launchpadWelcome(base, { first, to: email, ...ctx }),
    why: 'You created a free ExploraSelf account at linktolead.exploraself.com.', unsubUrl: unsubLink(base, p) });
}

/** Delete a founder and everything kept for them. Mailchimp first:
 *  unsubscribed there, never a hard delete (the audience keeps the record of
 *  their consent and their unsubscribe). Its log row goes with everything
 *  else, so the address is not kept here. Used by /mentor and by the
 *  founder's own "Delete my account". Returns the Mailchimp outcome. */
export async function deleteFounder(env, D, me) {
  const mcOut = await syncFounder(env, D, me.id, 'unsubscribe', { keepLog: false }).catch(() => ({ status: 'failed', detail: 'Mailchimp could not be reached.' }));
  await D.batch([
    ...STUDENT_TABLES.map((t) => D.prepare(`DELETE FROM ${t} WHERE student_id = ?`).bind(me.id)),
    D.prepare('DELETE FROM mail_log WHERE email = ?').bind(me.email),
    D.prepare('DELETE FROM auth_log WHERE email = ?').bind(me.email),
    D.prepare('DELETE FROM student WHERE id = ?').bind(me.id),
  ]);
  return mcOut;
}

/** "Letters from your mentor": On gives consent and joins (or rejoins) the
 *  Mailchimp audience; Off is an unsubscribe, here and in Mailchimp. */
export async function setLetters(env, D, studentId, on) {
  const at = now();
  const was = await D.prepare('SELECT consent, unsubscribed FROM student_profile WHERE student_id = ?').bind(studentId).first();
  // Already on (consent, not unsubscribed): nothing to send anywhere.
  if (on && was && was.consent && !was.unsubscribed) return { status: 'skipped', detail: 'Already on.' };
  if (!on && was && was.unsubscribed) return { status: 'skipped', detail: 'Already off.' };
  if (on) {
    await D.prepare(`UPDATE student_profile SET unsubscribed = 0, unsub_at = NULL, consent = 1,
      consent_at = CASE WHEN consent = 1 AND consent_at IS NOT NULL THEN consent_at ELSE ? END WHERE student_id = ?`).bind(at, studentId).run();
  } else {
    await D.prepare('UPDATE student_profile SET unsubscribed = 1, unsub_at = ? WHERE student_id = ?').bind(at, studentId).run();
  }
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(studentId, on ? 'letters-on' : 'letters-off', at).run();
  return syncFounder(env, D, studentId, on ? (was && was.unsubscribed ? 'resubscribe' : 'join') : 'unsubscribe').catch(() => ({ status: 'failed', detail: 'Mailchimp could not be reached.' }));
}
