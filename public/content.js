// The Founder's Blueprint — the programme itself.
//
// Four domains, twelve levels, seven clarity points in each domain at each
// level. Three versions of the twelve, because the same question means a
// different thing to a founder building, growing or scaling.
//
// Every step names what to open, what to count and what to write. A step that
// could be answered by thinking hard is not a step; it is a reflection prompt,
// and this programme does not have any.

import { BUILD } from './levels-build.js';
import { GROW } from './levels-grow.js';
import { SCALE } from './levels-scale.js';

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
    what: 'All four domains at levels one to three. No payment, now or later — an account, so your reading and your answers are kept and follow you.' },
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

export const LEVELS = { build: BUILD, grow: GROW, scale: SCALE };

/** The title shown on the map: taken from the level itself wherever the level
 *  is written, so the map and the level can never drift apart. */
export function weekTitle(stage, n) {
  const L = (LEVELS[stage] || {})[n];
  const e = STAGES[stage].emphasis[n - 1];
  // A closing level leads on all four, so it keeps its own planned title
  // rather than borrowing one domain's.
  if (L && e !== 'all' && L[e]) return L[e].title;
  return (WEEKS[stage] || [])[n - 1] || `Level ${n}`;
}

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
  { d: 'want', label: 'Where you are going', q: 'And where do you want to be a year from now?',
    o: [['An offer that works, and clients who come back', 'build'], ['A business that runs without me in every room', 'grow'], ['A team I trust with the decisions', 'scale']] },
];

// ── The rail ─────────────────────────────────────────────────────────────────
// How the twelve levels are grouped down the side. The grouping is the offer,
// made visible: a founder can see the whole programme from the first screen
// and see exactly where it stops being free. Nothing is hidden, which is why
// nothing has to be sold twice.
export const SECTIONS = [
  { k: 'free', n: 'The Incubator', sub: 'Where everything begins', from: 1, to: 3,
    note: 'Three levels, all four domains, free and free to stay.' },
  { k: 'session', n: 'With Alexandru', sub: 'Two levels, walked through', from: 4, to: 5,
    note: 'He reads your first three before you speak. You leave knowing which domain is costing you most.' },
  { k: 'lab', n: 'The LAB', sub: 'Personal Leadership LAB', from: 6, to: 9,
    note: 'Four more levels in your own time, with the whole library behind them.' },
  { k: 'hub', n: 'The HUB', sub: 'Business Growth HUB', from: 10, to: 12,
    note: 'The last three, and the full Blueprint open from the day you start.' },
];

// ── Videos ───────────────────────────────────────────────────────────────────
// A domain may carry one short video. Key is `stage.level.domain`, value is a
// YouTube id. A domain with no entry simply shows no video — the programme
// never waits on film to be useful.
//
// To add one: 'build.1.self': 'dQw4w9WgXcQ'
export const VIDEOS = {};
export const videoFor = (stage, level, dk) => VIDEOS[`${stage}.${level}.${dk}`] || null;

// ── What the next level gives ────────────────────────────────────────────────
/** The honest reason to keep going: the next level's own promise, which was
 *  written as things that exist by Sunday rather than things you will feel. */
export function nextGain(stage, n) {
  const L = (LEVELS[stage] || {})[n + 1];
  if (n >= 12 || !L) return null;
  return { level: n + 1, title: weekTitle(stage, n + 1), promise: L.promise, gate: gateFor(n + 1) };
}

// ── Tiers ────────────────────────────────────────────────────────────────────
/** Which tiers a person holds, from the one they bought. Buying the HUB opens
 *  everything below it, because the ladder is access and not content. */
export const TIER_ORDER = ['free', 'session', 'lab', 'hub'];
export function holds(tier, needed) {
  const have = TIER_ORDER.indexOf(tier || 'free');
  const want = TIER_ORDER.indexOf(needed);
  return want <= have;
}

// ── The referee ──────────────────────────────────────────────────────────────
// Three things are captured at the entrance and they are not the same thing:
// where a founder says they are, where they want to be, and what their own
// answers show. The programme compares them rather than taking a word for it.
//
// This is the whole service. Thirty-six levels exist; knowing which twelve a
// founder actually needs is what they are paying for, and it is the one thing
// they cannot work out from inside their own business.
//
// It is never an argument. Where the evidence disagrees, the founder is shown
// the answer they themselves gave and handed the test rather than a verdict.
// And nobody skips anything: the referee chooses which stage is walked and
// which domain carries the emphasis, never how much of it gets done.

/** What the eight domain answers show, as against what was claimed.
 *  Market settles whether Building is finished — a founder without an offer
 *  and named customers has not left it, whatever else is true. Work settles
 *  whether Growing is finished, because Growing is the stage that builds the
 *  systems. Each is scored out of 4. */
export function stageFromEvidence(score) {
  if (score.market < 3) return 'build';
  if (score.work < 3) return 'grow';
  return 'scale';
}

const RANK = { build: 0, grow: 1, scale: 2 };

/** The reading at the entrance: generic, short, and honest about which of the
 *  three inputs it is leaning on. Returns the stage actually assigned. */
export function referee({ said, want, score }) {
  const shown = stageFromEvidence(score);
  const assigned = shown;                       // evidence decides, always
  const gap = RANK[said] - RANK[shown];
  const thin = ['self', 'people', 'work', 'market']
    .map((k) => [k, score[k]]).sort((a, b) => a[1] - b[1])[0][0];
  const thinD = DOMAINS.find((d) => d.k === thin);

  // The sentence that carries the evidence. Always one of their own answers.
  const because = shown === 'build'
    ? 'you said you cannot yet name your next ten customers by name, or why the last ones chose you'
    : shown === 'grow'
      ? 'you said the business would stop or limp without you, and that little of it is written down'
      : 'you said the work runs without you and that somebody tells you the truth about it';

  let kind, head, body;
  if (gap === 0) {
    kind = 'agree';
    head = `${STAGES[assigned].n} — and that matches what you said`;
    body = `You put yourself in ${STAGES[assigned].n.toLowerCase()}, and your answers agree. That is worth something on its own: founders who read their own situation accurately tend to fix it faster. ${cap(thinD.n)} is where you have least to point at, so that is the domain this stage will lean on.`;
  } else if (gap > 0) {
    // They placed themselves ahead of where the evidence puts them.
    kind = 'ahead';
    head = `You said ${STAGES[said].n.toLowerCase()}. Start in ${STAGES[assigned].n.toLowerCase()}.`;
    body = `Not a demotion, and not a disagreement — ${because}. ${cap(STAGES[said].n)} assumes that is already settled, so starting there is what makes it frustrating rather than useful. ${cap(STAGES[assigned].n)} settles it, and then ${STAGES[said].n.toLowerCase()} works.`;
  } else {
    // They are being harder on themselves than the evidence warrants.
    kind = 'behind';
    head = `You said ${STAGES[said].n.toLowerCase()}. You are further than that.`;
    body = `By your own answers, ${because}. ${cap(STAGES[said].n)} is where founders go to rebuild something that already works, and rebuilding feels like progress while nothing moves. ${cap(STAGES[assigned].n)} is the stage you are actually in.`;
  }

  // Where they want to be, taken seriously and connected to the path.
  const ambition = want === assigned
    ? `You want to be where this stage ends, which is the shortest version of this: twelve levels, then look again.`
    : RANK[want] > RANK[assigned]
      ? `You want ${STAGES[want].n.toLowerCase()} within the year. That is reachable from here and it is the right thing to want — it is also why the order matters, because ${STAGES[want].n.toLowerCase()} rests on what ${STAGES[assigned].n.toLowerCase()} settles.`
      : `You said you want ${STAGES[want].n.toLowerCase()}. Worth saying plainly: you do not have to grow a business you do not want to grow. The levels below still apply — they are how you make this size work properly rather than how you make it bigger.`;

  return { assigned, shown, said, want, kind, head, body, ambition, thin, thinD, score };
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** The journey, in four steps, for the entrance. Short on purpose. */
export const JOURNEY = [
  { n: 'You are here', t: 'Ten questions',
    d: 'Two minutes. It works out which of the four domains is thinnest and which stage you are actually in. The reading opens once you say where to keep it.' },
  { n: 'Next', t: 'The Incubator — levels 01 to 03',
    d: 'Free, and free to stay. All four domains, twelve modules, every worksheet. You come out with an offer, a customer, a standard and a week you can see.' },
  { n: 'Then', t: 'Your reading',
    d: 'When level 03 closes, the Blueprint reads back what you actually wrote and tells you where you stand, what it is costing you, and what to do first.' },
  { n: 'After that', t: 'The rest of the twelve',
    d: 'Levels 04 onward, with Alexandru in them. Same four domains, going deeper, until the stage is finished and the next one opens.' },
];
