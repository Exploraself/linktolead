// Mailchimp, from the server only. A founder who makes an account with consent
// also lands in the Link to Lead audience.
//
// Three modes, chosen only by settings in Cloudflare:
//   TEST  MAILCHIMP_MODE = "test": the exact request is built and logged, and
//         nothing is sent.
//   FORM  the default: the public Link to Lead sign-up form (or the form in
//         MAILCHIMP_FORM_URL). Best effort: a refusal is logged, never shown.
//   API   MAILCHIMP_API_KEY is set (a secret): the members API, which can tag,
//         update and unsubscribe, and does not need the form's fields.
//
// The five DEFAULT ids below come from the public embed form, the same values
// any visitor's browser sends. They are not credentials. No API key belongs in
// this file or anywhere in the repo.
//
// Nobody is sent without consent, given from the browser that holds their
// record (functions/api/signup.js keeps that rule). Unsubscribing, a pause or
// a delete makes the member "unsubscribed" in API mode, never a hard delete.

import { now } from './_shared.js';

export const DEFAULT_FORM = { host: 'exploraselfmba.us8.list-manage.com', server: 'us8', u: 'ab5e056ba759e867cde44f4da', id: '41448b6750', f_id: '005a1ae1f0', tag: '3359661' };

/* ── The tag system (Alexandru, 30 Oct 2026) ─────────────────────────────
 * Every Link to Lead tag is lowercase "linktolead-<group>-<value>", joined
 * with dashes, so a tag says what it is without explaining:
 *   linktolead                        every Link to Lead founder
 *   linktolead-road1 … -northstar     where they signed up (LANDING_TAGS)
 *   linktolead-step-launchpad …       each step reached; they add up (STEP_TAGS)
 *   linktolead-stage-building …       their stage now (STAGE_TAGS)
 *   linktolead-weakest-people …       the North Star side that needs them first
 *   linktolead-library-built-to-lead  a book taken from the library
 * Facts about the person (industry, interest, company) are contact fields,
 * never tags. Change a name here only with Alexandru: he keeps a system. */

/** The four domains in the North Star's own order: the keys the code uses. */
export const DOMAIN_TAGS = ['lead-yourself', 'lead-your-people', 'lead-your-business', 'lead-the-market'];
/** …and the Mailchimp tag for each, as the side that needs them first. */
export const WEAKEST_TAGS = {
  'lead-yourself': 'linktolead-weakest-yourself', 'lead-your-people': 'linktolead-weakest-people',
  'lead-your-business': 'linktolead-weakest-business', 'lead-the-market': 'linktolead-weakest-market',
};
export const STAGE_TAGS = { build: 'linktolead-stage-building', grow: 'linktolead-stage-growing', scale: 'linktolead-stage-scaling' };

/** One tag per programme step, keyed by the tier values the site already
 *  uses ('premium' is The Summit). In the ladder's order: a founder carries
 *  the tag of their step and of every step before it. */
export const STEP_TAGS = {
  free: 'linktolead-step-launchpad',
  session: 'linktolead-step-boardroom',
  lab: 'linktolead-step-lab',
  hub: 'linktolead-step-hub',
  premium: 'linktolead-step-summit',
};
/** Each step's name for people (the mentor page, letters). */
export const STEP_NAMES = { free: 'The Founder Launchpad', session: 'The Boardroom', lab: 'The LAB', hub: 'The HUB', premium: 'The Summit' };
/** Bumped when the tag system changes, so the mentor page's "send the tags"
 *  button moves every founder onto the new names once. */
export const TAGS_VERSION = 'v2';
/** The same order as TIER_ORDER in public/content.js (a test holds them equal). */
export const TIER_ORDER = Object.keys(STEP_TAGS);
/** A step's name for people. */
export const stepName = (tier) => STEP_NAMES[tier] || STEP_NAMES.free;
const PROGRAMME = { building: 'build', growing: 'grow', scaling: 'scale', leading: 'scale', build: 'build', grow: 'grow', scale: 'scale', lead: 'scale' };

const text = (v) => (typeof v === 'string' ? v.trim() : '');

/** Read u, id, f_id and the usX server from a form link
 *  (…list-manage.com/subscribe/post?u=…&id=…). Null when it is not one. */
export function parseFormUrl(link) {
  let url;
  try { url = new URL(text(link)); } catch { return null; }
  const server = (/\.(us\d+)\.list-manage\.com$/.exec(url.hostname) || [])[1];
  const u = url.searchParams.get('u'), id = url.searchParams.get('id');
  if (!server || !u || !id) return null;
  return { host: url.hostname, server, u, id, f_id: url.searchParams.get('f_id') || '', tag: url.searchParams.get('tags') || DEFAULT_FORM.tag };
}

/** Which mode, whether it will actually send, and what is missing, in plain
 *  words. The same shape as mailState in _mail.js. */
export function mailchimpState(env = {}) {
  const custom = text(env.MAILCHIMP_FORM_URL);
  const form = custom ? parseFormUrl(custom) : DEFAULT_FORM;
  const hasKey = !!env.MAILCHIMP_API_KEY;
  const optin = text(env.MAILCHIMP_DOUBLE_OPTIN).toLowerCase() === 'yes';
  if (text(env.MAILCHIMP_MODE).toLowerCase() === 'test') {
    return { mode: 'test', ready: false, form, optin, audience: text(env.MAILCHIMP_AUDIENCE_ID) || (form && form.id) || '', reason: 'Test mode: MAILCHIMP_MODE is "test", so each join is built and logged here, and nothing is sent to Mailchimp.' };
  }
  if (hasKey) {
    const audience = text(env.MAILCHIMP_AUDIENCE_ID) || (form && form.id) || '';
    if (!audience) return { mode: 'api', ready: false, form, optin, reason: 'The API key is set, but there is no audience: set MAILCHIMP_AUDIENCE_ID, or fix MAILCHIMP_FORM_URL.' };
    return { mode: 'api', ready: true, form, optin, audience, reason: optin ? 'Live API. New members get Mailchimp’s confirmation email first (double opt-in).' : 'Live API.' };
  }
  if (!form) return { mode: 'form', ready: false, form: null, optin, reason: 'MAILCHIMP_FORM_URL is not a Mailchimp form link (…list-manage.com/subscribe/post?u=…&id=…).' };
  return { mode: 'form', ready: true, form, optin,
    reason: 'Form mode: joins go through the public sign-up form. It cannot add tags or unsubscribe anyone, and Mailchimp refuses the join if the form requires a field the account box does not ask for. The API key (MAILCHIMP_API_KEY) removes both limits.' };
}

/** The Mailchimp tag for each sales page (the landing key stored on the
 *  profile): /road1/, /north3/ (the North Star sales page) and /road3/ (the 12
 *  Scrolls page). Founders tagged before the roads keep their old tags. */
/** Which sales page a founder signed up on (Alexandru, 30 Oct 2026). The old
 *  names ('Landing - Road 1' …) are sent as inactive, so a founder whose tags
 *  are sent again loses the old one (API mode). */
export const LANDING_TAGS = { road1: 'linktolead-road1', road2: 'linktolead-road2', road21: 'linktolead-road2.1', road3: 'linktolead-road3', road4: 'linktolead-road4', compass: 'linktolead-northstar', summit: 'linktolead-summit' };

/** The tags for one founder. In API mode each stage and domain tag is sent as
 *  active or inactive, so a founder who moves on loses the old one. Step tags
 *  only accumulate: the founder's step and every step before it, always
 *  active and never sent as inactive, so a step lowered by mistake takes
 *  nothing away. */
export function tagsFor({ source, stage, weakest, tier, signupType, interest, industry, landing }) {
  const st = PROGRAMME[stage] || null;
  const out = [{ name: 'linktolead', status: 'active' }];
  // Where they signed up: the page they used, or the North Star box.
  const door = Object.hasOwn(LANDING_TAGS, landing) ? landing : !landing && source === 'compass' ? 'compass' : null;
  if (door) out.push({ name: LANDING_TAGS[door], status: 'active' });
  const reached = Math.max(0, TIER_ORDER.indexOf(tier || 'free'));
  for (const t of TIER_ORDER.slice(0, reached + 1)) out.push({ name: STEP_TAGS[t], status: 'active' });
  if (st) for (const [k, name] of Object.entries(STAGE_TAGS)) out.push({ name, status: k === st ? 'active' : 'inactive' });
  if (weakest) for (const d of DOMAIN_TAGS) out.push({ name: WEAKEST_TAGS[d], status: d === weakest ? 'active' : 'inactive' });
  return out;
}

/** The weakest North Star domain as a tag: the lowest answered score, a tie going
 *  to the first in order (the same rule as the Base Camp). Null until every
 *  domain has an answer, which is when the North Star counts as done. */
export function weakestTag(resultsJson) {
  let r;
  try { r = typeof resultsJson === 'string' ? JSON.parse(resultsJson) : resultsJson; } catch { return null; }
  const scores = r && Array.isArray(r.scores) ? r.scores : [], answered = r && Array.isArray(r.answered) ? r.answered : [];
  if ([0, 1, 2, 3].some((i) => !(answered[i] > 0) || !Number.isFinite(scores[i]))) return null;
  let low = 0;
  for (let i = 1; i < 4; i++) if (scores[i] < scores[low]) low = i;
  return DOMAIN_TAGS[low];
}

/** Everything that would go to Mailchimp for one action, built without
 *  sending, so TEST mode can log it exactly. */
export function buildRequest(st, member, action) {
  const email = String(member.email || '').trim().toLowerCase();
  if (st.mode === 'api' || (st.mode === 'test' && member.asApi)) {
    const server = apiServer(member.key, st);
    const base = `https://${server}.api.mailchimp.com/3.0/lists/${st.audience || (st.form && st.form.id)}/members/${md5(email)}`;
    if (action === 'unsubscribe') {
      return [{ method: 'PUT', url: `${base}?skip_merge_validation=true`, body: { email_address: email, status_if_new: 'unsubscribed', status: 'unsubscribed' } }];
    }
    // One tag on its own ('tag': a library download), or the founder's whole set.
    if (action === 'tag') return [{ method: 'POST', url: `${base}/tags`, body: { tags: [{ name: member.tag, status: 'active' }] } }];
    const tags = { method: 'POST', url: `${base}/tags`, body: { tags: tagsFor(member) } };
    // 'tags' also refreshes the contact fields, so moving everyone onto the
    // tag system fills Industry and Interest for founders who joined before.
    if (action === 'tags') {
      const f = fieldsFor(member);
      return Object.keys(f).length ? [{ method: 'PATCH', url: `${base}?skip_merge_validation=true`, body: { merge_fields: f } }, tags] : [tags];
    }
    // 'resubscribe': the founder turned letters back on. Someone who once
    // unsubscribed can only come back through Mailchimp's own confirmation
    // email, so the status is 'pending'. setLetters sends it only for a
    // founder who had unsubscribed.
    return [{ method: 'PUT', url: `${base}?skip_merge_validation=true`,
      body: { email_address: email, status_if_new: st.optin ? 'pending' : 'subscribed', ...(action === 'resubscribe' ? { status: 'pending' } : {}),
        // COMPANY is a field of the Link to Lead audience (its sign-up form asks for it).
        merge_fields: { FNAME: member.first || '', LNAME: member.last || '', ...fieldsFor(member) } } }, tags];
  }
  const f = st.form || DEFAULT_FORM;
  const q = new URLSearchParams({ u: f.u, id: f.id, EMAIL: email, FNAME: member.first || '', LNAME: member.last || '', tags: f.tag || DEFAULT_FORM.tag });
  if (f.f_id) q.set('f_id', f.f_id);
  q.set(`b_${f.u}_${f.id}`, ''); // the form's honeypot: present and empty
  return [{ method: 'GET', url: `https://${f.host}/subscribe/post-json?${q}` }];
}

/** Facts about the founder, as contact fields (never tags). COMPANY is
 *  already a field of the audience; INDUSTRY and INTEREST are made by
 *  ensureFields the first time they are needed. */
export const EXTRA_FIELDS = [{ tag: 'INDUSTRY', name: 'Industry' }, { tag: 'INTEREST', name: 'Interest' }];
export function fieldsFor(member) {
  return { ...(member.company ? { COMPANY: member.company } : {}), ...(member.industry ? { INDUSTRY: member.industry } : {}), ...(member.interest ? { INTEREST: member.interest } : {}) };
}

/** Make sure the audience has the INDUSTRY and INTEREST fields: one look,
 *  then one creation per missing field, once per running copy of the site.
 *  Never throws; a field it could not make is simply left out of the send. */
let fieldsReady = null;
async function ensureFields(st, key) {
  if (fieldsReady) return fieldsReady;
  const server = apiServer(key, st), list = `https://${server}.api.mailchimp.com/3.0/lists/${st.audience}/merge-fields`;
  const headers = { authorization: 'Basic ' + btoa('linktolead:' + key), 'content-type': 'application/json', 'user-agent': 'exploraself-linktolead' };
  const have = new Set();
  try {
    const r = await fetch(`${list}?count=100&fields=merge_fields.tag`, { headers });
    if (r.ok) for (const f of ((await r.json()).merge_fields || [])) have.add(f.tag);
    for (const f of EXTRA_FIELDS) {
      if (have.has(f.tag)) continue;
      const c = await fetch(list, { method: 'POST', headers, body: JSON.stringify({ tag: f.tag, name: f.name, type: 'text', public: false, required: false }) });
      if (c.ok) have.add(f.tag);
    }
  } catch { /* Mailchimp unreachable: send without the new fields */ }
  if (EXTRA_FIELDS.every((f) => have.has(f.tag))) fieldsReady = have;
  return have;
}

/** API keys end in -usX: that is the server. */
function apiServer(key, st) {
  const m = /-(us\d+)$/.exec(text(key));
  return m ? m[1] : (st.form && st.form.server) || DEFAULT_FORM.server;
}

async function apiKey(env) {
  const k = env.MAILCHIMP_API_KEY;
  if (typeof k === 'string') return k.trim();
  try { return k && typeof k.get === 'function' ? String(await k.get()).trim() : ''; } catch { return ''; }
}

/** A form reply, in plain words. */
export function readFormReply(status, contentType, body, sent = {}) {
  const m = /\{[\s\S]*\}/.exec(body || '');
  let out = null;
  try { out = m ? JSON.parse(m[0]) : null; } catch { out = null; }
  if (!out || !out.result) {
    const snippet = String(body || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
    return { ok: false, why: `Mailchimp sent a reply that is not the form’s answer (HTTP ${status}${contentType ? ', ' + contentType : ''}): “${snippet || 'empty'}”. This is usually a bot check on the public form. The API key avoids it.` };
  }
  if (out.result === 'success' || /already subscribed/i.test(out.msg || '')) return { ok: true, why: /already subscribed/i.test(out.msg || '') ? 'Already in the audience.' : '' };
  const msg = String(out.msg || 'refused').replace(/<[^>]*>/g, '').slice(0, 200);
  if (/enter a value|required|is missing/i.test(msg)) {
    const missing = [!sent.LNAME && 'LNAME', 'COMPANY', 'PHONE'].filter(Boolean).join(' / ');
    return { ok: false, why: `Mailchimp says a required field is missing: ${missing}. The account box does not ask for them. Untick “Required” for them in Mailchimp, or add the API key. (Mailchimp: “${msg}”)` };
  }
  return { ok: false, why: `Mailchimp refused it: “${msg}”` };
}

/**
 * Send one action for one member. Resolves to { status: 'ok'|'test'|'failed',
 * detail, request }, never throws: a list that will not take someone must
 * never cost them their account.
 */
export async function push(env, member, action = 'join') {
  const st = mailchimpState(env);
  const key = st.mode === 'api' ? await apiKey(env) : '';
  if (st.mode === 'test') {
    const req = buildRequest(st, { ...member, asApi: !!env.MAILCHIMP_API_KEY, key: env.MAILCHIMP_API_KEY ? await apiKey(env) : '' }, action);
    // The exact request, as it would go: method, address with its query, body.
    return { status: 'test', detail: `Not sent (test mode): ${req.map((r) => `${r.method} ${r.url}${r.body ? ' ' + JSON.stringify(r.body) : ''}`).join(' · ')}`, request: req };
  }
  if (!st.ready) return { status: 'failed', detail: st.reason };
  if (st.mode === 'form' && action !== 'join' && action !== 'resubscribe') {
    return { status: 'failed', detail: action === 'unsubscribe'
      ? 'Not sent: the public form cannot unsubscribe anyone. Unsubscribe them in Mailchimp, or add the API key.'
      : 'Not sent: the public form cannot change tags. The API key can.' };
  }
  if (st.mode === 'api' && !key) return { status: 'failed', detail: 'The API key (MAILCHIMP_API_KEY) could not be read.' };
  let req = buildRequest(st, { ...member, key }, action);
  // INDUSTRY and INTEREST must exist in the audience before a contact can carry them.
  if (st.mode === 'api' && (member.industry || member.interest) && action !== 'unsubscribe' && action !== 'tag') {
    const have = await ensureFields(st, key);
    req = req.map((r) => (r.body && r.body.merge_fields ? { ...r, body: { ...r.body, merge_fields: Object.fromEntries(Object.entries(r.body.merge_fields).filter(([k]) => !EXTRA_FIELDS.some((f) => f.tag === k) || have.has(k))) } } : r));
  }
  try {
    for (const r of req) {
      const headers = { 'user-agent': 'exploraself-linktolead' };
      if (st.mode === 'api') { headers.authorization = 'Basic ' + btoa('linktolead:' + key); headers['content-type'] = 'application/json'; }
      const res = await fetch(r.url, { method: r.method, headers, body: r.body ? JSON.stringify(r.body) : undefined });
      const body = await res.text();
      if (st.mode === 'form') {
        const q = new URL(r.url).searchParams;
        const out = readFormReply(res.status, res.headers && res.headers.get ? res.headers.get('content-type') : '', body, { LNAME: q.get('LNAME') });
        return { status: out.ok ? 'ok' : 'failed', detail: out.why, request: req };
      }
      if (!res.ok) {
        let why = '';
        try { const j = JSON.parse(body); why = [j.title, j.detail].filter(Boolean).join(': '); } catch { why = body.slice(0, 160); }
        return { status: 'failed', detail: `Mailchimp API said no (HTTP ${res.status}): ${why || 'no reason given'}`.slice(0, 300), request: req };
      }
    }
    return { status: 'ok', detail: action === 'unsubscribe' ? 'Unsubscribed in Mailchimp.' : '', request: req };
  } catch (e) {
    return { status: 'failed', detail: `Could not reach Mailchimp: ${String((e && e.message) || e).slice(0, 160)}`, request: req };
  }
}

/** One row in the log, and the last status on the profile. */
export async function record(D, { studentId, email, action, mode, status, detail }) {
  await D.prepare('INSERT INTO mailchimp_log (student_id, email, action, mode, status, detail, at) VALUES (?,?,?,?,?,?,?)')
    .bind(studentId, email || '', action, mode, status, (detail || '').slice(0, 1500), now()).run();
  if (studentId && studentId !== 'mentor') {
    await D.prepare('UPDATE student_profile SET mailchimp_status = ?, mailchimp_at = ? WHERE student_id = ?').bind(status, now(), studentId).run();
  }
}

/**
 * Sync one founder: 'join' (new account, or consent given), 'resubscribe'
 * (letters turned back on: Mailchimp asks them to confirm), 'tags' (North Star
 * done, a step or stage changed; API mode only), 'tag' (one more tag, `tag`,
 * such as a library download; API mode only) or 'unsubscribe' (unsubscribed,
 * paused, deleted).
 * Joins and tags need consent and no unsubscribe; an unsubscribe is sent only
 * for someone who once gave consent, so nobody else is ever named to Mailchimp.
 */
export async function syncFounder(env, D, studentId, action = 'join', { keepLog = true, tag = '' } = {}) {
  const s = await D.prepare('SELECT id, email, name, stage, tier FROM student WHERE id = ?').bind(studentId).first();
  if (!s) return { status: 'skipped', detail: 'No such founder.' };
  const p = await D.prepare('SELECT consent, unsubscribed, source, signup_type, company, interest, industry, landing FROM student_profile WHERE student_id = ?').bind(studentId).first();
  if (!p || !p.consent) return { status: 'skipped', detail: 'No consent.' };
  if (action !== 'unsubscribe') {
    if (p.unsubscribed) return { status: 'skipped', detail: 'Unsubscribed.' };
    const paused = await D.prepare('SELECT paused FROM account_auth WHERE student_id = ? AND paused = 1').bind(studentId).first();
    if (paused) return { status: 'skipped', detail: 'Paused.' };
  }
  const st = mailchimpState(env);
  if ((action === 'tags' || action === 'tag') && st.mode === 'form') return { status: 'skipped', detail: 'Form mode does not tag.' };
  if (action === 'tag' && !tag) return { status: 'skipped', detail: 'No tag.' };
  const c = await D.prepare('SELECT stage, results_json FROM compass WHERE student_id = ?').bind(studentId).first();
  // A stage the founder chose on /start wins over the North Star's.
  const chose = await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'stage-change' LIMIT 1").bind(studentId).first();
  const [first, ...rest] = String(s.name || '').split(' ');
  const member = { email: s.email, first, last: rest.join(' '), source: p.source || 'compass',
    stage: (chose && s.stage) || (c && c.stage) || s.stage, weakest: c ? weakestTag(c.results_json) : null, tier: s.tier || 'free', tag,
    signupType: p.signup_type, interest: p.interest, industry: p.industry, company: p.company, landing: p.landing };
  const out = await push(env, member, action);
  if (keepLog) await record(D, { studentId, email: s.email, action, mode: st.mode, status: out.status, detail: out.detail });
  // Which step's tags went with it, so the backfill knows who still needs
  // them. A test only marks it as tested ("test:<step>"), so going live
  // still sends them for real; it never overwrites a real send.
  if ((action === 'join' || action === 'resubscribe' || action === 'tags') && canTag(env) && (out.status === 'ok' || out.status === 'test')) {
    const tier = `${TAGS_VERSION}:${member.tier}`;
    await D.prepare(out.status === 'ok'
      ? 'UPDATE student_profile SET mailchimp_steps = ? WHERE student_id = ?'
      : "UPDATE student_profile SET mailchimp_steps = CASE WHEN mailchimp_steps = ?1 THEN mailchimp_steps ELSE 'test:' || ?1 END WHERE student_id = ?2")
      .bind(tier, studentId).run();
  }
  return out;
}

/** Whether tags can go at all: API mode, or TEST mode with a key (which logs
 *  the API request). The public form cannot tag. */
export function canTag(env = {}) {
  const st = mailchimpState(env);
  return (st.mode === 'api' && st.ready) || (st.mode === 'test' && !!env.MAILCHIMP_API_KEY);
}

/** The mentor's test join, for an address Alexandru types himself. */
export async function testJoin(env, D, { email, first, last }) {
  const st = mailchimpState(env);
  const out = await push(env, { email, first, last, source: 'mentor-test' }, 'join');
  await record(D, { studentId: 'mentor', email, action: 'test-join', mode: st.mode, status: out.status, detail: out.detail });
  return out;
}

/** Everyone with consent, not unsubscribed, not paused and not yet synced.
 *  In TEST mode a founder already logged as a test counts as done, so the
 *  button empties; once live, those are sent for real. */
export async function backfillList(D, limit = 50, mode = 'form') {
  const done = mode === 'test' ? "('ok','test')" : "('ok')";
  const rows = await D.prepare(`SELECT s.id FROM student s JOIN student_profile p ON p.student_id = s.id
      LEFT JOIN account_auth au ON au.student_id = s.id
    WHERE p.consent = 1 AND COALESCE(p.unsubscribed, 0) = 0 AND COALESCE(au.paused, 0) = 0
      AND COALESCE(p.mailchimp_status, '') NOT IN ${done}
    ORDER BY s.joined_at LIMIT ?`).bind(limit).all();
  return (rows.results || []).map((r) => r.id);
}

/** Founders already in the audience whose step tags have not been sent for
 *  the step they are on now: everyone who joined before the step tags
 *  existed, and anyone whose step changed while a send failed. Same consent,
 *  unsubscribe and pause rules as backfillList. */
export async function stepsBackfillList(D, limit = 50, mode = 'api') {
  const inAudience = mode === 'test' ? "('ok','test')" : "('ok')";
  // Done means: sent for this step, in the current tag system (TAGS_VERSION).
  const now_ = `'${TAGS_VERSION}:' || COALESCE(s.tier, 'free')`;
  const done = mode === 'test'
    ? `(p.mailchimp_steps = ${now_} OR p.mailchimp_steps = 'test:' || ${now_})`
    : `p.mailchimp_steps = ${now_}`;
  const rows = await D.prepare(`SELECT s.id FROM student s JOIN student_profile p ON p.student_id = s.id
      LEFT JOIN account_auth au ON au.student_id = s.id
    WHERE p.consent = 1 AND COALESCE(p.unsubscribed, 0) = 0 AND COALESCE(au.paused, 0) = 0
      AND COALESCE(p.mailchimp_status, '') IN ${inAudience} AND NOT COALESCE(${done}, 0)
    ORDER BY s.joined_at LIMIT ?`).bind(limit).all();
  return (rows.results || []).map((r) => r.id);
}

// MD5, which Mailchimp uses to name a member (the hash of the lowercase
// email). Workers' WebCrypto has no MD5 everywhere, so it is written out here.
export function md5(str) {
  const b = new TextEncoder().encode(str);
  const n = ((b.length + 8) >> 6) + 1, w = new Uint32Array(n * 16);
  for (let i = 0; i < b.length; i++) w[i >> 2] |= b[i] << ((i % 4) * 8);
  w[b.length >> 2] |= 0x80 << ((b.length % 4) * 8);
  w[n * 16 - 2] = b.length * 8;
  const K = [], S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let o = 0; o < w.length; o += 16) {
    let a = a0, bb = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) { f = (bb & c) | (~bb & d); g = i; }
      else if (i < 32) { f = (d & bb) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = bb ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (bb | ~d); g = (7 * i) % 16; }
      const t = d; d = c; c = bb;
      const x = (a + f + K[i] + w[o + g]) >>> 0, s = S[(i >> 4) * 4 + (i % 4)];
      bb = (bb + ((x << s) | (x >>> (32 - s)))) >>> 0; a = t;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + bb) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  return [a0, b0, c0, d0].map((v) => [0, 8, 16, 24].map((s) => ((v >>> s) & 255).toString(16).padStart(2, '0')).join('')).join('');
}
