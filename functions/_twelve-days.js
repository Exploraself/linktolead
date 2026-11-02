// 12 Days to Start Winning (Alexandru, 2 Nov 2026; first drafted as "12
// Principles in 12 Days"). A free subscription from the toolkit (/12-days/):
// a welcome at once, then one letter each morning at 8:00 in the founder's
// own time zone: one principle from A New Way of Winning and one move. By Day
// 12 they have made 12 moves. Day 13 says what comes next, and the letters
// stop.
//
// Every letter uses the frame in functions/_letters.js: Alexandru's voice,
// the greeting, thanks and encouragement, "reply here" with one shortcut, the
// signature, a P.S. with one offer, and the footer (why it came, unsubscribe,
// postal address) from functions/_mail.js. Sent by Resend, never Mailchimp.
//
// The words are Alexandru's approved letters, unchanged but for the new name
// and one line that says the team and I are here. Every “In the book” quote
// is checked word for word against A New Way of Winning: never edit a quote
// here without the book open.
//
// The schedule (worker.js `scheduled`, every hour on the hour, wrangler.toml
// [triggers]): a subscriber whose local time is 8:00 gets the next letter,
// one a day, never two on the same local day, never the day they joined, and
// nothing after Day 13. An unsubscribe or a paused account stops it. Each
// letter is claimed in the database before it is sent, so two runs can never
// send it twice; a letter that fails to send is released and goes the next
// morning.

import { letter, button, link, OFFERS } from './_letters.js';
import { send, mailState } from './_mail.js';
import { letterContext, okTz } from './_mentor.js';
import { unsubLink, profile } from './_account.js';
import { db, now, accountTables } from './_shared.js';

export const NAME = '12 Days to Start Winning';
export const LAST_DAY = 13;
/** The hour each letter goes, in the founder's own time zone. */
export const SEND_HOUR = 8;
/** When the founder's time zone is not known. */
export const FALLBACK_TZ = 'America/New_York';
/** Where the links in a letter sent by the clock point (no request to ask). */
export const SITE = 'https://linktolead.exploraself.com';
export const WHY = `You get these letters because you joined ${NAME} at linktolead.exploraself.com.`;

/** The P.S. of each letter: one offer. Four are the frame's own (OFFERS);
 *  the rest point at what a free account already holds in the library. */
const library = (base) => link(`${base}/ground-plan/#library`);
export const PS = {
  book: { paid: false, line: (base) => ['The whole book behind these letters, A New Way of Winning, is free in your library. Twelve chapters, one for each day: ', library(base)] },
  planner: { paid: false, line: (base) => ['The Leader’s Growth Planner 2027 is free in your library: an agenda with a weekly check-in, to keep your plan and your habits in one place. ', library(base)] },
  worth: { paid: false, line: (base) => ['Worth Building is free in your library: 32 frameworks for the decisions in front of you. ', library(base)] },
  growth: { paid: false, line: (base) => ['Your Massive Growth Plan is free in your library: 20 + 1 steps to accelerate your growth and win with grace. Print it and write by hand. ', library(base)] },
  end: { paid: false, line: () => ['The letters stop here. My inbox doesn’t: reply any time, about anything you’re building.'] },
  play: OFFERS.play, first100: OFFERS.first100, library: OFFERS.library, boardroom: OFFERS.boardroom,
};

/** "The team and I are here" (every letter serves, Alexandru, 31 Oct 2026). */
export const teamLine = (day) => (day >= LAST_DAY ? 'The team and I are still here, whenever you need us.' : 'The team and I are here with you, every one of these twelve days.');

/** The fourteen letters: the welcome (day 0), Days 1 to 12, and Day 13.
 *  `body(base)` gives the paragraphs between the greeting and the close;
 *  `ask` is the one-tap reply under "reply here". */
export const LETTERS = [
  {
    day: 0, subject: "Welcome. Your 12 days start tomorrow", ps: "book", ask: "My one line: what I want different in 12 days",
    body: (base) => [
      "Thank you for joining 12 Days to Start Winning. I’m really glad you’re here.",
      "Here is how it works. Tomorrow morning, Day 1 arrives. Each day brings one principle from my book A New Way of Winning, in plain words. One small step you can take that day. One question you can answer by replying.",
      "Why this matters to me. In my late teens I made kitchens and wardrobes to measure, for about three years. I loved the craft and the clients. I managed money poorly, orders ran late, and my father closed the business. The business learned my habits. Skill without leadership collapses.",
      "So we start with you, the person, and then the business. Every step also has a place in your free Founder Launchpad, so nothing you write gets lost.",
      "One thing for today: reply with one line. What would you like to be different in 12 days?",
    ],
  },
  {
    day: 1, subject: "Day 1 · What is the money for?", ps: "planner", ask: "My Day 1 answer",
    body: (base) => [
      "Day 1 of 12. Thank you for starting. Today is the ground everything else stands on.",
      "Principle 01: Decide what winning is for.\nIn the book I wrote: “A worthwhile business begins with a definition of a worthwhile life.”",
      "In plain words: before you chase the next number, decide what the business is for. Start with enough: the income, the time and the people you want it to support. Your enough is a plan, not a measure of your worth.",
      "An example from the book: Elena is offered a contract that would grow her sales, but it needs her evenings all week. She started her business partly for time with her family. So before she says yes, she asks about hours, dates and support. She might reshape it, price it higher, or say no. The principle doesn’t choose for her. It stops her pretending the trade is free.",
      "Your step today (10 minutes):\nOpen last month’s bank statement. Write one number: the money a month that would be enough for the life you want. Under it, write one thing you will protect before the next sales goal.\nDone when: both lines are on paper, and you can say them out loud.",
      "In your Launchpad: Level 01 SEED, the move called Enough. You write your enough as one number, and one money move with a day.",
      button(`${base}/ground-plan/#programme`, "Open Level 01 · Enough →"),
      "Reply and tell me: if your business worked the way you want, what would it make possible, and for whom?",
    ],
  },
  {
    day: 2, subject: "Day 2 · Needed is not the same as reliable", ps: "play", ask: "My Day 2 answer",
    body: (base) => [
      "Day 2 of 12. Thank you for coming back. That already counts.",
      "Principle 02: Become someone you can rely on.\nIn the book: “The founder is a person before a role, and character is practised in ordinary commitments.”",
      "In plain words: being needed is not the same as being dependable. Choose promises small enough to keep and important enough to matter. A bad month doesn’t take away your worth. Your responsibilities still need you. Hold both.",
      "From my own life: in 2019 I competed in Classic Physique with the IFBB, and I won. What it taught me was the discipline nobody sees, and confidence that comes from evidence, not from a speech you give yourself.",
      "Your step today (10 minutes):\nOpen last week’s calendar. Find one promise to yourself you kept breaking. Make it smaller until you know you can keep it, then give it a day and a time.\nDone when: it is in your calendar for this week.",
      "In your Launchpad: Level 01 SEED, the move called Settled. You name the rule that quietly decides your worth, and test it once.",
      button(`${base}/ground-plan/#programme`, "Open Level 01 · Settled →"),
      "Reply and tell me: what promise did you make smaller, and what is it now?",
    ],
  },
  {
    day: 3, subject: "Day 3 · Praise is not a purchase", ps: "first100", ask: "My Day 3 answer",
    body: (base) => [
      "Day 3 of 12. Thank you for staying with it. Today we step outside, toward the people you serve.",
      "Principle 03: Meet reality and make a useful promise.\nIn the book: “Responsibility begins by separating what you know from what you hope.”",
      "In plain words: a kind word is interest. A payment is evidence. Name who you help, with what problem, at what price. Then watch what people do, not only what they say.",
      "An example from the book: Mira hears that her workshop sounds useful, and rents a bigger room. Before spending more, she offers a small pilot with a real price and a booking date. She writes down who buys, who doesn’t, and the reasons they give. Whatever happens, her next decision rests on more than compliments.",
      "Your step today (10 minutes):\nWrite your offer in one sentence: who it helps, with what problem. Then ask one real person to buy or book, at your real price.\nDone when: you have asked. When they answer, write it down word for word.",
      "In your Launchpad: Level 01 SEED, the move called Dignity. Asking someone to buy is serving them, not begging.",
      button(`${base}/ground-plan/#programme`, "Open Level 01 · Dignity →"),
      "Reply and tell me: what did they say, in their words?",
    ],
  },
  {
    day: 4, subject: "Day 4 · “Only me” is a question", ps: "library", ask: "My Day 4 answer",
    body: (base) => [
      "Day 4 of 12. Thank you for your time today. I know it is the thing you have least of.",
      "Principle 04: Give your attention a job.\nIn the book: “The week is where your stated priorities become visible commitments.”",
      "In plain words: your calendar shows what you really chose. Some work needs you. Some reaches you out of habit. When you think “only I can do this”, treat it as a question, not an answer.",
      "An example from the book: Luca answers every message at once, because it feels like service. A week of records shows his team waiting for him to approve routine work, while customer proposals wait too. He gives one colleague clear limits to decide alone, and opens two windows a day for ordinary questions. Urgent problems keep their own route.",
      "Your step today (10 minutes):\nOpen your messages from the last three days. Count the requests that waited for your answer. Pick one routine decision someone else could make, and write the limit up to which they decide alone.\nDone when: one decision has a person’s name and a limit next to it.",
      "In your Launchpad: Level 01 SEED, the move called Entrust. You hand one task to one person, with a day and what “done” means.",
      button(`${base}/ground-plan/#programme`, "Open Level 01 · Entrust →"),
      "Reply and tell me: which decision are you ready to let go of?",
    ],
  },
  {
    day: 5, subject: "Day 5 · What does “finished” mean?", ps: "worth", ask: "My Day 5 answer",
    body: (base) => [
      "Day 5 of 12. Thank you for showing up again. Today we turn a value into something people can check.",
      "Principle 05: Make your values operational.\nIn the book: “A standard is a value with a behaviour, a boundary and a response when it is missed.”",
      "In plain words: a value on the wall means little under pressure. Say what people will see you do, where the line is, and what happens when it’s missed. Write “finished” so someone can check it without reading your mood.",
      "An example from the book: a designer sends work that meets the brief. The founder asks for round after round of changes, because it doesn’t “feel premium”. Together they look at recent projects and write down what premium means: a clear order on the page, easy to read, proofed, approved. The next jobs use that definition, and a change of taste is called a change of taste, not poor work.",
      "Your step today (10 minutes):\nOpen one promise you make to customers: a quote, your website, a message. Write one line that says when that work is finished: the result, the proof, and who says yes.\nDone when: the line is written, and one person who does the work has read it.",
      "In your Launchpad: Level 02 VIEW, the move called Watch signals. The customer tells you if the promise was kept, so you check their signal instead of guessing. (Level 02 opens when the four moves of Level 01 are done.)",
      button(`${base}/ground-plan/#programme`, "Open Level 02 · Watch signals →"),
      "Reply and tell me: which value do you say your business holds, and what does it look like on a Tuesday?",
    ],
  },
  {
    day: 6, subject: "Day 6 · The talk you keep rehearsing", ps: "growth", ask: "My Day 6 answer",
    body: (base) => [
      "Day 6 of 12. Thank you. Halfway, and you’re still here.",
      "Principle 06: Tell the truth with care.\nIn the book: “Care takes another person seriously enough to be honest, specific and open to correction.”",
      "In plain words: a conversation you avoid keeps talking without you, through delays, rework and quiet stories. Start with what you can show: what happened, what was agreed, what it caused. Then ask for their side, and listen long enough to learn something.",
      "An example from the book: a founder keeps rescuing late material from a supplier. She writes down three agreed dates and the real arrivals, explains what the delays cause, and asks what is behind them. They agree a new confirmation step and a clear limit for future delays. She also finds another possible source.",
      "Your step today (10 minutes):\nOpen the messages about one issue you keep avoiding. Write your first sentence using only facts both of you can check. Add one question that asks for their side.\nDone when: the sentence and the question are written, and the talk has a day.",
      "In your Launchpad: Level 02 VIEW, the move called Inquire. Ask before you assume.",
      button(`${base}/ground-plan/#programme`, "Open Level 02 · Inquire →"),
      "Reply and tell me: what is the first sentence you will say?",
    ],
  },
  {
    day: 7, subject: "Day 7 · Why the work comes back to you", ps: "book", ask: "My Day 7 answer",
    body: (base) => [
      "Day 7 of 12. A full week. Thank you for keeping your word to yourself.",
      "Principle 07: Give ownership somewhere to live.\nIn the book: “Responsibility becomes workable when authority, capability and support accompany it.”",
      "In plain words: if you hand someone a result but keep every decision, the work comes back to you. Then it looks like proof that nobody can be trusted. Before you believe that, check what you really handed over: the result, the limits, the support, and who to call.",
      "An example from the book: a support colleague can spot a wrong charge, but waits for the founder to approve every correction. Together they write which cases the colleague may fix alone, a money limit chosen for their own business, and which exceptions come back for review. They look at the first cases together.",
      "Your step today (10 minutes):\nOpen the last task that came back to you. Write three lines: what they could decide alone, up to what limit, and when they call you.\nDone when: the three lines are written and shared with that person.",
      "In your Launchpad: Level 02 VIEW, the move called Verify. Facts first, then the story you told yourself, then a truer reading.",
      button(`${base}/ground-plan/#programme`, "Open Level 02 · Verify →"),
      "Reply and tell me: what is one decision someone else could own by next week?",
    ],
  },
  {
    day: 8, subject: "Day 8 · Profit on paper, less in the bank", ps: "planner", ask: "My Day 8 answer",
    body: (base) => [
      "Day 8 of 12. Thank you for opening this one. Today is about money, and that takes courage.",
      "Principle 08: Read the cost of your promises.\nIn the book: “Economic clarity protects the choices and obligations the business is meant to sustain.”",
      "In plain words: more sales can feel safer while the business gets harder to carry. Money earned and money in the bank are different things. A job can make a profit and still pay too late to fund the next one.",
      "An example from the book, with its own example figures: a business starts the month with $8,000 in the bank. It receives $10,000 and pays out $12,000. On paper the month made a profit. The bank still ends at $6,000, because of when money came in and went out.",
      "Your step today (10 minutes):\nOpen your bank account and your invoices. Write five numbers for last month: money in, money out, cash left, unpaid invoices, hours you worked. Mark every guess as a guess.\nDone when: all five are on one page, guesses marked.",
      "A machine could add these up in seconds. What they mean for your next promise is your call.",
      "In your Launchpad: Level 02 VIEW, the move called Evidence. You choose a day and a time to read your five numbers every week.",
      button(`${base}/ground-plan/#programme`, "Open Level 02 · Evidence →"),
      "Reply and tell me: which of the five numbers did you least want to look at?",
    ],
  },
  {
    day: 9, subject: "Day 9 · What breaks when you forget?", ps: "library", ask: "My Day 9 answer",
    body: (base) => [
      "Day 9 of 12. Thank you. Three days to go, and today’s step is a quiet one.",
      "Principle 09: Build systems that keep promises.\nIn the book: “A useful system makes reliable work easier while preserving human judgment.”",
      "In plain words: a system is anything that helps a promise survive an ordinary week. A checklist, a clear handoff, a reminder that doesn’t live in your head. Start where work waits, breaks or comes back to be fixed.",
      "From my own work: I build ExploraSelf with AI tools, so I know what they can do and what they can’t. They don’t decide what is worth doing, and they don’t carry the responsibility. AI multiplies what you do. Leadership decides what is worth doing.",
      "Your step today (10 minutes):\nOpen your to-do list or your messages. Find one thing that only happens when you remember it: a follow-up, an invoice, a reminder. Make it happen without your memory: a repeating calendar entry, a short checklist, or a person who owns it.\nDone when: it will happen next week even if you forget.",
      "In your Launchpad: Level 03 CALM, the move called Lag. You write a storm rule on a calm day, so a bad day can’t make your big decisions. It is a system for you. (Level 03 opens when Level 02 is done.)",
      button(`${base}/ground-plan/#programme`, "Open Level 03 · Lag →"),
      "Reply and tell me: what in your business only works when you remember it?",
    ],
  },
  {
    day: 10, subject: "Day 10 · Bigger, or enough?", ps: "first100", ask: "My Day 10 answer",
    body: (base) => [
      "Day 10 of 12. Thank you for your honesty so far. Today is about growth.",
      "Principle 10: Choose the growth you can stand behind.\nIn the book: “Growth earns its place through what it makes possible and the consequences it asks people to carry.”",
      "In plain words: every new idea arrives with a good story. Ask what it would make possible, and what it would cost: cash, time, people, trust. Then name what will stop to make room. Enough is a choice you are allowed to make.",
      "An example from the book: a profitable service business thinks about a second location. Before signing a long lease, the founder tests demand with a limited trial, with clear dates and scope. She tracks real bookings, the work it takes and the cash it ties up. She also names the work the current team will stop.",
      "Your step today (10 minutes):\nWrite down the growth idea on your mind. Then ask one customer two questions: what are you afraid of wasting, and what do you hope for?\nDone when: you have asked one customer and written their answer in their words.",
      "In your Launchpad: Level 03 CALM, the move called Meet their fear. Your clients’ fear and hope, in their own words.",
      button(`${base}/ground-plan/#programme`, "Open Level 03 · Meet their fear →"),
      "Reply and tell me: what deserves to get bigger in your business, and what should stay enough?",
    ],
  },
  {
    day: 11, subject: "Day 11 · Ask before you answer", ps: "play", ask: "My Day 11 answer",
    body: (base) => [
      "Day 11 of 12. Thank you. Today is about the people around you.",
      "Principle 11: Grow people who can lead.\nIn the book: “Leadership creates conditions in which other people can develop and exercise judgment.”",
      "In plain words: a team can get very good at receiving your decisions, and you become more and more necessary. Show how you decide. Ask for their view first. Hand over real decisions, one step at a time.",
      "From my own life: as a personal trainer I learned that there is a time to push, and a time to help. That is where I learned that leadership is serving.",
      "Your step today (one conversation):\nThe next time someone brings you a question, don’t answer first. Ask: “What are the options, and what would you do?” Listen to the whole answer before you give yours.\nDone when: one person gave you their recommendation before you gave yours.",
      "In your Launchpad: Level 03 CALM, the move called Atmosphere. You choose how you will meet bad news, and ask someone to tell you when you slip.",
      button(`${base}/ground-plan/#programme`, "Open Level 03 · Atmosphere →"),
      "Reply and tell me: who around you is becoming more capable because of the way you lead?",
    ],
  },
  {
    day: 12, subject: "Day 12 · Look back, honestly", ps: "boardroom", ask: "My Day 12 answer",
    body: (base) => [
      "Day 12 of 12. Thank you for walking all twelve days with me. Whatever you did or didn’t get to, you looked. That matters.",
      "Principle 12: Review, repair and hand on.\nIn the book: “Integrity includes examining consequences and changing the arrangement when reality requires it.”",
      "In plain words: a review is where your intentions meet the life they created. Look at the work, the money, the people, and the person carrying it all: you. Keep what worked. Repair what needs repair. An apology can be part of a repair, but it doesn’t finish it.",
      "An example from the book: a founder reaches her sales goal while her team absorbs late change after late change. In her review she keeps what she learned about selling, and admits what it cost to deliver. The next quarter gets a rule for changes, a named delivery owner and a shorter list of projects. She also repairs a commitment she had left unpaid.",
      "Your step today (15 minutes):\nOpen your notes from these twelve days. Write four lines: what I intended, what happened, what it cost, what I keep. Then pick one repair you owe someone.\nDone when: the repair has a name and a date.",
      "In your Launchpad: Level 03 CALM, the move called Call it. Under the word “stressed” there is a real feeling. You name it, then you decide.",
      button(`${base}/ground-plan/#programme`, "Open Level 03 · Call it →"),
      "Reply and tell me: what will you keep from these twelve days?",
    ],
  },
  {
    day: 13, subject: "What next: see where you stand", ps: "end", ask: "My North Star result",
    body: (base) => [
      "You gave your business twelve days of honest attention. Thank you. I’m proud of you for it.",
      "If you walked the moves along the way, your Founder Launchpad is done or close to it. Either way, the next question is simple: where do you stand today, in all four domains?",
      "The Leader’s North Star answers it. Eight plain questions and your rough numbers. You’ll see where you stand in Lead yourself, Lead your people, Lead your business and Lead the market, and which one needs you first. It’s free, and it ends with your Massive Growth Plan: 20 + 1 steps.",
      button(`${base}/northstar/`, "Open my North Star →"),
      "Ambition is good — let’s give it a road.",
      "Reply and tell me which domain it shows first. I’d love to know.",
    ],
  },
];

/** The twelve principles' titles, from the letters themselves. The page
 *  shows them only once the founder has subscribed (the API sends them). */
export const PRINCIPLES = LETTERS.filter((L) => L.day >= 1 && L.day <= 12)
  .map((L) => /^Principle \d\d: ([^\n]+?)\.?\n/.exec(L.body(SITE)[1])[1]);

/** One day's letter (0 = the welcome, 1–12, 13 = what next), in the frame of
 *  functions/_letters.js. `seed` is the day, so each letter keeps the same
 *  good word and the same three free assessments. Null for any other day. */
export function twelveDayLetter(base, day, { first = '', mentor, tz = '', at } = {}) {
  const L = LETTERS.find((x) => x.day === day);
  if (!L) return null;
  return { subject: L.subject, ...letter(base, [first ? `Hi ${first},` : 'Hi,', ...L.body(base), teamLine(day)], PS[L.ps],
    { mentor, tz, at, ask: [L.ask], seed: day, intro: day === 0 }) };
}

/** The date and hour where the founder is. An unknown zone is New York's. */
export function localNow(tz, at = new Date()) {
  const zone = okTz(tz) || FALLBACK_TZ;
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
    .formatToParts(at).map((x) => [x.type, x.value]));
  return { zone, date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24 };
}

/** Whether a subscriber gets their next letter at this moment, and which:
 *  8:00 where they are, a later local day than their last letter (or the day
 *  they joined), Day 13 not yet sent, letters on, account not paused. */
export function due(row, at = new Date()) {
  if (!row || row.stopped_at || Number(row.unsubscribed) || Number(row.paused)) return null;
  const day = Number(row.last_day || 0) + 1;
  if (day > LAST_DAY) return null;
  const t = localNow(row.tz, at);
  if (t.hour !== SEND_HOUR) return null;
  if (row.last_local_date && t.date <= row.last_local_date) return null;
  return { day, date: t.date, zone: t.zone };
}

const event = (D, id, kind, detail = null) => D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(id, kind, now(), detail).run();

/** This founder's subscription, or null. */
export async function subscription(D, studentId) {
  await accountTables(D);
  return D.prepare('SELECT subscribed_at, last_day, last_local_date, last_sent_at, welcome_sent, stopped_at FROM twelve_days WHERE student_id = ?').bind(studentId).first();
}

/** Subscribe a founder (`me`: id, email, name). Once only: a second subscribe
 *  changes nothing. A new subscription sends the welcome at once, unless the
 *  founder unsubscribed from letters or the account is paused (then nothing
 *  goes until they turn letters back on). Returns { fresh, lettersOff,
 *  welcome (true when the welcome was handed to the sender), row }. */
export async function subscribe(env, D, me, { base = SITE, tz = '', waitUntil } = {}) {
  await accountTables(D);
  const p = await profile(D, me.id);
  const ctx = await letterContext(D, me.id, tz);
  const at = new Date();
  const local = localNow(ctx.tz, at);
  const r = await D.prepare('INSERT INTO twelve_days (student_id, subscribed_at, last_day, last_local_date) VALUES (?,?,0,?) ON CONFLICT(student_id) DO NOTHING')
    .bind(me.id, at.toISOString(), local.date).run();
  const fresh = !!(r && r.meta && r.meta.changes === 1);
  const paused = await D.prepare('SELECT 1 AS x FROM account_auth WHERE student_id = ? AND paused = 1').bind(me.id).first();
  const lettersOff = !!(p.unsubscribed || paused);
  let welcome = false;
  if (fresh) {
    await event(D, me.id, 'twelve-days', 'subscribe');
    if (!lettersOff && mailState(env).ready) {
      welcome = true;
      const job = (async () => {
        const first = String(me.name || '').split(' ')[0];
        const out = await send(env, { to: me.email, ...twelveDayLetter(base, 0, { first, ...ctx, at }), why: WHY, unsubUrl: unsubLink(base, p) });
        if (out.ok) await D.prepare('UPDATE twelve_days SET welcome_sent = 1, last_sent_at = ? WHERE student_id = ?').bind(now(), me.id).run();
        await event(D, me.id, out.ok ? 'twelve-days-welcome' : 'twelve-days-welcome-failed', out.ok ? null : out.why || null);
      })().catch(() => {});
      if (typeof waitUntil === 'function') waitUntil(job); else await job;
    }
  }
  return { fresh, lettersOff, welcome, row: await subscription(D, me.id) };
}

/** Whether letters can reach this founder now: not unsubscribed, not paused. */
export async function lettersOn(D, studentId) {
  const p = await D.prepare('SELECT unsubscribed FROM student_profile WHERE student_id = ?').bind(studentId).first();
  const paused = await D.prepare('SELECT 1 AS x FROM account_auth WHERE student_id = ? AND paused = 1').bind(studentId).first();
  return !(p && p.unsubscribed) && !paused;
}

/**
 * The hourly run (worker.js `scheduled`). Every subscriber whose local time
 * is 8:00 and whose next letter is due gets it. The letter is claimed first
 * (last_day moves on only if nobody else moved it), then sent; a letter that
 * does not send is released, and goes the next morning. At most `limit`
 * letters a run. Resolves to { sent, failed, checked }.
 */
export async function twelveDaysTick(env, at = new Date(), { limit = 400, base = SITE } = {}) {
  const D = db(env);
  if (!D) return { sent: 0, failed: 0, checked: 0, why: 'No database.' };
  const ms = mailState(env);
  if (!ms.ready) return { sent: 0, failed: 0, checked: 0, why: ms.reason };
  await accountTables(D);
  const rows = (await D.prepare(`SELECT t.student_id, t.last_day, t.last_local_date, t.last_sent_at, t.stopped_at, s.email, s.name,
        p.tz, p.unsubscribed, p.unsub_id, COALESCE(au.paused, 0) AS paused
      FROM twelve_days t JOIN student s ON s.id = t.student_id
        LEFT JOIN student_profile p ON p.student_id = t.student_id
        LEFT JOIN account_auth au ON au.student_id = t.student_id
      WHERE t.last_day < ? AND t.stopped_at IS NULL`).bind(LAST_DAY).all()).results || [];
  let sent = 0, failed = 0;
  for (const row of rows) {
    if (sent + failed >= limit) break;
    const d = due(row, at);
    if (!d) continue;
    const claim = await D.prepare('UPDATE twelve_days SET last_day = ?, last_local_date = ?, last_sent_at = ? WHERE student_id = ? AND last_day = ?')
      .bind(d.day, d.date, at.toISOString(), row.student_id, row.last_day).run();
    if (!claim || !claim.meta || claim.meta.changes !== 1) continue; // another run sent it
    const ctx = await letterContext(D, row.student_id, d.zone);
    const first = String(row.name || '').split(' ')[0];
    const out = await send(env, { to: row.email, ...twelveDayLetter(base, d.day, { first, ...ctx, at }), why: WHY, unsubUrl: unsubLink(base, row) });
    if (out.ok) { sent++; await event(D, row.student_id, 'twelve-days', `day ${d.day}`); continue; }
    failed++;
    await D.prepare('UPDATE twelve_days SET last_day = ?, last_local_date = ?, last_sent_at = ? WHERE student_id = ? AND last_day = ?')
      .bind(row.last_day, row.last_local_date, row.last_sent_at, row.student_id, d.day).run();
    await event(D, row.student_id, 'twelve-days-failed', `day ${d.day}: ${out.why || 'not sent'}`);
  }
  return { sent, failed, checked: rows.length };
}
