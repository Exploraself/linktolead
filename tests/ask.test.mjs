// Library downloads (GET /api/library: signed in only, logged, tagged in
// Mailchimp once per book, then the file), "Change where I stand" (POST
// /api/stage, the nudge, the chosen stage winning) and "Ask Alexandru" (the
// thread, the notice to Alexandru, the answer from /mentor as a letter).
// No network: Resend and Mailchimp are faked.

import { onRequestGet as library, LIBRARY_ITEMS, libraryTag } from '../functions/api/library.js';
import { onRequestPost as stagePost } from '../functions/api/stage.js';
import { onRequestGet as threadGet, onRequestPost as threadRead } from '../functions/api/thread.js';
import { onRequestPost as notePost, MENTOR_EMAIL } from '../functions/api/note.js';
import { onRequestGet as msgGet } from '../functions/api/messages.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as compassPost } from '../functions/api/compass.js';
import { onRequestGet as mGet, onRequestPost as mPost } from '../functions/api/mentor.js';
import { LIBRARY } from '../public/content.js';
import { programmeStage, stageNudge, entry } from '../public/home.js';
import { summary, filter } from '../public/mentor/dash.js';
import { fakeD1, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('ask');
const K = { 'x-mentor-key': 'mentor-key-123' };
const BASE = { RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123' };

/** The network: Resend and Mailchimp both answer yes, and every call is kept. */
let mails = [], mc = [];
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.includes('api.resend.com')) { mails.push(JSON.parse(opts.body)); return { ok: true }; }
  if (/api\.mailchimp\.com|list-manage/.test(url)) { mc.push({ url, method: opts.method, body: opts.body ? JSON.parse(opts.body) : null }); return { ok: true, status: 200, headers: new Headers(), text: async () => '{}' }; }
  throw new Error('no network in tests: ' + url);
};
const fresh = (extra = {}) => { mails = []; mc = []; return { DB: fakeD1(), ...BASE, ...extra }; };
const join = async (env, who) => (await (await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true, ...who }), env })).json()).token;
const M = async (env, body) => { const r = await mPost({ request: new Request('https://x/api/mentor', { method: 'POST', headers: { 'content-type': 'application/json', ...K }, body: JSON.stringify(body) }), env }); return [r.status, await r.json()]; };
const mOne = async (env, id) => (await (await mGet({ request: new Request('https://x/api/mentor?student=' + id, { headers: K }), env })).json());
const events = (env, id, kind) => env.DB.raw.prepare('SELECT detail FROM event WHERE student_id = ? AND kind = ? ORDER BY id').all(id, kind).map((e) => e.detail);

// ── The library ─────────────────────────────────────────────────────────────
const fromContent = Object.fromEntries([...LIBRARY.manuals, ...LIBRARY.books].filter((b) => b.file).map((b) => [b.k, { name: b.n, file: b.file }]));
ok(JSON.stringify(Object.fromEntries(Object.entries(LIBRARY_ITEMS).map(([k, v]) => [k, { name: v.name, file: v.file }]))) === JSON.stringify(fromContent) && Object.values(LIBRARY_ITEMS).every((v) => /^[a-z-]+$/.test(v.slug)), 'the library items match LIBRARY in content.js, each with a tag slug');
ok(libraryTag('btl') === 'linktolead-library-built-to-lead', 'the tag: "linktolead-library-<book>"');

let env = fresh({ MAILCHIMP_API_KEY: 'key-us19' });
const ana = await join(env, {});
mc = [];
let r = await library({ request: get('/api/library?item=nope&t=' + ana), env });
ok(r.status === 404, 'an unknown book: 404');
r = await library({ request: get('/api/library?item=btl'), env });
ok(r.status === 302 && r.headers.get('location') === 'https://linktolead.exploraself.com/north/#join', 'not signed in: off to make an account');
r = await library({ request: get('/api/library?item=btl&t=not-a-real-token-at-all-xx'), env });
ok(r.status === 302 && /\/north\/#join$/.test(r.headers.get('location')), 'a wrong token: the same');
ok(mc.length === 0, 'nothing tagged without an account');
r = await library({ request: get('/api/library?item=btl&t=' + ana), env });
ok(r.status === 302 && r.headers.get('location') === 'https://linktolead.exploraself.com/library/built-to-lead.pdf', 'signed in: on to the file');
ok(JSON.stringify(events(env, ana, 'library-download')) === '["btl"]', "event 'library-download' with the key");
ok(mc.length === 1 && mc[0].method === 'POST' && /\/tags$/.test(mc[0].url) && JSON.stringify(mc[0].body) === JSON.stringify({ tags: [{ name: 'linktolead-library-built-to-lead', status: 'active' }] }), 'Mailchimp: the one library tag, active');
await library({ request: get('/api/library?item=btl&t=' + ana), env });
ok(mc.length === 1 && events(env, ana, 'library-download').length === 2, 'the same book again: logged, not tagged twice');
await library({ request: get('/api/library?item=grow&t=' + ana), env });
ok(mc.length === 2 && mc[1].body.tags[0].name === 'linktolead-library-blueprint-growing', 'another book: its own tag');
const one = await mOne(env, ana);
ok(JSON.stringify(one.library.map((x) => x.name)) === JSON.stringify(['Built to Lead', 'The Founder’s Blueprint · Growing']) && one.library.every((x) => x.at), '/mentor: each book once, with its date');
const roster = (await (await mGet({ request: new Request('https://x/api/mentor', { headers: K }), env })).json()).students;
ok(roster[0].library.split(',').sort().join() === 'btl,grow', 'roster: what they downloaded');
ok(summary(roster, []).library === 1 && filter(roster, { tile: 'library' }).length === 1 && filter([{ id: 'x' }], { tile: 'library' }).length === 0, 'the "Downloaded from the library" filter');
const csv = await (await mGet({ request: new Request('https://x/api/mentor?csv=1', { headers: K }), env })).text();
ok(csv.split('\r\n')[0].includes('"Library"') && csv.includes('Built to Lead; The Founder’s Blueprint · Growing'), 'CSV: a Library column');
env = fresh();
const bo = await join(env, { email: 'bo@example.com' });
mc = []; // the join itself went through the public form
r = await library({ request: get('/api/library?item=wb&t=' + bo), env });
ok(r.status === 302 && mc.length === 0, 'form mode: the download works, nothing is tagged');

// ── Where I stand ───────────────────────────────────────────────────────────
env = fresh({ MAILCHIMP_API_KEY: 'key-us19' });
const cy = await join(env, { email: 'cy@example.com', stage: 'growing' });
await compassPost({ request: post('/api/compass', { token: cy, stage: 'scaling', results: { scores: [3, 3, 3, 3], answered: [2, 2, 2, 2] } }), env });
r = await stagePost({ request: post('/api/stage', { token: cy, stage: 'leading' }), env });
ok(r.status === 400, 'only Building, Growing or Scaling');
r = await stagePost({ request: post('/api/stage', { token: 'nobody-at-all-here-0000', stage: 'build' }), env });
ok(r.status === 401, 'signed in only');
mc = [];
r = await stagePost({ request: post('/api/stage', { token: cy, stage: 'build', from: 'scale' }), env });
ok(r.status === 200 && env.DB.raw.prepare('SELECT stage FROM student WHERE id = ?').get(cy).stage === 'build', 'saved to student.stage');
ok(JSON.stringify(JSON.parse(events(env, cy, 'stage-change')[0])) === '{"from":"scale","to":"build"}', "event 'stage-change' with from and to");
const stageTags = (mc[0] && mc[0].body.tags || []).filter((t) => t.name.startsWith('linktolead-stage-'));
ok(mc.length === 1 && stageTags.find((t) => t.name === 'linktolead-stage-building').status === 'active' && stageTags.filter((t) => t.status === 'active').length === 1, 'Mailchimp: the stage tags follow the chosen stage, over the North Star');
const st = await (await stateGet({ request: get('/api/state?t=' + cy), env })).json();
ok(st.me.stage === 'build' && st.me.stageChosen === true, 'state: the chosen stage, marked as chosen');
ok(programmeStage({ chosen: 'build', local: 'scale', compass: 'scaling' }) === 'build', 'a chosen stage wins over the device and the North Star');
ok(programmeStage({ chosen: '', local: 'grow', compass: 'scaling' }) === 'grow', 'no choice made: the device still keeps its place');
const hist = (await mOne(env, cy)).stages;
ok(hist.length === 1 && hist[0].from === 'Scaling' && hist[0].to === 'Building' && hist[0].at, '/mentor: the stage change in their history');

ok(stageNudge({ compass: 'scaling', current: 'build' }) === 'scale', 'nudge: the North Star placed them elsewhere');
ok(stageNudge({ compass: 'leading', current: 'grow' }) === 'scale' && stageNudge({ compass: 'leading', current: 'scale' }) === null, 'nudge: Leading counts as Scaling');
ok(stageNudge({ compass: 'growing', current: 'grow' }) === null && stageNudge({ compass: null, current: 'grow' }) === null, 'nudge: none when they agree, or without a North Star');
ok(stageNudge({ compass: 'scaling', current: 'build', seen: 'scale|build' }) === null && stageNudge({ compass: 'scaling', current: 'grow', seen: 'scale|build' }) === 'scale', 'nudge: once per pair');

// ── Ask Alexandru ───────────────────────────────────────────────────────────
ok(entry({ joined: true, old: false, hash: '#ask' }) === 'ask', '#ask opens the thread');
env = fresh();
const di = await join(env, { first: 'Di', email: 'di@example.com' });
mails = [];
r = await notePost({ request: post('/api/note', { token: di, body: 'How do I price <this>?', level: 2, domain: 'work' }), env });
ok(r.status === 200, 'a question is saved');
ok(mails.length === 1 && mails[0].to[0] === MENTOR_EMAIL && MENTOR_EMAIL === 'alex@exploraself.com', 'Alexandru is told, at alex@exploraself.com');
ok(mails[0].subject === 'New question from Di Pop' && mails[0].text.includes('How do I price <this>?') && mails[0].text.includes('Level 02 · Lead your business') && !mails[0].text.includes('P.S.'), 'the notice: who, what, where; no offer');
ok(mails[0].html.includes('How do I price &lt;this&gt;?'), 'the notice escapes the question');
mails = [];
await notePost({ request: post('/api/note', { token: di, body: 'Also this.' }), env: { ...env, MENTOR_EMAIL: 'team@example.com' } });
ok(mails[0].to[0] === 'team@example.com', 'MENTOR_EMAIL moves the notice');
for (let i = 0; i < 5; i++) await notePost({ request: post('/api/note', { token: di, body: 'Again ' + i }), env });
ok(1 + mails.length === 5 && env.DB.raw.prepare('SELECT COUNT(*) n FROM note WHERE student_id = ?').get(di).n === 7, 'at most five notices a founder an hour (seven questions, five notices); every question still saved');
env.DB.raw.prepare("DELETE FROM note WHERE body LIKE 'Again %' OR body = 'Also this.'").run();

let T = await (await threadGet({ request: get('/api/thread?t=' + di), env })).json();
ok(T.items.length === 1 && T.items[0].from === 'founder' && T.items[0].level === 2 && T.items[0].domain === 'work' && T.unread === 0, 'thread: the question, with its level and domain');
const q = T.items[0].id;
mails = [];
let [s, out] = await M(env, { action: 'reply', note: q, reply: 'Start with what one sale leaves you.\n\nThen we talk.' });
ok(s === 200 && out.emailed === true, 'answered in /mentor, emailed');
ok(mails.length === 1 && mails[0].to[0] === 'di@example.com' && mails[0].subject === 'An answer to your question' && mails[0].text.includes('You asked: “How do I price <this>?”')
  && mails[0].html.includes('signature.png') && /\nP\.S\. /.test(mails[0].text), 'the answer goes as a letter, with a P.S.');
T = await (await threadGet({ request: get('/api/thread?t=' + di), env })).json();
ok(T.items.length === 2 && T.items[1].from === 'mentor' && T.items[1].note === q && T.items[1].read === false && T.unread === 1, 'thread: the answer, newest last, unread');
ok(env.DB.raw.prepare('SELECT status, reply FROM note WHERE id = ?').get(q).status === 'answered', 'the question is marked answered');
const inbox = await (await msgGet({ request: get('/api/messages?t=' + di), env })).json();
ok(inbox.messages.length === 0 && inbox.unread === 0, 'answers stay in the thread, not in the Base Camp notes');
r = await threadRead({ request: post('/api/thread', { token: di }), env });
T = await (await threadGet({ request: get('/api/thread?t=' + di), env })).json();
ok(r.status === 200 && T.unread === 0 && T.items[1].read === true, 'opening the thread marks the answers read');
const mt = (await mOne(env, di)).thread;
ok(mt.length === 2 && mt[0].body === 'How do I price <this>?' && mt[1].body.startsWith('Start with'), '/mentor: the same thread');
ok((await M(env, { action: 'reply', note: q, reply: '   ' }))[0] === 400 && (await M(env, { action: 'reply', note: 'nope', reply: 'x' }))[0] === 404, 'an empty answer or an unknown question is refused');

env.DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(di);
await notePost({ request: post('/api/note', { token: di, body: 'One more.' }), env });
const q2 = (await (await threadGet({ request: get('/api/thread?t=' + di), env })).json()).items.find((x) => x.body === 'One more.').id;
mails = [];
[s, out] = await M(env, { action: 'reply', note: q2, reply: 'Here.' });
ok(s === 200 && out.emailed === false && out.unsubscribed === true && mails.length === 0, 'unsubscribed: the answer is in the thread only, not emailed');
// An answer from before the thread existed (only on the note) still shows.
env.DB.raw.prepare("INSERT INTO note (id,student_id,body,status,reply,created_at,answered_at) VALUES ('old1',?,'Old question','answered','Old answer','2026-10-01T10:00:00Z','2026-10-02T10:00:00Z')").run(di);
T = await (await threadGet({ request: get('/api/thread?t=' + di), env })).json();
ok(T.items[0].body === 'Old question' && T.items[1].body === 'Old answer' && T.items[1].read === true, 'an older answer on the note still shows, as read');
ok((await threadGet({ request: get('/api/thread?t=nobody-at-all-here-0000'), env })).status === 404, 'thread: signed in only');

done();
