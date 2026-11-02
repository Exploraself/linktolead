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
export async function teamAdd(D, email, at) {
  await teamTable(D);
  await D.prepare('INSERT OR IGNORE INTO team_member (email, added_at) VALUES (?,?)').bind(norm(email), at).run();
}
export async function teamRemove(D, email) {
  await teamTable(D);
  await D.prepare('DELETE FROM team_member WHERE email = ?').bind(norm(email)).run();
}
