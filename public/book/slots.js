// The rules and the questions of the two booking pages (Alexandru, 2 Nov
// 2026): Tuesday, Wednesday and Thursday, 15:00–20:00 Rome time, from
// tomorrow up to 14 days ahead, one time picked (up to three: Alexandru,
// 3 Nov 2026, "1 is enough, 2 or 3 are options"), one confirmed within 24
// hours. Discovery calls start every 30 minutes, the 1:1 every 60 (the last
// one ends by 20:00). The same rules and questions are in
// functions/_booking.js, which checks everything the page sends
// (tests/book.test.mjs holds both equal). No DOM here: the page
// (public/book/book.js) draws them, in the visitor's own time zone.

export const ZONE = 'Europe/Rome';
export const RULES = { zone: ZONE, days: [2, 3, 4], from: 15, to: 20, ahead: 14, min: 1, pick: 3, confirmHours: 24, where: 'Google Meet' };
export const KINDS = {
  discovery: { minutes: 30, every: 30 },
  boardroom: { minutes: 60, every: 60 },
};

/** Every answer a tap can give, by list: [key, words]. */
export const CHOICES = {
  stage: [['start', 'Before my first sale'], ['solo', 'Selling alone'], ['team', 'A team with payroll'], ['company', '16 people or more']],
  struggles: [['clients', 'Not enough clients'], ['price', 'Prices too low'], ['time', 'No time for myself'], ['direction', 'Unclear direction'],
    ['cash', 'Cash is tight'], ['team', 'My team isn’t stepping up'], ['switch', 'I can’t switch off'], ['alone', 'I carry every decision alone']],
  goals: [['clients', 'More clients'], ['price', 'Higher prices'], ['time', 'Time back for me'], ['direction', 'A clear direction'],
    ['cash', 'Steady cash'], ['team', 'A team I trust'], ['runs', 'A business that runs without me'], ['market', 'A new market']],
  moved: [['believe', 'What you believe'], ['read', 'How you read it'], ['feel', 'What you feel']],
  side: [['self', 'Lead yourself'], ['people', 'Lead your people'], ['work', 'Lead your business'], ['market', 'Lead the market']],
  tried: [['none', 'Nothing yet'], ['once', 'Tried once, it didn’t hold'], ['few', 'Tried a few times'], ['middle', 'I’m in the middle of it']],
  income: [['none', 'Nothing yet'], ['u1k', 'Under $1,000'], ['1to5k', '$1,000 to $5,000'], ['5to20k', '$5,000 to $20,000'], ['o20k', 'Over $20,000'], ['private', 'I’d rather not say']],
  asked: [['0', 'Nobody yet'], ['1to3', '1 to 3'], ['4to10', '4 to 10'], ['o10', 'More than 10']],
};
/** The questions of each form, in order (type: 'one' tap one, 'two' exactly
 *  two, 'text' short text of at most `max` characters). */
export const FORMS = {
  discovery: [
    { k: 'stage', type: 'one', of: 'stage', q: 'Where are you now?', label: 'Where you are now' },
    { k: 'struggles', type: 'two', of: 'struggles', q: 'What do you struggle with most? Choose two.', label: 'What you struggle with most' },
    { k: 'goals', type: 'two', of: 'goals', q: 'What do you want to achieve in the next 90 days? Choose two.', label: 'In the next 90 days' },
    { k: 'note', type: 'text', max: 600, optional: true, q: 'Anything else Alexandru should know?', label: 'Anything else' },
  ],
  boardroom: [
    { k: 'moved', type: 'one', of: 'moved', part: 'Where you are', q: 'Which of your first three levels moved you most?', label: 'The level that moved you most' },
    { k: 'side', type: 'one', of: 'side', part: 'Where you are', q: 'Which side is costing you most right now?', label: 'The side costing you most' },
    { k: 'stage', type: 'one', of: 'stage', part: 'Where you are', q: 'Where is the business today?', label: 'The business today' },
    { k: 'line', type: 'text', max: 300, part: 'Lead yourself', q: 'The sentence you wrote in your first three levels that you still think about', label: 'The sentence you still think about' },
    { k: 'pressure', type: 'text', max: 300, part: 'Lead yourself', q: 'When the pressure hits, what do you do first?', label: 'Under pressure, first' },
    { k: 'enough', type: 'text', max: 160, part: 'Lead yourself', q: 'What is “enough” for you each month, as a number?', label: 'Enough, each month' },
    { k: 'avoid', type: 'text', max: 300, part: 'Lead yourself', q: 'What are you avoiding right now that you know you should face?', label: 'What you are avoiding' },
    { k: 'depends', type: 'text', max: 300, part: 'Lead your people', q: 'Who depends on you most, at work or at home?', label: 'Who depends on you' },
    { k: 'talk', type: 'text', max: 300, part: 'Lead your people', q: 'Which conversation have you been putting off, and with whom?', label: 'The conversation you put off' },
    { k: 'handed', type: 'text', max: 300, part: 'Lead your people', q: 'What did you hand over in the last month, and did it stay handed over?', label: 'What you handed over' },
    { k: 'income', type: 'one', of: 'income', part: 'Lead your business', q: 'Roughly, how much came in last month?', label: 'Last month, in' },
    { k: 'week', type: 'text', max: 300, part: 'Lead your business', q: 'Where does most of your week really go?', label: 'Where the week goes' },
    { k: 'number', type: 'text', max: 300, part: 'Lead your business', q: 'Which number do you avoid looking at?', label: 'The number you avoid' },
    { k: 'best', type: 'text', max: 300, part: 'Lead the market', q: 'Who is your best customer, in one sentence?', label: 'Your best customer' },
    { k: 'why', type: 'text', max: 300, part: 'Lead the market', q: 'Why do they choose you, in their own words?', label: 'Why they choose you' },
    { k: 'asked', type: 'one', of: 'asked', part: 'Lead the market', q: 'How many people did you ask to buy in the last 30 days?', label: 'Asked to buy, last 30 days' },
    { k: 'decision', type: 'text', max: 300, part: 'The hour', q: 'The one decision you want to bring to the table', label: 'The decision you bring' },
    { k: 'tried', type: 'one', of: 'tried', part: 'The hour', q: 'What have you tried so far?', label: 'What you tried so far' },
    { k: 'after', type: 'text', max: 300, part: 'The hour', q: 'If this hour works, what will you do differently next week?', label: 'Different next week' },
    { k: 'worth', type: 'text', max: 300, part: 'The hour', q: 'What would make this hour worth it for you?', label: 'What makes the hour worth it' },
  ],
};
export const NAME_MAX = 80;
/** A phone number as the booking pages take it (Alexandru, 3 Nov 2026: "their
 *  phone number must be collected too, for both"): spaces, dots, dashes and
 *  brackets dropped, 00 read as +, then + and 7 to 15 digits (the
 *  international form WhatsApp uses). '' when it is not one. The same rule
 *  is in functions/_booking.js (tests/book.test.mjs holds both equal). */
export const PHONE_MAX = 24;
export function phoneOf(v) {
  let s = String(v ?? '').trim().replace(/[\s().\-\u00a0]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  return /^\+[1-9]\d{6,14}$/.test(s) ? s : '';
}

/** The country code to start the phone field with, from the visitor's time
 *  zone; '+' when the zone says nothing sure. Only a starting point: they
 *  change it freely. */
const CODES = { 'Europe/Rome': '+39', 'Europe/Vatican': '+39', 'Europe/San_Marino': '+378', 'Europe/Paris': '+33', 'Europe/London': '+44', 'Europe/Dublin': '+353',
  'Europe/Berlin': '+49', 'Europe/Madrid': '+34', 'Europe/Lisbon': '+351', 'Europe/Amsterdam': '+31', 'Europe/Brussels': '+32', 'Europe/Zurich': '+41',
  'Europe/Vienna': '+43', 'Europe/Chisinau': '+373', 'Europe/Bucharest': '+40', 'Europe/Kiev': '+380', 'Europe/Kyiv': '+380', 'Europe/Warsaw': '+48',
  'Europe/Athens': '+30', 'Europe/Stockholm': '+46', 'Europe/Oslo': '+47', 'Europe/Copenhagen': '+45', 'Europe/Helsinki': '+358', 'Europe/Prague': '+420',
  'Australia/Sydney': '+61', 'Australia/Melbourne': '+61', 'Asia/Dubai': '+971', 'Asia/Kolkata': '+91', 'Asia/Singapore': '+65', 'Africa/Lagos': '+234', 'Africa/Johannesburg': '+27' };
export const codeFor = (tz) => CODES[tz] || (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Detroit|Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Anchorage)$/.test(String(tz || '')) || String(tz || '').startsWith('US/') ? '+1' : '+');

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FMT = new Map();
const fmt = (tz) => {
  if (!FMT.has(tz)) FMT.set(tz, new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' }));
  return FMT.get(tz);
};
/** The wall clock in a time zone: { y, m, d, h, mi, wd }. */
export function wall(date, tz = ZONE) {
  const o = {};
  for (const p of fmt(tz).formatToParts(date)) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, mi: +o.minute, wd: WD.indexOf(o.weekday) };
}
/** A wall-clock time in Rome as a moment. */
export function fromWall(y, m, d, h, mi, tz = ZONE) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const off = (t) => { const w = wall(new Date(t), tz); return Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi) - t; };
  let t = guess - off(guess);
  const again = off(t);
  if (guess - again !== t) t = guess - again;
  return new Date(t);
}

/** Every time to offer, as ISO strings, in order. */
export function slotsFor(kind, at = new Date()) {
  const K = KINDS[kind];
  if (!K) return [];
  const today = wall(at);
  const out = [];
  for (let i = 1; i <= RULES.ahead; i++) {
    const day = new Date(Date.UTC(today.y, today.m - 1, today.d + i));
    if (!RULES.days.includes(day.getUTCDay())) continue;
    for (let t = RULES.from * 60; t + K.minutes <= RULES.to * 60; t += K.every) {
      out.push(fromWall(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), Math.floor(t / 60), t % 60).toISOString());
    }
  }
  return out;
}

/** The visitor's time zone, Rome when the browser does not say. */
export const myZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ZONE; } catch { return ZONE; } };
export const cityOf = (tz) => String(tz || ZONE).split('/').pop().replace(/_/g, ' ');

const dayKey = (d, z) => new Intl.DateTimeFormat('en-CA', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const dayText = (d, z) => new Intl.DateTimeFormat('en-GB', { timeZone: z, weekday: 'long', day: 'numeric', month: 'long' }).format(d).replace(',', '');
/** The times grouped by the visitor's own day, each with its words:
 *  [{ key, day: 'Tuesday 3 November', slots: [{ iso, time, rome, label }] }].
 *  `rome` is '' when the visitor's clock shows the same as Rome's. */
export function byDay(isos, tz = myZone(), locale = undefined) {
  const time = (d, z) => new Intl.DateTimeFormat(locale, { timeZone: z, hour: 'numeric', minute: '2-digit' }).format(d);
  const groups = new Map();
  for (const iso of isos) {
    const d = new Date(iso);
    const key = dayKey(d, tz);
    if (!groups.has(key)) groups.set(key, { key, day: dayText(d, tz), slots: [] });
    const mine = time(d, tz), rome = time(d, ZONE);
    const sameDay = dayKey(d, ZONE) === key;
    const romeText = mine === rome && sameDay ? '' : sameDay ? rome : `${dayText(d, ZONE).split(' ')[0].slice(0, 3)} ${rome}`;
    groups.get(key).slots.push({ iso, time: mine, rome: romeText,
      label: `${dayText(d, tz)}, ${mine}${romeText ? `, ${romeText} in Rome` : ''}` });
  }
  return [...groups.values()];
}
/** One time in words for the check screen: "Tuesday 10 November, 10:00"
 *  and, when Rome's clock differs, "16:00 in Rome". */
export function oneTime(iso, tz = myZone(), locale = undefined) {
  const d = new Date(iso);
  const mine = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(d);
  const rome = new Intl.DateTimeFormat(locale, { timeZone: ZONE, hour: 'numeric', minute: '2-digit' }).format(d);
  const sameDay = dayKey(d, ZONE) === dayKey(d, tz);
  return { day: dayText(d, tz), time: mine, rome: mine === rome && sameDay ? '' : sameDay ? `${rome} in Rome` : `${dayText(d, ZONE)}, ${rome} in Rome` };
}
