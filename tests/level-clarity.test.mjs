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
ok(app.includes("kind === 'begin' ? 'Let’s go →'") && app.includes('Here you are. <em>Level ${pad(level)} begins.</em>') && app.includes('<div class="bg-scene" aria-hidden="true">${ELEPHANT}</div>'), '“Level NN begins”: the elephant walks in, “Here you are”, focus, its four parts and “Let’s go” (3 Nov)');
ok(app.includes("kind === 'door' ? 'Start →'") && app.includes('Now, <em>where you are today.</em>') && app.includes('`${asksN} quick questions`'), 'the bridge into the door, and the fourth welcome screen names the questions that follow, not “Begin”');
ok(app.includes('const railLib =') && !app.includes('${libIcons()}') && !/'12 principles', 'A New Way/.test(app), 'one library door in the rail, no counters');
ok(app.includes("fetch('/api/course', { method: 'POST'") && app.includes("action: 'start'") && app.includes('Done. Wait for the surprises: check your email.') && app.includes('Yes, send them to me'), '12 Days: a pop-up in place that starts the letters');
ok(app.includes('Your 12 days are on') && app.includes("daysSub && daysSub.stopped ? 'Start again →'"), '12 Days: already on shows the day; stopped offers to start again');
ok(app.includes("if (e.key === 'Escape' && box && !box.hidden)"), 'Esc closes the pop-up');
ok(/let libThisVisit = false;/.test(app) && /CB_TIMES = 1;/.test(app), 'the two banners show once');
// The 1:1 booking (Alexandru, 3 Nov 2026: "take me back to the program"):
// same tab, the way back to the exact place, and a clear button for a draft.
const bk = readFileSync(new URL('../public/book/book.js', import.meta.url), 'utf8');
ok(!app.includes('href="${esc(BOOKING)}" target="_blank"') && app.includes('href="${esc(bookHref())}"') && app.includes('back=${encodeURIComponent(location.pathname + location.hash)}'), 'Book my 1:1 opens in the same tab and carries the way back');
ok(bk.includes("'← Back to my level'") && /a\.home, a\.brand/.test(bk) && bk.includes("'Continue my 1:1 booking'") && bk.includes('data-restart') && !bk.includes("'Carry on where I left off'"), 'the booking page goes back to the level, and a draft says “Continue my 1:1 booking”, with “Start the booking again”');
ok(app.includes('function introSavedHTML()') && app.includes('answers in Before you start'), 'closed during Before you start: the level page says what is saved');
done();
