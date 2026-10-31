// The Crown: the programme as a notebook. One question at a time, Enter for
// the next, every tool still there (in the Crown), answers saved as before.
import fs from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('crown');
const read = (f) => fs.readFileSync(f, 'utf8');
const app = read('public/app.js'), css = read('public/crown.css'), html = read('public/ground-plan/index.html');

ok(html.includes('/crown.css') && read('public/assets/fonts.css').includes('la-belle-aurore.woff2') && fs.existsSync('public/assets/fonts/la-belle-aurore.woff2'), 'styles linked; the handwriting font is served from this site');
ok(/e\.key === 'Enter' && !e\.shiftKey/.test(app) && app.includes("t.matches('textarea[data-k]')") && app.includes('moveQ(1)'), 'Enter moves to the next question; Shift + Enter stays a new line');
ok(app.includes('enterkeyhint="${i === 6 ? \'done\' : \'next\'}"'), 'a phone keyboard shows Next');
for (const k of ['Levels', 'Library', 'Music', 'Focus', 'Light', 'Ask Alexandru', 'Book 1:1']) ok(app.includes(`'${k}'`), `the Crown keeps ${k}`);
ok(app.includes('M.openPlayer()') && app.includes("M.openPlayer('mp-light')") && app.includes("M.mode('focus')") && read('public/music.js').includes('export function openPlayer('), 'Music, Light and Focus reach the full player');
ok(app.includes('${railHTML(st)}') && app.includes('underHTML(st)') && app.includes('videoBlock(') && app.includes('stageStrip(st)') && app.includes('worksheetHTML(fw, st, level, dom)') && app.includes('domFoot(st, full, gain)'), 'nothing is lost: the levels, the video, the stage, the worksheet, the reading');
ok(/state\.answers\[a\.dataset\.k\] = a\.value;\s*save\(\);\s*account\.touch\('answers', a\.dataset\.k, a\.value\);/.test(app), 'answers save to the device first, then to the account, as before');
ok(css.includes('@media(prefers-reduced-motion:reduce)') && css.includes('@media(max-width:760px)') && css.includes(':root[data-theme="dark"]'), 'reduced motion, the phone and the dark theme');
ok(app.includes("e.key === 'Escape'") && app.includes('aria-expanded'), 'Escape closes; the Crown says whether it is open');
// The North Star: the eight questions as a notebook, keys 1–4 and Enter.
const ns = read('public/northstar/app.js'), nsh = read('public/northstar/index.html'), nsc = read('public/northstar/crown.css');
ok(nsh.includes('crown.css') && nsh.includes("import * as M from '/music.js'"), 'North Star: styles linked, the player available to the Crown');
ok(/\/\^\[1-9\]\$\/\.test\(e\.key\)/.test(ns) && ns.includes('nsMove(1)') && ns.includes("t.closest('#nsb-r')"), 'North Star: number keys choose, Enter moves on, only inside the question');
ok(ns.includes("data-act=\"${pains ? 'pain' : 'want'}\"") && !nsh.includes('id="s-pains"') && ns.includes("getElementById('s-reading')"), 'North Star: what hurts and what you want are pages 09 and 10; See my North Star opens the reading');
ok(nsc.includes('body.ns-qview #banner{opacity:0'), 'North Star: the banner never sits over the questions');
const fs2 = read('public/fullscreen.js');
ok(html.includes('data-fs') && nsh.includes('data-fs') && html.includes('/fullscreen.js') && nsh.includes('/fullscreen.js') && fs2.includes('requestFullscreen') && fs2.includes('b.hidden = true'), 'full screen on both, hidden where the browser cannot');
for (const k of ['Steps', 'Download', 'Music', 'Focus', 'Light', 'Blueprint', 'Book 1:1']) ok(ns.includes(`'${k}'`), `North Star Crown keeps ${k}`);
ok(ns.includes('data-act="ans"') && ns.includes('gated(() => { S.ans[t.dataset.q] = Number(v); })'), 'North Star: answers go through the same path as before');
ok(read('public/music.js').includes('if (opts.quiet) quiet = true;'), 'the player never starts itself on the North Star');
ok(nsc.includes('@media(prefers-reduced-motion:reduce)') && nsc.includes('@media(max-width:760px)') && nsc.includes('.cf[data-theme="dark"] .nsb'), 'North Star: reduced motion, phone, dark');
done();
