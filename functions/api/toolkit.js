// Opening the Growth Toolkit without an account (Alexandru, 2 Nov 2026).
//
// POST { action: 'request', first, email, consent }
//   On Alexandru's list (TOOLKIT_EMAILS, or the team): { ok, pass } at once.
//   Anyone else: the code by email ("toolkit-code" letter, a look inside the
//   toolkit and a button that opens it), { ok, sent: true }. One 4-digit code
//   for everybody (TOOLKIT_CODE, 5689 by default; passing it on is fine).
//   The reply is the same whether or not the address has an account.
// POST { action: 'check', email, code }   { ok, pass } when the code is right.
//   With their yes to letters, the
//   Growth Toolkit welcome follows, once per address.
// GET  ?pass=…                            { ok, valid }
//
// The pass lives in the browser (public/tools/gate.js); only its hash is kept
// here. Answers given with a pass stay on the
// device: there is no account to save them to.

import { json, bad, db, now, clean, looksLikeEmail, accountTables } from '../_shared.js';
import { accessTable, skipsCode, toolkitCode, issuePass, passOk, passWelcome } from '../_tools.js';
import { allowed, logged, mailState, origin, send, LIMIT_MSG } from '../_mail.js';
import { toolkitCodeLetter } from '../_letters.js';

/** The look inside, as the Tools page lists it (public/tools/catalog.js; a
 *  test holds them equal). */
export const TOOLKIT_PREVIEW = [
  ['Personal leadership', ['The off-switch check', '12 Days to Start Winning', 'The bottleneck test']],
  ['Business', ['Cash runway', 'The offer check', 'Teleprompter']],
];
const WHY = 'You asked for a code to open the Growth Toolkit at linktolead.exploraself.com. If it was not you, nothing happens.';

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  await accessTable(D);
  return json({ ok: true, valid: await passOk(D, new URL(request.url).searchParams.get('pass') || '') });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  await accessTable(D);
  const email = clean(body.email, 200).toLowerCase();
  if (!looksLikeEmail(email)) return bad('That email does not look complete.');

  if (body.action === 'request') {
    const first = clean(body.first, 60);
    if (!first) return bad('Your first name, please.');
    await D.prepare(`INSERT INTO toolkit_access (email, first, consent, created_at) VALUES (?,?,?,?)
        ON CONFLICT(email) DO UPDATE SET first = excluded.first, consent = MAX(toolkit_access.consent, excluded.consent)`)
      .bind(email, first, body.consent === true ? 1 : 0, now()).run();
    if (await skipsCode(email, env, D)) {
      const pass = await issuePass(D, email);
      await passWelcome(env, D, origin(request), email, { tz: clean(body.tz, 60), waitUntil });
      return json({ ok: true, pass });
    }
    const st = mailState(env);
    if (!st.ready) return bad('We cannot send codes right now. Write to support@exploraself.com and we will open it for you.', 503);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await allowed(D, email, ip))) return bad(LIMIT_MSG.replace(', or sign in with your password', ''), 429);
    const code = toolkitCode(env);
    const base = origin(request);
    const url = `${base}/tools/?email=${encodeURIComponent(email)}&code=${code}`;
    const job = (async () => {
      const r = await send(env, { to: email, ...toolkitCodeLetter(base, { first, code, url, tools: TOOLKIT_PREVIEW, to: email, tz: clean(body.tz, 60) }), why: WHY });
      if (r.ok) await logged(D, email, ip);
    })().catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
    return json({ ok: true, sent: true });
  }

  if (body.action === 'check') {
    if (clean(body.code, 12).replace(/\s+/g, '') !== toolkitCode(env)) return bad('That code does not match. Check the four digits in the email.', 400);
    // Passed on by a friend is fine: the address is kept, without a yes to letters.
    await D.prepare('INSERT OR IGNORE INTO toolkit_access (email, first, consent, created_at) VALUES (?,?,?,?)').bind(email, '', 0, now()).run();
    const pass = await issuePass(D, email);
    // In with their code: the Growth Toolkit welcome, once (Alexandru, 2 Nov).
    await passWelcome(env, D, origin(request), email, { tz: clean(body.tz, 60), tool: clean(body.tool, 30), waitUntil });
    return json({ ok: true, pass });
  }
  return bad('Say request or check.');
}
