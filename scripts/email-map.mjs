#!/usr/bin/env node
/* The email journey map: every letter a founder can get from ExploraSelf, in
 * the order they meet them, drawn from the code that sends them.
 *
 *   node scripts/email-map.mjs <out.html> [--exploraself <path to the exploraself repo>]
 *
 * Every linktolead letter is rendered here with the real builders
 * (functions/_letters.js, functions/_course.js, functions/_series.js), for a sample founder called
 * Sam, so the map shows exactly what lands in the inbox. With --exploraself,
 * the results letters of exploraself.com's assessments are rendered too, from
 * that repo's src/server/results-email.ts (bundled with esbuild, found in
 * node_modules/.bin or through npx; nothing is installed here).
 *
 * AGENTS.md rule 14: a letter added or changed is added here in the same
 * work, and the page is published again in /internal (Internal → Emails).
 * tests/email-map.test.mjs fails when a letter builder is missing from ENTRIES.
 *
 * Nothing here is invented: the words the mentor writes each time are shown
 * as [placeholders], and every sample answer is labelled a sample. */
import { writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as L from '../functions/_letters.js';
import { courseLetter, COURSE_NAME, SEND_HOUR, LATEST_HOUR } from '../functions/_course.js';
import { COURSE_LETTERS } from '../functions/_course-letters.js';
import { MENTOR_EMAIL } from '../functions/api/note.js';
import { TOOLKIT_PREVIEW } from '../functions/api/toolkit.js';
import { SERIES_GROUPS, SERIES_TAGS } from '../functions/_series-letters.js';
import { SERIES_STATUS, SERIES, PARSED, LATE_DAYS, seriesLetter, seriesOf, addDays, byDay, weekday, lettersOf } from '../functions/_series.js';

const BASE = 'https://linktolead.exploraself.com';
const AT = new Date('2026-11-02T09:00:00Z');
const S = { first: 'Sam', to: 'sam@example.com', tz: 'Europe/London', at: AT };

/** The journey, in the order a founder meets it. `icon` names a drawing in
 *  ICONS below (AGENTS.md rule 13: a small picture that tells something). */
export const STAGES = [
  { key: 'find', icon: 'search', name: 'They find us', sub: 'A free assessment on exploraself.com' },
  { key: 'door', icon: 'door', name: 'They open a door', sub: 'An account, or a code for the Growth Toolkit' },
  { key: 'use', icon: 'spark', name: 'They use it', sub: 'Their North Star, and 12 Days to Start Winning' },
  { key: 'follow', icon: 'path', name: 'We follow their answers', sub: `Letters that follow each pain · ${SERIES_STATUS}` },
  { key: 'pay', icon: 'key', name: 'They take the next step', sub: 'A payment opens their step at once (Stripe)' },
  { key: 'book', icon: 'calendar', name: 'They ask for a call', sub: 'A free discovery call, or the 1:1 in The Boardroom: one time (or up to three), confirmed within 24 hours' },
  { key: 'close', icon: 'chat', name: 'We stay close', sub: 'Letters and answers from Alexandru and the team' },
  { key: 'safe', icon: 'lock', name: 'Their account stays safe', sub: 'Sign-in, new password, password changed' },
  { key: 'team', icon: 'bell', name: 'The team hears', sub: 'Notices to Alexandru, and the invitation to a new team member. Never to a founder' },
];

const placeholder = (s) => `[${s}]`;
/** Sam's sample answers on the two booking pages (labelled samples). */
const BOOK_PHONE = '+15555550100'; // an example number (555-01xx is kept for fiction)
const BOOK_TIMES = ['2026-11-10T15:00:00.000Z', '2026-11-11T16:30:00.000Z', '2026-11-12T14:00:00.000Z'];
const DISCOVERY_SAMPLE = { stage: 'solo', struggles: ['clients', 'alone'], goals: ['clients', 'runs'], note: placeholder('Anything else they wrote (optional)') };
const BOARDROOM_SAMPLE = { moved: 'read', side: 'work', decision: placeholder('The one decision they bring'), tried: 'once', worth: placeholder('What would make the hour worth it') };

/** Every linktolead letter. `build` returns what send() gets; `fn` names the
 *  builder in functions/_letters.js (the test checks none is missing). */
export const ENTRIES = [
  {
    id: 'toolkit-code', stage: 'door', icon: 'key', fn: 'toolkitCodeLetter',
    name: 'Growth Toolkit code',
    when: 'Someone without an account asks to open the Growth Toolkit (any tool page, or /tools/). One 4-digit code for everybody (5689; TOOLKIT_CODE in Cloudflare changes it). Passing it on is fine.',
    who: 'The address they typed. Sent every time they ask (at most 3 an hour).',
    from: '/tools/',
    sentBy: 'functions/api/toolkit.js',
    also: 'Addresses on the TOOLKIT_EMAILS list, and the team, skip the code and get no letter.',
    build: () => L.toolkitCodeLetter(BASE, { ...S, code: '5689', url: `${BASE}/tools/?email=${encodeURIComponent(S.to)}&code=5689`,
      tools: TOOLKIT_PREVIEW }),
  },
  {
    id: 'tools-welcome', stage: 'door', icon: 'toolkit', fn: 'toolsWelcome',
    name: 'Welcome to the Growth Toolkit',
    when: 'Once per address: an account made from a toolkit page; an existing account tapping "Yes, that\'s me" the first time it opens the toolkit; or someone without an account once the code lets them in. Not on starting 12 Days to Start Winning, which has its own welcome.',
    who: 'Only with their yes to letters. Without an account, "Ask your mentor" means a reply instead of Base Camp.',
    from: '/tools/',
    sentBy: 'functions/_tools.js welcomeOnce, functions/_account.js sendWelcome (door "tools")',
    also: `The P.S. is one free thing on exploraself.com, matched by the tool they opened (${Object.entries(L.TOOLKIT_BY_TOOL).map(([t, k]) => `${t} → ${L.TOOLKIT_OFFERS[k].name}`).join('; ')}), or on the Tools page by what they want most (${Object.entries(L.TOOLKIT_BY_INTEREST).map(([t, k]) => `${t} → ${L.TOOLKIT_OFFERS[k].name}`).join('; ')}). Invites them to the Broadcast. The first open of each tool adds the Mailchimp tag "Growth Toolkit".`,
    build: () => L.toolsWelcome(BASE, { ...S, path: '/runway/' }),
  },
  {
    id: 'northstar-welcome', stage: 'door', icon: 'star', fn: 'northStarWelcome',
    name: 'Welcome from a North Star page',
    when: 'An account is made on a North Star page (/north1/, /north2/, /north3/, the North Star box).',
    who: 'Only when they said yes to letters. Once.',
    from: '/north1/',
    sentBy: 'functions/_account.js sendWelcome (landing in NORTH_STAR_LANDINGS)',
    also: 'Carries the Massive Growth Plan PDF as an attachment. Joins the Mailchimp audience (with their yes).',
    build: () => L.northStarWelcome(BASE, S),
  },
  {
    id: 'launchpad-welcome', stage: 'door', icon: 'flag', fn: 'launchpadWelcome',
    name: 'Welcome from every other page',
    when: 'An account is made anywhere else: the road pages (/road1/ … /road5/), The Summit, Base Camp.',
    who: 'Only when they said yes to letters. Once.',
    from: '/road1/',
    sentBy: 'functions/_account.js sendWelcome',
    also: 'Joins the Mailchimp audience (with their yes).',
    build: () => L.launchpadWelcome(BASE, S),
  },
  {
    id: 'results', stage: 'use', icon: 'star', fn: 'resultsLetter',
    name: 'North Star results',
    when: 'They tap "email me my results" at the end of their North Star.',
    who: 'Signed-in founders, when they ask (at most 3 an hour).',
    from: '/northstar/',
    sentBy: 'functions/api/send-plan.js',
    build: () => L.resultsLetter(BASE, { ...S, weakest: 'Lead your business' }),
  },
  {
    id: 'course', stage: 'use', icon: 'sun', fn: 'courseLetter', course: true,
    name: COURSE_NAME,
    when: `They tap Start on /12-days/, or "Yes, send them to me" on the 12 Days bonus card in Base Camp's left menu (since 3 Nov 2026). The welcome leaves at once; then one letter a day from ${SEND_HOUR}:00 their time (never after ${LATEST_HOUR}:00), Day 1 to Day 12, then "What next".`,
    who: 'Signed-in founders who started it. Stop and start again any time, on /12-days/ or with the unsubscribe link.',
    from: '/12-days/',
    sentBy: 'functions/_course.js (the hourly job in worker.js)',
    also: 'Each letter has its own P.S., written with the letter. Quotes from A New Way of Winning are word for word.',
    build: () => courseLetter(BASE, 0, S),
  },
  {
    id: 'unlocked', stage: 'pay', icon: 'key', fn: 'unlockedLetter',
    name: 'It’s unlocked',
    when: 'Stripe confirms a payment for a step: The Boardroom $27, the LAB $97, the HUB $750 or The Summit $1,989. Sent once per payment, the moment the step opens (through the webhook, or when the founder comes back from Stripe).',
    who: 'The founder who paid, even with letters turned off: it is about their own payment.',
    from: '/pay/',
    sentBy: 'functions/_stripe.js applyPaid',
    also: 'What opened, the sessions that come with the step, the booking link, and a button to the first new level. A receipt: no offer, no assessments, no one-tap questions, the signature in words with the photo, and no unsubscribe header, so Gmail is likelier to keep it out of Promotions. The step tags go to Mailchimp at the same moment.',
    build: () => L.unlockedLetter(BASE, { ...S, step: 'session' }),
  },
  {
    id: 'product', stage: 'pay', icon: 'key', fn: 'productLetter',
    name: 'It’s yours (a product)',
    when: 'Stripe confirms a payment for a one-off product bought from exploraself.com: today the Unshakeable Assessment, $9.99. Since 3 Nov 2026. Sent once per payment (through the webhook, or when exploraself.com asks /api/access).',
    who: 'The buyer, even with letters turned off: it is about their own payment.',
    from: 'exploraself.com/unshakeable → /pay/?step=unshakeable&from=exploraself',
    sentBy: 'functions/_stripe.js applyProduct',
    also: 'The button is the buyer’s own access link (exploraself.com/unshakeable?access=…), so it opens on any device. A receipt: no offer, no assessments, no unsubscribe header. Their step on the ladder does not change.',
    build: () => L.productLetter(BASE, { ...S, product: 'unshakeable', url: 'https://exploraself.com/unshakeable?access=cs_live_example' }),
  },
  {
    id: 'gift', stage: 'pay', icon: 'key', fn: 'giftLetter',
    name: 'A gift from Alexandru',
    when: 'Alexandru and the team (a member needs the right “Invite a founder at any step, free”) invite someone by email in /mentor → Founders → Invite a founder, choosing the step: free, The Boardroom, the LAB, the HUB or The Summit. Since 2 Nov 2026. The step opens at once, with nothing to pay; the letter leaves at the same moment.',
    who: 'The person invited. A new address gets a free account first (no letters until they say yes); someone with an account moves up, never down.',
    from: '/mentor (Founders → Invite a founder)',
    sentBy: 'functions/api/mentor.js (invite)',
    also: 'What opened and the sessions that come with it (with the booking link), then one button that signs them in for 7 days: “Set my password” for a new account, “Open …” for one that has a password. No offer: it is a gift. The step tags go to Mailchimp only for someone who already said yes to letters.',
    build: () => L.giftLetter(BASE, { ...S, step: 'lab', url: `${BASE}/ground-plan/?signin=…&reset=1`, fresh: true }),
  },
  {
    id: 'booking-discovery', stage: 'book', icon: 'calendar', fn: 'bookingLetter',
    name: 'Your time (or times) for our call',
    when: 'Someone sends the free discovery call form on /book/discovery/ (since 2 Nov 2026; it replaced the Google Form): where they are, two struggles, two goals for 90 days, anything else, name, email and phone (asked for their gift, since 3 Nov 2026), then one time, or up to three (Tuesday, Wednesday or Thursday, 15:00–20:00 Rome time, from tomorrow up to 14 days ahead). Sent right after the notice to Alexandru has left.',
    who: 'The address they typed, with or without an account. At most 3 requests a day per address and per connection.',
    from: '/book/discovery/',
    sentBy: 'functions/api/book.js',
    also: 'A receipt: their time (or times) in their own time zone with Rome beside it, “I’ll confirm within 24 hours”, Google Meet, then their gift (3 Nov 2026): The Leader’s North Star in Alexandru’s approved words, with one button “Open my gift →” (utm_source=email, utm_medium=gift). Then what they told us and their phone. No offer, no P.S. The same gift reaches them on WhatsApp when they tap “Get my gift on WhatsApp” on the last screen (answered by the WhatsApp Business greeting message, not by this site). A signed-in founder also gets the Mailchimp tag linktolead-book-discovery (with their yes to letters).',
    build: () => L.bookingLetter(BASE, { ...S, kind: 'discovery', phone: BOOK_PHONE, times: BOOK_TIMES, answers: DISCOVERY_SAMPLE }),
  },
  {
    id: 'booking-boardroom', stage: 'book', icon: 'calendar', fn: 'bookingLetter',
    name: 'Your time (or times) for your 1:1',
    when: 'A founder whose step holds the 1:1 (The Boardroom or higher, or the team) sends /book/boardroom/: the level that moved them most, the side costing them most, the one decision, what they tried, what makes the hour worth it, then their phone (asked for their gift, since 3 Nov 2026) and one time, or up to three. The booking link in “It’s unlocked”, the gift letter and Base Camp goes there since 2 Nov 2026.',
    who: 'The founder, at the address of their account. At most 3 requests a day.',
    from: '/book/boardroom/',
    sentBy: 'functions/api/book.js',
    also: 'A receipt, like the discovery one, for 60 minutes; its gift is the Massive Growth Plan (download the PDF or fill it in online, “Open my gift →” to /northstar/#growth-plan), and it points to their first three levels in Base Camp. Adds the Mailchimp tag linktolead-book-boardroom (with their yes to letters).',
    build: () => L.bookingLetter(BASE, { ...S, kind: 'boardroom', phone: BOOK_PHONE, times: BOOK_TIMES.map((t) => t.replace(':30:', ':00:')), answers: BOARDROOM_SAMPLE }),
  },
  {
    id: 'booking-confirmed', stage: 'book', icon: 'calendar', fn: 'bookingConfirmedLetter',
    name: 'Confirmed: our call',
    when: 'Alexandru and the team tap Confirm on one of their times in /mentor → Inbox → Bookings. Once per request.',
    who: 'The person who asked, discovery call or 1:1. A member needs the right “Write letters and notes to founders”.',
    from: '/mentor#inbox',
    sentBy: 'functions/api/mentor.js (book-confirm)',
    also: 'The time in their own time zone with Rome beside it, and the Google Meet button. The link is the one pasted in /mentor → Settings → Booking links (one per kind of call); without it nothing is sent. A receipt: no offer, no P.S.',
    build: () => L.bookingConfirmedLetter(BASE, { ...S, kind: 'discovery', time: BOOK_TIMES[0], meet: 'https://meet.google.com/abc-defg-hij' }),
  },
  {
    id: 'mentor', stage: 'close', icon: 'pen', fn: 'mentorLetter',
    name: 'A letter from the mentor',
    when: 'Alexandru and the team write to one founder from /mentor. Since 2 Nov 2026 each button opens a letter already written from the founder\'s own answers (a welcome, a check-in, the Boardroom offer, an invite to the Blueprint, the North Star link, or a plain note), which the mentor reads, changes and sends.',
    who: 'One founder at a time, chosen in /mentor.',
    from: '/mentor',
    sentBy: 'functions/api/mentor.js',
    build: () => L.mentorLetter(BASE, { ...S, subject: placeholder('Subject written in /mentor'),
      body: `Hi Sam,\n\n${placeholder('The words Alexandru and the team write in /mentor, one paragraph per blank line.')}` }),
  },
  {
    id: 'answer', stage: 'close', icon: 'chat', fn: 'answerLetter',
    name: 'An answer to their question',
    when: 'Alexandru and the team answer a question asked in "Ask Alexandru".',
    who: 'The founder who asked.',
    from: '/ground-plan/#ask',
    sentBy: 'functions/api/mentor.js',
    build: () => L.answerLetter(BASE, { ...S, question: placeholder('The founder’s question'), answer: placeholder('The answer written in /mentor.') }),
  },
  {
    id: 'signin', stage: 'safe', icon: 'link', fn: 'signinLetter',
    name: 'Link to get back in',
    when: 'They ask for a sign-in link instead of a password.',
    who: 'The account holder. The link works for 30 minutes.',
    from: '/ground-plan/',
    sentBy: 'functions/api/signin.js',
    also: 'A receipt (it answers what they just did): one button, no P.S., no assessments, no one-tap questions, the signature in words with the photo, and no unsubscribe header, so Gmail is likelier to keep it out of Promotions.',
    build: () => L.signinLetter(BASE, `${BASE}/ground-plan/?signin=…`, S),
  },
  {
    id: 'reset', stage: 'safe', icon: 'lock', fn: 'signinLetter',
    name: 'Choose a new password',
    when: 'They tap "Forgot your password?".',
    who: 'The account holder. The button works for 30 minutes.',
    from: '/ground-plan/',
    sentBy: 'functions/api/signin.js (reset)',
    also: 'A receipt (it answers what they just did): one button, no P.S., no assessments, no one-tap questions, the signature in words with the photo, and no unsubscribe header, so Gmail is likelier to keep it out of Promotions.',
    build: () => L.signinLetter(BASE, `${BASE}/ground-plan/?signin=…&reset=1`, { ...S, reset: true }),
  },
  {
    id: 'no-account', stage: 'safe', icon: 'mail', fn: 'noAccountLetter',
    name: 'No account here yet',
    when: 'Someone asks for a sign-in or reset link for an address that has no account.',
    who: 'That address. The page says the same at once, with the same button.',
    from: '/ground-plan/, /northstar/, /pay/',
    sentBy: 'functions/api/signin.js',
    also: 'A receipt (it answers what they just did): one button, no P.S., no assessments, no one-tap questions, the signature in words with the photo, and no unsubscribe header, so Gmail is likelier to keep it out of Promotions The button opens the free account form with their email already in it, and brings them back to the page they were on.',
    build: () => L.noAccountLetter(BASE, `${BASE}/road1/?email=sam%40example.com&next=%2Fpay%2F%3Fstep%3Dsession#join`, { ...S, to: 'sam@example.com' }),
  },
  {
    id: 'password', stage: 'safe', icon: 'shield', fn: 'passwordChangedLetter',
    name: 'Password changed',
    when: 'A password is set, changed or reset.',
    who: 'The account holder.',
    from: '/ground-plan/',
    sentBy: 'functions/api/password.js',
    also: 'A receipt (it answers what they just did): one button, no P.S., no assessments, no one-tap questions, the signature in words with the photo, and no unsubscribe header, so Gmail is likelier to keep it out of Promotions.',
    build: () => L.passwordChangedLetter(BASE, S),
  },
  {
    id: 'question-notice', stage: 'team', icon: 'bell', fn: 'questionNotice',
    name: 'New question',
    when: 'A founder asks a question in "Ask Alexandru".',
    who: `${MENTOR_EMAIL} (or MENTOR_EMAIL in Cloudflare).`,
    from: '/ground-plan/#ask',
    sentBy: 'functions/api/note.js',
    build: () => L.questionNotice(BASE, { name: 'Sam Example', email: S.to, question: placeholder('The founder’s question'), level: 1 }),
  },
  {
    id: 'comment-notice', stage: 'team', icon: 'bell', fn: 'commentNotice',
    name: 'New comment on a video',
    when: 'A founder comments on the video of a level (at most 5 notices an hour).',
    who: `${MENTOR_EMAIL} (or MENTOR_EMAIL in Cloudflare).`,
    from: '/ground-plan/',
    sentBy: 'functions/api/comments.js',
    build: () => L.commentNotice(BASE, { name: 'Sam Example', email: S.to, comment: placeholder('The founder’s comment'), stage: 'video', level: 1 }),
  },
  {
    id: 'booking-notice', stage: 'team', icon: 'calendar', fn: 'bookingNotice',
    name: 'New call request',
    when: 'Someone sends /book/discovery/ or /book/boardroom/. It leaves first: if it cannot, nothing is kept and the page says so.',
    who: `${MENTOR_EMAIL} (or MENTOR_EMAIL in Cloudflare). Replying goes straight to the person.`,
    from: '/book/discovery/, /book/boardroom/',
    sentBy: 'functions/api/book.js',
    also: 'Who, which call, with or without an account, their phone with a one-tap WhatsApp link, their time (or times) in Rome time (and theirs), everything they answered, and a button to /mentor → Inbox → Bookings, where one tap confirms a time.',
    build: () => L.bookingNotice(BASE, { name: 'Sam Example', email: S.to, phone: BOOK_PHONE, kind: 'discovery', times: BOOK_TIMES, answers: DISCOVERY_SAMPLE, tz: S.tz }),
  },
  {
    id: 'team-invite', stage: 'team', icon: 'key', fn: 'teamInvite',
    name: 'You’re on the team',
    when: 'Alexandru adds an address in /mentor (Settings, Team). Once per add. With an account the button signs them in (a one-time link, 7 days); without one it asks them to make the free account with that address.',
    who: 'The new team member. Everything they send goes out signed by Alexandru, and replies come back to Alexandru.',
    from: '/mentor#settings',
    sentBy: 'functions/api/mentor.js',
    also: 'Written to make a new member feel honoured to join (Alexandru, 2 Nov 2026): why ExploraSelf exists, its mission and vision word for word from exploraself.com, where they come in. Signed by Alexandru, with the photo and the handwritten signature; no offer.',
    build: () => L.teamInvite(BASE, { to: 'new.member@example.com', first: 'Sam', signinUrl: `${BASE}/ground-plan/?signin=${placeholder('one-time code')}`, tz: S.tz, at: S.at }),
  },
];

/** The exploraself.com results letters, one per assessment, rendered from
 *  that repo with sample answers. Returns [] when the repo or esbuild is not
 *  at hand, and the map says so. */
export function exploraselfLetters(repo) {
  if (!repo || !existsSync(join(repo, 'src/server/results-email.ts'))) return [];
  const dir = mkdtempSync(join(tmpdir(), 'email-map-'));
  const entry = join(dir, 'entry.ts');
  writeFileSync(entry, `
import { RESULTS_KINDS, buildModel, renderEmail } from "@/server/results-email";
import { boardroomItems, processes, stages } from "@/data/unbound";
import { phases, questions } from "@/data/first-clients";
import { riseItems } from "@/data/rise";
import { eqItems } from "@/data/eq";
export const NAMES: Record<string, string> = { rise: "Allow Yourself to Rise", unbound: "The Inner Boardroom (Unbound)", first100: "First 100 Clients", eq: "The EQ Dividend", twoweek: "The Two-Week Test" };
export const PAGES: Record<string, string> = { rise: "/rise", unbound: "/unbound", first100: "/first-100-clients", eq: "/eq", twoweek: "/two-week-test" };
const wave = (n: number, lo: number, hi: number) => Array.from({ length: n }, (_, i) => lo + ((i * 7) % (hi - lo + 1)));
export function samples(at: Date) {
  const A: Record<string, unknown> = {
    rise: wave(riseItems.length, 1, 5),
    eq: wave(eqItems.length, 1, 5),
    twoweek: Array.from({ length: 20 }, (_, i) => (i >= 5 && i < 10 ? 1 : 2 + (i % 2))),
    unbound: { board: wave(boardroomItems.length, 1, 5), proc: wave(processes.length, 1, 5), stage: stages[0].id, weakItem: stages[0].items[0] },
    first100: { q: wave(questions.length, 1, 5), phase: phases[0].id },
  };
  return RESULTS_KINDS.map((k) => {
    const m = buildModel(k, A[k]);
    return m ? { kind: k, name: NAMES[k] || k, page: PAGES[k] || "", ...renderEmail(k, "Sam", m, { tz: "Europe/London", now: at }) } : { kind: k, name: NAMES[k] || k, page: PAGES[k] || "" };
  });
}`);
  const out = join(dir, 'bundle.mjs');
  const local = join(repo, 'node_modules/.bin/esbuild');
  const args = [entry, '--bundle', '--platform=node', '--format=esm', `--outfile=${out}`, `--alias:@=${resolve(repo, 'src')}`, '--log-level=error'];
  const tries = [process.env.ESBUILD, existsSync(local) ? local : null].filter(Boolean);
  for (const bin of tries) { try { execFileSync(bin, args, { stdio: 'pipe' }); return { file: out }; } catch {} }
  try { execFileSync('npx', ['--no-install', 'esbuild', ...args], { stdio: 'pipe' }); return { file: out }; } catch { return []; }
}

/* Line icons, 24 by 24, in the text colour, hidden from screen readers. */
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
export const ICONS = {
  search: svg('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>'),
  door: svg('<path d="M6 20.5V4.8c0-.7.5-1.3 1.2-1.3h9.6c.7 0 1.2.6 1.2 1.3v15.7"/><path d="M3.5 20.5h17"/><circle cx="14.5" cy="12.5" r=".9" fill="currentColor"/>'),
  spark: svg('<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M18 6l-2.6 2.6M8.6 15.4 6 18"/>'),
  chat: svg('<path d="M4.5 6.2c0-1 .8-1.7 1.7-1.7h11.6c1 0 1.7.8 1.7 1.7v8.1c0 1-.8 1.7-1.7 1.7H10l-4.2 3.5V16h0c-.7 0-1.3-.7-1.3-1.5Z"/><path d="M8.5 9.5h7M8.5 12.5h4.5"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/><path d="M12 14.5v2.2"/>'),
  bell: svg('<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.8H5Z"/><path d="M10 20.5h4"/>'),
  key: svg('<circle cx="8" cy="12" r="3.6"/><path d="M11.6 12H21M17.6 12v3M20.4 12v2.2"/>'),
  toolkit: svg('<path d="M9 8V6.4c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4V8"/><rect x="3" y="8" width="18" height="12" rx="2.2"/><path d="M12 17.2v-5.4M9.6 14.1 12 11.7l2.4 2.4"/>'),
  star: svg('<path d="M12 2.8 21.2 12 12 21.2 2.8 12Z"/><path d="m12 6.6 1.7 3.7 3.7 1.7-3.7 1.7-1.7 3.7-1.7-3.7L6.6 12l3.7-1.7Z" fill="currentColor" stroke="none"/>'),
  flag: svg('<path d="M5.5 21V4"/><path d="M5.5 4.5h11l-2 3.7 2 3.8h-11"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>'),
  pen: svg('<path d="M4 20l1-4.2L15.8 5a2 2 0 0 1 2.9 0l.3.3a2 2 0 0 1 0 2.9L8.2 19Z"/><path d="M14 6.8l3.2 3.2"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  shield: svg('<path d="M12 3.2 19 6v5.5c0 4.3-3 7.7-7 9.3-4-1.6-7-5-7-9.3V6Z"/><path d="m9 12 2.2 2.2L15.2 10"/>'),
  mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.8 7.2 8.2 6.2 8.2-6.2"/>'),
  path: svg('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>'),
  chart: svg('<path d="M4 20h16"/><path d="M7.5 17v-3M12 17v-5.5M16.5 17V9"/>'),
  calendar: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>'),
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** The P.S. line of a rendered letter, from its plain text. */
const psOf = (text) => { const m = /(?:^|\n)P\.S\. ([^\n]+)/.exec(text || ''); return m ? m[1].replace(/https?:\/\/\S+/g, '').trim() : ''; };
/** First real sentence after "Hi …," for the inbox preview. */
const previewOf = (text) => String(text || '').split(/\n\n/).map((s) => s.trim()).filter((s) => s && !/^Hi\b/.test(s))[0] || '';

/** Builds the list of letters the page shows, in journey order. */
export async function collect({ exploraself } = {}) {
  const out = [];
  const ex = exploraselfLetters(exploraself);
  let exList = [];
  if (ex && ex.file) {
    const m = await import(pathToFileURL(ex.file).href);
    exList = m.samples(AT);
  }
  if (exList.length) {
    for (const r of exList) {
      out.push({ id: `es-${r.kind}`, stage: 'find', icon: 'chart', site: 'exploraself.com', name: `${r.name} results`,
        when: `They finish ${r.name} on exploraself.com${r.page} and ask for their results.`,
        who: 'The address they typed. Every visit asks for the sign-up again.',
        from: `https://exploraself.com${r.page}`, sentBy: 'exploraself: src/server/results-email.ts',
        fromLine: 'Alexandru at ExploraSelf · support@exploraself.com', replyTo: 'sales@exploraself.com',
        sample: 'Sample answers.', subject: r.subject || '(not rendered)', html: r.html || '', text: r.text || '', ps: psOf(r.text), preview: previewOf(r.text) });
    }
  }
  for (const e of ENTRIES) {
    if (e.course) {
      COURSE_LETTERS.forEach((c, day) => {
        const r = courseLetter(BASE, day, S);
        out.push({ id: `course-${day}`, stage: 'use', icon: 'sun', site: 'linktolead', name: day === 0 ? 'Welcome' : day === COURSE_LETTERS.length - 1 ? 'What next' : `Day ${day}`,
          group: 'course', day, when: e.when, who: e.who, from: e.from, sentBy: e.sentBy, also: e.also,
          fromLine: `${r.fromName} · support@exploraself.com`, replyTo: r.replyTo, subject: r.subject, html: r.html, text: r.text, ps: psOf(r.text), preview: previewOf(r.text) });
      });
      continue;
    }
    const r = e.build();
    out.push({ id: e.id, stage: e.stage, icon: e.icon, site: 'linktolead', name: e.name, when: e.when, who: e.who, from: e.from, sentBy: e.sentBy, also: e.also || '',
      fromLine: r.fromName ? `${r.fromName} · support@exploraself.com` : 'ExploraSelf · support@exploraself.com', replyTo: r.replyTo || '',
      attach: (r.attachments || []).map((a) => a.filename), sample: /\[/.test(r.text) ? 'The words in [brackets] are written each time.' : '',
      subject: r.subject, html: r.html, text: r.text, ps: psOf(r.text), preview: previewOf(r.text) });
  }
  // The letters that follow each pain (functions/_series.js, the words in
  // functions/_series-letters.js), rendered by the engine for Sam: the want
  // is the one each pain was written for, the storm rule the Level 03
  // example, and each letter goes on its day after Sam's own start (the
  // North Star and the account on Sunday 1 Nov 2026, Level 03 on 19 Nov).
  const G = Object.fromEntries(SERIES_GROUPS.map((g) => [g.id, g]));
  const index = (stage) => out.findIndex((l) => STAGES.findIndex((s) => s.key === l.stage) > STAGES.findIndex((s) => s.key === stage));
  const after = { pain: 'they finish', never: 'the account', level3: 'they finish Level 03' };
  const series = PARSED.map((l) => {
    const g = G[l.g] || {}, kind = g.kind || 'pain', key = seriesOf(l.g), total = lettersOf(l.g).length;
    const date = addDays(SERIES[key].start, l.day);
    const r = seriesLetter(BASE, l.id, { ...S, want: g.want || '', storm: { feel: 'panic', hours: '24', about: 'money' }, date, at: new Date(`${date}T08:07:00Z`) });
    const first = kind === 'pain' ? `They finish The Leader’s North Star and pick “${g.name}” first.` : kind === 'never' ? 'Account made, nothing written in Level 01.' : 'They have written in Levels 01, 02 and 03.';
    const day = kind === 'level3' && l.day === 1 ? 'the morning after' : `day ${l.day} after ${after[kind]}`;
    const step = l.by.length ? ` Its step is due ${l.by[0] === 0 ? 'that same day (“today”)' : `${l.by[0]} ${l.by[0] === 1 ? 'day' : 'days'} later (“${byDay(date, l.by[0])}” when it goes on a ${weekday(date)})`}.` : '';
    const late = l.exact ? ' Its words count the days, so it goes on its own day or not at all.'
      : ` If its day is missed, it goes at the next chance, up to ${LATE_DAYS} days late and never on the next letter’s day; else it is skipped.`;
    const when = `${first} Letter ${l.n} of ${total}: ${day}, from 8:00 their time (never after 21:00).${step}${late}${l.needsPrev ? ` Only if letter ${l.n - 1} went: it speaks of it.` : ''}`;
    const stops = kind === 'never' ? 'unsubscribe, writing in Level 01, or the next series' : 'unsubscribe or the next series';
    return { id: `series-${l.id}`, stage: 'follow', icon: 'path', site: 'linktolead', group: 'series', series: l.g, n: l.n, day: l.day, name: `${g.name} · ${l.n}`,
      when, who: `Founders with an account and a yes to letters. Stops on ${stops}; waits while paused, and after a question in Ask Alexandru until the mentor resumes it in /mentor. At most one automatic letter a day, with 12 Days too. Mailchimp tag: ${SERIES[key].tag}.`,
      from: kind === 'level3' || kind === 'never' ? '/ground-plan/' : '/northstar/', sentBy: `functions/_series.js (the hourly job in worker.js) · ${SERIES_STATUS}`,
      fromLine: `${r.fromName} · support@exploraself.com`, replyTo: r.replyTo, sample: 'Example founder Sam. The name, the want, the day the step is due and the storm rule are filled from each founder’s own answers.',
      subject: r.subject, html: r.html, text: r.text, ps: psOf(r.text), preview: previewOf(r.text) };
  });
  const at = index('follow');
  out.splice(at < 0 ? out.length : at, 0, ...series);
  return { letters: out, withExploraself: exList.length > 0 };
}

/** The letters that follow each pain: how they connect, then each series. */
function followHTML(s, si, series) {
  if (!series.length) return '';
  const groups = SERIES_GROUPS.filter((g) => series.some((l) => l.series === g.id));
  const row = (a, b, c, d) => `<div class="fl"><span class="fb">${a}</span><span class="fa" aria-hidden="true">→</span><span class="fb">${b}</span><span class="fa" aria-hidden="true">→</span><span class="fb">${c}</span><span class="fa" aria-hidden="true">→</span><span class="fb gold">${d}</span></div>`;
  return `<section class="stage" id="st-${s.key}" aria-labelledby="h-${s.key}">
      <h2 id="h-${s.key}"><span class="n">${si + 1}</span><span class="sic">${ICONS[s.icon]}</span><span>${esc(s.name)}<small>${esc(s.sub)}</small></span></h2>
      <div class="flow">
        <p class="badge">${esc(SERIES_STATUS)} · ${series.length} letters · 8:00 their time · one automatic letter a day at most</p>
        ${row('They finish The Leader’s North Star', 'The first pain they pick (8 pains)', '4 letters: day 1 · 3 · 6 · 10', 'Letter 4’s P.S.: The Boardroom, $27')}
        ${row('They make an account', 'Level 01 not started', '3 letters: day 2 · 5 · 9', 'Free P.S. only, “not now” is fine')}
        ${row('They finish Level 03', 'A win, in their own words', '2 letters: the morning after · day 4', 'The Boardroom, $27, “not now” made easy')}
        <p class="mut">Each letter: their pain and their want in their words, one idea, one step with a day and “done when”, one question, one link. Stops on unsubscribe, pause, a question in Ask Alexandru, or the next series. Mailchimp tags: ${Object.values(SERIES_TAGS).map(esc).join(' · ')}.</p>
      </div>
      ${groups.map((g) => { const L = series.filter((l) => l.series === g.id);
        return `<div class="course"><div class="ch"><span class="ic" style="color:${esc(g.col || '')}">${ICONS.path}</span><div><b>${esc(g.name)}</b><p>${esc(g.sub || '')}</p><p class="mut">${esc(L[0].when.replace(/ Letter 1 of \d.*$/, ''))}</p></div></div>
        <ol class="days">${L.map((d) => `<li><button type="button" data-open="${esc(d.id)}"><span class="dn">Day ${esc(d.day)}</span><span class="ds">${esc(d.subject)}</span></button></li>`).join('')}</ol></div>`; }).join('')}
    </section>`;
}

export function page({ letters, withExploraself }, { date = '2 Nov 2026' } = {}) {
  const course = letters.filter((l) => l.group === 'course');
  const singles = letters.filter((l) => !l.group);
  const series = letters.filter((l) => l.group === 'series');
  const count = (k) => letters.filter((l) => l.stage === k).length;
  const linkFrom = (u) => (/^https?:/.test(u) ? u : `${BASE}${u}`);
  const card = (l, i) => `<button type="button" class="card" data-open="${esc(l.id)}">
      <span class="ic">${ICONS[l.icon] || ICONS.mail}</span>
      <span class="body"><span class="nm">${esc(l.name)}</span>
        <span class="sj">${esc(l.subject)}</span>
        <span class="pv">${esc(l.preview)}</span>
        <span class="wn">${esc(l.when)}</span>
        ${l.ps ? `<span class="ps"><b>P.S.</b> ${esc(l.ps)}</span>` : ''}</span>
      <span class="go" aria-hidden="true">Read →</span></button>`;
  const stageHTML = STAGES.map((s, si) => {
    const list = singles.filter((l) => l.stage === s.key);
    const days = s.key === 'use' ? course : [];
    if (s.key === 'follow') return followHTML(s, si, series);
    if (!list.length && !days.length) {
      if (s.key !== 'find') return '';
      return `<section class="stage" id="st-${s.key}" aria-labelledby="h-${s.key}">
        <h2 id="h-${s.key}"><span class="sic">${ICONS[s.icon]}</span><span>${esc(s.name)}<small>${esc(s.sub)}</small></span></h2>
        <p class="note">The results letters of exploraself.com were not drawn this time. Run the map with <code>--exploraself</code> to add them.</p></section>`;
    }
    return `<section class="stage" id="st-${s.key}" aria-labelledby="h-${s.key}">
      <h2 id="h-${s.key}"><span class="n">${si + 1}</span><span class="sic">${ICONS[s.icon]}</span><span>${esc(s.name)}<small>${esc(s.sub)}</small></span></h2>
      ${list.length ? `<div class="cards">${list.map(card).join('')}</div>` : ''}
      ${days.length ? `<div class="course">
        <div class="ch"><span class="ic">${ICONS.sun}</span><div><b>${esc(COURSE_NAME)}</b><p>${esc(days[0].when)}</p><p class="mut">${esc(days[0].who)}</p></div></div>
        <ol class="days">${days.map((d) => `<li><button type="button" data-open="${esc(d.id)}"><span class="dn">${esc(d.name)}</span><span class="ds">${esc(d.subject.replace(/^Day \d+ · /, ''))}</span></button></li>`).join('')}</ol>
      </div>` : ''}
    </section>`;
  }).join('');
  const strip = STAGES.map((s, i) => `<a href="#st-${s.key}" class="step"><span class="sic">${ICONS[s.icon]}</span><span class="t">${esc(s.name)}</span><span class="c">${count(s.key)} ${count(s.key) === 1 ? 'letter' : 'letters'}</span></a>${i < STAGES.length - 1 ? '<span class="arr" aria-hidden="true">→</span>' : ''}`).join('');
  const data = letters.map((l) => ({ id: l.id, name: l.name, stage: STAGES.find((s) => s.key === l.stage)?.name || '', subject: l.subject, html: l.html, text: l.text,
    when: l.when, who: l.who, from: linkFrom(l.from), fromShort: l.from, sentBy: l.sentBy, also: l.also || '', fromLine: l.fromLine, replyTo: l.replyTo, attach: l.attach || [], sample: l.sample || '' }));
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const total = letters.length;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Every email, in the order they arrive · ExploraSelf Internal</title>
<link rel="preload" href="fonts/newsreader.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<style>
/* Generated by linktolead scripts/email-map.mjs. Do not edit by hand: change
   the letter or the script, and run it again (linktolead AGENTS.md rule 14). */
@font-face{font-family:Newsreader;font-style:normal;font-weight:200 800;font-display:swap;src:url(fonts/newsreader.woff2) format('woff2')}
@font-face{font-family:Newsreader;font-style:italic;font-weight:200 800;font-display:swap;src:url(fonts/newsreader-italic.woff2) format('woff2')}
@font-face{font-family:Inter;font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/inter.woff2) format('woff2')}
:root{--bg:#F7F3EA;--paper:#FFFDF8;--ink:#14100B;--ink2:#3B342A;--muted:#6A6052;--line:#E4DACA;--gold:#B4975F;--gold-ink:#6E5213;--soft:#F1E9D8;--navy:#0E1C2B;
  --display:Newsreader,Georgia,serif;--body:Inter,system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color-scheme:light}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:84px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{margin:0;background:var(--bg);color:var(--ink);font:15.5px/1.6 var(--body);-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,p{margin:0}
.wrap{max-width:1180px;margin:0 auto;padding:28px max(18px,env(safe-area-inset-left)) 72px}
.eb{font:700 11.5px/1.4 var(--body);letter-spacing:.2em;text-transform:uppercase;color:var(--gold-ink)}
h1{font:500 clamp(32px,5vw,52px)/1.06 var(--display);letter-spacing:-.01em;margin:10px 0 12px;text-wrap:balance}
h1 i{font-weight:400;color:var(--gold-ink)}
.lede{max-width:72ch;color:var(--ink2)}
.facts{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}
.facts span{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--paper);border-radius:999px;padding:6px 12px;font-size:13px;color:var(--ink2)}
.facts svg{width:16px;height:16px;color:var(--gold-ink)}
/* The journey strip: six stops, left to right; it sticks while reading. */
.strip{position:sticky;top:0;z-index:5;margin:26px calc(-1 * max(18px,env(safe-area-inset-left))) 0;padding:10px max(18px,env(safe-area-inset-left));background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);display:flex;align-items:stretch;gap:6px;overflow-x:auto;scrollbar-width:none}
.strip::-webkit-scrollbar{display:none}
.step{flex:1 0 132px;display:grid;grid-template-columns:30px 1fr;grid-template-rows:auto auto;column-gap:9px;align-items:center;padding:8px 10px;border-radius:12px;text-decoration:none;color:var(--ink);border:1px solid transparent}
.step:hover,.step.on{background:var(--paper);border-color:var(--line)}
.step:focus-visible,.card:focus-visible,.days button:focus-visible,.dlg button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.step .sic{grid-row:span 2}
.step .t{font:600 13px/1.25 var(--body)}
.step .c{font-size:12px;color:var(--muted)}
.arr{align-self:center;color:var(--gold);flex:none}
.sic{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--soft);color:var(--gold-ink);box-shadow:inset 0 0 0 1px var(--line)}
.sic svg{width:18px;height:18px}
.find{margin:22px 0 0;display:flex;gap:10px;align-items:center;max-width:520px}
.find label{display:flex;align-items:center;gap:8px;flex:1;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:0 12px}
.find svg{width:18px;height:18px;color:var(--muted);flex:none}
.find input{flex:1;min-height:44px;border:0;background:none;font:inherit;color:var(--ink);outline:none}
.stage{margin:40px 0 0}
.stage h2{display:flex;align-items:center;gap:12px;font:500 26px/1.15 var(--display);margin:0 0 16px}
.stage h2 .n{font:700 12px/1 var(--body);color:var(--muted);letter-spacing:.1em}
.stage h2 .sic{width:40px;height:40px;border-radius:12px}
.stage h2 .sic svg{width:22px;height:22px}
.stage h2 small{display:block;font:400 14px/1.4 var(--body);color:var(--muted);margin-top:3px}
.note{color:var(--muted);border:1.5px dashed var(--line);border-radius:14px;padding:16px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.card{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:38px 1fr;gap:4px 12px;padding:16px 16px 14px;background:var(--paper);border:1px solid var(--line);border-radius:16px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s}
.card:hover{border-color:var(--gold);box-shadow:0 10px 26px -18px rgba(20,16,11,.45);transform:translateY(-2px)}
@media (prefers-reduced-motion:reduce){.card{transition:none}.card:hover{transform:none}}
.card .ic{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:var(--soft);color:var(--gold-ink)}
.card .ic svg{width:21px;height:21px}
.card .body{display:grid;gap:4px;min-width:0}
.nm{font:700 11px/1.3 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--gold-ink)}
.sj{font:500 19px/1.25 var(--display);color:var(--ink)}
.pv{font-size:14px;color:var(--ink2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.wn{font-size:13px;color:var(--muted)}
.ps{font-size:12.5px;color:var(--muted);font-style:italic;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;border-top:1px dashed var(--line);padding-top:6px;margin-top:2px}
.ps b{font-style:normal;color:var(--gold-ink)}
.go{grid-column:2;justify-self:end;font:600 13px/1 var(--body);color:var(--gold-ink);margin-top:4px}
.course{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:18px;margin-top:14px}
.ch{display:grid;grid-template-columns:38px 1fr;gap:12px;margin-bottom:14px}
.ch .ic{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:var(--soft);color:var(--gold-ink)}
.ch .ic svg{width:21px;height:21px}
.ch b{font:500 21px/1.2 var(--display)}
.ch p{font-size:14px;color:var(--ink2);margin-top:3px}
.ch .mut{color:var(--muted);font-size:13px}
.days{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;counter-reset:d}
.days button{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:3px;width:100%;height:100%;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg)}
.days button:hover{border-color:var(--gold);background:var(--paper)}
.dn{font:700 11px/1.3 var(--body);letter-spacing:.12em;text-transform:uppercase;color:var(--gold-ink)}
.ds{font:500 15px/1.25 var(--display)}
.hide{display:none !important}
footer{margin-top:48px;color:var(--muted);font-size:13px;border-top:1px solid var(--line);padding-top:16px}
code{font:12.5px/1.4 ui-monospace,Menlo,Consolas,monospace;background:var(--soft);padding:1px 5px;border-radius:5px}
/* One letter, read as it lands: details on the left, the letter on the right.
   Back and next walk the journey in order. */
.dlg{border:0;padding:0;max-width:min(1100px,96vw);width:100%;max-height:94vh;border-radius:18px;background:var(--paper);color:var(--ink);box-shadow:0 30px 80px -30px rgba(0,0,0,.5)}
.dlg::backdrop{background:rgba(20,16,11,.45)}
.dlg .in{display:grid;grid-template-columns:320px 1fr;height:min(860px,94vh)}
.dlg .side{padding:18px;border-right:1px solid var(--line);overflow:auto;display:flex;flex-direction:column;gap:12px}
.dlg .top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dlg .crumb{font:700 11px/1.3 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--gold-ink)}
.dlg h3{margin:0;font:500 22px/1.2 var(--display)}
.dlg dl{margin:0;display:grid;gap:10px;font-size:13.5px}
.dlg dt{font:700 10.5px/1.3 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.dlg dd{margin:2px 0 0;color:var(--ink2);overflow-wrap:anywhere}
.dlg dd a{color:var(--gold-ink)}
.dlg .tag{display:inline-block;background:var(--soft);border-radius:6px;padding:2px 8px;font-size:12.5px;color:var(--ink2)}
.dlg .nav{margin-top:auto;display:flex;gap:8px}
.dlg button{min-height:42px;padding:0 14px;border-radius:10px;border:1px solid var(--line);background:var(--bg);font:600 13.5px/1 var(--body);color:var(--ink);cursor:pointer}
.dlg button:hover{border-color:var(--gold)}
.dlg button.x{width:42px;padding:0;font-size:20px}
.dlg .seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;padding:3px;background:var(--bg);gap:3px}
.dlg .seg button{min-height:34px;border:0;background:none}
.dlg .seg button[aria-pressed="true"]{background:var(--paper);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.dlg .mail{display:flex;flex-direction:column;min-width:0;background:#EDE6D8}
.dlg .head{padding:14px 18px;background:var(--paper);border-bottom:1px solid var(--line);font-size:13.5px;display:grid;gap:3px}
.dlg .head b{font:500 18px/1.25 var(--display)}
.dlg .head span{color:var(--muted)}
.dlg iframe{flex:1;width:100%;border:0;background:#FFFDF8}
.dlg pre{flex:1;margin:0;padding:18px;overflow:auto;white-space:pre-wrap;font:13.5px/1.6 ui-monospace,Menlo,Consolas,monospace;background:#FFFDF8}
.about summary{cursor:pointer;font:600 13px/1.3 var(--body);color:var(--gold-ink);list-style:none;display:none}
.about summary::-webkit-details-marker{display:none}
@media (max-width:820px){.dlg{max-width:100vw;max-height:100dvh;height:100dvh;border-radius:0}.dlg .in{grid-template-columns:1fr;grid-template-rows:auto 1fr;height:100dvh}
  .dlg .side{border-right:0;border-bottom:1px solid var(--line);max-height:58dvh;padding:12px 14px;gap:9px}.dlg h3{font-size:19px}
  .about summary{display:block}.about summary::after{content:" ▾"}.about[open] summary::after{content:" ▴"}.about dl{margin-top:8px}
  .dlg .nav{margin-top:0;order:-1}.dlg .nav button{flex:1}.dlg .seg{align-self:flex-start}
  .dlg .head{padding:10px 14px;font-size:12.5px}.dlg .head b{font-size:16px}}
/* The letters that follow each pain: how they connect. */
.flow{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin-top:14px}
.flow .badge{display:inline-block;margin:0 0 12px;padding:3px 10px;border-radius:999px;background:#F6E7CF;color:#7A4E12;font-size:13px;font-weight:600}
.fl{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:0 0 10px}
.fb{padding:7px 11px;border:1px solid var(--line);border-radius:10px;background:var(--bg);font-size:14px}
.fb.gold{border-color:var(--gold)}
.fa{color:var(--gold);font-weight:700}
</style>
</head>
<body>
<div class="wrap">
  <p class="eb">ExploraSelf · Internal · Emails · ${esc(date)}</p>
  <h1>Every email, <i>in the order they arrive.</i></h1>
  <p class="lede">What a founder receives from ExploraSelf, from the first free assessment to the last of the 12 days: what sends each letter, who gets it, what it says and what its P.S. offers. Drawn from the code that sends them, so it shows exactly what lands. Tap any letter to read it as it arrives.</p>
  <div class="facts">
    <span>${ICONS.mail}${total} letters</span>
    <span>${ICONS.sun}${course.length} in ${esc(COURSE_NAME)}</span>
    <span>${ICONS.bell}${count('team')} to the team</span>
    <span>${ICONS.pen}Sample founder: Sam, a morning in London</span>
  </div>
  <nav class="strip" aria-label="The journey">${strip}</nav>
  <div class="find"><label>${ICONS.search}<input id="q" type="search" placeholder="Find a letter: a word, a subject, a page" aria-label="Find a letter"></label></div>
  ${stageHTML}
  <footer>
    <p>Made by <code>scripts/email-map.mjs</code> in the linktolead repo${withExploraself ? ', with the results letters from the exploraself repo' : ''}. A letter added or changed is added to the map in the same work (linktolead AGENTS.md rule 14). Letters set up inside Mailchimp itself are not read here.</p>
  </footer>
</div>
<dialog class="dlg" id="dlg" aria-labelledby="d-sub">
  <div class="in">
    <div class="side">
      <div class="top"><span class="crumb" id="d-crumb"></span><button type="button" class="x" data-x aria-label="Close">×</button></div>
      <h3 id="d-name"></h3>
      <details class="about" id="d-about" open><summary>About this letter</summary><dl id="d-dl"></dl></details>
      <div class="seg" role="group" aria-label="Show the letter as"><button type="button" data-v="html" aria-pressed="true">As it lands</button><button type="button" data-v="text" aria-pressed="false">Plain text</button></div>
      <div class="nav"><button type="button" data-step="-1">← Back</button><button type="button" data-step="1">Next letter →</button></div>
    </div>
    <div class="mail">
      <div class="head"><span id="d-from"></span><b id="d-sub"></b><span id="d-to">To: Sam · sam@example.com</span></div>
      <iframe id="d-frame" title="The letter" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe>
      <pre id="d-text" hidden></pre>
    </div>
  </div>
</dialog>
<script type="application/json" id="letters">${json}</script>
<script>
(function(){
  var L = JSON.parse(document.getElementById('letters').textContent);
  var by = {}; L.forEach(function(l, i){ l.i = i; by[l.id] = l; });
  var dlg = document.getElementById('dlg'), frame = document.getElementById('d-frame'), pre = document.getElementById('d-text');
  var cur = null, view = 'html', opener = null;
  function e(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function row(k, v){ return v ? '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>' : ''; }
  function show(l){
    cur = l;
    document.getElementById('d-crumb').textContent = l.stage + ' · ' + (l.i + 1) + ' of ' + L.length;
    document.getElementById('d-name').textContent = l.name;
    document.getElementById('d-sub').textContent = l.subject;
    document.getElementById('d-from').textContent = 'From: ' + l.fromLine + (l.replyTo ? ' · replies to ' + l.replyTo : '');
    document.getElementById('d-dl').innerHTML = row('When', e(l.when)) + row('Who gets it', e(l.who))
      + row('From the page', '<a href="' + e(l.from) + '" target="_blank" rel="noopener">' + e(l.fromShort) + '</a>')
      + row('Also', e(l.also)) + row('Attached', l.attach.map(function(a){ return '<span class="tag">' + e(a) + '</span>'; }).join(' '))
      + row('Sample', e(l.sample)) + row('Sent by', '<code>' + e(l.sentBy) + '</code>');
    frame.srcdoc = l.html; pre.textContent = l.text; paint();
    dlg.querySelector('[data-step="-1"]').disabled = l.i === 0;
    dlg.querySelector('[data-step="1"]').disabled = l.i === L.length - 1;
    if (history.replaceState) history.replaceState(null, '', '#' + l.id);
  }
  function paint(){
    frame.hidden = view !== 'html'; pre.hidden = view !== 'text';
    dlg.querySelectorAll('[data-v]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.v === view)); });
  }
  var small = window.matchMedia('(max-width: 820px)');
  function open(id, from){ var l = by[id]; if (!l) return; opener = from || null; document.getElementById('d-about').open = !small.matches; show(l); if (!dlg.open) dlg.showModal(); }
  document.addEventListener('click', function(ev){
    var t = ev.target.closest('[data-open]'); if (t) { open(t.dataset.open, t); return; }
    var s = ev.target.closest('[data-step]'); if (s && cur) { var n = L[cur.i + Number(s.dataset.step)]; if (n) show(n); return; }
    var v = ev.target.closest('[data-v]'); if (v) { view = v.dataset.v; paint(); return; }
    if (ev.target.closest('[data-x]')) dlg.close();
    if (ev.target === dlg) dlg.close();
  });
  dlg.addEventListener('keydown', function(ev){
    if (!cur || ev.target.closest('iframe')) return;
    if (ev.key === 'ArrowRight' && L[cur.i + 1]) show(L[cur.i + 1]);
    if (ev.key === 'ArrowLeft' && L[cur.i - 1]) show(L[cur.i - 1]);
  });
  dlg.addEventListener('close', function(){ if (history.replaceState) history.replaceState(null, '', location.pathname + location.search); if (opener && opener.focus) opener.focus(); });
  // Find: hide what does not match, keep each stage's heading while any of its letters match.
  var q = document.getElementById('q');
  q.addEventListener('input', function(){
    var w = q.value.trim().toLowerCase();
    document.querySelectorAll('[data-open]').forEach(function(b){
      var l = by[b.dataset.open]; var hit = !w || (l.name + ' ' + l.subject + ' ' + l.text + ' ' + l.when + ' ' + l.fromShort).toLowerCase().indexOf(w) >= 0;
      (b.closest('li') || b).classList.toggle('hide', !hit);
    });
    document.querySelectorAll('.stage').forEach(function(s){
      var any = s.querySelector('[data-open]:not(.hide), li:not(.hide) [data-open]');
      s.classList.toggle('hide', !!w && !any);
      s.querySelectorAll('.course').forEach(function(c){ c.classList.toggle('hide', !!w && !c.querySelector('li:not(.hide)')); });
    });
  });
  // The strip lights the stage being read.
  if ('IntersectionObserver' in window) {
    var steps = {}; document.querySelectorAll('.step').forEach(function(a){ steps[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function(es){ es.forEach(function(x){ if (x.isIntersecting) { Object.keys(steps).forEach(function(k){ steps[k].classList.toggle('on', k === x.target.id); }); } }); }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.stage').forEach(function(s){ io.observe(s); });
  }
  if (location.hash && by[location.hash.slice(1)]) open(location.hash.slice(1));
})();
</script>
</body>
</html>
`;
}

const here = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === here) {
  const args = process.argv.slice(2);
  const outFile = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--exploraself');
  const exIdx = args.indexOf('--exploraself');
  const exploraself = exIdx >= 0 ? resolve(args[exIdx + 1]) : '';
  if (!outFile) { console.error('Usage: node scripts/email-map.mjs <out.html> [--exploraself <repo>]'); process.exit(1); }
  const data = await collect({ exploraself });
  writeFileSync(outFile, page(data));
  console.log(`${data.letters.length} letters${data.withExploraself ? ' (with exploraself.com results)' : ''} → ${outFile}`);
  if (exploraself && !data.withExploraself) console.log('Note: the exploraself results letters were not drawn (repo or esbuild not found).');
}
