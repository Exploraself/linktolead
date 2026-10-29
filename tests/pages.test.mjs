// The ladder and the public pages say the same thing everywhere.
//
// Names (The Founder Launchpad, The Boardroom, The Summit), prices ($97, $397,
// $1,989), the Summit tier key, and the two versions of the Compass sales page.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { TIER_ORDER, holds, SECTIONS, LADDER } from '../public/content.js';

let passed = 0, failed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL:', msg); } };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

// The Summit (key 'premium') holds everything, the free levels included.
ok(TIER_ORDER.includes('premium'), 'premium is a tier');
for (const t of ['free', 'session', 'lab', 'hub', 'premium']) ok(holds('premium', t), `premium holds ${t}`);
ok(!holds('hub', 'premium') && holds('hub', 'lab') && !holds('free', 'session'), 'the ladder still reaches from the left');

ok(SECTIONS.map((s) => s.n).join() === 'The Founder Launchpad,The Boardroom,Personal Leadership LAB,Business HUB', 'rail names');
ok(LADDER.find((r) => r.key === 'hub').price === '$397', 'HUB is $397');
ok(LADDER.find((r) => r.key === 'premium').n.startsWith('The Summit'), 'premium shows as The Summit');

// No old prices or names on any public page (the hidden /v2 draft aside).
function files(dir) {
  return readdirSync(new URL('../' + dir, import.meta.url)).flatMap((f) => {
    const p = dir + '/' + f;
    return statSync(new URL('../' + p, import.meta.url)).isDirectory() ? (p.endsWith('/v2') ? [] : files(p)) : /\.(html|js)$/.test(f) ? [p] : [];
  });
}
for (const f of files('public')) {
  const s = read(f);
  ok(!s.includes('$399'), `${f}: no $399`);
  ok(!/Cornerstone|Enter the Incubator|\+ 12 sessions/.test(s), `${f}: no retired names`);
}

// The sales page: B is the main one; A differs only in its hero and titles.
const B = read('public/compass/welcome/index.html'), A = read('public/compass/welcome-a/index.html');
ok(B.includes('Your business, on paper.') && A.includes('What is your business for?'), 'each version has its headline');
const body = (s) => s.slice(s.indexOf('<!-- 1a · HANDSHAKE'));
ok(body(A) === body(B), 'everything after the hero is the same in A and B');
ok(B.includes('[PHOTO OF ALEXANDRU]'), 'photo placeholder kept');

// The Summit page keeps its placeholders until Alexandru fills them.
const Su = read('public/compass/summit/index.html');
for (const ph of ['[YOUR BOOKING LINK]', '[SESSION LENGTH]', '[ONLINE OR IN PERSON]']) ok(Su.includes(ph), `summit keeps ${ph}`);
ok(read('public/compass/app.js').includes('[YOUR PRICE]'), 'Boardroom price placeholder kept');

// Every Compass page carries the favicon and the share image.
for (const f of ['public/compass/index.html', 'public/compass/summit/index.html', 'public/compass/welcome/index.html', 'public/compass/welcome-a/index.html']) {
  const s = read(f);
  ok(s.includes('favicon.svg') && s.includes('og:image') && s.includes('twitter:card'), `${f}: favicon and share image`);
}

// The Link to Lead headline, with its alternate kept.
const L = read('public/index.html');
ok(L.includes('<h1>What is your business <em>for?</em></h1>') && L.includes('Your business, on paper. <em>Not in your head.</em>'), 'landing headline and alternate');

// The four domains are always named in full on screen: no SELF / PEOPLE /
// WORK / MARKET labels, and no Archivo or Libre Caslon left on the sales pages.
for (const f of ['public/compass/index.html', 'public/compass/welcome/index.html', 'public/compass/welcome-a/index.html', 'public/index.html']) {
  const s = read(f);
  ok(!/>\s*(SELF|PEOPLE|WORK|MARKET|YOURSELF|BUSINESS)\s*</.test(s), `${f}: no short domain labels`);
  ok(!/LEAD YOURSELF<\/text>|LEAD THE MARKET<\/text>/.test(s), `${f}: no duplicate small domain lines`);
}
for (const f of ['public/compass/welcome/index.html', 'public/compass/welcome-a/index.html', 'public/compass/welcome/sales.css']) {
  ok(!/Archivo|Caslon/.test(read(f)), `${f}: Compass fonts only`);
}
ok(read('public/compass/welcome/index.html').includes('family=Fraunces') && read('public/compass/welcome/sales.css').includes("url('../assets/libre700.ttf')"), 'sales pages load the Compass fonts the Compass way');
for (const d of ['self', 'people', 'work', 'market']) ok(!/n: '(Self|People|Work|Market)'/.test(read('public/content.js')), 'programme domain names in full');

console.log(`pages: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
