// The mentor dashboard's arithmetic: counts from the real roster only, and the
// filters each tile applies to the table. Loaded by /mentor alone, never by a
// founder's page. An empty count is 0, never a sample.

export const STEP_KEYS = ['free', 'session', 'lab', 'hub', 'premium'];
export const STEP_NAMES = { free: 'Founder Launchpad', session: 'The Boardroom', lab: 'LAB', hub: 'HUB', premium: 'The Summit' };
const DAY = 86400000;

const seen = (s) => Date.parse(s.last_seen_at || s.joined_at || 0) || 0;
/** Quiet: not seen for 14 days or more. */
export const isQuiet = (s, now = Date.now()) => now - seen(s) >= 14 * DAY;
export const isNew = (s, now = Date.now()) => now - (Date.parse(s.joined_at || 0) || 0) < 7 * DAY;

/** The tiles. Each has a key the table can filter by. */
export function summary(students, waiting, now = Date.now()) {
  const list = students || [];
  const steps = Object.fromEntries(STEP_KEYS.map((k) => [k, list.filter((s) => (s.tier || 'free') === k).length]));
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
  };
}

/** The table's rows for a tile and a search. */
export function filter(students, { tile = 'all', q = '' } = {}, now = Date.now()) {
  const needle = String(q).trim().toLowerCase();
  return (students || []).filter((s) => {
    if (tile === 'new' && !isNew(s, now)) return false;
    if (tile === 'compass' && !s.compass_at) return false;
    if (tile === 'notes' && !(s.open_notes > 0)) return false;
    if (tile === 'quiet' && !isQuiet(s, now)) return false;
    if (tile === 'library' && !s.library) return false;
    if ((tile === 'full' || tile === 'simple') && s.signup_type !== tile) return false;
    if (STEP_KEYS.includes(tile) && (s.tier || 'free') !== tile) return false;
    if (needle && !`${s.name || ''} ${s.email || ''} ${s.company || ''}`.toLowerCase().includes(needle)) return false;
    return true;
  });
}

/** Sign-ups per landing: sales pages A, B and C, and the Compass box. Each
 *  row: all of them, the last 7 days, and how many used the full form. */
export const LANDINGS = [['a', 'A · /a'], ['b', 'B · / and /b'], ['c', 'C · /compass/welcome'], ['compass', 'Compass box']];
export function byLanding(students, now = Date.now()) {
  return LANDINGS.map(([k, name]) => {
    const rows = (students || []).filter((s) => s.landing === k);
    return { k, name, total: rows.length, week: rows.filter((s) => isNew(s, now)).length, full: rows.filter((s) => s.signup_type === 'full').length };
  });
}

/** "Needs you": unanswered questions from founders, then founders quiet for 14+ days. */
export function needsYou(students, waiting, now = Date.now()) {
  const notes = (waiting || []).map((n) => ({ kind: 'note', id: n.student_id, name: n.name, email: n.email, text: n.body, at: n.created_at }));
  const quiet = (students || []).filter((s) => isQuiet(s, now)).map((s) => ({ kind: 'quiet', id: s.id, name: s.name, email: s.email, days: Math.floor((now - seen(s)) / DAY) }));
  return [...notes, ...quiet];
}
