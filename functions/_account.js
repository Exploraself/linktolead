// The parts of an account the Compass added: the profile row beside each
// student (industry, consent, where they came from, unsubscribe), and the
// welcome letter.

import { now, newToken, clean } from './_shared.js';
import { send } from './_mail.js';
import { launchpadWelcome } from './_letters.js';

export const SOURCES = ['compass', 'sales-page'];
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
export async function sendWelcome(env, base, { email, first, p }) {
  return send(env, { to: email, ...launchpadWelcome(base, { first, to: email }),
    why: 'You created a free ExploraSelf account at linktolead.exploraself.com.', unsubUrl: unsubLink(base, p) });
}
