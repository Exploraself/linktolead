// The Founder’s Blueprint skeleton (Phase 2, for Alexandru’s approval).
//
// This file holds only what the skeleton ADDS to Version 4. Every question,
// option, scale, sentence and four-lines text comes from public/levels-v4.js
// and is never copied here. scripts/blueprint-skeleton.mjs reads both and
// writes docs/blueprint-skeleton.md, docs/blueprint-skeleton.html and
// docs/level-01-one-at-a-time.html.
//
// Per domain, keyed 'level.domain' (domain 0 to 3 = yourself, people,
// business, market):
//   topic  the one thing this domain is about, in plain words
//   on     null when the sentence already has its day (field `dayKey`,
//          default 'day'); else the question of the added day screen
//          (new saved key `on`); onEx: its example, default Friday
//   done   "Done when", checkable on Sunday; {key} is the founder’s answer
//   gp     Growth Plan steps: [step, 'uses' | 'deepens' | 'feeds', note?]
//   lp     Launchpad plan action this meets: [title, 'uses' | 'deepens' | 'change', note]
//   uses   an earlier level’s answer this domain shows back
//   pl     where it lands in The Leader’s Growth Planner 2027
//   stage  { building | growing | scaling: note } only where truly different
//   change a change to the Version 4 text, with its reason

export const DOMAINS = [
  // ── Level 01 · SEED ──────────────────────────────────────────────
  ['1.0', { topic: 'The rule that decides your worth', on: null,
    done: 'on {day} you did “{act}”, and wrote one line on what really happened.',
    gp: [[4, 'deepens', 'the voice that says you are not good enough']],
    pl: 'Monday page · The habit I’m fighting: the old rule, word for word' }],
  ['1.1', { topic: 'One task out of your hands', on: null,
    done: '{who} did {task} once, to “{done}”, and you checked it only once.',
    gp: [[10, 'deepens']],
    lp: ['Give one thing away', 'change', 'the same hand-over, a week later. The plan counts the hours it gave back instead.'],
    stage: { building: 'No team yet? Hand it to a tool, a template, or a freelancer for two hours.' } }],
  ['1.2', { topic: 'Money: the sentence you grew up with, and your enough', on: null,
    done: 'on {day} you made one money move: {move}.',
    gp: [[12, 'uses', 'if step 12 is written, its first line shows above the tap']],
    lp: ['Name your enough', 'change', 'the money amount is asked here the same week. The plan keeps the time: free evenings and most hours a week.'] }],
  ['1.3', { topic: 'Asking someone to buy', on: null,
    done: 'you asked {names} by {day}, and wrote each answer word for word. A yes and a no both count.',
    gp: [[16, 'uses', 'the three names from step 16 are offered as taps'], [17, 'deepens']],
    lp: ['Make three asks', 'change', 'the same three asks, the same fortnight. The plan counts asks, yes, no and no answer in week 3 instead.'] }],

  // ── Level 02 · VIEW ──────────────────────────────────────────────
  ['2.0', { topic: 'Facts before the story', on: 'By which day will one more event be written this way?',
    done: 'by {on}, one more event (the next thing that goes wrong, or the hardest moment of the week) is written as facts, story and a truer reading, before you acted on it.' }],
  ['2.1', { topic: 'Ask before you judge', on: null,
    done: 'by {day} you asked {who} the question, only listened, and wrote one line of what you heard.' }],
  ['2.2', { topic: 'Your five numbers, on a fixed day', on: null,
    done: 'on {day} at {time} you read all five numbers, {fear} first, and wrote them down.',
    lp: ['Read last month’s money', 'uses', 'the statement you opened in week 1 holds four of the five.'],
    stage: { building: 'No sales yet? Money in is zero: read it anyway, and add one more number, conversations held.' } }],
  ['2.3', { topic: 'One customer signal, tested', on: 'By which day will you have checked it once?',
    done: 'by {on} you checked the signal once, by {check}, and wrote what the customer actually said.' }],

  // ── Level 03 · CALM ──────────────────────────────────────────────
  ['3.0', { topic: 'The feeling under the stress', on: 'By which day will you have used it once?',
    done: 'by {on}, the next time {feeling} came, you did this first: {help}. You wrote the day it happened.' }],
  ['3.1', { topic: 'Your first five seconds under pressure', on: 'Which day will you ask {who}?',
    done: 'you asked {who} on {on} to tell you when you slip, and under pressure you did this at least once: {will}.',
    stage: { building: 'No team yet? The people around you are clients, partners and family. Ask one of them.' } }],
  ['3.2', { topic: 'A rule for decisions in a storm', on: 'By which day will the rule be where you see it?',
    done: 'by {on}, the rule is on your phone’s lock screen or on your desk, and one person knows it.' }],
  ['3.3', { topic: 'Your client’s fear, in their words', on: null,
    done: 'you asked {who} by {day}, and wrote their fear and their hope in their own words.',
    lp: ['Hear it in their words', 'uses', 'ask one of the three people you heard in week 1, now about fear and hope.'] }],

  // ── Level 04 · STEP ──────────────────────────────────────────────
  ['4.0', { topic: 'Decide once, in advance', on: 'Which day will you use it first?',
    done: 'you used the plan on {on} and on two more days, and wrote “kept” or “not kept” each time.',
    gp: [[3, 'deepens', 'two habits out']] }],
  ['4.1', { topic: 'One ask with a date and a done', on: null, dayKey: 'when',
    done: '{who} has the ask in writing, with the date and the done, and on {when} you checked it once.',
    lp: ['Say one expectation out loud', 'change', 'this level asks it with a date and a done. The plan counts last week’s clear asks instead.'] }],
  ['4.2', { topic: 'Your hour has a price', on: 'Which day will you hand back {back}?',
    done: '{first} came first on three days, and {back} was handed back by {on}.',
    lp: ['Find your cheapest hour', 'uses', 'the cheapest hour found in week 2 is the first one to hand back.'],
    stage: { scaling: 'Price your team’s hour too: what one hour of their work costs you.' } }],
  ['4.3', { topic: 'A weekly selling hour', on: null,
    done: 'on {day} at {time} you talked with {n} potential buyers, and everyone heard from you twice.',
    lp: ['Count your conversations', 'uses', 'the Friday count from week 3 is the number to beat.'] }],

  // ── Level 05 · FACT ──────────────────────────────────────────────
  ['5.0', { topic: 'Proof of who you are becoming', on: 'By which day will you add one more proof?',
    done: 'by {on}, a second dated proof is written under the first.',
    uses: 'Level 01 · your new sentence (“I am … before I achieve anything”)' }],
  ['5.1', { topic: 'Thanks that names the thing', on: 'Which day will you tell {who}?',
    done: 'you told {who} on {on}, face to face or in writing, what they did and what it changed.',
    lp: ['Name what someone did well', 'change', 'this level does it. The plan counts specific thanks given in week 3 instead.'] }],
  ['5.2', { topic: 'One number that tells the truth', on: null,
    done: 'on {day} you read {num}, wrote it on your Planner’s Monday page, and, if it missed, one line on the belief behind it.',
    lp: ['Choose your Monday number', 'uses', 'the same number: the slide asks how many weeks in a row you have read it.'],
    pl: 'Monday page · the number, every week' }],
  ['5.3', { topic: 'Their words, not yours', on: 'By which day will you ask three clients?',
    done: 'you asked three clients by {on}, and wrote their answers word for word.',
    change: 'The “Exactly” line said “by Friday”. It now says “by {on}”, the day the founder chose.' }],

  // ── Level 06 · TALK ──────────────────────────────────────────────
  ['6.0', { topic: 'The conversation you keep postponing', on: null,
    done: 'the talk with {who} happened on {day}, and you said the first sentence as you wrote it.',
    gp: [[6, 'uses', 'the person and the conversation named in step 6 show above the tap'], [8, 'feeds', 'Done here ticks step 8']] }],
  ['6.1', { topic: 'Ask, then listen', on: 'Which day is the talk with {who}?',
    done: 'in the talk with {who} on {on} you asked “{ask}”, and spoke less than half the time.' }],
  ['6.2', { topic: 'Money that is yours', on: null,
    done: 'the message went to {who} on {day}. Being paid by {by} is theirs to do; sending it was yours.',
    stage: { building: 'Nothing unpaid? Take the work you did for free, and ask to be paid for it from now on.' } }],
  ['6.3', { topic: 'A kind no, with an alternative', on: 'By which day will you say it?',
    done: 'you said the kind no about {what} by {on}, offered {suggest}, and added no discount.' }],

  // ── Level 07 · HOUR ──────────────────────────────────────────────
  ['7.0', { topic: 'Your best hours, guarded', on: null, dayKey: 'days',
    done: 'the hours from {from} to {to} are in your calendar for the next four weeks, and you kept them this week, {days}.',
    gp: [[15, 'deepens', 'a half-day without you']],
    lp: ['Guard one block', 'deepens', 'one block in week 2; here, your best hours, every week.'] }],
  ['7.1', { topic: 'One task, one step up', on: 'Which day this week will it run that way for the first time?',
    done: 'on {on}, {task} ran once at “{to}”, and {day} is in your calendar as the day it stays there.',
    uses: 'Level 01 · the task you handed over (Entrust)',
    gp: [[10, 'uses']],
    stage: { building: 'No team? The next step is a template or a tool doing it, and you checking.' } }],
  ['7.2', { topic: 'The price you never go below', on: 'By which day will the floor be written next to your prices?',
    done: '{floor} is written next to your price list by {on}, and your next quote was at or above it.',
    lp: ['Know your number', 'uses', 'what one sale leaves you, from week 1.'] }],
  ['7.3', { topic: 'One marketing hour a week', on: null,
    done: 'on {day}, from {from} to {to}, you did “{act}” on {where}, and the hour is in your calendar for four weeks.' }],

  // ── Level 08 · GOLD ──────────────────────────────────────────────
  ['8.0', { topic: 'What you are best at, and what to stop', on: 'By which day will you stop selling {stop}?',
    done: 'by {on}, {stop} came off your price list or offer page, or you said no to one request.',
    gp: [[11, 'deepens', 'where you play small']] }],
  ['8.1', { topic: 'Three clear steps after yes', on: 'By which day will the three steps be written?',
    done: 'by {on}, the three steps are in the message every new client gets, and {who} knows step {which} is theirs.',
    stage: { building: 'No clients yet? Write the three steps for your first one, and walk a friend through them.' } }],
  ['8.2', { topic: 'Three price levels', on: 'By which day will the three levels be on your offer page?',
    done: 'by {on}, the three levels are on your offer page or price list, and you said them out loud once to a buyer.',
    gp: [[13, 'feeds', 'saying the price out loud is step 13']] }],
  ['8.3', { topic: 'Your offer in one line', on: 'By which day will you have said it to three people?',
    done: 'by {on}, you said the line to three people the same way, and one could say it back.',
    uses: 'Level 01 · who you help, and with what (Dignity)' }],

  // ── Level 09 · FLOW ──────────────────────────────────────────────
  ['9.0', { topic: 'A weekly review you keep', on: null,
    done: 'on {day} at {time} you held the review and wrote {three} priorities on your Planner’s Monday page.',
    gp: [[21, 'uses', 'the inner boardroom is the review']],
    pl: 'Sunday page · what really happened; Monday page · three goals',
    change: 'The sentence said “30 minutes”. Proposed: “ten minutes”, the same as Growth Plan step 21. Decision D3.' }],
  ['9.1', { topic: 'One area with an owner', on: 'By which day will {who} know?',
    done: 'by {on}, {who} has it in writing: they own {owns} up to {limit}, and one decision was made without you.',
    gp: [[9, 'feeds', 'one decision made without you']],
    stage: { building: 'No team? Name the tool, template or freelancer that owns the area, and what you still check.' } }],
  ['9.2', { topic: 'One page of cash', on: null,
    done: 'on {day} the page shows this week’s in, out and left, and you know what you do below {alert}.',
    lp: ['Read last month’s money', 'deepens', 'once in week 1; here, every week, with an alert line.'] }],
  ['9.3', { topic: 'A warm list you can see', on: null,
    done: 'the {n} names are written down, and on {day} you moved {m} of them one step.',
    stage: { scaling: 'Each person who sells keeps their own list; you read the total every week.' } }],

  // ── Level 10 · NAME ──────────────────────────────────────────────
  ['10.0', { topic: 'People you already know', on: 'By which day will the messages be sent?',
    done: 'by {on}, {n} messages are sent, starting with {first}, and you counted the replies.',
    uses: 'Session 2 · the ten names chosen from your warm list',
    gp: [[16, 'uses'], [19, 'deepens', 'the no you are afraid of']] }],
  ['10.1', { topic: 'One partner asked', on: 'By which day will you ask {who}?',
    done: 'you asked {who} by {on}, and offered your part first.' }],
  ['10.2', { topic: 'Your best client, described', on: 'By which day will you list them?',
    done: 'by {on}, every current client who shares all three is listed by name.',
    lp: ['Name your best customer', 'uses', 'the person named in week 1 is the first example.'],
    stage: { building: 'Fewer than three clients? Describe the one you want most, and the first one who paid.' } }],
  ['10.3', { topic: 'Customer conversations about their past', on: 'By which day will three be booked?',
    done: 'by {on}, three of the {n} conversations are booked or held, and you wrote their exact words.' }],

  // ── Level 11 · EDGE ──────────────────────────────────────────────
  ['11.0', { topic: 'Feedback, asked for', on: 'By which day will you have asked all three?',
    done: 'by {on} you asked {a}, {b} and {c}, wrote each answer down, and only said thank you.',
    lp: ['Ask for the truth', 'change', 'this level asks three people. The plan counts the people who told you something hard instead.'] }],
  ['11.1', { topic: 'One open question, every meeting', on: 'Which day is the next {meet}?', onEx: 'Monday',
    done: 'at the {meet} on {on} you asked “What isn’t working that I don’t know?”, and did this before you answered: {do}.',
    stage: { building: 'No team meeting? Ask it of a partner, a supplier, or a client at the end of each job.' } }],
  ['11.2', { topic: 'Your advantage, with proof', on: 'By which day will it be where buyers see it?',
    done: 'by {on}, the sentence and its proof are on your offer page or in your next proposal.' }],
  ['11.3', { topic: 'Testimonials asked for', on: null,
    done: 'you asked {n} clients by {day}, and every answer you got is where buyers decide.',
    uses: 'Level 05 · the three clients you asked for their words (Testimony)' }],

  // ── Level 12 · RISE ──────────────────────────────────────────────
  ['12.0', { topic: 'Who you are now', on: 'By which day will you read it aloud to someone?',
    done: 'by {on}, the sentence is on the first page of your Planner, and you read it aloud to one person.',
    gp: [[2, 'deepens', 'the drive behind your desire']] }],
  ['12.1', { topic: 'Grow one leader', on: null,
    done: '{who} knows, in writing, that they own {own}, and on {day} you asked “{ask}”',
    gp: [[10, 'uses']],
    stage: { building: 'Nobody yet? Pick the freelancer you use most, or the first person you would hire, and give them one decision.' } }],
  ['12.2', { topic: 'One number for the next ninety days', on: 'By which day will it be in your Planner?',
    done: 'by {on}, your Planner’s twelve-week contract holds the number ({num}, from {from} to {to}) and both checkpoints with their dates.',
    gp: [[5, 'feeds', 'twelve weeks of truth']],
    pl: 'Twelve-week contract (front pages)',
    stage: { scaling: 'Give each owner from Level 09 their own checkpoint, and read all of them on the same day.' } }],
  ['12.3', { topic: 'One small market test', on: 'By which day will the first invitations go out?',
    done: 'by {on}, the first invitations are out, and success ({win} by {day}) is written in your Planner.' }],
];

/** The two 1:1 sessions with Alexandru and the team. */
export const SESSIONS = [
  { n: 1, at: 'Opens Level 04, before its first screen', after: 3, name: 'Set the twelve weeks',
    bring: 'The North Star result, the answers of Levels 01 to 03, and the Launchpad plan counts. Alexandru and the team read them before the call.',
    agenda: [
      'Read the first three weeks together: which actions were Done, Partly, Not yet.',
      'Name the one domain that costs the business most right now.',
      'Set one number for the twelve weeks, with a date. It goes into the Planner’s twelve-week contract (Growth Plan step 5).',
      'Write the first if–then plan of Level 04 together.',
    ],
    done: 'the number and its date are in your Planner’s twelve-week contract, and your first if–then is written.' },
  { n: 2, at: 'After the Chapter II reading (end of Level 09), before Level 10', after: 9, name: 'Open the market',
    bring: 'The Chapter II reading, your offer line (Level 08), your three price levels and your warm list (Level 09).',
    agenda: [
      'Read the Chapter II reading together: what moved, what did not.',
      'Say the offer line and the three prices out loud, and fix what stumbles.',
      'Choose the first ten names from the warm list for Level 10.',
      'Draft the 90-day number that Level 12 makes final.',
    ],
    done: 'ten names are chosen for Level 10, and a first draft of the 90-day number is written.' },
];

/** The three chapter readings: one screen each, in this order. */
export const READING_SCREENS = [
  ['Where you were', 'The Version 4 reading, unchanged: the four corners from your own slides, the lowest and the highest, four lines, and your own sentence to carry into the next chapter.'],
  ['What you did', 'New. The chapter’s actions: how many Done, Partly, Not yet, from your Sunday answers.'],
  ['How you estimate', 'New. Your “how sure” against what happened: too hopeful, about right, or too careful. The same three words as the Planner’s Sunday page.'],
  ['What you believed, what you believe now', 'New. Each level’s old sentence and new sentence, side by side (Version 4 text).'],
  ['Where you began', 'New. The domain the North Star told you to start with, against your lowest corner now.'],
  ['In his words', 'New. One sentence from Alexandru, word for word from his book, with where it is found.'],
  ['Your next move', 'New. Tap the one undone action that matters most, pick its day, and read its “Done when”. It is carried into next week next to the new level’s four, and asked about on Sunday like them.'],
];
export const READINGS = [
  { ch: 0, after: 5, quote: 'The way you run your day is the way you run your company. If you avoid your numbers at home, you will avoid them at work.',
    source: 'Worth Building (the Library), page “Business is life, and life is business”',
    extra: 'Actions counted: Levels 01 to 04 (16). Level 05’s four are checked when Level 06 opens.' },
  { ch: 1, after: 9, quote: 'Stick to what you do best, and serve people. The money follows the service, not the other way round.',
    source: 'Worth Building (the Library), page “The 50/50 rule”',
    extra: 'Actions counted: Levels 05 to 08 (16). Then Session 2.' },
  { ch: 2, after: 12, quote: 'I believe each of us has been given talents, and that we are meant to multiply them, not bury them.',
    source: 'Worth Building (the Library), “A word from Alexandru · Allow yourself to rise”',
    extra: 'Actions counted: Levels 09 to 11 (12), and the whole programme. Level 12’s four are checked in week 13, which then opens the North Star again, to compare with where you began.' },
];

/** Launchpad plan: actions that repeat a level become counts (the plan is
 *  the numbers; the levels act on them). Proposals, outside Version 4. */
export const LAUNCHPAD_CHANGES = [
  ['Lead yourself', 'Name your enough', 'Week 1', 'Drop the money amount (Level 01 asks it the same week). Keep: free evenings a week, time for ___, at most ___ hours a week.'],
  ['Lead your people', 'Say one expectation out loud', 'Week 1', '“Count your clear asks”: last week’s requests ___, with a date ___, with a “done” ___. Level 04 acts on it.'],
  ['Lead your people', 'Give one thing away', 'Week 2', '“Count what came back”: hours the task from Level 01 took you before ___, this week ___.'],
  ['Lead your people', 'Ask for the truth', 'Week 2', '“Count the hard truths”: people who told you something hard this month ___. Level 11 acts on it.'],
  ['Lead your people', 'Name what someone did well', 'Week 3', '“Count your thanks”: specific thanks you gave this week ___. Level 05 acts on it.'],
  ['Lead the market', 'Say your offer in one sentence', 'Week 2', '“Count where clients came from”: your last ten, by referral ___, repeat ___, your network ___, online ___. Level 08 writes the offer line.'],
  ['Lead the market', 'Make three asks', 'Week 2', 'Move to week 3 as “Count your asks since Level 01”: asks ___, yes ___, no ___, no answer ___.'],
];

/** Decisions only Alexandru can make. */
export const DECISIONS = [
  ['D1', 'How many 1:1 sessions, and where', 'The brief says two in Levels 04–12. The ladder on the site (public/content.js) says one in The Boardroom (04–05), two in the LAB, three in total with the HUB.', 'Two: Session 1 opens Level 04, Session 2 follows the Chapter II reading. Then the ladder copy changes to match (Phase 3).'],
  ['D2', 'Start with the weakest domain?', 'The level’s word is spelled one letter per domain, in order.', 'Keep the word order on screen. The weakest domain from the North Star gets the “Start here” mark, and its action becomes the week’s one move on the Planner’s Monday page.'],
  ['D3', 'How long is the weekly review?', 'Launchpad plan: 5 minutes. Growth Plan step 21: ten minutes. Level 09: 30 minutes.', 'Ten minutes, everywhere. A short review that happens beats a long one that does not.'],
  ['D4', 'Two things called “boardroom”', '“The Boardroom” is the paid session for Levels 04–05. “Your inner boardroom” is the Sunday page of the Planner and Growth Plan step 21.', 'Keep both, always with their full names: “The Boardroom with Alexandru” and “your Sunday boardroom”.'],
  ['D5', 'Ninety days or twelve weeks?', 'Level 12 says 90 days. The Planner contract and Growth Plan step 5 say twelve weeks. The Planner’s reviews come every 13 weeks.', 'Say “twelve weeks” everywhere, Level 12 included. One horizon.'],
  ['D6', 'Level words that are also tool names', 'The book in public/library/built-to-lead.pdf lists 100 tools; three of its names are SEED, VIEW and FACT, with other meanings.', 'Keep the level words. The tool names never show on screen (rule 4). Rename the three tools in the book when it is next printed.'],
  ['D7', 'The Leading stage', 'The North Star has four stages; there are three manuals. Leading uses the Scaling manual today.', 'Keep it: Leading reads Scaling, with its own stage notes added only when you write them.'],
  ['D8', 'Book file names', 'public/library/built-to-lead.pdf is titled “100 Frameworks” (no byline); worth-building.pdf is “The Founder’s Manual · 32 frameworks”.', 'Tell me the right titles; quotes only come from books you confirm are yours.'],
];

/** Phase 1 audit, kept short. */
export const COVERAGE = {
  head: ['', 'Lead yourself', 'Lead your people', 'Lead your business', 'Lead the market'],
  rows: [
    ['North Star (8 questions)', 'where you stand, 2 questions', 'where you stand, 2 questions', 'where you stand, 2 questions', 'where you stand, 2 questions'],
    ['Growth Plan (20 + 1)', 'steps 1–5: exception, drive, habits, voice, 12 weeks', 'steps 6–10: postponed talk, who taught you, face to face, not needed, one person grows', 'steps 11–15: playing small, money belief, price aloud, fear of success, half-day away', 'steps 16–20: hidden from, begging, story, the no, a brave move a week'],
    ['Launchpad plan (20)', 'count your week, enough, one block, a decision, promises kept', 'who carries it, an expectation, give one away, the truth, thanks', 'your number, last month’s money, one process, cheapest hour, Monday number', 'best customer, their words, offer line, three asks, conversations'],
    ['Blueprint levels (48)', 'worth rule, reading, feeling, if–then, proof, …', 'trust, asking, atmosphere, clear asks, thanks, …', 'enough, five numbers, storm rule, hour, count, …', 'asking to buy, signals, their fear, selling hour, testimony, …'],
    ['Planner 2027', 'one move, habit fought, wisdom check', 'story bank', 'goals, estimate vs reality', 'story bank'],
    ['Stage manuals (3)', 'old seven-step method', 'old seven-step method', 'old seven-step method', 'old seven-step method'],
    ['Books (3)', 'strong', 'strong', 'money: Worth Building only', 'thinnest'],
  ],
};
export const GAPS = [
  'In 28 of 48 domains the sentence has no day for its action, and one more (Own it) has a date weeks away; none has a “Done when”.',
  'Nothing in the app records what really happened, or how sure the founder was. Only the Planner does, on paper.',
  'The three readings never look back at the actions, or at the North Star.',
  'The two sessions have no stated purpose or result.',
  'The manuals do not teach Version 4: 0 of 36 manual promises match (scripts/make-manuals.mjs reads the old levels, never levels-v4.js).',
  'The market domain is the thinnest in the books; money is only in Worth Building.',
];
export const CONTRADICTIONS = [
  'Sessions: two (brief) against one, two and three (site ladder). D1.',
  'Weekly review: 5, 10 and 30 minutes. D3.',
  '“Boardroom” means a paid session and a Sunday page. D4.',
  '90 days (Level 12) against twelve weeks (Planner, Growth Plan) against 13 weeks (Planner reviews). D5.',
  'SEED, VIEW, FACT are level words and also tool names in a book. D6.',
  'The North Star promises Version 4 for weeks 1–3; the manuals teach the old method. Phase 4.',
  'Four North Star stages, three manuals. D7.',
];

/** The principles the programme stands behind: where each one lives. Never
 *  pasted on screen as slogans (rule 4); this table is for Alexandru. */
export const PRINCIPLES = [
  ['P.A.C.E.', 'The four moves of every domain: the tap pauses to name it, the slide assesses it, the sentence chooses, and the action with its day and “Done when” executes. The four lines read it back.'],
  ['Inform. Reform. Transform.', 'The three chapters: the truth about you (I), the engine room rebuilt (II), the market coming to you (III).'],
  ['Business is life, and life is business', 'Chapter I starts inside the founder. Every week mixes life and work: Level 01 is an evening off, a task handed over, a money move and three asks. The first reading quotes this page.'],
  ['Stick to what you do best, and serve people', 'Level 08 (what you are best at, and one thing stopped) and Level 01 (asking to buy as service). The second reading quotes this page.'],
  ['Unbalance for the balance', 'One domain leads each week (“Start here”, my one move), not four equal ones. Each reading names the lowest corner, and the next chapter leans there.'],
  ['A time to push, a time to help', 'The “Done when” pushes: a day, checkable on Sunday. The Sunday check helps: “Not yet” is an answer, never a mark against you, and the next move carries it. The two sessions are where Alexandru and the team help.'],
  ['Achievement is an act of kindness', 'Asking to buy (01), the money owed (06), the warm list moved (09): getting it done serves the people waiting on you.'],
  ['Win with grace', 'The kind no with an alternative (06), feedback answered only with thank you (11), proof asked for in clients’ own words, never written for them (05, 11).'],
];
