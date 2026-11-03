// "Everything for this email" in /mentor (Alexandru, 3 Nov 2026: "the email
// must become clickable and show the other connections the email has, and
// everything else, with the linktolead entry points"). One read, nothing
// written: every account with this address, how it came in (the page, the
// source, the doors it crossed), and everything tied to it, dated: the North
// Star, the levels, the tools, the letters, the questions, the calls asked
// for, the refunds, the payments and what Mailchimp was told. Bookings and
// refunds are matched by the address too, so a person who never made an
// account still shows. Reading founders is always allowed (AGENTS.md rule
// 18); payment amounts only with the payments right.

import { looksLikeEmail } from './_shared.js';
import { bookingTables } from './_booking.js';
import { refundTable } from './_refund.js';
import { isTeamMember } from './_team.js';
import { LIBRARY_ITEMS } from './api/library.js';

/** Rows of a query, or [] when the table is not there yet. */
async function rows(D, sql, ...bind) {
  try { return (await D.prepare(sql).bind(...bind).all()).results || []; } catch { return []; }
}

/** The dates the North Star was taken: earlier ones from its history, then the current one. */
export function northStarDates(c) {
  if (!c) return [];
  let hist = [];
  try { const j = c.answers_json ? JSON.parse(c.answers_json) : null; hist = Array.isArray(j && j.history) ? j.history.map((h) => h && h.at).filter((x) => typeof x === 'string') : []; } catch { hist = []; }
  return [...hist, c.updated_at].filter(Boolean);
}

/** The Blueprint levels touched (Version 4 worksheet keys w.v4.<level>.…), each with its first and last day. */
export function levelsTouched(sheet) {
  const L = new Map();
  for (const r of sheet || []) {
    const m = /^w\.v4\.(\d{1,2})\.(?!w\.)/.exec(String(r.key || ''));
    if (!m || String(r.value ?? '').trim() === '') continue;
    const n = Number(m[1]), at = r.updated_at || '';
    const o = L.get(n) || { level: n, first: at, last: at };
    if (at && (!o.first || at < o.first)) o.first = at;
    if (at && at > o.last) o.last = at;
    L.set(n, o);
  }
  return [...L.values()].sort((a, b) => a.level - b.level);
}

export async function emailTrail(D, env, raw, { money = false } = {}) {
  const email = String(raw || '').trim().toLowerCase().slice(0, 200);
  if (!looksLikeEmail(email)) return { email, bad: true };
  await Promise.all([bookingTables(D).catch(() => {}), refundTable(D).catch(() => {})]);

  const people = await rows(D, 'SELECT id, name, email, phone, tier, joined_at, last_seen_at FROM student WHERE lower(email) = ? ORDER BY joined_at LIMIT 5', email);
  const accounts = [];
  for (const s of people) {
    const [prof, events, pays, notes, msgs, compass, course, series, tools, sheet] = await Promise.all([
      rows(D, `SELECT landing, source, signup_type, consent, consent_at, unsubscribed, unsub_at, utm_source, utm_medium, utm_campaign, utm_content,
        company, interest, industry, tz FROM student_profile WHERE student_id = ?`, s.id),
      rows(D, 'SELECT kind, at, detail FROM event WHERE student_id = ? ORDER BY at DESC LIMIT 400', s.id),
      rows(D, 'SELECT step, amount, currency, mode, at FROM payment WHERE student_id = ? ORDER BY at DESC', s.id),
      rows(D, 'SELECT level, domain, status, created_at, answered_at FROM note WHERE student_id = ? ORDER BY created_at DESC', s.id),
      rows(D, 'SELECT subject, channel, sent_at, read_at, note_id FROM message WHERE student_id = ? ORDER BY sent_at DESC LIMIT 100', s.id),
      rows(D, 'SELECT updated_at, answers_json FROM compass WHERE student_id = ?', s.id),
      rows(D, 'SELECT course, started_at, day_sent, stopped_at FROM course_sub WHERE student_id = ?', s.id),
      rows(D, 'SELECT series, grp, started_at, sent, stopped_at, stop_why, test FROM series_sub WHERE student_id = ? ORDER BY started_at', s.id),
      rows(D, 'SELECT tool, summary, updated_at FROM tool_run WHERE student_id = ? ORDER BY updated_at', s.id),
      rows(D, "SELECT key, value, updated_at FROM sheet WHERE student_id = ? AND key GLOB 'w.v4.[0-9]*.*'", s.id),
    ]);
    accounts.push({
      ...s, profile: prof[0] || null,
      // Only what /mentor shows: the kinds and their dates, a short detail.
      events: events.map((e) => ({ kind: e.kind, at: e.at, detail: e.kind === 'library-download' && LIBRARY_ITEMS[e.detail] ? LIBRARY_ITEMS[e.detail].name : String(e.detail ?? '').slice(0, 120) })),
      payments: pays.map((p) => ({ step: p.step, mode: p.mode, at: p.at, ...(money ? { amount: p.amount, currency: p.currency } : {}) })),
      notes, messages: msgs.map((m) => ({ subject: m.subject, channel: m.channel, at: m.sent_at, read: !!m.read_at, answer: !!m.note_id })),
      northStar: northStarDates(compass[0]), course, series, tools, levels: levelsTouched(sheet),
    });
  }
  const [bookings, refunds, mailchimp] = await Promise.all([
    rows(D, 'SELECT id, kind, status, created_at, confirmed_time, student_id, phone FROM booking WHERE lower(email) = ? ORDER BY created_at DESC', email),
    rows(D, 'SELECT step, asked_at, done_at FROM refund_ask WHERE lower(email) = ? ORDER BY asked_at DESC', email),
    rows(D, 'SELECT action, status, mode, detail, at FROM mailchimp_log WHERE lower(email) = ? ORDER BY id DESC LIMIT 100', email),
  ]);
  let team = false;
  try { team = await isTeamMember(D, email, env); } catch { team = false; }
  return { email, team, accounts, bookings, refunds, mailchimp: mailchimp.map((m) => ({ ...m, detail: String(m.detail ?? '').slice(0, 160) })) };
}
