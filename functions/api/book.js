// A call with Alexandru: a few answers and one to three times suggested, one
// confirmed by email within 24 hours (Alexandru, 2 Nov 2026; the rules and
// the questions in functions/_booking.js).
//
// GET                          → { ok, waTo? }: the business WhatsApp number, digits
//                                 (for "Get my gift on WhatsApp"), when it is set
// POST { kind, answers, name, email, phone, times: [ISO, …], hp, token?, tz? }
//   kind 'discovery'  the free 30-minute call; anyone, no account needed;
//                     name and email come from the page
//   kind 'boardroom'  the 60-minute 1:1; a signed-in founder whose step holds
//                     'session' (The Boardroom or higher), or the team; name
//                     and email come from the account, never from the page
//   answers           the form's answers (FORMS in functions/_booking.js)
//   hp                a field people never see: anything in it is a bot
//
// Everything is checked here, whatever the page sent: the kind, every answer
// against the words the form offers, exactly two struggles and two goals, the
// lengths, exactly three different times that are really open, the empty
// field, and at most 3 requests a day per address and per connection.
// Alexandru's notice must leave before the reply says yes (AGENTS.md rule 6:
// a request is never said to be with him when nobody heard of it); the copy
// to the person and, for a signed-in founder, the Mailchimp tag
// (functions/_tag-list.js; only with their yes to letters, as every tag) follow.

import { json, bad, db, now, newToken, clean, looksLikeEmail, studentBy } from '../_shared.js';
import { isTeamMember } from '../_team.js';
import { syncFounder, stepName } from '../_mailchimp.js';
import { ORDER } from '../_stripe.js';
import { okTz } from '../_mentor.js';
import { mailState, origin, send } from '../_mail.js';
import { bookingLetter, bookingNotice } from '../_letters.js';
import { MENTOR_EMAIL } from './note.js';
import { ABOUT, aboutOf, KINDS, RULES, BOOK_TAGS, NAME_MAX, EMAIL_MAX, isKind, isSlot, readAnswers, bookingTables, bookingAllowed, bookingLogged, phoneOf, waNumber, waDigits } from '../_booking.js';

export const LIMIT = 'You have sent three requests today. Alexandru and the team will write back. If it is urgent, write to support@exploraself.com.';
const HELP = 'Write to support@exploraself.com and we will find a time with you.';
const WHY = {
  discovery: 'You asked for a free discovery call with Alexandru at linktolead.exploraself.com.',
  boardroom: 'You asked for your 1:1 with Alexandru at linktolead.exploraself.com.',
};

/** Holds The Boardroom's session: the step itself or any step above it. */
export const holdsSession = (tier) => ORDER.indexOf(tier || 'free') >= ORDER.indexOf('session');

/** GET: the business WhatsApp number (digits), so the phone screen promises
 *  the gift on WhatsApp only when the button will be there (rule 6). The
 *  number is public anyway: every wa.me link shows it. */
export async function onRequestGet({ env }) {
  const D = db(env);
  const waTo = D ? waDigits(await waNumber(D).catch(() => '')) : '';
  return json({ ok: true, ...(waTo ? { waTo } : {}) });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad(`Booking is not available right now. ${HELP}`, 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  if (!body || typeof body !== 'object') return bad('Could not read that.');
  const kind = body.kind;
  if (!isKind(kind)) return bad('Say which call: discovery or boardroom.');
  // A field nobody sees: a person never fills it. Said plainly, never faked.
  if (body.hp != null && String(body.hp).trim()) return bad(`That did not go through. ${HELP}`);

  const read = readAnswers(kind, body.answers);
  if (!read.ok) return bad(read.error);

  const times = Array.isArray(body.times) ? body.times : [];
  if (times.length < RULES.min || times.length > RULES.pick || !times.every((t) => typeof t === 'string')) return bad(`Pick one time, or up to ${RULES.pick}.`);
  if (new Set(times.map((t) => Date.parse(t))).size !== times.length) return bad('Pick different times.');
  const at = Date.now();
  if (!times.every((t) => isSlot(kind, t, at))) return bad('One of those times is no longer open. Go back and pick again.');
  const sorted = times.map((t) => new Date(t).toISOString()).sort();
  // Their phone, for both calls (Alexandru, 3 Nov 2026), in the international form.
  const phone = phoneOf(body.phone);
  if (!phone) return bad('Your phone number, with your country code (it starts with +).');
  const tz = okTz(body.tz) || RULES.zone;

  // Who is asking: the signed-in account, if any. The 1:1 is theirs only.
  const me = body.token ? await studentBy(D, body.token).catch(() => null) : null;
  let name, email;
  if (kind === 'boardroom') {
    if (!me) return json({ ok: false, error: 'Sign in first, so we know it is you.', signin: true }, 401);
    if (!holdsSession(me.tier) && !(await isTeamMember(D, me.email, env))) return json({ ok: false, error: 'Your 1:1 comes with The Boardroom.', pay: true }, 403);
    name = clean(me.name, NAME_MAX) || me.email.split('@')[0];
    email = String(me.email || '').toLowerCase();
  } else {
    name = clean(body.name, 200);
    email = clean(body.email, 300).toLowerCase();
    if (!name) return bad('Your name, please.');
    if (name.length > NAME_MAX) return bad(`Your name, in ${NAME_MAX} characters at most.`);
    if (email.length > EMAIL_MAX || !looksLikeEmail(email)) return bad('That email does not look complete.');
  }

  // Nobody would hear of it without email: say so, and keep nothing.
  if (!mailState(env).ready) return bad(`We cannot take requests online right now. ${HELP}`, 503);
  await bookingTables(D);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!(await bookingAllowed(D, email, ip))) return bad(LIMIT, 429);

  // The account it belongs to (for /mentor): the signed-in one, or the one
  // with this email.
  const owner = me || (await D.prepare('SELECT id, email, name, tier FROM student WHERE email = ?').bind(email).first().catch(() => null));
  const id = newToken();
  const stamp = now();
  const about = aboutOf(body.about);
  await D.prepare('INSERT INTO booking (id, kind, email, name, phone, answers, times, created_at, status, tz, student_id, about) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, kind, email, name, phone, JSON.stringify(read.answers), JSON.stringify(sorted), stamp, 'asked', tz, owner ? owner.id : null, about || null).run();

  const base = origin(request);
  const to = (typeof env.MENTOR_EMAIL === 'string' && env.MENTOR_EMAIL.trim()) || MENTOR_EMAIL;
  const told = await send(env, { to, ...bookingNotice(base, { name, email, phone, kind, times: sorted, answers: read.answers, tz, account: !!owner, about: about ? ABOUT[about] : '',
    step: kind === 'boardroom' && me ? stepName(me.tier) : '' }), why: `${name} asked for ${KINDS[kind].name} at linktolead.exploraself.com.` });
  if (!told.ok) {
    // Nobody heard of it: keep nothing, and say so.
    await D.prepare('DELETE FROM booking WHERE id = ?').bind(id).run();
    return bad('We could not pass this on just now. Try again in a minute, or write to support@exploraself.com.', 502);
  }
  await bookingLogged(D, email, ip);

  const first = name.split(/\s+/)[0];
  const copy = await send(env, { to: email, ...bookingLetter(base, { first, phone, kind, times: sorted, answers: read.answers, tz, to: email }), why: WHY[kind] });
  // The tag goes only to the signed-in account (a typed address proves
  // nothing), and syncFounder sends it only with their yes to letters.
  if (me) {
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'booking', stamp, kind).run().catch(() => {});
    const job = syncFounder(env, D, me.id, 'tag', { tag: BOOK_TAGS[kind] }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  // The business WhatsApp number, for the done screen's "Get my gift on WhatsApp".
  const waTo = waDigits(await waNumber(D).catch(() => ''));
  return json({ ok: true, id, times: sorted, copy: !!copy.ok, email, ...(waTo ? { waTo } : {}) });
}
