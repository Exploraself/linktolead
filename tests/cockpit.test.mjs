// The Mentor cockpit (31 Oct 2026): the roster's new fields (levels, the
// doors crossed, the photo), the three groups, the funnel from sign-up to
// paid, "Needs you today", each founder's next action, the Founders filters,
// sign-ups per landing split by group, and that every action the old table
// had is still on the page.

import { onRequestGet as mGet, groupName } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as compassPost } from '../functions/api/compass.js';
import { onRequestPost as avatar } from '../functions/api/avatar.js';
import { onRequestPost as notePost } from '../functions/api/note.js';
import { summary, filter, groupOf, funnel, nextAction, today, byLanding, levelSet, levelCount, launchpadDone, readyForBoardroom, crossedOf } from '../public/mentor/dash.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';
import fs from 'node:fs';

const { ok, done } = tally('cockpit');
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123', MAILCHIMP_MODE: 'test' };
fakeResend();
const K = { 'x-mentor-key': 'mentor-key-123' };
const roster = async () => (await (await mGet({ request: new Request('https://x/api/mentor', { headers: K }), env })).json());
const join = async (first, email, landing) => (await (await signup({ request: post('/api/signup', { first, email, consent: true, type: 'simple', landing }), env })).json()).token;
const write = (id, level, body = 'An answer', domain = 'self', step = 0) => DB.raw.prepare('INSERT INTO answer VALUES (?,?,?,?,?,?,?)').run(id, 'grow', level, domain, step, body, 'now');
const cross = (id, to) => DB.raw.prepare("INSERT INTO event (student_id,kind,at,detail) VALUES (?,'crossed','now',?)").run(id, to);

// ── The roster's new fields ──────────────────────────────────────────────────
const nina = await join('Nina', 'nina@example.com', 'road2');   // North Star only
const bob = await join('Bob', 'bob@example.com', 'road1');      // Blueprint only, levels 1–3
const bea = await join('Bea', 'bea@example.com', 'road2');      // both, crossed to the Blueprint
const ned = await join('Ned', 'ned@example.com', 'road3');      // neither yet
const ns = (token) => compassPost({ request: post('/api/compass', { token, stage: 'growing', answers: { v: 2 }, results: { scores: [1, 2, 3, 4], answered: [2, 2, 2, 2] }, flags: {} }), env });
await ns(nina); await ns(bea);
write(bob, 1); write(bob, 1, 'Another', 'people'); write(bob, 2); write(bob, 3); write(bob, 5, '');   // level 5 empty: not counted
write(bea, 2); write(bea, 7);
cross(bea, 'blueprint'); cross(bea, 'blueprint'); cross(bob, 'northstar');
const pic = 'data:image/jpeg;base64,' + 'A'.repeat(400);
await avatar({ request: post('/api/avatar', { token: bea, image: pic }), env });

let L = await roster();
const R = Object.fromEntries(L.students.map((s) => [s.email.split('@')[0], s]));
ok(R.bob.levels === 3 && R.bea.levels === 2 && R.nina.levels === 0 && R.ned.levels === 0, 'levels: distinct Blueprint levels with a written answer (an empty answer does not count)');
ok([...levelSet(R.bob)].sort().join() === '1,2,3' && [...levelSet(R.bea)].sort((a, b) => a - b).join() === '2,7' && levelSet(R.ned).size === 0, 'level_list: which levels');
ok(R.bea.crossed === 'blueprint' && R.bob.crossed === 'northstar' && R.nina.crossed === null, 'crossed: each door once, from the crossed events');
ok(crossedOf(R.bea).join() === 'blueprint' && crossedOf(R.ned).length === 0, 'crossedOf reads them');
ok(R.bea.avatar === pic && R.bob.avatar === null, 'avatar: the profile photo, or null');

// ── The groups ───────────────────────────────────────────────────────────────
ok(groupOf(R.nina) === 'ns' && groupOf(R.bob) === 'bp' && groupOf(R.bea) === 'both' && groupOf(R.ned) === '', 'groupOf: North Star only, Blueprint only, both, neither');
ok(groupOf({ written: 0, levels: 2 }) === 'bp' && groupOf({ compass_at: 'x', written: 1 }) === 'both' && groupOf({}) === '', 'groupOf: levels alone also count as started');
const S0 = summary(L.students, L.waiting);
ok(S0.groups.ns === 1 && S0.groups.bp === 1 && S0.groups.both === 1 && S0.groups.none === 1 && S0.crossed.blueprint === 1 && S0.crossed.northstar === 1, 'summary: the group cards and the crossings');
ok(L.students.every((s) => groupName(s) === ({ ns: 'North Star only', bp: 'Blueprint only', both: 'Both', '': '' })[groupOf(s)]), 'the CSV group and the cockpit group are the same rule');
const csv = await (await mGet({ request: new Request('https://x/api/mentor?csv=1', { headers: K }), env })).text();
const csvLine = (e) => csv.split('\r\n').find((l) => l.includes(`"${e}"`));
ok(csv.split('\r\n')[0].endsWith('"Group","Blueprint levels","Crossed"') && csvLine('bea@example.com').endsWith('"Both","2","North Star → Blueprint"') && csvLine('ned@example.com').endsWith('"","0",""'), 'CSV: group, levels and crossings');
ok(launchpadDone(R.bob) && !launchpadDone(R.bea) && readyForBoardroom(R.bob), 'Launchpad done: wrote in levels 01, 02 and 03');
ok(!launchpadDone({ level_list: '1,2,5' }) && launchpadDone({ levels: 3 }) && levelCount({ levels: 40 }) === 12, 'Launchpad needs 01–03 themselves; without the list, the count');

// ── The funnel ───────────────────────────────────────────────────────────────
const now = Date.parse('2026-10-31T12:00:00Z'), DAY = 86400000, iso = (d) => new Date(now - d * DAY).toISOString();
const F = [
  { id: 'a', name: 'Ana', email: 'a@x.co', tier: 'free', joined_at: iso(1), last_seen_at: iso(0.2), compass_at: iso(1), written: 0, levels: 0, landing: 'road2' },
  { id: 'b', name: 'Bo', email: 'b@x.co', tier: 'free', joined_at: iso(9), last_seen_at: iso(1), written: 6, levels: 3, level_list: '1,2,3', landing: 'road1', open_notes: 1, has_password: 1 },
  { id: 'c', name: 'Cy', email: 'c@x.co', tier: 'session', joined_at: iso(20), last_seen_at: iso(2), compass_at: iso(19), written: 12, levels: 5, level_list: '1,2,3,4,5', landing: 'road1', has_password: 1 },
  { id: 'd', name: 'Di', email: 'd@x.co', tier: 'lab', joined_at: iso(40), last_seen_at: iso(3), compass_at: iso(39), written: 30, levels: 8, level_list: '1,2,3,4,5,6,7,8', landing: 'compass', company: 'Di Design' },
  { id: 'e', name: 'Ed', email: 'e@x.co', tier: 'free', joined_at: iso(30), last_seen_at: iso(20), compass_at: iso(29), written: 0, levels: 0, landing: 'road2' },
  { id: 'f', name: 'Fi', email: 'f@x.co', tier: 'free', joined_at: iso(2), last_seen_at: iso(2), written: 0, levels: 0 },
  { id: 'g', name: 'Gus', email: 'g@x.co', tier: 'free', joined_at: iso(25), last_seen_at: iso(16), written: 2, levels: 1, level_list: '1', landing: 'road3', paused: 1 },
];
const W = [{ id: 'n1', student_id: 'b', name: 'Bo', email: 'b@x.co', body: 'Where do I start?', created_at: iso(0.5) }, { id: 'n2', student_id: 'b', name: 'Bo', email: 'b@x.co', body: 'And then?', created_at: iso(0.1) }];
const Fn = funnel(F);
ok(Fn.rows.map((r) => r.n).join() === '7,4,4,3,2,1', 'funnel: signed up 7, North Star 4, Blueprint 4, Launchpad 3, Boardroom 2, paid 1');
ok(Fn.worst === 1 && Fn.drop === 3 && Fn.from === 'Signed up' && Fn.to === 'North Star done', 'funnel: the biggest drop is marked');
ok(funnel([]).rows.every((r) => r.n === 0) && funnel([]).worst === -1, 'funnel: no founders, every row 0 and no drop');
ok(funnel([{ written: 1 }, { written: 1 }]).rows[2].n === 2 && funnel([{ written: 1 }, { written: 1 }]).worst === 1, 'funnel: a later row higher than the one above is not a drop');

// ── Next action and "Needs you today" ────────────────────────────────────────
const by = Object.fromEntries(F.map((s) => [s.id, s]));
ok(nextAction(by.b, now).key === 'question' && nextAction(by.b, now).does === 'open', 'next: a question waiting comes first, and opens their work');
ok(nextAction(by.e, now).key === 'quiet' && nextAction(by.e, now).label === 'Check in: quiet 20 days', 'next: quiet 14+ days, with the days');
ok(nextAction(by.a, now).key === 'ns' && nextAction(by.a, now).label === 'Invite to the Launchpad', 'next: North Star only → invite to the Launchpad');
ok(nextAction({ ...by.b, open_notes: 0 }, now).key === 'bp' && nextAction({ ...by.b, open_notes: 0, compass_at: iso(1) }, now).key === 'ready', 'next: Blueprint only → the North Star; both with 01–03 on the free step → offer the Boardroom');
ok(nextAction(by.c, now).key === 'ok' && nextAction(by.f, now).key === 'none' && nextAction(by.g, now).key === 'paused', 'next: on track, not started, paused');
const T = today(F, W, now);
ok(T.map((x) => `${x.kind}:${x.id}`).join() === 'question:b,quiet:e,new:a,new:f', 'needs you today: questions, quiet, ready, new; each founder once, paused left out');
ok(T[0].count === 2 && T[0].text === 'And then?' && T[0].button === 'Read and answer', 'needs you today: two questions from one founder are one line, with the latest');
ok(today([{ ...by.b, open_notes: 0, compass_at: iso(1) }], [], now)[0].kind === 'ready' && today([], [], now).length === 0, 'needs you today: ready for the Boardroom; nothing waiting is an empty list');

// ── The Founders filters ─────────────────────────────────────────────────────
const ids = (o) => filter(F, o, now).map((s) => s.id).join();
ok(ids({ group: 'ns' }) === 'a,e' && ids({ group: 'bp' }) === 'b,g' && ids({ group: 'both' }) === 'c,d' && ids({}) === 'a,b,c,d,e,f,g', 'group chips; "All" keeps the founders in no group');
ok(ids({ step: 'session' }) === 'c' && ids({ step: 'free', group: 'bp' }) === 'b,g', 'step chips, with a group');
ok(ids({ act: 'new' }) === 'a,f' && ids({ act: 'quiet' }) === 'e,g' && ids({ act: 'active' }) === 'a,b,c,d,f', 'activity chips');
ok(ids({ need: 'q' }) === 'b' && ids({ need: 'ready' }) === 'b' && ids({ need: 'nopw' }) === 'a,d,e,f,g', 'needs chips');
ok(ids({ q: 'di design' }) === 'd' && ids({ q: 'E@X', group: 'ns' }) === 'e', 'search: name, email or business, with the chips');

// ── Where they came from ─────────────────────────────────────────────────────
const BL = Object.fromEntries(byLanding(F, now).map((x) => [x.k, x]));
ok(BL.road1.total === 2 && BL.road1.bp === 1 && BL.road1.both === 1 && BL.road2.total === 2 && BL.road2.ns === 2 && BL.compass.both === 1 && BL.road3.bp === 1, 'per landing: sign-ups split by group');
ok(BL[''].total === 1 && BL[''].none === 1 && BL.road4.total === 0 && BL.summit.total === 0, 'per landing: none recorded in its own row; an empty landing is 0');

// ── The page keeps every action ──────────────────────────────────────────────
const js = fs.readFileSync('public/mentor/mentor.js', 'utf8'), html = fs.readFileSync('public/mentor/index.html', 'utf8');
for (const a of ['data-open=', 'data-msg=', 'data-link=', 'data-reset=', 'data-pause=', 'data-del=', 'data-step=', 'data-mentorof=', 'data-vhide=', 'data-medit=', "id=\"mform\"", 'id="mc-test"', 'id="mc-backfill"'])
  ok(js.includes(a), `the cockpit keeps ${a.replace(/[=:]$/, '')}`);
for (const f of ['function one(id)', 'function messageBox(', 'function deleteBox(', 'async function csv()', 'function gate(', 'function loadComments(', 'function compassPanel(C)'])
  ok(js.includes(f), `the cockpit keeps ${f}`);
ok(html.includes('<h1>Mentor cockpit</h1>') && /id="csv">Export CSV</.test(html) && /id="refresh">Refresh</.test(html) && html.includes('aria-label="Search founders"'), 'header: name, search, Export CSV, Refresh');
ok(["'Today'", "'Founders'", "'Questions'", "'Mailchimp'", "'Mentors & comments'"].every((t) => js.includes(t)), 'the five tabs');
ok(html.includes('prefers-reduced-motion') && html.includes('.drawer{position:fixed'), 'the drawer, still under reduced motion');
ok(!/\b(Math\.random|sample|example\.com)\b/.test(js), 'no invented founders or numbers in the page');

// The real thing end to end: the roster with a question waiting.
await notePost({ request: post('/api/note', { token: nina, body: 'Is the Blueprint for me?' }), env });
L = await roster();
const T2 = today(L.students, L.waiting);
ok(T2[0].kind === 'question' && T2[0].s.email === 'nina@example.com' && nextAction(L.students.find((s) => s.email === 'nina@example.com')).key === 'question', 'a real question comes first in "Needs you today"');
done();
