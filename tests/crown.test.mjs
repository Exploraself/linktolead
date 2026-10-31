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
done();
