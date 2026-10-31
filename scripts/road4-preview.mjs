// Builds /road4/ as one self-contained page, for sharing a preview where the
// site cannot be served (a claude.ai artifact). The stylesheet, the photo and
// the programme data it shows are inlined; the fonts come from Google Fonts;
// the two blocks of page.js marked "@site" are replaced: the data block by the
// same data, taken from the programme files here, and the join block by a note
// saying where the button leads on the live page. Nothing else changes, so
// the preview is the page.
//
// Run: node scripts/road4-preview.mjs <output.html>
import { readFile, writeFile } from 'node:fs/promises';
import { DOMAINS, SEVEN, STAGES, LEVEL_NAMES, gateFor } from '../public/content.js';
import { BUILD } from '../public/levels-build.js';
import { GROW } from '../public/levels-grow.js';
import { SCALE } from '../public/levels-scale.js';

const out = process.argv[2];
if (!out) { console.error('Usage: node scripts/road4-preview.mjs <output.html>'); process.exit(1); }
const read = (p) => readFile(new URL('../public/' + p, import.meta.url), 'utf8');
const SITE = 'https://linktolead.exploraself.com';

// Only what the page shows: every promise, and level one's four domains.
const slim = (L) => Object.fromEntries(Object.entries(L).map(([n, lv]) => [n, n === '1'
  ? { promise: lv.promise, ...Object.fromEntries(DOMAINS.map((d) => [d.k, { title: lv[d.k].title, sub: lv[d.k].sub, steps: lv[d.k].steps }])) }
  : { promise: lv.promise }]));
const DATA = { build: slim(BUILD), grow: slim(GROW), scale: slim(SCALE) };

const data = `const DOMAINS = ${JSON.stringify(DOMAINS.map(({ k, n }) => ({ k, n })))};
const SEVEN = ${JSON.stringify(SEVEN.map(({ k, n, why }) => ({ k, n, why })))};
const STAGES = ${JSON.stringify(Object.fromEntries(Object.entries(STAGES).map(([k, s]) => [k, { n: s.n, emphasis: s.emphasis }])))};
const LEVEL_NAMES = ${JSON.stringify(LEVEL_NAMES)};
const gateFor = ${gateFor.toString()};
const DATA = ${JSON.stringify(DATA)};
const loadStage = (st) => Promise.resolve(DATA[st]);`;

const join = `const joined = false;
function join(e) {
  if (e) e.preventDefault();
  const t = document.getElementById('toast');
  t.textContent = 'This is a preview. On ${SITE.replace('https://', '')}/road4/ this button opens the free sign-up.';
  t.hidden = false;
  clearTimeout(join.t); join.t = setTimeout(() => { t.hidden = true; }, 4200);
}
function wireJoin(a) { a.addEventListener('click', join); }`;

let js = await read('road4/page.js');
const swap = (name, body) => {
  const re = new RegExp(`// @site ${name}\\n[\\s\\S]*?// @end ${name}\\n`);
  if (!re.test(js)) throw new Error(`page.js has no "@site ${name}" block`);
  js = js.replace(re, body + '\n');
};
swap('data', data);
swap('join', join);
js = js.replace(/^export /gm, '');

const css = await read('road4/road4.css');
const photo = (await readFile(new URL('../public/cabinet/alexandru.jpg', import.meta.url))).toString('base64');
let html = await read('road4/index.html');
html = html
  .replace(/<link rel="(icon|preload)"[^>]*>\n/g, '')
  .replace('<link rel="stylesheet" href="/assets/fonts.css">', '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..800&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap">')
  .replace('<link rel="stylesheet" href="/road4/road4.css">', () => `<style>\n${css}</style>`)
  .replace('src="/cabinet/alexandru.jpg"', `src="data:image/jpeg;base64,${photo}"`)
  .replace(/href="\/ground-plan\//g, `href="${SITE}/ground-plan/`)
  .replace('<script type="module" src="/road4/page.js"></script>', () => `<script type="module">\n${js}</script>`)
  .replace(/<!-- The full account form[\s\S]*?-->\n<div id="gate" hidden><\/div>\n/, '');
const left = html.match(/(?:src|href)="\/[^"]*"|import\(/);
if (left) throw new Error(`the preview still points at the site: ${left[0]}`);
await writeFile(out, html);
console.log(`${out}: ${(html.length / 1024).toFixed(0)} KB`);
