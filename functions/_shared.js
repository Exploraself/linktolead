// Shared helpers for the Blueprint's API routes.
//
// Every route answers JSON, never throws a raw error at a visitor, and works
// only when the D1 binding exists — so the site keeps serving normally if the
// database is ever detached.

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const bad = (message, status = 400) => json({ ok: false, error: message }, status);

/** A route cannot run without the database. Say so plainly rather than 500. */
export function db(env) {
  if (!env || !env.DB) return null;
  return env.DB;
}

export const now = () => new Date().toISOString();

/** 24 bytes of randomness, URL-safe. This is the student's key to their own
 *  record — it goes in their link and in their browser, nowhere else. */
export function newToken() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export const clean = (v, max = 400) =>
  typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '';

/** Deliberately permissive: we are not the authority on what an address may
 *  look like, we only refuse what obviously is not one. */
export const looksLikeEmail = (s) => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(s);

/** The mentor routes refuse to answer unless a key is configured AND matches.
 *  No key set means no access, never open access. */
export function mentorOk(request, env) {
  const key = env && env.MENTOR_KEY;
  if (!key) return false;
  const given = request.headers.get('x-mentor-key') || new URL(request.url).searchParams.get('k') || '';
  if (given.length !== key.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

/** SHA-256 as hex. Sign-in codes are stored only this way, never as sent. */
export async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)));
  return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** The tables the account adds. Created here, idempotently, the first time a
 *  route needs them in this isolate — so there is no manual database step and
 *  no ALTER TABLE on the tables that already hold founders' work. */
const READY = new WeakSet();
export async function accountTables(D) {
  if (READY.has(D)) return;
  await D.batch([
    D.prepare(`CREATE TABLE IF NOT EXISTS student_profile (student_id TEXT PRIMARY KEY, industry TEXT,
      consent INTEGER DEFAULT 0, consent_at TEXT, source TEXT, unsub_id TEXT UNIQUE,
      unsubscribed INTEGER DEFAULT 0, unsub_at TEXT)`),
    D.prepare(`CREATE TABLE IF NOT EXISTS signin_code (code_hash TEXT PRIMARY KEY, student_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL, used_at INTEGER)`),
    D.prepare(`CREATE TABLE IF NOT EXISTS plan_tick (student_id TEXT NOT NULL, step_id TEXT NOT NULL,
      done_at TEXT NOT NULL, PRIMARY KEY (student_id, step_id))`),
    D.prepare('CREATE TABLE IF NOT EXISTS mail_log (email TEXT, ip TEXT, at INTEGER)'),
    D.prepare(`CREATE TABLE IF NOT EXISTS account_auth (student_id TEXT PRIMARY KEY, pass_hash TEXT, salt TEXT,
      iterations INTEGER, set_at TEXT, paused INTEGER DEFAULT 0)`),
    D.prepare('CREATE TABLE IF NOT EXISTS auth_log (email TEXT, ip TEXT, at INTEGER)'),
    D.prepare(`CREATE TABLE IF NOT EXISTS message (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, subject TEXT,
      body TEXT NOT NULL, channel TEXT NOT NULL, sent_at TEXT NOT NULL, read_at TEXT)`),
    D.prepare(`CREATE TABLE IF NOT EXISTS mailchimp_log (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL,
      email TEXT, action TEXT NOT NULL, mode TEXT NOT NULL, status TEXT NOT NULL, detail TEXT, at TEXT NOT NULL)`),
  ]);
  // The last Mailchimp sync, the step whose tags it carried, and what the
  // sign-up form asked (functions/_profile.js), on the profile. SQLite cannot add a column "if not exists", so an error here only
  // means it is already there.
  for (const col of ['mailchimp_status TEXT', 'mailchimp_at TEXT', 'mailchimp_steps TEXT', 'signup_type TEXT', 'company TEXT', 'interest TEXT', 'landing TEXT',
      'utm_source TEXT', 'utm_medium TEXT', 'utm_campaign TEXT', 'utm_content TEXT', 'utm_term TEXT']) {
    try { await D.prepare(`ALTER TABLE student_profile ADD COLUMN ${col}`).run(); } catch { /* already there */ }
  }
  // An answer in "Ask Alexandru" is a message that points at the question
  // (a note) it answers.
  try { await D.prepare('ALTER TABLE message ADD COLUMN note_id TEXT').run(); } catch { /* already there */ }
  // The sales pages became roads: landings stored as a, b or c move to the
  // road their page became (functions/_profile.js OLD_LANDINGS).
  await D.prepare(`UPDATE student_profile SET landing = CASE landing WHEN 'b' THEN 'road1' WHEN 'c' THEN 'road2' WHEN 'a' THEN 'road3' END
    WHERE landing IN ('a', 'b', 'c')`).run();
  READY.add(D);
}

/** The founder a token belongs to, or null. */
export async function studentBy(D, token) {
  const t = clean(token, 80);
  if (t.length < 20) return null;
  return D.prepare('SELECT id,email,name,stage,tier FROM student WHERE id = ?').bind(t).first();
}

/** Every table that holds a row for a student, for a full delete. */
export const STUDENT_TABLES = ['answer', 'sheet', 'compass', 'note', 'event', 'student_profile', 'signin_code', 'plan_tick', 'account_auth', 'message', 'mailchimp_log'];
