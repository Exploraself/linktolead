// The two writing tools of the Growth Toolkit (Alexandru's GO, 2 Nov 2026):
// Reel structure and Branding structure. One field per screen; every line of
// the result is the founder's own words, timed or put in order.

import { readFileSync } from 'node:fs';
import { tally } from './_d1.mjs';
import { WRITERS, ORDER, REEL_PARTS, WPM, reelTiming, reelScript, reelScriptLabelled, teleprompterHref, goldCandidates, oneLinerDraft, askMessage, splitWords, clock } from '../public/tools/writer-data.js';
import { CATALOG } from '../public/tools/catalog.js';
import { TOOL_LIST } from '../functions/_tools.js';
import { TOOLKIT_BY_TOOL, TOOLKIT_OFFERS, toolsWelcome, toolkitCodeLetter } from '../functions/_letters.js';
import { TOOLKIT_PREVIEW } from '../functions/api/toolkit.js';

const { ok, done } = tally('writer-tools');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

// ── Wiring: catalog, server list, pages, letters ────────────────────────────
ok(JSON.stringify(ORDER) === JSON.stringify(['reel-structure', 'branding-structure']), 'two writing tools: Reel structure, Branding structure');
for (const k of ORDER) {
  const w = WRITERS[k], c = CATALOG.find((x) => x.key === k);
  ok(c && !c.soon && c.href === `/${k}/` && c.name === w.name, `${k}: a real cover on the Tools page, no longer “Being built”`);
  ok(c.domain === 'market' && c.category === 'business', `${k}: Lead the market, in the Business list`);
  ok(TOOL_LIST[k] && TOOL_LIST[k].name === w.name, `${k}: the server knows it by the same name`);
  ok(TOOLKIT_OFFERS[TOOLKIT_BY_TOOL[k]], `${k}: its welcome letter has a free P.S. matched to it`);
  const h = read(`public/${k}/index.html`);
  ok(h.includes(`data-tool="${k}"`) && h.includes('<script type="module" src="/tools/writer.js"></script>'), `${k}: its page runs writer.js`);
  ok(h.includes(`<nav class="tk-crumb" aria-label="You are here"><a href="/tools/">Growth Toolkit</a><span aria-hidden="true">›</span><span aria-current="page">${w.name}</span></nav>`), `${k}: Growth Toolkit › ${w.name}`);
  ok(/<nav class="tk-nav"[^>]*>[\s\S]*?href="\/tools\/"[\s\S]*?href="\/ground-plan\/"[\s\S]*?href="\/northstar\/"/.test(h), `${k}: All tools · Base Camp · North Star`);
  ok(h.includes(`<link rel="canonical" href="https://linktolead.exploraself.com/${k}/">`), `${k}: its own address`);
  ok(/^Free, in the Growth Toolkit\./.test(w.intro.fine), `${k}: the fine print names the Growth Toolkit`);
  ok(w.qs.every((q) => q.q && q.hint), `${k}: every screen asks one thing and says how to answer`);
  ok(w.qs.filter((q) => q.ph).every((q) => /^e\.g\. /.test(q.ph)), `${k}: every example is marked as one (e.g.), never a real founder`);
}
ok(TOOLKIT_PREVIEW[1][1].join() === 'Cash runway,Teleprompter,Reel structure,Branding structure', 'the code letter lists the two new tools');
for (const L of [toolsWelcome('https://x', { first: 'Sam' }), toolkitCodeLetter('https://x', { first: 'Sam', code: '5689', url: 'https://x/tools/', tools: TOOLKIT_PREVIEW })]) {
  ok(/reads your own answers/.test(L.text) && !/reads your own numbers/.test(L.text), `${L.subject}: “your own answers” (two tools are words, not numbers)`);
}
ok(/Reel structure · Branding structure/.test(toolkitCodeLetter('https://x', { first: 'Sam', code: '5689', url: 'u', tools: TOOLKIT_PREVIEW }).text), 'the code letter names them');
ok(read('public/mentor/mentor.js').includes("'reel-structure': 'Reel structure', 'branding-structure': 'Branding structure'"), '/mentor names them');
const css = read('public/tools/tools.css');
ok(/@media print\{\s*body:has\(\.printpage\)/.test(css) && !/@media print\{\s*body \*/.test(css), 'print rules only touch pages with a printable part (the number tools print as before)');
for (const f of ['public/tools/writer-data.js', 'public/tools/writer.js', 'public/reel-structure/index.html', 'public/branding-structure/index.html']) {
  const s = read(f).replace(/\/\/.*$/gm, '');
  ok(!/most founders|incubator|constellation|\bcompass\b|launchpad/i.test(s), `${f}: no banned words`);
}

// ── Reel structure: the seconds come from their own words ───────────────────
const reel = {
  who: 'A café owner who works every Saturday', grab: 'You’re not busy. You’re underpriced.', sting: 'If I raise my prices, my clients will leave.',
  question: 'So how do you charge more without losing them?', beat1: 'Raise it for new clients first. Old clients keep their price for 90 days.',
  beat2: 'Say the new price once, then stop talking.', beat3: 'When I did it, two clients left and eleven stayed.', value: 'Your price is a decision, not a guess.',
  cta: 'Comment PRICE and I’ll send you the checklist.', gold: ['underpriced', 'price', 'decision'],
};
ok(WPM === 140 && read('public/teleprompter/index.html').includes('w / 140'), 'the same calm pace as the Teleprompter: 140 words a minute');
ok(REEL_PARTS.reduce((n, p) => n + p.max, 0) === 40, 'the parts add up to 40 seconds: grab 3, hook, three beats, value, one call to action');
let T = reelTiming(reel);
ok(T.words === 71 && Math.abs(T.secs - 71 * 60 / 140) < 0.06, 'reel: 71 words ≈ 30.4 s');
ok(T.parts.every((p, i) => i === 0 || Math.abs(p.from - T.parts[i - 1].to) < 1e-9) && T.parts[0].from === 0, 'reel: each part starts where the last ended');
ok(T.parts[0].words === 5 && !T.parts[0].note, 'reel: a 5-word grab fits in 3 seconds');
ok(T.parts[1].words === 18 && T.parts[1].note === 'About 8 s: aim for 6. Cut about 4 words.', 'reel: a long hook says how many words to cut');
ok(T.verdict.ok && /Inside 30 to 40 seconds/.test(T.verdict.line), 'reel: inside 30–40 s');
const long = { ...reel, beat1: reel.beat1 + ' ' + 'and one more word here '.repeat(8) };
T = reelTiming(long);
ok(!T.verdict.ok && /over 40/.test(T.verdict.h) && /Cut about \d+ words/.test(T.verdict.line) && /hold · 1/.test(T.verdict.line), 'reel: over 40 s names the words to cut and the part that runs longest');
ok(reelTiming({ who: 'x', grab: 'One two three.' }).verdict.line.startsWith('Under 30 seconds'), 'reel: short is fine, said plainly');
ok(clock(0) === '0:00' && clock(29.6) === '0:30' && clock(65) === '1:05', 'clock: m:ss');
const script = reelScript(reel);
ok(script.split('\n\n').length === 7 && script.startsWith('You’re not busy.') && script.endsWith('checklist.'), 'reel: the script is one paragraph per part, in order');
ok(/^GRAB \(0:00–0:02\)\nYou’re not busy/.test(reelScriptLabelled(reel)), 'reel: the copied script carries its labels and seconds');
const href = teleprompterHref(reel), hp = new URLSearchParams(href.split('#')[1]);
ok(href.startsWith('/teleprompter/#t=') && hp.get('s') === script && hp.get('t') === 'Reel · A café owner who works every Saturday', 'reel: the Teleprompter button opens this script (#t= &s=)');
const gc = goldCandidates(reel);
ok(gc.includes('underpriced') && gc.includes('price') && !gc.includes('PRICE') && !gc.includes('the') && !gc.includes('your'), 'gold: their own words, each once, no small words');
ok(gc.indexOf('busy') === 0, 'gold: in the order they say them');

// ── Branding structure ─────────────────────────────────────────────────────
const brand = { who: 'Owners of small cafés with 3 to 10 staff', problem: '“I can’t take one day off without the place falling apart.”', from: 'Working every weekend', to: 'A Saturday off, and the café runs the same.', proof: 'Maria has taken her Sundays off since March.' };
ok(oneLinerDraft(brand) === 'I help owners of small cafés with 3 to 10 staff go from working every weekend to a Saturday off, and the café runs the same.', 'one-liner drafted from their own answers');
ok(oneLinerDraft({ who: 'CEOs of family firms', from: 'I decide everything', to: 'SaaS that runs' }) === 'I help CEOs of family firms go from I decide everything to SaaS that runs.', 'one-liner: acronyms and “I” keep their capitals');
ok(oneLinerDraft({}) === '', 'one-liner: nothing to draft without who they serve');
const m = askMessage(brand, 'Maria');
ok(m.startsWith('Hi [name], a quick one.') && m.includes('Is this you?') && m.includes('“I can’t take one day off without the place falling apart.”') && m.endsWith('Maria'), 'ask three customers: their words, a name to fill in, signed by the founder');
ok(!/““|””/.test(m), 'ask: quote marks never doubled');
ok(JSON.stringify(splitWords('calm, clear  honest')) === '["calm","clear","honest"]', 'three words: commas or spaces');
ok(WRITERS['branding-structure'].qs.find((q) => q.type === 'edit').draft === oneLinerDraft, 'the one-liner screen opens with the draft, to edit');
ok(WRITERS['branding-structure'].summary({ oneliner: 'x'.repeat(300) }).length === 200, 'Tools page summary: the one-liner, at most 200 characters');

// ── What reaches the account fits what the server keeps (4,000 characters) ──
for (const k of ORDER) {
  const a = {};
  for (const q of WRITERS[k].qs) a[q.id] = q.type === 'pick3' || q.type === 'words3' ? ['w'.repeat(30), 'w'.repeat(30), 'w'.repeat(30)] : 'é'.repeat(200);
  ok(JSON.stringify(a).length <= 4000, `${k}: every field at its longest still fits the account copy`);
}
ok(/maxlength="200" data-text/.test(read('public/tools/writer.js')), 'each line is capped at 200 characters');

done();
