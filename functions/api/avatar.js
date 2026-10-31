// The founder's profile picture (31 Oct 2026), from the profile menu.
//
// POST { token, image } where image is a small square photo the page has
// already cut and shrunk (192 × 192, JPEG, about 10–30 KB) as a data: URL,
// or '' to remove it. Kept on the founder's profile, returned by /api/state,
// and deleted with the account like everything else on the profile.

import { json, bad, db, clean, accountTables, studentBy } from '../_shared.js';
import { profile } from '../_account.js';

export const MAX = 120_000;
const OK = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Not found.', 404);
  const image = typeof body.image === 'string' ? body.image : '';
  if (image && (image.length > MAX || !OK.test(image))) return bad('That picture could not be used. Try a JPEG or PNG photo.');
  await profile(D, me.id);
  await D.prepare('UPDATE student_profile SET avatar = ? WHERE student_id = ?').bind(image || null, me.id).run();
  return json({ ok: true, avatar: image || '' });
}
