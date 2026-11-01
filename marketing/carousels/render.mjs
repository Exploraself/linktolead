// Renders every carousel in data/ to ten PNG slides of 1080 × 1350,
// a contact sheet per carousel, and (with --video) an MP4 of slide 1
// with its drawing animation. Also writes captions.md and facts.md.
//
//   node marketing/carousels/render.mjs              all carousels
//   node marketing/carousels/render.mjs c01 c07      only these
//   node marketing/carousels/render.mjs --video      also the moving covers
//
// Output goes to marketing/carousels/out/ (ignored by git).
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { CSS, FIT_JS, CTAS, W, H, slideHTML } from './lib/template.mjs';
import { DIAGRAM_CSS, diagramKinds } from './lib/diagrams.mjs';
import { CARD_CSS, cardKinds } from './lib/cards.mjs';
import { artNames } from './lib/art.mjs';
import { PREMIUM_CSS, PREMIUM_FONTS } from './lib/premium.mjs';

const here = new URL('./', import.meta.url);
// Playwright resolves through CommonJS in this environment.
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = new URL('out/', here);
const args = process.argv.slice(2);
const video = args.includes('--video');
const only = args.filter((a) => !a.startsWith('--'));

const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,400;1,6..72,500;1,6..72,600;1,6..72,700;1,6..72,800&display=block';
const photo = `data:image/jpeg;base64,${(await readFile(new URL('../../public/cabinet/alexandru.jpg', here))).toString('base64')}`;

const page = (inner) => `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS}${PREMIUM_FONTS}">
<style>${CSS}${DIAGRAM_CSS}${CARD_CSS}${PREMIUM_CSS}</style></head><body>${inner}<script>${FIT_JS}</script></body></html>`;

// What every carousel must hold before it is drawn.
function lint(c) {
  const e = [];
  if (c.slides?.length !== 10) e.push(`has ${c.slides?.length} slides, not 10`);
  if (!['hook', 'photo', 'poster', 'crayon', 'prompts'].includes(c.slides?.[0]?.type)) e.push('slide 1 is not a hook');
  if (c.slides?.[9]?.type !== 'cta') e.push('slide 10 is not the call to action');
  if (!CTAS[c.cta]) e.push(`unknown cta "${c.cta}"`);
  for (const [i, s] of (c.slides || []).entries()) {
    if (s.type === 'hook' && !s.big && !artNames.includes(s.art)) e.push(`slide ${i + 1}: unknown art "${s.art}"`);
    if (s.d && !diagramKinds.includes(s.d.kind)) e.push(`slide ${i + 1}: unknown diagram "${s.d.kind}"`);
    if (s.card && !cardKinds.includes(s.card.kind)) e.push(`slide ${i + 1}: unknown card "${s.card.kind}"`);
    if (s.card?.kind === 'art' && !artNames.includes(s.card.art)) e.push(`slide ${i + 1}: unknown art "${s.card.art}"`);
  }
  const text = JSON.stringify(c);
  for (const w of ['he ', 'him ', 'his ']) if (new RegExp(`\\b(Alexandru)\\b[^"]{0,40}\\b${w.trim()}\\b`).test(text)) e.push(`"Alexandru … ${w.trim()}": write "Alexandru and the team" or first person`);
  for (const w of [/\bfree\b[^"]{0,30}Unshakeable|Unshakeable[^"]{0,40}\bfree\b/i]) if (w.test(text)) e.push('the Unshakeable assessment is never called free');
  for (const w of [/\bcalculate\b/i]) if (/P\.A\.C\.E/.test(text) && w.test(text)) e.push('P.A.C.E. is Pause, Assess, Choose, Execute');
  return e;
}

const files = (await readdir(new URL('data/', here))).filter((f) => /^[cp]\d+.*\.mjs$/.test(f)).sort();
const all = [];
for (const f of files) all.push((await import(new URL(`data/${f}`, here))).default);
const todo = only.length ? all.filter((c) => only.includes(c.id)) : all;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const report = [];
let bad = 0;

for (const c of todo) {
  const errs = lint(c);
  if (errs.length) { bad++; report.push(`✗ ${c.id}: ${errs.join('; ')}`); continue; }
  const dir = new URL(`${c.id}/`, OUT);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const p = await ctx.newPage();
  await p.setContent(page(c.slides.map((s, i) => slideHTML(c, s, i, 10, photo)).join('')), { waitUntil: 'networkidle' });
  await p.evaluate(async () => { await document.fonts.ready; window.__fit(); });
  await p.evaluate(() => document.getAnimations().forEach((a) => { if (a.effect.getComputedTiming().endTime === Infinity) { a.pause(); a.currentTime = 0; } else a.finish(); }));
  const warn = await p.evaluate(() => window.__check());
  const els = await p.$$('section.slide');
  for (const [i, el] of els.entries()) await el.screenshot({ path: new URL(`${c.id}-${String(i + 1).padStart(2, '0')}.png`, dir).pathname });
  await p.close();
  report.push(`${warn.length ? '!' : '✓'} ${c.id} ${c.title}${warn.length ? `\n    ${warn.join('\n    ')}` : ''}`);

  if (video) {
    const v = await ctx.newPage();
    await v.setContent(page(slideHTML(c, c.slides[0], 0, 10, photo)), { waitUntil: 'networkidle' });
    await v.evaluate(async () => { await document.fonts.ready; window.__fit(); document.getAnimations().forEach((a) => a.pause()); });
    const tmp = new URL('frames/', dir);
    await mkdir(tmp, { recursive: true });
    const fps = 30, secs = 6;
    for (let f = 0; f < fps * secs; f++) {
      await v.evaluate((t) => document.getAnimations().forEach((a) => { a.currentTime = t; }), (f * 1000) / fps);
      await v.screenshot({ path: new URL(`f${String(f).padStart(4, '0')}.jpg`, tmp).pathname, type: 'jpeg', quality: 94 });
    }
    await v.close();
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', new URL('f%04d.jpg', tmp).pathname,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', new URL(`${c.id}-01.mp4`, dir).pathname]);
    await rm(tmp, { recursive: true, force: true });
  }

  // A contact sheet of the ten slides, for reviewing the whole arc at once.
  const sheet = new URL(`${c.id}-sheet.html`, dir);
  await writeFile(sheet, `<!doctype html><body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(5,324px);gap:12px;padding:12px;width:${5 * 324 + 6 * 12}px">${c.slides.map((_, i) => `<img src="${c.id}-${String(i + 1).padStart(2, '0')}.png" style="width:324px;height:405px;display:block">`).join('')}</body>`);
  const sp = await ctx.newPage();
  await sp.setViewportSize({ width: 5 * 324 + 6 * 12, height: 2 * 405 + 3 * 12 });
  await sp.goto(sheet.href);
  await sp.screenshot({ path: new URL(`${c.id}-sheet.jpg`, dir).pathname, type: 'jpeg', quality: 82 });
  await sp.close();
  await rm(sheet);
}
await browser.close();

// Captions and the list of facts to check, from the same data.
const cap = ['# Captions', '', 'One caption per carousel, ready to paste. Check every fact in `facts.md` before posting.', ''];
const fac = ['# Facts to check before posting', '', 'Every historical fact and number used in the carousels, with where to check it. The arithmetic is shown so anyone can redo it.', ''];
for (const c of all) {
  cap.push(`## ${c.id} · ${c.title}`, '', c.caption, '', (c.tags || []).join(' '), '');
  if (c.facts?.length) { fac.push(`## ${c.id} · ${c.title}`, ''); for (const f of c.facts) fac.push(`- ${f.claim}  \n  *Check:* ${f.source}`); fac.push(''); }
}
await writeFile(new URL('captions.md', here), cap.join('\n'));
await writeFile(new URL('facts.md', here), fac.join('\n'));
console.log(report.join('\n'));
console.log(`\n${todo.length - bad} of ${todo.length} rendered${bad ? `, ${bad} refused` : ''} → ${OUT.pathname}`);
process.exitCode = bad ? 1 : 0;
