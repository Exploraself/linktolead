// The study room's music from the bucket (Alexandru, 4 Nov 2026: "cancel the
// existing music and add 2 categories, classic and modern"). No network: the
// R2 bucket is faked.

import { readFileSync } from 'node:fs';
import { onRequestGet, catOf, titleOf, catalogue, rangeOf, NAMES, named } from '../functions/api/music.js';
import { ROUTES } from '../worker.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('study-music');
const read = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// Which files count, and how they are named.
ok(catOf('Classic/Clair de lune – Debussy.mp3') === 'classic' && catOf('modern/Calm.m4a') === 'modern' && catOf('MODERN/x.ogg') === 'modern', 'the two folders, in any capitals');
ok(catOf('Classic/cover.jpg') === '' && catOf('Other/x.mp3') === '' && catOf('x.mp3') === '' && catOf('Classic/') === '', 'only audio, only in the two folders');
ok(titleOf('Classic/Clair de lune – Debussy.mp3') === 'Clair de lune – Debussy' && titleOf('Modern/Night_drive__slow.mp3') === 'Night drive slow', 'the title is the file name');

// The names on the surface (Alexandru, 4 Nov 2026): the files keep their
// names in the bucket, the founder sees NAMES. These are the eight files
// uploaded on 4 Nov, as /api/music listed them.
const LIVE = {
  classic: ['Classic/1089_1-glen-hoban-by-nc-sa-7b71ae21-6264-40e2-859c-abfc0c3aec2a.mp3', 'Classic/1953_ballade-no-1-in-g-minor-e6a7d761-d26f-49ad-9e0f-e90e02eb5335.mp3', 'Classic/778_bui-nguyen-trieu-tuong-02-adagio-cantabile-de-la-sonate-path__tique-op13-beethoven-f107e37a-ffd9-4a12-a696-56c577692ec9.mp3', 'Classic/Prelude [from cello suite BWV 1007, guitar arr.]-0-Accou - J.S. Bach - Cello Suite No.1 Prelude [BWV 1007]-2045-6889.mp3'],
  modern: ['Modern/mixkit-driving-ambition-32.mp3', 'Modern/mixkit-latin-lovers-39.mp3', 'Modern/mixkit-sports-highlights-51.mp3', 'Modern/mixkit-tech-house-vibes-130.mp3'],
};
const liveBucket = { async list() { return { objects: [...LIVE.classic, ...LIVE.modern].map((key) => ({ key, size: 1 })), truncated: false }; }, async get() { return null; } };
const live = await catalogue(liveBucket);
ok(live.classic.map((p) => p.title).join('|') === 'First Light|Clear Head|Steady Hands|The Long View', 'Classic: four names, in their order');
ok(live.modern.map((p) => p.title).join('|') === 'Countdown|Lift-off|Full Speed|Orbit', 'Modern: a launch, Countdown to Orbit');
ok([...live.classic, ...live.modern].every((p) => !/[0-9a-f]{8}-|mixkit-|_|\.mp3/i.test(p.title) && Object.keys(p).join() === 'key,title'), 'no file name, code or number shows on the surface; no credit line (Alexandru: no need)');
ok(NAMES.every((n) => n.source), 'where each piece came from is kept, for us');
ok(NAMES.length === 8 && new Set(NAMES.map((n) => n.title)).size === 8 && NAMES.every((n) => n.title.split(' ').length <= 3), 'eight different names, three words at most');
ok(named('CLASSIC/MIXKIT-TECH-HOUSE-VIBES-130.MP3').title === 'Countdown' && named('Classic/other.mp3') === null, 'matched by file name, in any capitals');
ok(titleOf('Modern/mixkit-calm-waters-12.mp3') === 'Calm waters' && titleOf('Classic/12_nocturne-in-e-flat-0a1b2c3d-1111-2222-3333-444455556666.mp3') === 'Nocturne in e flat', 'a new upload without a name still reads tidy');

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
M._setLibrary(live); M.set({ cat: 'classic', track: '' });
const lh = M.playerHTML(M.current(), false, true);
ok(lh.includes('<b>First Light</b>') && !lh.includes('Glen Hoban') && lh.includes('<span>The Long View</span>') && !lh.replace(/value="[^"]*"/g, '').includes('glen-hoban'), 'the panel shows the names, nothing else');
ok(/l\[\(i \+ 1\) % l\.length\]/.test(mu) && /addEventListener\('ended', \(\) => next\(\)\)/.test(mu), 'on a loop: at the end of a piece the next one plays, and after the last the first');
M._setLibrary({ classic: [], modern: [] });
ok(M.nowTitle() === 'No music yet' && M.playerHTML(M.current(), false, true).includes('No music on this shelf yet.'), 'an empty shelf says so');
done();
