// The password gate: "Set your password to keep your work", the first time a
// founder opens the Launchpad (or comes back to it without a password).
//
// POST { token, password, confirm, company, noCompany, interest, industry }.
// A password is required (the PR #34 rules: at least 10 characters, both boxes
// the same). Whatever the profile still lacks (company, interest, industry)
// is required too; a simple founder then becomes full. Mailchimp follows
// after the reply: the details, "Signup - Full", interest and industry tags.
// The "Your password was changed" letter goes as for any password set.

import { json, bad, db, now, accountTables, studentBy } from '../_shared.js';
import { passwordProblem } from '../_auth.js';
import { profile } from '../_account.js';
import { details, missing } from '../_profile.js';
import { syncFounder } from '../_mailchimp.js';
import { onRequestPost as passwordLetter } from './password.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);
  if (!me) return bad('Sign in first.', 401);
  await accountTables(D);
  const p = await D.prepare('SELECT signup_type, company, interest, industry FROM student_profile WHERE student_id = ?').bind(me.id).first();
  const lacks = missing(p);
  const d = details(body);
  // Only what is missing is asked; each of those must be answered.
  if (lacks.includes('company') && d.company === null) return bad('Your company’s name, or tick “No company yet”.');
  if (lacks.includes('interest') && !d.interest) return bad('Choose what you want most from the business.');
  if (lacks.includes('industry') && !d.industry) return bad('Choose your industry.');
  const problem = passwordProblem(body.password, body.confirm);
  if (problem) return bad(problem);

  if (lacks.length) {
    await profile(D, me.id); // the row, made if an older account has none
    await D.prepare(`UPDATE student_profile SET company = COALESCE(company, ?), interest = COALESCE(NULLIF(interest, ''), ?),
        industry = COALESCE(NULLIF(industry, ''), ?), signup_type = 'full' WHERE student_id = ?`)
      .bind(d.company, d.interest || null, d.industry || null, me.id).run();
  } else if (p && p.signup_type !== 'full') {
    await D.prepare("UPDATE student_profile SET signup_type = 'full' WHERE student_id = ?").bind(me.id).run();
  }
  const wasSimple = !p || p.signup_type !== 'full';

  // The password itself, and its letter, through the same route as any
  // password change (functions/api/password.js).
  const r = await passwordLetter({ request: new Request(request.url, { method: 'POST', headers: request.headers,
    body: JSON.stringify({ token: me.id, password: body.password, confirm: body.confirm }) }), env, waitUntil });
  if (!r.ok) return r;
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'signup-complete', now(), wasSimple ? 'simple → full' : 'full').run();
  if (wasSimple || lacks.length) {
    const job = syncFounder(env, D, me.id, 'join').catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  return json({ ok: true, signupType: 'full' });
}
