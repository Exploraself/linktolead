// The join must carry all five fields to /api/join.
//
// It broke twice: first the form read three fields while showing five, then
// account.join() kept only name/email/phone and dropped first, last and the
// business — so the server saw no name and refused every founder. This test
// stubs fetch and checks exactly what leaves the browser.

import { join } from '../public/account.js';

let passed = 0, failed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL:', msg); } };

let sent = null;
globalThis.fetch = async (path, opts) => {
  sent = { path, body: JSON.parse(opts.body) };
  return { ok: true, json: async () => ({ ok: true, token: 't' }) };
};

await join({ first: 'Ana', last: 'Pop', email: 'ana@example.com', company: 'Pop Ltd',
  phone: '123', stage: 'build', thin: 'market', diag: { 0: 1 } });

ok(sent && sent.path === '/api/join', 'posts to /api/join');
for (const k of ['first', 'last', 'email', 'company', 'phone']) {
  ok(sent && sent.body[k], `sends ${k}`);
}
ok(sent.body.first === 'Ana' && sent.body.last === 'Pop', 'first and last arrive unchanged');
ok(sent.body.company === 'Pop Ltd', 'business arrives unchanged');
ok(sent.body.stage === 'build' && sent.body.thin === 'market', 'carries the referee verdict');

// Older callers that send one combined name still work.
await join({ name: 'Ana Pop', email: 'ana@example.com', phone: '1' });
ok(sent.body.name === 'Ana Pop', 'still accepts a combined name');

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
