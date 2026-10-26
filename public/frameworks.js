// Frameworks — the fill-in-the-blank worksheets that sit inside a level.
//
// A step tells the founder what to go and look at. A framework is where what
// they found gets written down in a shape that produces an answer. Fill the
// blanks and the result window does the arithmetic, so a founder who has never
// worked out an effective hourly rate ends up holding one.
//
// Business basics are taught here, in the teach block, in plain words and only
// where the founder is about to need them. Never a lesson for its own sake.
//
// Shapes:
//   table  — columns and rows the founder fills; a column can be totalled
//   calc   — labelled number fields and a computed result
//   fill   — a sentence with named blanks
//   grid   — a square with four boxes
//   rank   — a list, then an order
//
// A result is declared, never evaluated from a string. Every operation is one
// of the named ones below.

export const OPS = {
  sum: (v, f) => (f.of || []).reduce((n, k) => n + num(v[k]), 0),
  sumcol: (v, f) => Object.keys(v).filter((k) => k.startsWith(f.col + ':')).reduce((n, k) => n + num(v[k]), 0),
  div: (v, f) => num(v[f.b]) ? num(v[f.a]) / num(v[f.b]) : null,
  mul: (v, f) => num(v[f.a]) * num(v[f.b]),
  sub: (v, f) => num(v[f.a]) - num(v[f.b]),
  add: (v, f) => num(v[f.a]) + num(v[f.b]),
  pct: (v, f) => num(v[f.b]) ? (num(v[f.a]) / num(v[f.b])) * 100 : null,
  margin: (v, f) => num(v[f.a]) ? ((num(v[f.a]) - num(v[f.b])) / num(v[f.a])) * 100 : null,
  annual: (v, f) => num(v[f.a]) * (f.times || 52),
};

export function num(x) {
  if (x === undefined || x === null || x === '') return 0;
  const n = parseFloat(String(x).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Compute a framework's result from the founder's own entries. */
export function result(fw, values) {
  if (!fw || !fw.out) return null;
  const op = OPS[fw.out.op];
  if (!op) return null;
  const raw = op(values || {}, fw.out);
  if (raw === null || !Number.isFinite(raw)) return null;
  const dp = fw.out.dp === undefined ? (Math.abs(raw) >= 100 ? 0 : 1) : fw.out.dp;
  return { raw, shown: raw.toFixed(dp).replace(/\.0$/, ''), unit: fw.out.unit || '', label: fw.out.label, read: readFor(fw, raw) };
}

function readFor(fw, raw) {
  const bands = fw.out.read || [];
  for (const [limit, text] of bands) if (raw < limit) return text;
  return bands.length ? bands[bands.length - 1][1] : '';
}
