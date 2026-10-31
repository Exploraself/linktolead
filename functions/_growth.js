// The Massive Growth Plan on the server: only the step ids a tick may save.
// Every word of the plan lives in public/northstar/growth-plan.js (a test
// holds this list equal to the ids there). Ticks go into plan_tick beside
// the Account Plans, but they are counted apart: /api/plans, its "x of 32",
// the count /api/plans/tick returns and /mentor's "Plan steps done" never
// include them.

/** The 21 steps: mgp-1 to mgp-20 in four domains of five, and mgp-21, the
 *  Leader's step. Never renumber them: a tick saves the id. */
export const GROWTH_IDS = [
  'mgp-1', 'mgp-2', 'mgp-3', 'mgp-4', 'mgp-5',
  'mgp-6', 'mgp-7', 'mgp-8', 'mgp-9', 'mgp-10',
  'mgp-11', 'mgp-12', 'mgp-13', 'mgp-14', 'mgp-15',
  'mgp-16', 'mgp-17', 'mgp-18', 'mgp-19', 'mgp-20',
  'mgp-21',
];

/** The ids as an SQL list for IN (…). Built from the constants above only,
 *  never from anything a request sends. */
export const GROWTH_SQL = GROWTH_IDS.map((id) => `'${id}'`).join(',');
