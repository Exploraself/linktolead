// The account: one record for the programme and the Compass together.
//
// Everything still works without it. The page saves to the device first and
// always; the account is a copy that follows the founder between devices and
// lets Alexandru read their work before a session. If the API is missing or
// refuses, nothing breaks and nothing is lost — the device copy stands.

const TOKEN_KEY = 'ftb-token';
const SYNC_EVERY = 20000;

export const token = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
const keep = (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* private mode */ } };
export const joined = () => !!token();

async function post(path, body) {
  const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'That did not go through.');
  return data;
}

/** Join: the five fields (first, last, email, business, phone), plus what the
 *  ten questions worked out. All five must reach the server: it needs the name
 *  to create the record, and Mailchimp rejects a subscriber missing any of
 *  LNAME, COMPANY or PHONE. `name` is still accepted from older callers. */
export async function join({ first, last, name, email, company, phone, stage, thin, diag }) {
  const out = await post('/api/join', { first, last, name, email, company, phone, stage, thin, diag });
  if (out.token) keep(out.token);
  return out;
}

/** Pull the record on arrival, so work follows between devices. */
export async function pull() {
  const t = token();
  if (!t) return null;
  try {
    const r = await fetch(`/api/state?t=${encodeURIComponent(t)}`);
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
  if (!joined()) throw new Error('Join first, so he knows who is asking.');
  return post('/api/note', { token: token(), body, level, domain });
}
