// The Mailchimp tag list (functions/_tag-list.js, AGENTS.md rule 17): every
// tag the code can add is on it, with plain words for what, where and when;
// the live list in /mentor sorts Mailchimp's tags into Keep / Old / Ask with
// the mentor key only; an address Mailchimp deleted for good is never
// "waiting" or "failed"; and the page draws every tag by name.

import { readFileSync, readdirSync } from 'node:fs';
import { TAG_GROUPS, TAG_LIST, SITE_TAGS, OLD_TAGS, sortTags, oldReason } from '../functions/_tag-list.js';
import { tagsFor, LANDING_TAGS, STEP_TAGS, STAGE_TAGS, WEAKEST_TAGS, CROSS_TAGS, DOMAIN_TAGS, TIER_ORDER, DEFAULT_FORM, backfillList, FORGOTTEN, push } from '../functions/_mailchimp.js';
import { SERIES_TAGS } from '../functions/_series-letters.js';
import { TOOLS_TAG } from '../functions/_tools.js';
import { LIBRARY_ITEMS, libraryTag } from '../functions/api/library.js';
import { page, siteTagIds, unknownSiteTags } from '../scripts/tag-map.mjs';
import { onRequestGet as mentorGet, onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { fakeD1, fakeResend, tally } from './_d1.mjs';

const { ok, done } = tally('tag-map');
const names = new Set(TAG_LIST.map((t) => t.name));

// Every tag the code can add is on the list.
const every = new Set();
for (const landing of [...Object.keys(LANDING_TAGS), '']) for (const tier of TIER_ORDER) for (const stage of ['build', 'grow', 'scale']) for (const weakest of DOMAIN_TAGS) {
  for (const t of tagsFor({ source: landing ? '' : 'compass', landing, tier, stage, weakest })) every.add(t.name);
}
for (const n of [...every, ...Object.values(CROSS_TAGS), ...Object.values(SERIES_TAGS), TOOLS_TAG, ...Object.keys(LIBRARY_ITEMS).map(libraryTag)]) ok(names.has(n), `${n} is on the tag list (functions/_tag-list.js)`);
for (const n of [...Object.values(STEP_TAGS), ...Object.values(STAGE_TAGS), ...Object.values(WEAKEST_TAGS)]) ok(names.has(n), `${n} is on the list`);

// No new kind of tag slips in: every one-tag send names a tag the list knows.
const sends = [];
const walk = (dir) => { for (const f of readdirSync(new URL(dir, import.meta.url))) { const p = `${dir}/${f}`; if (!f.includes('.')) walk(p); else if (f.endsWith('.js')) sends.push([p, readFileSync(new URL(p, import.meta.url), 'utf8')]); } };
walk('../functions');
for (const [p, src] of sends) for (const m of src.matchAll(/syncFounder\([^)]*'tag',\s*\{\s*tag(?::\s*([^}]+))?\s*\}/g)) {
  const expr = (m[1] || 'tag').trim();
  ok(['TOOLS_TAG', 'CROSS_TAGS[to]', 'libraryTag(key)', 'tag'].includes(expr), `${p}: the tag "${expr}" is a kind the list knows (add a new kind to functions/_tag-list.js)`);
}

// The system: lowercase linktolead-… with dashes; "Growth Toolkit" is Alexandru's own name (2 Nov).
for (const t of TAG_LIST) ok(/^linktolead(-[a-z0-9.]+)*$/.test(t.name) || t.name === TOOLS_TAG, `${t.name}: follows the naming system`);

// Plain words for every tag, in a known group, never he/him, no number shown as a name.
const groups = new Set(TAG_GROUPS.map((g) => g.key));
for (const t of [...TAG_LIST, ...SITE_TAGS]) {
  ok(t.what && t.from && t.when && t.by, `${t.name || t.label}: what, where, when and the file are filled in`);
  ok(/^https:\/\//.test(t.from), `${t.name || t.label}: a full link`);
  ok(!/\b(he|him|his)\b/.test(`${t.what} ${t.when}`), `${t.name || t.label}: never he/him`);
}
for (const t of TAG_LIST) ok(groups.has(t.group), `${t.name}: a known group`);
for (const t of SITE_TAGS) ok(t.label && !/\d{6}/.test(t.label), `${t.label}: a form named in words, never a number`);
ok(SITE_TAGS.some((t) => t.id === DEFAULT_FORM.tag), 'the Link to Lead form tag is on the list');
for (const id of ['3359640', '3359642', '3359647', '3359648', '3359649', '3359651', '3359652', DEFAULT_FORM.tag]) ok(SITE_TAGS.some((t) => t.id === id), `form tag ${id} is never marked safe to delete`);

// Nothing in use is ever called old.
for (const n of [...names, 'Assessment 2 weektest', 'Leadionaire winner', 'linktolead-road2.1']) ok(!oldReason(n), `${n} is not an old name`);
ok(oldReason('Interest - More free time') && oldReason('industry - coaching') && oldReason('Landing - Road 1') && oldReason('salespageincubator2') && oldReason('Link to Lead - The LAB'), 'old prefixes match, whatever the case');
ok(oldReason('build') && oldReason('lead-your-people') && oldReason('sales-page') && oldReason('mentor-test') && oldReason('TOOLS'), 'old exact names match');
ok(!oldReason('building') && !oldReason('lead-your-people-2'), 'an exact name matches only itself');

// Sorting what Mailchimp has.
const S = sortTags([
  { id: 1, name: 'linktolead', count: 9 }, { id: 3359640, name: 'LAB buyers', count: 4 }, { id: 2, name: 'Interest - Coaching', count: 2 },
  { id: 3, name: 'build', count: 1 }, { id: 4, name: 'VIP list', count: 3 }, { id: 5, name: 'linktolead-road2.1', count: 1 }, { id: 6, name: 'Assessment 2 weektest', count: 0 },
], { kept: ['linktolead-road2.1'] });
ok(S.keep.map((t) => t.name).join('|') === 'linktolead|LAB buyers|linktolead-road2.1|Assessment 2 weektest', 'keep: by name, by form number, a kept page tag, a planned form tag');
ok(S.keep.find((t) => t.name === 'LAB buyers').what.startsWith('The LAB'), 'a form tag is shown by its Mailchimp name, with the form it comes from');
ok(S.old.map((t) => t.name).join('|') === 'Interest - Coaching|build', 'old: safe to delete, most people first');
ok(S.ask.map((t) => t.name).join('|') === 'VIP list', 'ask: not made by the code');
ok(S.notYet.includes(TOOLS_TAG) && !S.notYet.includes('linktolead'), 'notYet: the names Mailchimp does not have yet');

// The page: every tag by name, the forms in words, no internal folder name.
const html = page({ unknown: [], checked: true });
for (const t of TAG_LIST) ok(html.includes(`${t.name}</span>`), `${t.name} is on the page`);
for (const t of SITE_TAGS) ok(html.includes(t.label.replace(/&/g, '&amp;')), `${t.label} is on the page`);
ok(!/x-[0-9a-f]{12,}/.test(html), 'the page never names the internal folder');
ok(/noindex/.test(html) && /AGENTS\.md rule 17/.test(html), 'noindex, and the rule is named');
ok(unknownSiteTags(new Map([['3359640', new Set(['a.ts'])], ['9999999', new Set(['b.ts'])]])).map((u) => u.id).join() === '9999999', 'a form tag the list does not describe is caught');
ok(siteTagIds('').size === 0, 'no exploraself repo: nothing to check');

// The live list in /mentor: the key only, sorted, and plain when Mailchimp is not reachable.
const sent = fakeResend();
const DB = fakeD1();
const KEY = 'k'.repeat(24);
const env = { DB, MENTOR_KEY: KEY, MAILCHIMP_API_KEY: 'abc-us8', MAILCHIMP_MODE: 'test' };
const B = 'https://linktolead.exploraself.com';
const req = (path, { method = 'GET', body, key, token } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}), ...(token ? { 'x-account-token': token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
const jsonOf = async (r) => [r.status, await r.json()];
const sheba = (await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first: 'Sheba', last: 'T', email: 'sheba.partner@example.com', consent: false, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env: { DB, MENTOR_KEY: KEY } })))[1].token;
await mentorPost({ request: req('/api/mentor', { method: 'POST', key: KEY, body: { action: 'team-add', email: 'sheba.partner@example.com' } }), env });
let seen = '';
const resend = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (String(url).includes('api.mailchimp.com')) { seen = String(url); return { ok: true, status: 200, json: async () => ({ segments: [{ id: 1, name: 'linktolead', member_count: 3 }, { id: 2, name: 'Signup - Full', member_count: 2 }], total_items: 2 }) }; }
  return resend(url, opts);
};
let [st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?tags=1', { token: sheba }), env }));
ok(st === 403, 'a team account cannot read the Mailchimp tags');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?tags=1', { key: KEY }), env }));
ok(st === 200 && j.read && j.keep.length === 1 && j.old.length === 1 && j.old[0].name === 'Signup - Full', 'with the key: read and sorted');
ok(/us8\.api\.mailchimp\.com\/3\.0\/lists\/[^/]+\/segments\?type=static/.test(seen) && /fields=/.test(seen), 'reads the static segments (the tags), with their names and counts');
globalThis.fetch = async (url, opts) => (String(url).includes('api.mailchimp.com') ? { ok: false, status: 401, json: async () => ({}) } : resend(url, opts));
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?tags=1', { key: KEY }), env }));
ok(st === 200 && j.read === false && /HTTP 401/.test(j.why), 'Mailchimp says no: a plain reason, nothing breaks');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?tags=1', { key: KEY }), env: { DB, MENTOR_KEY: KEY } }));
ok(j.read === false && /MAILCHIMP_API_KEY/.test(j.why), 'no API key: says so');

// Deleted for good in Mailchimp: "forgotten", never failed, never waiting, never tagged.
globalThis.fetch = async (url, opts) => (String(url).includes('api.mailchimp.com')
  ? { ok: false, status: 400, headers: new Headers(), text: async () => JSON.stringify({ title: 'Forgotten Email Not Subscribed', detail: 'x was permanently deleted and cannot be re-imported.' }) } : resend(url, opts));
const out = await push({ MAILCHIMP_API_KEY: 'abc-us8', MAILCHIMP_AUDIENCE_ID: 'aud' }, { email: 'gone@example.com', first: 'G' }, 'join');
ok(out.status === 'forgotten' && out.detail === FORGOTTEN && /Not a bug/.test(out.detail), 'a permanently deleted address is "forgotten", in plain words');
DB.raw.exec(`INSERT INTO student (id, email, name, joined_at) VALUES ('g1', 'old@example.com', 'Old', '2026-10-30')`);
DB.raw.exec(`INSERT INTO student_profile (student_id, consent, mailchimp_status) VALUES ('g1', 1, 'failed')`);
DB.raw.exec(`INSERT INTO mailchimp_log (student_id, email, action, mode, status, detail, at) VALUES ('g1', 'old@example.com', 'join', 'api', 'failed', 'Mailchimp API said no (HTTP 400): Forgotten Email Not Subscribed: old@example.com was permanently deleted', '2026-10-31')`);
ok(!(await backfillList(DB, 50, 'api')).includes('g1'), 'logged before 2 Nov as a failed join: not waiting any more');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { key: KEY }), env }));
ok(j.mailchimp.forgotten.includes('old@example.com') && j.mailchimp.forgottenWhy === FORGOTTEN, 'the roster names it, so /mentor says it plainly');
const src = readFileSync(new URL('../public/mentor/mentor.js', import.meta.url), 'utf8');
ok(/!gone\(last\.email\)/.test(src), 'no red "Last call failed" for an address Mailchimp deleted for good');
ok(/data\.you && data\.you\.key \? '[^']*<section class="panel" id="mctags">/.test(src), 'the tags box shows only with the mentor key');
ok(sent !== null, 'mail faked');

done();
