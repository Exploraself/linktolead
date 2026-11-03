// Receipts (Alexandru, 2 Nov 2026: "It's unlocked" landed in Gmail's
// Promotions tab). The letters that answer something the founder just did
// (It's unlocked, sign-in link, reset, password changed, no account yet) read
// as a receipt: one button (and the booking link in "It's unlocked"), no
// assessments, no P.S. offer, no one-tap questions, the signature in words,
// his photo kept, no unsubscribe header or link. Every other letter, the
// welcome first, stays exactly as it was. Run: node tests/receipts.test.mjs

import { unlockedLetter, productLetter, signinLetter, passwordChangedLetter, noAccountLetter, launchpadWelcome, northStarWelcome, bookingLetter, bookingConfirmedLetter, GOOD_WORDS, RECEIPTS, BOOKING } from '../functions/_letters.js';
import { send } from '../functions/_mail.js';
import { fakeResend, tally } from './_d1.mjs';

const { ok, done } = tally('receipts');
const B = 'https://linktolead.exploraself.com';
const env = { RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
const links = (html) => [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);

const receipts = {
  unlocked: unlockedLetter(B, { first: 'Maya', step: 'session', to: 'maya@example.com' }),
  signin: signinLetter(B, `${B}/start?signin=abc`, { first: 'Maya', to: 'maya@example.com' }),
  reset: signinLetter(B, `${B}/start?signin=abc&reset=1`, { first: 'Maya', reset: true, to: 'maya@example.com' }),
  password: passwordChangedLetter(B, { first: 'Maya', to: 'maya@example.com' }),
  'no-account': noAccountLetter(B, `${B}/road1/?email=x#join`, { to: 'x@example.com' }),
  // A request for a call, and its confirmation (Alexandru, 2 Nov 2026).
  booking: bookingLetter(B, { first: 'Maya', kind: 'discovery', times: ['2026-11-10T15:00:00.000Z', '2026-11-11T15:00:00.000Z', '2026-11-12T15:00:00.000Z'],
    answers: { stage: 'solo', struggles: ['clients', 'cash'], goals: ['clients', 'cash'] }, tz: 'Europe/London', to: 'maya@example.com' }),
  product: productLetter(B, { first: 'Maya', product: 'unshakeable', url: 'https://exploraself.com/unshakeable?access=cs_test_abc', to: 'maya@example.com' }),
  'booking-confirmed': bookingConfirmedLetter(B, { first: 'Maya', kind: 'boardroom', time: '2026-11-10T15:00:00.000Z', meet: 'https://meet.google.com/abc-defg-hij', tz: 'Europe/London', to: 'maya@example.com' }),
};
ok(Object.keys(receipts).every((k) => RECEIPTS.includes(k)) && RECEIPTS.length === Object.keys(receipts).length, 'eight receipts, named in one list');
for (const [name, L] of Object.entries(receipts)) {
  ok(L.receipt === true, `${name}: marked as a receipt`);
  ok(!/Free assessments/.test(L.text) && !L.html.includes('exploraself.com/first-100-clients') && !L.html.includes('exploraself.com/eq'), `${name}: no assessments`);
  ok(!/\n\nP\.S\. /.test(L.text) && !L.html.includes('P.S.'), `${name}: no P.S. offer`);
  ok(!/mailto:/.test(L.html) && !/One tap to ask/i.test(L.html), `${name}: no one-tap questions`);
  ok(L.html.includes('/mail/alexandru.jpg'), `${name}: his photo is kept`);
  ok(!L.html.includes('/mail/signature.png') && /italic 22px[^>]*>Alexandru</.test(L.html), `${name}: the signature in words, not a picture`);
  ok(/^Hi\b/.test(L.text) && /Thank you/.test(L.text), `${name}: greets and thanks`);
  ok(GOOD_WORDS.some((g) => L.text.includes(g)) && /reply to this email/i.test(L.text), `${name}: encourages, and says we are here (reply)`);
}
// One button, plus the booking link in "It's unlocked".
const U = links(receipts.unlocked.html);
ok(U.length === 2 && U.some((u) => u.includes('/ground-plan/#programme-4')) && U.some((u) => u === BOOKING) && BOOKING === `${B}/book/boardroom/`, 'It’s unlocked: one button and the booking link (/book/boardroom/), nothing else');
for (const name of ['signin', 'reset', 'password', 'no-account']) ok(links(receipts[name].html).length <= 1, `${name}: one button at most`);
// The booking letters: the copy has no button at all; the confirmation one, the Google Meet link.
// The gift link (Alexandru, 3 Nov 2026: approved): one button, the gift, and nothing to sell.
const BK = links(receipts.booking.html);
ok(BK.length === 1 && BK[0] === `${B}/northstar/?utm_source=email&amp;utm_medium=gift&amp;utm_campaign=discovery`, 'booking: one button, the gift (The Leader’s North Star), nothing to sell');
const C = links(receipts['booking-confirmed'].html);
ok(C.length === 2 && C[0] === 'https://meet.google.com/abc-defg-hij' && C[1].endsWith('/ground-plan/#home'), 'booking-confirmed: the Google Meet button, and the way to their first three levels');

// Sending: a receipt goes without the unsubscribe header and link; the "why you got this" line stays.
let sent = fakeResend();
await send(env, { to: 'maya@example.com', ...receipts.unlocked, why: 'You paid for The Boardroom.', unsubUrl: `${B}/api/unsubscribe?u=1` });
let b = sent[0].body;
ok(!b.headers && !b.html.includes('/api/unsubscribe') && !b.text.includes('Unsubscribe:'), 'a receipt: no List-Unsubscribe header, no unsubscribe link');
ok(b.text.includes('You paid for The Boardroom.') && b.text.includes('Via Esempio 1'), 'a receipt still says why they got it, and the address');

// Every other letter is exactly as before.
sent = fakeResend();
const W = launchpadWelcome(B, { first: 'Maya', to: 'maya@example.com' });
await send(env, { to: 'maya@example.com', ...W, why: 'You made an account.', unsubUrl: `${B}/api/unsubscribe?u=1` });
b = sent[0].body;
ok(!W.receipt && W.html.includes('/mail/signature.png') && /Free assessments/.test(W.text) && /\n\nP\.S\. /.test(W.text) && /mailto:/.test(W.html), 'the welcome: unchanged (signature picture, assessments, P.S., one-tap questions)');
ok(b.headers && b.headers['List-Unsubscribe'] && b.html.includes('/api/unsubscribe'), 'the welcome: still with its unsubscribe header and link');
const N = northStarWelcome(B, { first: 'Maya' });
ok(!N.receipt && N.html.includes('/mail/signature.png'), 'the North Star welcome: unchanged');

done();
