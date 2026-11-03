// Level screen and rail clarity (Alexandru, 3 Nov 2026): the intro is the
// first row of the level's list, one way in on the right, twelve squares to
// reach any move, "Level NN begins" before the first part, Back beside Next,
// one library door in the rail, and 12 Days to Start Winning as a bonus card
// with a pop-up in place.
import { readFileSync } from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('level-clarity');
const app = readFileSync('public/app.js', 'utf8');

ok(app.includes('function introRowHTML()') && app.includes('${introRowHTML()}${doms}') && app.includes('Before you start <span class="cw-itag">Intro</span>'), 'the intro is the first row of the list, marked Intro');
ok(!app.includes('function beforeHTML()') && !app.includes('${started ? beforeHTML()'), 'the right page has one way in: no extra links beside Continue');
ok(app.includes('function squaresHTML()') && app.includes('data-sq="${at}"') && app.includes('b.dataset.intro != null || b.dataset.sq != null'), 'twelve squares, each opening its own move');
ok(app.includes("kind === 'begin' ? `Begin Level ${pad(level)} →`") && app.includes('You’re ready. Level ${pad(level)} begins'), '“Level NN begins”, with its four parts and one button');
ok(app.includes('const railLib =') && !app.includes('${libIcons()}') && !/'12 principles', 'A New Way/.test(app), 'one library door in the rail, no counters');
ok(app.includes("fetch('/api/course', { method: 'POST'") && app.includes("action: 'start'") && app.includes('Done. Wait for the surprises: check your email.') && app.includes('Yes, send them to me'), '12 Days: a pop-up in place that starts the letters');
ok(app.includes('Your 12 days are on') && app.includes("daysSub && daysSub.stopped ? 'Start again →'"), '12 Days: already on shows the day; stopped offers to start again');
ok(app.includes("if (e.key === 'Escape' && box && !box.hidden)"), 'Esc closes the pop-up');
ok(/let libThisVisit = false;/.test(app) && /CB_TIMES = 1;/.test(app), 'the two banners show once');
done();
