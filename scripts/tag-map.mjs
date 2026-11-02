#!/usr/bin/env node
/* The Mailchimp tag page: every tag ExploraSelf adds, what it means, where it
 * comes from and at which moment it is added, drawn from the code's own list
 * (functions/_tag-list.js), for the people who work at ExploraSelf.
 *
 *   node scripts/tag-map.mjs <out.html> [--exploraself <path to the exploraself repo>]
 *
 * With --exploraself, every tag number that repo's forms add is checked
 * against SITE_TAGS: a number the list does not describe is printed, shown on
 * the page, and the run ends with exit code 2, so it is never missed.
 *
 * AGENTS.md rule 17: a tag added or changed is added to functions/_tag-list.js
 * in the same work, and this page is drawn again into the exploraself repo,
 * in the tags folder beside the email map in the unlisted internal folder
 * (never name that folder in this public repo). Mailchimp cannot rename a
 * tag, only delete it, so a new name is chosen once, with Alexandru. */
import { writeFileSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAG_GROUPS, TAG_LIST, SITE_TAGS, OLD_TAGS } from '../functions/_tag-list.js';

/* Line icons, 24 by 24, in the text colour, hidden from screen readers (rule 13). */
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
export const ICONS = {
  tag: svg('<path d="M3.5 12.6V4.8c0-.7.6-1.3 1.3-1.3h7.8l8 8a1.3 1.3 0 0 1 0 1.8l-7.4 7.4a1.3 1.3 0 0 1-1.8 0Z"/><circle cx="8.3" cy="8.3" r="1.4"/>'),
  people: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .7 3 2.3 3.5 5"/>'),
  door: svg('<path d="M6 20.5V4.8c0-.7.5-1.3 1.2-1.3h9.6c.7 0 1.2.6 1.2 1.3v15.7"/><path d="M3.5 20.5h17"/><circle cx="14.5" cy="12.5" r=".9" fill="currentColor"/>'),
  steps: svg('<path d="M3.5 19.5h5v-4h5v-4h5v-4h2"/><path d="M15.5 4.5h5v5"/>'),
  chart: svg('<path d="M4 20h16"/><path d="M7.5 17v-3M12 17v-5.5M16.5 17V9"/>'),
  star: svg('<path d="M12 2.8 21.2 12 12 21.2 2.8 12Z"/><path d="m12 6.6 1.7 3.7 3.7 1.7-3.7 1.7-1.7 3.7-1.7-3.7L6.6 12l3.7-1.7Z" fill="currentColor" stroke="none"/>'),
  path: svg('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>'),
  book: svg('<path d="M4 5.5c2.5-1 5-1 8 .8 3-1.8 5.5-1.8 8-.8v13c-2.5-1-5-1-8 .8-3-1.8-5.5-1.8-8-.8Z"/><path d="M12 6.3v13"/>'),
  toolkit: svg('<path d="M9 8V6.4c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4V8"/><rect x="3" y="8" width="18" height="12" rx="2.2"/><path d="M12 17.2v-5.4M9.6 14.1 12 11.7l2.4 2.4"/>'),
  mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.8 7.2 8.2 6.2 8.2-6.2"/>'),
  form: svg('<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  bin: svg('<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 13h9l1-13"/><path d="M10.5 10.5v6M13.5 10.5v6"/>'),
  search: svg('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>'),
  rule: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 2"/>'),
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Every tag number the exploraself.com code adds, with the files it is in. */
export function siteTagIds(repo) {
  const found = new Map();
  if (!repo || !existsSync(join(repo, 'src'))) return found;
  const re = /(?:tags=|data-tag=["']|\btag:\s*["']|_MC_TAG\s*=\s*["']|Tags:\s*["']|_TAG_ID\s*=\s*["'])(\d{6,9})/g;
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (f === 'node_modules' || f.startsWith('.') || /^x-[0-9a-f]{10,}$/.test(f)) continue;
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?|html)$/.test(f) && st.size < 3_000_000) {
        const text = readFileSync(p, 'utf8');
        for (const m of text.matchAll(re)) { const set = found.get(m[1]) || new Set(); set.add(relative(repo, p)); found.set(m[1], set); }
      }
    }
  };
  walk(join(repo, 'src'));
  if (existsSync(join(repo, 'public'))) walk(join(repo, 'public'));
  return found;
}

/** The numbers the forms add that SITE_TAGS does not describe. */
export function unknownSiteTags(found) {
  const known = new Set(SITE_TAGS.map((t) => String(t.id)).filter(Boolean));
  return [...found.keys()].filter((id) => !known.has(id)).map((id) => ({ id, files: [...found.get(id)] }));
}

const row = (t, name, form = '') => `<li class="tg" data-find="${esc(`${name} ${form} ${t.what} ${t.fromName || ''} ${t.when}`.toLowerCase())}">
    <div class="nm">${name ? `<span class="chip">${ICONS.tag}${esc(name)}</span>` : ''}${form ? `<span class="form${name ? ' under' : ''}">${ICONS.form}${esc(form)}</span>` : ''}</div>
    <div class="what">${esc(t.what)}</div>
    <div class="kv"><span class="k">Comes from</span><a href="${esc(t.from)}" target="_blank" rel="noopener">${esc(t.fromName || t.from)}</a></div>
    <div class="kv"><span class="k">Added when</span><span>${esc(t.when)}</span></div>
  </li>`;

export function page({ unknown = [], checked = false } = {}, { date = '2 Nov 2026' } = {}) {
  const groups = TAG_GROUPS.filter((g) => g.key !== 'site').map((g) => ({ g, list: TAG_LIST.filter((t) => t.group === g.key) })).filter((x) => x.list.length);
  const site = TAG_GROUPS.find((g) => g.key === 'site');
  const groupHTML = groups.map(({ g, list }) => `<section class="grp" id="g-${g.key}" aria-labelledby="h-${g.key}">
      <h2 id="h-${g.key}"><span class="sic">${ICONS[g.icon] || ICONS.tag}</span><span>${esc(g.name)} <em>${list.length}</em><small>${esc(g.sub)}</small></span></h2>
      <ul class="tags">${list.map((t) => row(t, t.name)).join('')}</ul></section>`).join('');
  const siteHTML = `<section class="grp" id="g-site" aria-labelledby="h-site">
      <h2 id="h-site"><span class="sic">${ICONS.form}</span><span>${esc(site.name)} <em>${SITE_TAGS.length}</em><small>${esc(site.sub)}</small></span></h2>
      <p class="note">Each form adds its own tag by a number, so the code knows the form, not the tag’s name. Mailchimp shows the name Alexandru gave it there; <b>/mentor → Settings → Mailchimp tags</b> shows every one by its name, beside the form it comes from. Never delete one of these.</p>
      <ul class="tags">${SITE_TAGS.map((t) => row(t, t.name || '', t.label)).join('')}</ul>
      ${unknown.length ? `<p class="note warn">A form adds a tag this list does not describe yet: ${unknown.map((u) => esc(u.files.join(', '))).join(' · ')}. Add it to the list in the code.</p>` : ''}</section>`;
  const oldHTML = `<section class="grp" id="g-old" aria-labelledby="h-old">
      <h2 id="h-old"><span class="sic">${ICONS.bin}</span><span>Old names, safe to delete <em>${OLD_TAGS.length}</em><small>No code adds them any more. Deleting a tag only removes the label: the people stay in the audience</small></span></h2>
      <p class="note">Delete them in Mailchimp after <b>/mentor → Settings → Mailchimp</b> shows <b>0 waiting</b>, so every founder already carries the new names. The live list in <b>/mentor → Settings → Mailchimp tags</b> shows exactly which of these your audience still has.</p>
      <ul class="tags old">${OLD_TAGS.map((o) => `<li class="tg" data-find="${esc(`${o.name || o.prefix} ${o.why}`.toLowerCase())}"><div class="nm"><span class="chip">${ICONS.tag}${esc(o.name || `${o.prefix}…`)}</span>${o.prefix ? '<span class="all">every tag that starts like this</span>' : ''}</div><div class="what">${esc(o.why)}</div></li>`).join('')}</ul></section>`;
  const total = TAG_LIST.length + SITE_TAGS.length;
  const strip = [...groups.map(({ g, list }) => [g.key, g.icon, g.name, list.length]), ['site', 'form', site.name, SITE_TAGS.length], ['old', 'bin', 'Old names', OLD_TAGS.length]]
    .map(([k, ic, n, c]) => `<a href="#g-${k}" class="step"><span class="sic">${ICONS[ic]}</span><span class="t">${esc(n)}</span><span class="c">${c}</span></a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Every Mailchimp tag, and where it comes from · ExploraSelf Internal</title>
<link rel="preload" href="../email-map/fonts/newsreader.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../email-map/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<style>
/* Generated by linktolead scripts/tag-map.mjs. Do not edit by hand: change
   functions/_tag-list.js, and run it again (linktolead AGENTS.md rule 17). */
@font-face{font-family:Newsreader;font-style:normal;font-weight:200 800;font-display:swap;src:url(../email-map/fonts/newsreader.woff2) format('woff2')}
@font-face{font-family:Newsreader;font-style:italic;font-weight:200 800;font-display:swap;src:url(../email-map/fonts/newsreader-italic.woff2) format('woff2')}
@font-face{font-family:Inter;font-style:normal;font-weight:100 900;font-display:swap;src:url(../email-map/fonts/inter.woff2) format('woff2')}
:root{--bg:#F7F3EA;--paper:#FFFDF8;--ink:#14100B;--ink2:#3B342A;--muted:#6A6052;--line:#E4DACA;--gold:#B4975F;--gold-ink:#6E5213;--soft:#F1E9D8;--warn:#8A3B12;--warnbg:#F8E6D8;
  --display:Newsreader,Georgia,serif;--body:Inter,system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color-scheme:light}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:84px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{margin:0;background:var(--bg);color:var(--ink);font:15.5px/1.6 var(--body);-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,p{margin:0}
.wrap{max-width:1180px;margin:0 auto;padding:28px max(18px,env(safe-area-inset-left)) 72px}
.eb{font:700 11.5px/1.4 var(--body);letter-spacing:.2em;text-transform:uppercase;color:var(--gold-ink)}
h1{font:500 clamp(32px,5vw,52px)/1.06 var(--display);letter-spacing:-.01em;margin:10px 0 12px;text-wrap:balance}
h1 i{font-weight:400;color:var(--gold-ink)}
.lede{max-width:72ch;color:var(--ink2)}
.facts{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}
.facts span{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--paper);border-radius:999px;padding:6px 12px;font-size:13px;color:var(--ink2)}
.facts svg{width:16px;height:16px;color:var(--gold-ink)}
.rules{margin:22px 0 0;background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:16px 18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 22px}
.rules div{display:grid;grid-template-columns:30px 1fr;gap:10px;align-items:start;font-size:14px;color:var(--ink2)}
.rules b{display:block;color:var(--ink);font-weight:600}
.strip{position:sticky;top:0;z-index:5;margin:26px calc(-1 * max(18px,env(safe-area-inset-left))) 0;padding:10px max(18px,env(safe-area-inset-left));background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.strip::-webkit-scrollbar{display:none}
.step{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:12px;text-decoration:none;color:var(--ink);border:1px solid transparent;font:600 13px/1.25 var(--body)}
.step:hover{background:var(--paper);border-color:var(--line)}
.step .c{font-weight:400;color:var(--muted)}
.step:focus-visible,.tg a:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.sic{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--soft);color:var(--gold-ink);box-shadow:inset 0 0 0 1px var(--line);flex:none}
.sic svg{width:18px;height:18px}
.find{margin:22px 0 0;max-width:520px}
.find label{display:flex;align-items:center;gap:8px;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:0 12px}
.find svg{width:18px;height:18px;color:var(--muted);flex:none}
.find input{flex:1;min-height:44px;border:0;background:none;font:inherit;color:var(--ink);outline:none;min-width:0}
.grp{margin:40px 0 0}
.grp h2{display:flex;align-items:center;gap:12px;font:500 26px/1.15 var(--display);margin:0 0 14px}
.grp h2 em{font:600 13px/1 var(--body);font-style:normal;color:var(--muted);vertical-align:middle}
.grp h2 .sic{width:40px;height:40px;border-radius:12px}
.grp h2 .sic svg{width:22px;height:22px}
.grp h2 small{display:block;font:400 14px/1.4 var(--body);color:var(--muted);margin-top:3px}
.note{color:var(--ink2);background:var(--paper);border:1.5px dashed var(--line);border-radius:14px;padding:12px 16px;margin:0 0 12px;font-size:14px}
.note.warn{color:var(--warn);background:var(--warnbg);border-color:var(--warn)}
.tags{list-style:none;margin:0;padding:0;background:var(--paper);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.tg{display:grid;grid-template-columns:minmax(220px,1.1fr) 1.4fr 1.2fr 1.6fr;gap:6px 18px;padding:12px 16px;border-top:1px solid var(--line);font-size:14px;color:var(--ink2)}
.tg:first-child{border-top:0}
.tags.old .tg{grid-template-columns:minmax(220px,1fr) 2fr}
.chip{display:inline-flex;align-items:center;gap:6px;font:600 13px/1.3 ui-monospace,Menlo,Consolas,monospace;color:var(--ink);background:var(--soft);border-radius:8px;padding:4px 9px;overflow-wrap:anywhere}
.chip svg{width:14px;height:14px;color:var(--gold-ink);flex:none}
.all{display:block;font-size:12px;color:var(--muted);margin-top:4px}
.form{display:inline-flex;align-items:center;gap:6px;font:600 14px/1.3 var(--body);color:var(--ink)}
.form.under{display:flex;margin-top:6px;font-weight:400;font-size:13px;color:var(--muted)}
.form svg{width:15px;height:15px;color:var(--gold-ink);flex:none}
.what{color:var(--ink)}
.kv{display:grid;gap:2px;align-content:start}
.k{font:700 10.5px/1.3 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.kv a{color:var(--gold-ink);overflow-wrap:anywhere}
.hide{display:none !important}
footer{margin-top:48px;color:var(--muted);font-size:13px;border-top:1px solid var(--line);padding-top:16px}
code{font:12.5px/1.4 ui-monospace,Menlo,Consolas,monospace;background:var(--soft);padding:1px 5px;border-radius:5px}
@media (max-width:900px){.tg,.tags.old .tg{grid-template-columns:1fr}.kv{grid-template-columns:96px 1fr;align-items:baseline}}
</style>
</head>
<body>
<div class="wrap">
  <p class="eb">ExploraSelf · Internal · Mailchimp tags · ${esc(date)}</p>
  <h1>Every Mailchimp tag, <i>and where it comes from.</i></h1>
  <p class="lede">For everyone who works at ExploraSelf: what each tag means, which page or form adds it, and at which moment. Drawn from the code that adds them, so it always says what really happens.</p>
  <div class="facts">
    <span>${ICONS.tag}${total} tags in the code</span>
    <span>${ICONS.people}${TAG_LIST.length} from linktolead.exploraself.com</span>
    <span>${ICONS.form}${SITE_TAGS.length} from exploraself.com forms</span>
    <span>${ICONS.bin}${OLD_TAGS.length} old names to delete</span>
  </div>
  <div class="rules">
    <div><span class="sic">${ICONS.tag}</span><span><b>One system for every name</b>linktolead-&lt;group&gt;-&lt;value&gt;, in small letters with dashes, so a tag says what it is. A new name is chosen with Alexandru first.</span></div>
    <div><span class="sic">${ICONS.people}</span><span><b>Facts are fields, not tags</b>Industry, interest and company are contact fields. A tag says what someone did or where they are.</span></div>
    <div><span class="sic">${ICONS.bin}</span><span><b>Mailchimp cannot rename a tag</b>Only delete it. A new name is a new tag, so changing a name means a new tag and deleting the old one.</span></div>
    <div><span class="sic">${ICONS.rule}</span><span><b>Only with their yes</b>Tags are added only for people who said yes to letters. Nobody else is ever sent to Mailchimp.</span></div>
  </div>
  <nav class="strip" aria-label="The groups">${strip}</nav>
  <div class="find"><label>${ICONS.search}<input id="q" type="search" placeholder="Find a tag: a name, a page, a moment" aria-label="Find a tag"></label></div>
  ${groupHTML}
  ${siteHTML}
  ${oldHTML}
  <footer>
    <p>Made by <code>scripts/tag-map.mjs</code> in the linktolead repo, from <code>functions/_tag-list.js</code>${checked ? ', with every tag number in the exploraself.com forms checked' : ''}. A tag added or changed is added to the list in the same work (linktolead AGENTS.md rule 17). Tags set up inside Mailchimp itself are not read here: the live list in /mentor shows them.</p>
  </footer>
</div>
<script>
(function(){
  var q = document.getElementById('q');
  q.addEventListener('input', function(){
    var w = q.value.trim().toLowerCase();
    document.querySelectorAll('.tg').forEach(function(li){ li.classList.toggle('hide', !!w && li.getAttribute('data-find').indexOf(w) < 0 && li.textContent.toLowerCase().indexOf(w) < 0); });
    document.querySelectorAll('.grp').forEach(function(g){ g.classList.toggle('hide', !!w && !g.querySelector('.tg:not(.hide)')); });
  });
})();
</script>
</body>
</html>
`;
}

const here = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === here) {
  const args = process.argv.slice(2);
  const outFile = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--exploraself');
  const exIdx = args.indexOf('--exploraself');
  const exploraself = exIdx >= 0 ? resolve(args[exIdx + 1]) : '';
  if (!outFile) { console.error('Usage: node scripts/tag-map.mjs <out.html> [--exploraself <repo>]'); process.exit(1); }
  const found = siteTagIds(exploraself);
  const unknown = unknownSiteTags(found);
  writeFileSync(outFile, page({ unknown, checked: found.size > 0 }));
  console.log(`${TAG_LIST.length + SITE_TAGS.length} tags, ${OLD_TAGS.length} old names → ${outFile}${found.size ? ` (${found.size} tag numbers checked in exploraself)` : ''}`);
  if (unknown.length) { for (const u of unknown) console.log(`Not on the list: a tag number in ${u.files.join(', ')}`); process.exit(2); }
}
