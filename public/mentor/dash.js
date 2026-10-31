// The mentor cockpit's arithmetic: counts from the real roster only, the
// groups, the next action for each founder, the funnel and the filters.
// Loaded by /mentor alone, never by a founder's page. Pure functions, so the
// tests can hold every number. An empty count is 0, never a sample.

export const STEP_KEYS = ['free', 'session', 'lab', 'hub', 'premium'];
export const STEP_NAMES = { free: 'Founder Launchpad', session: 'The Boardroom', lab: 'LAB', hub: 'HUB', premium: 'The Summit' };
/** The short step names the cockpit's chips and rows use. */
export const STEP_SHORT = { free: 'Launchpad', session: 'Boardroom', lab: 'LAB', hub: 'HUB', premium: 'Summit' };
const PAID = ['lab', 'hub', 'premium'];
const DAY = 86400000;

const seen = (s) => Date.parse(s.last_seen_at || s.joined_at || 0) || 0;
const joined = (s) => Date.parse(s.joined_at || 0) || 0;
const tierOf = (s) => (STEP_KEYS.includes(s.tier) ? s.tier : 'free');
/** Quiet: not seen for 14 days or more. */
export const isQuiet = (s, now = Date.now()) => now - seen(s) >= 14 * DAY;
export const isNew = (s, now = Date.now()) => now - joined(s) < 7 * DAY;
/** Days since they were last seen (or joined), whole days. */
export const quietDays = (s, now = Date.now()) => Math.max(0, Math.floor((now - seen(s)) / DAY));

// ── The groups ────────────────────────────────────────────────────────────────
// North Star done = their North Star is saved (compass_at). Blueprint started =
// at least one answer written in the Blueprint (written, or levels).

export const nsDone = (s) => !!(s && s.compass_at);
export const bpStarted = (s) => Number(s && s.written) > 0 || Number(s && s.levels) > 0;
export const GROUPS = {
  ns: { name: 'North Star only', what: 'Did the North Star, never opened the Blueprint.', act: 'Invite to the Launchpad' },
  bp: { name: 'Blueprint only', what: 'In the Blueprint, never did the North Star.', act: 'Send them the North Star' },
  both: { name: 'Both', what: 'Crossed: North Star and Blueprint.', act: 'See who is ready for the next step' },
};
/** 'ns' (North Star only), 'bp' (Blueprint only), 'both', or '' for a founder
 *  who has done neither yet (they show under "All" only). */
export function groupOf(s) {
  const n = nsDone(s), b = bpStarted(s);
  return n && b ? 'both' : n ? 'ns' : b ? 'bp' : '';
}

/** The Blueprint levels they wrote in (at least one answer), as numbers. */
export function levelSet(s) {
  const out = new Set();
  for (const x of String((s && s.level_list) || '').split(',')) { const n = parseInt(x, 10); if (n >= 1 && n <= 12) out.add(n); }
  return out;
}
/** How many of the twelve levels they wrote in. */
export const levelCount = (s) => (s && s.level_list ? levelSet(s).size : Math.max(0, Math.min(12, Number(s && s.levels) || 0)));
/** The free Launchpad is levels 01–03: done when they wrote in all three. */
export function launchpadDone(s) {
  if (s && s.level_list) { const L = levelSet(s); return L.has(1) && L.has(2) && L.has(3); }
  return levelCount(s) >= 3;
}
/** On the free step with levels 01–03 written: ready for The Boardroom. */
export const readyForBoardroom = (s) => tierOf(s) === 'free' && launchpadDone(s);
export const inBoardroom = (s) => tierOf(s) !== 'free';
export const isPaid = (s) => PAID.includes(tierOf(s));
/** The doors they crossed: 'blueprint' (North Star → Blueprint) and/or 'northstar'. */
export const crossedOf = (s) => String((s && s.crossed) || '').split(',').map((x) => x.trim()).filter((x) => x === 'blueprint' || x === 'northstar');

/** The one thing that moves this founder on, most urgent first.
 *  key: what it is; label: the words; tone: the pill colour;
 *  button: the main button's words; does: 'open' (their work), 'msg'
 *  (the message box) or 'unpause'. */
export function nextAction(s, now = Date.now()) {
  const g = groupOf(s);
  if (s.paused) return { key: 'paused', label: 'Paused', tone: 'warn', button: 'Unpause', does: 'unpause' };
  if (Number(s.open_notes) > 0) return { key: 'question', label: 'Answer the question', tone: 'warn', button: 'Read and answer', does: 'open' };
  if (isQuiet(s, now)) return { key: 'quiet', label: `Check in: quiet ${quietDays(s, now)} days`, tone: 'warn', button: 'Send a message', does: 'msg' };
  if (g === 'ns') return { key: 'ns', label: GROUPS.ns.act, tone: 'ns', button: 'Send the Launchpad invite', does: 'msg' };
  if (g === 'bp') return { key: 'bp', label: GROUPS.bp.act, tone: 'bp', button: 'Send the North Star link', does: 'msg' };
  if (readyForBoardroom(s)) return { key: 'ready', label: 'Offer the Boardroom', tone: 'both', button: 'Offer the Boardroom', does: 'msg' };
  if (!g) return { key: 'none', label: 'Not started yet', tone: '', button: 'Send a message', does: 'msg' };
  return { key: 'ok', label: 'On track', tone: '', button: 'Send a message', does: 'msg' };
}

/** The tiles and the cockpit's cards. */
export function summary(students, waiting, now = Date.now()) {
  const list = students || [];
  const steps = Object.fromEntries(STEP_KEYS.map((k) => [k, list.filter((s) => tierOf(s) === k).length]));
  const groups = { ns: 0, bp: 0, both: 0, none: 0 };
  for (const s of list) groups[groupOf(s) || 'none']++;
  return {
    total: list.length,
    newWeek: list.filter((s) => isNew(s, now)).length,
    compass: list.filter((s) => !!s.compass_at).length,
    steps,
    notes: (waiting || []).length,
    quiet: list.filter((s) => isQuiet(s, now)).length,
    library: list.filter((s) => !!s.library).length,
    full: list.filter((s) => s.signup_type === 'full').length,
    simple: list.filter((s) => s.signup_type === 'simple').length,
    groups,
    ready: list.filter(readyForBoardroom).length,
    crossed: { blueprint: list.filter((s) => crossedOf(s).includes('blueprint')).length, northstar: list.filter((s) => crossedOf(s).includes('northstar')).length },
  };
}

/** The table's rows. The old tiles (tile) and the cockpit's chips: group
 *  (ns, bp, both), step, act (new, active, quiet), need (q, ready, nopw),
 *  more (full, simple, library) and the search (name, email, business). */
export function filter(students, { tile = 'all', q = '', group = 'all', step = 'all', act = 'all', need = 'all', more = 'all' } = {}, now = Date.now()) {
  const needle = String(q).trim().toLowerCase();
  return (students || []).filter((s) => {
    if (tile === 'new' && !isNew(s, now)) return false;
    if (tile === 'compass' && !s.compass_at) return false;
    if (tile === 'notes' && !(s.open_notes > 0)) return false;
    if (tile === 'quiet' && !isQuiet(s, now)) return false;
    if (tile === 'library' && !s.library) return false;
    if ((tile === 'full' || tile === 'simple') && s.signup_type !== tile) return false;
    if (STEP_KEYS.includes(tile) && tierOf(s) !== tile) return false;
    if (group !== 'all' && groupOf(s) !== group) return false;
    if (step !== 'all' && tierOf(s) !== step) return false;
    if (act === 'new' && !isNew(s, now)) return false;
    if (act === 'active' && isQuiet(s, now)) return false;
    if (act === 'quiet' && !isQuiet(s, now)) return false;
    if (need === 'q' && !(s.open_notes > 0)) return false;
    if (need === 'ready' && !readyForBoardroom(s)) return false;
    if (need === 'nopw' && s.has_password) return false;
    if ((more === 'full' || more === 'simple') && s.signup_type !== more) return false;
    if (more === 'library' && !s.library) return false;
    if (needle && !`${s.name || ''} ${s.email || ''} ${s.company || ''}`.toLowerCase().includes(needle)) return false;
    return true;
  });
}

/** From sign-up to paid, and where the most founders fall away. Each row
 *  counts on its own (a founder can start the Blueprint without the North
 *  Star), so a row can be higher than the one above; only a fall counts. */
export function funnel(students) {
  const list = students || [];
  const rows = [
    { key: 'signed', label: 'Signed up', n: list.length },
    { key: 'ns', label: 'North Star done', n: list.filter(nsDone).length },
    { key: 'bp', label: 'Blueprint started', n: list.filter(bpStarted).length },
    { key: 'launchpad', label: 'Launchpad done', n: list.filter(launchpadDone).length },
    { key: 'boardroom', label: 'Boardroom', n: list.filter(inBoardroom).length },
    { key: 'paid', label: 'Paid (LAB, HUB, Summit)', n: list.filter(isPaid).length },
  ];
  let worst = -1, drop = 0;
  for (let i = 1; i < rows.length; i++) { const d = rows[i - 1].n - rows[i].n; if (d > drop) { drop = d; worst = i; } }
  return { rows, worst, drop, from: worst > 0 ? rows[worst - 1].label : '', to: worst > 0 ? rows[worst].label : '' };
}

/** "Needs you today": each founder once, at their most urgent reason.
 *  A question waiting (longest waiting first), quiet 14+ days (quietest
 *  first), ready for the Boardroom, new in the last 3 days (newest first).
 *  Paused founders are left out of the nudges; their questions still show. */
export function today(students, waiting, now = Date.now()) {
  const list = students || [], byId = new Map(list.map((s) => [s.id, s])), done = new Set(), out = [];
  const asked = new Map();
  for (const n of waiting || []) {
    const a = asked.get(n.student_id);
    const at = Date.parse(n.created_at || 0) || 0;
    if (!a) asked.set(n.student_id, { n, first: at, count: 1, latest: n });
    else { a.count++; if (at < a.first) a.first = at; if (at > (Date.parse(a.latest.created_at || 0) || 0)) a.latest = n; }
  }
  for (const [id, a] of [...asked].sort((x, y) => x[1].first - y[1].first)) {
    const s = byId.get(id) || { id, name: a.n.name, email: a.n.email };
    done.add(id);
    out.push({ kind: 'question', id, s, count: a.count, text: a.latest.body, at: a.latest.created_at, waitingSince: a.first ? new Date(a.first).toISOString() : a.latest.created_at, button: 'Read and answer', does: 'open' });
  }
  const live = list.filter((s) => !s.paused && !done.has(s.id));
  for (const s of live.filter((x) => isQuiet(x, now)).sort((x, y) => seen(x) - seen(y))) {
    done.add(s.id); out.push({ kind: 'quiet', id: s.id, s, days: quietDays(s, now), button: 'Send a message', does: 'msg' });
  }
  for (const s of live.filter((x) => !done.has(x.id) && readyForBoardroom(x))) {
    done.add(s.id); out.push({ kind: 'ready', id: s.id, s, button: 'Offer the Boardroom', does: 'msg' });
  }
  for (const s of live.filter((x) => !done.has(x.id) && now - joined(x) < 3 * DAY).sort((x, y) => joined(y) - joined(x))) {
    done.add(s.id); out.push({ kind: 'new', id: s.id, s, days: Math.max(0, Math.floor((now - joined(s)) / DAY)), button: 'Send a welcome', does: 'msg' });
  }
  return out;
}

/** Sign-ups per landing: Roads 1 to 4, North 2 and 3, the North Star
 *  box and The Summit. Each row: all of them, the last 7 days, how many used
 *  the full form, and the split by group. */
export const LANDINGS = [['road1', 'Road 1 · /road1/'], ['road2', 'Road 2 · /road2/'], ['road3', 'Road 3 · /road3/'], ['road4', 'Road 4 · /road4/'], ['north2', 'North 2 · /north2/'], ['north3', 'North 3 · /north3/'], ['compass', 'North Star box'], ['summit', 'The Summit · /northstar/summit/']];
export const LANDING_SHORT = { road1: 'Road 1', road2: 'Road 2', road3: 'Road 3', road4: 'Road 4', north2: 'North 2', north3: 'North 3', compass: 'the North Star box', summit: 'The Summit' };
export function byLanding(students, now = Date.now()) {
  const row = (k, name, rows) => {
    const g = { ns: 0, bp: 0, both: 0, none: 0 };
    for (const s of rows) g[groupOf(s) || 'none']++;
    return { k, name, total: rows.length, week: rows.filter((s) => isNew(s, now)).length, full: rows.filter((s) => s.signup_type === 'full').length, ...g };
  };
  const out = LANDINGS.map(([k, name]) => row(k, name, (students || []).filter((s) => s.landing === k)));
  const known = new Set(LANDINGS.map(([k]) => k));
  const rest = (students || []).filter((s) => !known.has(s.landing));
  if (rest.length) out.push(row('', 'Not recorded (earlier accounts)', rest));
  return out;
}

/** "Needs you": unanswered questions from founders, then founders quiet for 14+ days. */
export function needsYou(students, waiting, now = Date.now()) {
  const notes = (waiting || []).map((n) => ({ kind: 'note', id: n.student_id, name: n.name, email: n.email, text: n.body, at: n.created_at }));
  const quiet = (students || []).filter((s) => isQuiet(s, now)).map((s) => ({ kind: 'quiet', id: s.id, name: s.name, email: s.email, days: Math.floor((now - seen(s)) / DAY) }));
  return [...notes, ...quiet];
}

// ── What founders told the North Star (31 Oct, Alexandru: "add more data
// you think can be useful") ─────────────────────────────────────────────────
// From the North Star's own flags and results, saved with the account: what
// hurts, what they want (two), what they care about (two), who works with
// them, and the side that needs them first (their lowest answered score).
// Counts are real answers only; a founder who answered none of it is left out.

export const PAIN_NAMES = { clients: 'Not enough clients', cash: 'Cash is tight', time: 'No time for myself', alone: 'Doing everything myself', team: 'Team not stepping up', direction: 'Unclear direction', price: 'Prices feel too low', switch: 'I can’t switch off' };
export const WANT_NAMES = { freedom: 'More free time', income: 'Higher income', steady: 'Steady clients', team: 'A team I trust', clarity: 'Clarity on direction', grow: 'A new market' };
export const VALUE_NAMES = { family: 'Family', faith: 'Faith', freedom: 'Freedom', health: 'Health', integrity: 'Integrity', growth: 'Growth', service: 'Service', legacy: 'Legacy' };
export const TEAM_NAMES = { solo: 'Just me', help: 'Me and some help', team: 'A team' };
export const SIDES = ['Lead yourself', 'Lead your people', 'Lead your business', 'Lead the market'];
const parseJSON = (v) => { if (v && typeof v === 'object') return v; try { return JSON.parse(v || 'null') || {}; } catch { return {}; } };

/** One founder's answers, as names. first/best: index into SIDES, or -1. */
export function told(s) {
  const f = parseJSON(s && s.ns_flags), r = parseJSON(s && s.ns_results);
  const pains = (Array.isArray(f.pains) ? f.pains : []).filter((k, i, a) => PAIN_NAMES[k] && a.indexOf(k) === i);
  const wants = [f.want, f.want2].filter((k, i, a) => WANT_NAMES[k] && a.indexOf(k) === i);
  const values = (Array.isArray(f.values) ? f.values : []).filter((k, i, a) => VALUE_NAMES[k] && a.indexOf(k) === i);
  const team = TEAM_NAMES[f.team] ? f.team : '';
  const sc = Array.isArray(r.scores) ? r.scores : [], an = Array.isArray(r.answered) ? r.answered : [];
  let first = -1, best = -1;
  sc.forEach((v, i) => { if (!an[i] || !Number.isFinite(Number(v))) return; if (first < 0 || v < sc[first]) first = i; if (best < 0 || v > sc[best]) best = i; });
  return { pains, wants, values, team, first, best, any: !!(pains.length || wants.length || values.length || team || first >= 0) };
}

/** Across the roster: each list ranked, most named first. */
export function toldTally(students) {
  const T = { pains: {}, wants: {}, values: {}, team: {}, first: [0, 0, 0, 0] };
  let people = 0;
  for (const s of students || []) {
    const t = told(s);
    if (!t.any) continue;
    people++;
    for (const k of t.pains) T.pains[k] = (T.pains[k] || 0) + 1;
    for (const k of t.wants) T.wants[k] = (T.wants[k] || 0) + 1;
    for (const k of t.values) T.values[k] = (T.values[k] || 0) + 1;
    if (t.team) T.team[t.team] = (T.team[t.team] || 0) + 1;
    if (t.first >= 0) T.first[t.first]++;
  }
  const rank = (obj, names) => Object.entries(obj).map(([k, n]) => ({ k, name: names[k] || k, n })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  return { people, pains: rank(T.pains, PAIN_NAMES), wants: rank(T.wants, WANT_NAMES), values: rank(T.values, VALUE_NAMES), team: rank(T.team, TEAM_NAMES),
    first: T.first.map((n, i) => ({ k: String(i), name: SIDES[i], n })).filter((x) => x.n).sort((a, b) => b.n - a.n) };
}

/** Their own sentences from the Blueprint (Version 4), newest first. rows:
 *  worksheet rows { student_id, key, value, updated_at, name, email } with
 *  keys w.v4.<level>.<domain 0–3>.<field>; levels: LEVELS4 from
 *  /levels-v4.js. Only sentences with every blank filled are shown. */
export function theirWords(rows, levels, limit = 12) {
  const groups = new Map();
  for (const r of rows || []) {
    const m = /^w\.v4\.(\d{1,2})\.([0-3])\.([A-Za-z0-9_]+)$/.exec(String((r && r.key) || ''));
    if (!m) continue;
    const id = `${r.student_id}|${m[1]}|${m[2]}`;
    const g = groups.get(id) || { id: r.student_id, name: r.name || '', email: r.email || '', lv: Number(m[1]), d: Number(m[2]), f: {}, at: '' };
    g.f[m[3]] = String(r.value ?? '');
    if (String(r.updated_at || '') > g.at) g.at = String(r.updated_at || '');
    groups.set(id, g);
  }
  const out = [];
  for (const g of groups.values()) {
    const L = (levels || [])[g.lv - 1], D = L && L.d && L.d[g.d];
    if (!D || !Array.isArray(D.f)) continue;
    const fields = D.f.filter((p) => typeof p !== 'string');
    if (!fields.length || !fields.every((p) => String(g.f[p[0]] || '').trim())) continue;
    const text = D.f.map((p) => (typeof p === 'string' ? p : String(g.f[p[0]]).trim())).join('').replace(/<[^>]*>/g, '');
    out.push({ id: g.id, name: g.name, email: g.email, lv: g.lv, word: L.word || '', side: SIDES[g.d], text, at: g.at });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** The Massive Growth Plan ticks in a roster row: growth_list is
 *  "mgp-3|2026-11-02T…,mgp-1|…" (functions/api/mentor.js). → { id: date }. */
export function growthDone(s) {
  const out = {};
  for (const part of String((s && s.growth_list) || '').split(',')) {
    const [id, at] = part.split('|');
    if (/^mgp-\d{1,2}$/.test(id || '') && at) out[id] = at;
  }
  return out;
}
/** The ticked steps by domain, in the plan's own order, every word from
 *  window.GrowthPlan (plan): [{ name, col, steps: [{ n, id, title, at }] }].
 *  Domains with nothing ticked are left out; step 21 comes last, under the
 *  plan's own name for it. */
export function growthGroups(plan, done) {
  if (!plan || !Array.isArray(plan.domains)) return [];
  const D = done || {};
  let n = 0;
  const out = plan.domains.map((d) => ({ name: d.name, col: d.col,
    steps: d.steps.map((s) => { n += 1; return { n, id: s.id, title: s.title, at: D[s.id] || '' }; }).filter((s) => s.at) }));
  if (plan.plus) out.push({ name: plan.plus.move, col: '', steps: D[plan.plus.id] ? [{ n: n + 1, id: plan.plus.id, title: plan.plus.title, at: D[plan.plus.id] }] : [] });
  return out.filter((g) => g.steps.length);
}
