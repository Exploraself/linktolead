// Builds one review page for everything this session made: every carousel
// (slides, caption, why it works, facts to check, save buttons), the
// LinkedIn and YouTube ideas, the other pieces and the decisions.
//
//   node marketing/carousels/render.mjs --video   first
//   node marketing/carousels/gallery.mjs          then → out/gallery/
import { readdir, writeFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { CTAS } from './lib/template.mjs';
import { LINKEDIN, YOUTUBE, PIECES, DECISIONS } from './extras.mjs';

const here = new URL('./', import.meta.url);
const OUT = new URL('out/', here), G = new URL('gallery/', OUT);
const files = (await readdir(new URL('data/', here))).filter((f) => /^[cp]\d+.*\.mjs$/.test(f))
  .sort((a, b) => (a[0] === b[0] ? a.localeCompare(b) : a[0] === 'p' ? -1 : 1));
const all = [];
for (const f of files) all.push((await import(new URL(`data/${f}`, here))).default);

await rm(G, { recursive: true, force: true });
for (const d of ['s', 'v', 'k']) await mkdir(new URL(`${d}/`, G), { recursive: true });
const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
const list = [];
for (const c of all) {
  const src = new URL(`${c.id}/`, OUT);
  const pngs = (await readdir(src).catch(() => [])).filter((f) => /^[cp]\d+-\d\d\.png$/.test(f)).sort();
  if (pngs.length !== 10) { console.log(`skip ${c.id}: ${pngs.length} slides rendered`); continue; }
  await mkdir(new URL(`s/${c.id}/`, G), { recursive: true });
  for (const p of pngs) ff(['-i', new URL(p, src).pathname, '-q:v', '2', new URL(`s/${c.id}/${p.replace('.png', '.jpg')}`, G).pathname]);
  const video = await stat(new URL(`${c.id}-01.mp4`, src)).then(() => true, () => false);
  if (video) await copyFile(new URL(`${c.id}-01.mp4`, src), new URL(`v/${c.id}-01.mp4`, G));
  ff(['-i', new URL(pngs[0], src).pathname, '-vf', 'scale=432:-1', '-q:v', '4', new URL(`k/${c.id}.jpg`, G).pathname]);
  list.push({ id: c.id, set: c.id[0] === 'p' ? 'premium' : 'history', title: c.title, pillar: c.pillar, cta: CTAS[c.cta].action, why: c.why || '', caption: c.caption, tags: c.tags || [], facts: c.facts || [], video });
}

const J = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
const html = `<title>Tonight 23–29</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,600;1,6..72,500&display=swap">
<style>
/* Layout: one long page in sections: carousels first (a shelf of covers; a cover opens its ten slides), then ideas, pieces and decisions. */
:root{color-scheme:dark;--bg:#0C0906;--panel:#16110B;--line:#3A2E1F;--ink:#F3EBDD;--soft:#CFC3AE;--mute:#9C8F78;--gold:#E2B865;--on-gold:#1A130A;
  --serif:Newsreader,Georgia,'Times New Roman',serif;--sans:Inter,system-ui,-apple-system,'Segoe UI',sans-serif}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:16px/1.55 var(--sans);margin:0}
.wrap{max-width:1180px;margin:0 auto;padding-block:28px 72px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
a{color:var(--gold);overflow-wrap:anywhere}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:6px}
.kick{font:600 12px/1 var(--sans);letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
h1{font:600 clamp(34px,6vw,56px)/1.04 var(--serif);margin:12px 0 10px;text-wrap:balance}
h1 em,h2 em{color:var(--gold);font-style:italic;font-weight:500}
h2.sec{font:600 clamp(26px,4vw,36px)/1.1 var(--serif);margin:56px 0 6px;text-wrap:balance;scroll-margin-top:16px}
.sub{color:var(--soft);max-width:66ch;margin:0 0 18px}
.lede{color:var(--soft);max-width:66ch;margin:0}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0;padding:0;list-style:none}
.toc a{display:inline-flex;align-items:center;min-height:40px;padding:8px 14px;border:1px solid var(--line);border-radius:999px;text-decoration:none;color:var(--soft);font-size:14px}
.toc a:hover{border-color:var(--gold);color:var(--ink)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr));gap:22px 16px}
.card{display:flex;flex-direction:column;gap:9px;text-decoration:none;color:inherit;min-width:0}
.card img{width:100%;max-width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:10px;border:1px solid var(--line);display:block;background:var(--panel)}
.card:hover img{border-color:var(--gold)}
.card .id{font:600 12px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.card h3{font:500 19px/1.2 var(--serif);margin:0;text-wrap:balance}
.ideas{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:14px}
.idea{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:18px 20px;display:flex;flex-direction:column;gap:8px;min-width:0}
.idea h3{font:600 21px/1.2 var(--serif);margin:0}
.idea .f{font:600 12px/1.3 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
.idea .hk{font:500 18px/1.35 var(--serif);font-style:italic;color:var(--ink);margin:2px 0}
.idea p{margin:0;color:var(--soft);font-size:14.5px}
.idea p b{color:var(--ink);font-weight:600}
.rows{display:flex;flex-direction:column;border-top:1px solid var(--line)}
.rowi{display:grid;grid-template-columns:52px 1fr;gap:14px;padding:16px 0;border-bottom:1px solid var(--line)}
.rowi > div{min-width:0}
.rowi .n{font:600 26px/1 var(--serif);color:var(--gold)}
.rowi h3{font:600 19px/1.25 var(--serif);margin:0 0 4px}
.rowi p{margin:0 0 4px;color:var(--soft);font-size:14.5px}
.pill{display:inline-block;font:600 11px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;padding:5px 9px;border-radius:999px;border:1px solid var(--line);color:var(--soft);margin-left:8px;vertical-align:2px}
.pill.ok{border-color:var(--gold);color:var(--gold)}
.dec{counter-reset:d;display:flex;flex-direction:column;gap:10px;padding:0;margin:0;list-style:none}
.dec li{counter-increment:d;border:1px solid var(--line);border-radius:12px;padding:14px 16px 14px 56px;position:relative;background:var(--panel)}
.dec li::before{content:counter(d);position:absolute;left:16px;top:14px;width:26px;height:26px;border-radius:50%;background:var(--gold);color:var(--on-gold);display:grid;place-items:center;font:700 13px/1 var(--sans)}
.dec b{display:block;font:600 16px/1.3 var(--sans);margin-bottom:3px}
.dec span{color:var(--soft);font-size:14.5px}
.back{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:15px;min-height:44px}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px 24px;margin:8px 0 18px}
.head h2{font:600 clamp(26px,4.2vw,42px)/1.06 var(--serif);margin:8px 0 0;text-wrap:balance;max-width:26ch}
.meta{color:var(--mute);font-size:14px}
.strip{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px;scrollbar-color:var(--line) transparent}
.strip figure{margin:0;flex:0 0 min(80vw,400px);scroll-snap-align:start;display:flex;flex-direction:column;gap:8px}
.strip img,.strip video{width:100%;max-width:100%;height:auto;aspect-ratio:4/5;border-radius:10px;border:1px solid var(--line);display:block;background:var(--panel)}
.strip figcaption{font-size:13px;color:var(--mute);font-variant-numeric:tabular-nums}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 6px}
.btn{border:1px solid var(--gold);background:none;color:var(--gold);border-radius:10px;padding:11px 16px;font-weight:600;font-size:15px;cursor:pointer;min-height:44px}
.btn.primary{background:var(--gold);color:var(--on-gold)}
.btn[disabled]{opacity:.5;cursor:default}
.status{min-height:22px;font-size:14px;color:var(--soft);margin:6px 0 0}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:18px;margin-top:20px}
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
<section id="home">
  <div class="kick">ExploraSelf · Sunday 1 Nov 2026 · Claude Code session</div>
  <h1>Tonight 23–29: <em>carousels, ideas, the programme</em></h1>
  <p class="lede">Everything this session made, in one list. Nothing is posted, sent or merged. Open a carousel to see all ten slides, its caption, why it works and the facts to check. Pieces 01–22 are on the main hub: <a href="https://claude.ai/artifact/C91V4bGe4czL5TuQeHn4mZ">https://claude.ai/artifact/C91V4bGe4czL5TuQeHn4mZ</a></p>
  <ul class="toc"><li><a href="#sec-premium">Premium carousels</a></li><li><a href="#sec-history">History and maths</a></li><li><a href="#sec-linkedin">LinkedIn</a></li><li><a href="#sec-youtube">YouTube</a></li><li><a href="#sec-pieces">All pieces</a></li><li><a href="#sec-decisions">Your decisions</a></li></ul>
  <h2 class="sec" id="sec-premium">Premium carousels <em>(story, emotion, reason)</em></h2>
  <p class="sub">Ten new ideas, each built on one object the reader recognises in a glance. Tap a cover.</p>
  <div class="grid" id="g-premium"></div>
  <h2 class="sec" id="sec-history">History and <em>maths</em></h2>
  <p class="sub">Real decisions from history and sums anyone can redo. More appear here as they are finished.</p>
  <div class="grid" id="g-history"></div>
  <h2 class="sec" id="sec-linkedin">LinkedIn <em>ideas</em></h2>
  <p class="sub">New formats; none repeats piece 13. Each says what it needs from you.</p>
  <div class="ideas" id="li"></div>
  <h2 class="sec" id="sec-youtube">YouTube <em>ideas</em></h2>
  <p class="sub">Series formats that sit beside the scripts in pieces 03 and 12.</p>
  <div class="ideas" id="yt"></div>
  <h2 class="sec" id="sec-pieces">All pieces <em>from this session</em></h2>
  <div class="rows" id="pieces"></div>
  <h2 class="sec" id="sec-decisions">Your <em>decisions</em></h2>
  <ol class="dec" id="dec"></ol>
</section>
<section id="viewer" hidden>
  <a class="back" href="#sec-premium">← All carousels</a>
  <div class="head"><div><div class="kick" id="v-kick"></div><h2 id="v-title"></h2></div><div class="meta" id="v-meta"></div></div>
  <div class="strip" id="v-strip" tabindex="0" aria-label="Slides, scroll sideways"></div>
  <div class="actions">
    <button class="btn primary" id="b-slide" type="button">Save slide 1</button>
    <button class="btn" id="b-zip" type="button">Save all ten (.zip)</button>
    <button class="btn" id="b-mp4" type="button">Save moving cover (.mp4)</button>
    <button class="btn" id="b-copy" type="button">Copy caption</button>
  </div>
  <p class="nosave" id="v-nosave" hidden>Saving files works when this page is open on claude.ai or in the Claude app.</p>
  <p class="status" id="v-status" role="status"></p>
  <div class="cols">
    <div class="box"><h3>Caption</h3><p class="cap" id="v-cap"></p><p class="tags" id="v-tags"></p></div>
    <div class="box" id="v-whybox"><h3>Why it works</h3><p class="cap" id="v-why"></p></div>
    <div class="box"><h3>Check before posting</h3><ul id="v-facts"></ul></div>
  </div>
  <nav class="pager" aria-label="Other carousels"><a id="v-prev" href="#"></a><a id="v-next" href="#"></a></nav>
</section>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script>
const C = ${J(list)}, LI = ${J(LINKEDIN)}, YT = ${J(YOUTUBE)}, PC = ${J(PIECES)}, DC = ${J(DECISIONS)};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const link = (s) => esc(s).replace(/https:\\/\\/[^\\s<]+/g, (u) => '<a href="' + u + '">' + u + '</a>');
const nn = (i) => String(i).padStart(2, '0');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const card = (c) => '<a class="card" href="#' + c.id + '"><img src="k/' + c.id + '.jpg" alt="" loading="lazy" width="432" height="540"><span class="id">' + c.id + ' · ' + esc(c.pillar) + '</span><h3>' + esc(c.title) + '</h3></a>';
$('g-premium').innerHTML = C.filter((c) => c.set === 'premium').map(card).join('');
$('g-history').innerHTML = C.filter((c) => c.set === 'history').map(card).join('');
$('li').innerHTML = LI.map((x) => '<div class="idea"><span class="f">' + esc(x.f) + '</span><h3>' + esc(x.t) + '</h3><p class="hk">“' + esc(x.hook) + '”</p><p>' + esc(x.why) + '</p><p><b>Needs:</b> ' + esc(x.need) + '</p></div>').join('');
$('yt').innerHTML = YT.map((x) => '<div class="idea"><span class="f">' + esc(x.f) + '</span><h3>' + esc(x.t) + '</h3><p class="hk">“' + esc(x.hook) + '”</p><p><b>Shape:</b> ' + esc(x.outline) + '</p>' + (x.episodes ? '<p><b>Episodes:</b> ' + esc(x.episodes) + '</p>' : '') + '<p><b>Thumbnail:</b> ' + esc(x.thumb) + '</p><p>' + esc(x.why) + '</p><p><b>Needs:</b> ' + esc(x.need) + '</p></div>').join('');
$('pieces').innerHTML = PC.map((x) => '<div class="rowi"><span class="n">' + esc(x.n) + '</span><div><h3>' + esc(x.t) + '<span class="pill ' + (/Ready/.test(x.state) ? 'ok' : '') + '">' + esc(x.state) + '</span></h3><p>' + link(x.note) + '</p><p>' + link(x.where) + '</p></div></div>').join('');
$('dec').innerHTML = DC.map((x) => '<li><b>' + esc(x.q) + '</b><span>' + esc(x.o) + '</span></li>').join('');

let cur = null, at = 1, dl = null;
const ready = window.claude && window.claude.use ? window.claude.use('downloads') : Promise.resolve(null);
ready.then((d) => { dl = d; saveUI(); }, () => saveUI());
function saveUI() {
  for (const id of ['b-slide', 'b-zip']) $(id).hidden = !dl;
  $('b-mp4').hidden = !dl || !(cur && cur.video);
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
    ? '<video src="v/' + c.id + '-01.mp4" poster="s/' + c.id + '/' + c.id + '-01.jpg" muted autoplay loop playsinline aria-label="Slide 1, moving cover"></video>'
    : '<img src="s/' + c.id + '/' + c.id + '-01.jpg" alt="Slide 1" width="1080" height="1350">';
  $('v-strip').innerHTML = Array.from({ length: 10 }, (_, k) => '<figure>' + (k ? '<img src="s/' + c.id + '/' + c.id + '-' + nn(k + 1) + '.jpg" alt="Slide ' + (k + 1) + '" loading="lazy" width="1080" height="1350">' : first) + '<figcaption>' + (k + 1) + ' / 10' + (k === 0 && c.video ? ' · moving cover' : '') + '</figcaption></figure>').join('');
  $('v-strip').scrollLeft = 0;
  $('v-cap').textContent = c.caption;
  $('v-tags').textContent = c.tags.join(' ');
  $('v-whybox').hidden = !c.why; $('v-why').textContent = c.why;
  $('v-facts').innerHTML = c.facts.length ? c.facts.map((f) => '<li>' + esc(f.claim) + '<small>Check: ' + esc(f.source) + '</small></li>').join('') : '<li>No facts to check: every number is the reader’s own.</li>';
  const i = C.indexOf(c), p = C[i - 1], n = C[i + 1];
  $('v-prev').textContent = p ? '← ' + p.id : ''; $('v-prev').href = p ? '#' + p.id : '#';
  $('v-next').textContent = n ? n.id + ' →' : ''; $('v-next').href = n ? '#' + n.id : '#';
  $('b-slide').textContent = 'Save slide 1'; saveUI(); say('');
}
$('v-strip').addEventListener('scroll', () => {
  const r = $('v-strip'), f = r.querySelector('figure'); if (!f) return;
  const k = Math.min(10, Math.max(1, Math.round(r.scrollLeft / (f.getBoundingClientRect().width + 14)) + 1));
  if (k !== at) { at = k; $('b-slide').textContent = 'Save slide ' + at; }
}, { passive: true });
async function save(name, blob) {
  try { const r = await dl.save({ filename: name, data: blob }); say(r.status === 'saved' ? 'Saved ' + name + '.' : 'Sent ' + name + '.'); }
  catch (e) { const m = { declined: 'Not saved.', rate_limited: 'One save at a time. Try again in a moment.', too_large: 'That file is too large to save here.' }; say(m[e && e.code] || 'This view can’t save files.'); }
}
const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.blob(); });
$('b-slide').addEventListener('click', async () => { if (!cur || !dl) return; const n = cur.id + '-' + nn(at) + '.jpg'; say('Preparing ' + n + '…'); try { save(n, await get('s/' + cur.id + '/' + n)); } catch (e) { say('That slide didn’t load. Try again.'); } });
$('b-mp4').addEventListener('click', async () => { if (!cur || !dl) return; say('Preparing the moving cover…'); try { save(cur.id + '-01.mp4', await get('v/' + cur.id + '-01.mp4')); } catch (e) { say('The video didn’t load. Try again.'); } });
$('b-zip').addEventListener('click', async () => {
  if (!cur || !dl) return;
  if (!window.JSZip) { say('The zip helper didn’t load. Save the slides one by one.'); return; }
  const b = $('b-zip'); b.disabled = true; say('Packing ten slides…');
  try {
    const z = new JSZip(), c = cur;
    for (let k = 1; k <= 10; k++) z.file(c.id + '-' + nn(k) + '.jpg', await get('s/' + c.id + '/' + c.id + '-' + nn(k) + '.jpg'));
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
  $('home').hidden = !!c; $('viewer').hidden = !c;
  if (c) { open(c); window.scrollTo(0, 0); }
  else if (id) { const el = document.getElementById(id); if (el) el.scrollIntoView(); }
}
addEventListener('hashchange', route); route();
</script>
`;
await writeFile(new URL('index.html', G), html);
const count = async (d) => (await readdir(new URL(d, G), { recursive: true })).filter((f) => /\.\w+$/.test(f)).length;
console.log(`gallery: ${list.length} carousels · ${await count('s/')} slides · ${await count('v/')} videos → ${G.pathname}`);
