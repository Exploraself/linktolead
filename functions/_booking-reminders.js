// Reminders before a confirmed call (Alexandru, 6 Nov 2026: "24 hours before
// and 1 hour before", for discovery calls and the Boardroom 1:1). The hourly
// run (worker.js JOBS, at :07) sends what each confirmed booking is owed now
// (functions/_booking.js reminderDue): only for confirmed bookings, once each,
// never after Declined, Cancelled or Delete (they are no longer confirmed).
// Each carries the time in their own zone, that kind's Google Meet room and
// the text Alexandru wrote for them ("Before we speak" / "Before your 1:1").
// No room pasted in Settings → Booking links: nothing goes (the letters are
// about joining it).

import { now } from './_shared.js';
import { send, mailState } from './_mail.js';
import { bookingTables, meetLinks, reminderDue } from './_booking.js';
import { bookingReminderDay, bookingReminderHour } from './_letters.js';
import { SITE } from './_course.js';

const LETTERS = { day: bookingReminderDay, hour: bookingReminderHour };
const COLUMN = { day: 'remind_day_at', hour: 'remind_hour_at' };

/** Send the reminders owed now. Returns { day, hour, failed, noRoom } or { skipped }. Never throws. */
export async function bookingReminders(env, D, base = SITE, at = new Date()) {
  const out = { day: 0, hour: 0, failed: 0, noRoom: 0 };
  try {
    if (!mailState(env).ready) return { skipped: 'email is not switched on' };
    await bookingTables(D);
    const stamp = new Date(at).toISOString();
    const rows = (await D.prepare("SELECT * FROM booking WHERE status = 'confirmed' AND confirmed_time IS NOT NULL").all()).results || [];
    let rooms = null;
    for (const b of rows) {
      const which = reminderDue(b, at);
      if (!which) continue;
      rooms = rooms || await meetLinks(D);
      const meet = rooms[b.kind];
      if (!meet) { out.noRoom++; continue; }
      const col = COLUMN[which];
      // Claimed first, so two runs never send the same reminder twice.
      const claim = await D.prepare(`UPDATE booking SET ${col} = ? WHERE id = ? AND status = 'confirmed' AND ${col} IS NULL AND confirmed_time = ?`)
        .bind(stamp, b.id, b.confirmed_time).run();
      if (!claim || !claim.meta || claim.meta.changes !== 1) continue;
      const L = LETTERS[which](base, { first: String(b.name || '').split(/\s+/)[0], kind: b.kind, time: b.confirmed_time, meet, prep: b.prep || '', tz: b.tz, to: b.email, at });
      const r = await send(env, { to: b.email, ...L,
        why: b.kind === 'boardroom' ? 'You booked your 1:1 with Alexandru at linktolead.exploraself.com.' : 'You booked a free discovery call with Alexandru at linktolead.exploraself.com.' })
        .catch((e) => ({ ok: false, why: String(e) }));
      if (!r.ok) {
        // Not sent: the next run tries again, while the reminder is still due.
        await D.prepare(`UPDATE booking SET ${col} = NULL WHERE id = ?`).bind(b.id).run();
        out.failed++;
        continue;
      }
      out[which]++;
      if (b.student_id) await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(b.student_id, `booking-reminder-${which}`, now(), b.kind).run().catch(() => null);
    }
  } catch (e) {
    return { ...out, error: String((e && e.message) || e).slice(0, 160) };
  }
  return out;
}
