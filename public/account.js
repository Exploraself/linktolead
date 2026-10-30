// The account: one record for the programme and the Compass together.
//
// Everything still works without it. The page saves to the device first and
// always; the account is a copy that follows the founder between devices and
// lets Alexandru and the team read their work before a session. If the API is
// missing or refuses, nothing breaks and nothing is lost — the device copy
// stands.
//
// The Compass (a plain script) and its sales page load this file with
// import('/account.js'), so there is one token, under one key, for both.

const TOKEN_KEY = 'ftb-token';
const SYNC_EVERY = 20000;

export const token = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
const keep = (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* private mode */ } };
export const joined = () => !!token();

/** The founder's time zone, so each letter wishes them the right part of
 *  the day (morning, afternoon, evening, night). Sent with every request. */
export const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } };

async function post(path, body, keepalive = false) {
  const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, tz: tz() }), keepalive });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'That did not go through.');
  return data;
}

/** Pull the record on arrival, so work follows between devices. { gone: true }
 *  when the account this device remembers no longer exists. */
export async function pull() {
  const t = token();
  if (!t) return null;
  try {
    const r = await fetch(`/api/state?t=${encodeURIComponent(t)}&tz=${encodeURIComponent(tz())}`);
    if (r.status === 404) return { gone: true }; // the account no longer exists
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ── Pushing ──────────────────────────────────────────────────────────────────
// Typing saves to the device instantly. Only what changed is sent, and only
// every twenty seconds or when the page is hidden, which keeps a hundred
// students inside D1's free daily write allowance with room to spare.
let dirtyAnswers = {}, dirtyWork = {}, timer = null, sending = false;

export function touch(kind, key, value) {
  if (!joined()) return;
  (kind === 'work' ? dirtyWork : dirtyAnswers)[key] = value;
  if (!timer) timer = setTimeout(flush, SYNC_EVERY);
}

export async function flush() {
  clearTimeout(timer); timer = null;
  const t = token();
  if (!t || sending) return;
  const answers = dirtyAnswers, work = dirtyWork;
  if (!Object.keys(answers).length && !Object.keys(work).length) return;
  dirtyAnswers = {}; dirtyWork = {}; sending = true;
  try {
    await post('/api/state', { token: t, answers, work });
  } catch {
    // Put them back; the device copy is already safe, so this only delays.
    dirtyAnswers = Object.assign(answers, dirtyAnswers);
    dirtyWork = Object.assign(work, dirtyWork);
  } finally { sending = false; }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  window.addEventListener('pagehide', flush);
}

/** A note to the mentor. Never blocks the founder — they carry on either way. */
export async function note({ body, level, domain }) {
  if (!joined()) throw new Error('Join first, so Alexandru and the team know who is asking.');
  return post('/api/note', { token: token(), body, level, domain });
}

// ── The free account from the Compass ────────────────────────────────────────

/** Create the free account, or find it. `type` is 'full' (company, interest,
 *  industry and a password) or 'simple' (no password, ever). `landing` is the
 *  sales page ('a', 'b', 'c' or 'compass'); `utm` the tags the founder
 *  arrived with. A new email returns a token, kept here. An email that already has an account returns { existing: true } and
 *  no token: that browser signs in by email link instead. */
export async function signup({ first, last, email, industry, consent, source, stage, type, company, noCompany, interest, password, confirm, landing, utm }) {
  const out = await post('/api/signup', { first, last, email, industry, consent, source, stage, type, company, noCompany, interest, password, confirm, landing, utm, token: token() });
  if (out.token) keep(out.token);
  return out;
}

/** Ask for a one-time sign-in link. The reply is the same whether or not the
 *  address has an account. */
export const signinLink = (email, to = 'start', reset = false) => post('/api/signin', { email, to, reset });

/** Sign in with email and password (for founders who set one); keeps the token. */
export async function login(email, password) {
  const out = await post('/api/login', { email, password });
  if (out.token) keep(out.token);
  return out;
}

/** Change the password, once signed in. */
export const setPassword = (password, confirm) => post('/api/password', { token: token(), password, confirm });

/** Notes from Alexandru and the team, and marking one read. */
export async function messages() {
  const t = token();
  if (!t) return null;
  try { const r = await fetch(`/api/messages?t=${encodeURIComponent(t)}`); return r.ok ? await r.json() : null; } catch { return null; }
}
export const messageRead = (id) => post('/api/messages', { token: token(), id });

/** Forget this device's token (sign out). The device copy of the work stays. */
export const signOut = () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ } };

/** "Letters from your mentor": on or off (consent, synced to Mailchimp). */
export const setLetters = (on) => post('/api/letters', { token: token(), on: !!on });

/** Delete the account. `confirm` is the founder's email, typed. On success
 *  this device forgets the account and the work kept on it too. */
export async function deleteAccount(confirm) {
  const out = await post('/api/account-delete', { token: token(), confirm });
  try {
    for (const k of Object.keys(localStorage)) if (/^(ftb-|exploraself-|es-compass|compass)/.test(k)) localStorage.removeItem(k);
  } catch { /* private mode */ }
  signOut();
  return out;
}

/** Spend a sign-in code from the link; keeps the token it returns. */
export async function signinWith(code) {
  const r = await fetch(`/api/signin?code=${encodeURIComponent(code)}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.token) throw new Error(data.error || 'That sign-in link did not work.');
  keep(data.token);
  return data;
}

/** The Compass's copy in the account. `keepalive` lets it go as the page closes. */
export const saveCompass = (payload, keepalive = false) => post('/api/compass', { token: token(), ...payload }, keepalive);
export async function loadCompass() {
  const t = token();
  if (!t) return null;
  try { const r = await fetch(`/api/compass?t=${encodeURIComponent(t)}`); return r.ok ? await r.json() : null; } catch { return null; }
}

/** The Account Plans, in this founder's order. Null when signed out or offline. */
export async function plans() {
  const t = token();
  if (!t) return null;
  try { const r = await fetch(`/api/plans?t=${encodeURIComponent(t)}`); return r.ok ? await r.json() : null; } catch { return null; }
}
export const tick = (step, done) => post('/api/plans/tick', { token: token(), step, done });

/** "Change where I stand": the stage on the account, with the one it replaced. */
export const setStage = (stage, from) => post('/api/stage', { token: token(), stage, from });

/** "Ask Alexandru": the thread (questions and answers, newest last), and
 *  marking the answers read. Questions themselves go through note(). */
export async function thread() {
  const t = token();
  if (!t) return null;
  try { const r = await fetch(`/api/thread?t=${encodeURIComponent(t)}`); return r.ok ? await r.json() : null; } catch { return null; }
}
export const threadRead = () => post('/api/thread', { token: token() });

/** A library download, through the account so it is counted. */
export const libraryHref = (item) => `/api/library?item=${encodeURIComponent(item)}&t=${encodeURIComponent(token())}`;
