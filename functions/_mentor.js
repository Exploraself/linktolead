// The founder's mentor: who the letters come from. Today that is Alexandru
// for everyone; another mentor can be added in /mentor and given to a
// founder, and that founder's letters then carry the new mentor's name,
// photo and signature.
//
// A photo or signature is a path on this site (/mail/…) or an https address.
// Also here: the founder's time zone (from their browser), so each letter
// wishes them the right part of the day.

import { clean, now } from './_shared.js';

export const DEFAULT_MENTOR = {
  id: 'alexandru', name: 'Alexandru Cojocari', title: 'ExploraSelf',
  photo: '/mail/alexandru.jpg', signature: '/mail/signature.png', email: 'support@exploraself.com',
};

const okPic = (v) => (/^(\/[\w./-]{1,120}|https:\/\/[^\s"'<>]{4,300})$/.test(String(v || '')) ? String(v) : '');
const okMail = (v) => (/^[^@\s"'<>]+@[^@\s"'<>.]+\.[^@\s"'<>]+$/.test(String(v || '')) ? String(v).toLowerCase() : '');

/** A mentor with every field filled: missing ones come from the default. */
export function asMentor(m) {
  const d = DEFAULT_MENTOR;
  if (!m) return { ...d, first: d.name.split(' ')[0] };
  const name = clean(m.name, 80) || d.name;
  return {
    id: clean(m.id, 40) || d.id, name, first: name.split(' ')[0],
    title: clean(m.title, 80) || d.title,
    photo: okPic(m.photo) || d.photo, signature: okPic(m.signature) || d.signature,
    email: okMail(m.email) || d.email,
  };
}

/** A time zone the browser sent, if it is a real one. */
export function okTz(tz) {
  const t = clean(tz, 60);
  if (!t || !/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(t)) return '';
  try { new Intl.DateTimeFormat('en-GB', { timeZone: t }); return t; } catch { return ''; }
}

export async function mentorTable(D) {
  await D.prepare(`CREATE TABLE IF NOT EXISTS mentor (id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT, photo TEXT,
    signature TEXT, email TEXT, is_default INTEGER DEFAULT 0, updated_at TEXT)`).run();
}

/** Every mentor, the default first. Alexandru is always there. */
export async function mentors(D) {
  await mentorTable(D);
  const rows = (await D.prepare('SELECT id,name,title,photo,signature,email,is_default FROM mentor ORDER BY is_default DESC, name').all()).results || [];
  const list = rows.map((r) => ({ ...asMentor(r), isDefault: !!r.is_default }));
  if (!list.some((m) => m.id === DEFAULT_MENTOR.id)) list.push({ ...asMentor(null), isDefault: !rows.some((r) => r.is_default) });
  if (!list.some((m) => m.isDefault)) list[0].isDefault = true;
  return list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

/** Save one mentor from /mentor. `isDefault` makes them everyone's mentor
 *  unless a founder has their own. Returns the saved mentor or an error. */
export async function saveMentor(D, m) {
  await mentorTable(D);
  const name = clean(m && m.name, 80);
  if (!name) return { error: 'The mentor needs a name.' };
  if (m.photo && !okPic(m.photo)) return { error: 'The photo must be a path on this site (/mail/…) or an https address.' };
  if (m.signature && !okPic(m.signature)) return { error: 'The signature must be a path on this site (/mail/…) or an https address.' };
  if (m.email && !okMail(m.email)) return { error: 'That reply email does not look complete.' };
  const id = (clean(m.id, 40) || name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).slice(0, 40) || 'mentor';
  const x = asMentor({ ...m, id, name });
  if (m.isDefault) await D.prepare('UPDATE mentor SET is_default = 0').run();
  await D.prepare(`INSERT INTO mentor (id,name,title,photo,signature,email,is_default,updated_at) VALUES (?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, title=excluded.title, photo=excluded.photo, signature=excluded.signature,
        email=excluded.email, is_default=CASE WHEN excluded.is_default = 1 THEN 1 ELSE mentor.is_default END, updated_at=excluded.updated_at`)
    .bind(x.id, x.name, x.title, x.photo, x.signature, x.email, m.isDefault ? 1 : 0, now()).run();
  return { mentor: x };
}

/** The mentor for one founder: their own, else the default, else Alexandru. */
export async function mentorFor(D, studentId) {
  try {
    await mentorTable(D);
    const p = studentId ? await D.prepare('SELECT mentor_id FROM student_profile WHERE student_id = ?').bind(studentId).first() : null;
    const own = p && p.mentor_id ? await D.prepare('SELECT * FROM mentor WHERE id = ?').bind(p.mentor_id).first() : null;
    if (own) return asMentor(own);
    const def = await D.prepare('SELECT * FROM mentor WHERE is_default = 1 LIMIT 1').first();
    return asMentor(def);
  } catch { return asMentor(null); }
}

/** What a letter to this founder needs: their mentor and their time zone. */
export async function letterContext(D, studentId, tz = '') {
  const mentor = await mentorFor(D, studentId);
  let zone = okTz(tz);
  if (!zone && studentId) {
    try { const p = await D.prepare('SELECT tz FROM student_profile WHERE student_id = ?').bind(studentId).first(); zone = okTz(p && p.tz); } catch { /* no column yet */ }
  }
  return { mentor, tz: zone };
}

/** Keep the founder's time zone when their browser sends one. */
export async function keepTz(D, studentId, tz) {
  const t = okTz(tz);
  if (!t || !studentId) return;
  try { await D.prepare('UPDATE student_profile SET tz = ? WHERE student_id = ? AND COALESCE(tz, \'\') <> ?').bind(t, studentId, t).run(); } catch { /* no profile yet */ }
}
