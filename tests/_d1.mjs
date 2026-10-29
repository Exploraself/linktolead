// A stand-in for Cloudflare D1, on Node's own SQLite (no dependency): the
// live tables as they are, and the same prepare / bind / run / first / all /
// batch calls the routes make. The account tables are left for the routes to
// create, as they do in production.

import { DatabaseSync } from 'node:sqlite';

const LIVE = `
CREATE TABLE student (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT, phone TEXT, stage TEXT,
  tier TEXT DEFAULT 'free', thin_domain TEXT, diag_json TEXT, joined_at TEXT NOT NULL, last_seen_at TEXT,
  mailchimp_sent INTEGER DEFAULT 0, company TEXT);
CREATE TABLE compass (student_id TEXT PRIMARY KEY, stage TEXT, answers_json TEXT, numbers_json TEXT,
  results_json TEXT, flags_json TEXT, updated_at TEXT NOT NULL);
CREATE TABLE event (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, kind TEXT NOT NULL,
  level INTEGER, domain TEXT, at TEXT NOT NULL, detail TEXT);
CREATE TABLE answer (student_id TEXT NOT NULL, stage TEXT NOT NULL, level INTEGER NOT NULL, domain TEXT NOT NULL,
  step INTEGER NOT NULL, body TEXT, updated_at TEXT NOT NULL, PRIMARY KEY (student_id, stage, level, domain, step));
CREATE TABLE sheet (student_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT, updated_at TEXT NOT NULL, PRIMARY KEY (student_id, key));
CREATE TABLE note (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, level INTEGER, domain TEXT, body TEXT NOT NULL,
  status TEXT DEFAULT 'new', reply TEXT, created_at TEXT NOT NULL, answered_at TEXT);`;

export function fakeD1() {
  const db = new DatabaseSync(':memory:');
  db.exec(LIVE);
  const stmt = (sql, args = []) => ({
    sql, args,
    bind: (...a) => stmt(sql, a),
    run: async () => { const r = db.prepare(sql).run(...args); return { meta: { changes: r.changes } }; },
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
  });
  return {
    raw: db,
    prepare: (sql) => stmt(sql),
    batch: async (list) => { const out = []; for (const s of list) out.push(await s.run()); return out; },
  };
}

/** Swap fetch for one that records every email and answers as Resend does.
 *  Anything else (Mailchimp) is offline here: tests/mailchimp.test.mjs fakes it. */
export function fakeResend(ok = true) {
  const sent = [];
  globalThis.fetch = async (url, opts = {}) => {
    if (!String(url).includes('api.resend.com')) return { ok: false, status: 503, headers: new Headers(), text: async () => 'offline in tests' };
    sent.push({ url, body: JSON.parse(opts.body), auth: opts.headers.authorization }); return { ok };
  };
  return sent;
}

export const post = (path, body, ip = '1.2.3.4') => new Request('https://linktolead.exploraself.com' + path, {
  method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify(body),
});
export const get = (path) => new Request('https://linktolead.exploraself.com' + path);

export function tally(name) {
  let passed = 0, failed = 0;
  const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL:', msg); } };
  const done = () => { console.log(`${name}: ${passed} passed, ${failed} failed`); if (failed) process.exit(1); };
  return { ok, done };
}
