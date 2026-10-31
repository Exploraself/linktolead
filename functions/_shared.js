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
    // What a founder writes in the Massive Growth Plan, one row per blank
    // (functions/api/growth-plan.js; blank ids in functions/_growth.js).
    D.prepare(`CREATE TABLE IF NOT EXISTS growth_word (student_id TEXT NOT NULL, blank_id TEXT NOT NULL,
      text TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (student_id, blank_id))`),
    D.prepare('CREATE TABLE IF NOT EXISTS mail_log (email TEXT, ip TEXT, at INTEGER)'),
    D.prepare(`CREATE TABLE IF NOT EXISTS account_auth (student_id TEXT PRIMARY KEY, pass_hash TEXT, salt TEXT,
      iterations INTEGER, set_at TEXT, paused INTEGER DEFAULT 0)`),
    D.prepare('CREATE TABLE IF NOT EXISTS auth_log (email TEXT, ip TEXT, at INTEGER)'),
    D.prepare(`CREATE TABLE IF NOT EXISTS message (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, subject TEXT,
      body TEXT NOT NULL, channel TEXT NOT NULL, sent_at TEXT NOT NULL, read_at TEXT)`),
    D.prepare(`CREATE TABLE IF NOT EXISTS video_comment (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, stage TEXT NOT NULL,
      level INTEGER NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL, hidden INTEGER DEFAULT 0)`),
    D.prepare(`CREATE TABLE IF NOT EXISTS mailchimp_log (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL,
      email TEXT, action TEXT NOT NULL, mode TEXT NOT NULL, status TEXT NOT NULL, detail TEXT, at TEXT NOT NULL)`),
  ]);
  // The last Mailchimp sync, the step whose tags it carried, and what the
  // sign-up form asked (functions/_profile.js), on the profile. SQLite cannot add a column "if not exists", so an error here only
  // means it is already there.
  for (const col of ['mailchimp_status TEXT', 'mailchimp_at TEXT', 'mailchimp_steps TEXT', 'signup_type TEXT', 'company TEXT', 'interest TEXT', 'landing TEXT',
      'utm_source TEXT', 'utm_medium TEXT', 'utm_campaign TEXT', 'utm_content TEXT', 'utm_term TEXT',
      // The founder's mentor (functions/_mentor.js) and their time zone.
      'mentor_id TEXT', 'tz TEXT',
      // The founder's profile picture, a small data: URL (functions/api/avatar.js).
      'avatar TEXT',
      // The landing tag a founder already carries when their page was renamed
      // after they joined (see the move below): sent instead of the new one.
      'landing_tag TEXT']) {
    try { await D.prepare(`ALTER TABLE student_profile ADD COLUMN ${col}`).run(); } catch { /* already there */ }
  }
  // An answer in "Ask Alexandru" is a message that points at the question
  // (a note) it answers.
  try { await D.prepare('ALTER TABLE message ADD COLUMN note_id TEXT').run(); } catch { /* already there */ }
  // The sales pages became roads: landings stored as a, b or c move to the
  // road their page became (functions/_profile.js OLD_LANDINGS).
  await D.prepare(`UPDATE student_profile SET landing = CASE landing WHEN 'b' THEN 'road1' WHEN 'c' THEN 'north3' WHEN 'a' THEN 'road3' END
    WHERE landing IN ('a', 'b', 'c')`).run();
  // The move never stops an account from opening: if it fails, it runs
  // again the next time the database opens.
  try { await northMove(D); } catch (e) { console.error('landing move', e && e.message); }
  READY.add(D);
}

/** The North Star sales pages get their own landing keys (31 Oct 2026). Until
 *  then /north3/ sent 'road2' and /north2/ sent 'road21'; now /road2/ is a
 *  Blueprint page. Every founder stored as 'road2' or 'road21' before this
 *  move came from a North Star page, so they become 'north3' / 'north2' and
 *  stay North Star (origin, welcome, /mentor). Their Mailchimp tag does not
 *  change: the tag they already carry is kept in landing_tag and sent instead
 *  of the new one.
 *  The first time it runs it writes a dated row to `migration`; it moves only
 *  founders who joined before that moment, so a sign-up on the new /road2/ is
 *  never moved. One more guard: an old /north3/ tab still open after the
 *  deploy sends 'road2' with source 'sales-page', which the new /road2/ never
 *  sends (it sends 'home'); that founder is North Star too, and moves the
 *  next time the database opens. Nobody is moved twice: after the move their
 *  landing is no longer 'road2' or 'road21'. */
export const NORTH_MOVE = 'landing-north-2026-10-31';
async function northMove(D) {
  await D.prepare('CREATE TABLE IF NOT EXISTS migration (name TEXT PRIMARY KEY, at TEXT NOT NULL)').run();
  await D.prepare('INSERT OR IGNORE INTO migration (name, at) VALUES (?, ?)').bind(NORTH_MOVE, now()).run();
  const { at } = await D.prepare('SELECT at FROM migration WHERE name = ?').bind(NORTH_MOVE).first();
  await D.prepare(`UPDATE student_profile
    SET landing_tag = COALESCE(landing_tag, CASE landing WHEN 'road2' THEN 'linktolead-road2' ELSE 'linktolead-road2.1' END),
        landing = CASE landing WHEN 'road2' THEN 'north3' ELSE 'north2' END
    WHERE landing = 'road21'
       OR (landing = 'road2' AND (source = 'sales-page' OR student_id IN (SELECT id FROM student WHERE joined_at < ?)))`).bind(at).run();
}

/** The founder a token belongs to, or null. */
export async function studentBy(D, token) {
  const t = clean(token, 80);
  if (t.length < 20) return null;
  return D.prepare('SELECT id,email,name,stage,tier FROM student WHERE id = ?').bind(t).first();
}

/** Every table that holds a row for a student, for a full delete. */
export const STUDENT_TABLES = ['answer', 'sheet', 'compass', 'note', 'event', 'student_profile', 'signin_code', 'plan_tick', 'growth_word', 'account_auth', 'message', 'mailchimp_log', 'video_comment'];
