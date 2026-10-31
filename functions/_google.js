// "Continue with Google" (31 Oct 2026): Google proves the founder owns the
// email address, so it can open an existing account or make a new one.
//
// The browser gets a signed ID token from Google Identity Services and sends
// it here. Google's own tokeninfo endpoint checks the signature and the expiry;
// we then insist the token was made for OUR client (aud), by Google (iss), for
// a verified address. Nothing from the token is trusted before those checks.
//
// GOOGLE_CLIENT_ID is the public Web client ID from Google Cloud ("Clients",
// ends in .apps.googleusercontent.com). It is not a secret. Set to an empty
// value, the button never shows and POST /api/google refuses.

// The live site runs on Cloudflare Pages, which does not read wrangler.toml's
// [vars], so the public ID is also kept here. A GOOGLE_CLIENT_ID variable,
// where one is set, wins; set it to an empty value to switch the button off.
export const CLIENT_ID = '313189996932-63o1k2imuk2ospi47fnd12ak51oe1pj6.apps.googleusercontent.com';
export const clientId = (env) => (env && typeof env.GOOGLE_CLIENT_ID === 'string' ? env.GOOGLE_CLIENT_ID.trim() : CLIENT_ID);

const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

/** The verified person, or null. `fetchImpl` is for tests. */
export async function verifyGoogle(env, credential, fetchImpl = fetch) {
  const id = clientId(env);
  if (!id || typeof credential !== 'string' || credential.length < 20 || credential.length > 4096) return null;
  const r = await fetchImpl(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`).catch(() => null);
  if (!r || !r.ok) return null;
  const t = await r.json().catch(() => null);
  if (!t || t.aud !== id || !ISSUERS.includes(t.iss)) return null;
  if (!(t.email_verified === true || t.email_verified === 'true')) return null;
  if (!(Number(t.exp) * 1000 > Date.now())) return null;
  const email = String(t.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return null;
  return {
    email,
    first: String(t.given_name || String(t.name || '').split(' ')[0] || '').slice(0, 60),
    last: String(t.family_name || '').slice(0, 60),
    sub: String(t.sub || ''),
  };
}
