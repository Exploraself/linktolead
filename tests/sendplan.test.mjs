// The Compass "Send it by email" route.
//
// It must stay off until Alexandru adds the email-service key, must escape what
// visitors type, and must refuse a fourth send to the same address in an hour.

import { onRequestGet, onRequestPost } from '../functions/api/send-plan.js';

let passed = 0, failed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL:', msg); } };

// A tiny stand-in for D1: just enough for mail_log.
function fakeDB() {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      let args = [];
      const st = {
        bind: (...a) => { args = a; return st; },
        run: async () => {
          if (sql.startsWith('INSERT')) rows.push({ email: args[0], ip: args[1], at: args[2] });
          if (sql.startsWith('DELETE')) for (let i = rows.length - 1; i >= 0; i--) if (rows[i].at < args[0]) rows.splice(i, 1);
          return {};
        },
        first: async () => {
          const [email, ip, after] = args;
          const recent = rows.filter((r) => r.at > after);
          return { e: recent.filter((r) => r.email === email).length, i: recent.filter((r) => r.ip === ip).length };
        },
      };
      return st;
    },
  };
}

const req = (body) => new Request('https://x/api/send-plan', {
  method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4' }, body: JSON.stringify(body),
});

// Off by default.
let r = await onRequestGet({ env: {} });
ok((await r.json()).ready === false, 'not ready without a key');
r = await onRequestPost({ request: req({ email: 'a@b.co' }), env: {} });
ok(r.status === 503, 'refuses to send without a key');

// On, with a stubbed email service.
const env = { RESEND_API_KEY: 'test', MAIL_FROM: 'ExploraSelf <compass@example.com>', DB: fakeDB() };
r = await onRequestGet({ env });
ok((await r.json()).ready === true, 'ready once both settings exist');

let sent = null;
globalThis.fetch = async (url, opts) => { sent = { url, body: JSON.parse(opts.body) }; return { ok: true }; };

r = await onRequestPost({ request: req({ email: 'not-an-email' }), env });
ok(r.status === 400, 'rejects a broken address');

const plan = { name: '<b>Ana</b>', stage: 'Building', focus: 'x', domains: [{ know: 'Know yourself', lead: 'Lead yourself', label: 'Start here', strengthen: ['q'], steps: ['<script>alert(1)</script>'], level: 'Level 01 · Count your week' }], evil: 'dropped' };
r = await onRequestPost({ request: req({ email: 'Ana@Example.com', plan }), env });
ok(r.status === 200, 'sends a valid plan');
ok(sent && sent.url === 'https://api.resend.com/emails', 'uses the email service');
ok(sent.body.to[0] === 'ana@example.com', 'sends only to the typed address');
ok(!sent.body.html.includes('<script>') && sent.body.html.includes('&lt;script&gt;'), 'escapes visitor text');
ok(!sent.body.html.includes('<b>Ana</b>'), 'escapes the name');
ok(!JSON.stringify(sent.body).includes('dropped'), 'drops unknown fields');
ok(sent.body.html.includes('linktolead.exploraself.com/start'), 'points on to Link to Lead');

await onRequestPost({ request: req({ email: 'ana@example.com', plan }), env });
await onRequestPost({ request: req({ email: 'ana@example.com', plan }), env });
r = await onRequestPost({ request: req({ email: 'ana@example.com', plan }), env });
ok(r.status === 429, 'a fourth send to one address in an hour is refused');

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
