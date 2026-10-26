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
