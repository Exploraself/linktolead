// Builds the review gallery from the rendered slides: one page that shows
// every carousel, its caption and its facts to check, and saves the files
// (a slide, the moving cover, or all ten as a zip) on the viewer's device.
//
//   node marketing/carousels/render.mjs --video   first
//   node marketing/carousels/gallery.mjs          then → out/gallery/
import { readdir, readFile, writeFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { CTAS } from './lib/template.mjs';

const here = new URL('./', import.meta.url);
const OUT = new URL('out/', here), G = new URL('gallery/', OUT);
const files = (await readdir(new URL('data/', here))).filter((f) => /^c\d+.*\.mjs$/.test(f)).sort();
const all = [];
for (const f of files) all.push((await import(new URL(`data/${f}`, here))).default);

await rm(G, { recursive: true, force: true });
for (const d of ['s', 'v', 'k']) await mkdir(new URL(`${d}/`, G), { recursive: true });
const list = [];
for (const c of all) {
  const src = new URL(`${c.id}/`, OUT);
  const pngs = (await readdir(src).catch(() => [])).filter((f) => /^c\d+-\d\d\.png$/.test(f)).sort();
  if (pngs.length !== 10) { console.log(`skip ${c.id}: ${pngs.length} slides rendered`); continue; }
  await mkdir(new URL(`s/${c.id}/`, G), { recursive: true });
  for (const p of pngs) await copyFile(new URL(p, src), new URL(`s/${c.id}/${p}`, G));
  const mp4 = new URL(`${c.id}-01.mp4`, src);
  const video = await stat(mp4).then(() => true, () => false);
  if (video) await copyFile(mp4, new URL(`v/${c.id}-01.mp4`, G));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', new URL(pngs[0], src).pathname, '-vf', 'scale=432:-1', '-q:v', '4', new URL(`k/${c.id}.jpg`, G).pathname]);
  list.push({ id: c.id, title: c.title, pillar: c.pillar, cta: CTAS[c.cta].action, caption: c.caption, tags: c.tags || [], facts: c.facts || [], video });
}

const DATA = JSON.stringify(list).replace(/</g, '\\u003c');
const html = `<title>Founder Carousels</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,600;1,6..72,500&display=swap">
<style>
/* Layout: a shelf of covers; a cover opens its ten slides in a swipe row, with the caption and the facts to check. */
:root{color-scheme:dark;--bg:#0C0906;--panel:#16110B;--line:#3A2E1F;--ink:#F3EBDD;--soft:#CFC3AE;--mute:#9C8F78;--gold:#E2B865;--on-gold:#1A130A;
  --serif:Newsreader,Georgia,'Times New Roman',serif;--sans:Inter,system-ui,-apple-system,'Segoe UI',sans-serif}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:16px/1.5 var(--sans);margin:0}
.wrap{max-width:1180px;margin:0 auto;padding-block:28px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
a{color:var(--gold)}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:6px}
.kick{font:600 12px/1 var(--sans);letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
h1{font:600 clamp(36px,6vw,58px)/1.02 var(--serif);margin:12px 0 10px;text-wrap:balance}
h1 em,h2 em{color:var(--gold);font-style:italic;font-weight:500}
.lede{color:var(--soft);max-width:62ch;margin:0}
.facts{display:flex;flex-wrap:wrap;gap:8px 22px;margin:18px 0 0;padding:0;list-style:none;color:var(--mute);font-size:14px}
.facts b{color:var(--ink);font-variant-numeric:tabular-nums}
.how{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px;margin:26px 0 0;padding:0;list-style:none;counter-reset:h}
.how li{border:1px solid var(--line);border-radius:12px;padding:14px 16px;background:var(--panel);color:var(--soft);font-size:14px;counter-increment:h}
.how li::before{content:counter(h);display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--gold);color:var(--on-gold);font:700 13px/1 var(--sans);margin-right:10px}
.how b{color:var(--ink)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:34px 0 18px}
.chip{border:1px solid var(--line);background:none;border-radius:999px;padding:9px 15px;font-size:14px;color:var(--soft);cursor:pointer;min-height:40px}
.chip[aria-pressed="true"]{background:var(--gold);border-color:var(--gold);color:var(--on-gold);font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,200px),1fr));gap:22px 18px}
.card{display:flex;flex-direction:column;gap:10px;text-decoration:none;color:inherit;min-width:0}
.card img{width:100%;max-width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:10px;border:1px solid var(--line);display:block;background:var(--panel)}
.card:hover img{border-color:var(--gold)}
.card .id{font:600 12px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.card h3{font:500 19px/1.2 var(--serif);margin:0;text-wrap:balance}
/* viewer */
.back{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:15px;min-height:44px}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px 24px;margin:8px 0 18px}
.head h2{font:600 clamp(28px,4.4vw,44px)/1.05 var(--serif);margin:8px 0 0;text-wrap:balance;max-width:24ch}
.meta{color:var(--mute);font-size:14px}
.row{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px;scrollbar-color:var(--line) transparent}
.row figure{margin:0;flex:0 0 min(78vw,400px);scroll-snap-align:start;display:flex;flex-direction:column;gap:8px}
.row img,.row video{width:100%;max-width:100%;height:auto;aspect-ratio:4/5;border-radius:10px;border:1px solid var(--line);display:block;background:var(--panel)}
.row figcaption{font-size:13px;color:var(--mute);font-variant-numeric:tabular-nums}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 6px}
.btn{border:1px solid var(--gold);background:none;color:var(--gold);border-radius:10px;padding:11px 16px;font-weight:600;font-size:15px;cursor:pointer;min-height:44px}
.btn.primary{background:var(--gold);color:var(--on-gold)}
.btn[disabled]{opacity:.5;cursor:default}
.status{min-height:22px;font-size:14px;color:var(--soft);margin:6px 0 0}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:18px;margin-top:22px}
.box{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:18px 20px;min-width:0}
.box h3{font:600 12px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin:0 0 12px}
.cap{white-space:pre-wrap;color:var(--soft);font-size:15px;margin:0;overflow-wrap:anywhere}
.tags{color:var(--mute);font-size:14px;margin:12px 0 0}
.box ul{margin:0;padding-left:18px;color:var(--soft);font-size:14px;display:flex;flex-direction:column;gap:10px}
.box li small{display:block;color:var(--mute);margin-top:3px}
.nosave{color:var(--mute);font-size:14px}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:28px;font-size:15px}
.pager a{min-height:44px;display:inline-flex;align-items:center}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
<div class="wrap">
  <section id="shelf">
    <div class="kick">ExploraSelf · Instagram</div>
    <h1>Founder <em>Carousels</em></h1>
    <p class="lede">Ten slides each, built on one spine: a hook, an example, two pictures, four practical slides, one question. Every number is a fact to check, a sum anyone can redo, or a blank for the reader’s own.</p>
    <ul class="facts"><li><b id="n-c">0</b> carousels</li><li><b id="n-s">0</b> slides, 1080 × 1350</li><li><b id="n-v">0</b> moving covers</li></ul>
    <ol class="how">
      <li><b>Check the facts</b> listed under each carousel before it goes out.</li>
      <li><b>Save the ten slides</b>, or all ten at once as a zip. The moving cover can replace slide 1.</li>
      <li><b>Post them in order</b> at 4:5, then paste the caption.</li>
    </ol>
    <div class="chips" role="group" aria-label="Show carousels by pillar" id="chips"></div>
    <div class="grid" id="grid"></div>
  </section>
  <section id="viewer" hidden>
    <a class="back" href="#">← All carousels</a>
    <div class="head"><div><div class="kick" id="v-kick"></div><h2 id="v-title"></h2></div><div class="meta" id="v-meta"></div></div>
    <div class="row" id="v-row" tabindex="0" aria-label="Slides, scroll sideways"></div>
    <div class="actions" id="v-actions">
      <button class="btn primary" id="b-slide" type="button">Save slide 1</button>
      <button class="btn" id="b-zip" type="button">Save all ten (.zip)</button>
      <button class="btn" id="b-mp4" type="button">Save moving cover (.mp4)</button>
      <button class="btn" id="b-copy" type="button">Copy caption</button>
    </div>
    <p class="nosave" id="v-nosave" hidden>Saving files works when this page is open on claude.ai or in the Claude app.</p>
    <p class="status" id="v-status" role="status"></p>
    <div class="cols">
      <div class="box"><h3>Caption</h3><p class="cap" id="v-cap"></p><p class="tags" id="v-tags"></p></div>
      <div class="box"><h3>Check before posting</h3><ul id="v-facts"></ul></div>
    </div>
    <nav class="pager" aria-label="Other carousels"><a id="v-prev" href="#"></a><a id="v-next" href="#"></a></nav>
  </section>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script>
const C = ${DATA};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nn = (i) => String(i).padStart(2, '0');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
$('n-c').textContent = C.length; $('n-s').textContent = C.length * 10; $('n-v').textContent = C.filter((c) => c.video).length;

const PILLARS = ['All', ...new Set(C.map((c) => c.pillar))];
let pillar = 'All';
try { pillar = localStorage.getItem('pillar') || 'All'; } catch (e) {}
if (!PILLARS.includes(pillar)) pillar = 'All';
function chips() {
  $('chips').innerHTML = PILLARS.map((p) => '<button class="chip" type="button" aria-pressed="' + (p === pillar) + '" data-p="' + esc(p) + '">' + esc(p) + '</button>').join('');
}
function grid() {
  $('grid').innerHTML = C.filter((c) => pillar === 'All' || c.pillar === pillar).map((c) =>
    '<a class="card" href="#' + c.id + '"><img src="k/' + c.id + '.jpg" alt="" loading="lazy" width="432" height="540"><span class="id">' + c.id + ' · ' + esc(c.pillar) + '</span><h3>' + esc(c.title) + '</h3></a>').join('');
}
$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  pillar = b.dataset.p; try { localStorage.setItem('pillar', pillar); } catch (e) {}
  chips(); grid();
});
chips(); grid();

let cur = null, at = 1, dl = null;
const ready = window.claude && window.claude.use ? window.claude.use('downloads') : Promise.resolve(null);
ready.then((d) => { dl = d; saveUI(); }, () => saveUI());
function saveUI() {
  for (const id of ['b-slide', 'b-zip', 'b-mp4']) $(id).hidden = !dl;
  if (cur) $('b-mp4').hidden = !dl || !cur.video;
  $('v-nosave').hidden = !!dl;
}
saveUI();
const say = (t) => { $('v-status').textContent = t; };

function open(c) {
  cur = c; at = 1;
  $('v-kick').textContent = c.id + ' · ' + c.pillar;
  $('v-title').textContent = c.title;
  $('v-meta').textContent = 'Ends with: ' + c.cta;
  const first = c.video && !reduce
    ? '<video src="v/' + c.id + '-01.mp4" poster="s/' + c.id + '/' + c.id + '-01.png" muted autoplay loop playsinline aria-label="Slide 1, moving cover"></video>'
    : '<img src="s/' + c.id + '/' + c.id + '-01.png" alt="Slide 1" width="1080" height="1350">';
  $('v-row').innerHTML = Array.from({ length: 10 }, (_, k) => '<figure>' + (k ? '<img src="s/' + c.id + '/' + c.id + '-' + nn(k + 1) + '.png" alt="Slide ' + (k + 1) + '" loading="lazy" width="1080" height="1350">' : first) + '<figcaption>' + (k + 1) + ' / 10' + (k === 0 && c.video ? ' · moving cover' : '') + '</figcaption></figure>').join('');
  $('v-row').scrollLeft = 0;
  $('v-cap').textContent = c.caption;
  $('v-tags').textContent = c.tags.join(' ');
  $('v-facts').innerHTML = c.facts.length ? c.facts.map((f) => '<li>' + esc(f.claim) + '<small>Check: ' + esc(f.source) + '</small></li>').join('') : '<li>No facts to check: the numbers are the reader’s own.</li>';
  const i = C.indexOf(c), p = C[i - 1], n = C[i + 1];
  $('v-prev').textContent = p ? '← ' + p.id : ''; $('v-prev').href = p ? '#' + p.id : '#';
  $('v-next').textContent = n ? n.id + ' →' : ''; $('v-next').href = n ? '#' + n.id : '#';
  label(); saveUI(); say('');
}
function label() { $('b-slide').textContent = 'Save slide ' + at; }
$('v-row').addEventListener('scroll', () => {
  const r = $('v-row'), f = r.querySelector('figure'); if (!f) return;
  const k = Math.round(r.scrollLeft / (f.getBoundingClientRect().width + 14)) + 1;
  if (k !== at) { at = Math.min(10, Math.max(1, k)); label(); }
}, { passive: true });

async function save(name, blob) {
  try { const r = await dl.save({ filename: name, data: blob }); say(r.status === 'saved' ? 'Saved ' + name + '.' : 'Sent ' + name + '.'); }
  catch (e) {
    const m = { declined: 'Not saved.', rate_limited: 'One save at a time. Try again in a moment.', too_large: 'That file is too large to save here.' };
    say(m[e && e.code] || 'This view can’t save files.');
  }
}
const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.blob(); });
$('b-slide').addEventListener('click', async () => { if (!cur || !dl) return; const n = cur.id + '-' + nn(at) + '.png'; say('Preparing ' + n + '…'); save(n, await get('s/' + cur.id + '/' + n)); });
$('b-mp4').addEventListener('click', async () => { if (!cur || !dl) return; say('Preparing the moving cover…'); save(cur.id + '-01.mp4', await get('v/' + cur.id + '-01.mp4')); });
$('b-zip').addEventListener('click', async () => {
  if (!cur || !dl) return;
  if (!window.JSZip) { say('The zip helper didn’t load. Save the slides one by one.'); return; }
  const b = $('b-zip'); b.disabled = true; say('Packing ten slides…');
  try {
    const z = new JSZip(), c = cur;
    for (let k = 1; k <= 10; k++) z.file(c.id + '-' + nn(k) + '.png', await get('s/' + c.id + '/' + c.id + '-' + nn(k) + '.png'));
    if (c.video) z.file(c.id + '-01.mp4', await get('v/' + c.id + '-01.mp4'));
    z.file('caption.txt', c.caption + '\\n\\n' + c.tags.join(' ') + '\\n');
    z.file('facts-to-check.txt', c.facts.map((f) => '- ' + f.claim + '\\n  Check: ' + f.source).join('\\n') + '\\n');
    await save(c.id + '-carousel.zip', await z.generateAsync({ type: 'blob' }));
  } catch (e) { say('Couldn’t pack the zip. Save the slides one by one.'); }
  b.disabled = false;
});
$('b-copy').addEventListener('click', () => {
  if (!cur) return;
  const t = cur.caption + '\\n\\n' + cur.tags.join(' ');
  const fall = () => { const r = document.createRange(); r.selectNodeContents($('v-cap')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); say('Caption selected: copy it from here.'); };
  try { navigator.clipboard.writeText(t).then(() => say('Caption copied.'), fall); } catch (e) { fall(); }
});

function route() {
  const id = location.hash.slice(1), c = C.find((x) => x.id === id);
  $('shelf').hidden = !!c; $('viewer').hidden = !c;
  if (c) { open(c); window.scrollTo(0, 0); }
}
addEventListener('hashchange', route); route();
</script>
`;
await writeFile(new URL('index.html', G), html);
console.log(`gallery: ${list.length} carousels → ${G.pathname}`);
