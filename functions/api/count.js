// The sales pages' drop-off counter (1 Nov). Only counts: which page, which
// moment (seen, scrolled a quarter, mirror finished, button tapped, form
// opened…), per day. No cookie, no IP, no founder, nothing personal: one row
// per day, page and moment, and a number that goes up. Read by /mentor (the
// mentor key) as GET /api/count?days=14.
//
// The biggest drop between two moments is the next thing to fix
// (01 START HERE §12).

import { json, bad, db, mentorOk } from '../_shared.js';

export const PAGES = ['road1', 'road3', 'road4'];
export const MOMENTS = ['view', 's25', 's50', 's75', 's100', 'mirror_start', 'mirror_done', 'mini_done', 'cost_moved', 'cta', 'form_open', 'form_simple', 'form_full', 'pain_match', 'back'];
const day = () => new Date().toISOString().slice(0, 10);
const READY = new WeakSet();
async function table(D) {
  if (READY.has(D)) return;
  await D.prepare('CREATE TABLE IF NOT EXISTS page_count (day TEXT NOT NULL, page TEXT NOT NULL, moment TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, page, moment))').run();
  READY.add(D);
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return json({ ok: true, counted: false });
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const page = PAGES.includes(body && body.page) ? body.page : null;
  const moments = (Array.isArray(body && body.moments) ? body.moments : [body && body.moment]).filter((m) => MOMENTS.includes(m)).slice(0, 8);
  if (!page || !moments.length) return bad('Unknown page or moment.');
  await table(D);
  const d = day();
  await D.batch([...new Set(moments)].map((m) => D.prepare('INSERT INTO page_count (day, page, moment, n) VALUES (?, ?, ?, 1) ON CONFLICT (day, page, moment) DO UPDATE SET n = n + 1').bind(d, page, m)));
  return json({ ok: true, counted: true });
}

export async function onRequestGet({ request, env }) {
  if (!mentorOk(request, env)) return bad('Not allowed.', 403);
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  await table(D);
  const days = Math.min(90, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 14));
  const since = new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10);
  const { results } = await D.prepare('SELECT page, moment, SUM(n) AS n FROM page_count WHERE day >= ? GROUP BY page, moment').bind(since).all();
  const out = {};
  for (const p of PAGES) out[p] = Object.fromEntries(MOMENTS.map((m) => [m, 0]));
  for (const r of results || []) if (out[r.page] && r.moment in out[r.page]) out[r.page][r.moment] = Number(r.n) || 0;
  return json({ ok: true, since, days, pages: out });
}
