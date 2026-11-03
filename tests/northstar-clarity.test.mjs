// The Leader's North Star, simpler (Alexandru, 3 Nov 2026): one menu on a
// phone, "four parts" said once, Before you start one at a time, only what is
// earned, the Growth Plan's next five first, Back beside Next, the 12 Days bonus.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tally } from './_d1.mjs';
const { ok, done } = tally('northstar-clarity');
const html = readFileSync('public/northstar/index.html', 'utf8'), css = readFileSync('public/northstar/crown.css', 'utf8'),
  js = readFileSync('public/northstar/clarity.js', 'utf8'), app = readFileSync('public/northstar/app.js', 'utf8'), spy = readFileSync('public/northstar/spy.js', 'utf8');

ok(html.includes('id="nsmenu-btn"') && html.includes('<script type="module" src="clarity.js"></script>') && /#top-tools>#how-btn,#top-tools>\[data-act="download"\]/.test(css), 'a phone has one Menu button; the four top icons move into it');
ok(['The Founder’s Blueprint', 'Growth Toolkit', '12 Days to Start Winning', 'How to use this', 'Download your progress', 'Full screen', 'Light and dark'].every((t) => js.includes(`'${t}'`)), 'the menu holds every way that used to crowd the top');
ok(css.includes('#s-overview > div:has(#stepcards),#s-method{display:none !important}') && !app.includes("['method', '⌘', 'How it works']") && !spy.includes("'s-method'"), '“four parts” said once');
ok(css.includes('.nslocked>*:not(.nslocknote){display:none !important}') && app.includes('4: !p1 || !p2 || !p3'), 'a locked part is one quiet line; the What-if lab waits for the numbers');
ok(js.includes("Before you start · ${bys + 1} of ${U.length}") && js.includes("'Start Part 1 →'") && css.includes('#s-clear[data-bys="r1"]'), 'Before you start, one at a time, with Back beside Next');
ok(css.includes('.nsb-foot{justify-content:flex-start;gap:12px}') && css.includes('body.nsq-full .nsb-foot{position:fixed'), 'the questions: Back beside Next, at the bottom on a phone');
ok(js.includes("fetch('/api/course', { method: 'POST'") && js.includes('Done. Wait for the surprises: check your email.') && html.includes('class="days-link" data-days="open"'), '12 Days: the card in the side and at the end, a pop-up in place');

// The Growth Plan: the next five steps; the rest behind one button.
const req = createRequire(import.meta.url);
globalThis.window = globalThis;
req('../public/northstar/growth-plan.js'); req('../public/northstar/growth.js');
const GP = globalThis.GrowthPlan, GV = globalThis.GrowthView;
const short = GV.html(GP, { done: {}, week: 5 }), full = GV.html(GP, { done: {}, week: 5, all: true }), plain = GV.html(GP, { done: {} });
const shown = (h) => (h.match(/class="gp-step(?: on)?"/g) || []).length;
ok(shown(short) === 5 && short.includes('See all 21 steps') && short.includes('Your next 5 steps'), 'five steps show, then “See all 21 steps”');
ok(shown(full) === 21 && full.includes('Show only my next 5') && !plain.includes('gp-later') && !plain.includes('gp-allb'), 'all of them on request; without the option, as before');
done();
