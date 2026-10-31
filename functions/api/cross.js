// Crossing between the two doors (31 Oct 2026). One account opens both the
// North Star and the Blueprint. The first time a founder who came in through
// one opens the other, the page asks one plain question (31 Oct: one tap,
// nothing to type): open it with your account? Yes records the crossing.
// That confirmation is kept as an event and tagged in Mailchimp, so Alexandru
// can see and manage the founders who cross:
//   linktolead-crossed-blueprint   came in through the North Star, opened the Blueprint
//   linktolead-crossed-northstar   came in through the Blueprint, opened the North Star
// POST { token, to: 'blueprint' | 'northstar', first?, last? }. Once per door.

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';
import { syncFounder, CROSS_TAGS } from '../_mailchimp.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Not found.', 404);
  const to = body.to === 'northstar' ? 'northstar' : body.to === 'blueprint' ? 'blueprint' : '';
  if (!to) return bad('Which door?');
  const first = clean(body.first, 60), last = clean(body.last, 60);
  if (first) await D.prepare('UPDATE student SET name = ? WHERE id = ?').bind([first, last].filter(Boolean).join(' '), me.id).run();
  const done = await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'crossed' AND detail = ? LIMIT 1").bind(me.id, to).first();
  if (done) return json({ ok: true, to, already: true });
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'crossed', now(), to).run();
  const go = syncFounder(env, D, me.id, 'tag', { tag: CROSS_TAGS[to] }).catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(go); else await go;
  return json({ ok: true, to });
}
