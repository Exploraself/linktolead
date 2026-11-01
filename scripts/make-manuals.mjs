// Builds the three printed manuals (Building, Growing, Scaling) straight from
// the programme itself: public/levels-v4.js (Version 4, the one-question flow,
// PLAN4, BUILD4, SESSIONS4). A manual can never say something the app does
// not: every question, option, sentence, "Done when", template and reading
// comes from the same data. Leading reads Scaling.
//
//   node scripts/make-manuals.mjs            the PDFs in manuals/ (not committed) + the sync report
//   node scripts/make-manuals.mjs --library  also replace public/library/blueprint-*.pdf,
//                                            the files founders download
//
// Output:
//   manuals/The-Founders-Blueprint-<Stage>.pdf   (gitignored, to look at)
//   public/library/blueprint-<stage>.pdf         (with --library)
//   docs/manuals-sync.md                         (sync report)

import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
// Playwright resolves through CommonJS in this environment.
const { chromium } = createRequire(import.meta.url.replace('/scripts/', '/'))('playwright');
import { STAGES } from '../public/content.js';
import { LEVELS4, CHAPTERS4, DOMS, DOM_NAMES, PLAN4, BUILD4, SESSIONS4, BLUEPRINT4, CLOSES, READ_QUOTES, fieldsOf } from '../public/levels-v4.js';

const root = new URL('../', import.meta.url);
const two = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = (h) => String(h).replace(/<em>|<\/em>/g, '').replace(/<[^>]+>/g, '');
const HEX = { self: '#8C5A3C', people: '#4C6B55', work: '#3E5C78', market: '#8A6A1F' };
const STAGE_KEY = { build: 'building', grow: 'growing', scale: 'scaling' };
const PARTS = Object.fromEntries(BLUEPRINT4.map((b) => [b.k, b.n]));

/** A line to write on, with a small hint under it. */
const blank = (hint = '', w = 34) => `<span class="bl" style="--w:${w}mm"><i>${esc(hint)}</i></span>`;
/** A template line on paper: {tokens} and ____ become lines to write on. */
const paper = (tpl) => esc(tpl).replace(/\{(\w+)\}/g, () => blank('', 26)).replace(/_{4,}/g, () => blank('', 26));
const rules = (n) => `<div class="rules">${'<i></i>'.repeat(n)}</div>`;

function domainHTML(L, d, stage) {
  const D = L.d[d], p = PLAN4[`${L.n}.${d}`], key = DOMS[d], note = p.stage && p.stage[STAGE_KEY[stage]];
  const sent = D.f.map((x) => (typeof x === 'string' ? esc(strip(x)) : blank(x[1]))).join('');
  return `<section class="dom" id="l${two(L.n)}-${key}" style="--c:${HEX[key]}">
    <h3><span class="lt">${esc(D.l)}</span><span><small>${esc(DOM_NAMES[d])}</small>${esc(D.name)} · <em>${esc(p.topic)}</em></span></h3>
    <p class="ins"><b>Why it matters</b>${esc(p.ins)}</p>
    <ol class="mv">
      <li><b>Tap.</b> ${esc(strip(D.t.q))}<span class="opts">${D.t.o.map((o) => `<span>☐ ${esc(o)}</span>`).join('')}</span></li>
      <li><b>Slide.</b> ${esc(D.s.q)}<span class="scale"><span>${esc(D.s.e[0])}</span><i></i><span>${esc(D.s.e[1])}</span></span><span class="num">My honest number: ${blank('', 22)}</span></li>
      <li><b>Write once.</b><p class="sent">${sent}</p></li>
      ${p.on ? `<li><b>The day.</b> ${esc(p.on.replace(/\{(\w+)\}/g, 'them'))} ${blank('a day', 30)}</li>` : ''}
      <li><b>Done when</b> ${paper(p.done)}<span class="num">How sure am I that it is done by Sunday? ${blank('', 14)} %</span></li>
    </ol>
    ${note ? `<p class="stage"><b>${esc(STAGES[stage].n)}</b> ${esc(note)}</p>` : ''}
    <div class="four"><p class="lbl">Four lines back</p>
      ${[['Where you were', 'Admit it.'], ['Where you struggle', 'Don’t fight it.'], ['Where you shine', 'Don’t ignore it.'], ['What you will do', 'Exactly.']].map(([a, b]) => `<div><b>${a}</b> <i>${b}</i>${rules(1)}</div>`).join('')}</div>
    <div class="keep"><p class="lbl">Yours to keep · goes into your Blueprint: ${esc(PARTS[p.bp] || '')}</p><h4>${paper(p.take[0])}</h4><ol>${p.take.slice(1).map((l) => `<li>${paper(l)}</li>`).join('')}</ol></div>
    <p class="sun"><b>Sunday:</b> ☐ Done &nbsp; ☐ Partly &nbsp; ☐ Not yet &nbsp;·&nbsp; <i>${esc(p.notyet.replace(/\{(\w+)\}/g, '…'))}</i></p>
  </section>`;
}

function weekHTML(L) {
  return `<section class="week"><p class="lbl">Level ${two(L.n)} · your week</p><h3>Four actions, each with its day</h3>
    <table><thead><tr><th></th><th>Domain</th><th>The action, in a few words</th><th>Day</th><th>How sure</th><th>Sunday</th></tr></thead><tbody>
    ${L.d.map((D, d) => `<tr><td>☐ ★</td><td>${esc(DOM_NAMES[d])}</td><td></td><td></td><td>%</td><td>☐ ☐ ☐</td></tr>`).join('')}</tbody></table>
    <p class="tiny">Tick ★ on the domain your North Star marked “Start here”: that one is My one move on your Planner’s Monday page; the other three are your Three goals. Sunday: Done · Partly · Not yet. Ten minutes.</p></section>`;
}

function sessionHTML(S) {
  return `<section class="sess page"><p class="lbl">1:1 with Alexandru and the team</p><h2>Session ${S.n} · ${esc(S.name)}</h2>
    <p><b>When.</b> ${esc(S.at)}.</p><p><b>Bring.</b> ${esc(S.bring)}</p>
    <ol>${S.agenda.map((a) => `<li>${esc(a)}${rules(1)}</li>`).join('')}</ol>
    <p class="done"><b>Done when</b> ${esc(S.done)}</p></section>`;
}

function readingHTML(ci) {
  const C = CHAPTERS4[ci], Q = READ_QUOTES[ci];
  return `<section class="read page"><p class="lbl">${esc(C.n)} reading</p><h2>${esc(C.name)}, read together</h2>
    <div class="rq"><b>Where you were.</b> Add up your slides across the chapter: my lowest domain ${blank('', 40)} my highest ${blank('', 40)}</div>
    <div class="rq"><b>What you did.</b> Done ${blank('', 12)} Partly ${blank('', 12)} Not yet ${blank('', 12)} of ${blank('', 12)} actions checked on Sunday.</div>
    <div class="rq"><b>How you estimate.</b> ○ too hopeful &nbsp; ○ about right &nbsp; ○ too careful <span class="tiny">(the same three words as your Planner’s Sunday page)</span></div>
    <div class="rq"><b>What you believed, what you believe now.</b><ul>${C.lv.map((i) => `<li><s>“${esc(LEVELS4[i].old)}”</s> “${esc(LEVELS4[i].neu)}”</li>`).join('')}</ul></div>
    <div class="rq"><b>Where you began.</b> My North Star said start with ${blank('', 40)}. Now my lowest corner is ${blank('', 40)}.</div>
    <blockquote>“${esc(Q.q)}”<cite>Alexandru · ${esc(Q.src)}</cite></blockquote>
    <div class="rq"><b>Carry one forward.</b> The undone action that matters most: ${rules(1)} By ${blank('a day', 30)}</div></section>`;
}

function buildHTML(lv) {
  const B = BUILD4[lv];
  let body = '';
  if (lv === 5) body = `<p>${esc(B.asks[0][1])}: ${blank('', 70)}</p><p>It starts when ${blank('', 90)}</p>
    <ol class="steps">${Array.from({ length: B.steps }, () => `<li>${rules(1)}</li>`).join('')}</ol><p>${esc(B.who[1])} ${blank('', 60)}</p>`;
  else body = `${B.from.map(([l, d, label]) => `<div class="rq"><b>${esc(label)}</b> <span class="tiny">(Level ${two(l)} · ${esc(LEVELS4[l - 1].d[d].name)})</span>${rules(2)}</div>`).join('')}
    ${B.asks.map(([, q]) => `<div class="rq"><b>${esc(q)}</b>${rules(1)}</div>`).join('')}`;
  return `<section class="build page"><p class="lbl">Build it · goes into your Blueprint: ${esc(PARTS[B.part])}</p><h2>${esc(B.title)}</h2>
    <p class="ins"><b>Why it matters</b>${esc(B.ins)}</p>${body}
    <p>${esc(B.day)} ${blank('a day', 30)}</p>
    <p class="done"><b>Done when</b> ${paper(B.done)}</p></section>`;
}

/** The two ExploraSelf fonts as fixed weights (scripts/fonts/, made from
 *  public/assets/fonts with fontTools; SIL Open Font Licence). Fixed weights
 *  embed as small TrueType subsets; the variable files would print as large
 *  Type 3 fonts. */
async function fonts() {
  const b64 = async (f) => (await readFile(new URL(`scripts/fonts/${f}`, root))).toString('base64');
  const [nr, ni, ir, is] = await Promise.all(['Newsreader-Regular.ttf', 'Newsreader-Italic.ttf', 'Inter-Regular.ttf', 'Inter-SemiBold.ttf'].map(b64));
  return `@font-face{font-family:Newsreader;font-weight:400 500;src:url(data:font/ttf;base64,${nr}) format('truetype')}
@font-face{font-family:Newsreader;font-style:italic;font-weight:400 500;src:url(data:font/ttf;base64,${ni}) format('truetype')}
@font-face{font-family:Inter;font-weight:400 500;src:url(data:font/ttf;base64,${ir}) format('truetype')}
@font-face{font-family:Inter;font-weight:600 700;src:url(data:font/ttf;base64,${is}) format('truetype')}`;
}

function manual(stage, F) {
  const S = STAGES[stage];
  const contents = LEVELS4.map((L) => `<tr><td class="n">${two(L.n)}</td><td><b>${esc(L.word)}</b> · ${esc(L.title)}<br><span class="tiny">${esc(L.promise)}</span></td><td class="c">${esc(CHAPTERS4[L.ch].name)}</td></tr>`).join('');
  const body = LEVELS4.map((L) => {
    const ci = CLOSES[L.n], first = CHAPTERS4[L.ch].lv[0] === L.n - 1;
    return `${first ? `<section class="chap page"><p class="lbl">${esc(CHAPTERS4[L.ch].n)}</p><h1>${esc(CHAPTERS4[L.ch].name)}</h1><p class="lede">${esc(CHAPTERS4[L.ch].about)}</p></section>` : ''}
      ${SESSIONS4.filter((x) => x.after === L.n - 1 && x.n === 1).map(sessionHTML).join('')}
      <section class="level page" id="level-${two(L.n)}">
        <header><span class="no">${two(L.n)}</span><div><p class="lbl">Week ${L.n} · ${esc(L.floor)}</p><h2>${esc(L.word)} · ${esc(L.title)}</h2></div></header>
        <div class="promise"><p class="lbl">By Sunday you will have</p><p>${esc(L.promise)}</p></div>
        <p class="oldnew"><s>“${esc(L.old)}”</s> → “${esc(L.neu)}”</p>
        ${L.n > 1 ? `<div class="last"><p class="lbl">First, last week</p><p>Read last week’s four actions. Each one: ☐ Done ☐ Partly ☐ Not yet. Not done? Take its smaller step this week.</p></div>` : ''}
        ${L.d.map((_, d) => domainHTML(L, d, stage)).join('')}
        ${weekHTML(L)}
      </section>
      ${ci != null ? readingHTML(ci) + buildHTML(L.n) : ''}
      ${SESSIONS4.filter((x) => x.after === L.n && x.n > 1).map(sessionHTML).join('')}`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Founder’s Blueprint · ${esc(S.n)}</title><style>${F}
@page{size:A4;margin:16mm 15mm 15mm}
*{box-sizing:border-box}
body{margin:0;font:9.6pt/1.55 Inter,Arial,sans-serif;color:#2B1B12}
h1,h2,h3,h4{font-family:Newsreader,Georgia,serif;font-weight:500;margin:0;line-height:1.15}
p{margin:0}
.lbl{font:600 7pt/1.5 Inter;letter-spacing:1.6px;text-transform:uppercase;color:#7A5C16}
.tiny{font-size:7.6pt;color:#6B6153}
.page{break-before:page}
.cover{height:250mm;display:flex;flex-direction:column;justify-content:space-between}
.cover h1{font-size:44pt;letter-spacing:-1px;margin-top:10mm}
.cover .sub{font-family:Newsreader;font-style:italic;font-size:18pt;color:#7A5C16;margin-top:4mm}
.cover .lede,.chap .lede{margin-top:7mm;max-width:130mm;font-size:11pt;line-height:1.75;color:#4A433A}
.facts{margin-top:9mm;display:flex;flex-wrap:wrap;gap:2.5mm}.facts span{border:0.35mm solid #DFD3B8;padding:2mm 3.5mm;font:600 7.6pt Inter}
.cover .foot{font-size:8pt;color:#6B6153;border-top:0.35mm solid #DFD3B8;padding-top:3.5mm}
.chap{padding-top:70mm}.chap h1{font-size:36pt;margin-top:3mm}
table{width:100%;border-collapse:collapse}
.contents td{border-bottom:0.3mm solid #E7DCC7;padding:2.4mm 1.5mm;vertical-align:top;font-size:9pt}
td.n{font-family:Newsreader;font-size:14pt;color:#C9A24A;width:11mm}td.c{width:34mm;font:600 7pt Inter;letter-spacing:.8px;text-transform:uppercase;color:#6B6153}
.howto h2,.contents h2{font-size:22pt;margin:2mm 0 5mm}
.howto p,.howto li{max-width:150mm;line-height:1.7;margin-top:2.5mm}
.level header{display:flex;gap:5mm;align-items:flex-start;border-top:0.8mm solid #2B1B12;padding-top:3.5mm;margin-bottom:4mm}
.no{font-family:Newsreader;font-size:30pt;color:#C9A24A;line-height:.9}
.level h2{font-size:21pt;margin-top:1mm}
.promise{background:#F3E9D4;border-left:1mm solid #C9A24A;padding:3.5mm 5mm;margin-bottom:3mm}
.promise p:last-child{font-family:Newsreader;font-size:12pt;line-height:1.45;margin-top:1.5mm}
.oldnew{font-family:Newsreader;font-style:italic;font-size:11pt;color:#4A433A;margin-bottom:3mm}.oldnew s{color:#8A8070}
.last{border:0.3mm dashed #C9A24A;padding:2.5mm 4mm;margin-bottom:4mm;font-size:9pt}
.dom{border-top:0.5mm solid var(--c);padding-top:3mm;margin-top:5mm}
.dom h3,.ins,.lbl{break-after:avoid}
.mv li,.four,.keep,.sun,.ins,.stage,.rq,.week tr{break-inside:avoid}
.dom h3{display:flex;gap:3.5mm;align-items:center;font-size:13.5pt}
.dom h3 small{display:block;font:600 6.8pt Inter;letter-spacing:1.4px;text-transform:uppercase;color:var(--c)}
.dom h3 em{color:#6B6153}
.lt{display:inline-grid;place-items:center;width:9mm;height:9mm;border-radius:1.5mm;background:var(--c);color:#fff;font-family:Newsreader;font-size:14pt;flex:none}
.ins{margin-top:2.5mm;padding:2.5mm 4mm;border-left:0.8mm solid #C9A24A;background:#FBF7EE;font-size:9pt;line-height:1.55}
.ins b{display:block;font:600 6.6pt Inter;letter-spacing:1.3px;text-transform:uppercase;color:#7A5C16}
.mv{margin:3mm 0 0;padding-left:5mm}.mv li{margin-bottom:2.6mm;line-height:1.6}
.opts{display:flex;flex-wrap:wrap;gap:1mm 5mm;margin-top:1mm;font-size:9pt}
.scale{display:flex;align-items:center;gap:3mm;margin-top:1.5mm;font-size:8pt;color:#6B6153}.scale i{flex:1;height:0;border-top:0.4mm solid #C9A24A}
.num{display:block;margin-top:1.2mm;font-size:8.6pt;color:#4A433A}
.sent{font-family:Newsreader;font-size:11.5pt;line-height:2.4;margin-top:.5mm}
.bl{display:inline-block;position:relative;min-width:var(--w);border-bottom:0.3mm solid #2B1B12;height:5mm;vertical-align:-1mm;margin:0 1mm}
.bl i{position:absolute;left:0;top:5.3mm;font:italic 6.4pt/1 Inter;color:#9A8F7E;white-space:nowrap}
.stage{font-size:8.6pt;margin-top:1.5mm}.stage b{margin-right:1.5mm}
.rules i{display:block;height:6.5mm;border-bottom:0.25mm solid #D8CDB4}
.four{margin-top:2.5mm}.four>div{font-size:8.6pt;margin-top:1.5mm}.four i{color:#7A5C16}
.keep{margin-top:3mm;border:0.35mm dashed #C9A24A;border-radius:1.5mm;padding:2.5mm 4mm;background:#FFFDF7}
.keep h4{font-size:11pt;margin:1mm 0}.keep ol{margin:0;padding-left:5mm;font-size:9pt;line-height:2.1}
.sun{margin-top:2.5mm;font-size:8.6pt}.sun i{color:#6B6153}
.week{break-inside:avoid-page;margin-top:6mm;border-top:0.8mm solid #2B1B12;padding-top:3mm}.week h3{font-size:14pt;margin:1mm 0 2mm}
.week th{font:600 6.6pt Inter;letter-spacing:1px;text-transform:uppercase;color:#7A5C16;text-align:left;border-bottom:0.5mm solid #2B1B12;padding:1mm}
.week td{border-bottom:0.25mm solid #D8CDB4;height:10mm;padding:1mm;font-size:8.4pt;vertical-align:middle}
.week td:first-child{width:12mm}.week td:nth-child(2){width:32mm}.week td:nth-child(4){width:22mm}.week td:nth-child(5){width:18mm}.week td:last-child{width:18mm}
.sess h2,.read h2,.build h2{font-size:22pt;margin:1.5mm 0 4mm}
.sess p,.build p{margin-top:2.5mm;font-size:10pt}.sess ol{margin-top:3mm;padding-left:5mm}.sess li{margin-top:2mm}
.done{margin-top:4mm;padding-top:2.5mm;border-top:0.3mm solid #DFD3B8}
.rq{margin-top:4mm;font-size:10pt;line-height:2.2}.rq ul{margin:1mm 0 0;padding-left:5mm;line-height:1.7}.rq s{color:#8A8070;margin-right:2mm}
blockquote{margin:5mm 0 0;padding:1mm 0 1mm 5mm;border-left:0.8mm solid #C9A24A;font-family:Newsreader;font-style:italic;font-size:13pt;line-height:1.45}
cite{display:block;margin-top:1.5mm;font:normal 7.6pt Inter;color:#6B6153}
.steps{padding-left:6mm;margin-top:2mm}
.parts td{border-bottom:0.3mm solid #E7DCC7;padding:2.2mm 1.5mm;font-size:9pt;vertical-align:top}
</style></head><body>
<section class="cover">
  <div><p class="lbl">ExploraSelf · Link to Lead · ${esc(S.n)}</p>
    <h1>The Founder’s<br>Blueprint</h1>
    <p class="sub">Twelve weeks. Four domains. One action plan a week.</p>
    <p class="lede">${esc(S.lede)}</p>
    <p class="lede">Each week has a word, and each letter of the word is one domain: you, your people, your business, your market. In every domain you tap the line that sounds like you, slide to the honest number, write one sentence, and leave with one action, its day, and how you will know on Sunday that it is done.</p>
    <div class="facts"><span>12 levels</span><span>48 actions, each with a day</span><span>3 chapters, 3 readings</span><span>3 pages to build</span><span>${SESSIONS4.length} sessions with Alexandru and the team</span></div></div>
  <p class="foot">ExploraSelf · A Good People Company · Lead yourself. Grow your business.<br>linktolead.exploraself.com · A self-reflection and planning tool, not a diagnosis. The same programme as the app: what you write here, you can write there.</p>
</section>
<section class="howto page"><p class="lbl">Before the first level</p><h2>How to use this</h2>
  <p><b>Inform, reform, transform.</b> Every domain opens with why it matters, ends in one action with a day, and leaves you something to keep in your own words.</p>
  <ol><li><b>Tap.</b> Tick the line that sounds most like you. Honest beats flattering.</li>
    <li><b>Slide.</b> Mark the honest number. Go and look it up if you can: the calendar, the bank statement, the messages.</li>
    <li><b>Write once.</b> One sentence, a few words in each blank. A real name, a real day, a real number.</li>
    <li><b>Done when.</b> How you will know on Sunday. Then: how sure are you, from 0 to 100%?</li>
    <li><b>Four lines back.</b> Where you were (admit it), where you struggle (don’t fight it), where you shine (don’t ignore it), what you will do (exactly).</li></ol>
  <p><b>Every Sunday, ten minutes.</b> Look at last week’s four actions: Done, Partly or Not yet. A no is information, not a verdict. Not done? Take its smaller step. Then write the new week on your Planner’s Monday page.</p>
  <p><b>Your Blueprint.</b> What you keep from each domain goes into one of eight parts: ${BLUEPRINT4.map((b) => esc(b.n)).join(', ')}. After twelve weeks, that is your blueprint, in your own words.</p>
  <p><b>Write in the book.</b> An answer in your head is not an answer.</p></section>
<section class="contents page"><p class="lbl">${esc(S.n)}</p><h2>The twelve weeks</h2><table>${contents}</table></section>
${body}
<section class="page"><p class="lbl">After twelve weeks</p><h2 style="font-size:22pt;margin:1.5mm 0 4mm">Your Blueprint, in eight parts</h2>
  <table class="parts">${BLUEPRINT4.map((b) => `<tr><td style="width:46mm"><b>${esc(b.n)}</b></td><td>${esc(b.about)}<br><span class="tiny">${LEVELS4.flatMap((L) => L.d.map((D, d) => (PLAN4[`${L.n}.${d}`].bp === b.k ? `${two(L.n)} ${D.name}` : '')).filter(Boolean)).join(' · ')}</span></td></tr>`).join('')}</table>
  <p style="margin-top:6mm">Then take the North Star again, and compare where you stand with where you began.</p></section>
</body></html>`;
}

// ── The sync report: every manual says what the app says ──────────────────
function sync() {
  const lines = ['# Manuals sync report', '', '*Written by `node scripts/make-manuals.mjs`. The three manuals are built from `public/levels-v4.js`, so they match the app by construction; this report shows the counts.*', ''];
  const row = (cells) => `| ${cells.join(' | ')} |`;
  lines.push(row(['', 'Building', 'Growing', 'Scaling']), row(['---', '---', '---', '---']));
  const count = (f) => ['build', 'grow', 'scale'].map(f);
  const notes = (st) => Object.values(PLAN4).filter((p) => p.stage && p.stage[STAGE_KEY[st]]).length;
  lines.push(row(['Levels (promise, word, old and new)', ...count(() => `${LEVELS4.length} of 12`)]));
  lines.push(row(['Domains: tap, slide, sentence, four lines', ...count(() => `${LEVELS4.reduce((n, L) => n + L.d.length, 0)} of 48`)]));
  lines.push(row(['Insights, “Done when”, what you keep, smaller steps', ...count(() => `${Object.keys(PLAN4).length} of 48`)]));
  lines.push(row(['Day screens added (the day question)', ...count(() => String(Object.values(PLAN4).filter((p) => p.on).length))]));
  lines.push(row(['Stage notes', ...count((st) => String(notes(st)))]));
  lines.push(row(['Chapter readings, build pages, sessions', ...count(() => `${Object.keys(CLOSES).length}, ${Object.keys(BUILD4).length}, ${SESSIONS4.length}`)]));
  lines.push(row(['Blueprint parts', ...count(() => String(BLUEPRINT4.length))]));
  lines.push('', '## Against the manuals they replace', '',
    '| | The old Library PDFs (27 Oct) | These manuals |', '| --- | --- | --- |',
    '| Method | The earlier seven clarity points, 28 answers a level | Version 4: tap, slide, write once, four lines back |',
    '| Level promises matching the app | 0 of 36 | 36 of 36 |',
    '| Actions with a day and a “Done when” | none | 48 of 48 |',
    '| Built from | `levels-build/grow/scale.js` (old) | `levels-v4.js` (the app) |',
    `| Pages (Building · Growing · Scaling) | 79 · 77 · 80 | ${['build', 'grow', 'scale'].map((st) => PAGES[st]).join(' · ')} |`, '',
    '`node scripts/make-manuals.mjs --library` writes these to `public/library/blueprint-*.pdf`, the files founders download. Run it again whenever `public/levels-v4.js` changes, so the manuals never drift from the app.', '');
  return lines.join('\n');
}

const toLibrary = process.argv.includes('--library');
const F = await fonts();
const out = new URL('manuals/', root);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const LIB = { build: 'blueprint-building.pdf', grow: 'blueprint-growing.pdf', scale: 'blueprint-scaling.pdf' };
const PAGES = {};
for (const stage of ['build', 'grow', 'scale']) {
  const page = await browser.newPage();
  await page.setContent(manual(stage, F), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const name = `The-Founders-Blueprint-${STAGES[stage].n}.pdf`, file = new URL(name, out);
  await page.pdf({ path: file.pathname, format: 'A4', printBackground: true, outline: true, tagged: false,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font:7px Helvetica,Arial,sans-serif;color:#8A8070;padding:0 15mm;display:flex;justify-content:space-between"><span>The Founder’s Blueprint · ${STAGES[stage].n}</span><span class="pageNumber"></span></div>`,
    margin: { top: '16mm', bottom: '16mm', left: '15mm', right: '15mm' } });
  await page.close();
  console.log('wrote', file.pathname.replace(root.pathname, ''));
  PAGES[stage] = ((await readFile(file)).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (toLibrary) { await copyFile(file, new URL(`public/library/${LIB[stage]}`, root)); console.log('  replaced public/library/' + LIB[stage]); }
}
await browser.close();
// The library shelf states each manual's page count: keep it true to the files just written.
if (toLibrary) {
  const VOL = { build: 'I', grow: 'II', scale: 'III' };
  const contentJs = new URL('public/content.js', root), cabinetJs = new URL('public/cabinet.js', root);
  let c = await readFile(contentJs, 'utf8'), k = await readFile(cabinetJs, 'utf8');
  for (const st of Object.keys(LIB)) {
    c = c.replace(new RegExp(`pages: \\d+, file: '/library/${LIB[st]}'`), `pages: ${PAGES[st]}, file: '/library/${LIB[st]}'`);
    k = k.replace(new RegExp(`'Volume ${VOL[st]} · \\d+ pages'`), `'Volume ${VOL[st]} · ${PAGES[st]} pages'`);
  }
  await writeFile(contentJs, c); await writeFile(cabinetJs, k);
  console.log('page counts set:', Object.entries(PAGES).map(([s, n]) => `${s} ${n}`).join(', '));
}
await writeFile(new URL('docs/manuals-sync.md', root), sync());
console.log('wrote docs/manuals-sync.md');
