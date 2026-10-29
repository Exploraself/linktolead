// The parts of an account the Compass added: the profile row beside each
// student (industry, consent, where they came from, unsubscribe), and the
// welcome email.

import { now, newToken, clean } from './_shared.js';
import { send, esc } from './_mail.js';

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

/** The welcome: the Compass is saved, where the Launchpad is, how to get back in. */
export function welcome(base, first) {
  const hi = first ? `${first}, your` : 'Your';
  const gold = '#7A5C16', ink = '#14100B', muted = '#5E5446';
  const html = `<!doctype html><html><body style="margin:0;background:#F7F2E7"><div style="max-width:600px;margin:0 auto;padding:28px 22px;background:#FFFFFF">
    <p style="margin:0;font:700 11px Arial;letter-spacing:3px;color:${gold}">EXPLORASELF · LEADERSHIP COMPASS</p>
    <h1 style="margin:12px 0 10px;font:600 26px/1.25 Georgia,serif;color:${ink}">${esc(hi)} Compass is saved.</h1>
    <p style="margin:0 0 14px;font:15px/1.6 Arial;color:${muted}">Your answers are kept with your free account, so they follow you to any device. Your account plans open inside it: one step in each of the four domains, each week, starting with the one that needs you most.</p>
    <a href="https://linktolead.exploraself.com/start" style="display:inline-block;background:#C9A24A;color:#14100B;font:700 15px Arial;padding:12px 20px;text-decoration:none">Enter the Founder Launchpad →</a>
    <p style="margin:22px 0 4px;font:700 11px Arial;letter-spacing:2px;color:${gold}">SIGNING IN AGAIN</p>
    <p style="margin:0;font:14px/1.6 Arial;color:${ink}">On another phone or computer, open <a href="${esc(base)}/compass" style="color:${gold}">${esc(base.replace(/^https?:\/\//, ''))}/compass</a>, tap “Already have an account? Email me a sign-in link” and type this address. The link works once, for 30 minutes.</p>
  </div></body></html>`;
  const text = [`${hi} Compass is saved.`, '',
    'Your answers are kept with your free account, so they follow you to any device. Your account plans open inside it: one step in each of the four domains, each week, starting with the one that needs you most.', '',
    'Enter the Founder Launchpad: https://linktolead.exploraself.com/start', '',
    `SIGNING IN AGAIN: on another phone or computer, open ${base}/compass, tap "Already have an account? Email me a sign-in link" and type this address. The link works once, for 30 minutes.`].join('\n');
  return { subject: 'Your Leadership Compass is saved', html, text };
}

export async function sendWelcome(env, base, { email, first, p }) {
  const w = welcome(base, first);
  return send(env, { to: email, ...w, why: 'You created a free ExploraSelf account at linktolead.exploraself.com/compass.', unsubUrl: unsubLink(base, p) });
}
