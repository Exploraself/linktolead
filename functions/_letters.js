// Every email is a short letter from Alexandru: paper background, Georgia,
// 16px, no banner, no buttons, plain links, his signature, a P.S. Sent by
// Resend through _mail.js, which adds the footer (why it came, unsubscribe,
// postal address). Mailchimp sends nothing.
//
// The signature is an image (/mail/signature.png, "Alexandru" in a handwriting
// font, to be replaced by a scan of his real one): inbox apps do not load
// handwriting fonts. Every letter has a plain-text part.
//
// The P.S. rotates. Paid offers only on the welcome, the results and mentor
// letters; security letters (sign-in, password) get free offers only. No
// countdowns, no invented scarcity.

import { esc } from './_mail.js';

/** The same link as BOOKING in public/content.js (a test holds them equal). */
export const BOOKING = 'https://forms.gle/opnxfhFTJJg69Qy77';
export const SIGNATURE = '/mail/signature.png';

const LINK = Symbol('link');
/** A link inside a paragraph: shown as its address, in both parts. */
export const link = (url, label) => ({ [LINK]: true, url, label: label || url.replace(/^https?:\/\//, '') });

/** The offers, each a paragraph after "P.S.". `tier` hides an offer the
 *  founder already holds (The Boardroom, once they are in it). */
export const OFFERS = {
  boardroom: { paid: true, line: () => ['Want to look at your answers together? Book a 1:1 with me in The Boardroom: ', link(BOOKING)] },
  unshakeable: { paid: true, line: () => ['If you want to test how steady you are under pressure, the Unshakeable audit is $9.99 (valued at $199): ', link('https://exploraself.com/unshakeable')] },
  play: { paid: false, line: () => ['Got ten minutes? Play Leadionaire: fifteen decisions, thirty seconds each. It shows how you choose under pressure: ', link('https://exploraself.com/play')] },
  first100: { paid: false, line: () => ['If clients are the next thing on your mind, the First 100 Clients assessment is free and takes ten minutes: ', link('https://exploraself.com/first-100-clients')] },
  library: { paid: false, line: (base) => ['While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. ', link(`${base}/start#library`)] },
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
  const list = Array.isArray(p) ? p : [p];
  const html = list.map((x) => (x && x[LINK] ? `<a href="${esc(x.url)}" style="color:${GOLD_INK}">${esc(x.label)}</a>` : esc(x))).join('');
  const text = list.map((x) => (x && x[LINK] ? x.url : String(x))).join('');
  return { html, text };
}

/**
 * One letter. `paras` is a list of paragraphs, each a string or a list of
 * strings and link()s. `offer` is an OFFERS key or null. `sign` false leaves
 * out the signature (the notice to Alexandru himself). Returns { html, text }
 * for send().
 */
export function letter(base, paras, offer = null, { sign = true } = {}) {
  const P = paras.map(parts);
  const ps = offer && OFFERS[offer] ? parts(['P.S. ', ...OFFERS[offer].line(base)]) : null;
  const html = `<!doctype html><html><body style="margin:0;background:${PAPER}"><div style="max-width:560px;margin:0 auto;padding:32px 22px;background:${PAPER};font:16px/1.7 Georgia,'Times New Roman',serif;color:${INK}">
    ${P.map((p) => `<p style="margin:0 0 16px;white-space:pre-wrap">${p.html}</p>`).join('\n    ')}
    ${sign ? `<img src="${esc(base)}${SIGNATURE}" width="180" height="72" alt="Alexandru" style="display:block;margin:10px 0 2px;border:0">
    <p style="margin:0 0 22px;font:13px/1.5 Arial,sans-serif;color:${MUTED}">Alexandru Cojocari · ExploraSelf</p>` : ''}
    ${ps ? `<p style="margin:0;padding-top:14px;border-top:1px dashed #D6C9AC;font-style:italic">${ps.html}</p>` : ''}
  </div></body></html>`;
  const text = [P.map((p) => p.text).join('\n\n'), sign ? 'Alexandru\nAlexandru Cojocari · ExploraSelf' : '', ps ? ps.text : ''].filter(Boolean).join('\n\n');
  return { html, text };
}

const hi = (first) => (first ? `Hi ${first},` : 'Hi,');
const day = () => Math.floor(Date.now() / 86400000);
/** The offer for one letter to one address, unless the caller chose one. */
const offerFor = (kind, to, tier, offer) => (offer !== undefined ? offer : pickOffer(kind, { seed: seedOf(`${to}|${kind}|${day()}`), tier }));

/** "launchpad-welcome": sent once, when the account is made. */
export function launchpadWelcome(base, { first, to = '', tier, offer } = {}) {
  return { subject: 'Welcome to The Founder Launchpad', ...letter(base, [
    hi(first),
    'You’re in. Welcome to The Founder Launchpad.',
    'Start with Level 01 tonight. In about an hour you’ll have your business on paper, not only in your head.',
    'Alexandru and the team read what you write in there. If something lands, or doesn’t, reply to this email. It comes to me.',
  ], offerFor('launchpad-welcome', to, tier, offer)) };
}

/** The Compass results, as a letter. `weakest` is the full domain name, or
 *  empty when it is not known yet. */
export function resultsLetter(base, { first, weakest, to = '', tier, offer } = {}) {
  return { subject: 'Your Leadership Compass', ...letter(base, [
    hi(first),
    ['Here is your Leadership Compass: ', link(`${base}/compass`), '.'],
    weakest
      ? `Start with the domain that needs you most. For you that’s ${weakest}. One honest hour there changes more than a week anywhere else.`
      : 'Start with the domain that needs you most. One honest hour there changes more than a week anywhere else.',
  ], offerFor('results', to, tier, offer)) };
}

/** The one-time sign-in link. A security letter: free offers only. */
export function signinLetter(base, url, { first, to = '', offer } = {}) {
  return { subject: 'Your link to get back in', ...letter(base, [
    hi(first),
    ['Here is your link to get back in: ', link(url, url), '. It works once, for 30 minutes.'],
  ], offerFor('signin', to, 'free', offer)) };
}

/** After a password is set, changed or reset. A security letter. */
export function passwordChangedLetter(base, { first, to = '', offer } = {}) {
  return { subject: 'Your password was changed', ...letter(base, [
    hi(first),
    'Your password was just changed. If that was you, there is nothing to do.',
    'If it wasn’t, reply to this email straight away and we’ll lock the account.',
  ], offerFor('password', to, 'free', offer)) };
}

/** A note from Alexandru: his own words, one paragraph per blank line. */
export function mentorLetter(base, { subject, body, to = '', tier, offer } = {}) {
  const paras = String(body || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return { subject, ...letter(base, paras, offerFor('mentor', to, tier, offer)) };
}

/** Alexandru's answer in "Ask Alexandru", with the question it answers. */
export function answerLetter(base, { first, question, answer, to = '', tier, offer } = {}) {
  const q = String(question || '').trim();
  const paras = String(answer || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return { subject: 'An answer to your question', ...letter(base, [
    hi(first),
    `You asked: “${q.length > 300 ? q.slice(0, 300).trimEnd() + '…' : q}”`,
    ...paras,
    ['The whole conversation is in your Ground Plan: ', link(`${base}/start#ask`), '.'],
  ], offerFor('mentor', to, tier, offer)) };
}

/** To Alexandru: a founder asked a question. Plain, no offer. */
export function questionNotice(base, { name, email, question, level, domain }) {
  const where = [level ? `Level ${String(level).padStart(2, '0')}` : '', domain || ''].filter(Boolean).join(' · ');
  return { subject: `New question from ${name || email}`, ...letter(base, [
    `${name || 'A founder'} (${email}) asked in Ask Alexandru${where ? `, on ${where}` : ''}:`,
    String(question || ''),
    ['Answer it in /mentor: ', link(`${base}/mentor`), '.'],
  ], null, { sign: false }) };
}
