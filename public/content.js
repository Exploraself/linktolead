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
  { k: 'self', n: 'Lead yourself', full: 'Personal internal', line: 'How you notice, decide and follow through.' },
  { k: 'people', n: 'Lead your people', full: 'Personal external', line: 'How you listen, speak and build trust.' },
  { k: 'work', n: 'Lead your business', full: 'Business internal', line: 'How priorities become systems and action.' },
  { k: 'market', n: 'Lead the market', full: 'Business external', line: 'How you understand and serve customers.' },
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
    what: 'All four domains at levels one to three. No payment, now or later — an account, so your Base Camp and your answers are kept and follow you.' },
  { from: 4, to: 5, key: 'session', n: 'The Boardroom — one session with Alexandru', price: 'Book a 1:1',
    what: 'Alexandru and the team read your first three levels before you speak. You leave knowing which of the four domains is costing you most, why it is that one, and with levels four and five opened and walked through. These two are not handed over cold.' },
  { from: 6, to: 9, key: 'lab', n: 'Personal Leadership LAB', price: '$97',
    what: 'Nine levels, self-paced, in your own time, and two sessions with Alexandru. The library comes with it: the 32 frameworks, the 99 tools, the books and the workbook for your stage.',
    url: 'https://exploraself.com/lab' },
  { from: 10, to: 12, key: 'hub', n: 'Business Growth HUB', price: '$397',
    what: 'The full Blueprint, unlocked immediately. Three sessions with Alexandru in total, including one from the LAB, the LAB included, and every resource.',
    url: 'https://exploraself.com/hub' },
  // The internal key stays 'premium'; founders see The Summit.
  { from: 0, to: 0, key: 'premium', n: 'The Summit — the whole thing, with Alexandru every week', price: '$1,989',
    what: 'All twelve levels, the LAB, the HUB, every resource — and Alexandru mentoring you every week, not three times.',
    url: '/northstar/summit' },
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

// Only the founder's own stage is loaded, when it is needed (a page carries
// one stage's levels and worksheets, not all three). LEVELS and SHEETS fill
// in as stages load; the manuals script and the preview bundle register all
// three up front.
export const LEVELS = {};
export const SHEETS = {};
const FILES = {
  build: () => Promise.all([import('./levels-build.js'), import('./fw-build.js')]).then(([l, f]) => [l.BUILD, f.FW_BUILD]),
  grow: () => Promise.all([import('./levels-grow.js'), import('./fw-grow.js')]).then(([l, f]) => [l.GROW, f.FW_GROW]),
  scale: () => Promise.all([import('./levels-scale.js'), import('./fw-scale.js')]).then(([l, f]) => [l.SCALE, f.FW_SCALE]),
};
/** Load one stage's levels and worksheets (once). */
export async function loadStage(stage) {
  if (LEVELS[stage] || !FILES[stage]) return;
  const [levels, sheets] = await FILES[stage]();
  LEVELS[stage] = levels; SHEETS[stage] = sheets;
}
export const registerStage = (stage, levels, sheets) => { LEVELS[stage] = levels; SHEETS[stage] = sheets; };

/** The title shown on the map: taken from the level itself wherever the level
 *  is written, so the map and the level can never drift apart. */
/** The level names a founder sees in the menu and level header — short and
 *  practical, chosen by Alexandru (27 Oct). The worksheets inside keep their
 *  own titles; only the name of the level changes. */
export const LEVEL_NAMES = {
  build: ['Count your week', 'Why it exists, in one line', 'Your client, by name', 'Price your hour',
    'Their yes, in their words', 'The 3 talks you’re avoiding', 'A week you chose', 'Your offer, tested',
    'Out of your head', 'Your first hundred', 'The truth you avoided', 'Your next 90 days, on one page'],
  grow: ['Only you, on one list', 'Hire on paper first', 'Fix what breaks first', 'Say the hard thing',
    'Define “finished”', 'Five customers, one phrase', 'Write the unwritten deal', 'Your week, on one page',
    'Remove one brick', 'Fix the failing handoff', 'Trust, checked', 'Your business, on one page'],
  scale: ['Two decisions given away', 'Who could do your job', 'A system with a new owner', 'Find the next demand',
    'The talk your team avoids', 'One number, read weekly', 'Your bet, tested small', 'Grow one leader',
    'Stop one thing', 'Your edge, proven', 'What success is for', 'Held together, handed on'],
};

export function weekTitle(stage, n) {
  const named = (LEVEL_NAMES[stage] || [])[n - 1];
  if (named) return named;
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

// ── The rail ─────────────────────────────────────────────────────────────────
// How the twelve levels are grouped down the side. The grouping is the offer,
// made visible: a founder can see the whole programme from the first screen
// and see exactly where it stops being free. Nothing is hidden, which is why
// nothing has to be sold twice.
export const SECTIONS = [
  { k: 'free', n: 'The Founder Launchpad', sub: 'Where every founder begins', from: 1, to: 3,
    note: 'Three levels, all four domains, free and free to stay.' },
  { k: 'session', n: 'The Boardroom', sub: 'You and Alexandru · two levels', from: 4, to: 5,
    note: 'Alexandru and the team read your first three before you speak. You leave knowing which domain is costing you most.' },
  { k: 'lab', n: 'Personal Leadership LAB', sub: 'Two sessions with Alexandru', from: 6, to: 9,
    note: 'Four more levels in your own time, with the whole library behind them.' },
  { k: 'hub', n: 'Business HUB', sub: 'Three sessions in total', from: 10, to: 12,
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

// Every level opens with one teaching video (public/video-talk.js): an MP4 on
// Cloudflare R2. Key `stage.level` for one stage, or just the level number for
// all three. title and sub are optional: without them the level's own name and
// the first sentence of its promise are used.
//
// To add one: 'build.1': { src: 'https://<bucket address>/build-01.mp4', poster: 'https://<bucket address>/build-01.jpg' }
export const LEVEL_VIDEOS = {};
export const levelVideo = (stage, level) => LEVEL_VIDEOS[`${stage}.${level}`] || LEVEL_VIDEOS[String(level)] || {};

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
 *  everything below it, because the ladder is access and not content. The
 *  Summit (key 'premium') holds everything; without it here, a founder set to
 *  premium in /mentor was locked out of every level, even the free ones. */
export const TIER_ORDER = ['free', 'session', 'lab', 'hub', 'premium'];
export function holds(tier, needed) {
  const have = TIER_ORDER.indexOf(tier || 'free');
  const want = TIER_ORDER.indexOf(needed);
  return want <= have;
}

// ── Names and links ──────────────────────────────────────────────────────────
export const LEAD = { self: 'Lead yourself', people: 'Lead your people', work: 'Lead your business', market: 'Lead the market' };

/** Where "Book my session" goes. The free 1:1 form linked from exploraself.com. */
export const BOOKING = 'https://forms.gle/opnxfhFTJJg69Qy77';

// ── The library ──────────────────────────────────────────────────────────────
// Working materials and companion books, shown on the entrance and inside the
// programme. A free account opens every download; previews need
// nothing. Print editions are paid, through the shop and Amazon. The LAB
// workbook is a paid product, so it opens on exploraself.com/lab, never here.
export const LIBRARY = {
  // The plan and the planner (31 Oct 2026): personal working material, so a
  // free account opens them like everything else here. Portrait covers (tall).
  growth: [
    { k: 'mgp', kicker: '20 + 1 steps', n: 'The Leader’s North Star · Massive Growth Plan', sub: 'The action plan at the end of your North Star. Twenty steps inside you and one weekly habit, written by hand.',
      cover: '/library/cover-massive-growth-plan.jpg',
      // Written in online, in the plan at the end of the North Star. Founders from
      // the Blueprint cross with the North Star's one question ("Is this you?"),
      // then land on the plan, not the top (#growth-plan).
      online: '/northstar/#growth-plan', preview: '/library/massive-growth-plan-preview.pdf', file: '/library/massive-growth-plan.pdf', print: false, tall: true },
    { k: 'lgp', kicker: '2027 · 52 weeks', n: 'The Leader’s Growth Planner 2027', sub: 'Plan the week on the left. Face it on the right, in your Sunday boardroom. Digital first, ready to print.',
      cover: '/library/cover-leaders-growth-planner-2027.jpg', preview: '/library/leaders-growth-planner-2027-preview.pdf', file: '/library/leaders-growth-planner-2027.pdf', print: null, tall: true },
  ],
  manuals: [
    { k: 'build', n: 'The Founder’s Blueprint · Building', sub: 'Finding the offer and the first clients', pages: 76, file: '/library/blueprint-building.pdf' },
    { k: 'grow', n: 'The Founder’s Blueprint · Growing', sub: 'Clients repeat, everything runs through you', pages: 76, file: '/library/blueprint-growing.pdf' },
    { k: 'scale', n: 'The Founder’s Blueprint · Scaling', sub: 'There is a team, and your job has changed', pages: 76, file: '/library/blueprint-scaling.pdf' },
  ],
  books: [
    { k: 'btl', kicker: '99 practical tools', n: 'Built to Lead', sub: 'One leader in the making. A personal leadership field guide.',
      cover: '/library/cover-built-to-lead.jpg', preview: '/library/built-to-lead-preview.pdf', file: '/library/built-to-lead.pdf', print: null },
    { k: 'wb', kicker: '32 leadership frameworks', n: 'Worth Building', sub: 'The Founder’s Playbook. Turn grit into growth and build a business that lasts.',
      cover: '/library/cover-worth-building.jpg', preview: '/library/worth-building-preview.pdf', file: '/library/worth-building.pdf', print: null },
    { k: 'nww', kicker: '12 principles', n: 'A New Way of Winning', sub: 'The Link to Lead Manual. Four stages. Four domains.',
      cover: '/library/cover-a-new-way-of-winning.jpg', preview: '/library/a-new-way-of-winning-preview.pdf', file: '/library/a-new-way-of-winning.pdf', print: null },
  ],
  lab: { n: 'Personal Leadership LAB · The Workbook', sub: '13 steps, each one built on the last. One written answer at a time.', pages: 93, url: 'https://exploraself.com/lab' },
};
