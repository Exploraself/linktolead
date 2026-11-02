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

import { redirect } from './functions/_landing.js';
import * as state from './functions/api/state.js';
import * as compass from './functions/api/compass.js';
import * as note from './functions/api/note.js';
import * as comments from './functions/api/comments.js';
import * as mentor from './functions/api/mentor.js';
import * as sendPlan from './functions/api/send-plan.js';
import * as signup from './functions/api/signup.js';
import * as signin from './functions/api/signin.js';
import * as unsubscribe from './functions/api/unsubscribe.js';
import * as plans from './functions/api/plans.js';
import * as planTick from './functions/api/plans/tick.js';
import * as growthPlan from './functions/api/growth-plan.js';
import * as login from './functions/api/login.js';
import * as password from './functions/api/password.js';
import * as messages from './functions/api/messages.js';
import * as library from './functions/api/library.js';
import * as stage from './functions/api/stage.js';
import * as thread from './functions/api/thread.js';
import * as letters from './functions/api/letters.js';
import * as avatar from './functions/api/avatar.js';
import * as cross from './functions/api/cross.js';
import * as complete from './functions/api/complete.js';
import * as accountDelete from './functions/api/account-delete.js';
import * as count from './functions/api/count.js';
import * as google from './functions/api/google.js';
import * as tools from './functions/api/tools.js';
import * as course from './functions/api/course.js';
import * as toolkit from './functions/api/toolkit.js';
import { sendDue } from './functions/_course.js';
import { sendDue as sendSeries } from './functions/_series.js';
import { json, db, accountTables } from './functions/_shared.js';

/** One line per route. A new file in functions/api/ needs its line here. */
export const ROUTES = {
  '/api/state': state,
  '/api/compass': compass,
  '/api/note': note,
  '/api/comments': comments,
  '/api/mentor': mentor,
  '/api/send-plan': sendPlan,
  '/api/signup': signup,
  '/api/signin': signin,
  '/api/unsubscribe': unsubscribe,
  '/api/plans': plans,
  '/api/plans/tick': planTick,
  '/api/growth-plan': growthPlan,
  '/api/login': login,
  '/api/password': password,
  '/api/messages': messages,
  '/api/library': library,
  '/api/stage': stage,
  '/api/thread': thread,
  '/api/letters': letters,
  '/api/avatar': avatar,
  '/api/cross': cross,
  '/api/complete': complete,
  '/api/account-delete': accountDelete,
  '/api/count': count,
  '/api/google': google,
  '/api/tools': tools,
  '/api/course': course,
  '/api/toolkit': toolkit,
};

/** The jobs the hourly cron runs (wrangler.toml [triggers]), in this order.
 *  One line per job; each gets (env, D) and must never throw. The letters
 *  that follow each pain (functions/_series.js; nothing while SERIES_MODE is
 *  off) go first: they keep their own day, and a founder gets at most one
 *  automatic letter a day, so 12 Days (functions/_course.js), which shifts by
 *  a day when one is missed, waits for tomorrow. */
export const JOBS = {
  'series-letters': (env, D) => sendSeries(env, D),
  'course-letters': (env, D) => sendDue(env, D),
};

/** Every job, one after the other; one failing never stops the next. */
export async function runJobs(env) {
  const D = db(env);
  if (!D) return {};
  await accountTables(D);
  const out = {};
  for (const [name, job] of Object.entries(JOBS)) {
    try { out[name] = await job(env, D); } catch (err) { out[name] = { error: String(err && err.message || err) }; console.error('job', name, err && err.stack || err); }
  }
  return out;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runJobs(env));
  },
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
