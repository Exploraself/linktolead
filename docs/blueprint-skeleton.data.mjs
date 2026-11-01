// The Founder’s Blueprint skeleton (Phase 2, for Alexandru’s approval).
//
// This file holds only what the skeleton ADDS to Version 4. Every question,
// option, scale, sentence and four-lines text comes from public/levels-v4.js
// and is never copied here. scripts/blueprint-skeleton.mjs reads both and
// writes docs/blueprint-skeleton.md, docs/blueprint-skeleton.html and
// docs/level-01-one-at-a-time.html.
//
// Per domain, keyed 'level.domain' (domain 0 to 3 = yourself, people,
// business, market). The topic, the day, "Done when", the insight, what the
// founder keeps, the smaller step, the Blueprint part and the stage notes
// live with the levels, in public/levels-v4.js (PLAN4). Here, only how each
// domain meets the other pieces:
//   gp     Growth Plan steps: [step, 'uses' | 'deepens' | 'feeds', note?]
//   lp     Launchpad plan action this meets: [title, 'uses' | 'deepens' | 'change', note]
//   uses   an earlier level's answer this domain shows back
//   pl     where it lands in The Leader's Growth Planner 2027
//   change a change to the Version 4 text, with its reason

export const DOMAINS = [
  ['1.0', { gp: [[4, 'deepens', 'the voice that says you are not good enough']], pl: 'Monday page · The habit I’m fighting: the old rule, word for word' }],
  ['1.1', { gp: [[10, 'deepens']], lp: ['Give one thing away', 'change', 'the same hand-over, a week later. The plan counts the hours it gave back instead.'] }],
  ['1.2', { gp: [[12, 'uses', 'if step 12 is written, its first line shows above the tap']], lp: ['Name your enough', 'change', 'the money amount is asked here the same week. The plan keeps the time: free evenings and most hours a week.'] }],
  ['1.3', { gp: [[16, 'uses', 'the three names from step 16 are offered as taps'], [17, 'deepens']], lp: ['Make three asks', 'change', 'the same three asks, the same fortnight. The plan counts asks, yes, no and no answer in week 3 instead.'] }],
  ['2.0', {  }],
  ['2.1', {  }],
  ['2.2', { lp: ['Read last month’s money', 'uses', 'the statement you opened in week 1 holds four of the five.'] }],
  ['2.3', {  }],
  ['3.0', {  }],
  ['3.1', {  }],
  ['3.2', {  }],
  ['3.3', { lp: ['Hear it in their words', 'uses', 'ask one of the three people you heard in week 1, now about fear and hope.'] }],
  ['4.0', { gp: [[3, 'deepens', 'two habits out']] }],
  ['4.1', { lp: ['Say one expectation out loud', 'change', 'this level asks it with a date and a done. The plan counts last week’s clear asks instead.'] }],
  ['4.2', { lp: ['Find your cheapest hour', 'uses', 'the cheapest hour found in week 2 is the first one to hand back.'] }],
  ['4.3', { lp: ['Count your conversations', 'uses', 'the Friday count from week 3 is the number to beat.'] }],
  ['5.0', { uses: 'Level 01 · your new sentence (“I am … before I achieve anything”)' }],
  ['5.1', { lp: ['Name what someone did well', 'change', 'this level does it. The plan counts specific thanks given in week 3 instead.'] }],
  ['5.2', { lp: ['Choose your Monday number', 'uses', 'the same number: the slide asks how many weeks in a row you have read it.'], pl: 'Monday page · the number, every week' }],
  ['5.3', { change: 'The “Exactly” line said “by Friday”. It now says “by {on}”, the day the founder chose.' }],
  ['6.0', { gp: [[6, 'uses', 'the person and the conversation named in step 6 show above the tap'], [8, 'feeds', 'Done here ticks step 8']] }],
  ['6.1', {  }],
  ['6.2', {  }],
  ['6.3', {  }],
  ['7.0', { gp: [[15, 'deepens', 'a half-day without you']], lp: ['Guard one block', 'deepens', 'one block in week 2; here, your best hours, every week.'] }],
  ['7.1', { gp: [[10, 'uses']], uses: 'Level 01 · the task you handed over (Entrust)' }],
  ['7.2', { lp: ['Know your number', 'uses', 'what one sale leaves you, from week 1.'] }],
  ['7.3', {  }],
  ['8.0', { gp: [[11, 'deepens', 'where you play small']] }],
  ['8.1', {  }],
  ['8.2', { gp: [[13, 'feeds', 'saying the price out loud is step 13']] }],
  ['8.3', { uses: 'Level 01 · who you help, and with what (Dignity)' }],
  ['9.0', { gp: [[21, 'uses', 'the inner boardroom is the review']], pl: 'Sunday page · what really happened; Monday page · three goals', change: 'The sentence said “30 minutes”. Proposed: “ten minutes”, the same as Growth Plan step 21. Decision D3.' }],
  ['9.1', { gp: [[9, 'feeds', 'one decision made without you']] }],
  ['9.2', { lp: ['Read last month’s money', 'deepens', 'once in week 1; here, every week, with an alert line.'] }],
  ['9.3', {  }],
  ['10.0', { gp: [[16, 'uses'], [19, 'deepens', 'the no you are afraid of']], uses: 'Session 2 · the ten names chosen from your warm list' }],
  ['10.1', {  }],
  ['10.2', { lp: ['Name your best customer', 'uses', 'the person named in week 1 is the first example.'] }],
  ['10.3', {  }],
  ['11.0', { lp: ['Ask for the truth', 'change', 'this level asks three people. The plan counts the people who told you something hard instead.'] }],
  ['11.1', {  }],
  ['11.2', {  }],
  ['11.3', { uses: 'Level 05 · the three clients you asked for their words (Testimony)' }],
  ['12.0', { gp: [[2, 'deepens', 'the drive behind your desire']] }],
  ['12.1', { gp: [[10, 'uses']] }],
  ['12.2', { gp: [[5, 'feeds', 'twelve weeks of truth']], pl: 'Twelve-week contract (front pages)' }],
  ['12.3', {  }],
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
  { ch: 0, after: 5,
    extra: 'Actions counted: Levels 01 to 04 (16). Level 05’s four are checked when Level 06 opens.' },
  { ch: 1, after: 9,
    extra: 'Actions counted: Levels 05 to 08 (16). Then Session 2.' },
  { ch: 2, after: 12,
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

/** The thinner parts of the founder's Blueprint, and the ways to make them
 *  fuller. For Alexandru to choose; nothing here is built yet. */
export const OPTIONS = [
  ['A · Keep it as it is', 'Your systems has 4 parts and your next ninety days has 3. What the founder keeps (the hand-over note, the welcome message, the owner note, the weekly review page, the three questions) carries the practical depth.', 'Nothing to build.'],
  ['B · Save the Launchpad plan online', 'Today the twenty Launchpad actions are a PDF. Online, its numbers and its “one process in ten lines” fill the Blueprint too: your money gets last month’s figures, your systems gets a written process.', 'One small table and a page, like the Growth Plan.'],
  ['C · One “build it” screen after each reading', 'Chapter I: one process in ten lines. Chapter II: the client steps and the owner note as a one-page operations sheet. Chapter III: the ninety-day page, with the test and the person you grow.', 'Three screens, written from the founder’s answers.'],
  ['D · Show the Growth Plan in the Blueprint', 'A full account’s Growth Plan words (the truth you hide, the root, the fear) as a ninth part: the inner side of the same twelve weeks.', 'Reads what is already saved.'],
];
