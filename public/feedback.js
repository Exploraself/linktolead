// FEEDBACK — what the Blueprint says back, after levels one, two and three.
//
// The ideology, stated plainly so it can be argued with:
//
// 1. Every sentence must be traceable to something the founder entered. No
//    encouragement, no personality type, no claim about who they are. If a
//    worksheet is empty, the feedback says so and treats the blank as the
//    finding — because a founder who would not open their calendar has told
//    us something true.
// 2. It names one thing, not five. A report that lists everything is a report
//    that changes nothing.
// 3. It is allowed to be unwelcome. The value a founder gets here is the
//    sentence nobody in their life is positioned to say.
// 4. It never grades. There is no score, no percentile, no "most founders".
//    Their own figures are the only standard used.
// 5. Every finding ends somewhere specific in the programme — a level and a
//    domain — so "what do I do now" is answered with a door, not advice.
// 6. Where the evidence is thin, it says the evidence is thin. Confidence
//    without grounds is the one thing that would make this worthless.
//
// A rule fires only when its `when` can be decided. Any signal that is
// missing makes the rule silent rather than guessing.

import { DOMAINS, LEVELS, weekTitle } from './content.js';
import { FW_BUILD } from './fw-build.js';
import { FW_GROW } from './fw-grow.js';
import { FW_SCALE } from './fw-scale.js';
import { result } from './frameworks.js';

const SHEETS = { build: FW_BUILD, grow: FW_GROW, scale: FW_SCALE };
const DK = ['self', 'people', 'work', 'market'];

// ── Reading what they entered ────────────────────────────────────────────────
/** Everything the rules are allowed to look at. Nothing else is available to
 *  them, which is what keeps a finding from drifting into invention. */
export function signals(state, stage, upto) {
  const s = { stage, diag: {}, w: {}, answered: {}, thin: {}, blank: {} };

  // The entrance diagnostic: 0 to 4 per domain, or absent if not taken.
  const d = state.diag || {};
  const pairs = { self: [0, 1], people: [2, 3], work: [4, 5], market: [6, 7] };
  for (const k of DK) {
    const [a, b] = pairs[k];
    s.diag[k] = (typeof d[a] === 'number' && typeof d[b] === 'number') ? d[a] + d[b] : null;
  }

  for (let lv = 1; lv <= upto; lv++) {
    for (const k of DK) {
      // How much they wrote, and how much of it is substantial.
      const vals = Array.from({ length: 7 }, (_, i) => String(state.answers[`${stage}.${lv}.${k}.${i}`] || '').trim());
      const written = vals.filter(Boolean);
      s.answered[`${lv}.${k}`] = written.length;
      s.thin[`${lv}.${k}`] = written.length ? written.join(' ').length / written.length : 0;

      // The worksheet's own result, if they filled it in.
      const fw = ((SHEETS[stage] || {})[lv] || {})[k];
      if (!fw) continue;
      const pre = `w.${stage}.${lv}.${k}.`;
      const v = {};
      for (const key of Object.keys(state.work || {})) if (key.startsWith(pre)) v[key.slice(pre.length)] = state.work[key];
      const r = result(fw, v);
      s.w[fw.k] = r;
      s.blank[fw.k] = !r;
    }
  }
  return s;
}

const n = (s, key) => (s.w[key] && typeof s.w[key].raw === 'number' ? s.w[key].raw : null);
const got = (s, key) => !!s.w[key];
/** How many entries a counting worksheet actually has, from "3 of 5". */
function count(s, key) {
  const r = s.w[key];
  if (!r || typeof r.shown !== 'string') return null;
  const m = /^(\d+) of (\d+)$/.exec(r.shown);
  return m ? +m[1] : null;
}

// ── The rules ────────────────────────────────────────────────────────────────
// sev 3 is "this is the thing", 2 is "this matters", 1 is worth noting.
// `where` is the door: a level and a domain inside this programme.

export const RULES = [
  // ---- Level 1 ------------------------------------------------------------
  { k: 'l1-week-invisible', lv: 1, dk: 'self', sev: 3,
    when: (s) => n(s, 'b1-self') !== null && n(s, 'b1-self') < 15,
    title: 'Most of your week is unaccounted for',
    say: (s) => `You could account for ${s.w['b1-self'].shown} hours of last week. Everything you decide from here — what to charge, who to hire, what to stop — rests on hours you cannot currently see. This is not a discipline problem. It is simply the first thing that has to become visible.`,
    step: 'Before anything else: one block in next week’s calendar, defended, with a name on it.',
    where: { lv: 7, dk: 'self' } },

  { k: 'l1-week-blank', lv: 1, dk: 'self', sev: 3,
    when: (s) => s.blank['b1-self'],
    title: 'You did not open the calendar',
    say: () => 'The hours worksheet is empty. That is a finding rather than a gap: the exercise asks you to look at evidence rather than remember, and the looking is the part that was avoided. Nothing further in this programme works well without it.',
    step: 'Open last week’s calendar and fill in five rows. Ten minutes.',
    where: { lv: 1, dk: 'self' } },

  { k: 'l1-two-businesses', lv: 1, dk: 'market', sev: 3,
    when: (s) => n(s, 'b1-market') !== null && n(s, 'b1-market') < 40,
    title: 'You are describing one business and running another',
    say: (s) => `Of the last ten people who paid you, ${s.w['b1-market'].shown}% match the customer you say you serve. Your money and your sentence disagree, and the money is the one with evidence behind it. Either the sentence changes or who you chase does — but carrying both is what makes marketing feel like shouting.`,
    step: 'Choose one kind of customer for twelve weeks. Write the three you will contact first.',
    where: { lv: 3, dk: 'market' } },

  { k: 'l1-in-your-head', lv: 1, dk: 'work', sev: 2,
    when: (s) => count(s, 'b1-work') !== null && count(s, 'b1-work') < 4,
    title: 'The delivery lives in your head',
    say: (s) => `You wrote ${count(s, 'b1-work')} of the eight steps of your own delivery. A process nobody has written has as many versions as it has people, and every one of them needs you to settle it. That is the mechanism by which a founder becomes the bottleneck without ever choosing to.`,
    step: 'Write one step — the one that costs most when you are away — in ten lines.',
    where: { lv: 9, dk: 'work' } },

  { k: 'l1-people-guessing', lv: 1, dk: 'people', sev: 2,
    when: (s) => count(s, 'b1-people') !== null && count(s, 'b1-people') < 3,
    title: 'People are guessing what you expect',
    say: () => 'Most rows of the people worksheet have no answer about whether that person knows what you expect. Unstated expectations get enforced anyway — through mood, through who gets the good work — and the person on the receiving end cannot ask about a rule nobody has said out loud.',
    step: 'One person, one sentence, this week. Say what you expect and when.',
    where: { lv: 3, dk: 'people' } },

  // ---- Level 2 ------------------------------------------------------------
  { k: 'l2-reason-unsayable', lv: 2, dk: 'self', sev: 3,
    when: (s) => s.blank['b2-self'],
    title: 'Your reason is not yet sayable',
    say: () => 'The sentence is unfinished. That usually means one of the three parts has no answer yet — most often the last one, what holds when it is hard. A reason you cannot say on a bad week is not available to you on the week you need it.',
    step: 'Finish the sentence, then say it aloud once. If you added a word to make it sound better, remove that word.',
    where: { lv: 2, dk: 'self' } },

  { k: 'l2-cheap-problem', lv: 2, dk: 'market', sev: 3,
    when: (s) => n(s, 'b2-market') !== null && n(s, 'b2-market') < 2000,
    title: 'You have found the cheap version of the problem',
    say: (s) => `By your own figures the problem costs your customer about ${s.w['b2-market'].shown} a year. At that size it is an irritation, and nobody reorganises their year over an irritation. The expensive version of this problem almost certainly exists — it is usually one layer up, owned by somebody more senior than whoever you have been talking to.`,
    step: 'One conversation with somebody who lives the larger version. Ask what it costs them a week.',
    where: { lv: 4, dk: 'market' } },

  { k: 'l2-no-evidence', lv: 2, dk: 'people', sev: 2,
    when: (s) => count(s, 'b2-people') !== null && count(s, 'b2-people') < 2,
    title: 'You cannot yet evidence what you do for people',
    say: () => 'Fewer than two of the three people have a line saying how you know what changed for them. That is not a failure of modesty; it is an absence of asking. Everything you will later want to say in public has to come from somewhere, and this is the only place it can come from.',
    step: 'Call one past customer this week. Ask what changed, and write their words down unedited.',
    where: { lv: 5, dk: 'market' } },

  // ---- Level 3 ------------------------------------------------------------
  { k: 'l3-untested-standard', lv: 3, dk: 'self', sev: 2,
    when: (s) => count(s, 'b3-self') !== null && count(s, 'b3-self') < 2,
    title: 'Your standards have not cost you anything yet',
    say: () => 'Most of your standards have no occasion written beside them where holding one cost you something. They are not dishonest — they are untested, which is a different and more fixable thing. A standard becomes real on the day you pay for it, and not before.',
    step: 'Name the standard you are willing to let cost you something this quarter, and what it might cost.',
    where: { lv: 4, dk: 'self' } },

  { k: 'l3-hoping', lv: 3, dk: 'people', sev: 3,
    when: (s) => s.blank['b3-people'],
    title: 'You are hoping, not deciding',
    say: () => 'The conversation worksheet is incomplete, and the part that is almost always missing is the last one: what happens if nothing changes. Without it, every reply works, so the conversation goes nowhere and has to be had again. Deciding the consequence is the whole work. Saying it is the easy part.',
    step: 'Finish the four parts, then put the conversation in the calendar with a day and a time.',
    where: { lv: 6, dk: 'people' } },

  { k: 'l3-low-ceiling', lv: 3, dk: 'work', sev: 2,
    when: (s) => n(s, 'b3-work') !== null && n(s, 'b3-work') < 2,
    title: 'Your ceiling is lower than your plans',
    say: (s) => `At the step where work waits, you can deliver about ${s.w['b3-work'].shown} a week. Every promise made above that line does not increase delivery; it increases apology. Knowing the number is not a limitation — said out loud in a sale it becomes a reason to choose you.`,
    step: 'Decide one of three: raise the ceiling, protect it, or stop selling past it.',
    where: { lv: 8, dk: 'work' } },

  { k: 'l3-type-not-list', lv: 3, dk: 'market', sev: 3,
    when: (s) => count(s, 'b3-market') !== null && count(s, 'b3-market') < 6,
    title: 'You have a type, not a list',
    say: (s) => `You named ${count(s, 'b3-market')} of ten real people or companies. A type can be thought about indefinitely; a list can only be worked or avoided. Almost every founder who says the market is slow has a type rather than a list, and the two feel identical from the inside.`,
    step: 'Get the list to ten names with a route beside each. Then contact three.',
    where: { lv: 10, dk: 'market' } },

  // ---- Across the three ---------------------------------------------------
  { k: 'thin-answers', lv: 3, dk: null, sev: 2,
    when: (s) => {
      const vals = Object.values(s.thin).filter((x) => x > 0);
      return vals.length >= 6 && vals.reduce((a, b) => a + b, 0) / vals.length < 28;
    },
    title: 'You are answering from memory',
    say: () => 'Your answers are short — short enough that most of them were written without opening anything. Every step in this programme names what to open, what to count and what to write, and the difference between remembering and looking is where all of the value is. The questions are not hard. Looking is.',
    step: 'Take one level again with the relevant file, calendar or account actually open.',
    where: { lv: 1, dk: 'self' } },

  { k: 'diag-disagrees', lv: 3, dk: null, sev: 1,
    when: (s) => {
      const d = Object.entries(s.diag).filter(([, v]) => v !== null);
      if (d.length < 4) return false;
      const low = d.sort((a, b) => a[1] - b[1])[0];
      return low[1] <= 1;
    },
    title: 'The entrance already told you this',
    say: (s) => {
      const low = Object.entries(s.diag).filter(([, v]) => v !== null).sort((a, b) => a[1] - b[1])[0];
      const d = DOMAINS.find((x) => x.k === low[0]);
      return `At the entrance you scored ${low[1]} of 4 on ${d.n} — the lowest of the four — and the levels since have not contradicted it. When the diagnostic and the work agree, the question stops being which domain and becomes when.`;
    },
    step: 'Give that domain the next two weeks rather than spreading attention across four.',
    where: null },
];

// ── The report ───────────────────────────────────────────────────────────────
/** What the Blueprint says back after a level closes. Returns null before
 *  level one is finished, and never fabricates a finding to fill a section. */
export function report(state, stage, upto) {
  if (upto < 1 || upto > 3) return null;
  const s = signals(state, stage, upto);
  const fired = RULES.filter((r) => r.lv <= upto).filter((r) => { try { return r.when(s); } catch { return false; } });
  fired.sort((a, b) => b.sev - a.sev);

  const findings = fired.slice(0, 3).map((r) => ({
    k: r.k, sev: r.sev, title: r.title, body: r.say(s), step: r.step,
    domain: r.dk ? DOMAINS.find((d) => d.k === r.dk) : null,
    where: r.where ? { ...r.where, title: weekTitle(stage, r.where.lv) } : null,
  }));

  return {
    level: upto,
    stand: standing(s, fired, upto),
    findings,
    clear: !fired.length,
    thin: thinness(s),
  };
}

/** Where they are, in one paragraph, from the shape of what fired. */
function standing(s, fired, upto) {
  if (!fired.length) {
    return `Nothing in level ${upto} is firing a warning. You opened what you were asked to open, your figures are inside your own stated bounds, and your answers carry evidence rather than recollection. That is uncommon enough to say plainly. The work from here is depth rather than repair.`;
  }
  const hard = fired.filter((r) => r.sev === 3);
  const doms = [...new Set(fired.map((r) => r.dk).filter(Boolean))];
  if (hard.length >= 3) {
    return `Three things are pulling at once, which is the ordinary state of a business at this stage and not a verdict on you. They are listed in the order they cost you. Work the first and the other two usually get smaller, because they are often the same problem arriving by different doors.`;
  }
  if (doms.length === 1) {
    const d = DOMAINS.find((x) => x.k === doms[0]);
    return `Everything that fired across level${upto > 1 ? 's one to ' + upto : ' one'} sits in one domain: ${d.n}. That is useful news. A business with a single thin domain has a project rather than a condition, and you now know which two weeks to give it.`;
  }
  return `What follows comes from your own figures and your own sentences — nothing has been assumed about you. It is ordered by what it is costing, not by what is easiest to fix.`;
}

/** Honesty about the evidence the report itself rests on. */
function thinness(s) {
  const sheets = Object.keys(s.blank);
  const empty = sheets.filter((k) => s.blank[k]).length;
  if (!sheets.length) return null;
  if (empty === 0) return null;
  if (empty >= sheets.length * 0.6) {
    return `Most worksheets in these levels are empty, so this reads your written answers only. Fill the worksheets and this report gets considerably sharper — the figures are what let it say something you could not have told yourself.`;
  }
  return `${empty} of ${sheets.length} worksheets are still empty, so some of this is reading around a gap. Anything below that quotes a figure is coming from one you entered.`;
}
