// The Worker's front door.
//
// Cloudflare serves everything in public/ directly. Only /api/* and the old
// sales-page addresses come here (see run_worker_first in wrangler.toml); each /api path is handed to its file
// in functions/api/, called the same way Cloudflare Pages Functions would call
// it: onRequestGet / onRequestPost with { request, env, waitUntil }.
//
// Without this file the Worker was "static assets only": no route in
// functions/ ever ran on the live site, and no binding (the database, the
// Resend key) could attach. Wrangler bundles this on deploy — still no build
// step and no package.json.

import { json } from './functions/_shared.js';
import { redirect } from './functions/_landing.js';
import * as state from './functions/api/state.js';
import * as compass from './functions/api/compass.js';
import * as note from './functions/api/note.js';
import * as mentor from './functions/api/mentor.js';
import * as sendPlan from './functions/api/send-plan.js';
import * as signup from './functions/api/signup.js';
import * as signin from './functions/api/signin.js';
import * as unsubscribe from './functions/api/unsubscribe.js';
import * as plans from './functions/api/plans.js';
import * as planTick from './functions/api/plans/tick.js';
import * as login from './functions/api/login.js';
import * as password from './functions/api/password.js';
import * as messages from './functions/api/messages.js';
import * as library from './functions/api/library.js';
import * as stage from './functions/api/stage.js';
import * as thread from './functions/api/thread.js';
import * as letters from './functions/api/letters.js';
import * as accountDelete from './functions/api/account-delete.js';

/** One line per route. A new file in functions/api/ needs its line here. */
export const ROUTES = {
  '/api/state': state,
  '/api/compass': compass,
  '/api/note': note,
  '/api/mentor': mentor,
  '/api/send-plan': sendPlan,
  '/api/signup': signup,
  '/api/signin': signin,
  '/api/unsubscribe': unsubscribe,
  '/api/plans': plans,
  '/api/plans/tick': planTick,
  '/api/login': login,
  '/api/password': password,
  '/api/messages': messages,
  '/api/library': library,
  '/api/stage': stage,
  '/api/thread': thread,
  '/api/letters': letters,
  '/api/account-delete': accountDelete,
};

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname.replace(/\/+$/, '');
    // The old sales-page addresses: a 302 to their road, query string kept.
    const moved = redirect(request);
    if (moved) return moved;
    const route = ROUTES[path];
    if (!route) {
      if (path.startsWith('/api/')) return json({ ok: false, error: 'Not found.' }, 404);
      return env.ASSETS.fetch(request);
    }
    const m = request.method.toUpperCase();
    const handler = route[`onRequest${m.charAt(0)}${m.slice(1).toLowerCase()}`] || route.onRequest;
    if (!handler) return json({ ok: false, error: 'Method not allowed.' }, 405);
    try {
      return await handler({
        request, env, params: {},
        waitUntil: (p) => ctx && ctx.waitUntil(p),
        next: () => env.ASSETS.fetch(request),
      });
    } catch (err) {
      console.error(path, err && err.stack || err);
      return json({ ok: false, error: 'Something went wrong on our side. Your work is still in this browser.' }, 500);
    }
  },
};
