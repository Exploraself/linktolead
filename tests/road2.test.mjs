// /road2/ (31 Oct 2026): the Blueprint page "You keep making it better. You
// keep putting off the selling." One offer (the free Founder Launchpad), one
// button, no links out, road 3's design system, clear in two seconds (no
// metaphor), four questions of the founder's own, and no numbers but theirs.

import { mirrorLine, costLines, MARK } from '../public/road2/page.js';
import { LEVELS4 } from '../public/levels-v4.js';
import { tally } from './_d1.mjs';
import fs from 'node:fs';

const { ok, done } = tally('road2');
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const H = read('public/road2/index.html'), J = read('public/road2/page.js');
// What a founder reads: no styles, scripts, comments or tags.
const text = H.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<head>[\s\S]*?<\/head>/, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
// What the page answers back: the replies to each question.
const says = [...H.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]);
const all = text + ' ' + says.join(' ');
const has = (t) => text.includes(t);

// The copy, as written.
ok(has('The Founder’s Blueprint · Link to Lead') && /<h1 class="h1">You keep making it better\. <em>You keep putting off the selling\.<\/em><\/h1>/.test(H), 'hero: eyebrow and a headline that says it plainly');
ok(has('For founders who build, polish and rebuild. Three free weeks to start asking the right people to buy.') && has('Free · no card · start tonight'), 'hero: sub and the line under the button');
ok(has('YOUR WEEK') && has('Building, polishing, fixing') && has('Asking people to buy') && has('Yes.') && has('The same week, with the asking in it.'), 'hero picture: your week as two bars, then a yes');
ok(!/house|door/i.test(all), 'no house, no door: no metaphor to decode (Alexandru, 31 Oct)');
ok(has('Does this sound like your week?') && has('Tap what’s true. Nobody sees it but you.'), 'mirror: eyebrow and heading');
const TAPS = ['I have rewritten the same page more times than I have asked someone to buy.', 'I know my subject better than people who earn more from it.',
  'Every name, decision and detail still waits for me.', 'My best hours go to the screen, not to the people who would pay.',
  'The thing I sell most still has no price I say out loud.', 'I work late because the day went to things anyone could do.'];
ok(TAPS.every(has) && (H.match(/<button type="button" class="tap" aria-pressed="false">/g) || []).length === 6, 'mirror: six tap-cards, each a toggle button');
ok(mirrorLine(0) === 'You’re closer than you think. Three weeks can get you asking.' && mirrorLine(1) === mirrorLine(0) && has(mirrorLine(0)), 'mirror: 0–1 tapped');
ok(mirrorLine(2) === '2 of 6. The work is real. The asking is missing.' && mirrorLine(3) === '3 of 6. The work is real. The asking is missing.', 'mirror: 2–3 tapped');
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
ok(H.includes('src="/cabinet/alexandru.jpg"') && has('Alexandru and the team have walked this road.') && has('Alexandru’s first business made kitchens and wardrobes to measure. The work was good. The money side was not, and the business closed. ExploraSelf is built on that lesson: the craft is half of it. The other half is asking people to buy.') && has('Ambition is good — let’s give it a road.'), 'the guide: photo, line, story, closing');
ok(has('I have no time.') && has('Each step names one thing to open, count and write. Start tonight with the first one.') && has('I need clients, not leadership.') && has('Lead the market is one of the four domains, and in week 1 you ask three people to buy.')
  && has('I tried coaching. It was talk.') && has('Your own numbers are the only standard here. No grading.') && has('Is this for someone like me?') && has('If you tapped two or more cards above, it was written for you.'), 'four honest answers');
ok(has('Start asking tonight.') && has('Start free. When you’re ready, one hour with Alexandru opens the next two weeks.'), 'final call');

// The four questions (Alexandru, 31 Oct): a tap each, an answer back, then on.
const Q = {
  believe: ['What makes you believe it’s going to work?', ['The work is good.', 'People who tried it liked it.', 'I’ve put too much in to stop now.', 'Honestly, I’m not sure any more.']],
  steps: ['Do you know the exact steps between today and the result you want?', ['Yes, every one.', 'Some of them.', 'Not really.']],
  before: ['Have you had this feeling before? The “this time it will work” feeling.', ['Yes, more than once.', 'Yes, once.', 'No, this is the first time.']],
  now: ['What’s different now?', ['Nothing, if I’m honest.', 'I’m ready to ask people to buy.', 'I’m tired of waiting.', 'I have a plan this time.']],
  wait: ['How long are you still ready to wait?', ['Another month.', 'Another three months.', 'Another year.', 'I’m done waiting.']],
};
for (const [k, [q, opts]] of Object.entries(Q)) {
  const group = (H.split(`data-q="${k}"`)[1] || '').split('</div>')[0];
  const n = (group.match(/<button type="button" class="opt" aria-pressed="false" data-say="[^"]+"( data-stop)?>/g) || []).length;
  ok(has(q) && opts.every((o) => group.includes(`>${o}</button>`)) && n === opts.length, `question “${q}”: ${opts.length} answers, each with a reply`);
  ok(H.includes(`data-reply="${k}"`) && H.includes(`data-sum="${k}"`) && MARK[k], `question ${k}: answered back, gathered in Your answers, marked on the journey`);
}
ok(says.length === 18 && says.every((x) => x.length > 20 && !/most founders|guarantee/i.test(x)), 'eighteen replies, none empty, none promising');
ok(['you', 'believe', 'steps', 'feel', 'wait', 'begin'].every((k) => H.includes(`data-k="${k}"`)) && /<ol class="jm" aria-label="Where you are on this page">/.test(H), 'the journey line: You · Believe · Steps · Feeling · Waiting · Begin');
ok(['believe', 'steps', 'feel', 'wait'].every((k) => H.includes(`data-ill="${k}"`)), 'a drawing for each question (seed, steps, loop, hourglass)');
ok(has('This is where you are. Nobody sees it but you.') && (H.match(/data-sum="/g) || []).length === 7, 'Your answers: every tap gathered in one place');
ok(has('The three free weeks go deeper into the same questions: what you believe, how you read what happens, and what you feel.'), 'the questions lead into the three weeks');

// One offer, one button, no way out but the box.
const ctas = H.match(/<button[^>]*class="cta"[^>]*>[^<]*<\/button>/g) || [];
ok(ctas.length === 4 && ctas.every((b) => b.includes('data-join') && />Start free tonight<\/button>$/.test(b)), 'four buttons, one kind: “Start free tonight”, each opening the box');
const hrefs = [...H.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !/^(\/assets\/|\/northstar\/assets\/)/.test(h));
ok(hrefs.every((h) => ['#main', '/ground-plan/#home', '/ground-plan/#signin'].includes(h)), 'no links to other pages or offers: skip link, Base Camp (signed in) and Sign in only');
ok(J.includes("variant: 'full', landing: 'road2'") && J.includes("location.hash === '#join'") && J.includes("import('/account-box.js')"), 'the FULL account box, landing road2; /road2/#join opens it');
ok(!/fetch\(|localStorage\.setItem|sessionStorage|sendBeacon/.test(J), 'taps, answers and sliders stay on the page: nothing saved or sent');

// Honest and plain.
ok(!/most founders|incubator|percent|%|guarantee|only \d+ (left|spots)|countdown|testimonial/i.test(all), 'no invented counts, scarcity or banned words');
ok((all.match(/\d+/g) || []).every((n) => ['0', '1', '2', '3', '20', '80'].includes(n)), 'the only numbers: week numbers and the sliders’ own ends');
ok(!/\b(he|him|his)\b/i.test(all), 'Alexandru and the team: never he or him');
ok(!/framework|Hormozi|Gerber|Covey|Collins|Sinek|Drucker|Tool \d|#\d/i.test(all), 'no framework or author names, no tool numbers');

// Road 3's system, light and dark, still for reduced motion, 390 px.
ok(H.indexOf('<script src="/theme.js"></script>') < H.indexOf('stylesheet') && H.includes(':root[data-theme="light"]'), 'light and dark (theme.js first, light overrides)');
ok(H.includes('Newsreader') && H.includes("'Inter'") && H.includes('#B4975F') && H.includes('#D6BF8F') && H.includes('#0E1C2B') && H.includes('href="/assets/fonts.css"'), 'road 3 fonts and gold; the drawings on midnight navy');
ok(H.includes('@media (prefers-reduced-motion:reduce)') && H.includes("matchMedia('(prefers-reduced-motion: reduce)')") && H.includes('@media (prefers-reduced-motion:no-preference)') && J.includes("matchMedia('(prefers-reduced-motion: reduce)')"), 'reduced motion: the last picture of each drawing, nothing moves');
ok(H.includes("w.classList.add('open')") && H.includes('2500') && J.includes("addEventListener('mouseenter', open)") && J.includes("addEventListener('focus', open)"), 'the hero week changes after 2.5 s, or when the hero button is hovered or focused');
ok(!/[^-]min-width:\s*[4-9]\d\dpx|width:\s*[4-9]\d\dpx(?![^{]*max-width)/.test(H.replace(/max-width:[^;}]+/g, '')) && H.includes('overflow-x:hidden'), 'no fixed width wider than a phone');
ok(!/<a [^>]*href="\/(road[134]|north[123]|northstar|summit)/.test(H), 'no road, North Star or Summit links');
done();
