// One tap out. GET from the footer link shows a plain page; POST is the
// one-click unsubscribe mail apps send (List-Unsubscribe-Post).
//
// It stops everything a founder did not ask for in the moment. Results they
// send themselves and sign-in links still arrive, because they asked.

import { db, now, clean, accountTables } from '../_shared.js';
import { syncFounder } from '../_mailchimp.js';

const page = (title, line) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} · ExploraSelf</title>
<style>body{margin:0;background:#FFFDF8;color:#14100B;font:16px/1.6 'Inter',Arial,sans-serif}main{max-width:560px;margin:0 auto;padding:56px 20px}h1{font:500 30px/1.2 Newsreader,Georgia,serif;margin:0 0 12px}a{color:#6E5213}
@media (prefers-color-scheme: dark){body{background:#17130E;color:#F7F2E7}a{color:#E3C47E}}</style></head>
<body><main><h1>${title}</h1><p>${line}</p><p><a href="/compass">Back to the North Star</a></p></main></body></html>`,
  { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

async function out(request, env, waitUntil) {
  const D = db(env);
  if (!D) return page('Not available right now', 'We could not reach the list just now. Try the link again in a few minutes.');
  const u = clean(new URL(request.url).searchParams.get('u'), 80);
  if (u.length >= 20) {
    await accountTables(D);
    const p = await D.prepare('SELECT student_id, unsubscribed FROM student_profile WHERE unsub_id = ?').bind(u).first();
    if (p && !p.unsubscribed) {
      await D.prepare('UPDATE student_profile SET unsubscribed = 1, unsub_at = ? WHERE unsub_id = ?').bind(now(), u).run();
      await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(p.student_id, 'unsubscribed', now()).run();
      // Out of the Mailchimp audience too (API mode; logged in the others).
      const go = syncFounder(env, D, p.student_id, 'unsubscribe').catch(() => {});
      if (typeof waitUntil === 'function') waitUntil(go); else await go;
    }
  }
  // The same page either way: it does not tell anyone whose link this was.
  return page('You are unsubscribed', 'We will not send you anything you did not ask for. If you ask for your results or a sign-in link yourself, that one email still comes.');
}

export const onRequestGet = ({ request, env, waitUntil }) => out(request, env, waitUntil);
export const onRequestPost = ({ request, env, waitUntil }) => out(request, env, waitUntil);
