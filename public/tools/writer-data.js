// The two writing tools of the Growth Toolkit (Alexandru's GO, 2 Nov 2026,
// as planned in 03 START HERE): Reel structure (/reel-structure/) and
// Branding structure (/branding-structure/). One field per screen; the
// result is built only from the founder's own words (AGENTS.md 6 and 9).
// The page that runs them is public/tools/writer.js. Nothing here touches the
// browser, so the tests import this file directly.
//
// Reel structure follows Alexandru's video rules: 30–40 seconds, complete
// sentences, GRAB → HOOK (a stinging thought + the obvious question) → HOLD
// (three beats, the picture changes every 2–3 seconds) → VALUE (one idea) →
// one call to action; captions always on, key words in gold.

/** Words a minute at a calm speaking pace: the same as the Teleprompter. */
export const WPM = 140;
export const wordsIn = (s) => (String(s == null ? '' : s).trim().match(/\S+/g) || []).length;
export const secondsFor = (words) => (words * 60) / WPM;
const pad2 = (n) => String(n).padStart(2, '0');
/** 0:00, 0:37, 1:05 */
export const clock = (s) => { const r = Math.max(0, Math.round(s)); return `${Math.floor(r / 60)}:${pad2(r % 60)}`; };
const round1 = (s) => Math.round(s * 10) / 10;
/** "about 3 s" — whole seconds, never "0 s" for a line that has words. */
export const secsText = (s) => `about ${Math.max(s > 0 ? 1 : 0, Math.round(s))} s`;
const clean = (s) => String(s == null ? '' : s).trim();
const noStop = (s) => clean(s).replace(/[.!?…]+$/u, '');
/** First letter small (they wrote a sentence start), unless the first word
 *  is "I" or all capitals (an acronym: CEO, SaaS stays as typed). */
const lower1 = (s) => {
  const t = noStop(s), w = t.split(/\s+/)[0] || '';
  if (w === 'I' || w.startsWith('I’') || w.startsWith("I'") || (w.length > 1 && /^\p{Lu}+$/u.test(w.replace(/[^\p{L}]/gu, ''))) || /^\p{Lu}\p{Ll}*\p{Lu}/u.test(w)) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
};

/* ── Reel structure ─────────────────────────────────────────── */

/** The five parts and the seconds each should take inside 40. The HOLD is
 *  three beats of about 6–7 seconds each. */
export const REEL_PARTS = [
  { k: 'grab', label: 'Grab', ids: ['grab'], max: 3 },
  { k: 'hook', label: 'Hook', ids: ['sting', 'question'], max: 6 },
  { k: 'beat1', label: 'Hold · 1', ids: ['beat1'], max: 7 },
  { k: 'beat2', label: 'Hold · 2', ids: ['beat2'], max: 7 },
  { k: 'beat3', label: 'Hold · 3', ids: ['beat3'], max: 6 },
  { k: 'value', label: 'Value', ids: ['value'], max: 7 },
  { k: 'cta', label: 'One call to action', ids: ['cta'], max: 4 },
];
export const REEL_MIN = 30;
export const REEL_MAX = 40;
/** Which part a question belongs to (for the live seconds under the field). */
export const partOf = (id) => REEL_PARTS.find((p) => p.ids.includes(id)) || null;

/** The script, timed: each part's words, seconds, start and end, and a note
 *  when a part runs long. Only the founder's words are counted. */
export function reelTiming(a) {
  let at = 0;
  const parts = REEL_PARTS.map((p) => {
    const lines = p.ids.map((id) => clean(a[id])).filter(Boolean);
    const text = lines.join(' ');
    const words = wordsIn(text), secs = secondsFor(words);
    const from = at; at += secs;
    const over = secs - p.max;
    // Words to cut = words now − the words that fit in this part's seconds.
    const cut = over > 0.5 ? words - Math.floor((p.max * WPM) / 60) : 0;
    return { ...p, lines, text, words, secs: round1(secs), from, to: at, cut,
      note: cut ? `${secsText(secs).replace('about', 'About')}: aim for ${p.max}. Cut about ${cut} ${cut === 1 ? 'word' : 'words'}.` : '' };
  });
  const words = parts.reduce((n, p) => n + p.words, 0), secs = secondsFor(words);
  const longest = parts.slice().sort((x, y) => (y.secs - y.max) - (x.secs - x.max))[0];
  let verdict;
  if (secs > REEL_MAX + 0.5) {
    const over = Math.round(secs - REEL_MAX), cut = words - Math.floor((REEL_MAX * WPM) / 60);
    verdict = { ok: false, h: `about ${Math.round(secs)} seconds: ${over} over 40`,
      line: `Cut about ${cut} words. Start with the part that runs longest for its place: ${longest.label.toLowerCase()}.` };
  } else if (secs < REEL_MIN - 0.5) {
    verdict = { ok: true, h: `about ${Math.round(secs)} seconds`,
      line: 'Under 30 seconds. Short is fine; if a line is missing, it is usually one more beat in the hold.' };
  } else {
    verdict = { ok: true, h: `about ${Math.round(secs)} seconds`, line: 'Inside 30 to 40 seconds. Film it as it is.' };
  }
  return { parts, words, secs: round1(secs), verdict };
}

/** The script for the Teleprompter: one paragraph per part, in order. */
export function reelScript(a) {
  return REEL_PARTS.map((p) => p.ids.map((id) => clean(a[id])).filter(Boolean).join(' ')).filter(Boolean).join('\n\n');
}

/** The script with its labels and seconds, to copy or print. */
export function reelScriptLabelled(a) {
  return reelTiming(a).parts.filter((p) => p.text)
    .map((p) => `${p.label.toUpperCase()} (${clock(p.from)}–${clock(p.to)})\n${p.text}`).join('\n\n');
}

/** The Teleprompter, opened with this script (public/teleprompter/index.html
 *  reads #t=<title>&s=<text>). */
export function teleprompterHref(a) {
  const who = noStop(a.who);
  const title = `Reel · ${who}`.slice(0, 60);
  return `/teleprompter/#t=${encodeURIComponent(title)}&s=${encodeURIComponent(reelScript(a))}`;
}

const STOP = new Set(('a an and are as at be been but by can could did do does doing done for from had has have having he her hers him his how i if in into is it its just me more most my no nor not now of off on once only or our out over own same she so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves '
  + 'about after again also any because before being below between both down during each few further here itself let lets myself nor other ought ourselves themselves until upon whose yes yet one two three every much many make makes made get gets got say says said tell told want wants need needs know knows think thing things really still even ever never always just like gonna dont don’t can’t cant won’t im i’m it’s youre you’re ill i’ll ive i’ve we’re they’re that’s thats there’s whats what’s').split(/\s+/));

/** Words the founder can put in gold: from their own script, first seen
 *  first, each once, no small words. */
export function goldCandidates(a, max = 24) {
  const seen = new Set(), out = [];
  for (const w of reelScript(a).split(/\s+/)) {
    const word = w.replace(/^[^\p{L}\p{N}$]+|[^\p{L}\p{N}%]+$/gu, '');
    const key = word.toLowerCase().replace(/’/g, "'");
    if (word.length < 4 || STOP.has(key) || STOP.has(key.replace(/'/g, '’')) || seen.has(key)) continue;
    seen.add(key); out.push(word);
    if (out.length >= max) break;
  }
  return out;
}

/* ── Branding structure ─────────────────────────────────────── */

/** The one-liner, drafted from their own answers; they edit it. */
export function oneLinerDraft(a) {
  const who = lower1(a.who), from = lower1(a.from), to = lower1(a.to);
  if (!who) return '';
  return from && to ? `I help ${who} go from ${from} to ${to}.` : `I help ${who}.`;
}

/** The message to three customers: "Is this you?" Built from their words. */
export function askMessage(a, first = '') {
  const prob = noStop(clean(a.problem).replace(/^[“"‘']+|[”"’']+$/g, ''));
  return [
    'Hi [name], a quick one.',
    'I’m putting into words who I serve best, and I’d value your honest eye. Is this you?',
    `${noStop(a.who)}: “${prob}.”`,
    `Today: ${lower1(a.from)}. What you want: ${lower1(a.to)}.`,
    'Would you say it like that? If not, how would you say it? One line is plenty. Thank you!',
    first || '',
  ].filter(Boolean).join('\n\n');
}

/** Up to three short words from what they typed ("calm, clear honest"). */
export const splitWords = (s) => String(s || '').split(/[,;/\n]+|\s+/).map((w) => w.trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')).filter(Boolean);

/* ── The two tools ──────────────────────────────────────────── */

export const WRITERS = {
  'reel-structure': {
    key: 'reel-structure', name: 'Reel structure', domain: 'Lead the market', path: '/reel-structure/', kind: 'reel',
    intro: {
      h: 'Three seconds to earn the next thirty.',
      p: 'Ten short answers, one at a time. You leave with a script of about 40 seconds, timed to the second, three words to show in gold, and a button that opens it in the Teleprompter.',
      fine: 'Free, in the Growth Toolkit. Your script stays on this device; with an account, a copy is kept so Alexandru and the team can read it before a session.',
    },
    qs: [
      { id: 'who', type: 'line', q: 'Who is this Reel for? One person.', hint: 'Not “everyone”. One person in one situation, the way you would point them out in a room.', ph: 'e.g. A café owner who works every Saturday' },
      { id: 'grab', type: 'line', timed: true, q: 'Grab · the first 3 seconds. What do they hear first?', hint: 'One short line that stops the thumb: a number, a bold claim, a surprise. Seven words or fewer.', ph: 'e.g. You’re not busy. You’re underpriced.' },
      { id: 'sting', type: 'line', timed: true, q: 'Hook · the stinging thought. What do they quietly fear or believe?', hint: 'Say it the way they say it to themselves, late at night. Their words, not yours.', ph: 'e.g. If I raise my prices, my clients will leave.' },
      { id: 'question', type: 'line', timed: true, q: 'Hook · the obvious question it leaves in their head.', hint: 'The question they now need answered. If they don’t ask it, they scroll.', ph: 'e.g. So how do you charge more without losing them?' },
      { id: 'beat1', type: 'line', timed: true, q: 'Hold · beat 1 of 3. The first thing that answers it.', hint: 'One full sentence. As you say it, the picture changes: a cut, a zoom, a word on screen. Something moves every 2 to 3 seconds.', ph: 'e.g. Raise it for new clients first. Old clients keep their price for 90 days.' },
      { id: 'beat2', type: 'line', timed: true, q: 'Hold · beat 2 of 3. Then what?', hint: 'One sentence, one new picture.', ph: 'e.g. Say the new price once, then stop talking.' },
      { id: 'beat3', type: 'line', timed: true, q: 'Hold · beat 3 of 3. The proof, or the turn.', hint: 'A real example, a number of your own, or the moment it changed for you. Real only, never invented.', ph: 'e.g. When I did it, two clients left and eleven stayed.' },
      { id: 'value', type: 'line', timed: true, q: 'Value · the one idea they can use today.', hint: 'Said so simply they could repeat it to a friend tonight.', ph: 'e.g. Your price is a decision, not a guess.' },
      { id: 'cta', type: 'line', timed: true, q: 'One call to action. Only one.', hint: 'What they should do in the next ten seconds, said plainly.', ph: 'e.g. Comment PRICE and I’ll send you the checklist.' },
      { id: 'gold', type: 'pick3', q: 'Tap the three words to show in gold.', hint: 'Captions run the whole time. Many people watch with the sound off: three words in gold carry the message for them.' },
    ],
    summary: (a) => { const t = reelTiming(a); return `${t.words} words · about ${Math.round(t.secs)} s`; },
    step: 'Film it once today or tomorrow, as it is, without editing. Then watch it with the sound off: do the three gold words carry it?',
  },
  'branding-structure': {
    key: 'branding-structure', name: 'Branding structure', domain: 'Lead the market', path: '/branding-structure/', kind: 'brand',
    intro: {
      h: 'If they can’t say it, they can’t share it.',
      p: 'Eight short answers, one at a time. You leave with your brand on one page, in your customers’ words, ready to print, and a message to ask three customers: “Is this you?”',
      fine: 'Free, in the Growth Toolkit. Your page stays on this device; with an account, a copy is kept so Alexandru and the team can read it before a session.',
    },
    qs: [
      { id: 'who', type: 'line', q: 'Who do you serve? One kind of person.', hint: 'Name them by what is happening in their week, not by their age.', ph: 'e.g. Owners of small cafés with 3 to 10 staff' },
      { id: 'problem', type: 'line', q: 'Their problem, in their words.', hint: 'Open the messages or emails from a customer and copy a sentence they really wrote. Their words, not yours.', ph: 'e.g. I can’t take one day off without the place falling apart.' },
      { id: 'from', type: 'line', q: 'Where are they now? The “from”.', hint: 'What a normal week looks like for them before you. Something you could see.', ph: 'e.g. Working every weekend, with the team waiting for answers' },
      { id: 'to', type: 'line', q: 'Where do they want to be? The “to”.', hint: 'The week they want, in plain words. Something they would notice on a Monday.', ph: 'e.g. A Saturday off, and the café runs the same' },
      { id: 'proof', type: 'line', q: 'One proof that you can take them there.', hint: 'One is enough: a result, a number, a client’s words. Real only. No proof yet? Write the first one you will collect.', ph: 'e.g. Maria has taken her Sundays off since March.' },
      { id: 'always', type: 'words3', q: 'Three words they should feel about you.', hint: 'Type a word and press Enter. Three in all.', ph: 'e.g. calm' },
      { id: 'never', type: 'words3', q: 'Three words you never want to be called.', hint: 'The words you would hate to read in a review. Type a word and press Enter.', ph: 'e.g. pushy' },
      { id: 'oneliner', type: 'edit', q: 'Your one-liner. Edit it until you’d say it out loud.', hint: 'We drafted it from your answers. Keep it under 20 words, and say it once out loud: does it sound like you?', draft: oneLinerDraft },
    ],
    summary: (a) => clean(a.oneliner).slice(0, 200),
    step: 'Send the message to three customers you have served this week. For every answer that surprises you, change one word on your page.',
  },
};
export const ORDER = Object.keys(WRITERS);
export const writerByKey = (k) => WRITERS[k] || null;
