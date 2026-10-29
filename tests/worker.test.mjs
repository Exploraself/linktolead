// worker.js must hand /api/* to functions/api/ and everything else to the
// static files. Without it the live Worker ran no API at all.

import worker, { ROUTES } from '../worker.js';
import { readdirSync } from 'node:fs';

let passed = 0, failed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL:', msg); } };

// Every file in functions/api/ has a route.
for (const f of readdirSync(new URL('../functions/api/', import.meta.url), { recursive: true })) {
  if (!f.endsWith('.js')) continue;
  ok(ROUTES['/api/' + f.replace(/\.js$/, '')], `route for functions/api/${f}`);
}

const env = { ASSETS: { fetch: async () => new Response('<html>page</html>', { status: 200 }) } };
const ctx = { waitUntil() {} };
const call = (path, method = 'GET', body) => worker.fetch(new Request('https://x' + path, { method, body, headers: body ? { 'content-type': 'application/json' } : {} }), env, ctx);

let r = await call('/');
ok((await r.text()).includes('page'), 'pages are served from public/');
r = await call('/api/nothing-here');
ok(r.status === 404 && (await r.json()).ok === false, 'unknown API path answers JSON 404');
r = await call('/api/join', 'POST', '{}');
ok(r.headers.get('content-type').includes('json'), 'join route runs (answers JSON)');
ok(r.status === 503, 'join without the database refuses politely');
r = await call('/api/join', 'DELETE');
ok(r.status === 405, 'wrong method answers 405');
r = await call('/api/state/', 'GET');
ok(r.headers.get('content-type').includes('json'), 'trailing slash still routes');

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
