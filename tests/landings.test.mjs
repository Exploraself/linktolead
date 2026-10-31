// Landing → Mailchimp tag → door → welcome (31 Oct 2026). /road2/ is a
// Blueprint page again; the North Star sales pages have their own keys
// (/north2/ → 'north2', /north3/ → 'north3'). Founders who signed up on those
// pages before, stored as 'road2' or 'road21', still count as North Star and
// keep the Mailchimp tag they already carry.

import { onRequestPost as signup } from '../functions/api/signup.js';
import { accountTables, NORTH_MOVE } from '../functions/_shared.js';
import { LANDINGS, OLD_LANDINGS, landingOf } from '../functions/_profile.js';
import { LANDING_TAGS, originOf, tagsFor, syncFounder } from '../functions/_mailchimp.js';
import { NORTH_STAR_LANDINGS } from '../functions/_letters.js';
import { LANDINGS as DASH_LANDINGS, LANDING_SHORT } from '../public/mentor/dash.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';
import fs from 'node:fs';

const { ok, done } = tally('landings');
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// ── The map, page by page ───────────────────────────────────────────────────
const MAP = {
  road1: ['linktolead-road1', 'blueprint', 'launchpad'],
  road2: ['linktolead-road2', 'blueprint', 'launchpad'],
  road3: ['linktolead-road3', 'blueprint', 'launchpad'],
  road4: ['linktolead-road4', 'blueprint', 'launchpad'],
  summit: ['linktolead-summit', 'blueprint', 'launchpad'],
  north2: ['linktolead-north2', 'northstar', 'northstar'],
  north3: ['linktolead-north3', 'northstar', 'northstar'],
  compass: ['linktolead-northstar', 'northstar', 'northstar'],
};
for (const [k, [tag, door, welcome]] of Object.entries(MAP)) {
  ok(LANDINGS.includes(k) && landingOf(k) === k, `${k}: a landing the sign-up keeps`);
  ok(LANDING_TAGS[k] === tag && tagsFor({ landing: k }).some((t) => t.name === tag && t.status === 'active'), `${k}: tag ${tag}`);
  ok(originOf({ landing: k }) === door, `${k}: ${door} door`);
  ok(NORTH_STAR_LANDINGS.includes(k) === (welcome === 'northstar'), `${k}: ${welcome} welcome`);
}
ok(originOf({ landing: 'north1' }) === 'northstar' && NORTH_STAR_LANDINGS.includes('north1'), 'north1: North Star door and welcome');
ok(Object.keys(LANDING_TAGS).every((k) => LANDING_TAGS[k] === (k === 'compass' ? 'linktolead-northstar' : 'linktolead-' + k)), "the rule: 'linktolead-' + the page address");
ok(landingOf('road21') === 'north2' && OLD_LANDINGS.road21 === 'north2' && !('road2' in OLD_LANDINGS), "an old /north2/ tab sending 'road21' is stored as north2; 'road2' is the new page");
ok(!('road21' in LANDING_TAGS), 'no tag is made for road21 any more');

// ── /mentor names ───────────────────────────────────────────────────────────
const dash = Object.fromEntries(DASH_LANDINGS);
ok(dash.road2 === 'Road 2 · /road2/' && dash.north2 === 'North 2 · /north2/' && dash.north3 === 'North 3 · /north3/' && !dash.road21, '/mentor: Road 2, North 2 and North 3 under their own names');
ok(LANDING_SHORT.road2 === 'Road 2' && LANDING_SHORT.north2 === 'North 2' && LANDING_SHORT.north3 === 'North 3', '/mentor: short names');
ok(read('functions/api/mentor.js').includes("road2: 'Road 2'") && read('functions/api/mentor.js').includes("north3: 'North 3'"), '/mentor CSV: the same names');

// ── The pages send their own keys ───────────────────────────────────────────
ok(read('public/road2/page.js').includes("variant: 'full', landing: 'road2'"), '/road2/: the FULL form, landing road2');
ok(read('public/north2/page.js').includes("landing: 'north2'") && read('public/north3/sales.js').includes("landing: 'north3'"), '/north2/ and /north3/: their own landings');
const AB = read('public/account-box.js');
ok(AB.includes("const NS_PAGES = ['north2', 'north3'];") && AB.includes("NS_PAGES.includes(ctx.landing) ? 'sales-page' : 'home'"), "account box: only the North Star pages send source 'sales-page'");

// ── The one-time move ───────────────────────────────────────────────────────
const env = { DB: fakeD1(), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us19' };
const raw = env.DB.raw;
// The live database before the deploy: the profile table as it was, and
// founders from the old /north3/ ('road2'), old /north2/ ('road21') and others.
raw.exec(`CREATE TABLE student_profile (student_id TEXT PRIMARY KEY, industry TEXT, consent INTEGER DEFAULT 0, consent_at TEXT,
  source TEXT, unsub_id TEXT UNIQUE, unsubscribed INTEGER DEFAULT 0, unsub_at TEXT, landing TEXT);`);
const before = '2026-10-30T10:00:00.000Z';
for (const [id, landing, source] of [['old-n3', 'road2', 'sales-page'], ['old-n3-home', 'road2', 'home'], ['old-n2', 'road21', 'sales-page'], ['old-r1', 'road1', 'home'], ['old-ns', 'compass', 'compass']]) {
  raw.prepare("INSERT INTO student (id, email, name, joined_at) VALUES (?, ?, 'Old Founder', ?)").run(id, id + '@example.com', before);
  raw.prepare('INSERT INTO student_profile (student_id, consent, source, landing) VALUES (?, 1, ?, ?)').run(id, source, landing);
}
await accountTables(env.DB);
const P = (id) => raw.prepare('SELECT landing, landing_tag FROM student_profile WHERE student_id = ?').get(id);
const marker = raw.prepare('SELECT at FROM migration WHERE name = ?').get(NORTH_MOVE);
ok(marker && marker.at > before, 'the move is marked once, with the moment it ran');
ok(P('old-n3').landing === 'north3' && P('old-n3').landing_tag === 'linktolead-road2', "old /north3/ founder: 'road2' → north3, keeps tag linktolead-road2");
ok(P('old-n3-home').landing === 'north3' && P('old-n3-home').landing_tag === 'linktolead-road2', "every 'road2' from before the move is North Star, whatever its source");
ok(P('old-n2').landing === 'north2' && P('old-n2').landing_tag === 'linktolead-road2.1', "old /north2/ founder: 'road21' → north2, keeps tag linktolead-road2.1");
ok(P('old-r1').landing === 'road1' && !P('old-r1').landing_tag && P('old-ns').landing === 'compass' && !P('old-ns').landing_tag, 'everyone else is untouched');
ok(originOf(P('old-n3')) === 'northstar' && originOf(P('old-n2')) === 'northstar', 'they still count as North Star');
const tagsOf = (id) => tagsFor({ landing: P(id).landing, landingTag: P(id).landing_tag }).map((t) => t.name).filter((n) => /^linktolead-(road|north)/.test(n));
ok(JSON.stringify(tagsOf('old-n3')) === '["linktolead-road2"]' && JSON.stringify(tagsOf('old-n2')) === '["linktolead-road2.1"]', 'their Mailchimp tag does not change: no linktolead-north3 / -north2 added');
await syncFounder(env, env.DB, 'old-n3', 'join');
const mc = (id) => raw.prepare('SELECT detail FROM mailchimp_log WHERE student_id = ? ORDER BY id').all(id).map((r) => r.detail).join(' ');
ok(/"linktolead-road2"/.test(mc('old-n3')) && !/linktolead-north3/.test(mc('old-n3')), 'a re-sync sends the tag they carry, never the new one');

// After the move: a sign-up on the new /road2/ is Blueprint, and stays so.
const sent = fakeResend();
const join = async (email, landing, source) => (await (await signup({ request: post('/api/signup', { first: 'New', last: 'Founder', email, consent: true, source, type: 'full',
  landing, company: 'Acme', interest: 'Higher income', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password' }), env })).json()).token;
const r2 = await join('door@example.com', 'road2', 'home');
ok(P(r2).landing === 'road2' && !P(r2).landing_tag, 'a new /road2/ sign-up is stored as road2');
ok(/"linktolead-road2"/.test(mc(r2)) && originOf(P(r2)) === 'blueprint', 'tagged linktolead-road2, Blueprint door');
const n3 = await join('star@example.com', 'north3', 'sales-page');
ok(P(n3).landing === 'north3' && /"linktolead-north3"/.test(mc(n3)) && originOf(P(n3)) === 'northstar', 'a new /north3/ sign-up: north3, linktolead-north3, North Star');
const n2 = await join('star2@example.com', 'road21', 'sales-page');
ok(P(n2).landing === 'north2' && /"linktolead-north2"/.test(mc(n2)), "an old /north2/ tab sending 'road21': north2, linktolead-north2");
const subj = (to) => (sent.find((m) => m.body.to === to || (Array.isArray(m.body.to) && m.body.to.includes(to))) || { body: {} }).body.subject;
ok(subj('door@example.com') === 'Welcome to The Founder Launchpad', '/road2/: the Founder Launchpad welcome');
ok(subj('star@example.com') === 'Your Leader’s North Star is open' && subj('star2@example.com') === 'Your Leader’s North Star is open', "/north2/ and /north3/: “Your Leader's North Star is open”");

// The database opens again (a new isolate): the move does not run twice, a
// new /road2/ founder is never moved, and an old /north3/ tab that still sent
// 'road2' with source 'sales-page' after the deploy is moved to north3.
const stale = await join('stale@example.com', 'road2', 'sales-page');
const again = { raw, prepare: env.DB.prepare, batch: env.DB.batch };
await accountTables(again);
ok(raw.prepare('SELECT COUNT(*) AS n FROM migration WHERE name = ?').get(NORTH_MOVE).n === 1 && raw.prepare('SELECT at FROM migration WHERE name = ?').get(NORTH_MOVE).at === marker.at, 'the marker is written once and keeps its moment');
ok(P(r2).landing === 'road2' && !P(r2).landing_tag, 'the new /road2/ founder is never moved');
ok(P(stale).landing === 'north3' && P(stale).landing_tag === 'linktolead-road2', "an old /north3/ tab after the deploy: moved to north3, keeps the tag it was given");
ok(P('old-n3').landing === 'north3' && P('old-n3').landing_tag === 'linktolead-road2', 'a founder already moved stays as they are');
done();
