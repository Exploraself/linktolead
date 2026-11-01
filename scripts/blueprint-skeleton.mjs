// Writes the Blueprint skeleton (Phase 2, for Alexandru's approval):
//   docs/blueprint-skeleton.md            the skeleton, week by week
//   docs/blueprint-skeleton.html          the same, readable on a phone
//   docs/level-01-one-at-a-time.html      a clickable mock of Level 01
// and copies the two pages to public/preview/blueprint/ so the Pages preview
// of the pull request can show them (noindex; preview only, not linked).
//
// Every question, option, scale, sentence and four-lines text comes from
// public/levels-v4.js. Only what the skeleton adds lives in
// docs/blueprint-skeleton.data.mjs.
//
//   node scripts/blueprint-skeleton.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { LEVELS4, CHAPTERS4, DOM_NAMES, DOMS, wkey, lines4, wordOf, fieldsOf, PLAN4, BLUEPRINT4, takeOf, notyetOf, READ_QUOTES } from '../public/levels-v4.js';
import { DOMAINS, SESSIONS, READINGS, READING_SCREENS, LAUNCHPAD_CHANGES, DECISIONS, COVERAGE, GAPS, CONTRADICTIONS, PRINCIPLES, OPTIONS } from '../docs/blueprint-skeleton.data.mjs';
import { SECTIONS } from '../public/content.js';

const OV = new Map(DOMAINS.map(([k, ov]) => [k, { ...PLAN4[k], ...ov }]));
const root = new URL('../', import.meta.url);
const two = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const strip = (h) => String(h).replace(/<em>|<\/em>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, '’').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const ON_EX = 'Friday';
const DAYWORDS = /^(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day$/;

/** The part of the programme a level sits in, from the site's own rail. */
const gateOf = (n) => { const s = SECTIONS.find((r) => n >= r.from && n <= r.to); return s ? (s.k === 'free' ? `${s.n} (free)` : s.n) : ''; };

/** The example founder of Version 4: the example tap, slide and words. */
function exampleWork(lv) {
  const w = {};
  LEVELS4[lv - 1].d.forEach((D, d) => {
    w[wkey(lv, d, 't')] = D.x[0]; w[wkey(lv, d, 's')] = D.x[1];
    for (const [k, , ex] of fieldsOf(D)) w[wkey(lv, d, k)] = ex;
    w[wkey(lv, d, 'on')] = (OV.get(`${lv}.${d}`) || {}).onEx || ON_EX;
  });
  return w;
}
/** A line with the example founder's words in it; marks become `b`. */
const fillEx = (tpl, lv, d, mark = (x) => x) => tpl.replace(/\{(\w+)\}/g, (_, k) => {
  const v = exampleWork(lv)[wkey(lv, d, k)];
  return mark(v == null ? '___' : String(v));
});
const marks = (h, md) => h.replace(/<mark>(.*?)<\/mark>/g, md ? '**$1**' : '<b>$1</b>').replace(/<mark class="blank">____<\/mark>/g, '___');

/** The words a slide reads as, in plain terms. */
function slideWords(s) {
  if (typeof s.w === 'function') {
    const vals = [s.min, Math.round((s.min + s.max) / 2 / s.step) * s.step, s.max];
    return [...new Set(vals)].map((v) => `${v}${s.raw ? '' : s.sfx || ''} reads “${s.w(v)}”`).join(' · ');
  }
  return s.w.map(([max, w], i) => `${i ? '' : 'up to '}${max}: ${w}`).join(' · ');
}
const scaleOf = (s) => `${s.raw ? s.w(s.min) : s.min + (s.sfx || '')} to ${s.raw ? s.w(s.max) : s.max + (s.sfx || '')}, step ${s.raw ? s.w(s.step) : s.step}`;

/** One domain, as plain data for both outputs. */
function domainModel(L, d) {
  const D = L.d[d], key = `${L.n}.${d}`, ov = OV.get(key) || {}, ex = exampleWork(L.n), tk = takeOf(ex, L.n, d);
  const md2 = (h) => strip(String(h).replace(/<span class="ln"[^>]*><\/span>/g, '____').replace(/<mark>([^<]*)<\/mark>/g, '⟦$1⟧'));
  const dayKey = ov.on ? 'on' : ov.dayKey || 'day';
  const blanks = fieldsOf(D).map(([k, hint, example]) => ({ k, hint, example,
    day: k === dayKey && (DAYWORDS.test(example) || k === 'day' || k === 'when'),
    date: k === dayKey && !DAYWORDS.test(example) }));
  const sentence = D.f.map((p) => (typeof p === 'string' ? strip(p) : '___')).join('');
  // Marks can nest (a tap inside a quoted rule): only the innermost become ⟦ ⟧.
  const four = lines4(ex, L.n, d).map(([a, b, c]) => [a, b, strip(c.replace(/<mark>([^<]*)<\/mark>/g, '⟦$1⟧'))]);
  return {
    key, letter: D.l, name: D.name, dom: DOM_NAMES[d], domKey: DOMS[d], topic: ov.topic || '',
    tap: { q: strip(D.t.q), o: D.t.o, ex: D.t.o[D.x[0]] },
    slide: { q: D.s.q, scale: scaleOf(D.s), ends: D.s.e, words: slideWords(D.s), d: D.s.d, up: D.s.up, ex: D.x[1] },
    sentence, blanks, on: ov.on ? fillEx(ov.on, L.n, d) : null, dayKey,
    done: ov.done || '', doneEx: fillEx(ov.done || '', L.n, d, (x) => `⟦${x}⟧`),
    four, gp: ov.gp || [], lp: ov.lp || null, uses: ov.uses || null, pl: ov.pl || null, stage: ov.stage || null, change: ov.change || null,
    ins: ov.ins || '', notyet: md2(notyetOf(ex, L.n, d)), take: { title: md2(tk.title), lines: tk.lines.map(md2) },
    bp: (BLUEPRINT4.find((b) => b.k === ov.bp) || {}).n || '',
    manual: { label: `Manual for your stage · Level ${two(L.n)} · ${DOM_NAMES[d]} · ${D.name}`, anchor: `l${two(L.n)}-${DOMS[d]}` },
  };
}
const MODEL = LEVELS4.map((L) => ({
  n: L.n, word: L.word, title: L.title, floor: L.floor, promise: L.promise, old: L.old, neu: L.neu,
  ch: L.ch, chapter: CHAPTERS4[L.ch], gate: gateOf(L.n),
  session: SESSIONS.find((s) => s.after === L.n - 1 && s.n === 1) || null,
  sessionAfter: SESSIONS.find((s) => s.after === L.n && s.n === 2) || null,
  reading: READINGS.find((r) => r.after === L.n) || null,
  d: L.d.map((_, d) => domainModel(L, d)),
}));
const ADDED_DAY = MODEL.flatMap((L) => L.d.filter((x) => x.on).map((x) => x.key));
/** The founder's Blueprint at week 12: each part, and the domains that write it. */
const PARTS = BLUEPRINT4.map((b) => ({ ...b, items: MODEL.flatMap((L) => L.d.filter((x) => PLAN4[x.key].bp === b.k).map((x) => `${two(L.n)} ${x.name} (${x.topic.toLowerCase()})`)) }));
const PARTS_LEDE = 'At the end of twelve weeks the founder holds one document, built only from their own answers: a page in the programme (My Blueprint), printable as a PDF. Eight parts, every domain in exactly one. It answers the five questions a founder must be able to answer: how I lead, how I sell and market, what I build and deliver, how the business runs without me, and where it goes next.';

// ── Markdown ───────────────────────────────────────────────────────────────
const mdEx = (s) => s.replace(/⟦(.*?)⟧/g, '*$1*');
const mdRow = (cells) => `| ${cells.map((c) => String(c).replace(/\|/g, '/').replace(/\n/g, ' ')).join(' | ')} |`;
const mdTable = (head, rows) => [mdRow(head), mdRow(head.map(() => '---')), ...rows.map(mdRow)].join('\n');

function linksOf(x) {
  const out = [];
  if (x.uses) out.push(`Shows back: ${x.uses}.`);
  for (const [n, rel, note] of x.gp) out.push(`Growth Plan step ${n}: ${rel}${note ? ` (${note})` : ''}.`);
  if (x.lp) out.push(`Launchpad plan, “${x.lp[0]}”: ${x.lp[1] === 'change' ? 'proposed change, ' : `${x.lp[1]}, `}${x.lp[2]}`);
  out.push(`Planner: ${x.pl || 'Monday page, as the one move (Start here) or one of three goals, with its day'}.`);
  out.push(`${x.manual.label} (anchor #${x.manual.anchor}, built in Phase 4).`);
  return out;
}

function mdDomain(L, x) {
  const s = [];
  s.push(`#### ${x.letter} · ${x.dom} · ${x.name}`, '', `**Topic:** ${x.topic}`, '', `**Inform. Why it matters** (on the first blank): ${x.ins}`, '');
  s.push(`1. **Tap.** ${x.tap.q}  `, `   Options: ${x.tap.o.map((o, i) => `${i + 1} ${o}`).join(' · ')}`);
  s.push(`2. **Slide.** ${x.slide.q}  `, `   Scale ${x.slide.scale}; ends “${x.slide.ends[0]}” and “${x.slide.ends[1]}”; starts at ${x.slide.d}. Words: ${x.slide.words}.`);
  s.push(`3. **Write once**, one blank per screen, the sentence building above it:  `, `   “${x.sentence}”`);
  for (const b of x.blanks) s.push(`   - \`${b.k}\`: ${b.hint} (e.g. *${b.example}*)${b.day ? (b.date ? ' · a date: day chips and “A date”' : ' · day chips') : ''}`);
  let n = 4;
  if (x.on) s.push(`${n++}. **Day** (new screen, day chips): ${x.on}`);
  s.push(`${n++}. **Done when** (shown, not typed): ${mdEx(x.doneEx)}  `, '   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.');
  s.push(`${n}. **Four lines back** (the Version 4 example founder):`);
  for (const [a, b, c] of x.four) s.push(`   - *${a}. ${b}* ${mdEx(c)}`);
  s.push('', `**Transform. Yours to keep** (under the four lines, with a Copy button; it goes into the Blueprint part *${x.bp}*): **${mdEx(x.take.title)}**`);
  for (const l of x.take.lines) s.push(`- ${mdEx(l)}`);
  s.push('', `**If Sunday says Partly or Not yet:** ${mdEx(x.notyet)}`);
  s.push('', `**Links.** ${linksOf(x).join(' ')}`);
  if (x.stage) s.push('', `**Stage notes.** ${Object.entries(x.stage).map(([k, v]) => `*${k[0].toUpperCase() + k.slice(1)}:* ${v}`).join(' ')}`);
  if (x.change) s.push('', `**Change from Version 4.** ${x.change}`);
  s.push('');
  return s.join('\n');
}
function mdSession(S) {
  return [`### Session ${S.n} with Alexandru · ${S.name}`, '', `**When:** ${S.at}.  `, `**Before the call:** ${S.bring}`, '',
    ...S.agenda.map((a, i) => `${i + 1}. ${a}`), '', `**Done when:** ${S.done}`, ''].join('\n');
}
function mdReading(R) {
  const C = CHAPTERS4[R.ch];
  return [`### ${C.n} reading · ${C.name} (after Level ${two(R.after)})`, '', `One screen each, in this order. ${R.extra}`, '',
    ...READING_SCREENS.map(([t, w], i) => `${i + 1}. **${t}.** ${w}`), '',
    `**In his words:** “${READ_QUOTES[R.ch].q}” (${READ_QUOTES[R.ch].src}).`, ''].join('\n');
}

function md() {
  const out = [];
  out.push('# The Founder’s Blueprint · Skeleton', '',
    '*Draft for Alexandru’s approval · 31 Oct 2026 · Phase 2 of 4. Nothing here is live. Every question, option, scale and four-lines text below is read from `public/levels-v4.js` (Version 4); only what is new comes from `docs/blueprint-skeleton.data.mjs`.*', '');
  out.push('## Read this first', '',
    '- **The spine stays.** Four domains, four moves (Tap · Slide · Write once · Four lines back), twelve words, three chapters, a reading after Levels 05, 09 and 12, a promise stated as things.',
    `- **What is new is the end of each domain.** Every action now has a **day** (${ADDED_DAY.length} domains get a day screen) and a **Done when** you can check on Sunday, followed by one slide: how sure are you?`,
    '- **Inform, reform, transform.** Each domain now opens with a short insight (why it matters), ends in one action with a day (reform), and gives the founder something to keep, filled with their own words, that goes into their Blueprint (transform).',
    '- **A true blueprint at week 12.** Everything the founder writes becomes one document in eight parts: leader, people, what you sell, marketing, sales, money, systems, the next twelve weeks.',
    '- **One question per screen.** Each blank of the sentence gets its own screen. Days are taps. Enter moves on.',
    '- **Every Sunday counts.** From Level 02, a level opens by asking about last week’s four actions: Done, Partly, Not yet. The readings show what was done and how good the estimates were.',
    '- **Nothing is asked twice.** Where the Launchpad plan or the Growth Plan already covers a step, the level shows that answer back or links to it. Seven Launchpad actions that repeat a level become counts (proposal).',
    `- **Eight decisions are yours** (D1–D8, next). Saved answers keep their meaning: only new keys are added, so no migration.`, '');
  out.push('## Decisions only you can make', '', mdTable(['', 'Question', 'What I found', 'My recommendation'], DECISIONS), '');
  out.push('## The twelve weeks at a glance', '',
    mdTable(['Week', 'Chapter', 'Level', 'Promise: by Sunday you will have', 'Part of', 'Also this week'],
      MODEL.map((L) => [L.n, L.chapter.name, `${two(L.n)} · ${L.word} · ${L.title}`, L.promise, L.gate,
        [L.n <= 3 ? `Launchpad plan, week ${L.n}` : '', L.session ? `Session ${L.session.n} opens it` : '', L.reading ? `${L.chapter.n} reading` : '', L.sessionAfter ? `then Session ${L.sessionAfter.n}` : ''].filter(Boolean).join('; ') || '—'])
        .concat([[13, '—', 'The last Sunday', 'Level 12’s four actions checked, then the North Star again, to compare with where you began.', '—', '—']])), '');
  out.push('## How one level runs, one question at a time', '',
    'One field on screen. **Next** (or Enter) opens the next one. Number keys pick a tap, arrow keys move a slide. Typing comes last, in short blanks.', '',
    mdTable(['#', 'Screen', 'What the founder does', 'Saved as'], [
      ['1', 'The level', 'Reads the word, the chapter and the promise. The North Star’s weakest domain is marked “Start here”.', '—'],
      ['2', 'Last week (from Level 02)', 'One screen per action of last week: Done · Partly · Not yet. Then one line back: “You were 70% sure. It happened: partly.”', '`w.v4.<last level>.<d>.got` (new)'],
      ['3', 'Old and new', 'Reads the level’s old sentence and its new one.', '—'],
      ['4–', 'Per domain, in word order', 'Tap · Slide · one blank per screen · the day (if the sentence has none) · Done when + “how sure” · four lines back.', 'Version 4 keys, plus `on` and `sure` (new)'],
      ['end', 'Your week', 'The four actions, each with its day and Done when, the Start-here one first. “Write these on your Planner’s Monday page: the first as My one move, the other three as Three goals.”', '—'],
      ['05, 09, 12', 'The chapter reading', 'Seven short screens (below), ending in one next move with a day.', '`w.v4.<level>.r.carry`, `w.v4.<level>.r.on` (new)'],
    ]), '');
  out.push('## How the pieces fit: one job each', '',
    mdTable(['Piece', 'Its one job', 'What a level takes from it', 'What a level gives it'], [
      ['North Star (/northstar/)', 'Where you stand: 8 questions, 4 domains, your weakest.', 'The “Start here” domain each week; the stage for stage notes; the start point the readings compare with.', 'Retaken in week 13.'],
      ['Growth Plan (North Star, 20 + 1)', 'The inner roots: the truth you hide, the root, out loud, the fear, twelve weeks.', 'Where a step is already written, its words show back (steps 6, 12, 16).', 'Done in a level ticks the matching step (8, 9, 13).'],
      ['Launchpad plan (20 actions)', 'The numbers, in weeks 1–3.', 'The counts later levels act on (asks, thanks, conversations, cheapest hour).', '—'],
      ['Blueprint levels (12)', 'One week, four actions, each with a day and Done when.', '—', 'The week’s four actions for the Planner.'],
      ['Leader’s Growth Planner 2027', 'The weekly rhythm: Monday plan, Sunday boardroom, estimates against reality.', 'Sunday’s Done · Partly · Not yet; the twelve-week contract.', 'Monday page: one move + three goals; the contract number (Level 12).'],
      ['Library', 'Reading for your stage: 3 manuals, 3 books.', '—', 'Each domain links to its manual section (Phase 4).'],
    ]), '');
  out.push('## Your Blueprint at week 12', '', PARTS_LEDE, '',
    mdTable(['Part', 'What it holds', 'Written by (level · domain)'], PARTS.map((b) => [b.n, b.about, `${b.items.length}: ${b.items.join('; ')}`])), '',
    '### The thinner parts, and what was built', '', 'Your systems (4) and your next twelve weeks (3) were the thinnest. Built on 1 Nov, after “produce all of it”: B, C and D below.', '',
    mdTable(['Option', 'What changes', 'Cost'], OPTIONS), '', '**Built:** C (a page after each reading) and D (the inner side). B (the Launchpad plan online) is in the same pull request.', '');
  out.push('## The principles underneath', '', 'Where each one lives. None is pasted on screen as a slogan.', '', mdTable(['Principle', 'Where it lives'], PRINCIPLES), '');
  for (const C of CHAPTERS4) {
    out.push(`## ${C.n} · ${C.name}`, '', `*${C.about}*`, '');
    for (const L of MODEL.filter((l) => l.ch === CHAPTERS4.indexOf(C))) {
      if (L.session) out.push(mdSession(L.session));
      out.push(`### Week ${L.n} · Level ${two(L.n)} · ${L.word} · ${L.title}`, '',
        `**Promise:** By Sunday you will have: ${L.promise}  `, `**Floor:** ${L.floor} · **Part of:** ${L.gate}  `,
        `**Old:** “${L.old}” **New:** “${L.neu}”  `,
        `**First screens:** ${L.n === 1 ? 'the North Star result (Start here), then the promise.' : `last week’s four actions (Level ${two(L.n - 1)}): Done · Partly · Not yet; then the promise.`}`, '');
      for (const x of L.d) out.push(mdDomain(L, x));
      if (L.reading) out.push(mdReading(L.reading));
      if (L.sessionAfter) out.push(mdSession(L.sessionAfter));
    }
  }
  out.push('## Every change from Version 4', '', mdTable(['Where', 'Change', 'Reason'], CHANGES), '',
    '**Unchanged:** every tap, option, slide, scale, sentence and four-lines text (except Level 05 · Testimony’s “by Friday”), the twelve words, the three chapters, the promises, the readings after 05, 09 and 12, and the meaning of every saved answer.', '');
  out.push('## Changes outside Version 4 (proposals)', '',
    'The Launchpad plan is the numbers. Where one of its actions repeats a level, it becomes a count that a later level acts on.', '',
    mdTable(['Domain', 'Launchpad action', 'Week', 'Proposed'], LAUNCHPAD_CHANGES), '');
  out.push('## Saved answers', '', mdTable(['Key', 'What it holds', 'Status'], KEYS), '');
  out.push('## Phase 1 audit', '', '### What each piece covers, per domain', '', mdTable(COVERAGE.head, COVERAGE.rows), '',
    '### Overlaps, and who owns each', '', mdTable(['Level · domain', 'Meets', 'How', 'Note'], OVERLAPS), '',
    '### Gaps', '', ...GAPS.map((g) => `- ${g}`), '', '### Contradictions', '', ...CONTRADICTIONS.map((g) => `- ${g}`), '');
  out.push('## After your approval', '',
    '- **Phase 3:** the approved skeleton goes into `public/levels-v4.js` (data first), then the one-question flow on the programme screen. Saved keys keep their meaning. 390px with no sideways scroll, reduced motion, light and dark. Every test runs, new ones added. A new PR with phone screenshots.',
    '- **Phase 4** (after Phase 3 is merged): `scripts/make-manuals.mjs` builds the three manuals from Version 4, with a section per level and domain. A sync report, preview PDFs, and the Library files replaced only after you approve the previews.', '');
  return out.join('\n');
}

const CHANGES = [
  ['All levels', 'One question per screen: each blank of the sentence gets its own screen, with the sentence building above it.', 'The brief: one field on screen, typing last.'],
  ['All day blanks', 'A day is a tap: seven day chips, and “A date” for anything further.', 'Tap before typing.'],
  [`${ADDED_DAY.length} domains`, `A day screen is added where the sentence has no day (new key \`on\`): ${ADDED_DAY.join(', ')}.`, 'Every action needs a day.'],
  ['All 48 domains', 'A “Done when” line under “What you will do”, shown, not typed.', 'Checkable on Sunday.'],
  ['All 48 domains', 'One slide after it: “How sure are you that this is done by Sunday?” (new key `sure`).', 'Estimates against reality build realism.'],
  ['Levels 02–12, week 13', 'The level opens with last week’s four: Done · Partly · Not yet (new key `got`).', 'Real change, measured.'],
  ['Every level', 'The North Star’s weakest domain is marked “Start here”; its action comes first in “Your week”.', 'D2.'],
  ['Every level', 'The credo screen becomes “Your week”: the four actions with day and Done when, in Planner order.', 'An action plan is not a memoir.'],
  ['Readings 05, 09, 12', 'Six short screens after the Version 4 reading: what you did, how you estimate, old and new beliefs, where you began, his words, and one next move with a day.', 'The readings look back at what happened, not only at the slides.'],
  ['Levels 01, 06, 10', 'Growth Plan words show above the tap when written (steps 12, 16, 6).', 'Ask once.'],
  ['Levels 05, 07, 08, 11', 'An earlier level’s answer shows back (5.0, 7.1, 8.3, 11.3).', 'Build on it, never ask again.'],
  ['Level 05 · Testimony', '“by Friday” becomes “by {on}”, the founder’s day.', 'The founder picks the day.'],
  ['Level 09 · First things weekly', '“30 minutes” becomes “ten minutes” (D3, applied 1 Nov).', 'One rhythm everywhere.'],
  ['Level 12', '“90 days” becomes “twelve weeks”; checkpoints “week 4” and “week 8” (D5, applied 1 Nov).', 'One horizon.'],
  ['Levels 05, 09, 12', 'After each reading, one page to build: a process in ten lines, the operations page, the twelve-week page (option C).', 'The thinnest parts of the Blueprint, filled from answers already given.'],
  ['My Blueprint', 'A ninth part, the inner side, from the Growth Plan (option D); week 13 asks about Level 12 and offers the North Star again.', 'The whole of the founder, and the loop closed.'],
  ['Levels 04 and 10', 'Session 1 opens Level 04; Session 2 follows the Chapter II reading.', 'D1. The sessions had no stated place or purpose.'],
];
const KEYS = [
  ['`w.v4.<level>.<d>.t`, `.s`, every sentence field', 'The tap, the slide, the words written', 'Unchanged'],
  ['`w.v4.<level>.<d>.on`', `The added day, in ${ADDED_DAY.length} domains`, 'New'],
  ['`w.v4.<level>.<d>.sure`', 'How sure, 0–100', 'New'],
  ['`w.v4.<level>.<d>.got`', '0 Done · 1 Partly · 2 Not yet, asked when the next level opens', 'New'],
  ['`w.v4.<5|9|12>.r.carry`, `.r.on`', 'The reading’s next move and its day', 'New'],
  ['—', 'No key changes meaning, none is renamed: no migration needed. A level’s progress still counts 12 units (the day belongs to the sentence).', '—'],
];
const OVERLAPS = MODEL.flatMap((L) => L.d.flatMap((x) => [
  ...x.gp.map(([n, rel, note]) => [`${two(L.n)} · ${x.name}`, `Growth Plan step ${n}`, rel, note || '']),
  ...(x.lp ? [[`${two(L.n)} · ${x.name}`, `Launchpad: ${x.lp[0]}`, x.lp[1] === 'change' ? 'proposed change' : x.lp[1], x.lp[2]]] : []),
  ...(x.uses ? [[`${two(L.n)} · ${x.name}`, x.uses.split(' · ')[0], 'shows back', x.uses.split(' · ').slice(1).join(' · ')]] : []),
])).concat([['09 · First things weekly', 'Planner Sunday page, Growth Plan step 21', 'owned by the Planner', 'the app only records Done · Partly · Not yet']]);

// ── HTML skeleton ────────────────────────────────────────────────────────────
const hEx = (s) => esc(s).replace(/⟦(.*?)⟧/g, '<b>$1</b>');
const hTable = (head, rows, cls = '') => `<div class="tw"><table class="${cls}"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${head[i] ? ` data-l="${esc(head[i])}"` : ''}>${esc(c).replace(/`([^`]+)`/g, '<code>$1</code>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

function hDomain(L, x) {
  let n = 4;
  return `<section class="dom" style="--c:var(--${x.domKey})" id="l${two(L.n)}-${x.domKey}">
  <h4><span class="lt">${esc(x.letter)}</span><span>${esc(x.dom)} · <b>${esc(x.name)}</b></span></h4>
  <p class="topic">${esc(x.topic)}</p>
  <p class="ins"><b>Inform · why it matters</b> ${esc(x.ins)}</p>
  <ol class="moves">
    <li><b>Tap.</b> ${esc(x.tap.q)}<ul class="opts">${x.tap.o.map((o, i) => `<li><kbd>${i + 1}</kbd>${esc(o)}</li>`).join('')}</ul></li>
    <li><b>Slide.</b> ${esc(x.slide.q)}<p class="sm">Scale ${esc(x.slide.scale)} · ends “${esc(x.slide.ends[0])}” and “${esc(x.slide.ends[1])}” · starts at ${esc(x.slide.d)}<br>${esc(x.slide.words)}</p></li>
    <li><b>Write once</b>, one blank per screen<p class="sent">“${esc(x.sentence)}”</p><ul class="blanks">${x.blanks.map((b) => `<li><code>${esc(b.k)}</code> ${esc(b.hint)} <i>e.g. ${esc(b.example)}</i>${b.day ? `<span class="chip">${b.date ? 'a date' : 'day chips'}</span>` : ''}</li>`).join('')}</ul></li>
    ${x.on ? `<li class="new"><b>Day</b> <span class="chip">new</span> ${esc(x.on)}</li>` : ''}
    <li class="new"><b>Done when</b> <span class="chip">new</span> ${hEx(x.doneEx)}<p class="sm">Then: “How sure are you that this is done by Sunday?” 0–100%.</p></li>
    <li><b>Four lines back</b><dl class="four">${x.four.map(([a, b, c]) => `<dt>${esc(a)} <i>${esc(b)}</i></dt><dd>${hEx(c)}</dd>`).join('')}</dl></li>
  </ol>
  <div class="keep"><p class="kp">Transform · yours to keep · Blueprint part: ${esc(x.bp)}</p><h5>${hEx(x.take.title)}</h5><ol>${x.take.lines.map((l) => `<li>${hEx(l)}</li>`).join('')}</ol></div>
  <p class="ny"><b>If Sunday says Partly or Not yet:</b> ${hEx(x.notyet)}</p>
  <ul class="links">${linksOf(x).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
  ${x.stage ? `<p class="stage">${Object.entries(x.stage).map(([k, v]) => `<b>${esc(k[0].toUpperCase() + k.slice(1))}:</b> ${esc(v)}`).join(' ')}</p>` : ''}
  ${x.change ? `<p class="chg"><b>Change from Version 4.</b> ${esc(x.change)}</p>` : ''}
</section>`;
}
const hSession = (S) => `<section class="sess"><h3>Session ${S.n} with Alexandru · ${esc(S.name)}</h3><p><b>When:</b> ${esc(S.at)}.</p><p><b>Before the call:</b> ${esc(S.bring)}</p><ol>${S.agenda.map((a) => `<li>${esc(a)}</li>`).join('')}</ol><p class="done"><b>Done when</b> ${esc(S.done)}</p></section>`;
const hReading = (R) => { const C = CHAPTERS4[R.ch]; return `<section class="read"><h3>${esc(C.n)} reading · ${esc(C.name)}</h3><p class="sm">After Level ${two(R.after)}. ${esc(R.extra)}</p><ol>${READING_SCREENS.map(([t, w]) => `<li><b>${esc(t)}.</b> ${esc(w)}</li>`).join('')}</ol><blockquote>“${esc(READ_QUOTES[R.ch].q)}”<cite>${esc(READ_QUOTES[R.ch].src)}</cite></blockquote></section>`; };

function html() {
  const lv = (L) => `<details class="lvl" id="level-${two(L.n)}"${L.n === 1 ? ' open' : ''}>
  <summary><span class="wk">Week ${L.n}</span><span class="wd">${esc(L.word)}</span><span class="tt">Level ${two(L.n)} · ${esc(L.title)}</span></summary>
  <p class="promise"><b>By Sunday you will have:</b> ${esc(L.promise)}</p>
  <p class="sm">${esc(L.floor)} · part of ${esc(L.gate)}</p>
  <p class="oldnew"><span>Old: “${esc(L.old)}”</span><span>New: “${esc(L.neu)}”</span></p>
  <p class="sm"><b>First screens:</b> ${L.n === 1 ? 'the North Star result (Start here), then the promise.' : `last week’s four actions (Level ${two(L.n - 1)}): Done · Partly · Not yet; then the promise.`}</p>
  ${L.d.map((x) => hDomain(L, x)).join('\n')}
</details>`;
  const chapters = CHAPTERS4.map((C, ci) => `<h2 id="ch-${ci + 1}">${esc(C.n)} · ${esc(C.name)}</h2><p class="about">${esc(C.about)}</p>
  ${MODEL.filter((L) => L.ch === ci).map((L) => `${L.session ? hSession(L.session) : ''}${lv(L)}${L.reading ? hReading(L.reading) : ''}${L.sessionAfter ? hSession(L.sessionAfter) : ''}`).join('\n')}`).join('\n');
  return page('Blueprint skeleton', `
<header class="top"><p class="kick">Draft for Alexandru’s approval · 31 Oct 2026 · Phase 2 of 4</p>
<h1>The Founder’s Blueprint<br><em>Skeleton</em></h1>
<p class="lede">Twelve weeks, week by week. Every question, option, scale and four-lines text is read from Version 4; what is new is marked <span class="chip">new</span>. Nothing here is live.</p>
<nav class="toc"><a href="#first">Read this first</a><a href="#decide">Your decisions</a><a href="#glance">At a glance</a><a href="#flow">One question at a time</a><a href="#fit">How the pieces fit</a><a href="#bp12">Blueprint at week 12</a><a href="#principles">Principles</a><a href="#ch-1">Chapter I</a><a href="#ch-2">Chapter II</a><a href="#ch-3">Chapter III</a><a href="#changes">Changes</a><a href="#keys">Saved answers</a><a href="#audit">Audit</a><a href="level-01-one-at-a-time.html">Try Level 01 →</a><a href="screens.html">The real screens on a phone →</a></nav>
</header>
<main>
<h2 id="first">Read this first</h2>
<ul class="first">
<li><b>The spine stays.</b> Four domains, four moves (Tap · Slide · Write once · Four lines back), twelve words, three chapters, a reading after Levels 05, 09 and 12, a promise stated as things.</li>
<li><b>What is new is the end of each domain.</b> Every action now has a <b>day</b> (${ADDED_DAY.length} domains get a day screen) and a <b>Done when</b> you can check on Sunday, then one slide: how sure are you?</li>
<li><b>Inform, reform, transform.</b> Each domain opens with a short insight (why it matters), ends in one action with a day, and gives the founder something to keep, in their own words, that goes into their Blueprint.</li>
<li><b>A true blueprint at week 12.</b> Everything the founder writes becomes one document in eight parts: leader, people, what you sell, marketing, sales, money, systems, the next twelve weeks.</li>
<li><b>One question per screen.</b> Each blank of the sentence gets its own screen. Days are taps. Enter moves on.</li>
<li><b>Every Sunday counts.</b> From Level 02, a level opens with last week’s four actions: Done, Partly, Not yet. The readings show what was done and how good the estimates were.</li>
<li><b>Nothing is asked twice.</b> Where the Launchpad plan or the Growth Plan already covers a step, the level shows that answer back or links to it.</li>
<li><b>Eight decisions are yours</b> (below). Saved answers keep their meaning: only new keys are added, so no migration.</li>
</ul>
<h2 id="decide">Decisions only you can make</h2>
${hTable(['', 'Question', 'What I found', 'My recommendation'], DECISIONS, 'dec')}
<h2 id="glance">The twelve weeks at a glance</h2>
${hTable(['Week', 'Level', 'By Sunday you will have', 'Part of', 'Also'], MODEL.map((L) => [L.n, `${two(L.n)} · ${L.word} · ${L.title}`, L.promise, L.gate,
    [L.n <= 3 ? `Launchpad plan, week ${L.n}` : '', L.session ? `Session ${L.session.n} opens it` : '', L.reading ? `${L.chapter.n} reading` : '', L.sessionAfter ? `then Session ${L.sessionAfter.n}` : ''].filter(Boolean).join('; ') || '—'])
    .concat([[13, 'The last Sunday', 'Level 12’s four actions checked, then the North Star again.', '—', '—']]), 'glance')}
<h2 id="flow">How one level runs, one question at a time</h2>
<p>One field on screen. <b>Next</b> (or <kbd>Enter</kbd>) opens the next one. Number keys pick a tap, arrow keys move a slide. Typing comes last, in short blanks. <a href="level-01-one-at-a-time.html">Try Level 01 →</a></p>
<ol class="flow">
<li><b>The level.</b> The word, the chapter, the promise. The North Star’s weakest domain is marked “Start here”.</li>
<li><b>Last week</b> <span class="chip">new</span> (from Level 02). One screen per action: Done · Partly · Not yet, then one line back: “You were 70% sure. It happened: partly.”</li>
<li><b>Old and new.</b> The level’s old sentence and its new one.</li>
<li><b>Per domain, in word order:</b> Tap · Slide · one blank per screen · the day <span class="chip">new</span> · Done when + how sure <span class="chip">new</span> · four lines back.</li>
<li><b>Your week</b> <span class="chip">new</span>. The four actions with day and Done when, Start here first: “Write these on your Planner’s Monday page: the first as My one move, the other three as Three goals.”</li>
<li><b>After 05, 09, 12: the chapter reading.</b> Seven short screens, ending in one next move with a day.</li>
</ol>
<h2 id="fit">How the pieces fit: one job each</h2>
${hTable(['Piece', 'Its one job', 'A level takes', 'A level gives'], [
    ['North Star', 'Where you stand: 8 questions, 4 domains, your weakest.', '“Start here” each week; the stage; the start point readings compare with.', 'Retaken in week 13.'],
    ['Growth Plan (20 + 1)', 'The inner roots: truth, root, out loud, fear, twelve weeks.', 'Words already written (steps 6, 12, 16).', 'Done ticks steps 8, 9, 13.'],
    ['Launchpad plan (20)', 'The numbers, weeks 1–3.', 'The counts later levels act on.', '—'],
    ['Blueprint levels (12)', 'One week, four actions, day and Done when.', '—', 'The week’s four actions.'],
    ['Planner 2027', 'The weekly rhythm, estimates against reality.', 'Sunday’s Done · Partly · Not yet; the contract.', 'Monday page; the twelve-week number.'],
    ['Library', 'Reading for your stage.', '—', 'A manual section per domain (Phase 4).'],
  ])}
<h2 id="bp12">Your Blueprint at week 12</h2>
<p>${esc(PARTS_LEDE)}</p>
${hTable(['Part', 'What it holds', 'Written by'], PARTS.map((b) => [b.n, b.about, `${b.items.length}: ${b.items.join('; ')}`]))}
<h3>The thinner parts, and what was built</h3>
<p>Your systems (4) and your next twelve weeks (3) were the thinnest. Built on 1 Nov, after “produce all of it”: B, C and D below.</p>
${hTable(['Option', 'What changes', 'Cost'], OPTIONS)}
<p><b>Built:</b> C (a page after each reading) and D (the inner side). B (the Launchpad plan online) is in the same pull request.</p>
<h2 id="principles">The principles underneath</h2>
<p>Where each one lives. None is pasted on screen as a slogan.</p>
${hTable(['Principle', 'Where it lives'], PRINCIPLES)}
${chapters}
<h2 id="changes">Every change from Version 4</h2>
${hTable(['Where', 'Change', 'Reason'], CHANGES)}
<p class="sm"><b>Unchanged:</b> every tap, option, slide, scale, sentence and four-lines text (except Testimony’s “by Friday”), the twelve words, the chapters, the promises, the readings after 05, 09 and 12, and the meaning of every saved answer.</p>
<h3>Changes outside Version 4 (proposals)</h3>
<p>The Launchpad plan is the numbers. Where one of its actions repeats a level, it becomes a count a later level acts on.</p>
${hTable(['Domain', 'Launchpad action', 'Week', 'Proposed'], LAUNCHPAD_CHANGES)}
<h2 id="keys">Saved answers</h2>
${hTable(['Key', 'What it holds', 'Status'], KEYS)}
<h2 id="audit">Phase 1 audit</h2>
<h3>What each piece covers, per domain</h3>
${hTable(COVERAGE.head, COVERAGE.rows)}
<h3>Overlaps, and who owns each</h3>
${hTable(['Level · domain', 'Meets', 'How', 'Note'], OVERLAPS)}
<h3>Gaps</h3><ul>${GAPS.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
<h3>Contradictions</h3><ul>${CONTRADICTIONS.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
<h2>After your approval</h2>
<ul><li><b>Phase 3:</b> the approved skeleton into <code>public/levels-v4.js</code> (data first), then the one-question flow on the programme screen, with tests and phone screenshots.</li>
<li><b>Phase 4</b> (after Phase 3 is merged): the three manuals rebuilt from Version 4, a sync report, preview PDFs, and the Library files replaced only after you approve the previews.</li></ul>
</main>`, SKELETON_CSS);
}

// ── Shared page shell (light and dark, 390px, reduced motion) ─────────────
const BASE_CSS = `
:root{--paper:#FBF7EE;--panel:#FFFDF7;--ink:#2B1B12;--soft:#6B5A4B;--line:#E4DAC8;--gold:#C9A24A;--gold-ink:#8A6A1F;
--self:#8C5A3C;--people:#4C6B55;--work:#3E5C78;--market:#8A6A1F;--new:#2F6B4F;--display:Newsreader,Georgia,serif;--body:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--paper:#120D08;--panel:#1C150E;--ink:#F1E8D6;--soft:#B9A992;--line:#3A2E22;--gold:#D9B865;--gold-ink:#D9B865;
--self:#D89873;--people:#93B99A;--work:#8FB2CF;--market:#D9B865;--new:#8FD1AE;color-scheme:dark}}
:root[data-theme=dark]{--paper:#120D08;--panel:#1C150E;--ink:#F1E8D6;--soft:#B9A992;--line:#3A2E22;--gold:#D9B865;--gold-ink:#D9B865;
--self:#D89873;--people:#93B99A;--work:#8FB2CF;--market:#D9B865;--new:#8FD1AE;color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 var(--body);overflow-wrap:anywhere}
h1,h2,h3,h4{font-family:var(--display);font-weight:500;line-height:1.2}
a{color:var(--gold-ink)}code{font:13px/1.4 ui-monospace,Menlo,monospace;background:var(--panel);border:1px solid var(--line);padding:0 4px;border-radius:4px}
kbd{font:12px/1 ui-monospace,Menlo,monospace;border:1px solid var(--line);border-bottom-width:2px;border-radius:4px;padding:2px 5px;background:var(--panel);margin-right:6px}
.pv{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;background:var(--ink);color:var(--paper);font:12px/1.4 var(--body);text-align:center;padding:6px 12px;margin:0}
.theme{background:transparent;color:var(--paper);border:1px solid currentColor;border-radius:999px;padding:2px 10px;font:12px var(--body);cursor:pointer}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}`;
const SKELETON_CSS = `
.top,main{max-width:860px;margin:0 auto;padding:0 16px}
.top{padding-top:28px}.kick{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-ink);margin:0}
h1{font-size:clamp(30px,8vw,46px);margin:.3em 0}h1 em{color:var(--gold-ink)}
.lede{color:var(--soft);max-width:62ch}
.toc{display:flex;flex-wrap:wrap;gap:6px;margin:16px 0 8px}.toc a{font-size:13px;text-decoration:none;border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:4px 10px;color:var(--ink)}
h2{font-size:26px;margin:44px 0 10px;padding-top:10px;border-top:2px solid var(--ink)}
h3{font-size:20px;margin:28px 0 8px}
.chip{display:inline-block;font:600 10px/1.6 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--new);border:1px solid currentColor;border-radius:999px;padding:0 6px;margin-left:4px;vertical-align:1px}
.sm{font-size:13.5px;color:var(--soft);margin:.3em 0}
.tw{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:10px 0;border:1px solid var(--line);border-radius:8px;max-width:100%}
table{border-collapse:collapse;width:100%;font-size:14px;background:var(--panel)}th,td{text-align:left;vertical-align:top;padding:8px 10px;border-bottom:1px solid var(--line)}
th{font:600 11px/1.4 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--gold-ink);white-space:nowrap}
@media (max-width:640px){.tw{overflow:visible;border:0}table,thead,tbody,tr,td{display:block;width:100%}thead{display:none}
tr{border:1px solid var(--line);border-radius:8px;margin:0 0 10px;padding:6px 0;background:var(--panel)}td{border:0;padding:3px 12px}td:first-child{font-weight:600}
td[data-l]:not(:first-child)::before{content:attr(data-l);display:block;font:600 10.5px/1.6 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--gold-ink)}}
.first li{margin:.4em 0}
details.lvl{border:1px solid var(--line);background:var(--panel);border-radius:10px;margin:12px 0;padding:0 14px}
details.lvl>summary{list-style:none;cursor:pointer;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;padding:14px 0}
details.lvl>summary::-webkit-details-marker{display:none}
details.lvl>summary::after{content:'+';margin-left:auto;font-size:20px;color:var(--gold-ink)}details.lvl[open]>summary::after{content:'–'}
.wk{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}.wd{font:600 22px/1 var(--display);letter-spacing:.12em}.tt{font-family:var(--display);font-size:18px}
.promise{font-size:15.5px;border-left:3px solid var(--gold);padding-left:10px}
.oldnew{display:grid;gap:4px;font-family:var(--display);font-style:italic;font-size:16px}.oldnew span:first-child{color:var(--soft);text-decoration:line-through;text-decoration-color:var(--line)}
.dom{border-top:1px solid var(--line);padding:14px 0 6px}
.dom h4{display:flex;gap:10px;align-items:center;font-size:18px;margin:0}
.lt{display:inline-grid;place-items:center;min-width:32px;height:32px;border-radius:6px;background:var(--c);color:var(--panel);font:600 18px/1 var(--display)}
.topic{font-family:var(--display);font-style:italic;font-size:17px;margin:6px 0}
.moves{padding-left:20px;margin:6px 0}.moves>li{margin:8px 0}.moves>li.new{border-left:3px solid var(--new);padding-left:8px;margin-left:-11px}
.opts,.blanks{list-style:none;padding:0;margin:4px 0}.opts li,.blanks li{font-size:14.5px;margin:2px 0}
.sent{font-family:var(--display);font-size:16.5px;margin:4px 0}
.four{margin:6px 0}.four dt{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--c);margin-top:6px}.four dt i{text-transform:none;letter-spacing:0;color:var(--soft)}.four dd{margin:0}
.links{font-size:13.5px;color:var(--soft);padding-left:18px}
.ins{font-size:14.5px;border-left:3px solid var(--gold);padding:6px 10px;background:var(--paper);border-radius:0 6px 6px 0}.ins b{display:block;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-ink)}
.keep{margin:8px 0;padding:8px 12px;border:1px dashed var(--gold);border-radius:8px;background:var(--paper)}.kp{margin:0;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-ink)}.keep h5{margin:2px 0 4px;font:500 16px var(--display)}.keep ol{margin:0;padding-left:18px;font-size:14px}
.ny{font-size:14px;color:var(--soft)}
.stage,.chg{font-size:14px;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:6px 10px}
.sess,.read{border:2px solid var(--gold);border-radius:10px;padding:4px 14px;margin:14px 0;background:var(--panel)}.sess h3,.read h3{margin-top:12px}
.done{border-top:1px solid var(--line);padding-top:6px}
blockquote{font-family:var(--display);font-style:italic;font-size:18px;margin:10px 0;padding-left:12px;border-left:3px solid var(--gold)}cite{display:block;font:normal 12.5px var(--body);color:var(--soft);margin-top:4px}
.about{color:var(--soft);font-style:italic;font-family:var(--display);font-size:17px}
main{padding-bottom:60px}`;
const THEME_JS = `<script>(function(){var b=document.querySelector('.theme'),r=document.documentElement;function cur(){return r.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function lab(){b.textContent=cur()==='dark'?'Light':'Dark';b.setAttribute('aria-pressed',cur()==='dark')}b.addEventListener('click',function(){r.dataset.theme=cur()==='dark'?'light':'dark';lab()});lab()})();</script>`;
function page(title, body, css, script = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<link rel="stylesheet" href="/assets/fonts.css">
<style>${BASE_CSS}${css}</style>
</head>
<body>
<p class="pv"><span>Preview for Alexandru · not part of the live site · nothing is saved</span><button type="button" class="theme" aria-label="Switch between light and dark">Dark</button></p>
${body}
${THEME_JS}${script}
</body>
</html>
`;
}

// ── The Level 01 mock: one question at a time ───────────────────────────────
function mockData() {
  const L = LEVELS4[0];
  return { n: L.n, word: L.word, title: L.title, promise: L.promise, old: L.old, neu: L.neu, chapter: `${CHAPTERS4[0].n} · ${CHAPTERS4[0].name}`,
    next: { n: 2, word: LEVELS4[1].word, title: LEVELS4[1].title },
    d: L.d.map((D, d) => {
      const x = MODEL[0].d[d], vals = [];
      for (let v = D.s.min; v <= D.s.max; v += D.s.step) vals.push(v);
      return { l: D.l, name: D.name, dom: DOM_NAMES[d], k: DOMS[d], tq: D.t.q, o: D.t.o,
        s: { q: D.s.q, min: D.s.min, max: D.s.max, step: D.s.step, d: D.s.d, up: D.s.up, e: D.s.e, sfx: D.s.sfx || '', raw: !!D.s.raw,
          word: vals.map((v) => wordOf(D.s, v)),
          text: vals.map((v) => (D.s.raw || (typeof D.s.w === 'function' && !D.s.sfx) ? wordOf(D.s, v) : `${v}${D.s.sfx || ''}`)) },
        f: D.f, fb: D.fb, ex: D.x, done: x.done, on: OV.get(`1.${d}`).on, dayKey: x.dayKey,
        ins: PLAN4[`1.${d}`].ins, take: PLAN4[`1.${d}`].take, notyet: PLAN4[`1.${d}`].notyet, bp: x.bp };
    }) };
}
const MOCK_CSS = `
body{min-height:100vh;display:flex;flex-direction:column}
.bar{position:sticky;top:0;background:var(--paper);border-bottom:1px solid var(--line);padding:10px 16px;z-index:5}
.bar .row{max-width:560px;margin:0 auto;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--soft)}
.bar b{font-family:var(--display);font-size:16px;color:var(--ink);letter-spacing:.1em}
.prog{max-width:560px;margin:8px auto 0;height:4px;background:var(--line);border-radius:4px;overflow:hidden}.prog i{display:block;height:100%;background:var(--c,var(--gold));width:0}
.back{margin-left:auto;background:none;border:0;color:var(--soft);font:14px var(--body);cursor:pointer;padding:4px}
.stage{flex:1;width:100%;max-width:560px;margin:0 auto;padding:26px 16px 120px}
.scr:focus{outline:none}
.dlab{font:600 12px/1.4 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--c,var(--gold-ink));margin:0 0 6px}
.q{font:500 clamp(22px,6vw,28px)/1.25 var(--display);margin:0 0 18px}.q em{color:var(--c,var(--gold-ink))}
.opts{display:grid;gap:8px}.opt{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:var(--panel);color:var(--ink);border:1.5px solid var(--line);border-radius:10px;padding:13px 14px;font:16px/1.35 var(--body);cursor:pointer}
.opt kbd{flex:none}.opt[aria-pressed=true]{border-color:var(--c);box-shadow:inset 0 0 0 1px var(--c)}
.big{font:600 46px/1 var(--display);text-align:center;margin:10px 0 2px}.word{text-align:center;color:var(--soft);margin:0 0 14px}
input[type=range]{width:100%;accent-color:var(--c,var(--gold));height:32px}
.ends{display:flex;justify-content:space-between;font-size:13px;color:var(--soft)}
.sent{font:400 19px/1.5 var(--display);background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:0 0 16px}
.sent .f{border-bottom:1.5px solid var(--line);color:var(--soft)}.sent .f.on{border-color:var(--c);color:var(--c);font-weight:600}.sent .f.has{color:var(--ink);border-color:transparent;font-weight:500}
.txt{width:100%;font:16px/1.5 var(--body);color:var(--ink);background:var(--panel);border:1.5px solid var(--line);border-radius:10px;padding:13px 14px}
.txt:focus{outline:none;border-color:var(--c)}
.hint{font-size:13.5px;color:var(--soft);margin:8px 0 0}.pvo{white-space:nowrap}
.big2{font-size:21px}.lab2{display:block;font:600 12px/1.4 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--c);margin:0 0 6px}.hint button{background:none;border:0;color:var(--gold-ink);font:inherit;text-decoration:underline;cursor:pointer;padding:0}
.days{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.days .opt{justify-content:center;padding:12px 6px}
.done{border-left:3px solid var(--c);background:var(--panel);padding:12px 14px;border-radius:0 10px 10px 0;margin:0 0 18px;font-size:16px}
.done b{color:var(--c)}
.four{display:grid;gap:12px;margin:0}.four div{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 14px}
.four h4{margin:0;font:600 12px/1.4 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--c)}.four h4 small{text-transform:none;letter-spacing:0;color:var(--soft);font-weight:400;margin-left:6px}
.four p{margin:4px 0 0;font-family:var(--display);font-size:17px}.four mark{background:none;color:var(--ink);font-weight:600;border-bottom:1.5px solid var(--c)}.four .dw{font:14px/1.5 var(--body);color:var(--soft);margin-top:6px}
.wk{display:grid;gap:10px}.wk div{border:1px solid var(--line);border-left:4px solid var(--c);background:var(--panel);border-radius:8px;padding:10px 12px}
.wk h4{margin:0;font:600 12px/1.4 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--c)}.wk p{margin:4px 0 0}.wk .star{color:var(--gold-ink);font-weight:600}
.lead{font-family:var(--display);font-size:19px}.promise{border-left:3px solid var(--gold);padding-left:12px;font-size:16px}
.oldnew{font-family:var(--display);font-style:italic;font-size:18px}.oldnew s{color:var(--soft)}
.foot{position:fixed;left:0;right:0;bottom:0;background:var(--paper);border-top:1px solid var(--line);padding:12px 16px calc(12px + env(safe-area-inset-bottom))}
.foot .row{max-width:560px;margin:0 auto;display:flex;align-items:center;gap:12px}
.next{margin-left:auto;background:var(--ink);color:var(--paper);border:0;border-radius:999px;padding:13px 22px;font:600 15px var(--body);cursor:pointer}
.next:disabled{opacity:.35;cursor:default}.keys{font-size:12px;color:var(--soft)}
.ns{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.ns .opt{width:auto;padding:8px 12px;font-size:14px}
.calib{font-family:var(--display);font-size:20px}
.ins{margin:0 0 14px;padding:10px 14px;border-left:3px solid var(--gold);background:var(--panel);border-radius:0 10px 10px 0;font-size:15px;line-height:1.55}
.ins b{display:block;font:600 11px/1.5 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--gold-ink)}
.take{position:relative;margin-top:14px;padding:12px 14px;border:1.5px dashed var(--gold);border-radius:10px;background:var(--panel)}
.take h4{margin:2px 0 6px;font:500 18px/1.3 var(--display)}.take ol,.bpl{margin:0;padding-left:20px;font-size:15px;line-height:1.6}
.tk{margin:0;font:600 11px/1.5 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--gold-ink)}
.ln{display:inline-block;width:6em;border-bottom:1px solid var(--soft);vertical-align:-2px}
.smaller{margin:10px 0 0;padding:10px 12px;border-radius:8px;background:var(--panel);font-size:15px}
mark{background:none;color:inherit;font-weight:600;border-bottom:1.5px solid var(--c,var(--gold))}
@media (max-width:420px){.keys{display:none}}
@media (prefers-reduced-motion:no-preference){.scr{animation:in .22s ease-out}@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.prog i{transition:width .25s}}`;
const MOCK_JS = String.raw`
const L = window.LEVEL;
const S = { i: 0, tap: {}, s: {}, f: {}, sure: {}, got: {}, weak: 'market', other: null };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const idx = (D, v) => Math.round((v - D.s.min) / D.s.step);
const sv = (d) => (S.s[d] == null ? L.d[d].s.d : S.s[d]);
const fields = (D) => D.f.filter((p) => typeof p !== 'string');
function val(d, k) {
  const D = L.d[d];
  if (k === 't') return S.tap[d] == null ? '' : D.o[S.tap[d]];
  if (k === 's') return D.s.text[idx(D, sv(d))];
  if (k === 'w') return D.s.word[idx(D, sv(d))];
  return S.f[d + '.' + k] || '';
}
const fill = (tpl, d) => tpl.replace(/_{4}/g, '\u0001').replace(/\{(\w+)\}/g, (_, k) => { const x = val(d, k); return x ? '<mark>' + esc(x) + '</mark>' : '<mark>____</mark>'; }).replace(/\u0001/g, '<span class="ln"></span>');
function strong(d) { const D = L.d[d], r = (sv(d) - D.s.min) / (D.s.max - D.s.min); return D.s.up ? r >= 0.5 : r <= 0.4; }
// Screens: intro, then per domain tap, slide, one per blank, (day), done, lines; then week, then Level 02's opening.
const SC = [{ t: 'intro' }];
L.d.forEach((D, d) => {
  SC.push({ t: 'tap', d }, { t: 'slide', d });
  fields(D).forEach(([k, hint, ex]) => SC.push({ t: k === D.dayKey ? 'day' : 'blank', d, k, hint, ex }));
  if (D.on) SC.push({ t: 'day', d, k: 'on', hint: D.on, ex: 'Friday', added: true });
  SC.push({ t: 'done', d }, { t: 'lines', d });
});
SC.push({ t: 'week' }, { t: 'n2' });
L.d.forEach((D, d) => SC.push({ t: 'got', d }));
SC.push({ t: 'calib' }, { t: 'bp' });
const order = () => { const w = L.d.findIndex((D) => D.k === S.weak); return [w, ...[0, 1, 2, 3].filter((d) => d !== w)]; };

const $ = (s) => document.querySelector(s);
function sentence(d, cur) {
  return L.d[d].f.map((p) => typeof p === 'string' ? esc(p)
    : '<span class="f' + (p[0] === cur ? ' on' : '') + (S.f[d + '.' + p[0]] ? ' has' : '') + '">' + esc(S.f[d + '.' + p[0]] || p[1]) + '</span>').join('');
}
function ok(sc) {
  if (sc.t === 'tap') return S.tap[sc.d] != null;
  if (sc.t === 'blank' || sc.t === 'day') return !!(S.f[sc.d + '.' + sc.k] || '').trim();
  if (sc.t === 'got') return S.got[sc.d] != null;
  return true;
}
function render() {
  const sc = SC[S.i], D = sc.d != null ? L.d[sc.d] : null, st = $('.stage');
  document.documentElement.style.setProperty('--c', D ? 'var(--' + D.k + ')' : 'var(--gold)');
  $('.prog i').style.width = Math.round((S.i / (SC.length - 1)) * 100) + '%';
  $('.where').textContent = D ? (sc.t === 'got' ? 'Level 02 opens · last week' : D.dom + ' · ' + D.name) : (sc.t === 'n2' || sc.t === 'calib' ? 'Level 02 opens' : 'Level 01');
  $('.back').hidden = S.i === 0;
  let h = '';
  const lab = D ? '<p class="dlab">' + esc(D.l) + ' · ' + esc(D.dom) + (D.k === S.weak ? ' · ★ Start here' : '') + '</p>' : '';
  if (sc.t === 'intro') {
    h = '<p class="dlab">' + esc(L.chapter) + '</p><h1 class="q">Level 01 · ' + esc(L.word) + '<br><em>' + esc(L.title) + '</em></h1>' +
      '<p class="promise"><b>By Sunday you will have:</b> ' + esc(L.promise) + '</p>' +
      '<p class="oldnew"><s>“' + esc(L.old) + '”</s><br>“' + esc(L.neu) + '”</p>' +
      '<p class="hint">For this preview, pick the weakest domain your North Star found. It gets the “Start here” mark.</p><div class="ns">' +
      L.d.map((x, d) => '<button type="button" class="opt" data-weak="' + x.k + '" aria-pressed="' + (S.weak === x.k) + '">' + esc(x.dom) + '</button>').join('') + '</div>';
  } else if (sc.t === 'tap') {
    h = lab + '<h2 class="q">' + D.tq + '</h2><div class="opts" role="group">' + D.o.map((o, i) =>
      '<button type="button" class="opt" data-tap="' + i + '" aria-pressed="' + (S.tap[sc.d] === i) + '"><kbd>' + (i + 1) + '</kbd>' + esc(o) + '</button>').join('') + '</div>';
  } else if (sc.t === 'slide') {
    const v = sv(sc.d);
    h = lab + '<h2 class="q">' + esc(D.s.q) + '</h2><p class="big" aria-live="polite">' + esc(D.s.raw ? D.s.word[idx(D, v)] : v + D.s.sfx) + '</p><p class="word">' + esc(D.s.word[idx(D, v)]) + '</p>' +
      '<input type="range" min="' + D.s.min + '" max="' + D.s.max + '" step="' + D.s.step + '" value="' + v + '" aria-label="' + esc(D.s.q) + '"><div class="ends"><span>' + esc(D.s.e[0]) + '</span><span>' + esc(D.s.e[1]) + '</span></div>';
  } else if (sc.t === 'blank') {
    const first = fields(D)[0][0] === sc.k;
    h = lab + (first ? '<p class="ins"><b>Why it matters</b>' + esc(D.ins) + '</p>' : '') + '<div class="sent big2">' + sentence(sc.d, sc.k) + '</div><label class="lab2" for="in">' + esc(sc.hint) + '</label>' +
      '<input id="in" class="txt" type="text" autocomplete="off" enterkeyhint="next" value="' + esc(S.f[sc.d + '.' + sc.k] || '') + '" placeholder="e.g. ' + esc(sc.ex) + '">' +
      '<p class="hint">A few words is enough. <span class="pvo">Preview only: <button type="button" data-ex>use the example</button></span></p>';
  } else if (sc.t === 'day') {
    const cur = S.f[sc.d + '.' + sc.k] || '';
    h = lab + (sc.added ? '' : '<div class="sent">' + sentence(sc.d, sc.k) + '</div>') + '<h2 class="q">' + esc(sc.added ? sc.hint.replace(/\{(\w+)\}/g, (_, k) => val(sc.d, k) || '…') : 'Which day?') + '</h2>' +
      '<div class="days">' + DAYS.map((x, i) => '<button type="button" class="opt" data-day="' + x + '" aria-pressed="' + (cur === x) + '"><kbd>' + (i + 1) + '</kbd>' + x.slice(0, 3) + '</button>').join('') +
      '<button type="button" class="opt" data-other aria-pressed="' + (!!cur && !DAYS.includes(cur)) + '">A date</button></div>' +
      (S.other === sc.d + '.' + sc.k || (cur && !DAYS.includes(cur)) ? '<input id="in" class="txt" type="text" style="margin-top:10px" placeholder="e.g. 14 Nov" value="' + esc(DAYS.includes(cur) ? '' : cur) + '">' : '');
  } else if (sc.t === 'done') {
    const v = S.sure[sc.d] == null ? 50 : S.sure[sc.d];
    h = lab + '<p class="done"><b>Done when</b> ' + fill(D.done, sc.d) + '</p><h2 class="q">How sure are you that this is done by Sunday?</h2>' +
      '<p class="big" aria-live="polite">' + v + '%</p><input type="range" min="0" max="100" step="10" value="' + v + '" aria-label="How sure are you"><div class="ends"><span>Not sure</span><span>Certain</span></div>';
  } else if (sc.t === 'lines') {
    const L4 = [['Where you were', 'Admit it.', D.fb[0]], ['Where you struggle', 'Don’t fight it.', D.fb[1]], ['Where you shine', 'Don’t ignore it.', strong(sc.d) ? D.fb[2][0] : D.fb[2][1]], ['What you will do', 'Exactly.', D.fb[3]]];
    h = lab + '<h2 class="q">' + esc(D.name) + ', in four lines</h2><div class="four">' + L4.map(([a, b, c], i) =>
      '<div><h4>' + a + '<small>' + b + '</small></h4><p>' + fill(c, sc.d) + '</p>' + (i === 3 ? '<p class="dw"><b>Done when</b> ' + fill(D.done, sc.d) + ' · ' + (S.sure[sc.d] == null ? 50 : S.sure[sc.d]) + '% sure</p>' : '') + '</div>').join('') + '</div>' +
      '<div class="take"><p class="tk">Yours to keep · it goes into your Blueprint: ' + esc(D.bp) + '</p><h4>' + fill(D.take[0], sc.d) + '</h4><ol>' + D.take.slice(1).map((l) => '<li>' + fill(l, sc.d) + '</li>').join('') + '</ol></div>';
  } else if (sc.t === 'week') {
    h = '<p class="dlab">Your week</p><h2 class="q">Four actions. Each has a day.</h2><div class="wk">' + order().map((d, i) => {
      const x = L.d[d];
      return '<div style="--c:var(--' + x.k + ')"><h4>' + (i === 0 ? '<span class="star">★ My one move · </span>' : 'Goal ' + i + ' · ') + esc(x.dom) + '</h4><p>' + fill(x.fb[3], d) + '</p><p class="hint"><b>Done when</b> ' + fill(x.done, d) + '</p></div>';
    }).join('') + '</div><p class="hint">Write these on your Planner’s Monday page: the first as <b>My one move</b>, the other three as <b>Three goals</b>.</p>';
  } else if (sc.t === 'n2') {
    h = '<p class="dlab">Next Sunday · a preview</p><h2 class="q">This is how Level 02 · ' + esc(L.next.word) + ' opens.</h2><p class="lead">Before anything new, last week’s four actions, one at a time. Done, Partly or Not yet. A no is information, not a verdict.</p>';
  } else if (sc.t === 'got') {
    h = lab + '<p class="done"><b>Last week you said:</b> ' + fill(D.fb[3], sc.d) + '<br><span class="hint"><b>Done when</b> ' + fill(D.done, sc.d) + '</span></p><h2 class="q">Did it happen?</h2><div class="opts">' +
      ['Done', 'Partly', 'Not yet'].map((o, i) => '<button type="button" class="opt" data-got="' + i + '" aria-pressed="' + (S.got[sc.d] === i) + '"><kbd>' + (i + 1) + '</kbd>' + o + '</button>').join('') + '</div>' +
      (S.got[sc.d] != null ? '<p class="hint">You were ' + (S.sure[sc.d] == null ? 50 : S.sure[sc.d]) + '% sure. It happened: ' + ['yes', 'partly', 'not yet'][S.got[sc.d]] + '.</p>' : '') +
      (S.got[sc.d] > 0 ? '<p class="smaller">' + fill(D.notyet, sc.d) + '</p>' : '');
  } else if (sc.t === 'calib') {
    const n = [0, 1, 2, 3], exp = n.reduce((a, d) => a + (S.sure[d] == null ? 50 : S.sure[d]), 0) / 400,
      real = n.reduce((a, d) => a + [1, 0.5, 0][S.got[d]], 0) / 4, diff = exp - real,
      word = diff > 0.15 ? 'too hopeful' : diff < -0.15 ? 'too careful' : 'about right',
      cnt = (g) => n.filter((d) => S.got[d] === g).length;
    h = '<p class="dlab">Last week, counted</p><h2 class="q">' + cnt(0) + ' done, ' + cnt(1) + ' partly, ' + cnt(2) + ' not yet.</h2>' +
      '<p class="calib">Your estimates were <b>' + word + '</b>.</p><p class="hint">The same three words as the Sunday page of your Planner. The chapter reading after Level 05 adds them up.</p>' +
      '<p class="lead">Then Level 02 begins: the promise, old and new, and the first tap.</p>';
  } else if (sc.t === 'bp') {
    h = '<p class="dlab">My Blueprint · after one week</p><h2 class="q">Four parts of your Blueprint, already written.</h2>' +
      '<p class="hint">After twelve weeks: eight parts, all forty-eight in your own words. How you lead, your people, what you sell, your marketing, your sales, your money, your systems and your next twelve weeks. Printable.</p><div class="wk">' +
      L.d.map((x, d) => '<div style="--c:var(--' + x.k + ')"><h4>' + esc(x.bp) + '</h4><p><b>' + fill(x.take[0], d) + '</b></p><ol class="bpl">' + x.take.slice(1).map((l) => '<li>' + fill(l, d) + '</li>').join('') + '</ol></div>').join('') +
      '</div><p><button type="button" class="opt" data-restart style="width:auto;margin-top:14px">Start the preview again</button></p>';
  }
  st.innerHTML = '<div class="scr" tabindex="-1">' + h + '</div>';
  const nx = $('.next'); nx.disabled = !ok(sc) || S.i === SC.length - 1; nx.textContent = S.i === SC.length - 1 ? 'The end' : sc.t === 'intro' ? 'Start' : 'Next';
  const inp = st.querySelector('#in'), rng = st.querySelector('input[type=range]');
  if (inp) {
    inp.focus();
    inp.addEventListener('input', () => {
      S.f[sc.d + '.' + sc.k] = inp.value; nx.disabled = !ok(sc);
      // The sentence above fills in as the founder types; nothing redraws.
      const f = st.querySelector('.sent .f.on');
      if (f) { f.textContent = inp.value || sc.hint; f.classList.toggle('has', !!inp.value.trim()); }
    });
  } else if (rng) {
    rng.focus();
    // Only the number and its word change while sliding, so a finger drag is never cut.
    rng.addEventListener('input', () => {
      const v = Number(rng.value), big = st.querySelector('.big'), w = st.querySelector('.word');
      if (sc.t === 'slide') { S.s[sc.d] = v; big.textContent = D.s.raw ? D.s.word[idx(D, v)] : v + D.s.sfx; w.textContent = D.s.word[idx(D, v)]; }
      else { S.sure[sc.d] = v; big.textContent = v + '%'; }
    });
  }
  else st.querySelector('.scr').focus({ preventScroll: true });
}
function go(n) { const sc = SC[S.i]; if (n > 0 && !ok(sc)) return; if (sc.t === 'slide' && S.s[sc.d] == null) S.s[sc.d] = L.d[sc.d].s.d; if (sc.t === 'done' && S.sure[sc.d] == null) S.sure[sc.d] = 50;
  S.i = Math.max(0, Math.min(SC.length - 1, S.i + n)); S.other = null; render(); window.scrollTo(0, 0); }
document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; const sc = SC[S.i];
  if (b.matches('.next')) return go(1);
  if (b.matches('.back')) return go(-1);
  if (b.dataset.weak) { S.weak = b.dataset.weak; return render(); }
  if (b.dataset.tap != null) { S.tap[sc.d] = Number(b.dataset.tap); render(); return setTimeout(() => go(1), 180); }
  if (b.dataset.got != null) { S.got[sc.d] = Number(b.dataset.got); return render(); }
  if (b.dataset.day) { S.f[sc.d + '.' + sc.k] = b.dataset.day; render(); return setTimeout(() => go(1), 180); }
  if (b.hasAttribute('data-other')) { S.other = sc.d + '.' + sc.k; if (DAYS.includes(S.f[S.other])) S.f[S.other] = ''; return render(); }
  if (b.hasAttribute('data-ex')) { S.f[sc.d + '.' + sc.k] = sc.ex; return render(); }
  if (b.hasAttribute('data-restart')) { Object.assign(S, { i: 0, tap: {}, s: {}, f: {}, sure: {}, got: {}, other: null }); return render(); }
});
document.addEventListener('keydown', (e) => {
  const sc = SC[S.i], typing = e.target.matches('input[type=text]');
  if (e.key === 'Enter') { e.preventDefault(); return go(1); }
  if (e.key === 'Escape') { e.preventDefault(); return go(-1); }
  if (typing) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 9) {
    const b = document.querySelectorAll('.stage .opt')[n - 1];
    if (b && (sc.t === 'tap' || sc.t === 'day' || sc.t === 'got')) { e.preventDefault(); b.click(); }
  }
});
render();`;
function mock() {
  return page('Level 01, one at a time', `
<div class="bar"><div class="row"><b>SEED</b><span class="where">Level 01</span><button type="button" class="back" hidden>← Back</button></div><div class="prog"><i></i></div></div>
<main class="stage" aria-live="polite"></main>
<div class="foot"><div class="row"><span class="keys"><kbd>Enter</kbd>next <kbd>1</kbd>–<kbd>7</kbd>pick <kbd>←</kbd><kbd>→</kbd>slide <kbd>Esc</kbd>back</span><button type="button" class="next">Start</button></div></div>`,
  MOCK_CSS, `<script>window.LEVEL=${JSON.stringify(mockData()).replace(/</g, '\\u003c')};</script><script>${MOCK_JS}</script>`);
}

// ── Write ──────────────────────────────────────────────────────────────────
const outs = [['docs/blueprint-skeleton.md', md()], ['docs/blueprint-skeleton.html', html()], ['docs/level-01-one-at-a-time.html', mock()]];
mkdirSync(new URL('public/preview/blueprint/', root), { recursive: true });
for (const [p, s] of outs) writeFileSync(new URL(p, root), s);
writeFileSync(new URL('public/preview/blueprint/index.html', root), outs[1][1]);
writeFileSync(new URL('public/preview/blueprint/level-01-one-at-a-time.html', root), outs[2][1]);
console.log(outs.map(([p, s]) => `${p}  ${s.split('\n').length} lines`).join('\n'));
