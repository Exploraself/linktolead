// A free account from the Compass or a sales page: first name, surname,
// email, consent, where they came from and their stage. Two forms
// (functions/_profile.js): FULL also gives company (or "No company yet"),
// interest, industry and a password (required); SIMPLE gives none of these and
// never has a password (sign-in by email link). The landing page and the utm_*
// tags are kept on the profile.
//
// One email is one record. A new email makes the record and returns its token,
// which the browser keeps (public/account.js, key 'ftb-token'). An email that
// already has a record returns no token: the token is the key to everything a
// founder wrote, and knowing someone's address must not hand it over. That
// browser is told to sign in by email link instead. The one exception is the
// browser that already holds this record's token.
//
// The welcome letter ("launchpad-welcome") is sent once, to new accounts that
// consented and have not unsubscribed, within the mail limits. It is the only
// email a new account gets, so nobody receives two. The same founders are
// added to the Mailchimp audience (functions/_mailchimp.js). Both happen after
// the reply, so a slow email service or a slow Mailchimp never makes anyone
// wait.

import { json, bad, db, now, newToken, clean, looksLikeEmail, accountTables } from '../_shared.js';
import { profile, sendWelcome, SOURCES } from '../_account.js';
import { allowed, logged, mailState, origin } from '../_mail.js';
import { passwordProblem, setPassword } from '../_auth.js';
import { syncFounder } from '../_mailchimp.js';
import { details, LANDINGS, utmFrom } from '../_profile.js';

/** Run after the reply when the platform allows it; never let it throw. */
const later = (waitUntil, job) => {
  const go = Promise.resolve().then(job).catch(() => {});
  return typeof waitUntil === 'function' ? (waitUntil(go), null) : go;
};

/** The Compass's four stages, as the programme names its three. */
const STAGE = { building: 'build', growing: 'grow', scaling: 'scale', build: 'build', grow: 'grow', scale: 'scale' };

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('The account service is not configured yet.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const email = clean(body.email, 200).toLowerCase();
  const first = clean(body.first, 60), last = clean(body.last, 60);
  if (!looksLikeEmail(email)) return bad('That email does not look complete.');
  if (!first) return bad('Your first name, so the Compass is yours.');
  const consent = body.consent === true;
  const source = SOURCES.includes(body.source) ? body.source : 'compass';
  const stage = STAGE[body.stage] || null;
  const type = body.type === 'full' ? 'full' : 'simple';
  const d = type === 'full' ? details(body) : null;
  if (d && d.problem) return bad(d.problem);
  const industry = d ? d.industry : body.industry;
  const landing = LANDINGS.includes(body.landing) ? body.landing : null, utm = utmFrom(body.utm);
  // The full form needs a password, sound before anything is made, so a
  // founder is never left half signed up. The simple form never sets one.
  const password = type === 'full' && typeof body.password === 'string' ? body.password : null;
  if (type === 'full') { const problem = passwordProblem(password || '', body.confirm); if (problem) return bad(problem); }

  await accountTables(D);
  const found = await D.prepare('SELECT id FROM student WHERE email = ?').bind(email).first();

  if (found) {
    // Same record. Profile details only fill gaps; nothing is overwritten.
    // Consent counts only from the browser that holds this record: someone
    // typing another person's address cannot agree on their behalf.
    const mine = clean(body.token, 80) === found.id;
    const p = await profile(D, found.id, { industry: mine ? industry : null, consent: mine && consent, source });
    // From the founder's own browser, a full form fills what is missing.
    if (mine && d) await D.prepare(`UPDATE student_profile SET company = COALESCE(company, ?), interest = COALESCE(NULLIF(interest, ''), ?),
        signup_type = 'full' WHERE student_id = ?`).bind(d.company, d.interest, found.id).run();
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(found.id, 'signup', now(), 'existing').run();
    // Consent given from the founder's own browser: into the audience too.
    if (mine && consent && !p.unsubscribed && p.mailchimp_status !== 'ok') await later(waitUntil, () => syncFounder(env, D, found.id, 'join'));
    return json(mine ? { ok: true, token: found.id, existing: true } : { ok: true, existing: true });
  }

  const id = newToken();
  await D.prepare(`INSERT INTO student (id,email,name,phone,company,stage,tier,joined_at,last_seen_at)
      VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(id, email, `${first} ${last}`.trim(), '', '', stage, 'free', now(), now()).run();
  const p = await profile(D, id, { industry, consent, source });
  await D.prepare(`UPDATE student_profile SET signup_type = ?, company = ?, interest = ?, landing = ?,
      utm_source = ?, utm_medium = ?, utm_campaign = ?, utm_content = ?, utm_term = ? WHERE student_id = ?`)
    .bind(type, d ? d.company : null, d ? d.interest : null, landing,
      utm.utm_source, utm.utm_medium, utm.utm_campaign, utm.utm_content, utm.utm_term, id).run();
  if (password) await setPassword(D, id, password);
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(id, 'signup', now(), `${source} · ${type}`).run();

  // The welcome goes after the reply, so a slow email service never makes
  // anyone wait for their account.
  if (consent && !p.unsubscribed && mailState(env).ready) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const go = (async () => {
      if (!(await allowed(D, email, ip))) return;
      const r = await sendWelcome(env, origin(request), { email, first, p });
      if (r.ok) await logged(D, email, ip);
      await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
        .bind(id, r.ok ? 'launchpad-welcome' : 'launchpad-welcome-failed', now(), r.why || null).run();
    })().catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(go); else await go;
  }
  if (consent && !p.unsubscribed) await later(waitUntil, () => syncFounder(env, D, id, 'join'));

  return json({ ok: true, token: id, existing: false });
}
