// The letters that follow each pain (functions/_series-letters.js, approved by
// Alexandru on 2 Nov 2026, word for word): the engine that sends them.
// Sent by the site through Resend (functions/_mail.js), like 12 Days to Start
// Winning (functions/_course.js), never by a Mailchimp automation.
//
// Three series, each started by something the founder did:
//   northstar  The Leader's North Star finished (every domain answered, the
//              same rule as the Mailchimp tags) with a first pain: that pain's
//              4 letters, days 1, 3, 6 and 10 after (functions/api/compass.js).
//   never      An account made (signup.js, google.js), nothing written in
//              Level 01: days 2, 5 and 9. Stops the moment they write in
//              Level 01 (functions/api/state.js).
//   level3     Levels 01, 02 and 03 all written in (the same meaning as
//              launchpadDone in public/mentor/dash.js): the morning after,
//              then day 4 (functions/api/state.js).
//
// Every letter goes from 8:00 in the founder's own time zone (never after
// 21:00), on its own day. At most one automatic letter a founder's day across
// every series and 12 Days. The hourly cron runs this job before the 12 Days
// one (worker.js JOBS), so a series letter keeps its day and 12 Days, which
// already shifts by a day when one is missed, waits for tomorrow; if a 12 Days
// letter did go first that day, the series letter waits for tomorrow instead.
//
// Honest timing (AGENTS.md rule 6): some letters count the days ("Ten days ago
// you finished your North Star", "two days ago"). Those go on their own day
// or not at all. Any other letter that missed its day goes at the next chance,
// up to LATE_DAYS late and never on the next letter's day; after that it is
// skipped, never piled up. A
// letter that speaks of the one before it ("Two days ago I asked you…", "my
// letter about The Boardroom") goes only if that one went.
//
// Stops: unsubscribe, the next series starting, Level 01 written (never), the
// last letter. Waits: the account paused in /mentor, or the letters paused
// (a new question in Ask Alexandru pauses them until the mentor resumes them
// in /mentor). Only founders who said yes to letters (consent, not
// unsubscribed: the same rule as "Letters from your mentor").
//
// SERIES_MODE in the Cloudflare settings: empty or "off" (the default)
// enrols and sends nothing; "test" enrols and logs what would be sent (event
// 'series-test'), sending nothing to founders and calling no Mailchimp;
// "on" sends, and tags the founder in Mailchimp on enrolment (with consent,
// respecting MAILCHIMP_MODE). Founders enrolled in test mode stay test rows:
// they never get real letters.

import { now } from './_shared.js';
import { letter, link, button, GOOD_WORDS, threeAssessments, nameCase } from './_letters.js';
import { SERIES_LETTERS, SERIES_GROUPS, SERIES_TAGS } from './_series-letters.js';
import { send, mailState } from './_mail.js';
import { unsubLink } from './_account.js';
import { letterContext, okTz } from './_mentor.js';
import { localParts, SEND_HOUR, LATEST_HOUR, PER_RUN, DEFAULT_TZ, SITE, COURSE } from './_course.js';
import { syncFounder, weakestTag } from './_mailchimp.js';

/** What the email map and /mentor say about these letters. */
export const SERIES_STATUS = 'Sending when SERIES_MODE is on';

/** 'off' (the default), 'test' or 'on', from SERIES_MODE. */
export function seriesMode(env) {
  const m = String((env && env.SERIES_MODE) || '').trim().toLowerCase();
  return m === 'on' || m === 'test' ? m : 'off';
}

/** The three series, in the order a founder usually meets them. `start` is
 *  the day the example founder, Sam, started each one (the North Star and the
 *  account on Sunday 1 Nov 2026, Level 03 on Thursday 19 Nov): the stored
 *  letters were written for those days, so each "by Wednesday" is read
 *  against them. */
export const SERIES = {
  never: { name: 'Never started', kind: 'never', tag: SERIES_TAGS.never, start: '2026-11-01', trigger: 'account made, nothing written in Level 01' },
  northstar: { name: 'After The Leader’s North Star', kind: 'pain', tag: SERIES_TAGS.northstar, start: '2026-11-01', trigger: 'The Leader’s North Star finished with a first pain' },
  level3: { name: 'Finished Level 03', kind: 'level3', tag: SERIES_TAGS.level3, start: '2026-11-19', trigger: 'Levels 01, 02 and 03 written in' },
};
/** A group's series: the eight pains are the North Star series. */
export const seriesOf = (g) => (g === 'never' || g === 'level3' ? g : 'northstar');
export const GROUPS = Object.fromEntries(SERIES_GROUPS.map((g) => [g.id, g]));
export const PAINS = SERIES_GROUPS.filter((g) => g.kind === 'pain').map((g) => g.id);

/** The founder's North Star want, in the letters' lowercase words
 *  (public/northstar/engine.js GOALS; a test holds them equal). */
export const WANTS = { freedom: 'more free time', income: 'higher income', steady: 'steady clients', team: 'a team I trust', clarity: 'clarity on direction', grow: 'a new market' };
/** The storm rule: Level 03, the Lag domain (index 2), its three blanks
 *  (public/levels-v4.js; a test holds the keys there). The example founder's
 *  words are the placeholders the level shows. */
export const STORM_KEY = 'w.v4.3.2.';
const STORM_EXAMPLE = { panic: 'feel', 24: 'hours', money: 'about' };
/** How many days late a letter whose words do not count the days may still go. */
export const LATE_DAYS = 3;
/** Letters whose words speak of the letter before them. */
export const SPEAKS_OF_PREVIOUS = { 'alone-2': 'Two days ago I asked you', 'level3-2': 'my letter about The Boardroom' };

// ── Dates, as YYYY-MM-DD in the founder's own calendar ──────────────────────
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const noon = (ymd) => new Date(`${ymd}T12:00:00Z`);
export const addDays = (ymd, n) => { const t = noon(ymd); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
export const weekday = (ymd) => WEEKDAYS[noon(ymd).getUTCDay()];
/** "today", or "by Wednesday": the weekday `k` days after `ymd`. */
export const byDay = (ymd, k) => (k === 0 ? 'today' : `by ${weekday(addDays(ymd, k))}`);
/** Whole days from one date to a later one. */
export const daysFrom = (a, b) => Math.round((noon(b) - noon(a)) / 86400000);

// ── The approved words, read into parts letter() can draw ───────────────────
// Each stored `text` is the whole letter as rendered for Sam with the real
// frame. The greeting, the good word, the reply line, the farewell, the
// signature, the free assessments and the footer come from letter() in
// functions/_letters.js; here we keep only what is the letter's own: the
// paragraphs (⟦…⟧ marks the founder's own answers), the button, the one-tap
// questions and the P.S.

const BUTTON_RE = /^(.+ →): (https:\/\/\S+)$/;
const URL_RE = /https:\/\/\S+/g;
/** A link on this site keeps only its path, so it points at the site that sends it. */
const where = (u) => (u.startsWith(`${SITE}/`) ? { path: u.slice(SITE.length) } : { url: u });
const REPLY = 'Any question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.';
const SIGNED = 'Alexandru\nAlexandru Cojocari · ExploraSelf';

/** Text with links in it, as letter() parts: strings, { url } and { path }. */
function withLinks(s) {
  const out = [];
  let at = 0;
  for (const m of s.matchAll(URL_RE)) {
    if (m.index > at) out.push(s.slice(at, m.index));
    out.push(where(m[0]));
    at = m.index + m[0].length;
  }
  if (at < s.length) out.push(s.slice(at));
  return out;
}

/** One stored letter, in parts. `problems` lists anything that did not read
 *  as expected (a test holds it empty for all 37). */
export function parseLetter(L) {
  const problems = [];
  const series = seriesOf(L.g), g = GROUPS[L.g] || {};
  const example = addDays(SERIES[series].start, L.day);
  const cut = L.text.indexOf('\n—\n');
  const body = cut < 0 ? L.text : L.text.slice(0, cut);
  const why = cut < 0 ? '' : L.text.slice(cut + 3).split('\n')[0];
  if (!why) problems.push('no footer');
  const P = body.split('\n\n');
  if (P[0] !== 'Hi ⟦Sam⟧,') problems.push('greeting');
  const good = P.findIndex((p) => GOOD_WORDS.includes(p));
  if (good < 2) problems.push('good word');
  const reply = String(P[good + 1] || '').split('\n');
  if (reply[0] !== REPLY) problems.push('reply line');
  const ask = reply.slice(1).map((q) => q.replace(/^· /, ''));
  if (!ask.length || reply.slice(1).some((q) => !q.startsWith('· '))) problems.push('one-tap questions');
  if (!/^See you soon\. Have a good (morning|day|afternoon|evening)\.$|^See you soon\. Have a restful night\.$/.test(P[good + 2] || '')) problems.push('farewell');
  if (P[good + 3] !== SIGNED) problems.push('signature');
  const psRaw = P[good + 4] || '';
  if (!psRaw.startsWith('P.S. ')) problems.push('P.S.');
  const seed = GOOD_WORDS.indexOf(P[good]);
  const tests = 'Free assessments, when you want to look deeper:\n' + threeAssessments(seed).map((t) => `· ${t.n}: ${t.u}`).join('\n');
  if (P[good + 5] !== tests) problems.push('free assessments');
  if (P.length !== good + 6) problems.push('paragraphs after the assessments');

  let subject = L.subject, named = false;
  if (/^Sam, /.test(subject)) { named = true; subject = subject.slice(5); }
  if (/\bSam\b/.test(subject)) problems.push('a name in the subject');

  const paras = P.slice(1, Math.max(1, good)).map((p) => {
    const b = BUTTON_RE.exec(p);
    if (b) return { button: b[1], ...where(b[2]) };
    if (/https?:\/\//.test(p)) problems.push(`a bare link: ${p.slice(0, 40)}`);
    if (/\bSam\b/.test(p.replace(/⟦Sam⟧/g, ''))) problems.push('a name outside ⟦⟧');
    return p.replace(/(, )?⟦([^⟧]*)⟧/g, (all, comma, v) => {
      const pre = comma || '';
      if (v === 'Sam') { if (!comma) problems.push('⟦Sam⟧ not after a comma'); return `${pre}⟦first⟧`; }
      if (v === g.want) { if (!/^You told me you want ⟦[^⟧]+⟧\. \S/.test(p)) problems.push('the want sentence'); return `${pre}⟦want⟧`; }
      if (v === 'today') return `${pre}⟦by+0⟧`;
      const by = /^by (\w+)$/.exec(v);
      if (by && WEEKDAYS.includes(by[1])) return `${pre}⟦by+${(WEEKDAYS.indexOf(by[1]) - noon(example).getUTCDay() + 7) % 7}⟧`;
      if (Object.hasOwn(STORM_EXAMPLE, v)) return `${pre}⟦${STORM_EXAMPLE[v]}⟧`;
      problems.push(`unknown field ⟦${v}⟧`);
      return all;
    });
  });
  const buttons = paras.filter((p) => typeof p !== 'string').length;
  if (buttons !== 1) problems.push(`${buttons} buttons`);
  const words = paras.filter((p) => typeof p === 'string').join('\n\n');
  if (SPEAKS_OF_PREVIOUS[L.id] && !words.includes(SPEAKS_OF_PREVIOUS[L.id])) problems.push('no longer speaks of the letter before');
  return {
    id: L.id, g: L.g, series, n: L.n, day: L.day, subject, named, paras, ask, seed, why,
    ps: withLinks(psRaw.slice(5)),
    // The step's day, as days after the send ("by Wednesday" on a Monday: 2).
    by: [...words.matchAll(/⟦by\+(\d)⟧/g)].map((m) => Number(m[1])),
    // Its words count the days: it goes on its own day, or not at all.
    exact: /\bdays ago\b/i.test(words),
    needsPrev: !!SPEAKS_OF_PREVIOUS[L.id],
    paid: !!L.paid || /\$27/.test(psRaw),
    problems,
  };
}

export const PARSED = SERIES_LETTERS.map(parseLetter);
const BY_ID = Object.fromEntries(PARSED.map((p) => [p.id, p]));
/** The letters of one group (a pain, 'never' or 'level3'), in order. */
export const lettersOf = (g) => PARSED.filter((p) => p.g === g).sort((a, b) => a.n - b.n);
/** Why the footer says each series came. */
export const WHY = Object.fromEntries(Object.keys(SERIES).map((k) => [k, (PARSED.find((p) => p.series === k) || {}).why || '']));

const hi = (first) => (first ? `Hi ${nameCase(first)},` : 'Hi,');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * One letter for one founder, ready for send(). Fields from their own
 * answers; one that is not known reads naturally without it, never invented:
 *   first  their first name; none: "Hi," and no name in the sentence
 *   want   their North Star want, lowercase ("a team I trust"); none: "If
 *          what you want is a team I trust, the road there starts…"
 *   storm  { feel, hours, about } from Level 03; any blank: the paragraph
 *          quoting it is left out
 *   date   the day it goes (YYYY-MM-DD, their calendar), for "by Wednesday"
 */
export function seriesLetter(base, id, { first = '', want = '', storm = null, date = '', mentor, tz = '', at } = {}) {
  const L = BY_ID[id];
  if (!L) return null;
  const g = GROUPS[L.g] || {};
  const day = date || localParts(tz, at || new Date()).date;
  const hasStorm = !!(storm && storm.feel && storm.hours && storm.about);
  const paras = [hi(first)];
  for (const p of L.paras) {
    if (typeof p !== 'string') { paras.push(button(p.path ? `${base}${p.path}` : p.url, p.button)); continue; }
    if (/⟦(feel|hours|about)⟧/.test(p) && !hasStorm) continue;
    let s = p;
    if (!want) s = s.replace(/^You told me you want ⟦want⟧\. (\S)/, (_, c) => `If what you want is ${g.want}, ${c.toLowerCase()}`);
    s = s.replace(/(, )?⟦first⟧/g, (_, comma) => (first ? `${comma || ' '}${first}` : ''))
      .replace(/⟦want⟧/g, want)
      .replace(/⟦by\+(\d)⟧/g, (_, k) => byDay(day, Number(k)))
      .replace(/⟦(feel|hours|about)⟧/g, (_, k) => storm[k]);
    paras.push(s);
  }
  const subject = L.named ? (first ? `${first}, ${L.subject}` : cap(L.subject)) : L.subject;
  const ps = { line: (b) => L.ps.map((x) => (typeof x === 'string' ? x : link(x.path ? `${b}${x.path}` : x.url))) };
  return { subject, ...letter(base, paras, ps, { mentor, tz, at, ask: L.ask, seed: L.seed }) };
}

// ── What a founder told us, for the fields ──────────────────────────────────

const flagsOf = (c) => { try { return JSON.parse((c && c.flags_json) || 'null') || {}; } catch { return {}; } };

/** The want for a pain's letters: the one that matches the pain if they named
 *  it (as want or want2), else their first; '' when they named none. */
export function wantFor(flags, g) {
  const named = [flags && flags.want, flags && flags.want2].filter((k) => Object.hasOwn(WANTS, k || '')).map((k) => WANTS[k]);
  const own = GROUPS[g] && GROUPS[g].want;
  return named.includes(own) ? own : named[0] || '';
}

/** Their own words, made safe to quote: one line, no closing full stop, short. */
const said = (v, max = 60) => {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim().replace(/[.!,;:]+$/, '').trim();
  return s.length <= max ? s : '';
};
/** The storm rule from Level 03, or null when any blank is empty. */
export function stormOf(rows) {
  const f = {};
  for (const r of rows || []) if (String(r.key).startsWith(STORM_KEY)) f[String(r.key).slice(STORM_KEY.length)] = r.value;
  const out = { feel: said(f.feel), hours: said(f.hours).replace(/\s*(hours?|hrs?|h)$/i, '').trim(), about: said(f.about) };
  return out.feel && out.hours && out.about ? out : null;
}

/** The North Star's first pain, once it is finished (every domain answered),
 *  else ''. */
export function finishedPain(c) {
  if (!c || !weakestTag(c.results_json)) return '';
  const pains = flagsOf(c).pains;
  const first = Array.isArray(pains) ? pains[0] : '';
  return PAINS.includes(first) ? first : '';
}

/** Which of Levels 01–03 hold any written answer: Version 4 work
 *  (w.v4.<level>.…, not the welcome page's w.v4.<level>.w.…) or the earlier
 *  seven-step answers. */
export async function levelsWritten(D, studentId) {
  const one = (n) => `(EXISTS (SELECT 1 FROM sheet WHERE student_id = ?1 AND key LIKE 'w.v4.${n}.%' AND key NOT LIKE 'w.v4.${n}.w.%' AND COALESCE(value, '') <> '')
    OR EXISTS (SELECT 1 FROM answer WHERE student_id = ?1 AND level = ${n} AND COALESCE(body, '') <> '')) AS l${n}`;
  const r = await D.prepare(`SELECT ${one(1)}, ${one(2)}, ${one(3)}`).bind(studentId).first();
  return new Set([1, 2, 3].filter((n) => r && Number(r[`l${n}`])));
}

/** The levels 01–03 a batch of answers wrote in (functions/api/state.js). */
export function levelsIn(answers = {}, work = {}) {
  const out = new Set();
  for (const [k, v] of Object.entries(work || {})) {
    const m = /^w\.v4\.([123])\.(?!w\.)/.exec(k);
    if (m && String(v ?? '').trim()) out.add(Number(m[1]));
  }
  for (const [k, v] of Object.entries(answers || {})) {
    const m = /^(?:build|grow|scale)\.([123])\./.exec(k);
    if (m && String(v ?? '').trim()) out.add(Number(m[1]));
  }
  return out;
}

// ── Enrolment, stops and pauses ─────────────────────────────────────────────

const event = (D, id, kind, detail) => D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(id, kind, now(), detail).run();

/** Start one series for one founder, once. A later series stops an earlier
 *  one. Consent only. In test mode the row is a test row and no Mailchimp
 *  call is made; on, the series tag goes to Mailchimp. */
export async function enrol(env, D, studentId, series, { grp, at = new Date(), tz = '' } = {}) {
  const mode = seriesMode(env);
  if (mode === 'off' || !SERIES[series]) return { status: 'off' };
  const g = grp || series;
  if (seriesOf(g) !== series || !lettersOf(g).length) return { status: 'skipped', detail: 'Unknown group.' };
  const p = await D.prepare('SELECT consent, unsubscribed, tz FROM student_profile WHERE student_id = ?').bind(studentId).first();
  if (!p || !p.consent || p.unsubscribed) return { status: 'skipped', detail: 'No yes to letters.' };
  const test = mode === 'test' ? 1 : 0;
  const zone = okTz(tz) || okTz(p.tz) || DEFAULT_TZ;
  const stamp = new Date(at).toISOString();
  const r = await D.prepare(`INSERT OR IGNORE INTO series_sub (student_id, series, grp, started_at, start_local, tz, test) VALUES (?,?,?,?,?,?,?)`)
    .bind(studentId, series, g, stamp, localParts(zone, at).date, zone, test).run();
  if (!(r && r.meta && r.meta.changes)) return { status: 'already' };
  await D.prepare('UPDATE series_sub SET stopped_at = ?, stop_why = ? WHERE student_id = ? AND series <> ? AND test = ? AND stopped_at IS NULL')
    .bind(stamp, `next series: ${series}`, studentId, series, test).run();
  const tag = SERIES[series].tag;
  await event(D, studentId, 'series-start', `${series} · ${g}${test ? ` · test: would tag ${tag}` : ''}`);
  if (!test) await syncFounder(env, D, studentId, 'tag', { tag }).catch(() => null);
  return { status: test ? 'test' : 'ok' };
}

/** Stop a founder's active series ('never' when they write in Level 01). */
export async function stopSeries(D, studentId, series, why) {
  const r = await D.prepare('UPDATE series_sub SET stopped_at = ?, stop_why = ? WHERE student_id = ? AND series = ? AND stopped_at IS NULL')
    .bind(now(), why, studentId, series).run();
  if (r && r.meta && r.meta.changes) await event(D, studentId, 'series-stop', `${series} · ${why}`);
}

/** Pause or resume a founder's letters. `why`: 'question' (they asked in
 *  Ask Alexandru) or 'mentor' (the button in /mentor). A question pauses only
 *  a series that is running. */
export async function holdLetters(D, studentId, on, why = 'mentor') {
  if (on) {
    const r = await D.prepare(`UPDATE student_profile SET series_hold = ?, series_hold_at = ? WHERE student_id = ? AND series_hold IS NULL
        ${why === 'question' ? 'AND EXISTS (SELECT 1 FROM series_sub WHERE student_id = ?3 AND stopped_at IS NULL)' : ''}`).bind(why, now(), studentId).run();
    if (r && r.meta && r.meta.changes) await event(D, studentId, 'series-pause', why);
    return;
  }
  const r = await D.prepare('UPDATE student_profile SET series_hold = NULL, series_hold_at = NULL WHERE student_id = ? AND series_hold IS NOT NULL').bind(studentId).run();
  if (r && r.meta && r.meta.changes) await event(D, studentId, 'series-resume', 'mentor');
}

// ── The triggers (each route calls one, after its reply) ───────────────────

/** functions/api/compass.js: the North Star was saved. Finished with a first
 *  pain starts that pain's letters. Until letter 1 has gone, a changed first
 *  pain changes the series. */
export async function afterNorthStar(env, D, studentId, { at = new Date() } = {}) {
  if (seriesMode(env) === 'off') return null;
  const c = await D.prepare('SELECT results_json, flags_json FROM compass WHERE student_id = ?').bind(studentId).first();
  const pain = finishedPain(c);
  if (!pain) return null;
  const had = await D.prepare("SELECT grp, step, stopped_at FROM series_sub WHERE student_id = ? AND series = 'northstar'").bind(studentId).first();
  if (had) {
    if (!had.stopped_at && had.step === 0 && had.grp !== pain) {
      await D.prepare("UPDATE series_sub SET grp = ? WHERE student_id = ? AND series = 'northstar' AND step = 0").bind(pain, studentId).run();
      await event(D, studentId, 'series-change', `northstar · ${pain}`);
    }
    return { status: 'already' };
  }
  return enrol(env, D, studentId, 'northstar', { grp: pain, at });
}

/** functions/api/signup.js, google.js: a new account. */
export async function afterAccount(env, D, studentId, { at = new Date(), tz = '' } = {}) {
  if (seriesMode(env) === 'off') return null;
  if ((await levelsWritten(D, studentId)).has(1)) return null;
  return enrol(env, D, studentId, 'never', { at, tz });
}

/** functions/api/state.js: answers were saved; `levels` are the levels 01–03
 *  this batch wrote in (levelsIn). */
export async function afterAnswers(env, D, studentId, levels, { at = new Date() } = {}) {
  if (seriesMode(env) === 'off' || !levels || !levels.size) return null;
  if (levels.has(1)) await stopSeries(D, studentId, 'never', 'wrote in Level 01');
  const had = await D.prepare("SELECT 1 AS x FROM series_sub WHERE student_id = ? AND series = 'level3'").bind(studentId).first();
  if (had) return null;
  const L = await levelsWritten(D, studentId);
  if (!(L.has(1) && L.has(2) && L.has(3))) return null;
  return enrol(env, D, studentId, 'level3', { at });
}

/** functions/api/note.js: a question in Ask Alexandru pauses the letters. */
export async function afterQuestion(env, D, studentId) {
  if (seriesMode(env) === 'off') return null;
  return holdLetters(D, studentId, true, 'question');
}

// ── Timing ──────────────────────────────────────────────────────────────────

/**
 * What one series row owes now. `sub`: start_local, tz, step (the next
 * letter's index), last_n and last_local (the last letter that went),
 * stopped_at. `blocked`: another automatic letter went today.
 * Returns { skip: [ids], step, letter, date, now, done }:
 *   skip    letters whose chance has passed (see the rules at the top)
 *   letter  the letter owed today, if any; `now` when it may go this hour
 *   done    every letter has gone or been skipped
 */
export function plan(sub, at = new Date(), { blocked = false } = {}) {
  const list = lettersOf(sub.grp);
  const { date, hour } = localParts(sub.tz, at);
  const out = { skip: [], step: Number(sub.step) || 0, letter: null, date, now: false, done: false };
  if (sub.stopped_at) return out;
  while (out.step < list.length) {
    const L = list[out.step], day = addDays(sub.start_local, L.day);
    if (date < day) return out;
    const next = list[out.step + 1] ? addDays(sub.start_local, list[out.step + 1].day) : null;
    const prev = list[out.step - 1];
    const prevOk = !L.needsPrev || (Number(sub.last_n) === L.n - 1 && (!L.exact || sub.last_local === addDays(sub.start_local, prev.day)));
    const late = daysFrom(day, date);
    if ((L.exact && late > 0) || late > LATE_DAYS || (next && date >= next) || !prevOk) { out.skip.push(L.id); out.step++; continue; }
    out.letter = L;
    out.now = hour >= SEND_HOUR && hour < LATEST_HOUR && !blocked && sub.last_local !== date;
    return out;
  }
  out.done = true;
  return out;
}

/** The send day of each letter for a series started on `start` (no delays). */
export const scheduleOf = (g, start) => lettersOf(g).map((L) => ({ id: L.id, n: L.n, day: L.day, date: addDays(start, L.day), by: L.by, exact: L.exact, needsPrev: L.needsPrev }));

// ── The hourly run ──────────────────────────────────────────────────────────

/** The fields one founder's letter needs, from their own answers. */
async function fieldsFor(D, row) {
  if (row.series === 'northstar') {
    const c = await D.prepare('SELECT flags_json FROM compass WHERE student_id = ?').bind(row.student_id).first();
    return { want: wantFor(flagsOf(c), row.grp) };
  }
  if (row.series === 'level3') {
    const rows = (await D.prepare("SELECT key, value FROM sheet WHERE student_id = ? AND key LIKE 'w.v4.3.2.%'").bind(row.student_id).all()).results || [];
    return { storm: stormOf(rows) };
  }
  return {};
}

const sameDay = (iso, tz, date) => !!iso && localParts(tz, new Date(iso)).date === date;

/** Every series letter owed now, at most PER_RUN. In test mode, test rows
 *  only, and nothing leaves: each letter is built and logged. */
export async function sendDue(env, D, base = SITE, at = new Date()) {
  const mode = seriesMode(env);
  if (mode === 'off') return { sent: 0, failed: 0, why: 'SERIES_MODE is off.' };
  const st = mailState(env);
  if (mode === 'on' && !st.ready) return { sent: 0, failed: 0, why: st.reason };
  const test = mode === 'test' ? 1 : 0;
  const rows = (await D.prepare(`SELECT ss.*, s.email, s.name, p.consent, p.unsubscribed, p.unsub_id, p.series_hold, COALESCE(au.paused, 0) AS paused,
      (SELECT cs.last_sent_at FROM course_sub cs WHERE cs.student_id = ss.student_id AND cs.course = ? AND cs.day_sent >= 1) AS course_last,
      (SELECT MAX(o.last_sent_at) FROM series_sub o WHERE o.student_id = ss.student_id AND o.series <> ss.series AND o.test = ss.test) AS other_last
    FROM series_sub ss JOIN student s ON s.id = ss.student_id
      LEFT JOIN student_profile p ON p.student_id = ss.student_id
      LEFT JOIN account_auth au ON au.student_id = ss.student_id
    WHERE ss.stopped_at IS NULL AND ss.test = ? LIMIT 1000`).bind(COURSE, test).all()).results || [];
  let sent = 0, failed = 0, skipped = 0;
  for (const row of rows) {
    if (sent + failed >= PER_RUN) break;
    if (row.unsubscribed || !row.consent) { await stopSeries(D, row.student_id, row.series, row.unsubscribed ? 'unsubscribed' : 'no yes to letters'); continue; }
    const today = localParts(row.tz, at).date;
    const pl = plan(row, at, { blocked: sameDay(row.course_last, row.tz, today) || sameDay(row.other_last, row.tz, today) });
    if (pl.skip.length) {
      await D.prepare('UPDATE series_sub SET step = ? WHERE student_id = ? AND series = ?').bind(pl.step, row.student_id, row.series).run();
      for (const id of pl.skip) await event(D, row.student_id, 'series-skip', `${id} · its day passed${test ? ' · test' : ''}`);
      skipped += pl.skip.length;
    }
    if (pl.done) { await stopSeries(D, row.student_id, row.series, 'done'); continue; }
    if (!pl.letter || !pl.now || row.paused || row.series_hold) continue;
    // Never started: writing in Level 01 ends it, even if the batch hook missed it.
    if (row.series === 'never' && (await levelsWritten(D, row.student_id)).has(1)) { await stopSeries(D, row.student_id, 'never', 'wrote in Level 01'); continue; }
    const [first] = String(row.name || '').trim().split(/\s+/);
    const ctx = await letterContext(D, row.student_id, row.tz);
    const L = seriesLetter(base, pl.letter.id, { first, ...(await fieldsFor(D, row)), date: today, ...ctx, at });
    const r = test ? { ok: true } : await send(env, { to: row.email, ...L, why: WHY[row.series], unsubUrl: unsubLink(base, row) });
    const last = pl.step + 1 >= lettersOf(row.grp).length;
    if (r.ok) {
      await D.prepare(`UPDATE series_sub SET step = ?, sent = sent + 1, last_n = ?, last_local = ?, last_sent_at = ?,
          stopped_at = ?, stop_why = ? WHERE student_id = ? AND series = ?`)
        .bind(pl.step + 1, pl.letter.n, today, new Date(at).toISOString(), last ? now() : null, last ? 'done' : null, row.student_id, row.series).run();
    }
    await event(D, row.student_id, test ? 'series-test' : r.ok ? 'series-letter' : 'series-letter-failed',
      test ? `${pl.letter.id} · would send “${L.subject}” to ${row.email}` : `${pl.letter.id}${r.ok ? '' : ` · ${r.why || ''}`}`);
    if (r.ok) sent++; else failed++;
  }
  return { sent, failed, skipped, mode };
}
