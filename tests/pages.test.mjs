// The ladder and the public pages say the same thing everywhere.
//
// Names (The Founder Launchpad, The Boardroom, The Summit), prices ($97, $397,
// $1,989), the Summit tier key, and Road 2, the North Star sales page.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { TIER_ORDER, holds, SECTIONS, LADDER, LIBRARY } from '../public/content.js';
import { markup, items } from '../public/north3/kit.js';
import { ALL_STEP_IDS } from '../functions/_plans.js';
import { onRequestGet as plansGet } from '../functions/api/plans.js';

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

// Road 2, the North Star sales page (/compass/welcome-a, its old version A, is a
// redirect to it now).
const B = read('public/north3/index.html');
ok(B.includes('Your business, on paper.'), 'Road 2 has its headline');
ok(B.includes('[PHOTO OF ALEXANDRU]'), 'photo placeholder kept');

// The Summit page keeps its placeholders until Alexandru fills them.
const Su = read('public/northstar/summit/index.html');
for (const ph of ['[SESSION LENGTH]', '[ONLINE OR IN PERSON]']) ok(Su.includes(ph), `summit keeps ${ph}`);
ok(!Su.includes('[YOUR BOOKING LINK]') && (Su.match(/data-join/g) || []).length >= 3 && /landing: 'summit'/.test(Su) && /variant: 'full'/.test(Su), 'summit: every call to action opens the full account form (landing summit)');
ok(read('public/northstar/app.js').includes('[YOUR PRICE]'), 'Boardroom price placeholder kept');

// Every North Star page carries the favicon and the share image.
for (const f of ['public/northstar/index.html', 'public/northstar/summit/index.html', 'public/north3/index.html']) {
  const s = read(f);
  ok(s.includes('favicon.svg') && s.includes('og:image') && s.includes('twitter:card'), `${f}: favicon and share image`);
}

// The Link to Lead headline, with its alternate kept.
const L = read('public/road1/index.html');
ok(L.includes('<h1>What is your business <em>for?</em></h1>') && L.includes('Your business, on paper. <em>Not in your head.</em>'), 'landing headline and alternate');

// The four domains are always named in full on screen: no SELF / PEOPLE /
// WORK / MARKET labels, and no Archivo or Libre Caslon left on the sales pages.
for (const f of ['public/northstar/index.html', 'public/north3/index.html', 'public/road1/index.html']) {
  const s = read(f);
  ok(!/>\s*(SELF|PEOPLE|WORK|MARKET|YOURSELF|BUSINESS)\s*</.test(s), `${f}: no short domain labels`);
  ok(!/LEAD YOURSELF<\/text>|LEAD THE MARKET<\/text>/.test(s), `${f}: no duplicate small domain lines`);
}
for (const f of ['public/north3/index.html', 'public/north3/sales.css']) {
  ok(!/Archivo|Caslon/.test(read(f)), `${f}: North Star fonts only`);
}
// Fonts load once, from this site: no Google Fonts, no old .ttf files.
for (const f of ['public/road1/index.html', 'public/ground-plan/index.html', 'public/mentor/index.html', 'public/northstar/index.html', 'public/northstar/summit/index.html', 'public/north3/index.html']) {
  const s = read(f);
  ok(s.includes('href="/assets/fonts.css"') && !s.includes('fonts.googleapis.com') && s.includes('rel="preload" href="/assets/fonts/newsreader.woff2"'), `${f}: fonts once, self-hosted, preloaded`);
}
for (const f of ['public/northstar/style.css', 'public/north3/sales.css', 'public/style.css']) ok(!/\.ttf|googleapis/.test(read(f)), `${f}: no duplicate font source`);
for (const d of ['self', 'people', 'work', 'market']) ok(!/n: '(Self|People|Work|Market)'/.test(read('public/content.js')), 'programme domain names in full');

// PR 3: breathing space, the lab, then the dawn before The Summit.
const C = read('public/northstar/index.html');
const at = (id) => C.indexOf(id);
ok(at('id="s-whatif"') < at('id="s-save"') && at('id="s-save"') < at('id="s-next"') && at('id="s-next"') < at('id="s-options"'), 'round 4: the lab, then your card, then one next step');
ok(at('id="s-options" hidden') > 0 && at('id="s-options"') < at('id="s-weeks"') && at('id="s-weeks"') < at('id="s-climb"') && at('id="s-climb"') < at('id="s-summit"') && !C.includes('id="s-dawn"'), 'round 4: the twelve weeks, the climb and The Summit sit behind "See all options"');
ok(C.includes('Move one of four levers and watch your cash, clients, time and people answer.'), 'lab header copy');
ok(C.includes('Open the Founder Launchpad · free') && (C.match(/class="go nsnext-go/g) || []).length === 1, 'round 4: one ending, one button');
const LAB = read('public/northstar/app.js') + read('public/northstar/engine.js');
ok(!/\$250|price: 250|n: 20, price/.test(LAB), 'no example month shipped');
for (const t of ['Go on, move a lever. Then make it yours.', 'function labNudge(', 'Take me there ↑', 'Give me back time', 'Give me more money', 'Fine-tune (optional)', 'Each sale takes fewer hours']) ok(LAB.includes(t), `lab copy: ${t}`);
ok(read('public/northstar/dawn.js').includes('prefers-reduced-motion'), 'dawn respects reduced motion');

// PR 5: "What opens with your free account", on Road 2, right after
// "A look inside" and right before "Decide what winning is for."
for (const [name, P] of [['road2', B]]) {
  const look = P.indexOf('A LOOK INSIDE'), kit = P.indexOf('WHAT OPENS WITH YOUR FREE ACCOUNT'), fin = P.indexOf('Decide what winning is for.');
  ok(look > 0 && kit > look && fin > kit, `${name}: the section sits after A look inside, before the final band`);
  ok(P.indexOf('id="kit-body" data-lazy') > kit && P.indexOf('id="kit-body"') < fin, `${name}: its body is filled in place by kit.js`);
  ok(P.includes('<h2 class="h2">You practised with a few sliders. Here is the whole kit.</h2>'), `${name}: headline`);
  ok(P.includes('One free account opens everything below. Your answers save as you go, the books are yours to download and keep, and Alexandru and the team can see where you are stuck.'), `${name}: lede`);
  ok(P.includes('>Create my free account →</button>') && !P.includes('Start my North Star →'), `${name}: the final button reads Create my free account`);
  ok(P.includes('Free · your North Star, your Base Camp and your library'), `${name}: the line under it`);
}
const K = markup(LIBRARY, ALL_STEP_IDS.length);
const flat = K.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ');
const COPY = [
  'The full Leader’s North Star, saved', '8 questions across the four domains, your North Star reading and the What-if lab. Change an answer any time.', 'Stop carrying the whole business in your head.', 'See which domain needs you first: Lead yourself, Lead your people, Lead your business or Lead the market.',
  'Your Base Camp', 'Your stage, your weakest domain, your goal and your first three moves, on one page.', 'Start Monday knowing what comes first.', 'Put your hours where they move the business.',
  'Your Account Plans', `${ALL_STEP_IDS.length} short steps in your own order, weakest domain first. Tick them off as you go.`, 'Feel progress every week, instead of only pressure.', 'Small moves that add up to a business that runs.',
  'The Founder Launchpad', 'Three levels in all four domains. Each step names what to open, count and write. Free, and free to stay.', 'Rewrite your principles. Unlock your mind.', 'Lead your business instead of being its busiest employee.',
  'The Founder’s Blueprint for your stage', 'A manual for Building (79 pages), Growing (77) or Scaling (80). All three open with your account.', 'Advice for where you are, not for someone else’s business.', 'A clear road from your stage to the next one.',
  'Built to Lead', '99 practical tools. A personal leadership field guide.', 'A tool ready for the hard moment: the talk, the decision, the no.', 'Lead people with confidence, even if nobody taught you how.',
  'Worth Building', '32 leadership frameworks. The Founder’s Playbook.', 'Think bigger, with a structure behind it.', 'Build toward a business that lasts and can run without you.',
  'A New Way of Winning', '12 principles. Four stages. Four domains. Free to download with your account.', 'A win that counts at home as well as at work.', 'Decide what winning is for, then build toward it.',
  'Your tools · they work for you from day one', 'Your library · download and keep', 'WHAT YOU GET', 'IN YOUR LIFE', 'IN YOUR BUSINESS',
  '3 manuals, one for each stage · 99 practical tools · 32 leadership frameworks · 12 principles',
  'You don’t have to figure it out alone. Your mentor, and the whole team behind you.', 'Notes from Alexandru and the team arrive at your Base Camp, and you can reply.',
  'One question before you scroll on: what would one more free evening a week give your family?', '4 tools that work from day one', '3 manuals and 3 books to download', 'Alexandru and the team beside you',
  'Free and yours to keep', 'Create my free account →', 'Your name, your email, a password and three short questions about your business. No card.',
];
for (const t of COPY) ok(flat.includes(t), `kit copy: ${t}`);
const I = items(LIBRARY, ALL_STEP_IDS.length);
ok(I.tools.length + I.library.length === 8 && (K.match(/class="kit-item"/g) || []).length === 8, 'eight items');
ok((K.match(/IN YOUR LIFE<\/span><p>/g) || []).length === 8 && (K.match(/IN YOUR BUSINESS<\/span><p>/g) || []).length === 8, 'every item has a LIFE and a BUSINESS line');
for (const m of LIBRARY.manuals) ok(K.includes(`${m.pages} pages`), `page count ${m.pages} comes from LIBRARY`);
ok(markup({ ...LIBRARY, manuals: LIBRARY.manuals.map((m) => ({ ...m, pages: m.pages + 1 })) }, 32).includes(`(${LIBRARY.manuals[1].pages + 1})`), 'change LIBRARY and the page counts follow');
ok(items(LIBRARY, null).tools[2].desc.startsWith('Short steps in your own order'), 'no live step count: no number is made up');
for (const b of LIBRARY.books) ok(K.includes(`src="${b.cover}"`) && /loading="lazy" decoding="async"/.test(K) && K.includes('width="480" height="480"'), `${b.n}: real cover, lazy, sized`);
ok((K.match(/data-gate class="gold-btn">Create my free account →/g) || []).length === 1, 'the closing button opens the account box (data-gate)');
ok(!/<a\s/i.test(K), 'no links to other offers in the section');
const SJ = read('public/north3/sales.js');
ok(/kit\.querySelectorAll\('\[data-gate\]'\)\.forEach\(\(b\) => b\.addEventListener\('click', openGate\)\)/.test(SJ), 'the section’s buttons are wired to the same account box');
ok(!/mailchimp/i.test(SJ + read('public/north3/kit.js') + read('public/account-box.js') + read('public/northstar/app.js')), 'no Mailchimp code on the sales pages or the North Star');
ok(read('public/north3/kit.css').includes('prefers-reduced-motion') && read('public/north3/kit.css').includes('overflow-x:auto'), 'kit.css: reduced motion, the shelf scrolls inside itself');
const T = await (await plansGet({ request: new Request('https://x/api/plans?total'), env: {} })).json();
ok(T.ok && T.total === ALL_STEP_IDS.length, 'the step count comes from the live plans data');

// Light and dark on every page: theme.js loads first, before any style.
for (const f of ['public/ground-plan/index.html', 'public/road1/index.html', 'public/north3/index.html', 'public/road3/index.html', 'public/northstar/index.html', 'public/northstar/summit/index.html', 'public/404.html', 'public/mentor/index.html']) {
  const h = read(f);
  ok(h.indexOf('<script src="/theme.js"></script>') > 0 && h.indexOf('<script src="/theme.js"></script>') < h.indexOf('stylesheet'), `${f}: light and dark (theme.js before the styles)`);
}
const tj = read('public/theme.js');
ok(tj.includes("'es-theme'") && tj.includes('prefers-color-scheme: dark') && tj.includes("'cab-theme'"), 'theme.js: kept per browser, follows the device, carries the old Cabinet pick');

console.log(`pages: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
