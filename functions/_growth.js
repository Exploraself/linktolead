// The Massive Growth Plan on the server: only the step ids a tick may save,
// and only the blank ids a founder may write in. Every word of the plan lives
// in public/northstar/growth-plan.js (a test holds both lists equal to it). Ticks go into plan_tick beside
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

/** How many blanks (runs of ___) each step's lines hold, in order. A blank's
 *  id is its step id, a dot, and its number inside the step, counted across
 *  the step's lines: mgp-7.1 … mgp-7.5. Never renumber them: a written answer
 *  is saved under its id. Step 21 has no lines, so no blanks. */
export const BLANKS = {
  'mgp-1': 3, 'mgp-2': 2, 'mgp-3': 4, 'mgp-4': 3, 'mgp-5': 3,
  'mgp-6': 3, 'mgp-7': 5, 'mgp-8': 3, 'mgp-9': 5, 'mgp-10': 2,
  'mgp-11': 2, 'mgp-12': 5, 'mgp-13': 3, 'mgp-14': 3, 'mgp-15': 3,
  'mgp-16': 6, 'mgp-17': 4, 'mgp-18': 4, 'mgp-19': 2, 'mgp-20': 3,
  'mgp-21': 0,
};
/** Every blank id, in the plan's order (68). */
export const GROWTH_BLANK_IDS = GROWTH_IDS.flatMap((id) => Array.from({ length: BLANKS[id] || 0 }, (_, i) => `${id}.${i + 1}`));
/** The longest answer one blank keeps. */
export const BLANK_MAX = 500;
