// Team accounts (Alexandru, 2 Nov 2026): every Blueprint level open, in any
// order, so Alexandru and the team can read and test the whole programme.
// The ladder is unchanged for every founder.
//
// Matched only on the signed-in account's own email, as stored on the server,
// never on anything a page sends. More addresses, without a code change:
// TEAM_EMAILS in the Cloudflare Pages project settings, comma separated (the
// live site ignores wrangler.toml [vars]).

// Alexandru's two addresses (2 Nov 2026): the mentor inbox, and the one his
// founder account was made with (reset letters reached sales@ on 31 Oct).
export const TEAM = ['alex@exploraself.com', 'sales@exploraself.com'];

const norm = (e) => String(e || '').trim().toLowerCase();

/** True when this email belongs to the team. */
export function isTeam(email, env) {
  const e = norm(email);
  if (!e) return false;
  const extra = String((env && env.TEAM_EMAILS) || '').split(',').map(norm).filter(Boolean);
  return [...TEAM.map(norm), ...extra].includes(e);
}

// ── Team members added in /mentor (Alexandru, 2 Nov 2026) ───────────────────
// Sheba and anyone else Alexandru adds by their exact address, once, in the
// Team box of /mentor (only with the mentor key). Never matched on part of a
// name: anyone can make an address with a name in it.
export async function teamTable(D) {
  await D.prepare('CREATE TABLE IF NOT EXISTS team_member (email TEXT PRIMARY KEY, added_at TEXT NOT NULL)').run();
}

/** True for the built-in team, TEAM_EMAILS, and the addresses added in /mentor. */
export async function isTeamMember(D, email, env) {
  const e = norm(email);
  if (!e) return false;
  if (isTeam(e, env)) return true;
  if (!D) return false;
  await teamTable(D);
  return !!(await D.prepare('SELECT 1 AS x FROM team_member WHERE email = ?').bind(e).first());
}

/** Everyone on the team, and where each one comes from. */
export async function teamList(D, env) {
  await teamTable(D);
  const out = TEAM.map((email) => ({ email, from: 'built in' }));
  for (const email of String((env && env.TEAM_EMAILS) || '').split(',').map(norm).filter(Boolean)) {
    if (!out.some((x) => x.email === email)) out.push({ email, from: 'Cloudflare settings' });
  }
  const rows = (await D.prepare('SELECT email, added_at FROM team_member ORDER BY added_at').all()).results || [];
  for (const r of rows) if (!out.some((x) => x.email === r.email)) out.push({ email: r.email, from: 'added in /mentor', at: r.added_at, removable: true });
  return out;
}
/** What /mentor shows for each team member (Alexandru, 2 Nov 2026): their
 *  name from their own free account (no mentor profile), whether that
 *  account exists yet, when they were last active, and what they did in
 *  /mentor (the 'team-did' events, logged only when an action succeeded). */
export const DID_WORDS = { message: ['letter', 'letters'], reply: ['answer', 'answers'], tier: ['step change', 'step changes'],
  'series-hold': ['pause or resume', 'pauses or resumes'], 'signin-link': ['sign-in link', 'sign-in links'], 'reset-link': ['reset link', 'reset links'],
  pause: ['account pause', 'account pauses'], delete: ['founder deleted', 'founders deleted'], 'mentor-save': ['mentor profile saved', 'mentor profiles saved'],
  'mentor-assign': ['mentor chosen', 'mentors chosen'], 'mc-test': ['Mailchimp test', 'Mailchimp tests'], 'mc-backfill': ['Mailchimp send', 'Mailchimp sends'],
  'team-add': ['member added', 'members added'], 'team-remove': ['member removed', 'members removed'], 'team-can': ['rights change', 'rights changes'],
  invite: ['founder invited', 'founders invited'], 'book-confirm': ['call confirmed', 'calls confirmed'], 'book-links': ['booking link saved', 'booking links saved'] };

// ── What each team member may do (Alexandru, 2 Nov 2026: "choose per team
// member what they can do … access like me on everything") ─────────────────
// Every /mentor right, in his words, in the order of the tick boxes. A new
// member starts with DEFAULT_RIGHTS (what every team member could do before);
// Alexandru (or a member with the 'team' right) ticks more, up to Everything.
// The mentor key always has every right, and nothing a member does can take
// it away. Alexandru's own addresses (TEAM) always have every right too.
export const TEAM_RIGHTS = [
  ['reply', 'Answer founders’ questions'],
  ['message', 'Write letters and notes to founders'],
  ['signin-link', 'Send sign-in links'],
  ['reset-link', 'Send password reset links'],
  ['series-hold', 'Pause or resume a founder’s letters'],
  ['tier', 'Change a founder’s step (unlock)'],
  ['pause', 'Pause or unpause a founder’s account'],
  ['delete', 'Delete a founder'],
  ['mentors', 'Mentor profiles, and a founder’s mentor'],
  ['mailchimp', 'Mailchimp tools and the tag list'],
  ['payments', 'See the payments (Stripe)'],
  ['team', 'Change the team and what each member can do'],
  ['invite', 'Invite a founder at any step, free'],
];
export const ALL_RIGHTS = TEAM_RIGHTS.map(([k]) => k);
export const DEFAULT_RIGHTS = ['reply', 'message', 'signin-link', 'reset-link', 'series-hold', 'tier'];
/** Which right each /mentor action needs. An action not here is the key's only. */
export const ACTION_RIGHT = { reply: 'reply', message: 'message', 'signin-link': 'signin-link', 'reset-link': 'reset-link',
  'series-hold': 'series-hold', tier: 'tier', pause: 'pause', delete: 'delete', 'mentor-save': 'mentors', 'mentor-assign': 'mentors',
  'mc-test': 'mailchimp', 'mc-backfill': 'mailchimp', 'team-add': 'team', 'team-remove': 'team', 'team-can': 'team', invite: 'invite',
  // A request for a call (functions/_booking.js): confirming a time sends a
  // letter, and the Google Meet links are what those letters carry.
  'book-confirm': 'message', 'book-links': 'message' };

async function rightsTable(D) {
  await D.prepare('CREATE TABLE IF NOT EXISTS team_right (email TEXT PRIMARY KEY, can TEXT NOT NULL, at TEXT)').run();
}
/** True for Alexandru's own built-in addresses: every right, always. */
export const isOwner = (email) => TEAM.map(norm).includes(norm(email));
/** This member's rights: everything for Alexandru's own addresses, else what
 *  was ticked for them, else DEFAULT_RIGHTS. Only rights that exist. */
export async function rightsOf(D, email) {
  if (isOwner(email)) return [...ALL_RIGHTS];
  await rightsTable(D);
  const row = await D.prepare('SELECT can FROM team_right WHERE email = ?').bind(norm(email)).first();
  if (!row) return [...DEFAULT_RIGHTS];
  let list = [];
  try { list = JSON.parse(row.can); } catch { list = []; }
  return ALL_RIGHTS.filter((k) => Array.isArray(list) && list.includes(k));
}
/** Save a member's rights (only known ones, in the tick-box order). */
export async function setRights(D, email, can, at) {
  await rightsTable(D);
  const list = ALL_RIGHTS.filter((k) => Array.isArray(can) && can.includes(k));
  await D.prepare('INSERT INTO team_right (email, can, at) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET can = excluded.can, at = excluded.at')
    .bind(norm(email), JSON.stringify(list), at).run();
  return list;
}
export async function teamDetails(D, list) {
  const out = [];
  for (const m of list) {
    const acct = await D.prepare('SELECT id, name, joined_at, last_seen_at FROM student WHERE email = ?').bind(norm(m.email)).first();
    const did = {};
    if (acct) {
      const rows = (await D.prepare("SELECT detail FROM event WHERE student_id = ? AND kind = 'team-did'").bind(acct.id).all()).results || [];
      for (const r of rows) { let a = ''; try { a = JSON.parse(r.detail).action; } catch { a = ''; } if (DID_WORDS[a]) did[a] = (did[a] || 0) + 1; }
    }
    out.push({ ...m, name: acct ? String(acct.name || '').trim() : '', account: !!acct, lastSeen: acct ? acct.last_seen_at || acct.joined_at : null, did,
      can: await rightsOf(D, m.email), owner: isOwner(m.email) });
  }
  return out;
}
export async function teamAdd(D, email, at) {
  await teamTable(D);
  await D.prepare('INSERT OR IGNORE INTO team_member (email, added_at) VALUES (?,?)').bind(norm(email), at).run();
}
export async function teamRemove(D, email) {
  await teamTable(D);
  await rightsTable(D);
  await D.prepare('DELETE FROM team_member WHERE email = ?').bind(norm(email)).run();
  await D.prepare('DELETE FROM team_right WHERE email = ?').bind(norm(email)).run();
}
