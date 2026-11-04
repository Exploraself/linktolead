// The study room's music from the bucket (Alexandru, 4 Nov 2026: "cancel the
// existing music and add 2 categories, classic and modern"). No network: the
// R2 bucket is faked.

import { readFileSync } from 'node:fs';
import { onRequestGet, catOf, titleOf, catalogue, rangeOf } from '../functions/api/music.js';
import { ROUTES } from '../worker.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('study-music');
const read = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// Which files count, and how they are named.
ok(catOf('Classic/Clair de lune – Debussy.mp3') === 'classic' && catOf('modern/Calm.m4a') === 'modern' && catOf('MODERN/x.ogg') === 'modern', 'the two folders, in any capitals');
ok(catOf('Classic/cover.jpg') === '' && catOf('Other/x.mp3') === '' && catOf('x.mp3') === '' && catOf('Classic/') === '', 'only audio, only in the two folders');
ok(titleOf('Classic/Clair de lune – Debussy.mp3') === 'Clair de lune – Debussy' && titleOf('Modern/Night_drive__slow.mp3') === 'Night drive slow', 'the title is the file name');

// A fake bucket.
const FILES = {
  'Classic/Gymnopédie No 1 – Satie.mp3': 'satie-bytes-0123456789',
  'Classic/Ballade No 1 – Chopin.mp3': 'chopin',
  'Modern/Slow morning.m4a': 'morning',
  'Modern/notes.txt': 'not music',
  'readme.pdf': 'x',
};
const bucket = {
  async list() { return { objects: Object.keys(FILES).map((key) => ({ key, size: FILES[key].length })), truncated: false }; },
  async get(key, opts) {
    if (!(key in FILES)) return null;
    const body = FILES[key], size = body.length;
    let range;
    const h = opts && opts.range;
    if (h && h.get('range')) { const [, a, b] = /bytes=(\d+)-(\d*)/.exec(h.get('range')); range = { offset: +a, length: (b ? +b : size - 1) - +a + 1 }; }
    const part = range ? body.slice(range.offset, range.offset + range.length) : body;
    return { size, range, httpEtag: '"e"', body: part };
  },
};
const cat = await catalogue(bucket);
ok(cat.classic.map((p) => p.title).join('|') === 'Ballade No 1 – Chopin|Gymnopédie No 1 – Satie' && cat.modern.length === 1 && cat.modern[0].key === 'Modern/Slow morning.m4a', 'the two shelves, sorted, nothing else');
ok((await catalogue(undefined)).classic.length === 0, 'no bucket bound: empty shelves, no error');

const B = 'https://linktolead.exploraself.com';
const list = await (await onRequestGet({ request: new Request(`${B}/api/music`), env: { MUSIC: bucket } })).json();
ok(list.ok && list.classic.length === 2 && list.modern.length === 1, 'GET /api/music lists both shelves');
const none = await onRequestGet({ request: new Request(`${B}/api/music`), env: {} });
ok(none.status === 200 && (await none.json()).classic.length === 0, 'without the binding: 200 and empty');

const key = 'Classic/Gymnopédie No 1 – Satie.mp3';
const full = await onRequestGet({ request: new Request(`${B}/api/music?f=${encodeURIComponent(key)}`), env: { MUSIC: bucket } });
ok(full.status === 200 && full.headers.get('content-type') === 'audio/mpeg' && full.headers.get('accept-ranges') === 'bytes' && (await full.text()) === FILES[key], 'a piece streams whole');
const part = await onRequestGet({ request: new Request(`${B}/api/music?f=${encodeURIComponent(key)}`, { headers: { range: 'bytes=6-10' } }), env: { MUSIC: bucket } });
ok(part.status === 206 && part.headers.get('content-range') === `bytes 6-10/${FILES[key].length}` && (await part.text()) === 'bytes', 'a range for seeking: 206 with Content-Range');
ok(rangeOf({ suffix: 4 }, 10).start === 6 && rangeOf({ offset: 2 }, 10).end === 9, 'suffix and open ranges');
for (const bad of ['readme.pdf', 'Modern/notes.txt', 'Classic/missing.mp3', '../secret.mp3']) {
  const r = await onRequestGet({ request: new Request(`${B}/api/music?f=${encodeURIComponent(bad)}`), env: { MUSIC: bucket } });
  ok(r.status === 404, `only music from the two folders: ${bad} is 404`);
}
ok(ROUTES['/api/music'] && typeof ROUTES['/api/music'].onRequestGet === 'function', 'the route is wired');

// The player.
const mu = read('public/music.js');
ok(!/function engine\(|createOscillator\(\)\.type = 'sawtooth'|setEnergy|mp-energy|TRACKS/.test(mu.replace(/\/\*[\s\S]*?\*\//g, '')), 'the six generated pieces and the Energy slider are gone');
ok(/data-mp-cat/.test(mu) && /fetch\('\/api\/music'\)/.test(mu) && /\/api\/music\?f=/.test(mu), 'Classic | Modern tabs, fed by /api/music');
ok(!/Played live in your browser/.test(mu) && /Music from the ExploraSelf library/.test(mu), 'the panel no longer says the browser plays it');
ok(read('public/cabinet.js').includes('M.nowTitle()') && !read('public/cabinet.js').includes('M.TRACKS'), 'the Cabinet record player shows the piece playing');
ok(read('public/music.css').includes('"cats sls"') && read('public/music.css').includes('.mp-cat[aria-pressed="true"]'), 'the tabs have their place in the panel');
ok(read('wrangler.toml').includes('bound as MUSIC'), 'the binding is written down');

const M = await import('../public/music.js');
ok(M.settings().vol === 55, 'a new browser starts at a gentle volume, not silent');
M._setLibrary({ classic: cat.classic, modern: cat.modern });
ok(M.nowTitle() === 'Ballade No 1 – Chopin' && M.pieces('modern').length === 1, 'the first piece of the shelf is chosen');
M.set({ cat: 'modern' });
ok(M.current().cat === 'modern' && M.nowTitle() === 'Slow morning', 'switching shelf picks that shelf');
M.set({ track: key, cat: 'classic' });
ok(M.nowTitle() === 'Gymnopédie No 1 – Satie', 'a chosen piece');
const html = M.playerHTML(M.current(), false, true);
ok(html.includes('data-mp-cat="classic" aria-pressed="true"') && html.includes('data-mp-cat="modern" aria-pressed="false"') && html.includes('Ballade No 1 – Chopin') && html.includes('Classic · 2 pieces') && !html.includes('Energy'), 'the panel: two tabs, the list, no Energy');
M._setLibrary({ classic: [], modern: [] });
ok(M.nowTitle() === 'No music yet' && M.playerHTML(M.current(), false, true).includes('No music on this shelf yet.'), 'an empty shelf says so');
done();
