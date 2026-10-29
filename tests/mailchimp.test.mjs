// Mailchimp on account creation: the three modes (test, form, API), the log,
// consent, unsubscribe / pause / delete, the signup's speed when Mailchimp is
// slow, and the mentor's test join and backfill. No network: fetch is faked.

import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as compassPost } from '../functions/api/compass.js';
import { onRequestGet as unsub } from '../functions/api/unsubscribe.js';
import { onRequestGet as mGet, onRequestPost as mPost } from '../functions/api/mentor.js';
import { mailchimpState, parseFormUrl, buildRequest, readFormReply, weakestTag, md5, DEFAULT_FORM, backfillList,
  tagsFor, STEP_TAGS, TIER_ORDER, stepsBackfillList, stepName } from '../functions/_mailchimp.js';
import { climbOf } from '../functions/api/mentor.js';
import { TIER_ORDER as SITE_TIERS } from '../public/content.js';
import { fakeD1, post, get, tally } from './_d1.mjs';
import { createHash } from 'node:crypto';

const { ok, done } = tally('mailchimp');
const BASE = { RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123' };
const K = { 'x-mentor-key': 'mentor-key-123' };
const jsonp = (o) => `jQuery123(${JSON.stringify(o)})`;

/** A fake network: Resend always accepts; Mailchimp answers with `mc`. */
let calls = [], mc = () => ({ status: 200, body: jsonp({ result: 'success', msg: 'Thank you for subscribing!' }) });
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.includes('api.resend.com')) return { ok: true };
  calls.push({ url, method: opts.method, body: opts.body ? JSON.parse(opts.body) : null, auth: opts.headers && opts.headers.authorization });
  const a = await mc(url, opts);
  return { ok: a.status < 300, status: a.status, headers: new Headers({ 'content-type': a.type || 'application/json' }), text: async () => a.body };
};
const fresh = (extra = {}) => { calls = []; return { DB: fakeD1(), ...BASE, ...extra }; };
const join = (env, who, more = {}) => signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true, source: 'sales-page', stage: 'growing', ...who, ...more }), env }).then((r) => r.json());
const logOf = (env) => env.DB.raw.prepare('SELECT * FROM mailchimp_log ORDER BY id').all();
const mcCalls = () => calls.filter((c) => /list-manage|api\.mailchimp/.test(c.url));
const M = async (env, body) => { const r = await mPost({ request: new Request('https://x/api/mentor', { method: 'POST', headers: { 'content-type': 'application/json', ...K }, body: JSON.stringify(body) }), env }); return [r.status, await r.json()]; };

// ── Modes, chosen only by settings ───────────────────────────────────────────
ok(mailchimpState({}).mode === 'form' && mailchimpState({}).ready && mailchimpState({}).form === DEFAULT_FORM, 'no settings: FORM mode with the Link to Lead form');
ok(DEFAULT_FORM.server === 'us8' && DEFAULT_FORM.u === 'ab5e056ba759e867cde44f4da' && DEFAULT_FORM.id === '41448b6750' && DEFAULT_FORM.f_id === '005a1ae1f0' && DEFAULT_FORM.tag === '3359661', 'the Link to Lead form ids restored');
ok(mailchimpState({ MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'x-us1' }).mode === 'test', '"test" wins over everything');
ok(mailchimpState({ MAILCHIMP_API_KEY: 'abc-us19' }).mode === 'api' && mailchimpState({ MAILCHIMP_API_KEY: 'abc-us19' }).audience === '41448b6750', 'API key: API mode, audience from the form list id');
ok(mailchimpState({ MAILCHIMP_API_KEY: 'abc-us19', MAILCHIMP_AUDIENCE_ID: 'aud999' }).audience === 'aud999', 'MAILCHIMP_AUDIENCE_ID wins');
const sample = parseFormUrl('https://acme.us21.list-manage.com/subscribe/post?u=abc123def&id=fed987&f_id=00ab12');
ok(sample && sample.server === 'us21' && sample.u === 'abc123def' && sample.id === 'fed987' && sample.f_id === '00ab12' && sample.host === 'acme.us21.list-manage.com', 'a form link gives u, id, f_id and the server');
ok(mailchimpState({ MAILCHIMP_FORM_URL: 'https://example.com/not-a-form' }).ready === false, 'a link that is not a form is not used');
ok(md5('ana@example.com') === createHash('md5').update('ana@example.com').digest('hex'), 'md5 matches');
ok(weakestTag(JSON.stringify({ scores: [4, 2, 2, 5], answered: [2, 2, 2, 2] })) === 'lead-your-people', 'weakest domain: lowest score, tie to the first');
ok(weakestTag(JSON.stringify({ scores: [4, 2, 2, 5], answered: [2, 0, 2, 2] })) === null, 'not every domain answered: no weakest domain yet');

// ── TEST mode: the exact payload is logged, nothing is called ────────────────
let env = fresh({ MAILCHIMP_MODE: 'test' });
let j = await join(env, {});
let L = logOf(env);
ok(j.ok && mcCalls().length === 0, 'TEST: no call to Mailchimp');
ok(L.length === 1 && L[0].status === 'test' && L[0].action === 'join' && L[0].mode === 'test' && L[0].email === 'ana@example.com', 'TEST: logged with status "test"');
ok(/GET https:\/\/exploraselfmba\.us8\.list-manage\.com\/subscribe\/post-json\?u=ab5e056ba759e867cde44f4da&id=41448b6750&EMAIL=ana%40example\.com&FNAME=Ana&LNAME=Pop&tags=3359661/.test(L[0].detail), 'TEST: the exact request is in the log');
const apiTest = fresh({ MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us19' });
await join(apiTest, {});
ok(mcCalls().length === 0 && /PUT https:\/\/us19\.api\.mailchimp\.com.*"status_if_new":"subscribed".*POST .*\/tags/.test(logOf(apiTest)[0].detail) && !logOf(apiTest)[0].detail.includes('k-us19'), 'TEST with a key: the API payload is logged, the key never');
const req = buildRequest(mailchimpState({ MAILCHIMP_MODE: 'test' }), { email: 'Ana@Example.com', first: 'Ana', last: 'Pop' }, 'join')[0];
const q = new URL(req.url).searchParams;
ok(q.get('EMAIL') === 'ana@example.com' && q.get('FNAME') === 'Ana' && q.get('LNAME') === 'Pop' && q.get('tags') === '3359661' && q.get('u') === DEFAULT_FORM.u && q.get('id') === DEFAULT_FORM.id && q.get('f_id') === DEFAULT_FORM.f_id, 'TEST: payload has email, FNAME, LNAME, tag and the form ids');
ok(!q.has('COMPANY') && !q.has('PHONE'), 'only email, FNAME, LNAME and the tag are sent');
ok(env.DB.raw.prepare('SELECT mailchimp_status FROM student_profile WHERE student_id = ?').get(j.token).mailchimp_status === 'test', 'TEST: last status on the profile');

// ── FORM mode: the Link to Lead form by default ──────────────────────────────
env = fresh();
j = await join(env, {});
let c = mcCalls();
ok(c.length === 1 && c[0].method === 'GET' && c[0].url.startsWith('https://exploraselfmba.us8.list-manage.com/subscribe/post-json?'), 'FORM: one call to the Link to Lead form');
ok(logOf(env)[0].status === 'ok' && env.DB.raw.prepare('SELECT mailchimp_status, mailchimp_at FROM student_profile WHERE student_id = ?').get(j.token).mailchimp_at, 'FORM: success is logged and stored');
env = fresh({ MAILCHIMP_FORM_URL: 'https://acme.us21.list-manage.com/subscribe/post?u=abc123def&id=fed987' });
await join(env, {});
c = mcCalls();
ok(c.length === 1 && c[0].url.startsWith('https://acme.us21.list-manage.com/subscribe/post-json?') && /u=abc123def/.test(c[0].url) && /id=fed987/.test(c[0].url), 'FORM: MAILCHIMP_FORM_URL is read');

// A form that requires Company and Phone.
mc = () => ({ status: 200, body: jsonp({ result: 'error', msg: '3 - Please enter a value' }) });
env = fresh();
j = await join(env, {});
L = logOf(env);
ok(j.ok && L[0].status === 'failed' && L[0].detail.startsWith('Mailchimp says a required field is missing: COMPANY / PHONE'), 'required field missing: logged in plain words');
ok(/Mailchimp: “3 - Please enter a value”/.test(L[0].detail), 'and the raw reason');
ok(readFormReply(200, '', jsonp({ result: 'error', msg: 'This field is required.' }), { LNAME: '' }).why.includes('LNAME / COMPANY / PHONE'), 'a missing surname is named too');
// A bot check: not JSON at all.
mc = () => ({ status: 200, type: 'text/html', body: '<html><body><h1>Please verify you are human</h1></body></html>' });
env = fresh();
await join(env, {});
L = logOf(env);
ok(L[0].status === 'failed' && /not the form’s answer \(HTTP 200, text\/html\)/.test(L[0].detail) && /verify you are human/.test(L[0].detail), 'an unreadable reply: the raw reason is logged');
mc = () => ({ status: 200, body: jsonp({ result: 'error', msg: 'ana@example.com is already subscribed to list Link to Lead.' }) });
env = fresh();
await join(env, {});
ok(logOf(env)[0].status === 'ok', '"already subscribed" counts as in');

// ── API mode ─────────────────────────────────────────────────────────────────
mc = () => ({ status: 200, body: '{}' });
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
j = await join(env, {});
c = mcCalls();
const hash = createHash('md5').update('ana@example.com').digest('hex');
ok(c.length === 2, 'API: member, then tags');
ok(c[0].method === 'PUT' && c[0].url === `https://us19.api.mailchimp.com/3.0/lists/41448b6750/members/${hash}?skip_merge_validation=true`, 'API: PUT to the member, md5 of the lowercase email, skip_merge_validation');
ok(c[0].body.status_if_new === 'subscribed' && c[0].body.email_address === 'ana@example.com' && c[0].body.merge_fields.FNAME === 'Ana' && c[0].body.merge_fields.LNAME === 'Pop', 'API: status and merge fields');
ok(c[0].auth === 'Basic ' + btoa('linktolead:secretkey-us19'), 'API: the key as basic auth, never in the URL');
const active = (call) => call.body.tags.filter((t) => t.status === 'active').map((t) => t.name).sort().join(',');
ok(c[1].method === 'POST' && c[1].url.endsWith(`/members/${hash}/tags`) && active(c[1]) === 'Link to Lead - The Founder Launchpad,grow,linktolead,sales-page', 'API: tags linktolead, source, stage and the first step');
ok(c[1].body.tags.some((t) => t.name === 'build' && t.status === 'inactive'), 'API: the other stages are switched off');
ok(logOf(env)[0].status === 'ok' && logOf(env)[0].mode === 'api', 'API: logged ok');
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19', MAILCHIMP_DOUBLE_OPTIN: 'yes' });
await join(env, {});
ok(mcCalls()[0].body.status_if_new === 'pending', 'API: double opt-in sends "pending"');

// The Compass, finished: the tags update once, with the weakest domain.
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
j = await join(env, {});
calls = [];
const done4 = { token: j.token, stage: 'leading', results: { scores: [5, 1, 3, 4], answered: [2, 2, 2, 2] } };
await compassPost({ request: post('/api/compass', done4), env });
c = mcCalls();
ok(c.length === 1 && c[0].url.endsWith('/tags') && active(c[0]) === 'Link to Lead - The Founder Launchpad,lead-your-people,linktolead,sales-page,scale', 'Compass done: stage (Leading → scale) and weakest domain');
calls = [];
await compassPost({ request: post('/api/compass', done4), env });
ok(mcCalls().length === 0, 'the same Compass again: no new call');
await compassPost({ request: post('/api/compass', { token: j.token, results: { scores: [1, 1, 3, 4], answered: [2, 2, 0, 2] } }), env });
ok(mcCalls().length === 0, 'an unfinished Compass: no tags');
env = fresh();
j = await join(env, {});
calls = [];
await compassPost({ request: post('/api/compass', { ...done4, token: j.token }), env });
ok(mcCalls().length === 0, 'FORM mode: the Compass sends no tags');

// ── Consent ──────────────────────────────────────────────────────────────────
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
j = await join(env, {}, { consent: false });
ok(mcCalls().length === 0 && logOf(env).length === 0, 'no consent: no sync, nothing logged');
await join(env, {}, { consent: true });
ok(mcCalls().length === 0, 'someone else typing that address with consent: still no sync');
await join(env, {}, { consent: true, token: j.token });
ok(mcCalls().length === 2 && logOf(env).length === 1, 'consent from the browser that holds the record: synced');

// ── Unsubscribe, pause, delete ───────────────────────────────────────────────
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
j = await join(env, {});
calls = [];
const uid = env.DB.raw.prepare('SELECT unsub_id FROM student_profile WHERE student_id = ?').get(j.token).unsub_id;
await unsub({ request: get('/api/unsubscribe?u=' + uid), env });
c = mcCalls();
ok(c.length === 1 && c[0].method === 'PUT' && c[0].body.status === 'unsubscribed' && c[0].url.includes(hash), 'unsubscribe: "unsubscribed" in Mailchimp');
ok(logOf(env).at(-1).action === 'unsubscribe' && logOf(env).at(-1).status === 'ok', 'unsubscribe: logged');
calls = [];
await join(env, {}, { email: 'bo@example.com', first: 'Bo', consent: true });
const bo = env.DB.raw.prepare("SELECT id FROM student WHERE email = 'bo@example.com'").get().id;
calls = [];
let [st, out] = await M(env, { action: 'pause', student: bo, paused: true });
ok(st === 200 && out.mailchimp === 'ok' && mcCalls()[0].body.status === 'unsubscribed', 'pause: "unsubscribed" in Mailchimp');
calls = [];
[st, out] = await M(env, { action: 'delete', student: bo, confirm: 'bo@example.com' });
ok(st === 200 && out.mailchimp === 'ok' && mcCalls().length === 1 && mcCalls()[0].method === 'PUT' && mcCalls()[0].body.status === 'unsubscribed', 'delete: "unsubscribed", never a hard delete');
ok(!calls.some((x) => x.method === 'DELETE'), 'no DELETE call to Mailchimp');
ok(env.DB.raw.prepare('SELECT COUNT(*) n FROM mailchimp_log WHERE student_id = ?').get(bo).n === 0, 'delete removes their Mailchimp log rows');
env = fresh();
j = await join(env, {});
calls = [];
await unsub({ request: get('/api/unsubscribe?u=' + env.DB.raw.prepare('SELECT unsub_id FROM student_profile').get().unsub_id), env });
L = logOf(env);
ok(mcCalls().length === 0 && L.at(-1).action === 'unsubscribe' && L.at(-1).status === 'failed' && /form cannot unsubscribe/.test(L.at(-1).detail), 'FORM mode: the unsubscribe is logged, with what to do');

// ── A slow or broken Mailchimp never slows the signup ────────────────────────
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
mc = () => new Promise(() => {}); // never answers
const later = [];
let t0 = Date.now();
let r = await signup({ request: post('/api/signup', { first: 'Cy', email: 'cy@example.com', consent: true }), env, waitUntil: (p) => later.push(p) });
ok(r.status === 200 && (await r.json()).ok && Date.now() - t0 < 1000, 'Mailchimp hangs: the signup still answers at once');
ok(later.length === 2, 'the welcome and the Mailchimp sync both run after the reply');
mc = () => { throw new Error('connection reset'); };
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
t0 = Date.now();
r = await signup({ request: post('/api/signup', { first: 'Di', email: 'di@example.com', consent: true }), env, waitUntil: (p) => later.push(p) });
ok(r.status === 200 && Date.now() - t0 < 1000, 'Mailchimp fails: the signup still answers');
await Promise.all(later.slice(2));
ok(/Could not reach Mailchimp: connection reset/.test(logOf(env).at(-1).detail), 'and the failure is logged');

// ── Mentor: the tile, the test join, the backfill ────────────────────────────
mc = () => ({ status: 200, body: '{}' });
env = fresh({ MAILCHIMP_MODE: 'test' });
const mk = async (email, consent) => (await join(env, {}, { email, first: email[0].toUpperCase(), consent })).token;
const synced = await mk('done@example.com', true);
env.DB.raw.prepare("UPDATE student_profile SET mailchimp_status = 'ok' WHERE student_id = ?").run(synced);
const failedBefore = await mk('failed@example.com', true);
env.DB.raw.prepare("UPDATE student_profile SET mailchimp_status = 'failed' WHERE student_id = ?").run(failedBefore);
const noConsent = await mk('no@example.com', false);
const gone = await mk('gone@example.com', true);
env.DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(gone);
const fresh1 = await mk('fresh@example.com', true);
env.DB.raw.prepare('UPDATE student_profile SET mailchimp_status = NULL WHERE student_id = ?').run(fresh1);
const wait = await backfillList(env.DB);
ok(wait.length === 2 && wait.includes(failedBefore) && wait.includes(fresh1), 'backfill: skips no consent, unsubscribed and already synced');
ok(!wait.includes(noConsent) && !wait.includes(gone) && !wait.includes(synced), 'backfill: the right three are left out');
const before = logOf(env).length;
[st, out] = await M(env, { action: 'mc-backfill' });
ok(st === 200 && out.done === 2 && out.test === 2 && mcCalls().length === 0, 'backfill in TEST mode only logs');
ok(logOf(env).length === before + 2, 'backfill: each one logged');
ok(env.DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE kind = 'mentor-mc-backfill'").get().n === 1, 'backfill is logged as a mentor action');
ok(out.left === 0 && (await backfillList(env.DB, 50, 'test')).length === 0, 'TEST mode: once logged, nobody is left waiting');
ok((await backfillList(env.DB, 50, 'api')).length === 2, 'live: the ones only tested are still sent for real');
[st, out] = await M(env, { action: 'mc-test', email: 'alex.test@example.com' });
ok(st === 200 && out.status === 'test' && logOf(env).at(-1).action === 'test-join' && logOf(env).at(-1).email === 'alex.test@example.com', 'test join: logged');
ok((await M(env, { action: 'mc-test', email: 'nope' }))[0] === 400, 'test join needs an email');
const G = await (await mGet({ request: new Request('https://x/api/mentor', { headers: K }), env })).json();
ok(G.mailchimp.mode === 'test' && /Test mode/.test(G.mailchimp.reason) && G.mailchimp.log.length > 0 && G.mailchimp.log.length <= 20, 'GET: mode, reason and the last 20 rows');
ok(G.students.find((s) => s.id === failedBefore).mailchimp_status === 'test', 'the account manager has each founder’s status');
ok((await mPost({ request: new Request('https://x/api/mentor', { method: 'POST', body: JSON.stringify({ action: 'mc-backfill' }) }), env })).status === 401, 'backfill needs the mentor key');

// ── Step tags: one per step reached, cumulative, never inactive ──────────────
const NAMES = ['Link to Lead - The Founder Launchpad', 'Link to Lead - The Boardroom', 'Link to Lead - The LAB', 'Link to Lead - The HUB', 'Link to Lead - The Summit'];
ok(JSON.stringify(TIER_ORDER) === JSON.stringify(SITE_TIERS) && JSON.stringify(TIER_ORDER.map((t) => STEP_TAGS[t])) === JSON.stringify(NAMES), 'STEP_TAGS: the five steps, in the site’s TIER_ORDER');
const stepTags = (tags) => tags.filter((t) => t.name.startsWith('Link to Lead - '));
for (const [i, tier] of TIER_ORDER.entries()) {
  const tg = tagsFor({ source: 'compass', stage: 'growing', weakest: 'lead-the-market', tier });
  const st = stepTags(tg);
  ok(JSON.stringify(st.map((t) => t.name)) === JSON.stringify(NAMES.slice(0, i + 1)) && st.every((t) => t.status === 'active'), `tagsFor ${tier}: its step and every step before it, all active`);
  ok(['linktolead', 'compass', 'grow', 'lead-the-market'].every((n) => tg.some((t) => t.name === n && t.status === 'active')), `tagsFor ${tier}: the existing tags stay`);
}
ok(JSON.stringify(stepTags(tagsFor({})).map((t) => t.name)) === JSON.stringify(NAMES.slice(0, 1)), 'no step yet: The Founder Launchpad');
ok(!TIER_ORDER.some((tier) => stepTags(tagsFor({ tier })).some((t) => t.status !== 'active')), 'a step tag is never sent as inactive');
ok(stepName('premium') === 'The Summit' && stepName('free') === 'The Founder Launchpad', 'display names: the tag without "Link to Lead - "');

// The mentor changes a step: tags at once in API mode, from and to logged.
mc = () => ({ status: 200, body: '{}' });
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
const ana = (await join(env, {})).token;
calls = [];
[st, out] = await M(env, { action: 'tier', student: ana, tier: 'hub' });
let tagCall = mcCalls().at(-1);
ok(st === 200 && out.mailchimp === 'ok' && mcCalls().length === 1 && tagCall.method === 'POST' && /\/members\/[0-9a-f]{32}\/tags$/.test(tagCall.url), 'step change: one tags call to Mailchimp, at once');
ok(JSON.stringify(stepTags(tagCall.body.tags).map((t) => t.name)) === JSON.stringify(NAMES.slice(0, 4)), 'step change to The HUB: Launchpad, Boardroom, LAB and HUB');
calls = [];
[st, out] = await M(env, { action: 'tier', student: ana, tier: 'session' });
tagCall = mcCalls().at(-1);
ok(st === 200 && JSON.stringify(stepTags(tagCall.body.tags).map((t) => t.name)) === JSON.stringify(NAMES.slice(0, 2)), 'lowered to The Boardroom: its two tags are sent');
ok(!tagCall.body.tags.some((t) => t.status === 'inactive' && t.name.startsWith('Link to Lead - ')), 'lowered: the LAB and HUB tags are not removed (nothing inactive)');
const evs = env.DB.raw.prepare("SELECT detail FROM event WHERE student_id = ? AND kind = 'mentor-step' ORDER BY id").all(ana).map((e) => JSON.parse(e.detail));
ok(evs.length === 2 && evs[0].from === 'free' && evs[0].to === 'hub' && evs[1].from === 'hub' && evs[1].to === 'session', 'mentor-step event: from and to');
ok(logOf(env).at(-1).action === 'tags' && logOf(env).at(-1).status === 'ok', 'the tags call is in the Mailchimp log');

// The climb on the founder's page in /mentor.
const one = await (await mGet({ request: new Request('https://x/api/mentor?student=' + ana, { headers: K }), env })).json();
const joinedAt = env.DB.raw.prepare('SELECT joined_at FROM student WHERE id = ?').get(ana).joined_at;
ok(JSON.stringify(one.climb.map((c) => c.name)) === JSON.stringify(['The Founder Launchpad', 'The HUB', 'The Boardroom']) && one.climb[0].at === joinedAt, 'climb: the account (signup date), then each change, oldest first');
const old = climbOf({ joined_at: '2026-10-27T10:00:00Z' }, [{ detail: 'lab', at: '2026-10-28T10:00:00Z' }, { detail: '{"from":"lab","to":"lab"}', at: '2026-10-29T10:00:00Z' }, { detail: 'gold', at: '2026-10-29T11:00:00Z' }]);
ok(JSON.stringify(old.map((c) => [c.name, c.at])) === JSON.stringify([['The Founder Launchpad', '2026-10-27T10:00:00Z'], ['The LAB', '2026-10-28T10:00:00Z']]), 'climb: older events (a bare step) read; no change and unknown steps add no line');

// Form mode cannot tag: the step changes and nothing is sent.
env = fresh();
const bea = (await join(env, {}, { email: 'bea@example.com' })).token;
calls = [];
[st, out] = await M(env, { action: 'tier', student: bea, tier: 'lab' });
ok(st === 200 && out.mailchimp === 'skipped' && mcCalls().length === 0, 'FORM mode: the step changes, no tags are sent');

// The backfill sends step tags to founders already in Mailchimp.
env = fresh({ MAILCHIMP_API_KEY: 'secretkey-us19' });
const early = (await join(env, {}, { email: 'early@example.com' })).token;
env.DB.raw.prepare("UPDATE student SET tier = 'lab' WHERE id = ?").run(early);
env.DB.raw.prepare('UPDATE student_profile SET mailchimp_steps = NULL WHERE student_id = ?').run(early); // joined before step tags
const quiet = (await join(env, {}, { email: 'quiet@example.com', consent: false })).token;
ok(JSON.stringify(await stepsBackfillList(env.DB, 50, 'api')) === JSON.stringify([early]), 'step tags waiting: only founders in Mailchimp, with consent, without them');
let G2 = await (await mGet({ request: new Request('https://x/api/mentor', { headers: K }), env })).json();
ok(G2.mailchimp.waitingTags === 1 && G2.mailchimp.waitingJoin === 0 && G2.mailchimp.waiting === 1, 'the backfill button counts founders waiting for step tags');
calls = [];
[st, out] = await M(env, { action: 'mc-backfill' });
ok(st === 200 && out.done === 0 && out.tagged === 1 && out.tags.ok === 1 && out.left === 0 && mcCalls().length === 1, 'backfill: step tags for the founder already in Mailchimp');
ok(JSON.stringify(stepTags(mcCalls()[0].body.tags).map((t) => t.name)) === JSON.stringify(NAMES.slice(0, 3)) && !mcCalls().some((c) => c.url.includes(md5('quiet@example.com'))), 'backfill: their tags up to The LAB; nobody without consent');
ok((await stepsBackfillList(env.DB, 50, 'api')).length === 0, 'backfill: once sent, nobody waits for step tags');
env = fresh({ MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us19' });
const tst = (await join(env, {}, { email: 'tst@example.com' })).token;
env.DB.raw.prepare('UPDATE student_profile SET mailchimp_steps = NULL WHERE student_id = ?').run(tst);
calls = [];
[st, out] = await M(env, { action: 'mc-backfill' });
ok(st === 200 && out.tagged === 1 && out.tags.test === 1 && mcCalls().length === 0, 'TEST mode: step tags logged, not sent');
ok((await stepsBackfillList(env.DB, 50, 'test')).length === 0 && (await stepsBackfillList(env.DB, 50, 'api')).length === 0, 'TEST mode: the tested one is no longer waiting there');
env.DB.raw.prepare("UPDATE student_profile SET mailchimp_status = 'ok' WHERE student_id = ?").run(tst);
ok((await stepsBackfillList(env.DB, 50, 'api')).length === 1, 'live: step tags only tested are still sent for real');
ok(!calls.some((c) => !/list-manage|api\.mailchimp|api\.resend/.test(c.url)), 'no other network');

done();
