// Builds the three printed manuals — Building, Growing, Scaling — straight
// from the programme itself, so a manual can never say something the app does
// not. Run: node scripts/make-manuals.mjs
//
// Output: manuals/The-Founders-Blueprint-<Stage>.pdf

import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
// Playwright is installed globally in this environment and resolves through
// CommonJS but not through a bare ESM specifier from this directory.
const { chromium } = createRequire(import.meta.url.replace('/scripts/', '/'))('playwright');
import { DOMAINS, SEVEN, STAGES, LEVELS, gateFor, weekTitle } from '../public/content.js';

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const GATE = { free: 'Free', session: 'Opens with one session', lab: 'Personal Leadership LAB', hub: 'Business Growth HUB' };

function manual(stage) {
  const S = STAGES[stage];
  const levels = LEVELS[stage];

  const contents = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1, e = S.emphasis[i];
    const d = DOMAINS.find((x) => x.k === e);
    return `<tr><td class="n">${String(n).padStart(2, '0')}</td><td>${esc(weekTitle(stage, n))}</td>
      <td class="e">${d ? d.n : 'All four'}</td><td class="g">${GATE[gateFor(n)]}</td></tr>`;
  }).join('');

  const body = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1, L = levels[n];
    if (!L) return '';
    const e = S.emphasis[i];
    const d = DOMAINS.find((x) => x.k === e);
    return `<section class="level">
      <header class="lh">
        <span class="ln">${String(n).padStart(2, '0')}</span>
        <div><p class="eyebrow">Level ${n} · ${esc(S.n)} · emphasis ${d ? d.n.toLowerCase() : 'all four'}</p>
        <h2>${esc(weekTitle(stage, n))}</h2></div>
      </header>
      <div class="promise"><p class="plabel">The promise of this level</p><p class="ptext">${esc(L.promise)}</p></div>
      ${DOMAINS.map((dom) => {
        const D = L[dom.k];
        const lead = dom.k === e;
        return `<div class="domain${lead ? ' lead' : ''}">
          <h3><span class="dk" style="background:${dom.hex}"></span>${dom.n}<small>${esc(D.title)} — ${esc(D.sub)}</small></h3>
          <ol class="steps">${D.steps.map((q, si) => `<li><span class="sn">${SEVEN[si].n}</span><span class="sq">${esc(q)}</span><span class="rule"></span><span class="rule"></span></li>`).join('')}</ol>
        </div>`;
      }).join('')}
      <p class="closer">This level closes when all twenty-eight are answered. Not before.</p>
    </section>`;
  }).join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>The Founder's Blueprint — ${esc(S.n)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Libre+Franklin:wght@400;500;600;700&display=swap">
<style>
@page{size:A4;margin:18mm 16mm 16mm}
*{box-sizing:border-box}
body{margin:0;font:10.5pt/1.6 'Libre Franklin',Arial,sans-serif;color:#2B1B12;background:#fff}
h1,h2,h3{font-family:'Fraunces',Georgia,serif;font-weight:500;margin:0;line-height:1.14}
p{margin:0}
.eyebrow{font:600 7.5pt/1.5 'Libre Franklin';letter-spacing:1.8px;text-transform:uppercase;color:#7A5C16}

.cover{height:245mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always}
.cover .top h1{font-size:40pt;letter-spacing:-1.4px;margin-top:8mm}
.cover .sub{font-family:'Fraunces',Georgia,serif;font-size:17pt;color:#7A5C16;margin-top:5mm}
.cover .lede{margin-top:8mm;max-width:120mm;font-size:11pt;line-height:1.8;color:#4A433A}
.cover .facts{margin-top:10mm;display:flex;flex-wrap:wrap;gap:3mm}
.cover .fact{border:0.4mm solid #DFD3B8;padding:2.5mm 4mm;font:600 8pt 'Libre Franklin'}
.cover .foot{font-size:8.5pt;color:#6B6153;border-top:0.4mm solid #DFD3B8;padding-top:4mm}

.contents{page-break-after:always}
.contents h2{font-size:20pt;margin:3mm 0 6mm}
table{width:100%;border-collapse:collapse;font-size:9.5pt}
td{border-bottom:0.3mm solid #E7DCC7;padding:3mm 2mm;vertical-align:top}
td.n{font-family:'Fraunces',Georgia,serif;font-size:13pt;color:#7A5C16;width:12mm}
td.e{width:26mm;font:600 7.5pt 'Libre Franklin';letter-spacing:1px;text-transform:uppercase;color:#6B6153}
td.g{width:48mm;font:600 7.5pt 'Libre Franklin';letter-spacing:.6px;text-transform:uppercase;color:#7A5C16}

.howto{page-break-after:always}
.howto h2{font-size:20pt;margin:3mm 0 5mm}
.howto p{margin-top:4mm;max-width:140mm;line-height:1.8}
.howto ol{margin:5mm 0 0;padding-left:6mm}
.howto li{margin-bottom:3mm;line-height:1.7}
.howto b{font-weight:600}

.level{page-break-before:always}
.lh{display:flex;gap:6mm;align-items:flex-start;border-top:0.8mm solid #2B1B12;padding-top:4mm;margin-bottom:5mm}
.ln{font-family:'Fraunces',Georgia,serif;font-size:26pt;color:#C9A24A;line-height:1}
.lh h2{font-size:20pt;margin-top:1.5mm}
.promise{background:#F3E9D4;padding:5mm 6mm;margin-bottom:6mm;border-left:1mm solid #C9A24A}
.plabel{font:600 7.5pt 'Libre Franklin';letter-spacing:1.8px;text-transform:uppercase;color:#7A5C16}
.ptext{font-family:'Fraunces',Georgia,serif;font-size:12pt;line-height:1.5;margin-top:2.5mm}

.domain{margin-bottom:6mm}
.domain h3{font-size:13pt;page-break-after:avoid;display:flex;align-items:baseline;gap:3mm;border-bottom:0.4mm solid #DFD3B8;padding-bottom:2.5mm;margin-bottom:3mm}
.domain h3 small{font-family:'Libre Franklin';font-size:8.5pt;font-weight:400;color:#6B6153}
.dk{width:3mm;height:3mm;border-radius:50%;display:inline-block}
.domain.lead h3{border-bottom-width:0.8mm;border-bottom-color:#2B1B12}
.steps{margin:0;padding:0;list-style:none;counter-reset:s}
.steps li{counter-increment:s;padding:2.5mm 0 3.5mm 9mm;position:relative;page-break-inside:avoid}
.steps li::before{content:counter(s);position:absolute;left:0;top:2.5mm;font-family:'Fraunces',Georgia,serif;font-size:11pt;color:#C9A24A}
.sn{display:block;font:600 7pt 'Libre Franklin';letter-spacing:1.4px;text-transform:uppercase;color:#7A5C16}
.sq{display:block;font-family:'Fraunces',Georgia,serif;font-size:11pt;line-height:1.4;margin-top:1mm}
.rule{display:block;border-bottom:0.25mm solid #D8CDB4;height:6.5mm}
.closer{margin-top:4mm;font-size:8.5pt;color:#6B6153;border-top:0.4mm solid #DFD3B8;padding-top:3mm}
</style></head><body>

<section class="cover">
  <div class="top">
    <p class="eyebrow">ExploraSelf · Link to Lead</p>
    <h1>The Founder's<br>Blueprint</h1>
    <p class="sub">${esc(S.n)} — twelve levels, four domains</p>
    <p class="lede">${esc(S.lede)}</p>
    <p class="lede">A founder does not fail at one thing. They run out of clarity in one of four places: who they are, how they handle people, how the work actually runs, and what the market is telling them. This manual works all four, a level at a time, for twelve weeks.</p>
    <div class="facts">
      <span class="fact">12 levels</span><span class="fact">4 domains every level</span>
      <span class="fact">7 clarity points each</span><span class="fact">336 steps</span>
    </div>
  </div>
  <p class="foot">ExploraSelf · A Good People Company · Lead yourself. Grow your business.<br>
  linktolead.exploraself.com · A self-reflection and planning tool, not a diagnosis.</p>
</section>

<section class="contents">
  <p class="eyebrow">${esc(S.n)}</p><h2>The twelve levels</h2>
  <table>${contents}</table>
</section>

<section class="howto">
  <p class="eyebrow">Before the first level</p><h2>How to use this</h2>
  <p>Every level works all four domains and gives one of them the lead. Seven clarity points in each domain, so twenty-eight answers close a level. Twelve levels, twelve weeks.</p>
  <p>The seven are the same every time, going a layer deeper at each level:</p>
  <ol>${SEVEN.map((s) => `<li><b>${s.n}</b> — ${esc(s.why)}</li>`).join('')}</ol>
  <p><b>No step here can be answered by thinking hard.</b> Each one names what to open, what to count and what to write. If you find yourself reflecting rather than looking something up, you have skipped the instruction.</p>
  <p><b>Write in the book.</b> The lines are there because an answer in your head is not an answer. A level closes when all twenty-eight are written, not when you have read them.</p>
  <p><b>One level a week.</b> Faster is not better. The moves have to land in a real week before the next level asks you to look at what happened.</p>
  <p>Where a level says a date, write a real one. Where it asks for a number, go and get the number. That is the whole method.</p>
</section>

${body}
</body></html>`;
}

const hex = { self: '#8C5A3C', people: '#4C6B55', work: '#3E5C78', market: '#8A6A1F' };
DOMAINS.forEach((d) => { d.hex = hex[d.k]; });

await mkdir(new URL('../manuals/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
for (const stage of ['build', 'grow', 'scale']) {
  const page = await browser.newPage();
  await page.setContent(manual(stage), { waitUntil: 'networkidle' });
  const name = `The-Founders-Blueprint-${STAGES[stage].n}.pdf`;
  const out = new URL('../manuals/' + name, import.meta.url);
  await page.pdf({ path: out.pathname, format: 'A4', printBackground: true });
  await page.close();
  console.log('wrote', name);
}
await browser.close();
