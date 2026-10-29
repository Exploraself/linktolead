// Optional passwords. A founder never needs one: the email link always works.
//
// Only a hash is stored: PBKDF2-SHA256 through WebCrypto, 100,000 iterations
// (the most Cloudflare Workers allow), a random 16-byte salt per account, and
// a constant-time compare. Minimum 10 characters; no other rules.

export const ITERATIONS = 100000;
export const MIN_LENGTH = 10;
export const PAUSED = 'This account is paused. Write to support@exploraself.com.';

const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (s) => new Uint8Array((String(s).match(/../g) || []).map((h) => parseInt(h, 16)));

export function newSalt() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return hex(b);
}

/** The hash of a password, as hex. */
export async function hashPassword(password, saltHex, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(password)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations }, key, 256);
  return hex(bits);
}

/** Same length and every character compared, whatever matches first. */
export function sameHex(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function verifyPassword(password, row) {
  if (!row || !row.pass_hash || !row.salt) return false;
  return sameHex(await hashPassword(password, row.salt, row.iterations || ITERATIONS), row.pass_hash);
}

/** Plain reasons a password cannot be saved, or '' when it can. */
export function passwordProblem(password, confirm) {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) return `At least ${MIN_LENGTH} characters, please.`;
  if (password.length > 200) return 'That is longer than we can keep. 200 characters at most.';
  if (confirm !== undefined && confirm !== password) return 'The two passwords are different.';
  return '';
}

/** Set or replace a founder's password. */
export async function setPassword(D, studentId, password) {
  const salt = newSalt();
  const pass_hash = await hashPassword(password, salt);
  await D.prepare(`INSERT INTO account_auth (student_id, pass_hash, salt, iterations, set_at) VALUES (?,?,?,?,?)
      ON CONFLICT(student_id) DO UPDATE SET pass_hash=excluded.pass_hash, salt=excluded.salt, iterations=excluded.iterations, set_at=excluded.set_at`)
    .bind(studentId, pass_hash, salt, ITERATIONS, new Date().toISOString()).run();
}

export const isPaused = async (D, studentId) =>
  !!(await D.prepare('SELECT paused FROM account_auth WHERE student_id = ? AND paused = 1').bind(studentId).first());
