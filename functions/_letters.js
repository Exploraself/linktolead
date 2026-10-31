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

/** The same link as BOOKING in public/content.js (a test holds them equal). */
export const BOOKING = 'https://forms.gle/opnxfhFTJJg69Qy77';
export const SIGNATURE = '/mail/signature.png';
export const PORTRAIT = '/mail/alexandru.jpg';

const LINK = Symbol('link');
/** A link inside a paragraph: shown as its address, in both parts. */
export const link = (url, label) => ({ [LINK]: true, url, label: label || url.replace(/^https?:\/\//, '') });
const BUTTON = Symbol('button');
/** The one main action of a letter, as its own paragraph: a gold button in
 *  the html (a table, so every inbox draws it), "label: url" in plain text. */
export const button = (url, label) => ({ [BUTTON]: true, url, label });

/** The offers, each a paragraph after "P.S.". `tier` hides an offer the
 *  founder already holds (The Boardroom, once they are in it). */
export const OFFERS = {
  boardroom: { paid: true, line: () => ['Want to look at your answers together? Book a 1:1 with me in The Boardroom: ', link(BOOKING)] },
  unshakeable: { paid: true, line: () => ['One thing I’d love you to try: the Unshakeable assessment. It shows how steady you stay when the pressure comes, and where to start building. It’s $9.99 (valued at $199). ', link('https://exploraself.com/unshakeable', 'Take the Unshakeable assessment →')] },
  play: { paid: false, line: () => ['Got ten minutes? Play Leadionaire: fifteen decisions, thirty seconds each. It shows how you choose under pressure: ', link('https://exploraself.com/play')] },
  first100: { paid: false, line: () => ['If clients are the next thing on your mind, the First 100 Clients assessment is free and takes ten minutes: ', link('https://exploraself.com/first-100-clients')] },
  library: { paid: false, line: (base) => ['While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. ', link(`${base}/ground-plan/#library`)] },
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
  const list = Array.isArray(p) ? p : [p];
  const html = list.map((x) => (x && x[LINK] ? `<a href="${esc(x.url)}" style="color:${GOLD_INK}">${esc(x.label)}</a>` : esc(x))).join('');
  const text = list.map((x) => (x && x[LINK] ? x.url : String(x))).join('');
  return { html, text };
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
export function letter(base, paras, offer = null, { sign = true, mentor, tz = '', at, ask = 'start', seed = 0 } = {}) {
  const M = asMentor(mentor);
  const pic = (u) => (/^https:\/\//.test(u) ? u : `${base}${u}`);
  const P = paras.map(parts);
  // The personal first line, right after the greeting.
  if (sign && P.length && /^Hi\b/.test(P[0].text || '')) P.splice(1, 0, parts(opener(M)));
  const tests = sign ? threeAssessments(seed) : [];
  const ps = offer && OFFERS[offer] ? parts(['P.S. ', ...OFFERS[offer].line(base)]) : null;
  const good = sign ? GOOD_WORDS[seed % GOOD_WORDS.length] : '';
  const qs = !sign || ask === null ? [] : Array.isArray(ask) ? ask : (SHORTCUTS[ask] || SHORTCUTS.start);
  const bye = sign ? farewell(tz, at) : '';
  const replyLine = 'Any question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.';
  const html = `<!doctype html><html><body style="margin:0;background:${PAPER}"><div style="max-width:560px;margin:0 auto;padding:32px 22px;background:${PAPER};font:16px/1.7 Georgia,'Times New Roman',serif;color:${INK}">
    ${P.map((p) => (p.button ? p.html : `<p style="margin:0 0 16px;white-space:pre-wrap">${p.html}</p>`)).join('\n    ')}
    ${good ? `<p style="margin:0 0 16px">${esc(good)}</p>` : ''}
    ${sign ? `<p style="margin:0 0 ${qs.length ? 10 : 16}px">${esc(replyLine)}</p>` : ''}
    ${qs.length ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;border-left:2px solid #B4975F"><tr><td style="padding:2px 0 2px 14px;font:14px/1.5 Arial,sans-serif;color:${MUTED}">
      <p style="margin:0 0 6px;font:bold 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${GOLD_INK}">One tap to ask</p>
      ${qs.map((q) => `<p style="margin:0 0 6px"><a href="${esc(mailto(M.email, q))}" style="color:${GOLD_INK};text-decoration:underline">${esc(q)}</a></p>`).join('')}
    </td></tr></table>` : ''}
    ${bye ? `<p style="margin:0 0 6px">${esc(bye)}</p>` : ''}
    ${sign ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px"><tr>
      <td style="vertical-align:middle;padding-right:14px"><img src="${esc(pic(M.photo))}" width="64" height="64" alt="${esc(M.name)}" style="display:block;width:64px;height:64px;border-radius:50%;border:2px solid #B4975F"></td>
      <td style="vertical-align:middle"><img src="${esc(pic(M.signature))}" width="190" height="53" alt="${esc(M.first)}" style="display:block;margin:0 0 2px;border:0;width:190px;height:auto">
      <p style="margin:0;font:13px/1.5 Arial,sans-serif;color:${MUTED}">${esc(M.name)} · ${esc(M.title)}</p></td></tr></table>` : ''}
    ${ps ? `<p style="margin:0;padding-top:14px;border-top:1px dashed #D6C9AC;font-style:italic">${ps.html}</p>` : ''}
    ${tests.length ? `<p style="margin:14px 0 0;font:14px/1.6 Arial,sans-serif;color:${MUTED}">Free assessments, when you want to look deeper: ${tests.map((t) => `<a href="${esc(t.u)}" style="color:${GOLD_INK};text-decoration:underline">${esc(t.n)}</a>`).join(' · ')}</p>` : ''}
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
  return { html, text, replyTo: M.email, fromName: `${M.first} at ExploraSelf` };
}

const hi = (first) => (first ? `Hi ${first},` : 'Hi,');
/** The offer for one letter to one address, unless the caller chose one. */
const offerFor = (kind, to, tier, offer) => (offer !== undefined ? offer : 'unshakeable');
/** The close of a letter: who it is from, their time, which good word. */
const close = (kind, { mentor, tz, at, to = '' } = {}, ask = 'start') => ({ mentor, tz, at, ask, seed: seedOf(`${kind}|${to}|${new Date(at || Date.now()).toISOString().slice(0, 10)}`) });

/** "launchpad-welcome": sent once, when the account is made. */
export function launchpadWelcome(base, { first, to = '', tier, offer, ...o } = {}) {
  return { subject: 'Welcome to The Founder Launchpad', ...letter(base, [
    hi(first),
    'You’re in. Welcome to The Founder Launchpad. I’m really glad you’re here.',
    'Start with Level 01 tonight. In about an hour you’ll have your business on paper, not only in your head.',
    `${asMentor(o.mentor).first} and the team read every word you write in there, and we’re cheering you on.`,
  ], offerFor('launchpad-welcome', to, tier, offer), close('launchpad-welcome', { ...o, to })) };
}

/** Sign-ups from a North Star page (road2, north2 (landing road21), the North Star box) came
 *  for the North Star, so their welcome opens it; the Launchpad is the next
 *  step, not the subject (Alexandru, 30 Oct). */
export const NORTH_STAR_LANDINGS = ['road2', 'road21', 'compass', 'north1'];

/** "northstar-welcome": sent once, when an account is made on a North Star page. */
export function northStarWelcome(base, { first, to = '', tier, offer, ...o } = {}) {
  return { subject: 'Your Leader’s North Star is open', ...letter(base, [
    hi(first),
    'You’re in. Your Leader’s North Star is open, and I’m really glad you’re here.',
    'Eight plain questions and your rough numbers. You’ll see where you stand in all four domains, and which one needs you first.',
    button(`${base}/northstar/`, 'Open my North Star →'),
    'When you’re ready to work on it, The Founder Launchpad is waiting at your Base Camp, free.',
  ], offerFor('launchpad-welcome', to, tier, offer), close('launchpad-welcome', { ...o, to })) };
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
  ], offerFor('signin', to, 'free', offer), close('signin', { ...o, to }, 'security')) };
  return { subject: 'Your link to get back in', ...letter(base, [
    hi(first),
    'Good to see you again. Everything you wrote is right where you left it.',
    button(url, 'Sign me back in →'),
    'The button works for the next 30 minutes, on your phone or your computer.',
  ], offerFor('signin', to, 'free', offer), close('signin', { ...o, to }, 'security')) };
}

/** After a password is set, changed or reset. A security letter. */
export function passwordChangedLetter(base, { first, to = '', offer, ...o } = {}) {
  return { subject: 'Your password was changed', ...letter(base, [
    hi(first),
    'Your password was just changed. If that was you, all is well and there’s nothing else to do.',
    'If it wasn’t, just reply to this email and we’ll lock the account straight away. Your work is safe with us.',
  ], offerFor('password', to, 'free', offer), close('password', { ...o, to }, 'security')) };
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
    `You asked: “${q.length > 300 ? q.slice(0, 300).trimEnd() + '…' : q}”`,
    ...paras,
    ['The whole conversation is waiting in ', link(`${base}/ground-plan/#ask`, 'your Base Camp'), '.'],
  ], offerFor('mentor', to, tier, offer), close('answer', { ...o, to })) };
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
