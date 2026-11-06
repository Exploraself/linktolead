// Every email is a short letter from the founder's mentor (Alexandru today;
// functions/_mentor.js): paper background, Georgia, 16px, no banner, plain
// links, one gold button at most. Sent by Resend through _mail.js, which adds
// the footer (why it came, unsubscribe, postal address). Mailchimp sends
// nothing.
//
// Every letter to a founder closes the same way (Alexandru, 30 Oct 2026):
// a good word and some encouragement, "reply here" with a few one-tap
// questions, "See you soon" with a wish for the founder's own part of the day
// (morning, afternoon, evening or night, from their time zone), the mentor's
// handwritten signature (/mail/signature.png, La Belle Aurore in gold, chosen 30 Oct) beside
// their round photo, then a P.S. with one promotion. Every letter has a
// plain-text part.
// The P.S. is always the Unshakeable assessment (Alexandru, 30 Oct 2026),
// unless a caller passes another offer or null. No countdowns, no invented
// scarcity.

import { esc } from './_mail.js';
import { asMentor } from './_mentor.js';
import { whenText, timeLine, clockText, sameDay, cityOf, answersText, RULES, KINDS, GIFTS, giftHref, waDigits } from './_booking.js';

/** The same link as BOOKING in public/content.js (a test holds them equal):
 *  the page where a founder who paid picks a time (or up to three) for their 1:1
 *  (functions/_booking.js). */
export const BOOKING = 'https://linktolead.exploraself.com/book/boardroom/';
export const SIGNATURE = '/mail/signature.png';
export const PORTRAIT = '/mail/alexandru.jpg';

const LINK = Symbol('link');
/** A link inside a paragraph: shown as its address, in both parts. */
export const link = (url, label) => ({ [LINK]: true, url, label: label || url.replace(/^https?:\/\//, '') });
const BUTTON = Symbol('button');
/** The one main action of a letter, as its own paragraph: a gold button in
 *  the html (a table, so every inbox draws it), "label: url" in plain text. */
export const button = (url, label) => ({ [BUTTON]: true, url, label });

// Letters that are easy to read (Alexandru, 5 Nov 2026, Good People Win:
// "shorter, with chapters … some bold … a diagram or something, to make it
// more readable"). Bold words, a section heading, and a small diagram drawn
// as tables (no picture: every mail app shows it, and it reads the same in
// the plain-text part).
const STRONG = Symbol('strong');
/** Bold words inside a paragraph. */
export const strong = (s) => ({ [STRONG]: true, s: String(s) });
/** A sentence with **bold** marks, as the parts of a paragraph. */
export const marked = (s) => String(s).split(/\*\*(.+?)\*\*/).map((x, i) => (i % 2 ? strong(x) : x)).filter((x) => x !== '');
const BLOCK = Symbol('block');
/** A section heading ("1 · Where it hurts"), as its own paragraph. */
export const heading = (t) => ({ [BLOCK]: true, kind: 'heading', t: String(t) });
/** A small diagram, as its own paragraph. `kind`:
 *    grid    four steps in a 2 × 2 loop: rows [badge, word, line]
 *    ladder  steps down the page:         rows [badge, word, line]
 *    ifthen  "when … then …" pairs:       rows [when, then]
 *  `title` sits on top, `foot` (optional) underneath in italics. */
export const diagram = ({ kind = 'ladder', title = '', rows = [], foot = '' }) => ({ [BLOCK]: true, kind: 'diagram', d: { kind, title, rows, foot } });

/** The offers, each a paragraph after "P.S.". `tier` hides an offer the
 *  founder already holds (The Boardroom, once they are in it). */
export const OFFERS = {
  boardroom: { paid: true, line: () => ['Want to look at your answers together? The Boardroom is one 1:1 with me, $27: ', link('https://linktolead.exploraself.com/boardroom/')] },
  unshakeable: { paid: true, line: () => ['One thing I’d love you to try: the Unshakeable assessment. It shows how steady you stay when the pressure comes, and where to start building. It’s $9.99 (valued at $199). ', link('https://exploraself.com/unshakeable', 'Take the Unshakeable assessment →')] },
  play: { paid: false, line: () => ['Got ten minutes? Play Leadionaire: fifteen decisions, thirty seconds each. It shows how you choose under pressure: ', link('https://exploraself.com/play')] },
  first100: { paid: false, line: () => ['If clients are the next thing on your mind, the First 100 Clients assessment is free and takes ten minutes: ', link('https://exploraself.com/first-100-clients')] },
  library: { paid: false, line: (base) => ['While you’re in, open Worth Building in your library: 32 frameworks, free with your account. ', link(`${base}/ground-plan/#library`)] },
};
/** Letters that may carry a paid offer. Everything else is free offers only. */
export const PAID_KINDS = ['launchpad-welcome', 'results', 'mentor'];
const TIERS = ['free', 'session', 'lab', 'hub', 'premium'];

/** A small, stable number from a string, to rotate the P.S. */
export function seedOf(s) {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.codePointAt(0)) >>> 0;
  return h;
}

/** Which offer this letter carries. The same founder, letter and day give the
 *  same offer; the next day, or the next kind of letter, moves on. */
export function pickOffer(kind, { seed = 0, tier = 'free' } = {}) {
  const inBoardroom = TIERS.indexOf(tier) >= TIERS.indexOf('session');
  const pool = Object.keys(OFFERS).filter((k) => (PAID_KINDS.includes(kind) || !OFFERS[k].paid) && !(k === 'boardroom' && inBoardroom));
  return pool[seed % pool.length];
}

const PAPER = '#FFFDF8', INK = '#14100B', MUTED = '#6A6052', GOLD_INK = '#6E5213';

function parts(p) {
  if (p && p[BUTTON]) return {
    button: true,
    html: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px"><tr><td style="border-radius:6px;background:#B4975F"><a href="${esc(p.url)}" style="display:block;padding:14px 26px;font:bold 16px/1 Arial,sans-serif;color:#14100B;text-decoration:none;border-radius:6px">${esc(p.label)}</a></td></tr></table>`,
    text: `${p.label}: ${p.url}`,
  };
  if (p && p[BLOCK]) return { button: true, ...(p.kind === 'heading' ? headingParts(p.t) : diagramParts(p.d)) };
  const list = Array.isArray(p) ? p : [p];
  const html = list.map((x) => (x && x[LINK] ? `<a href="${esc(x.url)}" style="color:${GOLD_INK}">${esc(x.label)}</a>` : x && x[STRONG] ? `<b>${esc(x.s)}</b>` : esc(x))).join('');
  const text = list.map((x) => (x && x[LINK] ? x.url : x && x[STRONG] ? x.s : String(x))).join('');
  return { html, text };
}

const PANEL = '#F7F0E1', RULE = '#E3D6BA', BADGE_INK = '#E8C978';
function headingParts(t) {
  return {
    html: `<p style="margin:26px 0 10px;padding-top:14px;border-top:1px solid ${RULE};font:bold 12px/1.3 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${GOLD_INK}">${esc(t)}</p>`,
    text: t.toUpperCase(),
  };
}
/** A badge: a letter or a number on a dark square (round in the grid). A
 *  fixed box inside its cell, so a tall neighbour never stretches it. */
const badge = (b, round) => `<div style="width:30px;height:30px;background:${INK};border-radius:${round ? 15 : 6}px;text-align:center;font:bold ${round ? 14 : 16}px/30px Georgia,serif;color:${BADGE_INK}">${esc(b)}</div>`;
function diagramParts({ kind, title, rows, foot }) {
  const top = title ? `<tr><td colspan="2" style="padding:12px 14px 6px;font:bold 11px/1.3 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${GOLD_INK}">${esc(title)}</td></tr>` : '';
  const end = foot ? `<tr><td colspan="2" style="padding:6px 14px 12px;font:italic 13px/1.4 Georgia,serif;color:${GOLD_INK}">${esc(foot)}</td></tr>` : '';
  const box = (inner) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 18px;background:${PANEL};border:1px solid ${RULE};border-radius:10px">${top}${inner}${end}</table>`;
  let html, lines;
  if (kind === 'grid') {
    const cell = ([b, w, l], i) => `<td width="50%" valign="top" style="padding:8px 14px 10px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="top" style="width:30px">${badge(b, true)}</td>
      <td valign="top" style="padding-left:9px;font:14px/1.4 Arial,sans-serif;color:${INK}"><b style="display:block">${i + 1} · ${esc(w)}</b><span style="color:${MUTED};font-size:13px">${esc(l)}</span></td></tr></table></td>`;
    const pairs = [];
    for (let i = 0; i < rows.length; i += 2) pairs.push(`<tr>${rows.slice(i, i + 2).map((r, j) => cell(r, i + j)).join('')}</tr>`);
    html = box(pairs.join(''));
    lines = rows.map(([, w, l], i) => `${i + 1}. ${w}: ${l}`);
  } else if (kind === 'ifthen') {
    html = box(rows.map(([w, t]) => `<tr><td colspan="2" style="padding:6px 14px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td valign="top" width="46%" style="padding:8px 10px;background:#fff;border:1px solid ${RULE};border-radius:6px;font:14px/1.4 Arial,sans-serif;color:${INK}"><span style="display:block;font:bold 10px/1.3 Arial,sans-serif;letter-spacing:.14em;color:${GOLD_INK}">WHEN</span>${esc(w)}</td>
      <td valign="middle" width="8%" style="text-align:center;font:bold 16px/1 Arial,sans-serif;color:${GOLD_INK}">→</td>
      <td valign="top" width="46%" style="padding:8px 10px;background:${INK};border-radius:6px;font:14px/1.4 Arial,sans-serif;color:#F3EAD6"><span style="display:block;font:bold 10px/1.3 Arial,sans-serif;letter-spacing:.14em;color:${BADGE_INK}">I WILL</span>${esc(t)}</td>
      </tr></table></td></tr>`).join(''));
    lines = rows.map(([w, t]) => `When ${w.replace(/^./, (c) => c.toLowerCase())} → I will ${t.replace(/^./, (c) => c.toLowerCase())}`);
  } else {
    html = box(rows.map(([b, w, l], i) => `<tr>
      <td valign="middle" style="width:34px;padding:${i ? 6 : 4}px 0 6px 14px">${badge(b, false)}</td>
      <td valign="middle" style="padding:${i ? 6 : 4}px 14px 6px 10px;font:14px/1.4 Arial,sans-serif;color:${INK}"><b>${esc(w)}</b> <span style="color:${MUTED}">${esc(l)}</span></td></tr>`).join(''));
    lines = rows.map(([b, w, l]) => `${b}  ${w} ${l}`);
  }
  return { html, text: [title.toUpperCase(), ...lines, foot].filter(Boolean).join('\n') };
}

/** The part of the day for a founder, from their time zone: 'morning',
 *  'afternoon', 'evening' or 'night'; '' when the zone is not known. */
export function partOfDay(tz, at = new Date()) {
  if (!tz) return '';
  let h;
  try { h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(at)); } catch { return ''; }
  if (!Number.isFinite(h)) return '';
  return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 22 ? 'evening' : 'night';
}
/** "See you soon", with the wish for their part of the day. */
export function farewell(tz, at = new Date()) {
  const p = partOfDay(tz, at);
  return `See you soon. ${p === 'night' ? 'Have a restful night.' : p ? `Have a good ${p}.` : 'Have a good day.'}`;
}

/** A good word and some encouragement. Several, so two letters in a row do
 *  not repeat; the same letter to the same founder always says the same. */
export const GOOD_WORDS = [
  'You showed up for your business today, and that is how every real change begins. I’m proud of the work you’re doing.',
  'Every honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.',
  'Building something that matters takes courage, and you have more of it than you think. One step this week is enough.',
  'Small steps, taken every week, build a business that runs and a life worth living. You’re on that road now.',
  'You don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.',
];

/** The first line after "Hi …," in every letter, so it reads as a person
 *  writing (Alexandru, 30 Oct). The second sentence is Alexandru's own story,
 *  so another mentor says only who they are. */
export function opener(M) {
  return M.id === 'alexandru' || /^Alexandru\b/.test(M.name || '')
    ? 'Alexandru from ExploraSelf here. I’m sure what I’ve put on paper will save your day, the way it once saved mine.'
    : `${M.first} from ExploraSelf here.`;
}

/** The free assessments on exploraself.com. Every letter shows three under
 *  the P.S. (Alexandru, 30 Oct), rotating with the letter's seed. */
export const ASSESSMENTS = [
  { n: 'First 100 Clients', u: 'https://exploraself.com/first-100-clients' },
  { n: 'The Inner Boardroom', u: 'https://exploraself.com/unbound' },
  { n: 'Allow Yourself to Rise', u: 'https://exploraself.com/rise' },
  { n: 'The EQ Dividend', u: 'https://exploraself.com/eq' },
  { n: 'The Two-Week Test', u: 'https://exploraself.com/two-week-test' },
];
export const threeAssessments = (seed = 0) => [0, 1, 2].map((i) => ASSESSMENTS[(seed + i) % ASSESSMENTS.length]);

/** One-tap questions under "reply here": each opens a reply to the mentor
 *  with the question already written in the subject. */
export const SHORTCUTS = {
  start: ['Where should I start this week?', 'Which level fits my stage?', 'What happens in a 1:1 in The Boardroom?', 'I’m stuck on a step. Can you help?'],
  security: ['I didn’t ask for this email', 'I can’t sign in', 'Can you help me with my password?'],
  results: ['What does my North Star reading mean?', 'Which domain should I start with?', 'What happens in a 1:1 in The Boardroom?', 'I’m stuck on a step. Can you help?'],
};
const mailto = (to, q) => `mailto:${to}?subject=${encodeURIComponent(q)}`;

/**
 * One letter. `paras` is a list of paragraphs, each a string or a list of
 * strings and link()s. `offer` is an OFFERS key or null. Options:
 *   mentor  who it is from (functions/_mentor.js); Alexandru when missing
 *   tz      the founder's time zone, for the wish at the end
 *   ask     the one-tap questions: a SHORTCUTS key or a list; null for none
 *   seed    keeps the good word the same for the same letter
 *   sign    false leaves out the whole close (the notice to the mentor)
 * Returns { html, text, replyTo, fromName } for send().
 */
export function letter(base, paras, offer = null, { sign = true, mentor, tz = '', at, ask = 'start', seed = 0, intro = false, security = false, founder = true, receipt = false, cover = null, pixel = '' } = {}) {
  const M = asMentor(mentor);
  const pic = (u) => (/^https:\/\//.test(u) ? u : `${base}${u}`);
  const P = paras.map(parts);
  // The personal first line, right after the greeting: only in a first
  // letter (the welcomes and the results). A sign-in, a reset, a password
  // notice, an answer or a mentor's own letter would read it out of place
  // (Alexandru, 31 Oct 2026).
  if (sign && intro && P.length && /^Hi\b/.test(P[0].text || '')) P.splice(1, 0, parts(opener(M)));
  // Every letter serves (Alexandru, 31 Oct 2026): greet, thank, encourage,
  // say we are here, and give something to do. Security letters (sign-in
  // link, reset, password changed) never sell: their P.S. is a free gift.
  const free = Object.keys(OFFERS).filter((k) => !OFFERS[k].paid);
  // A letter may bring its own P.S. ({ line: (base) => [...] }): the 12-day
  // letters (functions/_course.js) each have one, written and checked with them.
  const own = offer && typeof offer === 'object' && typeof offer.line === 'function' ? offer : null;
  const use = own ? null : security && offer && OFFERS[offer] && OFFERS[offer].paid ? free[seed % free.length] : offer;
  // founder: false (a letter to the team) keeps the signature, the reply
  // line and the farewell, but not the founder's encouragement line or the
  // free assessments.
  // receipt: true (Alexandru, 2 Nov 2026: "It's unlocked" landed in Gmail's
  // Promotions tab). The letters that answer something the founder just did
  // (It's unlocked, sign-in link, reset, password changed, no account yet)
  // read as a receipt: no assessments, no P.S. offer, no one-tap questions,
  // the signature in words rather than a picture, the photo kept, and no
  // unsubscribe header (functions/_mail.js send()). The encouragement line
  // stays: every letter encourages (his rule), and plain words are not a promotion.
  const tests = sign && founder && !receipt ? threeAssessments(seed) : [];
  const ps = receipt ? null : own ? parts(['P.S. ', ...own.line(base)]) : use && OFFERS[use] ? parts(['P.S. ', ...OFFERS[use].line(base)]) : null;
  const good = sign && founder ? GOOD_WORDS[seed % GOOD_WORDS.length] : '';
  const qs = !sign || ask === null || receipt ? [] : Array.isArray(ask) ? ask : (SHORTCUTS[ask] || SHORTCUTS.start);
  const bye = sign ? farewell(tz, at) : '';
  const replyLine = 'Any question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.';
  // cover: a small picture on top ({ src, alt }, Good People Win). pixel: a
  // 1 × 1 image at the very end whose address records that the letter was
  // opened (functions/_gpw.js); a mail app that blocks pictures records nothing.
  const top = cover && cover.src ? `<img src="${esc(pic(cover.src))}" width="516" alt="${esc(cover.alt || '')}" style="display:block;width:100%;max-width:516px;height:auto;border:0;border-radius:10px;margin:0 0 24px">\n    ` : '';
  const html = `<!doctype html><html><body style="margin:0;background:${PAPER}"><div style="max-width:560px;margin:0 auto;padding:32px 22px;background:${PAPER};font:16px/1.7 Georgia,'Times New Roman',serif;color:${INK}">
    ${top}${P.map((p) => (p.button ? p.html : `<p style="margin:0 0 16px;white-space:pre-wrap">${p.html}</p>`)).join('\n    ')}
    ${good ? `<p style="margin:0 0 16px">${esc(good)}</p>` : ''}
    ${sign ? `<p style="margin:0 0 ${qs.length ? 10 : 16}px">${esc(replyLine)}</p>` : ''}
    ${qs.length ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;border-left:2px solid #B4975F"><tr><td style="padding:2px 0 2px 14px;font:14px/1.5 Arial,sans-serif;color:${MUTED}">
      <p style="margin:0 0 6px;font:bold 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${GOLD_INK}">One tap to ask</p>
      ${qs.map((q) => `<p style="margin:0 0 6px"><a href="${esc(mailto(M.email, q))}" style="color:${GOLD_INK};text-decoration:underline">${esc(q)}</a></p>`).join('')}
    </td></tr></table>` : ''}
    ${bye ? `<p style="margin:0 0 6px">${esc(bye)}</p>` : ''}
    ${sign ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px"><tr>
      <td style="vertical-align:middle;padding-right:14px"><img src="${esc(pic(M.photo))}" width="64" height="64" alt="${esc(M.name)}" style="display:block;width:64px;height:64px;border-radius:50%;border:2px solid #B4975F"></td>
      <td style="vertical-align:middle">${receipt ? `<p style="margin:0 0 2px;font:italic 22px/1.2 Georgia,'Times New Roman',serif;color:${INK}">${esc(M.first)}</p>` : `<img src="${esc(pic(M.signature))}" width="190" height="53" alt="${esc(M.first)}" style="display:block;margin:0 0 2px;border:0;width:190px;height:auto">`}
      <p style="margin:0;font:13px/1.5 Arial,sans-serif;color:${MUTED}">${esc(M.name)} · ${esc(M.title)}</p></td></tr></table>` : ''}
    ${ps ? `<p style="margin:0;padding-top:14px;border-top:1px dashed #D6C9AC;font-style:italic">${ps.html}</p>` : ''}
    ${tests.length ? `<p style="margin:14px 0 0;font:14px/1.6 Arial,sans-serif;color:${MUTED}">Free assessments, when you want to look deeper: ${tests.map((t) => `<a href="${esc(t.u)}" style="color:${GOLD_INK};text-decoration:underline">${esc(t.n)}</a>`).join(' · ')}</p>` : ''}
    ${pixel ? `<img src="${esc(pixel)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0">` : ''}
  </div></body></html>`;
  const text = [
    P.map((p) => p.text).join('\n\n'),
    good,
    sign ? replyLine + (qs.length ? '\n' + qs.map((q) => `· ${q}`).join('\n') : '') : '',
    bye,
    sign ? `${M.first}\n${M.name} · ${M.title}` : '',
    ps ? ps.text : '',
    tests.length ? 'Free assessments, when you want to look deeper:\n' + tests.map((t) => `· ${t.n}: ${t.u}`).join('\n') : '',
  ].filter(Boolean).join('\n\n');
  return { html, text, replyTo: M.email, fromName: `${M.first} at ExploraSelf`, ...(receipt ? { receipt: true } : {}) };
}

/** A first name as people write it to a friend (Alexandru, 2 Nov 2026: a
 *  reset letter said "Hi ALEXANDRU"). A name typed all in capitals or all in
 *  small letters gets a capital at the start of each part ("ALEXANDRU" →
 *  "Alexandru", "anne-marie" → "Anne-Marie", "o'neil" → "O'Neil"); a name
 *  with its own mix of capitals ("McKenzie", "DeShawn") is left exactly as
 *  typed. Same rule in public/mentor/dash.js nameCase (a test holds them equal). */
export function nameCase(first) {
  const s = String(first || '').trim();
  if (!s || (s !== s.toUpperCase() && s !== s.toLowerCase())) return s;
  return s.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
}
const hi = (first) => (first ? `Hi ${nameCase(first)},` : 'Hi,');
/** The offer for one letter to one address, unless the caller chose one. */
const offerFor = (kind, to, tier, offer) => (offer !== undefined ? offer : 'unshakeable');
/** The close of a letter: who it is from, their time, which good word. */
/** The letters that open with Alexandru's personal first line. */
const INTRO = ['launchpad-welcome', 'results'];
const close = (kind, { mentor, tz, at, to = '' } = {}, ask = 'start') => ({ mentor, tz, at, ask, intro: INTRO.includes(kind), security: ask === 'security',
  seed: seedOf(`${kind}|${to}|${new Date(at || Date.now()).toISOString().slice(0, 10)}`) });
/** The same close, as a receipt (see letter(): receipt). */
const asReceipt = (c) => ({ ...c, receipt: true });
/** Which letters are receipts: they answer something the founder just did.
 *  The welcomes and every other letter stay as they are. */
export const RECEIPTS = ['unlocked', 'product', 'signin', 'reset', 'password', 'no-account', 'booking', 'booking-confirmed', 'booking-reminder-day', 'booking-reminder-hour'];

/** "launchpad-welcome": sent once, when the account is made. */
export function launchpadWelcome(base, { first, to = '', tier, offer, ...o } = {}) {
  return { subject: 'Welcome to The Founder Launchpad', ...letter(base, [
    hi(first),
    'You’re in. Welcome to The Founder Launchpad. I’m really glad you’re here.',
    'Start with Level 01 today. In about an hour you’ll have your business on paper, not only in your head.',
    `${asMentor(o.mentor).first} and the team read every word you write in there, and we’re cheering you on.`,
  ], offerFor('launchpad-welcome', to, tier, offer), close('launchpad-welcome', { ...o, to })) };
}

/** The one promotion in the Growth Toolkit welcome, matched to the founder
 *  (Alexandru, 2 Nov 2026): by the tool they opened, which says what is on
 *  their mind today; on the Tools page itself, by what they said they want
 *  most from the business. Only free things on exploraself.com: an
 *  assessment, an ebook or an article. Never the paid Unshakeable. */
const ES = 'https://exploraself.com';
export const TOOLKIT_OFFERS = {
  first100: { name: 'First 100 Clients assessment', line: () => ['When the numbers are tight, clients are the lever. The First 100 Clients assessment is free and takes ten minutes: ', link(`${ES}/first-100-clients`)] },
  twoweek: { name: 'The Two-Week Test', line: () => ['Could your business run two weeks without you? The Two-Week Test is free: twenty plain questions, and you see what breaks first. ', link(`${ES}/two-week-test`)] },
  tower: { name: 'Article: Lead from the tower', line: () => ['If the work keeps eating your evenings, read Lead from the tower: why focus is the first skill of leadership. ', link(`${ES}/resources/lead-from-the-tower`)] },
  unbound: { name: 'The Inner Boardroom assessment', line: () => ['Who really makes your business decisions? The Inner Boardroom assessment is free, and its ebook comes with it: ', link(`${ES}/unbound`)] },
  conversations: { name: 'Article: Win your first 100 perfect clients', line: () => ['On camera or on a call, people buy what they understand. Read Win your first 100 perfect clients with better conversations: ', link(`${ES}/resources/first-100-perfect-clients-communication-problem`)] },
  eq: { name: 'The EQ Dividend assessment', line: () => ['A team you can trust starts with how you lead under pressure. The EQ Dividend is free: twenty statements, five dividends. ', link(`${ES}/eq`)] },
};
/** Tool → offer, then the founder's answer to "What do you want most from
 *  the business?" (public/forms.js INTERESTS) → offer. */
export const TOOLKIT_BY_TOOL = { 'runway': 'first100', 'bottleneck': 'twoweek', 'off-switch': 'tower', '12-days': 'unbound', 'teleprompter': 'conversations' };
export const TOOLKIT_BY_INTEREST = { 'More free time': 'twoweek', 'Higher income': 'first100', 'Steady clients': 'conversations', 'A team I trust': 'eq', 'Clarity on direction': 'unbound', 'A new market': 'first100' };
export const toolkitOfferKey = ({ tool = '', interest = '' } = {}) => TOOLKIT_BY_TOOL[tool] || TOOLKIT_BY_INTEREST[interest] || 'twoweek';
export const BROADCAST = 'https://broadcast.exploraself.com';

/** "tools-welcome": "Welcome to the Growth Toolkit" (Alexandru, 2 Nov 2026).
 *  Sent once per address: at sign-up from a toolkit page, when an existing
 *  account taps "Yes, that's me", or when a code lets someone in
 *  (functions/_tools.js). `path` is the tool they came from, or the Tools
 *  page; `tool` and `interest` choose the P.S.; `account` false (a code
 *  holder) asks them to reply rather than use Base Camp. */
export function toolsWelcome(base, { first, to = '', tier, offer, path = '/tools/', tool = '', interest = '', account = true, ...o } = {}) {
  const home = /^\/[a-z0-9-]+\/$/.test(path) ? path : '/tools/';
  const t = tool || (home !== '/tools/' ? home.slice(1, -1) : '');
  const ps = offer !== undefined ? offer : TOOLKIT_OFFERS[toolkitOfferKey({ tool: t, interest })];
  return { subject: 'Welcome to the Growth Toolkit', ...letter(base, [
    hi(first),
    'Welcome to the Growth Toolkit. Here we go, to your growth.',
    'Each tool reads your own numbers and gives you one move for this week. Start with the one that brought you here.',
    button(`${base}${home}`, home === '/tools/' ? 'Open my Growth Toolkit →' : 'Open my tool →'),
    ['Every tool is on one page, in two lists, Personal leadership and Business: ', link(`${base}/tools/`)],
    account ? ['Any question? Ask your mentor at your Base Camp: ', link(`${base}/ground-plan/#ask`, 'Ask Alexandru')]
      : 'Any question? Ask your mentor: reply to this email.',
    ['And when you have a quiet minute, read the Broadcast: ', link(BROADCAST)],
  ], ps, close('launchpad-welcome', { ...o, to })) };
}

/** "toolkit-code": someone without an account asked to open the Growth
 *  Toolkit. The code (one for everybody), the button that opens it, and a
 *  look inside.
 *  A request letter, so its P.S. is a free gift, never a sale. `tools` is
 *  [[list name, [tool names]], …] from the Tools page. */
export function toolkitCodeLetter(base, { first, code, url, tools = [], to = '', ...o } = {}) {
  return { subject: `Your Growth Toolkit code: ${code}`, ...letter(base, [
    hi(first),
    'Of course, no problem. Thank you for asking. Here is your code for the Growth Toolkit:',
    String(code),
    button(url, 'Open my Growth Toolkit →'),
    'The button opens it with your code already in. Or go to the Tools page and type the code when it asks.',
    ...tools.map(([name, list]) => `${name}: ${list.join(' · ')}.`),
    'Each tool reads your own numbers and gives you one move for this week. Alexandru and the team are right here if you want help with any of it.',
  ], 'play', close('signin', { ...o, to }, 'security')) };
}

/** Sign-ups from a North Star page (/north1/, /north2/, /north3/, the North
 *  Star box) came for the North Star, so their welcome opens it; the
 *  Launchpad is the next step, not the subject (Alexandru, 30 Oct). The road
 *  pages (/road1/ … /road5/) and The Summit get the Launchpad welcome. */
export const NORTH_STAR_LANDINGS = ['compass', 'north1', 'north2', 'north3'];
/** The Massive Growth Plan, attached to the North Star welcome (Alexandru,
 *  31 Oct 2026). It is read from the private bucket, the same file as the
 *  Library's (functions/api/library.js, item mgp): no public address since
 *  4 Nov 2026. */
export const GROWTH_PLAN_PDF = { filename: 'North-Star-Massive-Growth-Plan.pdf', r2: 'massive-growth-plan.pdf' };

/** "northstar-welcome": sent once, when an account is made on a North Star page. */
export function northStarWelcome(base, { first, to = '', tier, offer, ...o } = {}) {
  return { subject: 'Your Leader’s North Star is open', ...letter(base, [
    hi(first),
    'You’re in. Your Leader’s North Star is open, and I’m really glad you’re here.',
    'Eight plain questions and your rough numbers. You’ll see where you stand in all four domains, and which one needs you first.',
    button(`${base}/northstar/`, 'Open my North Star →'),
    'Your North Star Massive Growth Plan is attached: 20 + 1 steps to accelerate your growth and win with grace. Print it and write by hand. It is waiting for you at the end of your North Star too, where you tick each step as you do it.',
    'When you’re ready to work on it, The Founder Launchpad is waiting at your Base Camp, free.',
  ], offerFor('launchpad-welcome', to, tier, offer), close('launchpad-welcome', { ...o, to })), attachments: [GROWTH_PLAN_PDF] };
}

/** The North Star results, as a letter. `weakest` is the full domain name, or
 *  empty when it is not known yet. */
export function resultsLetter(base, { first, weakest, to = '', tier, offer, ...o } = {}) {
  return { subject: 'Your Leader’s North Star', ...letter(base, [
    hi(first),
    'Here is your Leader’s North Star, ready whenever you are.',
    button(`${base}/northstar`, 'Open my North Star →'),
    weakest
      ? `Start with the domain that needs you most. For you that’s ${weakest}. One honest hour there changes more than a week anywhere else.`
      : 'Start with the domain that needs you most. One honest hour there changes more than a week anywhere else.',
  ], offerFor('results', to, tier, offer), close('results', { ...o, to }, 'results')) };
}

/** The one-time sign-in link. `reset`: the founder forgot their password. */
export function signinLetter(base, url, { first, to = '', offer, reset = false, ...o } = {}) {
  if (reset) return { subject: 'Choose a new password', ...letter(base, [
    hi(first),
    'No problem at all, it happens to all of us. Tap the button and you’ll land at your Base Camp with the password box already open.',
    button(url, 'Choose my new password →'),
    'The button works for the next 30 minutes, on your phone or your computer, until you save the new password. If you didn’t ask for this, you can simply ignore it.',
    'Thank you for keeping your account safe.',
  ], offerFor('signin', to, 'free', offer), asReceipt(close('signin', { ...o, to }, 'security'))) };
  return { subject: 'Your link to get back in', ...letter(base, [
    hi(first),
    'Good to see you again. Everything you wrote is right where you left it.',
    button(url, 'Sign me back in →'),
    'The button works for the next 30 minutes, on your phone or your computer.',
    'Thank you for coming back.',
  ], offerFor('signin', to, 'free', offer), asReceipt(close('signin', { ...o, to }, 'security'))) };
}

/** Someone asked for a sign-in or reset link for an address with no account
 *  (Alexandru, 2 Nov 2026: they should still get an email). A security
 *  letter: no paid offer, one thing to do. `url` opens the free account form
 *  with their email already in it. */
export function noAccountLetter(base, url, { reset = false, to = '', ...o } = {}) {
  return { subject: 'There’s no ExploraSelf account here yet', ...letter(base, [
    'Hi,',
    `Thank you for coming back. Someone, we hope you, asked for ${reset ? 'a password reset link' : 'a sign-in link'} for this address, but there’s no ExploraSelf account for it yet.`,
    'Making one is free and takes a minute. Your first three levels open straight away.',
    button(url, 'Make my free account →'),
    'If you used another email before, try that one. The team and I are here for you.',
  ], null, asReceipt(close('no-account', { ...o, to }, 'security'))) };
}

/** After a founder's FIRST password (Alexandru, 3 Nov 2026: a new buyer
 *  chose a password after paying and was told it "was changed"). A security
 *  letter: no offer, one useful place to go. */
export function passwordSetLetter(base, { first, to = '', offer, ...o } = {}) {
  return { subject: 'Your password is set', ...letter(base, [
    hi(first),
    'Welcome in, and thank you. Your password is set: from now on you sign in with your email and this password, on any device.',
    'Your Base Camp is ready whenever you are, and the team and I are here for you on the way.',
    button(`${base}/ground-plan/#home`, 'Open my Base Camp'),
    'If you did not choose a password on ExploraSelf, just reply to this email and we’ll lock the account straight away.',
  ], offerFor('password', to, 'free', offer), asReceipt(close('password', { ...o, to }, 'security'))) };
}

/** After a password is changed or reset (one was there before). A security letter. */
export function passwordChangedLetter(base, { first, to = '', offer, ...o } = {}) {
  return { subject: 'Your password was changed', ...letter(base, [
    hi(first),
    'Your password was just changed. If that was you, all is well and there’s nothing else to do.',
    'If it wasn’t, just reply to this email and we’ll lock the account straight away. Your work is safe with us.',
    'Thank you for keeping your account safe.',
  ], offerFor('password', to, 'free', offer), asReceipt(close('password', { ...o, to }, 'security'))) };
}

/** A letter from the mentor: their own words, one paragraph per blank line. */
export function mentorLetter(base, { subject, body, to = '', tier, offer, ...o } = {}) {
  const paras = String(body || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return { subject, ...letter(base, paras, offerFor('mentor', to, tier, offer), close('mentor', { ...o, to })) };
}

/** The mentor's answer in "Ask Alexandru", with the question it answers. */
export function answerLetter(base, { first, question, answer, to = '', tier, offer, ...o } = {}) {
  const q = String(question || '').trim();
  const paras = String(answer || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return { subject: 'An answer to your question', ...letter(base, [
    hi(first),
    'Thank you for your question.',
    `You asked: “${q.length > 300 ? q.slice(0, 300).trimEnd() + '…' : q}”`,
    ...paras,
    ['The whole conversation is waiting in ', link(`${base}/ground-plan/#ask`, 'your Base Camp'), '.'],
  ], offerFor('mentor', to, tier, offer), close('answer', { ...o, to })) };
}

/** "unlocked": the moment Stripe confirms a payment (functions/_stripe.js,
 *  Alexandru 2 Nov 2026): it's unlocked, here is what opened, which sessions
 *  they now have and the link to book them, and now we move forward. Only
 *  sent after Stripe itself said "paid" (AGENTS.md rule 6). No offer: they
 *  just bought. The words of each step come from STEPS in _stripe.js. */
export const UNLOCKED = {
  session: { name: 'The Boardroom', last: 5, extra: 'each one with its questions and its twenty actions', sessions: 'One 1:1 session with me. Before we speak, the team and I read your first three levels, so the time is spent on you, not on catching up.' },
  lab: { name: 'The LAB', last: 9, extra: 'each one with its questions and its twenty actions', sessions: 'Two 1:1 sessions with me in total: the Boardroom’s, and the second with the LAB.' },
  hub: { name: 'The HUB', last: 12, extra: 'with the LAB included and every resource. Nothing is held back', sessions: 'Three 1:1 sessions with me in total: the Boardroom’s, the LAB’s, and the third with the HUB.', books: true },
  premium: { name: 'The Summit', last: 12, extra: 'with the LAB, the HUB and every resource. Everything is yours', sessions: 'Me, every week. We will set the day together.', books: true },
};
/** The first level a payment opens: the step after the one they had. A
 *  higher step always includes every step below it (Alexandru, 2 Nov 2026). */
export const FIRST_NEW = { free: 4, session: 6, lab: 10, hub: 12, premium: 12 };
export function unlockedLetter(base, { first, step, from = 'free', to = '', ...o } = {}) {
  const U = UNLOCKED[step] || UNLOCKED.session;
  const pad2 = (n) => String(n).padStart(2, '0');
  const a = Math.min(FIRST_NEW[from] || 4, U.last);
  const opens = a >= U.last ? `Level ${pad2(U.last)} is open now, ${U.extra}.` : `Levels ${pad2(a)} ${U.last - a === 1 ? 'and' : 'to'} ${pad2(U.last)} are open now, ${U.extra}.`;
  return { subject: `It’s unlocked: ${U.name}`, ...letter(base, [
    hi(first),
    `Thank you. Your payment went through, and ${U.name} is yours.`,
    opens,
    `What you have with it: ${U.sessions.charAt(0).toLowerCase() + U.sessions.slice(1)}`,
    ['Book your session here, at a time that suits you: ', link(BOOKING)],
    // The two HUB books (Alexandru, 4 Nov 2026): they open with the HUB and The Summit.
    ...(U.books ? [['Your two HUB books are waiting in your library: Built to Lead and The Founder’s Growth Manual. ', link(`${base}/ground-plan/#library`, 'Open my library')]] : []),
    `Now we move forward. Level ${pad2(a)} is waiting for you in your Base Camp.`,
    button(`${base}/ground-plan/#programme-${a}`, `Open Level ${pad2(a)}`),
    'You chose to invest in yourself and your business. That decision is already a step. The team and I are here for you.',
  ], null, asReceipt(close('unlocked', { ...o, to }, ['How do I book my session?', 'Where should I start?', 'Can I have an invoice?']))) };
}

/** "product": a one-off product bought on Stripe from exploraself.com
 *  (functions/_stripe.js PRODUCTS, Alexandru 3 Nov 2026). Sent once, only
 *  after Stripe itself said "paid" (AGENTS.md rule 6). The button is the
 *  buyer's own access link: it opens the product on any phone or computer. */
export const PRODUCT_WORDS = {
  unshakeable: { name: 'The Unshakeable Assessment', what: 'The full Personal Leadership Audit, with your results and a printable certificate, on exploraself.com.', btn: 'Open my assessment' },
};
export function productLetter(base, { first, product, url = '', to = '', ...o } = {}) {
  const P = PRODUCT_WORDS[product] || PRODUCT_WORDS.unshakeable;
  return { subject: `It’s yours: ${P.name}`, ...letter(base, [
    hi(first),
    `Thank you. Your payment went through, and ${P.name} is yours.`,
    P.what,
    'The button below is your own access link. It opens it on any phone or computer, so keep this email.',
    button(url, P.btn),
    'Take your time with it, one question at a time. The team and I are here for you.',
  ], null, asReceipt(close('product', { ...o, to }, ['The button doesn’t work', 'Can I have an invoice?']))) };
}

/** "gift": Alexandru invites a founder from /mentor (Alexandru, 2 Nov 2026:
 *  "add somebody by email … decide ahead to what degree … at no cost"). The
 *  step he chose is open the moment the letter leaves; nothing to pay. A new
 *  account gets a button that signs them in and asks for a password (7 days);
 *  an existing one, a button that signs them in. No offer: it is a gift. */
export function giftLetter(base, { first, step = 'free', url = '', fresh = true, to = '', ...o } = {}) {
  const pad2 = (n) => String(n).padStart(2, '0');
  const U = UNLOCKED[step];
  const what = U ? `${U.name}` : 'The Founder’s Blueprint';
  return { subject: U ? `A gift from Alexandru: ${U.name}` : 'Your free place in The Founder’s Blueprint', ...letter(base, [
    hi(first),
    U ? `I have opened ${U.name} for you, as my gift. There is nothing to pay.`
      : 'I have opened a free account for you in The Founder’s Blueprint, so your place is ready.',
    U ? `Levels 01 to ${pad2(U.last)} are open for you now, ${U.extra}.` : 'Levels 01 to 03 are open for you now, with the manuals and the books in your library.',
    ...(U ? [`What you have with it: ${U.sessions.charAt(0).toLowerCase() + U.sessions.slice(1)}`, ['Book your session here, at a time that suits you: ', link(BOOKING)]] : []),
    fresh ? 'One step first: tap the button and choose your password. It signs you in on this device, and it works for the next 7 days.'
      : 'Tap the button and you arrive signed in. It works for the next 7 days.',
    button(url || `${base}/ground-plan/#signin`, fresh ? 'Set my password →' : `Open ${what} →`),
    'Start with Level 01: one question at a time, and ten minutes is enough for today. I am glad you are here. The team and I are here for you.',
  ], null, close('gift', { ...o, to }, U ? ['Where should I start?', 'How do I book my session?', 'The button doesn’t work'] : ['Where should I start?', 'What is in my library?', 'The button doesn’t work'])) };
}

/** "team-invite": to a new team member, once, when Alexandru adds their
 *  address in /mentor (Alexandru, 2 Nov 2026). Everything a team member sends
 *  goes out signed by Alexandru, and replies come back to him; they see the
 *  threads in /mentor. With an account: a button that lands them signed in
 *  (a one-time link, valid 7 days). Without one: make the free account with
 *  this address first. No offer: it is for the team, not a founder. */
/** The invitation to a new team member (Alexandru, 2 Nov 2026: "make them
 *  feel honoured to join"): the honour and the thanks, why ExploraSelf
 *  exists, its mission and vision word for word from exploraself.com (the
 *  home page's "Why we exist"), where they come in, then the one first step.
 *  Signed by Alexandru with his photo and handwritten signature; no founder
 *  encouragement line, no assessments, no offer. */
export const TEAM_WHY = 'The first system a founder leads is themselves.';
export const TEAM_MISSION = 'Equip leaders and entrepreneurs with tools and mentoring that turn self-understanding into clearer decisions and a growing business.';
export const TEAM_VISION = 'A community of unshakeable founders who lead themselves first, build businesses that grow with them, and equip and empower others in turn.';
export function teamInvite(base, { to = '', first = '', signinUrl = '', joinUrl = '', tz = '', at } = {}) {
  const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  return { subject: 'Welcome to the ExploraSelf team', ...letter(base, [
    hi(first),
    'It is an honour to welcome you to the ExploraSelf team. Thank you for saying yes.',
    `Here is why we exist: ${lc(TEAM_WHY)}`,
    `Our mission: to ${lc(TEAM_MISSION)}`,
    `Our vision: ${lc(TEAM_VISION)}`,
    'That last part is where you come in. Every question you answer and every letter you write helps a founder take their next step, in their work and in their life. That is real work, and it matters.',
    'We call ExploraSelf a Good People Company. Thank you for being one of the good people.',
    'In the mentor cockpit you see every founder: where they are, what they wrote and what they asked. You answer their questions, write to them, and help them on to their next step. Everything goes out signed by me, and their replies come back to me, so nothing gets lost.',
    signinUrl ? 'Your first step: tap the button. You arrive signed in. Then open Mentor in the menu under your name.'
      : `Your first step: make your free account with this address${to ? ` (${to})` : ''}. Then open the mentor cockpit.`,
    signinUrl ? button(signinUrl, 'Open my account') : button(joinUrl || `${base}/north3/#join`, 'Make my free account'),
    ['The mentor cockpit, any time: ', link(`${base}/mentor/`)],
    'I am glad we do this together. The team and I are here for you, any time. Welcome aboard.',
  ], null, { founder: false, tz, at, ask: ['Where do I start?', 'Can we talk this week?', 'I can’t open the mentor cockpit'] }) };
}

/** To Alexandru: a founder asked a question. Plain, no offer. */
/** A plain notice to Alexandru: a founder commented on a level's video. */
export function commentNotice(base, { name, email, comment, stage, level }) {
  return { subject: `New comment from ${name || email}`, ...letter(base, [
    `${name || 'A founder'} (${email}) commented on the video of level ${String(level).padStart(2, '0')} (${stage}):`,
    String(comment || ''),
    ['Read or hide comments in /mentor: ', link(`${base}/mentor`), '.'],
  ], null, { sign: false }) };
}

export function questionNotice(base, { name, email, question, level, domain }) {
  const where = [level ? `Level ${String(level).padStart(2, '0')}` : '', domain || ''].filter(Boolean).join(' · ');
  return { subject: `New question from ${name || email}`, ...letter(base, [
    `${name || 'A founder'} (${email}) asked in Ask Alexandru${where ? `, on ${where}` : ''}:`,
    String(question || ''),
    ['Answer it in /mentor: ', link(`${base}/mentor`), '.'],
  ], null, { sign: false }) };
}

/** To Alexandru: someone paid (functions/_stripe.js, Alexandru 3 Nov 2026:
 *  "everybody gets an answer … everybody's taken care of"). Sent once per
 *  payment, only after Stripe said paid. Plain, no offer. */
export function paymentNotice(base, { name, email, what, amount, test = false, fresh = false, from = '' } = {}) {
  return { subject: `${test ? '[Test] ' : ''}New payment: ${what}, ${amount}`, ...letter(base, [
    `${name || 'Someone'} (${email}) paid ${amount} for ${what}${test ? ', in Stripe test mode (no real money)' : ''}.`,
    fresh ? 'They paid before making an account: the account was made from their name and email, and they choose their password next.' : 'It is on their existing account.',
    ...(from ? [`They came from ${from}.`] : []),
    'They already have the letter with what opened and, for a step, the booking link for their 1:1.',
    ['See them in /mentor: ', link(`${base}/mentor`), '.'],
  ], null, { sign: false }) };
}

/** To Alexandru: a refund request from Base Camp (functions/api/refund.js). */
export function refundNotice(base, { name, email, what } = {}) {
  return { subject: `Refund request: ${what}, from ${name || email}`, ...letter(base, [
    `${name || 'Someone'} (${email}) asked for a refund of ${what}, from their Base Camp.`,
    'They were told you will get in touch with them personally. Nothing has been refunded yet: refunds are made in Stripe.',
    ['It is in /mentor → Refunds: ', link(`${base}/mentor`), '.'],
  ], null, { sign: false }) };
}

/** "refund": the person's copy of their refund request (Alexandru, 3 Nov
 *  2026: "we received your message, we're sorry, but we're happy we can help
 *  … here is the conversation … you'll be taken care of ASAP"). Signed by
 *  their mentor at ExploraSelf, never by Alexandru by name (he is the founder,
 *  teaching). It says the request arrived, never that money was refunded
 *  (AGENTS.md rule 6). `url` is their conversation in Base Camp. */
export function refundReceipt(base, { first, what, url = '' } = {}) {
  return { subject: 'We have your message about a refund', ...letter(base, [
    hi(first),
    `Thank you for writing to us. We received your request for a refund of ${what}.`,
    'We are sorry it is not right for you, and we are glad we can help.',
    ...(url ? ['Here is your conversation with ExploraSelf. We will take care of you there as soon as possible, and you will get an email each time there is a new message for you.', button(url, 'Open my conversation')]
      : ['We will take care of you as soon as possible, by email. If there is anything you want to tell us first, just reply to this email.']),
    'Your mentor at ExploraSelf',
  ], null, { sign: false }) };
}

/** "mentor-message": a new message in their conversation, from /mentor
 *  (Alexandru, 3 Nov 2026: "just a notification. Hey, there's a message for
 *  you from your mentor at ExploraSelf"). The words stay in Base Camp. */
export function messageNotice(base, { first, url = '' } = {}) {
  return { subject: 'There is a message for you from your mentor at ExploraSelf', ...letter(base, [
    hi(first),
    'There is a new message for you from your mentor at ExploraSelf.',
    button(url || `${base}/ground-plan/#ask`, 'Read my message'),
    'Your mentor at ExploraSelf',
  ], null, { sign: false }) };
}

// ── Booking a call (functions/api/book.js; Alexandru, 2 Nov 2026) ───────────
// Three letters: the person's copy of their request, the notice to
// Alexandru, and the confirmation with the Google Meet link, sent from
// /mentor (Inbox → Bookings → Confirm). Always from Alexandru, whoever the
// founder's mentor is: the call is with him. The two letters to the person are
// receipts (they answer what the person just did): no offer, no P.S.

/** The times (one to three), one per line, as the person reads them (their zone, and
 *  Rome beside it when the clocks differ). */
const timeLines = (times, tz) => times.map((iso) => `· ${timeLine(iso, tz)}`).join('\n');
/** Their answers, one per line ("· Where you are now: Selling alone"). */
const answerLines = (kind, answers, max = 200) => answersText(kind, answers, { max }).map(([l, w]) => `· ${l}: ${w}`).join('\n');
/** What helps before the call: the 1:1 is built on the first three levels;
 *  a discovery call starts from the decision they keep putting off. */
const beforeWeSpeak = (base, kind) => (kind === 'boardroom'
  ? ['Before we speak, the team and I read your first three levels, so the hour is spent on you. If one is still open, now is a good moment to finish it: ', link(`${base}/ground-plan/#home`, 'your Base Camp'), '.']
  : 'One thing helps before we speak: write down the one decision you keep putting off. Bring it to the call, and we start there.');

/** "booking": to the person who asked for a call on /book/discovery/ or
 *  /book/boardroom/. Thanks, their time or times (their zone and Rome), what
 *  they told us, "I'll confirm within 24 hours", Google Meet. */
export function bookingLetter(base, { first, phone = '', kind = 'discovery', times = [], answers = {}, tz = '', to = '', at } = {}) {
  const one = kind === 'boardroom';
  const told = answerLines(kind, answers);
  const many = times.length > 1;
  return { subject: `Your ${many ? 'times' : 'time'} for ${one ? 'your 1:1' : 'our call'}`, ...letter(base, [
    hi(first),
    one ? `Thank you for choosing your ${many ? 'times' : 'time'}. I’m looking forward to our hour together.`
      : 'Thank you for asking for a free discovery call. I’m glad you did.',
    `${many ? `Here are the ${times.length === 2 ? 'two' : 'three'} times you suggested` : 'Here is the time you suggested'} for ${one ? 'your 1:1' : 'our call'} (${KINDS[kind].minutes} minutes, online):`,
    timeLines(times, tz),
    `I’ll write back within ${RULES.confirmHours} hours to confirm ${many ? 'one of them' : 'it'}. We meet on ${RULES.where}: the link comes with my confirmation.`,
    // The gift (3 Nov 2026): its name and his approved words, one button.
    `Your gift: ${GIFTS[kind].name}. ${GIFTS[kind].line}`,
    button(giftHref(kind, 'email', base), 'Open my gift →'),
    told ? `What you told us:\n${told}` : '',
    phone ? `Your phone: ${phone}. If it is not right, just reply with the right one.` : '',
    beforeWeSpeak(base, kind),
    `Plans change: if ${many ? 'none of these times works' : 'this time no longer works'} any more, just reply with ${many ? 'new ones' : 'another'}. The team and I are here for you.`,
  ].filter(Boolean), null, asReceipt(close('booking', { tz, at, to }, null))) };
}

/** "Before we speak" / "Before your 1:1" (Alexandru, 6 Nov 2026): the text he
 *  wrote for this person in /mentor (Settings → Booking links pre-fills it),
 *  one paragraph per blank line; with none, the usual line (beforeWeSpeak). */
const prepBlock = (base, kind, prep) => {
  const parts = String(prep || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return [heading(kind === 'boardroom' ? 'Before your 1:1' : 'Before we speak'), ...(parts.length ? parts : [beforeWeSpeak(base, kind)])];
};

/** "booking-confirmed": Alexandru confirmed one of their times in /mentor.
 *  The time (their zone and Rome), the Google Meet button, what helps before
 *  the call. Sent only from /mentor, only with a Meet link. */
export function bookingConfirmedLetter(base, { first, kind = 'discovery', time = '', meet = '', prep = '', tz = '', to = '', at } = {}) {
  const one = kind === 'boardroom';
  const w = whenText(time, tz);
  return { subject: `Confirmed: ${one ? 'your 1:1' : 'our call'} on ${w.same ? w.romeDay : w.mine.split(',')[0]}`, ...letter(base, [
    hi(first),
    one ? 'Thank you for your patience. Your 1:1 is confirmed:' : 'Thank you for your patience. Our call is confirmed:',
    `${timeLine(time, tz)} · ${KINDS[kind].minutes} minutes, online, on ${RULES.where}.`,
    button(meet, 'Join on Google Meet →'),
    'At that time, tap the button and you’re in. Keep this email, so the link is at hand.',
    ...prepBlock(base, kind, prep),
    'If the time no longer works, just reply to this email and we find another. The team and I are here for you.',
  ], null, asReceipt(close('booking-confirmed', { tz, at, to }, null))) };
}

/** "booking-reminder-day": about 24 hours before a confirmed call (Alexandru,
 *  6 Nov 2026), from the hourly run (functions/_booking-reminders.js). His
 *  words, as the main chat wrote them for him. "Today" instead of "tomorrow"
 *  when the call falls on the same day where they live. */
export function bookingReminderDay(base, { first, kind = 'discovery', time = '', meet = '', prep = '', tz = '', to = '', at } = {}) {
  const one = kind === 'boardroom', when = sameDay(time, at || Date.now(), tz) ? 'today' : 'tomorrow';
  return { subject: `${when === 'today' ? 'Today' : 'Tomorrow'}: ${one ? 'your 1:1' : 'our call'} at ${clockText(time, tz)}`, ...letter(base, [
    hi(first),
    `A short reminder: ${one ? 'your 1:1' : 'our call'} is ${when}.`,
    `${timeLine(time, tz)} · ${KINDS[kind].minutes} minutes, online, on ${RULES.where}.`,
    button(meet, 'Join on Google Meet →'),
    ...prepBlock(base, kind, prep),
    'If the time no longer works, just reply to this email and we find another. The team and I are here for you.',
  ], null, asReceipt(close('booking-reminder-day', { tz, at, to }, null))) };
}

/** "booking-reminder-hour": about one hour before a confirmed call (the
 *  hourly run sends it 53 to 83 minutes before). */
export function bookingReminderHour(base, { first, kind = 'discovery', time = '', meet = '', prep = '', tz = '', to = '', at } = {}) {
  const one = kind === 'boardroom';
  return { subject: `In one hour: ${one ? 'your 1:1' : 'our call'}`, ...letter(base, [
    hi(first),
    `We speak in one hour, at ${clockText(time, tz)}.`,
    button(meet, 'Join on Google Meet →'),
    'At that time, tap the button and you’re in.',
    ...prepBlock(base, kind, prep),
    'See you soon.',
  ], null, asReceipt(close('booking-reminder-hour', { tz, at, to }, null))) };
}

/** To Alexandru: someone asked for a call. Who, which call, their times
 *  in Rome time (and theirs), everything they answered, where to confirm one
 *  (/mentor: the confirmation carries the Google Meet link), and a reply link.
 *  Plain, no offer. Replies go straight to the person. */
export function bookingNotice(base, { name, email, phone = '', kind = 'discovery', times = [], answers = {}, tz = '', step = '', account = false, about = '' } = {}) {
  const one = kind === 'boardroom';
  const zone = tz || RULES.zone;
  const away = zone !== RULES.zone;
  const all = answersText(kind, answers).map(([l, w]) => `· ${l}: ${w}`).join('\n');
  return { subject: `New ${one ? 'Boardroom 1:1' : 'discovery call'} request from ${name || email}`, ...letter(base, [
    `${name || 'Someone'} (${email}${phone ? `, ${phone}` : ''}) asked for ${one ? `their Boardroom 1:1 (60 minutes, paid${step ? `: ${step}` : ''})` : 'a free discovery call (30 minutes)'}, ${account ? 'with an account' : 'without an account'}.`,
    `${times.length > 1 ? `Their ${times.length === 2 ? 'two' : 'three'} times` : 'Their time'}, in Rome time${away ? ` (they are in ${cityOf(zone)})` : ''}:\n` + times.map((iso) => { const w = whenText(iso, zone); return `· ${w.rome}${w.same ? '' : ` (${w.mineShort})`}`; }).join('\n'),
    about ? `About: ${about} (the page that sent them).` : '',
    all ? `What they told us:\n${all}` : '',
    `Confirm ${times.length > 1 ? 'one' : 'it'} in /mentor, Inbox, Bookings: they get the time and the Google Meet link by email.`,
    button(`${base}/mentor/#inbox`, 'Confirm a time →'),
    ['Or reply to this email: it goes straight to them, ', link(`mailto:${email}`, email), '.'],
    phone ? ['Or write to them on WhatsApp: ', link(`https://wa.me/${waDigits(phone)}`, phone), '.'] : '',
    `They were told: Alexandru writes back within ${RULES.confirmHours} hours to confirm, online on ${RULES.where}.`,
  ].filter(Boolean), null, { sign: false }), replyTo: email };
}
