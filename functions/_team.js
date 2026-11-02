// Team accounts (Alexandru, 2 Nov 2026): every Blueprint level open, in any
// order, so Alexandru and the team can read and test the whole programme.
// The ladder is unchanged for every founder.
//
// Matched only on the signed-in account's own email, as stored on the server,
// never on anything a page sends. More addresses, without a code change:
// TEAM_EMAILS in the Cloudflare Pages project settings, comma separated (the
// live site ignores wrangler.toml [vars]).

export const TEAM = ['alex@exploraself.com'];

const norm = (e) => String(e || '').trim().toLowerCase();

/** True when this email belongs to the team. */
export function isTeam(email, env) {
  const e = norm(email);
  if (!e) return false;
  const extra = String((env && env.TEAM_EMAILS) || '').split(',').map(norm).filter(Boolean);
  return [...TEAM.map(norm), ...extra].includes(e);
}
