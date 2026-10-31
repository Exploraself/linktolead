// Completing an account (31 Oct 2026, Alexandru). One universal rule: any
// account without the full details (a simple sign-up from any sales page, the
// North Star's quick account, or an older account missing a field) is asked
// once, at its first answer in the Blueprint, for only what is missing:
// company (or "No company yet"), what they want most, industry, a password.
// Then it is a full account, signs in with its password, and is never asked
// again. Nothing already given is overwritten.
//
// POST { token, company?, noCompany?, interest?, industry?, password?, confirm? }
// → { ok, complete: true, missing: [] }, or a plain error for the first thing
// still missing. Everything is checked before anything is written.

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';
import { profile } from '../_account.js';
import { passwordProblem, setPassword } from '../_auth.js';
import { INTERESTS, INDUSTRIES, missingOf } from '../_profile.js';
import { syncFounder } from '../_mailchimp.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Sign in first.', 401);
  await profile(D, me.id);
  const p = (await D.prepare('SELECT company, interest, industry FROM student_profile WHERE student_id = ?').bind(me.id).first()) || {};
  const auth = await D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(me.id).first();
  const missing = missingOf({ ...p, hasPassword: !!(auth && auth.pass_hash) });
  if (!missing.length) return json({ ok: true, complete: true, missing: [] });

  // Check all of it first, so a founder is never left half done.
  const set = {};
  if (missing.includes('company')) {
    const none = body.noCompany === true, name = clean(body.company, 120);
    if (!none && !name) return bad('Your company’s name, or tick “No company yet”.');
    set.company = none ? '' : name;
  }
  if (missing.includes('interest')) {
    if (!INTERESTS.includes(body.interest)) return bad('Choose what you want most from the business.');
    set.interest = body.interest;
  }
  if (missing.includes('industry')) {
    if (!INDUSTRIES.includes(body.industry)) return bad('Choose your industry.');
    set.industry = body.industry;
  }
  let password = null;
  if (missing.includes('password')) {
    password = typeof body.password === 'string' ? body.password : '';
    const problem = passwordProblem(password, body.confirm === undefined ? password : body.confirm);
    if (problem) return bad(problem);
  }

  for (const [k, v] of Object.entries(set)) await D.prepare(`UPDATE student_profile SET ${k} = ? WHERE student_id = ?`).bind(v, me.id).run();
  if (password) {
    await setPassword(D, me.id, password);
    // A new password ends any sign-in link still open, as on /api/password.
    await D.prepare('DELETE FROM signin_code WHERE student_id = ?').bind(me.id).run();
  }
  await D.prepare("UPDATE student_profile SET signup_type = 'full' WHERE student_id = ?").bind(me.id).run();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'completed', now(), missing.join(',')).run();
  // Company, interest and industry are Mailchimp contact fields: send them.
  const go = syncFounder(env, D, me.id, 'tags').catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(go); else await go;
  return json({ ok: true, complete: true, missing: [] });
}
