// /road2/ (31 Oct 2026): the Blueprint page "You built the house. You forgot
// the door." One offer (the free Founder Launchpad), one button, no links out,
// road 3's design system, the copy as Alexandru wrote it, and no numbers but
// the founder's own.

import { mirrorLine, costLines } from '../public/road2/page.js';
import { LEVELS4 } from '../public/levels-v4.js';
import { tally } from './_d1.mjs';
import fs from 'node:fs';

const { ok, done } = tally('road2');
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const H = read('public/road2/index.html'), J = read('public/road2/page.js');
// What a founder reads: no styles, scripts, comments or tags.
const text = H.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<head>[\s\S]*?<\/head>/, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
const has = (t) => text.includes(t);

// The copy, as written.
ok(has('The Founder’s Blueprint · Link to Lead') && /<h1 class="h1">You built the house\. <em>You forgot the door\.<\/em><\/h1>/.test(H), 'hero: eyebrow and headline');
ok(has('For founders who build, polish and rebuild, and keep the selling for later. Three free weeks to open the door and let the right people in.') && has('Free · no card · start tonight'), 'hero: sub and the line under the button');
ok(has('Does this sound like your week?') && has('Tap what’s true. Nobody sees it but you.'), 'mirror: eyebrow and heading');
const TAPS = ['I have rewritten the same page more times than I have asked someone to buy.', 'I know my subject better than people who earn more from it.',
  'Every name, decision and detail still waits for me.', 'My best hours go to the screen, not to the people who would pay.',
  'The thing I sell most still has no price I say out loud.', 'I work late because the day went to things anyone could do.'];
ok(TAPS.every(has) && (H.match(/<button type="button" class="tap" aria-pressed="false">/g) || []).length === 6, 'mirror: six tap-cards, each a toggle button');
ok(mirrorLine(0) === 'You’re closer than you think. Three weeks can open the door.' && mirrorLine(1) === mirrorLine(0), 'mirror: 0–1 tapped');
ok(mirrorLine(2) === '2 of 6. The work is real. The door is missing.' && mirrorLine(3) === '3 of 6. The work is real. The door is missing.', 'mirror: 2–3 tapped');
ok([4, 5, 6].every((n) => mirrorLine(n) === `${n} of 6. You are not lazy. You are building where it feels safe.`), 'mirror: 4–6 tapped');
ok(has('Building feels like progress. A yes is progress.') && has('You can make the product better forever. It will not be bought until someone is asked. What moves the business now is not more building. It is a number, a sentence and a conversation.'), 'reframe: heading and body');
ok(has('Your number What one sale leaves you.') && has('Your sentence Your offer, in your customer’s words.') && has('Your conversations Three asks a week. A yes and a no both count.'), 'reframe: the three cards');
ok(has('Last week, where did your hours go?') && has('Hours building, polishing, fixing') && has('Hours talking to people who could buy'), 'cost: heading and the two sliders');
ok(/id="h-build" min="0" max="80"/.test(H) && /id="h-sell" min="0" max="20"/.test(H) && /id="h-build"[^>]*value="0"/.test(H) && /id="h-sell"[^>]*value="0"/.test(H), 'cost: 0–80 and 0–20, starting at nothing (no number put in their mouth)');
let c = costLines(40, 0);
ok(c.week === 'Your week: 40 hours building, 0 hours with buyers.' && c.hit === 'Not one hour with a buyer. What would one hour have changed?', 'cost: no hour with a buyer');
c = costLines(42, 3);
ok(c.week === 'Your week: 42 hours building, 3 hours with buyers.' && c.hit === 'For every hour with a buyer, 14 hours alone with the work.', 'cost: round(b/s) hours alone with the work');
ok(costLines(1, 1).week === 'Your week: 1 hour building, 1 hour with buyers.' && costLines(1, 1).hit === 'For every hour with a buyer, 1 hour alone with the work.', 'cost: one hour is an hour');
ok(c.ask === 'If next month looks the same, what will you have built, and who will have paid for it?' && H.includes('If next month looks the same, what will you have built, and who will have paid for it?'), 'cost: the question, always');
ok(['Evenings back, because the day goes to what only you can do.', 'A price you say out loud without flinching.', 'Conversations every week with people who need what you built.', 'A business that runs on paper, not only in your head.'].every(has), 'what the three weeks work toward');
// The three free weeks are the Launchpad's own levels 1–3.
for (const L of LEVELS4.slice(0, 3)) ok(has(`Week ${L.n} ${L.title} ${L.promise}`), `week ${L.n}: “${L.title}” and its promise, from levels-v4.js`);
ok(has('Every step names what to open, what to count and what to write. You fill in the blanks. The answers are yours.') && has('The Founder Launchpad. Three free weeks.'), 'launchpad: heading and the rule');
ok(H.includes('src="/cabinet/alexandru.jpg"') && has('Alexandru and the team have walked this road.') && has('Alexandru’s first business made kitchens and wardrobes to measure. The work was good. The money side was not, and the business closed. ExploraSelf is built on that lesson: the craft is half of it. The other half is the door.') && has('Ambition is good — let’s give it a road.'), 'the guide: photo, line, story, closing');
ok(has('I have no time.') && has('Each step names one thing to open, count and write. Start tonight with the first one.') && has('I need clients, not leadership.') && has('Lead the market is one of the four domains, and in week 1 you ask three people to buy.')
  && has('I tried coaching. It was talk.') && has('Your own numbers are the only standard here. No grading.') && has('Is this for someone like me?') && has('If you tapped two or more cards above, it was written for you.'), 'four honest answers');
ok(has('Open the door tonight.') && has('Start free. When you’re ready, one hour with Alexandru opens the next two weeks.'), 'final call');

// One offer, one button, no way out but the box.
const ctas = H.match(/<button[^>]*class="cta"[^>]*>[^<]*<\/button>/g) || [];
ok(ctas.length === 3 && ctas.every((b) => b.includes('data-join') && />Start free tonight<\/button>$/.test(b)), 'three buttons, one kind: “Start free tonight”, each opening the box');
const hrefs = [...H.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !/^(\/assets\/|\/northstar\/assets\/)/.test(h));
ok(hrefs.every((h) => ['#main', '/ground-plan/#home', '/ground-plan/#signin'].includes(h)), 'no links to other pages or offers: skip link, Base Camp (signed in) and Sign in only');
ok(J.includes("variant: 'full', landing: 'road2'") && J.includes("location.hash === '#join'") && J.includes("import('/account-box.js')"), 'the FULL account box, landing road2; /road2/#join opens it');
ok(!/fetch\(|localStorage\.setItem|sendBeacon/.test(J), 'taps and sliders stay on the page: nothing saved or sent');

// Honest and plain.
ok(!/most founders|incubator|percent|%|guarantee|only \d+ (left|spots)|countdown|testimonial/i.test(text), 'no invented counts, scarcity or banned words');
ok((text.match(/\d+/g) || []).every((n) => ['0', '1', '2', '3', '20', '80'].includes(n)), 'the only numbers: week numbers and the sliders’ own ends');
ok(!/\b(he|him|his)\b/i.test(text), 'Alexandru and the team: never he or him');
ok(!/framework|Hormozi|Gerber|Covey|Collins|Sinek|Drucker|Tool \d|#\d/i.test(text), 'no framework or author names, no tool numbers');

// Road 3's system, light and dark, still for reduced motion, 390 px.
ok(H.indexOf('<script src="/theme.js"></script>') < H.indexOf('stylesheet') && H.includes(':root[data-theme="light"]'), 'light and dark (theme.js first, light overrides)');
ok(H.includes('Newsreader') && H.includes("'Inter'") && H.includes('#B4975F') && H.includes('#D6BF8F') && H.includes('#0E1C2B') && H.includes('href="/assets/fonts.css"'), 'road 3 fonts and gold; the house on midnight navy');
ok(H.includes('@media (prefers-reduced-motion:reduce)') && H.includes("matchMedia('(prefers-reduced-motion: reduce)')") && H.includes('@media (prefers-reduced-motion:no-preference)'), 'reduced motion: the finished house, door drawn, nothing moves');
ok(/class="ln door"/.test(H) && H.includes("h.classList.add('open')") && H.includes('2500') && J.includes("addEventListener('mouseenter', open)") && J.includes("addEventListener('focus', open)"), 'the door: after 2.5 s, or when the hero button is hovered or focused');
ok(!/[^-]min-width:\s*[4-9]\d\dpx|width:\s*[4-9]\d\dpx(?![^{]*max-width)/.test(H.replace(/max-width:[^;}]+/g, '')) && H.includes('overflow-x:hidden'), 'no fixed width wider than a phone');
ok(!/<a [^>]*href="\/(road[134]|north[123]|northstar|summit)/.test(H), 'no road, North Star or Summit links');
done();
