// Good People Win (Alexandru, 5 Nov 2026): ten letters for everyone who leaves
// their name and email, on linktolead or exploraself.com. Letter 1 at once,
// then one every 48 hours (never at night their time); short, in five
// numbered sections, bold key lines, one diagram, a small cover; opens seen
// in /mentor. Real routes on Node's own SQLite; Resend is faked.

import { existsSync, readFileSync } from 'node:fs';
import { GPW_LETTERS, GPW_NAME } from '../functions/_gpw-letters.js';
import { gpwLetter, gpwJoin, due, sendDue, GPW_TAG, LAST, GAP_HOURS } from '../functions/_gpw.js';
import { heading, diagram, marked, letter } from '../functions/_letters.js';
import { onRequestPost as joinPost, onRequestGet as pixelGet, onRequestOptions as joinOptions } from '../functions/api/good-people.js';
import { onRequestGet as unsubGet } from '../functions/api/unsubscribe.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as mentorGet, onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as googlePost } from '../functions/api/google.js';
import { guestAccount } from '../functions/_stripe.js';
import { md5 } from '../functions/_mailchimp.js';
import { NOW_MAX, PER_RUN } from '../functions/_gpw.js';
import { ROUTES, JOBS } from '../worker.js';
import { TAG_LIST } from '../functions/_tag-list.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('good-people-win');
const planCountsTotal = (c, without = true) => c.accountsYes + (without ? c.accountsWithout : 0) + c.mailchimp;
const B = 'https://linktolead.exploraself.com';
const NY = 'America/New_York';
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

// ── The words ──────────────────────────────────────────────────────────────
ok(GPW_NAME === 'Good People Win' && GPW_LETTERS.length === 10 && LAST === 10, 'ten letters, named Good People Win');
ok(GPW_LETTERS.every((L, i) => L.n === i + 1), 'numbered 1 to 10');
const all = GPW_LETTERS.map((L) => JSON.stringify(L)).join(' ');
ok(!/compass|incubator|constellation|horoscope|zodiac|most founders|Kojokar/i.test(all), 'none of the words Alexandru keeps out');
ok(!/free[^.]{0,40}\$9\.99|\$9\.99[^.]{0,40}free/i.test(all), 'the $9.99 is never called free');
ok(/kitchens and wardrobes/.test(all) && /my reputation/.test(all) && /bread and hot dogs/.test(all) && /IFBB/.test(all) && /restaurants/.test(all), 'Alexandru’s own stories are there');
for (const q of ['Keeping it moving can occupy a life.', 'Build something you are willing to stand behind.', 'A customer may want a reliable appointment rather than participation in your grand vision.', 'Every company eventually reflects the judgement habits of the people running it.']) {
  ok(all.includes(`“${q}”`), `a word-for-word quote: ${q.slice(0, 30)}…`);
}
ok(GPW_LETTERS.every((L) => L.invite.url && L.invite.button && L.reply && L.ps.text && L.step.do && L.step.done), 'each letter: an invitation, a reply question, a P.S., a step with “done when”');
ok(new Set(GPW_LETTERS.map((L) => L.invite.url)).size === 10, 'ten different invitations');

// ── Each letter, rendered ──────────────────────────────────────────────────
for (const L of GPW_LETTERS) {
  const n = L.n, nn = String(n).padStart(2, '0');
  const r = gpwLetter(B, n, { first: 'sam', tz: NY, pixel: `${B}/api/good-people?o=abc123abc123` });
  ok(r.subject === `${L.title} · Good People Win ${n}/10`, `${n}: subject "${r.subject}"`);
  ok(r.html.includes(`src="${B}/mail/gpw/${nn}.jpg"`) && existsSync(new URL(`../public/mail/gpw/${nn}.jpg`, import.meta.url)), `${n}: its cover, and the file is there`);
  ok(r.html.indexOf(`/mail/gpw/${nn}.jpg`) < r.html.indexOf('Hi Sam,'), `${n}: the cover is on top`);
  for (const h of ['1 · Where it hurts', `2 · ${L.story.head}`, '3 · Today’s tool', '4 · Your 10 minutes', '5 · The hard truth']) ok(r.text.includes(h.toUpperCase()), `${n}: section "${h}"`);
  ok((r.html.match(/background:#B4975F/g) || []).length === 1, `${n}: one gold button`);
  ok(/<b>/.test(r.html) && !/\*\*/.test(r.html + r.text), `${n}: bold in the html, no stars left anywhere`);
  ok(r.html.includes('#F7F0E1') && r.text.includes(L.tool.title.toUpperCase()), `${n}: the diagram, in both parts`);
  ok(/Done when: /.test(r.text) && /Reply and tell me: /.test(r.text) && /P\.S\. /.test(r.text), `${n}: done when, the reply question, the P.S.`);
  ok(r.html.includes(`${B}/api/good-people?o=abc123abc123`) && /width="1" height="1"/.test(r.html), `${n}: the open pixel`);
  ok(r.fromName === 'Alexandru at ExploraSelf', `${n}: from Alexandru`);
  ok(r.text.startsWith('Hi Sam,'), `${n}: the first name, as people write it`);
}
ok(gpwLetter(B, 1, {}).text.includes('Alexandru from ExploraSelf here.') && !gpwLetter(B, 2, {}).text.includes('Alexandru from ExploraSelf here.'), 'the personal first line only in letter 1');
ok(gpwLetter(B, 11) === null && gpwLetter(B, 0) === null, 'no letter 0 or 11');

// The building blocks, for any letter.
const blocks = letter(B, ['Hi,', heading('1 · A part'), marked('One **bold** word.'), diagram({ kind: 'grid', title: 'Four', rows: [['A', 'One', 'x'], ['B', 'Two', 'y'], ['C', 'Three', 'z'], ['D', 'Four', 'w']] })], null, { sign: false });
ok(blocks.html.includes('<b>bold</b>') && blocks.text.includes('One bold word.') && blocks.text.includes('1 · A PART') && blocks.text.includes('2. Two: y'), 'heading, bold and a diagram, in html and text');
ok(!letter(B, ['Hi'], null, { sign: false }).html.includes('<img'), 'no cover and no pixel unless asked');
ok(letter(B, ['A <b>x</b> **y**'], null, { sign: false }).html.includes('&lt;b&gt;'), 'a plain paragraph is still escaped');

// ── When ───────────────────────────────────────────────────────────────────
const H = 3600_000;
const t0 = new Date('2026-11-06T14:00:00Z'); // 9:00 in New York
ok(due({ sent: 0 }, t0) === 1, 'letter 1 is owed at once');
ok(due({ sent: 1, last_sent_at: t0.getTime(), tz: NY }, new Date(t0.getTime() + 24 * H)) === 0, 'not after one day');
ok(due({ sent: 1, last_sent_at: t0.getTime(), tz: NY }, new Date(t0.getTime() + 47.2 * H)) === 2, 'letter 2 about 48 hours later (the hourly run may be early by up to an hour)');
ok(due({ sent: 1, last_sent_at: t0.getTime(), tz: NY }, new Date(t0.getTime() + 46 * H)) === 0, 'not two hours early');
const night = new Date('2026-11-06T05:00:00Z'); // midnight in New York
ok(due({ sent: 3, last_sent_at: night.getTime() - 48 * H, tz: NY }, night) === 0, 'never at night their time');
ok(due({ sent: 3, last_sent_at: night.getTime() - 48 * H, tz: NY }, new Date(night.getTime() + 8 * H)) === 4, 'it waits for the morning');
ok(due({ sent: 10, last_sent_at: 1 }, t0) === 0 && due({ sent: 2, stopped_at: 'x', last_sent_at: 1 }, t0) === 0, 'nothing after letter 10, nothing once stopped');
ok(GAP_HOURS === 48, 'every 48 hours');

// ── From exploraself.com ───────────────────────────────────────────────────
let DB = fakeD1();
let sent = fakeResend();
let env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mk' };
const fromES = (body, ip = '5.6.7.8', origin = 'https://exploraself.com') => new Request(`${B}/api/good-people`, { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip, origin }, body: JSON.stringify(body) });
const jsonOf = async (r) => [r.status, await r.json(), r.headers];

let [st, j, h] = await jsonOf(await joinPost({ request: fromES({ first: 'Lia', email: 'Lia@Example.com', source: 'exploraself-rise', consent: true, tz: NY }), env }));
ok(st === 200 && j.status === 'ok', 'a name + email from exploraself.com joins');
ok(h.get('access-control-allow-origin') === 'https://exploraself.com', 'exploraself.com may post from the browser');
let row = DB.raw.prepare('SELECT * FROM gpw_sub WHERE email = ?').get('lia@example.com');
ok(row && row.first === 'Lia' && row.source === 'exploraself-rise' && row.sent === 1 && !row.student_id, 'one row, the address in small letters, letter 1 sent, no account needed');
ok(sent.length === 1 && sent[0].body.subject === 'Why we exist · Good People Win 1/10' && sent[0].body.to[0] === 'lia@example.com', 'letter 1 went at once');
ok(/You get these letters because you left your name and email at exploraself\.com/.test(sent[0].body.text), 'the footer says why: exploraself.com');
ok(sent[0].body.headers['List-Unsubscribe'].includes(`/api/unsubscribe?g=${row.unsub_id}`), 'its own unsubscribe link');
const mailRow = DB.raw.prepare('SELECT * FROM gpw_mail WHERE email = ?').get('lia@example.com');
ok(mailRow && mailRow.n === 1 && !mailRow.opened_at && sent[0].body.html.includes(`/api/good-people?o=${mailRow.id}`), 'the letter is recorded, with its own open pixel');

[st, j] = await jsonOf(await joinPost({ request: fromES({ first: 'Lia', email: 'lia@example.com', source: 'exploraself-eq', consent: true }), env }));
ok(j.status === 'already' && sent.length === 1, 'the same address again: not started twice');
[st, j] = await jsonOf(await joinPost({ request: fromES({ first: 'Bo', email: 'bo@example.com', consent: false }), env }));
ok(st === 400 && !DB.raw.prepare('SELECT 1 FROM gpw_sub WHERE email = ?').get('bo@example.com'), 'no yes to letters: nothing');
[st, j] = await jsonOf(await joinPost({ request: fromES({ first: 'Bo', email: 'not-an-email', consent: true }), env }));
ok(st === 400, 'a broken address: nothing');
[st, j] = await jsonOf(await joinPost({ request: fromES({ first: 'Bo', email: 'bo@example.com', source: 'Evil <b>', consent: true }), env }));
ok(DB.raw.prepare('SELECT source FROM gpw_sub WHERE email = ?').get('bo@example.com').source === 'exploraself', 'an odd source is kept as plain "exploraself"');
[, , h] = await jsonOf(await joinPost({ request: fromES({ first: 'Cy', email: 'cy@example.com', consent: true }, '9.9.9.9', 'https://evil.example'), env }));
ok(!h.get('access-control-allow-origin'), 'another site gets no permission from the browser');
const pre = await joinOptions({ request: new Request(`${B}/api/good-people`, { method: 'OPTIONS', headers: { origin: 'https://www.exploraself.com' } }) });
ok(pre.status === 204 && pre.headers.get('access-control-allow-methods').includes('POST'), 'the browser’s check before posting');
// The mail limits: ten an hour from one connection, then nothing more joins.
for (let i = 0; i < 12; i++) await joinPost({ request: fromES({ first: 'X', email: `x${i}@example.com`, consent: true }, '7.7.7.7'), env });
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM gpw_sub WHERE email LIKE 'x%@example.com'").get().n === 10, 'ten joins an hour from one connection, then it stops');

// ── The open pixel ─────────────────────────────────────────────────────────
let px = await pixelGet({ request: get(`/api/good-people?o=${mailRow.id}`), env });
ok(px.headers.get('content-type') === 'image/gif' && /no-store/.test(px.headers.get('cache-control')), 'the pixel is a picture, never cached');
await pixelGet({ request: get(`/api/good-people?o=${mailRow.id}`), env });
const opened = DB.raw.prepare('SELECT * FROM gpw_mail WHERE id = ?').get(mailRow.id);
ok(opened.opened_at && opened.opens === 2, 'opening marks it opened, and counts each time');
px = await pixelGet({ request: get('/api/good-people?o=nope'), env });
ok(px.headers.get('content-type') === 'image/gif', 'an unknown id still gets the picture, and changes nothing');

// ── Unsubscribe from these letters only ────────────────────────────────────
const bo = DB.raw.prepare('SELECT * FROM gpw_sub WHERE email = ?').get('bo@example.com');
const page = await (await unsubGet({ request: get(`/api/unsubscribe?g=${bo.unsub_id}`), env })).text();
ok(/No more Good People Win letters/.test(page), 'the unsubscribe page says what stopped');
ok(DB.raw.prepare('SELECT stop_why FROM gpw_sub WHERE email = ?').get('bo@example.com').stop_why === 'unsubscribed', 'Bo is out of the letters');


// ── Every 48 hours, through the hourly run ─────────────────────────────────
const start = DB.raw.prepare('SELECT last_sent_at FROM gpw_sub WHERE email = ?').get('lia@example.com').last_sent_at;
DB.raw.prepare("UPDATE gpw_sub SET tz = ? WHERE email = 'lia@example.com'").run(NY);
sent.length = 0;
let r = await sendDue(env, DB, B, new Date(start + 24 * H));
ok(!sent.some((m) => m.body.to[0] === 'lia@example.com'), 'a day later: nothing for Lia');
// Find a daytime hour in New York about 48 hours on.
let at = new Date(start + 48 * H);
while (Number(new Intl.DateTimeFormat('en-US', { timeZone: NY, hour: 'numeric', hourCycle: 'h23' }).format(at)) < 9) at = new Date(at.getTime() + H);
r = await sendDue(env, DB, B, at);
ok(sent.some((m) => m.body.to[0] === 'lia@example.com' && m.body.subject === 'Busy is not winning · Good People Win 2/10'), 'two days later: letter 2');
for (let n = 3; n <= 10; n++) { at = new Date(at.getTime() + 48 * H); await sendDue(env, DB, B, at); }
row = DB.raw.prepare('SELECT * FROM gpw_sub WHERE email = ?').get('lia@example.com');
ok(row.sent === 10 && row.stopped_at && row.stop_why === 'all ten sent', 'all ten, then it stops');
ok(DB.raw.prepare('SELECT sent FROM gpw_sub WHERE email = ?').get('bo@example.com').sent === 1, 'Bo, unsubscribed after letter 1, got nothing more');
const before = sent.length;
await sendDue(env, DB, B, new Date(at.getTime() + 48 * H));
ok(!sent.slice(before).some((m) => m.body.to[0] === 'lia@example.com'), 'nothing after letter 10');

// ── /mentor ────────────────────────────────────────────────────────────────
const mreq = (path, key) => new Request(B + path, { headers: key ? { 'x-mentor-key': key } : {} });
let res = await mentorGet({ request: mreq('/api/mentor?gpw=1'), env });
ok(res.status === 401, '/mentor: nobody without the key or a team account');
[st, j] = await jsonOf(await mentorGet({ request: mreq('/api/mentor?gpw=1', 'mk'), env }));
const lia = j.people.find((p) => p.email === 'lia@example.com');
ok(st === 200 && j.letters.length === 10 && j.letters[0].sent >= 1 && j.letters[0].opened === 1, '/mentor: each letter, sent and opened');
ok(lia && lia.sent === 10 && lia.opened.join() === '1' && lia.source === 'exploraself-rise', '/mentor: who, from where, which letters they opened');
const mjs = read('public/mentor/mentor.js');
ok(mjs.includes("['letters', 'Good People Win']") && mjs.includes("api('?gpw=1')") && /Opens are a sign, not a count/.test(mjs), '/mentor has a Good People Win tab, and says what an open means');

// ── From a new account on linktolead ───────────────────────────────────────
DB = fakeD1(); sent = fakeResend();
env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
const maria = { first: 'Maria', last: 'Rossi', email: 'maria@example.com', consent: true, source: 'home', type: 'full', company: 'Rossi Studio', interest: 'Steady clients',
  industry: 'Creative & design', password: 'longenough1', confirm: 'longenough1', tz: NY };
[st, j] = await jsonOf(await signup({ request: post('/api/signup', maria), env }));
row = DB.raw.prepare('SELECT * FROM gpw_sub WHERE email = ?').get('maria@example.com');
ok(row && row.student_id === j.token && row.source === 'linktolead-account' && row.sent === 1, 'a new account joins, linked to the account, letter 1 sent');
ok(sent.some((m) => m.body.subject === 'Why we exist · Good People Win 1/10'), 'and letter 1 went, beside the welcome');
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE student_id = ? AND kind = 'gpw-start'").get(j.token).n === 1, 'their account remembers it');
await signup({ request: post('/api/signup', { ...maria, email: 'nora@example.com', consent: false }), env });
ok(!DB.raw.prepare('SELECT 1 FROM gpw_sub WHERE email = ?').get('nora@example.com'), 'no yes to letters at sign-up: no letters');
// Unsubscribed from everything on the account: these stop too.
DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(j.token);
DB.raw.prepare('UPDATE gpw_sub SET last_sent_at = ? WHERE email = ?').run(Date.now() - 49 * H, 'maria@example.com');
await sendDue(env, DB, B, new Date('2026-11-09T15:00:00Z'));
ok(DB.raw.prepare('SELECT stop_why FROM gpw_sub WHERE email = ?').get('maria@example.com').stop_why === 'unsubscribed from everything', 'unsubscribed from everything: these stop too');
ok((await gpwJoin(env, DB, { email: 'maria@example.com', first: 'Maria' })).status !== 'ok', 'and they cannot be joined again from a form');

// ── Off ────────────────────────────────────────────────────────────────────
const off = { ...env, GPW_MODE: 'off' };
[st, j] = await jsonOf(await joinPost({ request: fromES({ first: 'Zed', email: 'zed@example.com', consent: true }), env: off }));
ok(j.status === 'off' && !DB.raw.prepare('SELECT 1 FROM gpw_sub WHERE email = ?').get('zed@example.com'), 'GPW_MODE "off": nobody joins');
ok((await sendDue(off, DB, B)).why === 'GPW_MODE is off', 'GPW_MODE "off": nothing is sent');

// ── Every door, and everyone who already exists ────────────────────────────
// One fake for the outside world: Google's token check, Resend, and Mailchimp
// (the subscribed members, and one person's status).
const CID = '1234-abc.apps.googleusercontent.com';
const outbox = [];
let mcMembers = [], mcStatus = {};
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://oauth2.googleapis.com/tokeninfo')) {
    return new URL(u).searchParams.get('id_token') === 'tok-gpw-google-000000001'
      ? { ok: true, json: async () => ({ iss: 'https://accounts.google.com', aud: CID, email_verified: 'true', exp: String(Math.floor(Date.now() / 1000) + 600), sub: '7', email: 'Gia@Example.com', given_name: 'Gia', family_name: 'Lu' }) }
      : { ok: false, json: async () => ({}) };
  }
  if (u.includes('api.resend.com')) { outbox.push(JSON.parse(opts.body)); return { ok: true }; }
  if (u.includes('api.mailchimp.com') && u.includes('/members?status=subscribed')) return { ok: true, json: async () => ({ members: mcMembers, total_items: mcMembers.length }) };
  const h = /\/members\/([0-9a-f]{32})\?fields=status/.exec(u);
  if (h) return mcStatus[h[1]] ? { ok: true, json: async () => ({ status: mcStatus[h[1]] }) } : { ok: false, status: 404, json: async () => ({}) };
  return { ok: false, status: 503, headers: new Headers(), text: async () => 'offline', json: async () => ({}) };
};
DB = fakeD1();
const MK = 'mk';
const base = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: MK, GOOGLE_CLIENT_ID: CID, MAILCHIMP_API_KEY: 'k-us8', MAILCHIMP_MODE: 'test' };
const toOf = (to) => outbox.filter((m) => m.to[0] === to);

// Google.
await googlePost({ request: post('/api/google', { credential: 'tok-gpw-google-000000001', consent: true, tz: NY }), env: base });
row = DB.raw.prepare('SELECT * FROM gpw_sub WHERE email = ?').get('gia@example.com');
ok(row && row.source === 'linktolead-google' && row.student_id && row.sent === 1 && toOf('gia@example.com').some((m) => /Good People Win 1\/10/.test(m.subject)), 'door: Google sign-up joins, letter 1 at once');

// Paying first: the account is made when Stripe says paid.
await guestAccount(base, DB, { id: 'cs_test_gpw', metadata: { guest: '1', email: 'Pia@Example.com', first: 'Pia', consent: '1', step: 'session' } });
row = DB.raw.prepare('SELECT * FROM gpw_sub WHERE email = ?').get('pia@example.com');
ok(row && row.source === 'linktolead-pay' && row.sent === 1 && toOf('pia@example.com').length >= 1, 'door: an account made when they paid joins, letter 1 at once');
await guestAccount(base, DB, { id: 'cs_test_gpw2', metadata: { guest: '1', email: 'quiet@example.com', first: 'Q', consent: '0', step: 'session' } });
ok(!DB.raw.prepare('SELECT 1 FROM gpw_sub WHERE email = ?').get('quiet@example.com'), 'door: paid without a yes to letters: no letters');

// People who were here before Good People Win (made with it off).
const earlier = { ...base, GPW_MODE: 'off' };
const mk = async (email, consent) => (await (await signup({ request: post('/api/signup', { ...maria, email, first: email.split('@')[0], consent }), env: earlier })).json()).token;
await mk('ana@example.com', true);
await mk('ben@example.com', false);
const cy = await mk('cy@example.com', true);
await mk('eve@example.com', false);
DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(cy);
await joinPost({ request: fromES({ first: 'Lia', email: 'lia@example.com', consent: true }, '4.4.4.4'), env: base });
mcMembers = [
  { email_address: 'Ben@Example.com', merge_fields: { FNAME: 'Ben' } }, // an account that never ticked yes, but subscribed on the list
  { email_address: 'dora@example.com', merge_fields: { FNAME: 'Dora' } }, // on the list only
  { email_address: 'cy@example.com', merge_fields: { FNAME: 'Cy' } }, // unsubscribed on their account
  { email_address: 'lia@example.com', merge_fields: { FNAME: 'Lia' } }, // already in the letters
  { email_address: 'dora@example.com', merge_fields: { FNAME: 'Dora' } }, // twice on the list
];
const M = async (body, key = MK) => { const r = await mentorPost({ request: new Request(`${B}/api/mentor`, { method: 'POST', headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}) }, body: JSON.stringify(body) }), env: base }); return [r.status, await r.json()]; };
ok((await M({ action: 'gpw-everyone', send: false }, ''))[0] === 401, 'existing: nobody without the key or a team account');
const sentBefore = outbox.length;
let [code, c] = await M({ action: 'gpw-everyone', send: false });
c = c.counts;
ok(code === 200 && outbox.length === sentBefore, 'existing: Count sends nothing');
ok(c.accountsYes === 2 && c.accountsWithout === 2, `existing: accounts with a yes (Ana; Ben, subscribed on the list) and without (Eve; Quiet, who paid without a yes): ${c.accountsYes}/${c.accountsWithout}`);
ok(c.mailchimp === 1 && c.mailchimpRead.ok && c.mailchimpRead.subscribed === 5, 'existing: from Mailchimp, only who has no account and is not already in (Dora, once)');
ok(c.unsubscribed === 1 && c.already === 3, 'existing: the unsubscribed account and the three already in (Gia, Pia, Lia) are left out');
ok(c.total === 5 && planCountsTotal(c, false) === 3 && c.nowMax === NOW_MAX && c.perHour === PER_RUN, 'existing: 5 would start with the tick, 3 without; how many now and per hour');
[code, c] = await M({ action: 'gpw-everyone', send: true, without: false });
ok(code === 200 && c.joined === 3 && c.sentNow === 3 && c.waiting === 0, `existing, without the tick: 3 start and get letter 1 now (${JSON.stringify(c)})`);
ok(!DB.raw.prepare('SELECT 1 FROM gpw_sub WHERE email = ?').get('eve@example.com') && !DB.raw.prepare('SELECT 1 FROM gpw_sub WHERE email = ?').get('cy@example.com'), 'existing: Eve waits for the tick; Cy, unsubscribed, never');
ok(DB.raw.prepare('SELECT source FROM gpw_sub WHERE email = ?').get('ana@example.com').source === 'existing-account' && DB.raw.prepare('SELECT source FROM gpw_sub WHERE email = ?').get('dora@example.com').source === 'existing-mailchimp', 'existing: each row says where it came from');
ok(toOf('dora@example.com').length === 1 && /left your name and email with ExploraSelf/.test(toOf('dora@example.com')[0].text) && /^Hi Dora,/.test(toOf('dora@example.com')[0].text), 'existing: Dora gets letter 1, by name, and the footer says why');
ok(toOf('lia@example.com').length === 1, 'existing: Lia, already in, gets nothing twice');
[code, c] = await M({ action: 'gpw-everyone', send: true });
ok(c.joined === 2 && toOf('eve@example.com').length === 1 && toOf('quiet@example.com').length === 1, 'existing, with the tick: Eve and Quiet start too');
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'gpw-start'").get().n >= 4, 'existing: each account remembers it');
// A "no" in Mailchimp stops it, for someone without an account here.
mcStatus[md5('dora@example.com')] = 'unsubscribed';
DB.raw.prepare('UPDATE gpw_sub SET last_sent_at = ? WHERE sent = 1').run(Date.now() - 49 * H);
const out0 = outbox.length;
let day = new Date(); while (Number(new Intl.DateTimeFormat('en-US', { timeZone: NY, hour: 'numeric', hourCycle: 'h23' }).format(day)) < 9 || Number(new Intl.DateTimeFormat('en-US', { timeZone: NY, hour: 'numeric', hourCycle: 'h23' }).format(day)) > 19) day = new Date(day.getTime() + H);
await sendDue(base, DB, B, day);
ok(DB.raw.prepare('SELECT stop_why FROM gpw_sub WHERE email = ?').get('dora@example.com').stop_why === 'unsubscribed in Mailchimp' && !outbox.slice(out0).some((m) => m.to[0] === 'dora@example.com'), 'unsubscribed in Mailchimp: no more letters');
ok(outbox.slice(out0).some((m) => m.to[0] === 'ana@example.com' && /2\/10/.test(m.subject)), 'and the others go on to letter 2');
const mj2 = read('public/mentor/mentor.js');
ok(/Count them/.test(mj2) && /gpw-everyone/.test(mj2) && /window\.confirm\(/.test(mj2) && /Replies come to your inbox, so they are not counted here/.test(mj2), '/mentor: Count first, then Send, asked once more; says replies are not counted');

// ── Wiring ─────────────────────────────────────────────────────────────────
ok(ROUTES['/api/good-people'] && typeof JOBS['good-people-win'] === 'function', 'the Worker serves the route and runs the hourly job');
ok(TAG_LIST.some((t) => t.name === GPW_TAG) && GPW_TAG === 'linktolead-letters-good-people-win', 'the Mailchimp tag is on the tag list');
ok(/Good People Win/.test(read('AGENTS.md')), 'AGENTS.md says how these letters work');

done();
