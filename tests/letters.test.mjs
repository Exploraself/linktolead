// Every email is a letter from Alexandru: the words, the look (Georgia, 16px,
// 560px, no banner, no buttons, plain links, the signature image, a
// plain-text part), the P.S. offers (paid only where allowed, free on
// security letters), and the routes that send them: the welcome, the results,
// the sign-in link, the password letter and the mentor's notes. No network:
// Resend is faked.

import { launchpadWelcome, resultsLetter, signinLetter, passwordChangedLetter, mentorLetter, answerLetter, questionNotice,
  pickOffer, OFFERS, PAID_KINDS, BOOKING as LETTER_BOOKING, seedOf } from '../functions/_letters.js';
import { BOOKING } from '../public/content.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as signinPost } from '../functions/api/signin.js';
import { onRequestPost as password } from '../functions/api/password.js';
import { onRequestPost as sendPlan } from '../functions/api/send-plan.js';
import { onRequestPost as compassPost } from '../functions/api/compass.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';

const { ok, done } = tally('letters');
const B = 'https://linktolead.exploraself.com';
const paras = (text) => text.split('\n\n');

// ── The words, exactly ──────────────────────────────────────────────────────
let L = launchpadWelcome(B, { first: 'Maria', offer: 'boardroom' });
ok(L.subject === 'Welcome to The Founder Launchpad', 'welcome: subject');
ok(JSON.stringify(paras(L.text).slice(0, 4)) === JSON.stringify(['Hi Maria,', 'You’re in. Welcome to The Founder Launchpad. I’m really glad you’re here.',
  'Start with Level 01 tonight. In about an hour you’ll have your business on paper, not only in your head.',
  'Alexandru and the team read what you write in there. If something lands, or doesn’t, reply to this email. It comes to me.']), 'welcome: the four paragraphs');
ok(L.text.includes('\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Want to look at your answers together? Book a 1:1 with me in The Boardroom: ' + BOOKING), 'welcome: signed, then the Boardroom P.S. with the booking link');
ok(LETTER_BOOKING === BOOKING, 'the booking link is the one in content.js');

L = resultsLetter(B, { first: 'Maria', weakest: 'Lead your people', offer: 'unshakeable' });
ok(L.subject === 'Your Leadership Compass' && paras(L.text)[1] === 'Here is your Leadership Compass, ready whenever you are.' && paras(L.text)[2] === `Open my Compass →: ${B}/compass`, 'results: subject and the button');
ok(L.html.includes(`<a href="${B}/compass" style="display:block;padding:14px 26px`) && L.html.includes('background:#C9A24A'), 'results: a gold button in the html');
ok(paras(L.text)[3] === 'Start with the domain that needs you most. For you that’s Lead your people. One honest hour there changes more than a week anywhere else.', 'results: the weakest domain, in full');
ok(L.text.includes('P.S. One thing I’d love you to try: the Unshakeable assessment. It shows how steady you stay when the pressure comes, and where to start building. It’s $9.99 (valued at $199). https://exploraself.com/unshakeable') && L.html.includes('>Take the Unshakeable assessment →</a>'), 'results: the Unshakeable P.S., with a readable link');
ok(!resultsLetter(B, { first: 'Maria', offer: null }).text.includes('For you that’s'), 'results: no domain named when none is known');

L = signinLetter(B, `${B}/start?signin=abc`, { first: 'Maria', offer: 'play' });
ok(L.subject === 'Your link to get back in' && paras(L.text)[1] === 'Good to see you again. Everything you wrote is right where you left it.' && paras(L.text)[2] === `Sign me back in →: ${B}/start?signin=abc` && paras(L.text)[3] === 'The button works once, for the next 30 minutes.', 'sign-in: subject, words and the button');
ok(L.text.includes('P.S. Got ten minutes? Play Leadionaire: fifteen decisions, thirty seconds each. It shows how you choose under pressure: https://exploraself.com/play'), 'sign-in: the game P.S.');

L = passwordChangedLetter(B, { first: 'Maria', offer: 'first100' });
ok(L.subject === 'Your password was changed' && paras(L.text)[1] === 'Your password was just changed. If that was you, all is well and there’s nothing else to do.'
  && paras(L.text)[2] === 'If it wasn’t, just reply to this email and we’ll lock the account straight away. Your work is safe with us.', 'password: subject and words');
ok(L.text.includes('P.S. If clients are the next thing on your mind, the First 100 Clients assessment is free and takes ten minutes: https://exploraself.com/first-100-clients'), 'password: the First 100 Clients P.S.');
ok(passwordChangedLetter(B, { first: 'Maria', offer: 'library' }).text.includes(`P.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. ${B}/start#library`), 'the library P.S.');
ok(launchpadWelcome(B, { offer: null }).text.startsWith('Hi,\n\n'), 'no first name: "Hi,"');

// ── The look ────────────────────────────────────────────────────────────────
L = mentorLetter(B, { subject: 'A <test>', body: 'First <b>line</b> & more.\n\nSecond paragraph.', offer: 'play' });
ok(/font:16px\/1\.7 Georgia/.test(L.html) && L.html.includes('max-width:560px') && /background:#FFFDF8/.test(L.html), 'look: Georgia 16px, 560px, paper');
ok(L.html.includes(`<img src="${B}/mail/signature.png" width="150"`) && L.html.includes('alt="Alexandru"') && L.html.includes('Alexandru Cojocari · ExploraSelf'), 'look: the signature image and the line under it');
ok(L.html.includes(`<img src="${B}/mail/alexandru.jpg" width="64" height="64"`) && L.html.includes('border-radius:50%'), 'look: Alexandru’s round photo beside the signature');
ok(!/inline-block|<button|letter-spacing:3px/.test(L.html), 'look: no buttons, no banner');
ok(L.html.includes('First &lt;b&gt;line&lt;/b&gt; &amp; more.') && !L.html.includes('<b>line'), 'mentor letter: his text escaped');
ok(paras(L.text)[0] === 'First <b>line</b> & more.' && paras(L.text)[1] === 'Second paragraph.', 'mentor letter: his own words, his paragraphs, in the plain-text part');
ok(L.html.includes('<a href="https://exploraself.com/play" style="color:#6E5213">exploraself.com/play</a>'), 'plain text links in the html');
L = answerLetter(B, { first: 'Ana', question: 'Where do I start?', answer: 'With level 01.', offer: 'boardroom' });
ok(L.subject === 'An answer to your question' && L.text.includes('You asked: “Where do I start?”') && L.text.includes('With level 01.') && L.text.includes(`${B}/start#ask`), 'answer letter: the question, the answer, the thread');
L = questionNotice(B, { name: 'Ana Pop', email: 'ana@example.com', question: 'Where do I start?', level: 2, domain: 'Lead yourself' });
ok(L.subject === 'New question from Ana Pop' && L.text.includes('Level 02 · Lead yourself') && !L.text.includes('P.S.') && !L.html.includes('signature.png'), 'notice to Alexandru: plain, no offer, not signed');

// ── The P.S. rotation ───────────────────────────────────────────────────────
const seen = (kind, tier) => new Set(Array.from({ length: 60 }, (_, seed) => pickOffer(kind, { seed, tier })));
for (const kind of ['signin', 'password']) ok([...seen(kind)].every((k) => !OFFERS[k].paid) && seen(kind).size === 3, `${kind}: free offers only, all three rotate`);
for (const kind of PAID_KINDS) ok(seen(kind).has('boardroom') && seen(kind).has('unshakeable') && seen(kind).has('play'), `${kind}: paid offers, and free ones rotate in`);
ok(!seen('launchpad-welcome', 'session').has('boardroom') && !seen('mentor', 'premium').has('boardroom'), 'no Boardroom offer to a founder already in it');
ok(seedOf('a') === seedOf('a') && seedOf('a') !== seedOf('b'), 'the rotation is stable for the same letter');
ok(!Object.values(OFFERS).some((o) => /only|left|hurry|today|ends|last chance/i.test(o.line(B).join(''))), 'no countdowns, no scarcity');

// ── The routes ──────────────────────────────────────────────────────────────
const env = { DB: fakeD1(), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
let sent = fakeResend();
let r = await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true, type: 'full', company: 'Acme', interest: 'Higher income', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password' }), env });
const ana = (await r.json()).token;
ok(sent.length === 1 && sent[0].body.subject === 'Welcome to The Founder Launchpad' && sent[0].body.html.includes('signature.png'), 'signup (full form, with its password): exactly one email, the welcome letter');
ok(sent[0].body.text.includes('Unsubscribe:') && sent[0].body.text.includes('Via Esempio 1'), 'the footer is still there');

sent = fakeResend();
await signinPost({ request: post('/api/signin', { email: 'ana@example.com', to: 'start' }, '9.9.9.1'), env });
const s1 = sent[0].body;
ok(s1.subject === 'Your link to get back in' && /^Hi Ana,/.test(s1.text) && /Sign me back in →: \S+\/start\?signin=[\w-]{40,}\n/.test(s1.text), 'sign-in route: the letter with a fresh link');
ok(s1.text.includes('P.S. One thing I’d love you to try: the Unshakeable assessment.') && !/Boardroom/.test(s1.text), 'sign-in route: the Unshakeable P.S., always');

sent = fakeResend();
r = await password({ request: post('/api/password', { token: ana, password: 'another-long-one', confirm: 'another-long-one' }, '9.9.9.2'), env });
ok(r.status === 200 && (await r.json()).changed === true, 'password changed');
ok(sent.length === 1 && sent[0].body.subject === 'Your password was changed' && sent[0].body.to[0] === 'ana@example.com' && sent[0].body.text.includes('the Unshakeable assessment'), 'password route: the letter, with the Unshakeable P.S.');
ok(env.DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id = ? AND kind = 'password-letter'").get(ana).n === 1, 'password letter logged');
env.DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(ana);
env.DB.raw.prepare('DELETE FROM mail_log').run(); // three an hour per address: start the hour again
sent = fakeResend();
await password({ request: post('/api/password', { token: ana, password: 'third-long-pass', confirm: 'third-long-pass' }, '9.9.9.3'), env });
ok(sent.length === 1, 'a security letter still goes after an unsubscribe');
sent = fakeResend();
await password({ request: post('/api/password', { token: ana, password: 'fourth-long-pass', confirm: 'fourth-long-pass' }), env: { DB: env.DB } });
ok(sent.length === 0, 'no email service: the password still changes, nothing is sent');

env.DB.raw.prepare('DELETE FROM mail_log').run();
await compassPost({ request: post('/api/compass', { token: ana, stage: 'growing', results: { scores: [5, 4, 1, 6], answered: [2, 2, 2, 2] } }), env });
sent = fakeResend();
r = await sendPlan({ request: post('/api/send-plan', { token: ana, plan: { name: 'Someone', domains: [{ know: 'Lead yourself', lead: 'Needs you now' }] } }, '9.9.9.4'), env });
ok(r.status === 200 && sent[0].body.text.includes('For you that’s Lead your business.'), 'results route: the weakest domain from the saved Compass, not the page');

done();
