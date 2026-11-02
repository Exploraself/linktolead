// Refund requests (Alexandru, 2 Nov 2026): "Ask for a refund" is in every
// founder's Base Camp. They choose the programme they paid for and confirm
// their name and email; the request lands in /mentor → Refunds, in red, and
// Alexandru gets in touch with them himself. Nothing is refunded by the code,
// and nothing ever tells a founder a refund was made (AGENTS.md 6).

/** The programmes a founder can name: every paid step. */
export const REFUND_STEPS = ['session', 'lab', 'hub', 'premium'];
/** At most this many requests from one address (IP) in a day. */
export const REFUND_PER_DAY = 5;

export async function refundTable(D) {
  await D.prepare(`CREATE TABLE IF NOT EXISTS refund_ask (id TEXT PRIMARY KEY, student_id TEXT, name TEXT NOT NULL, email TEXT NOT NULL,
    step TEXT NOT NULL, ip TEXT, asked_at TEXT NOT NULL, done_at TEXT, done_by TEXT)`).run();
}

/** Every request, the open ones first, then the newest. */
export async function refundList(D, limit = 500) {
  await refundTable(D);
  const r = await D.prepare('SELECT id, student_id, name, email, step, asked_at, done_at, done_by FROM refund_ask ORDER BY asked_at DESC LIMIT ?').bind(limit).all();
  const list = r.results || [];
  return [...list.filter((x) => !x.done_at), ...list.filter((x) => x.done_at)];
}
