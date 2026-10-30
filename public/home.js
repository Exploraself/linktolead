// The Ground Plan home base at /start: where a founder opens, which programme
// they walk, and their Ground Plan, built from their own Compass.
//
// Every line traces to something the founder chose in the Compass, or to copy
// that already exists (content.js, and the Compass's own feedback in
// compass/engine.js, from "The Intelligence"). Nothing is filled in for them.

/** The Compass's four stages, as the programme's three. Leading walks the
 *  Scaling programme: it is the top of the road. */
export const PROGRAMME = { building: 'build', growing: 'grow', scaling: 'scale', leading: 'scale', build: 'build', grow: 'grow', scale: 'scale' };
const COMPASS_STAGE_NAME = { building: 'Building', growing: 'Growing', scaling: 'Scaling', leading: 'Leading' };

/**
 * Where /start opens. Without an account: the sign-in screen when asked for
 * (#signin), otherwise off to the sales page to make one. With an account: a
 * founder from the old entrance opens on their programme, as before; everyone
 * else on their Ground Plan. #home, #programme, #library and #ask are
 * honoured.
 */
export function entry({ joined, old, hash = '' }) {
  if (!joined) return hash === '#signin' ? 'signin' : 'redirect';
  if (hash === '#library') return 'library';
  if (hash === '#ask') return 'ask';
  if (hash === '#programme') return 'work';
  if (hash === '#home' || hash === '#account') return 'home';
  return old ? 'work' : 'home';
}

/** Which programme to walk: a stage the founder chose on /start ("Change
 *  where I stand", kept on the account) wins everywhere; then a stage already
 *  in use on this device (a founder never loses their place); then the
 *  Compass; then the stage on the account (from the sales page); then
 *  Building, where the programme starts. */
export function programmeStage({ chosen, local, compass, account } = {}) {
  return PROGRAMME[chosen] || PROGRAMME[local] || PROGRAMME[compass] || PROGRAMME[account] || 'build';
}

/** The once-only nudge when the Compass placed the founder in another stage
 *  than the one they walk (Leading counts as Scaling). `seen` is what was
 *  answered last ("<compass>|<current>"), so it shows once per pair. Returns
 *  the programme stage the Compass suggests, or null. */
export function stageNudge({ compass, current, seen = '' } = {}) {
  const to = PROGRAMME[compass], now = PROGRAMME[current];
  if (!to || !now || to === now || seen === `${to}|${now}`) return null;
  return to;
}

const parse = (s) => { if (s && typeof s === 'object') return s; try { return s ? JSON.parse(s) : null; } catch { return null; } };

/**
 * The Ground Plan, from the Compass record ({ stage, results_json, flags_json }
 * as /api/state returns it). `E` is the Compass engine; `C` gives the
 * programme's own copy: STAGES, weekTitle(stage, n) and promise(stage, n).
 * Returns null before the Compass is done.
 */
export function groundPlan(record, E, C) {
  if (!record) return null;
  const results = parse(record.results_json) || parse(record.results) || {}, flags = parse(record.flags_json) || parse(record.flags) || {};
  const chosen = COMPASS_STAGE_NAME[record.stage] ? record.stage : null;
  const prog = PROGRAMME[chosen] || 'build';
  const S = C.STAGES[prog];
  const stage = !chosen ? null : chosen === 'leading'
    ? { chosen: 'Leading', programme: S.n, line: 'You chose Leading; your programme is Scaling, the top of the road.', lede: S.lede }
    : { chosen: COMPASS_STAGE_NAME[chosen], programme: S.n, line: `You chose ${COMPASS_STAGE_NAME[chosen]}; your programme is ${S.n}.`, lede: S.lede };

  // The weakest domain: the lowest answered score; a tie goes to the first in
  // the fixed order (Lead yourself, Lead your people, Lead your business, Lead
  // the market), the same rule as the Account Plans.
  const scores = Array.isArray(results.scores) ? results.scores : [], answered = Array.isArray(results.answered) ? results.answered : [];
  let low = -1;
  for (let i = 0; i < 4; i++) if (answered[i] > 0 && Number.isFinite(scores[i]) && (low < 0 || scores[i] < scores[low])) low = i;
  let weakest = null;
  if (low >= 0) {
    const band = E.band(scores[low]), f = E.FEEDBACK[low][band];
    weakest = { i: low, id: E.DOMAINS[low].id, name: E.DOMAINS[low].name, band: E.BANDS[band], big: f.big, why: f.why, week: f.week };
  }
  const g = E.GOALS.find((x) => x[0] === flags.want);
  const goal = g ? { label: g[1], domain: E.DOMAINS[g[2]].name, line: `Your goal, ${g[1].toLowerCase()}, runs through ${E.DOMAINS[g[2]].name}.` } : null;
  const pains = E.PAINS.filter((p) => Array.isArray(flags.pains) && flags.pains.includes(p[0])).map((p) => ({ label: p[1], domain: E.DOMAINS[p[2]].name }));
  const moves = [1, 2, 3].map((n) => ({ n, title: C.weekTitle(prog, n), promise: C.promise(prog, n) }));
  return { programme: prog, stage, weakest, goal, pains, moves };
}
