// The letters that follow each pain (functions/_series.js): the 37 approved
// letters read from their stored text and rendered back word for word, the
// fields filled from the founder's own answers (and left out, never invented,
// when unknown), the three triggers, the timing in the founder's time zone,
// one automatic letter a day with 12 Days, the stop and pause rules,
// SERIES_MODE off / test / on, the Mailchimp tag, and /mentor. No network:
// Resend and Mailchimp are faked or in test mode.

import { readFileSync } from 'node:fs';
import { SERIES_LETTERS, SERIES_GROUPS, SERIES_TAGS } from '../functions/_series-letters.js';
import { PARSED, SERIES, WANTS, STORM_KEY, LATE_DAYS, seriesLetter, seriesMode, plan, wantFor, stormOf, finishedPain, levelsIn, lettersOf, addDays, byDay,
  enrol, sendDue, SERIES_STATUS, SPEAKS_OF_PREVIOUS } from '../functions/_series.js';
import { sendDue as courseDue, COURSE } from '../functions/_course.js';
import { STUDENT_TABLES } from '../functions/_shared.js';
import { GOOD_WORDS } from '../functions/_letters.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as compassPost } from '../functions/api/compass.js';
import { onRequestPost as statePost } from '../functions/api/state.js';
import { onRequestPost as notePost } from '../functions/api/note.js';
import { onRequestGet as mGet, onRequestPost as mPost } from '../functions/api/mentor.js';
import { SERIES_NAMES, SERIES_LENGTH, WANT_NAMES, PAIN_NAMES, seriesInfo } from '../public/mentor/dash.js';
import { LEVELS4 } from '../public/levels-v4.js';
import { JOBS } from '../worker.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';

const { ok, done } = tally('series');
const B = 'https://linktolead.exploraself.com';
const NY = 'America/New_York';
const at = (s) => new Date(s);
const plainText = (t) => t.replace(/⟦([^⟧]*)⟧/g, '$1');
const SAM = { first: 'Sam', storm: { feel: 'panic', hours: '24', about: 'money' } };
const exampleDate = (L) => addDays(SERIES[PARSED.find((p) => p.id === L.id).series].start, L.day);

// ── Parsing: all 37, word for word ──────────────────────────────────────────
ok(SERIES_LETTERS.length === 37 && PARSED.length === 37, 'all 37 letters read');
for (const p of PARSED) ok(!p.problems.length, `${p.id}: reads cleanly${p.problems.length ? ` (${p.problems.join('; ')})` : ''}`);
for (const L of SERIES_LETTERS) {
  const g = SERIES_GROUPS.find((x) => x.id === L.g);
  const date = exampleDate(L);
  // 8:07 in New York on the example day: "Have a good morning."
  const r = seriesLetter(B, L.id, { ...SAM, want: g.want || '', date, tz: NY, at: at(`${date}T13:07:00Z`) });
  ok(r.text === plainText(L.text).split('\n—\n')[0], `${L.id}: rendered for Sam, word for word as approved (everything but the footer)`);
  ok(r.subject === L.subject, `${L.id}: the subject`);
  ok(/<html/.test(r.html) && r.replyTo === 'support@exploraself.com' && r.fromName === 'Alexandru at ExploraSelf', `${L.id}: html, reply-to and sender from letter()`);
}
const P = Object.fromEntries(PARSED.map((p) => [p.id, p]));
ok(P['alone-1'].paras.filter((x) => typeof x !== 'string').length === 1 && P['alone-1'].paras.find((x) => x.button).button === 'Open Level 01 →' && P['alone-1'].paras.find((x) => x.button).path === '/ground-plan/#programme', 'the button: label and a path on this site');
ok(P['alone-1'].ask.join('|') === 'My task and my person|I’m stuck on this step. Can you help?', 'the one-tap questions');
ok(P['level3-1'].paras.some((x) => typeof x !== 'string' && x.button === 'See what the hour holds →' && x.path === '/boardroom/'), 'the Boardroom button: a path on this site');
ok(P['alone-4'].ps.some((x) => x.path === '/boardroom/') && typeof P['alone-4'].ps.at(-1) === 'string' && P['alone-4'].ps.at(-1).startsWith(' If now isn’t the time'), 'the $27 P.S.: text, the Boardroom page, text after it');
ok(PARSED.filter((p) => p.paid).map((p) => p.id).every((id) => /-4$/.test(id)) && PARSED.filter((p) => p.paid).length === 8, 'the paid Boardroom only in each pain’s letter 4');
ok(PARSED.every((p) => GOOD_WORDS[p.seed]), 'each letter keeps its good word and its three free assessments');
ok(PARSED.filter((p) => p.exact).map((p) => p.id).sort().join() === ['alone-2', 'never-1', ...SERIES_GROUPS.filter((g) => g.kind === 'pain').map((g) => `${g.id}-4`)].sort().join(), 'the letters that count the days: every letter 4, alone-2, never-1');
ok(Object.entries(SPEAKS_OF_PREVIOUS).every(([id, words]) => P[id].needsPrev && P[id].paras.some((x) => typeof x === 'string' && x.includes(words))), 'the letters that speak of the one before');
ok(P['alone-1'].by.join() === '2' && P['switch-1'].by.join() === '0' && P['price-2'].by.join() === '4' && P['level3-1'].by.join() === '3', 'the step day, as days after the send');

// ── Fields ──────────────────────────────────────────────────────────────────
let r = seriesLetter(B, 'alone-1', { first: 'Maria', want: 'a team I trust', date: '2026-11-05', tz: NY });
ok(r.text.startsWith('Hi Maria,\n\n') && r.text.includes('You told me you want a team I trust. The road there') && r.text.includes('Your step, by Saturday: pick one task'), 'name, want, and the step day from the day it goes (a Thursday: by Saturday)');
r = seriesLetter(B, 'alone-1', { date: '2026-11-02', tz: NY });
ok(r.text.startsWith('Hi,\n\n') && !/Sam|⟦/.test(r.text), 'no first name: "Hi,"');
ok(r.text.includes('If what you want is a team I trust, the road there starts with one task, not a whole team.') && !r.text.includes('You told me you want'), 'no want named: never "you told me"; the pain’s own want, as an if');
ok(seriesLetter(B, 'team-1', { date: '2026-11-02' }).text.includes('If what you want is a team I trust, trust is built in steps, starting with one.'), 'the if reads on in each pain (team)');
r = seriesLetter(B, 'alone-3', { date: '2026-11-07' });
ok(r.text.includes('Thank you for reading these. Today is about') && !r.text.includes(', .'), 'no name mid-sentence: the comma goes with it');
ok(seriesLetter(B, 'alone-3', { first: 'Maria', date: '2026-11-07' }).text.includes('Thank you for reading these, Maria.'), 'a name mid-sentence');
ok(seriesLetter(B, 'switch-1', { date: '2026-11-02' }).text.includes('Your step, today: try it once, tonight.'), '"today" stays today');
ok(seriesLetter(B, 'level3-1', { first: 'Maria', date: '2026-11-20' }).subject === 'Maria, you finished your first three levels' && seriesLetter(B, 'level3-1', { date: '2026-11-20' }).subject === 'You finished your first three levels', 'a named subject, and without a name');
r = seriesLetter(B, 'level3-1', { first: 'Maria', storm: { feel: 'angry', hours: '12', about: 'hiring' }, date: '2026-11-20' });
ok(r.text.includes('“When I feel angry above 7 out of 10, I wait 12 hours before I decide about hiring.”'), 'the storm rule in their own words');
r = seriesLetter(B, 'level3-1', { first: 'Maria', storm: null, date: '2026-11-20' });
ok(!r.text.includes('One line you wrote') && r.text.includes('Thank you for the honest work. I don’t take it lightly.\n\nThe next step, if you want it, is The Boardroom.'), 'no storm rule written: that paragraph is left out, never invented');
ok(wantFor({ want: 'income', want2: 'team' }, 'alone') === 'a team I trust' && wantFor({ want: 'income' }, 'alone') === 'higher income' && wantFor({}, 'alone') === '' && wantFor({ want: 'nonsense' }, 'alone') === '', 'the want: the pain’s own if named, else their first, else none');
ok(Object.entries(WANT_NAMES).every(([k, v]) => WANTS[k] === v.charAt(0).toLowerCase() + v.slice(1)), 'the wants are the North Star’s, in lowercase');
const engine = readFileSync(new URL('../public/northstar/engine.js', import.meta.url), 'utf8');
ok(Object.keys(WANTS).every((k) => engine.includes(`['${k}', '`)), 'every want key is a North Star goal');
const storm = (m) => stormOf(Object.entries(m).map(([k, v]) => ({ key: STORM_KEY + k, value: v })));
ok(JSON.stringify(storm({ feel: ' Panic ', hours: '24 hours', about: 'money.' })) === JSON.stringify({ feel: 'Panic', hours: '24', about: 'money' }), 'the storm rule: trimmed, "24 hours" read as 24, no full stop');
ok(storm({ feel: 'panic', hours: '24' }) === null && storm({ feel: 'panic', hours: '24', about: 'x'.repeat(80) }) === null, 'a blank, or a whole paragraph, is not quoted');
const lag = LEVELS4[2].d[2];
ok(STORM_KEY === 'w.v4.3.2.' && LEVELS4[2].n === 3 && lag.name === 'Lag' && ['feel', 'hours', 'about'].every((k) => lag.f.some((p) => Array.isArray(p) && p[0] === k)), 'the storm rule is Level 03, Lag, its three blanks');
ok(finishedPain({ results_json: JSON.stringify({ scores: [1, 2, 3, 4], answered: [2, 2, 2, 2] }), flags_json: JSON.stringify({ pains: ['cash', 'time'] }) }) === 'cash', 'a finished North Star: the first pain');
ok(finishedPain({ results_json: JSON.stringify({ scores: [1, 2, 3, 4], answered: [2, 2, 0, 2] }), flags_json: JSON.stringify({ pains: ['cash'] }) }) === '' && finishedPain({ results_json: JSON.stringify({ scores: [1, 2, 3, 4], answered: [2, 2, 2, 2] }), flags_json: '{}' }) === '', 'unfinished, or no pain: nothing');
ok(levelsIn({}, { 'w.v4.1.0.t': '2', 'w.v4.2.w.seen': '1', 'w.v4.3.1.s': '', 'w.v4.10.0.t': '1' }).size === 1 && levelsIn({ 'grow.3.self.0': 'x' }, {}).has(3), 'which of levels 01–03 a batch wrote in (not the welcome page, not level 10)');

// /mentor's names and lengths are the data's.
ok(SERIES_GROUPS.every((g) => SERIES_NAMES[g.id] === g.name) && SERIES_GROUPS.every((g) => (SERIES_LENGTH[g.id] || 4) === lettersOf(g.id).length), '/mentor: the series names and lengths match the letters');
ok(seriesInfo({ series: 'never|never|1|1||1' }).line === 'Never started · 1 of 3 logged in test mode, none sent · next: letter 2 of 3' && seriesInfo({ series: 'level3|level3|2|2|done|0' }).line === 'Finished Level 03 · 2 of 2 sent · finished'
  && !seriesInfo({ series: 'level3|level3|2|2|done|0' }).active && seriesInfo({}) === null, '/mentor: the series line, test mode and finished');
ok(Object.entries(PAIN_NAMES).every(([k, v]) => SERIES_GROUPS.some((g) => g.id === k && g.name === v)), 'one series per North Star pain');

// ── Timing ──────────────────────────────────────────────────────────────────
const row = (o) => ({ grp: 'alone', start_local: '2026-11-01', tz: NY, step: 0, last_n: 0, last_local: null, stopped_at: null, ...o });
ok(plan(row(), at('2026-11-01T20:00:00Z')).letter === null, 'nothing on the day they finish');
ok(plan(row(), at('2026-11-02T12:30:00Z')).letter.id === 'alone-1' && !plan(row(), at('2026-11-02T12:30:00Z')).now, 'day 1, 7:30 in New York: owed, not yet');
ok(plan(row(), at('2026-11-02T13:07:00Z')).now, 'day 1 from 8:00 their time');
ok(plan(row({ tz: 'Europe/Rome' }), at('2026-11-02T07:07:00Z')).now && !plan(row({ tz: 'Europe/Rome' }), at('2026-11-02T06:30:00Z')).now, 'Rome: from 8:00 Rome time');
ok(!plan(row(), at('2026-11-03T02:30:00Z')).now, 'never after 21:00 their time');
ok(!plan(row(), at('2026-11-02T13:07:00Z'), { blocked: true }).now, 'another automatic letter went today: wait');
ok(!plan(row({ last_local: '2026-11-02' }), at('2026-11-02T15:07:00Z')).now, 'one a day');
let pl = plan(row({ step: 1, last_n: 1, last_local: '2026-11-02' }), at('2026-11-04T13:07:00Z'));
ok(pl.letter.id === 'alone-2' && pl.now, 'letter 2 on day 3, after letter 1 on day 1');
pl = plan(row({ step: 1, last_n: 1, last_local: '2026-11-02' }), at('2026-11-05T13:07:00Z'));
ok(pl.skip.join() === 'alone-2' && pl.letter === null, '"Two days ago": a day late, it is skipped, never sent late');
pl = plan(row({ step: 1, last_n: 1, last_local: '2026-11-03' }), at('2026-11-04T13:07:00Z'));
ok(pl.skip.join() === 'alone-2', 'letter 1 went a day late: "Two days ago I asked you" would not be true, so letter 2 is skipped');
pl = plan(row({ step: 2, last_n: 1, last_local: '2026-11-02' }), at('2026-11-08T13:07:00Z'));
ok(pl.letter && pl.letter.id === 'alone-3' && pl.now && !pl.skip.length, 'a letter that does not count the days goes late (day 7 for day 6)');
pl = plan(row({ step: 2, last_n: 1, last_local: '2026-11-02' }), at('2026-11-11T13:07:00Z'));
ok(pl.skip.join() === 'alone-3' && pl.letter.id === 'alone-4' && pl.now, '…but never on the next letter’s day: skipped, and letter 4 goes on day 10');
pl = plan(row({ grp: 'level3', start_local: '2026-11-19', step: 1, last_n: 1, last_local: '2026-11-20' }), at(`${addDays('2026-11-23', LATE_DAYS + 1)}T13:07:00Z`));
ok(pl.skip.join() === 'level3-2' && pl.done, `the last letter: at most ${LATE_DAYS} days late`);
pl = plan(row({ grp: 'level3', start_local: '2026-11-19', step: 1, last_n: 0, last_local: null }), at('2026-11-23T13:07:00Z'));
ok(pl.skip.join() === 'level3-2', '"my letter about The Boardroom": only if that letter went');
pl = plan(row({ step: 3, last_n: 3, last_local: '2026-11-07' }), at('2026-11-11T13:07:00Z'));
ok(pl.letter.id === 'alone-4' && pl.now, '"Ten days ago": on day 10');
ok(plan(row({ grp: 'never' }), at('2026-11-03T13:07:00Z')).letter.id === 'never-1' && plan(row({ grp: 'level3', start_local: '2026-11-19' }), at('2026-11-20T13:07:00Z')).letter.id === 'level3-1', 'never started: day 2; Level 03: the morning after');
ok(plan(row({ stopped_at: 'x' }), at('2026-11-02T13:07:00Z')).letter === null, 'nothing once stopped');
ok(byDay('2026-11-02', 2) === 'by Wednesday' && byDay('2026-11-07', 2) === 'by Monday' && byDay('2026-11-02', 0) === 'today', 'the step day, by name');

// ── The routes and the hourly run ───────────────────────────────────────────
const DB = fakeD1();
const base = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mk', MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us19' };
let env = { ...base };
let sent = fakeResend();
const jsonOf = async (res) => [res.status, await res.json()];
const subOf = (id, series) => DB.raw.prepare('SELECT * FROM series_sub WHERE student_id = ? AND series = ?').get(id, series);
const events = (id, kind) => DB.raw.prepare('SELECT detail FROM event WHERE student_id = ? AND kind = ? ORDER BY id').all(id, kind).map((e) => e.detail);
const mc = (id) => DB.raw.prepare("SELECT detail FROM mailchimp_log WHERE student_id = ? AND action = 'tag'").all(id).map((x) => x.detail);
const make = async (first, email, consent = true) => (await jsonOf(await signup({ request: post('/api/signup', { first, last: 'Test', email, consent, tz: NY }), env })))[1].token;
const finish = (token, pains, want = 'team', want2 = '') => compassPost({ request: post('/api/compass', { token, stage: 'growing', answers: { v: 1 },
  results: { scores: [2, 3, 4, 5], answered: [2, 2, 2, 2] }, flags: { pains, want, want2, values: [] } }), env });
const write = (token, work) => statePost({ request: post('/api/state', { token, work }), env });
const K = { 'x-mentor-key': 'mk', 'content-type': 'application/json' };
const mentor = async (body) => jsonOf(await mPost({ request: new Request(`${B}/api/mentor`, { method: 'POST', headers: K, body: JSON.stringify(body) }), env }));
const roster = async () => (await (await mGet({ request: new Request(`${B}/api/mentor`, { headers: K }), env })).json()).students;

// SERIES_MODE off (the default): nothing enrolled, nothing sent.
ok(seriesMode({}) === 'off' && seriesMode({ SERIES_MODE: 'OFF' }) === 'off' && seriesMode({ SERIES_MODE: ' Test ' }) === 'test' && seriesMode({ SERIES_MODE: 'on' }) === 'on' && seriesMode({ SERIES_MODE: 'yes' }) === 'off', 'SERIES_MODE: empty or anything else is off');
const off = await make('Olga', 'olga@example.com');
await finish(off, ['alone']);
await write(off, { 'w.v4.1.0.t': '1', 'w.v4.2.0.t': '1', 'w.v4.3.0.t': '1' });
ok(DB.raw.prepare('SELECT COUNT(*) n FROM series_sub').get().n === 0, 'off: no trigger enrols anyone');
ok((await sendDue(env, DB, B, at('2026-11-02T13:07:00Z'))).sent === 0, 'off: the hourly run sends nothing');
ok(typeof (await enrol(env, DB, off, 'northstar', { grp: 'alone' })).status === 'string' && !subOf(off, 'northstar'), 'off: enrol itself refuses');

// SERIES_MODE on.
env = { ...base, SERIES_MODE: 'on' };
sent = fakeResend();
const ana = await make('Ana', 'ana@example.com');
let s = subOf(ana, 'never');
ok(s && s.grp === 'never' && s.test === 0 && s.tz === NY && !s.stopped_at, 'account made: the never-started letters');
ok(mc(ana).some((d) => d.includes('linktolead-letters-not-started')), 'on: the series tag goes to Mailchimp (logged here, MAILCHIMP_MODE test)');
const nob = await make('Nora', 'nora@example.com', false);
ok(!subOf(nob, 'never'), 'no yes to letters: no letters');

// Level 01 written: the never-started letters stop.
await write(ana, { 'w.v4.1.w.seen': '1' });
ok(!subOf(ana, 'never').stopped_at, 'opening the Level 01 welcome page is not writing');
await write(ana, { 'w.v4.1.0.t': '2' });
ok(subOf(ana, 'never').stopped_at && subOf(ana, 'never').stop_why === 'wrote in Level 01', 'a tap in Level 01: the never-started letters stop');

// North Star finished with a first pain.
const bo = await make('Bo', 'bo@example.com');
await compassPost({ request: post('/api/compass', { token: bo, stage: 'growing', answers: { v: 1 }, results: { scores: [2, 3, 0, 0], answered: [2, 2, 0, 0] }, flags: { pains: ['alone'] } }), env });
ok(!subOf(bo, 'northstar'), 'a North Star not finished: no letters yet');
await finish(bo, ['time', 'alone'], 'income', 'freedom');
s = subOf(bo, 'northstar');
ok(s && s.grp === 'time', 'finished: the first pain’s letters (No time for myself)');
ok(subOf(bo, 'never').stopped_at && subOf(bo, 'never').stop_why === 'next series: northstar', 'a later series stops an earlier one');
await finish(bo, ['clients'], 'steady');
ok(subOf(bo, 'northstar').grp === 'clients', 'the first pain changed before letter 1: the series follows it');
ok(mc(bo).some((d) => d.includes('linktolead-letters-northstar')), 'the North Star series tag');

// The hourly run: letter 1, day 1 at 8:00 New York.
DB.raw.prepare("UPDATE series_sub SET start_local = '2026-11-01' WHERE student_id = ?").run(bo);
sent = fakeResend();
let out = await sendDue(env, DB, B, at('2026-11-02T12:30:00Z'));
ok(out.sent === 0 && sent.length === 0, 'not before 8:00 their time');
out = await sendDue(env, DB, B, at('2026-11-02T13:07:00Z'));
const L1 = SERIES_LETTERS.find((l) => l.id === 'clients-1');
ok(out.sent === 1 && sent.length === 1 && sent[0].body.subject === L1.subject && sent[0].body.to[0] === 'bo@example.com', 'day 1, 8:07 their time: letter 1 of their pain');
const real = sent[0].body.text.replace('\n\n—\n', '\n—\n').replace(/u=[a-f0-9]+/, 'u=…').replace('ExploraSelf · ExploraSelf, Via Esempio 1, Rome', 'ExploraSelf · [postal address]');
ok(real === plainText(L1.text).replace('Hi Sam,', 'Hi Bo,'), 'the letter as sent is the approved letter, with their name; only the footer’s blank line, link and address are real');
ok(sent[0].body.text.includes('You told me you want steady clients.') && sent[0].body.headers['List-Unsubscribe'] && sent[0].body.reply_to === 'support@exploraself.com', 'their want, the unsubscribe header, replies to the mentor');
s = subOf(bo, 'northstar');
ok(s.step === 1 && s.sent === 1 && s.last_n === 1 && s.last_local === '2026-11-02', 'recorded: letter 1 on 2 Nov');
ok((await sendDue(env, DB, B, at('2026-11-02T15:07:00Z'))).sent === 0, 'one a day');
ok(events(bo, 'series-letter').join() === 'clients-1', 'logged as an event');

// One automatic letter a day, with 12 Days.
DB.raw.prepare(`INSERT INTO course_sub (student_id, course, started_at, tz, day_sent, last_local, last_sent_at) VALUES (?,?,?,?,?,?,?)`)
  .run(bo, COURSE, '2026-11-01T10:00:00Z', NY, 3, '2026-11-04', '2026-11-04T13:01:00Z');
sent = fakeResend();
out = await sendDue(env, DB, B, at('2026-11-04T13:07:00Z'));
ok(out.sent === 0 && sent.length === 0, 'a 12 Days letter went today: the series letter waits');
DB.raw.prepare('UPDATE course_sub SET last_local = ?, last_sent_at = ? WHERE student_id = ?').run('2026-11-03', '2026-11-03T13:07:00Z', bo);
out = await sendDue(env, DB, B, at('2026-11-04T13:07:00Z'));
ok(out.sent === 1 && sent[0].body.subject === SERIES_LETTERS.find((l) => l.id === 'clients-2').subject, 'otherwise letter 2 on day 3');
sent = fakeResend();
const c = await courseDue(env, DB, B, at('2026-11-04T14:07:00Z'));
ok(c.sent === 0 && sent.length === 0, 'a series letter went today: 12 Days waits for tomorrow');
ok((await courseDue(env, DB, B, at('2026-11-05T13:07:00Z'))).sent === 1, '…and goes the next morning');
ok(Object.keys(JOBS)[0] === 'series-letters' && Object.keys(JOBS)[1] === 'course-letters', 'the hourly run: the series first, then 12 Days');
DB.raw.prepare('DELETE FROM course_sub WHERE student_id = ?').run(bo);

// A question in Ask Alexandru pauses; /mentor resumes.
sent = fakeResend();
await notePost({ request: post('/api/note', { token: bo, body: 'Can we talk about prices?' }), env });
ok(DB.raw.prepare('SELECT series_hold FROM student_profile WHERE student_id = ?').get(bo).series_hold === 'question', 'a question pauses the letters');
sent = fakeResend();
out = await sendDue(env, DB, B, at('2026-11-07T13:07:00Z'));
ok(out.sent === 0 && sent.length === 0, 'paused: nothing goes');
let list = await roster();
let info = seriesInfo(list.find((x) => x.id === bo));
ok(info && info.held && info.line === 'Not enough clients · 2 of 4 sent · next: letter 3 of 4 · paused: a question in Ask Alexandru', `/mentor: which series, which letter, paused (${info && info.line})`);
let [st, j] = await mentor({ action: 'series-hold', student: bo, hold: false });
ok(st === 200 && j.ok && DB.raw.prepare('SELECT series_hold FROM student_profile WHERE student_id = ?').get(bo).series_hold === null, '/mentor: Resume letters');
out = await sendDue(env, DB, B, at('2026-11-08T13:07:00Z'));
ok(out.sent === 1 && sent.at(-1).body.subject === SERIES_LETTERS.find((l) => l.id === 'clients-3').subject && sent.at(-1).body.text.includes('Your step, by Wednesday:'), 'resumed: letter 3 goes a day late, its step day read from the day it goes (Sunday: by Wednesday)');
[st, j] = await mentor({ action: 'series-hold', student: bo, hold: true });
ok(DB.raw.prepare('SELECT series_hold FROM student_profile WHERE student_id = ?').get(bo).series_hold === 'mentor' && seriesInfo((await roster()).find((x) => x.id === bo)).line.endsWith('paused in /mentor'), '/mentor: Pause letters');
ok((await sendDue(env, DB, B, at('2026-11-11T13:07:00Z'))).sent === 0, 'paused by the mentor: letter 4’s day passes');
await mentor({ action: 'series-hold', student: bo, hold: false });
out = await sendDue(env, DB, B, at('2026-11-12T13:07:00Z'));
s = subOf(bo, 'northstar');
ok(out.sent === 0 && s.stopped_at && s.stop_why === 'done' && events(bo, 'series-skip').some((d) => d.startsWith('clients-4')), '"Ten days ago" a day late: skipped, and the series ends');
const mentorJs = readFileSync(new URL('../public/mentor/mentor.js', import.meta.url), 'utf8');
ok(/data-hold="\$\{id\}"/.test(mentorJs) && mentorJs.includes("'Resume letters' : 'Pause letters'") && mentorJs.includes("action: 'series-hold'"), '/mentor drawer: the Pause letters / Resume letters button');

// Account paused in /mentor: waits. Unsubscribed: stops.
const cy = await make('Cy', 'cy@example.com');
DB.raw.prepare("UPDATE series_sub SET start_local = '2026-11-01' WHERE student_id = ?").run(cy);
DB.raw.prepare('INSERT INTO account_auth (student_id, paused) VALUES (?, 1)').run(cy);
sent = fakeResend();
ok((await sendDue(env, DB, B, at('2026-11-03T13:07:00Z'))).sent === 0 && !subOf(cy, 'never').stopped_at, 'account paused: it waits');
DB.raw.prepare('UPDATE account_auth SET paused = 0 WHERE student_id = ?').run(cy);
DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(cy);
ok((await sendDue(env, DB, B, at('2026-11-06T13:07:00Z'))).sent === 0 && subOf(cy, 'never').stop_why === 'unsubscribed', 'unsubscribed: it stops');

// Never started: a tap that the batch hook missed still stops it at send time.
const di = await make('Di', 'di@example.com');
DB.raw.prepare("UPDATE series_sub SET start_local = '2026-11-01' WHERE student_id = ?").run(di);
DB.raw.prepare("INSERT INTO sheet (student_id, key, value, updated_at) VALUES (?, 'w.v4.1.0.t', '1', 'x')").run(di);
sent = fakeResend();
ok((await sendDue(env, DB, B, at('2026-11-03T13:07:00Z'))).sent === 0 && subOf(di, 'never').stop_why === 'wrote in Level 01', 'never started: Level 01 written, checked again before sending');

// Levels 01–03 written: the Level 03 letters, with their storm rule.
const ed = await make('Ed', 'ed@example.com');
await write(ed, { 'w.v4.1.0.t': '1', 'w.v4.2.0.t': '0' });
ok(!subOf(ed, 'level3'), 'levels 01 and 02 only: not yet');
await write(ed, { 'w.v4.3.2.feel': 'fear', 'w.v4.3.2.hours': '48 hours', 'w.v4.3.2.about': 'pricing' });
s = subOf(ed, 'level3');
ok(s && !s.stopped_at && subOf(ed, 'never').stopped_at, 'levels 01, 02 and 03 written: the Level 03 letters (and never-started stopped)');
ok(mc(ed).some((d) => d.includes('linktolead-letters-level3')), 'the Level 03 tag');
DB.raw.prepare("UPDATE series_sub SET start_local = '2026-11-19' WHERE student_id = ? AND series = 'level3'").run(ed);
sent = fakeResend();
await sendDue(env, DB, B, at('2026-11-20T13:07:00Z'));
ok(sent.length === 1 && sent[0].body.subject === 'Ed, you finished your first three levels' && sent[0].body.text.includes('“When I feel fear above 7 out of 10, I wait 48 hours before I decide about pricing.”') && sent[0].body.text.includes('Your step, by Monday:'), 'the morning after: their name in the subject, their storm rule, by Monday');
ok(sent[0].body.text.includes('You finished Level 03 of The Founder’s Blueprint in your free ExploraSelf account.'), 'the footer says why it came');
await finish(ed, ['cash']);
ok(subOf(ed, 'northstar') && subOf(ed, 'level3').stopped_at, 'the North Star finished after Level 03: the later series stops the earlier');

// SERIES_MODE test: enrolled and logged; nothing to founders, no Mailchimp.
env = { ...base, SERIES_MODE: 'test' };
const fi = await make('Fi', 'fi@example.com');
s = subOf(fi, 'never');
ok(s && s.test === 1 && mc(fi).length === 0 && events(fi, 'series-start')[0].includes('test: would tag linktolead-letters-not-started'), 'test: enrolled as a test row, the tag only logged');
DB.raw.prepare("UPDATE series_sub SET start_local = '2026-11-01' WHERE student_id = ?").run(fi);
sent = fakeResend();
out = await sendDue({ ...env, RESEND_API_KEY: '' }, DB, B, at('2026-11-03T13:07:00Z'));
ok(out.sent === 1 && sent.length === 0 && events(fi, 'series-test')[0] === 'never-1 · would send “' + SERIES_LETTERS.find((l) => l.id === 'never-1').subject + '” to fi@example.com', 'test: the letter that would go is logged, nothing is sent');
ok(subOf(fi, 'never').step === 1, 'test: the row moves on, so the next run logs the next letter');
env = { ...base, SERIES_MODE: 'on' };
sent = fakeResend();
await sendDue(env, DB, B, at('2026-11-06T13:07:00Z'));
ok(!sent.some((m) => m.body.to[0] === 'fi@example.com'), 'on again: a test row never sends real letters');

// The status and the settings.
ok(SERIES_STATUS === 'Sending when SERIES_MODE is on', 'the status the map shows comes from the code');
ok(Object.values(SERIES).every((x) => Object.values(SERIES_TAGS).includes(x.tag)), 'one Mailchimp tag per series');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
ok(/\| `SERIES_MODE` \| Text, optional \|/.test(readme) && /\| `TOOLKIT_CODE` \| Text, optional \|[^\n]*5689/.test(readme), 'README: SERIES_MODE and TOOLKIT_CODE in the settings table');
ok(STUDENT_TABLES.includes('series_sub'), 'a deleted account takes its letters with it');

done();
