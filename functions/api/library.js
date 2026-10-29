// A download from the library, for signed-in founders only.
//
// GET ?item=<key>&t=<token> logs a 'library-download' event with the key,
// tags the founder in Mailchimp "Library - <name>" the first time they take
// that item (API mode, after the reply; tags only accumulate), then sends the
// browser on to the file. Without an account it goes to the page that makes
// one. The tag shows on the founder's Mailchimp profile; /mentor lists what
// each founder took and when.

import { bad, db, now, studentBy, accountTables } from '../_shared.js';
import { syncFounder } from '../_mailchimp.js';

/** The downloads: the same keys, names and files as LIBRARY in
 *  public/content.js (a test holds them equal). */
export const LIBRARY_ITEMS = {
  build: { name: 'The Founder’s Blueprint · Building', file: '/library/blueprint-building.pdf' },
  grow: { name: 'The Founder’s Blueprint · Growing', file: '/library/blueprint-growing.pdf' },
  scale: { name: 'The Founder’s Blueprint · Scaling', file: '/library/blueprint-scaling.pdf' },
  btl: { name: 'Built to Lead', file: '/library/built-to-lead.pdf' },
  wb: { name: 'Worth Building', file: '/library/worth-building.pdf' },
};
export const libraryTag = (key) => `Library - ${LIBRARY_ITEMS[key].name}`;

const go = (request, path) => new Response(null, { status: 302, headers: { location: new URL(path, request.url).toString(), 'cache-control': 'no-store' } });

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('item') || '';
  if (!Object.hasOwn(LIBRARY_ITEMS, key)) return bad('There is no such book in the library.', 404);
  const D = db(env);
  if (!D) return bad('The library is not available right now.', 503);
  const me = await studentBy(D, url.searchParams.get('t'));
  if (!me) return go(request, '/compass/welcome#join');
  await accountTables(D);
  const before = await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'library-download' AND detail = ? LIMIT 1").bind(me.id, key).first();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'library-download', now(), key).run();
  if (!before) {
    const job = syncFounder(env, D, me.id, 'tag', { tag: libraryTag(key) }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  return go(request, LIBRARY_ITEMS[key].file);
}
