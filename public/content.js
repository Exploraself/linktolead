// The Founder's Blueprint — the programme itself.
//
// Four domains, twelve levels, seven clarity points in each domain at each
// level. Three versions of the twelve, because the same question means a
// different thing to a founder building, growing or scaling.
//
// Every step names what to open, what to count and what to write. A step that
// could be answered by thinking hard is not a step; it is a reflection prompt,
// and this programme does not have any.

export const DOMAINS = [
  { k: 'self', n: 'Self', full: 'Personal internal', line: 'How you notice, decide and follow through.' },
  { k: 'people', n: 'People', full: 'Personal external', line: 'How you listen, speak and build trust.' },
  { k: 'work', n: 'Work', full: 'Business internal', line: 'How priorities become systems and action.' },
  { k: 'market', n: 'Market', full: 'Business external', line: 'How you understand and serve customers.' },
];

// The spine. Seven points, every level, every domain. P.A.C.E. opened out.
export const SEVEN = [
  { k: 'name', n: 'Name it', why: 'State the thing in one plain sentence, before any explaining.' },
  { k: 'evidence', n: 'Evidence', why: 'What is actually true here — something you can open, count or quote.' },
  { k: 'gap', n: 'Gap', why: 'The distance between what you claimed and what the evidence shows.' },
  { k: 'cost', n: 'Cost', why: 'What that gap is costing you now, in money, time or people.' },
  { k: 'decision', n: 'Decision', why: 'The one choice in this that is yours to make this week.' },
  { k: 'move', n: 'Move', why: 'The smallest proportionate step, and the date it happens.' },
  { k: 'review', n: 'Review', why: 'What you will check to know it worked, and when.' },
];

export const STAGES = {
  build: {
    n: 'Building', blurb: 'Finding the offer and the first clients',
    lede: 'You are making the thing and finding who it is for. Everything depends on you, and that is exactly what the first weeks work on.',
    emphasis: ['self', 'self', 'market', 'self', 'market', 'people', 'self', 'market', 'work', 'market', 'people', 'all'],
  },
  grow: {
    n: 'Growing', blurb: 'Clients repeat, everything runs through you',
    lede: 'Clients repeat and revenue is real, but the business still runs through one head. The work now is people and systems.',
    emphasis: ['self', 'people', 'work', 'people', 'work', 'market', 'people', 'work', 'self', 'work', 'people', 'all'],
  },
  scale: {
    n: 'Scaling', blurb: 'There is a team, and your job has changed',
    lede: 'There is a team, and the constraint is no longer the work. It is judgement, trust and where your attention goes.',
    emphasis: ['self', 'people', 'work', 'market', 'people', 'work', 'market', 'people', 'work', 'market', 'self', 'all'],
  },
};

// What each week is called, per stage. Twelve each.
export const WEEKS = {
  build: ['The honest inventory', 'What you are actually for', 'The one person you serve', 'The standard you will not drop', 'The problem they already pay to solve', 'The three conversations you are avoiding', 'Where your week actually goes', 'Your offer in one sentence', 'The first thing worth writing down', 'Your first hundred, by name', 'Who tells you the truth', 'The quarter you can own'],
  grow: ['What only you can do', 'The role before the hire', 'The process that breaks first', 'How you say the hard thing', 'What finished means here', 'Why they chose you, in their words', 'The agreement nobody wrote down', 'The week, on one page', 'The ceiling you built yourself', 'The handoff that keeps failing', 'Trust, checked not promised', 'The engine, described'],
  scale: ['The decisions only you should still make', 'The bench you are building', 'The system that survives you', 'Where the next demand is', 'The conversation your team cannot have', 'The number that tells the truth', 'The bet you are making', 'Who is becoming a leader', 'What you will stop doing', 'The edge that is actually yours', 'What success should make possible', 'The business, held together'],
};

// The ladder. What opens, and on what.
export const LADDER = [
  { from: 1, to: 3, key: 'free', n: 'Free, and free to stay', price: 'Free',
    what: 'All four domains at levels one to three. No payment, and no email to look — an account only to save your answers.' },
  { from: 4, to: 5, key: 'session', n: 'One session with Alexandru', price: 'Book a 1:1',
    what: 'He reads your first three levels before you speak. You leave knowing which of the four domains is costing you most, why it is that one, and with levels four and five opened and walked through. These two are not handed over cold.' },
  { from: 6, to: 9, key: 'lab', n: 'Personal Leadership LAB', price: '$97',
    what: 'Nine levels, self-paced, in your own time. The library comes with it: the 32 frameworks, the 99 tools, the books and the workbook for your stage.',
    url: 'https://exploraself.com/lab' },
  { from: 10, to: 12, key: 'hub', n: 'Business Growth HUB', price: '$399',
    what: 'The full Blueprint, unlocked immediately. Three sessions with Alexandru, the LAB included, and every resource.',
    url: 'https://exploraself.com/hub' },
  { from: 0, to: 0, key: 'premium', n: 'Premium — the whole thing, with him in it', price: '$1,989',
    what: 'All twelve levels, the LAB, the HUB, every resource — and Alexandru mentoring you every week, not three times.',
    url: 'https://exploraself.com/hub' },
];

export function gateFor(level) {
  if (level <= 3) return 'free';
  if (level <= 5) return 'session';
  if (level <= 9) return 'lab';
  return 'hub';
}

// ── The levels ───────────────────────────────────────────────────────────────
// A level is four domains, each with a promise and seven steps. Where a level
// is not yet written, the map still shows its title and its emphasis, and the
// door says so plainly rather than opening onto nothing.

export const LEVELS = {
  build: {
    1: {
      promise: 'By Sunday you will have four things that did not exist on Monday: a block of time you defended, one person told plainly what you expect, one process written in ten lines, and three named prospects contacted. Not four insights. Four things that happened.',
      self: { title: 'The honest inventory', sub: 'Time, money, energy, non-negotiables', steps: [
        'In one sentence: what do you spend most of your working time on?',
        'Open last week’s calendar. Write the three activities that took the most hours, with the hours beside each.',
        'Compare the two. What took hours that your sentence did not mention?',
        'What did not happen last week because of those hours? Name one thing.',
        'Name one block of time this week you will protect, and what it is for.',
        'Put it in the calendar now. Write the day and the start time here.',
        'On which date will you check whether the block survived?'] },
      people: { title: 'The people already in it', sub: 'Who your business depends on this month', steps: [
        'List everyone your business depends on this month. Staff, contractors, partners, family.',
        'Beside each name write what they actually do — not their title.',
        'Which of them does not know exactly what you expect? Mark them.',
        'What went wrong in the last month because of that gap? One example.',
        'Choose one person to get clear with this week.',
        'Write the single sentence you will say to them, and the day you will say it.',
        'What will you see them do differently? Write it, so you can check.'] },
      work: { title: 'What actually happens in a week', sub: 'The delivery, as it really runs', steps: [
        'Write the main thing your business delivers, in one sentence a customer would recognise.',
        'List the steps it takes, start to finish, as they really happen. Number them.',
        'Which step exists only in your head? Mark it.',
        'What happened the last time you were not there for that step?',
        'Choose the one step worth writing down first.',
        'Write it now, in no more than ten lines.',
        'Who will follow it this week without asking you, and on what day?'] },
      market: { title: 'Who you served, and who paid', sub: 'Names, not types', steps: [
        'Who do you say your customer is? One sentence.',
        'List the last ten people or companies who paid you. Names, not categories.',
        'How many of those ten match the sentence you just wrote?',
        'What are you spending — money or hours — reaching people who are not on that list?',
        'Which single kind of customer will you aim at for the next twelve weeks?',
        'Name three real people who fit and that you could contact this week.',
        'By which date will you have spoken to all three?'] },
    },
    2: {
      promise: 'By Sunday you will have written down what your business is for in a sentence you would defend in front of a customer, and tested it on one real person who is not your friend.',
      self: { title: 'What you are actually for', sub: 'The reason that survives a bad week', steps: [
        'Finish this sentence in your own words: “This business exists so that…”',
        'Look at where your money went last month. Which three spends served that sentence?',
        'Which spend served something else — and what was it serving?',
        'What has that cost you, in money or attention, in the last three months?',
        'Name one thing you will stop paying for, or stop doing, this week.',
        'Write when you will stop it, and what you will tell anyone affected.',
        'What will you check in thirty days to know it was the right call?'] },
      people: { title: 'Who you are doing it for', sub: 'The people your reason serves', steps: [
        'Name one real person your business has genuinely helped. First name is enough.',
        'Write what they said or did that proved it. Their words if you have them.',
        'How many of your last ten customers could you say the same about?',
        'What does it cost you when a customer is not that kind of person?',
        'Decide the one thing you will ask every new enquiry from now on.',
        'Write the question, word for word, and where you will put it.',
        'When will you look back at the answers — and how many will you need?'] },
      work: { title: 'What the work is for', sub: 'The output that proves the reason', steps: [
        'Write the one output of your business that matters most to a customer.',
        'Open your last five deliveries. How long did each actually take, start to finish?',
        'Which of the five took longest, and what made it different?',
        'What did that difference cost — your hours, their patience, or money?',
        'Name the one thing you will do the same way every time from now on.',
        'Write that rule in one line, and where it will live.',
        'Which delivery will be the first to test it, and when?'] },
      market: { title: 'The problem you are paid for', sub: 'Not the thing you sell', steps: [
        'Write the problem your customer is actually paying to make go away.',
        'Find a message, review or email where a customer described that problem. Quote it.',
        'How close is their wording to yours? Write both side by side.',
        'What do you lose when you describe it in your words instead of theirs?',
        'Choose their sentence or yours, and commit to one.',
        'Where will it appear first — and on what day will you change it there?',
        'What will you watch for two weeks to see whether it landed?'] },
    },
    3: {
      promise: 'By Sunday you will have one written standard you did not break, one agreement said out loud, one bottleneck named with a number beside it, and a first-hundred list you can actually work.',
      self: { title: 'The standard you will not drop', sub: 'What stays true on a bad week', steps: [
        'Write one standard you want to hold, however busy it gets.',
        'Find the last time you broke it. What was happening that week?',
        'What did you tell yourself at the time that made it reasonable?',
        'What did breaking it cost — with a customer, a person, or yourself?',
        'Decide what you will do instead, the next time that pressure comes.',
        'Write the sentence you will say, and who you will say it to.',
        'When will you look back and count how many times you held it?'] },
      people: { title: 'The conversation you are avoiding', sub: 'The one you keep rehearsing', steps: [
        'Name the conversation you have been putting off. One line.',
        'How many weeks have you been putting it off? Write the number.',
        'What are you telling yourself about why now is not the time?',
        'What has the delay already cost — in work, money or the relationship?',
        'Decide the outcome you want from it. One sentence, not three.',
        'Write the opening line, and the day and time you will say it.',
        'What will tell you it went well? Write it before you walk in.'] },
      work: { title: 'The thing that breaks first', sub: 'Your real bottleneck, with a number', steps: [
        'Write the step in your work where things most often get stuck.',
        'Go back over the last month. How many times did it get stuck there? Count.',
        'What do those times have in common?',
        'What did the delays cost in hours, and did any cost you a customer?',
        'Choose one change that would halve it.',
        'Write what you will change, and the first day it applies.',
        'How many weeks until you count again — and what number means it worked?'] },
      market: { title: 'Your first hundred, by name', sub: 'A list you can work, not a type', steps: [
        'Write the kind of customer you chose in level one, in one line.',
        'Open wherever your contacts live. Write the names of ten who fit. Real names.',
        'How many of the ten have heard from you in the last ninety days?',
        'What is the cost of a list you never work? Be specific about the month ahead.',
        'Decide how many of these you will contact each week, and hold it low enough to keep.',
        'Write the first three names and the day each one hears from you.',
        'When will you count replies, and what number would make this worth repeating?'] },
    },
  },
  grow: {},
  scale: {},
};

/** A level the founder can actually open, or null if it is not written yet. */
export function levelFor(stage, n) {
  const s = LEVELS[stage] || {};
  return s[n] || null;
}
export function isWritten(stage, n) { return !!levelFor(stage, n); }

// ── The entry diagnostic ─────────────────────────────────────────────────────
export const DIAGNOSTIC = [
  { d: 'self', label: 'Self · personal internal', q: 'Do you know where your week actually goes?',
    o: [['I could not account for last week', 0], ['Roughly, if I thought about it', 1], ['Yes, and I protect the important blocks', 2]] },
  { d: 'self', label: 'Self · personal internal', q: 'Have you written down what you will not do, at any price?',
    o: [['Never written down', 0], ['I know them, nobody else does', 1], ['Written, and I have held them', 2]] },
  { d: 'people', label: 'People · personal external', q: 'When something is wrong with someone, how long before you say it?',
    o: [['Weeks, or never', 0], ['Eventually, usually badly', 1], ['Within days, plainly', 2]] },
  { d: 'people', label: 'People · personal external', q: 'Is there someone who tells you the truth about your business?',
    o: [['No one', 0], ['One person, rarely asked', 1], ['Yes, and I ask them on purpose', 2]] },
  { d: 'work', label: 'Work · business internal', q: 'If you stopped for two weeks, what happens?',
    o: [['It stops with me', 0], ['It limps', 1], ['It runs, mostly', 2]] },
  { d: 'work', label: 'Work · business internal', q: 'Is there one written process somebody else could follow?',
    o: [['Nothing is written', 0], ['Some of it, in my head', 1], ['Yes, and it is used', 2]] },
  { d: 'market', label: 'Market · business external', q: 'Can you name, today, who your next ten customers are?',
    o: [['No', 0], ['A type, not names', 1], ['Names, and why each one', 2]] },
  { d: 'market', label: 'Market · business external', q: 'Do you know in their words why your customers chose you?',
    o: [['I assume', 0], ['I have heard it once or twice', 1], ['I have asked, recently', 2]] },
  { d: 'stage', label: 'Where you are', q: 'Which is nearest the truth right now?',
    o: [['Finding the offer and the first clients', 'build'], ['Clients repeat, but everything runs through me', 'grow'], ['There is a team, and my job has changed', 'scale']] },
];
