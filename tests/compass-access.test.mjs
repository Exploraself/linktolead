// 30 Oct: the North Star asks outsiders for the full account, any account opens
// the whole North Star, the North Star banner in the programme (first five visits),
// the profile menu on the North Star and in the incubator, and one share preview.
import fs from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('compass-access');
const read = (f) => fs.readFileSync(f, 'utf8');
const compass = read('public/compass/app.js'), box = read('public/account-box.js'), app = read('public/app.js');

// The North Star: outsiders make the full account; signed-in founders see all.
ok(/function gated\(change\)[\s\S]{0,200}if \(!signedIn\(\)\) fullAccount\(\)/.test(compass), 'a first answer without an account opens the full account form');
ok(/variant: 'full', landing: 'compass', stay: true/.test(compass), 'the North Star form is the full one (password, company, interest, industry), landing "compass"');
ok(!/createAccount\(fromSales \? 'sales-page' : 'compass', true\)/.test(compass), 'no quiet simple account from the North Star any more');
ok(/if \(!signedIn\(\)\) \{ fullAccount\(\); return; \}/.test(compass), '"Email me my results" without an account: the full form first');
ok(/if \(ctx\.stay\) location\.reload\(\)/.test(box) && /OPEN MY NORTH STAR →/.test(box), 'after the form: back on the North Star, signed in');
ok(/stay \? '' : '<button type="button" data-close[^']*Not now/.test(box), 'no "Not now" on the North Star: the account is required');
ok(/const r = await A\.pull\(\);[\s\S]{0,300}S\.profile/.test(compass), 'an account from any page: the North Star knows the founder');
ok(read('public/compass/index.html').includes('<div id="acct-gate" hidden></div>'), 'its own box, apart from the North Star sign-in box');

// The North Star banner in the programme.
ok(/CB_TIMES = 5/.test(app) && /function compassBanner\(\)/.test(app) && /href="\/compass\/"/.test(app), 'the North Star banner, for five visits, links to /compass/');
ok(/dataset\.cban === 'close'\) \{ cbSet\(CB_TIMES\)/.test(app), 'closing it ends it early');
ok(read('public/style.css').includes('.cban,.cban::after,.cban-needle{animation:none}'), 'still with reduced motion');

// The profile menu, both places.
ok(compass.includes("import('/profile-menu.js')") && app.includes("import('/profile-menu.js')"), 'profile menu on the North Star and in the incubator');
ok(read('public/ground-plan/index.html').includes('<div id="pmhost"></div>') && read('public/compass/index.html').includes('id="top-tools"'), 'its places in both headers');
const src = read('public/profile-menu.js');
ok(/signupType === 'simple' && !me\.hasPassword/.test(src) && src.includes("'Change my password'") && src.includes("premium: 'The Summit'"), 'menu: password only for full accounts, step names');
ok(/key === 'Escape'/.test(src) && /!root\.contains\(e\.target\)/.test(src), 'Escape and a click outside close it');

// One share preview everywhere.
for (const f of ['public/road1/index.html', 'public/road2/index.html', 'public/road3/index.html', 'public/ground-plan/index.html', 'public/compass/index.html']) {
  const h = read(f);
  ok(h.includes('https://linktolead.exploraself.com/compass/assets/og-image.png') && h.includes('assets/favicon.svg') && h.includes('summary_large_image'), `${f}: the North Star share image and icon`);
}
// An empty North Star never wipes one with answers (30 Oct: "Saved just now", all zeros).
{
  const { fakeD1, post } = await import('./_d1.mjs');
  const { onRequestPost: save } = await import('../functions/api/compass.js');
  const DB = fakeD1(), env = { DB };
  const { accountTables } = await import('../functions/_shared.js');
  await accountTables(DB);
  DB.raw.prepare("INSERT INTO student (id, name, email, joined_at) VALUES ('t1','Ana Pop','ana@example.com','2026-10-30')").run();
  const full = { scores: [4, 3, 2, 5], answered: [2, 2, 2, 2], bands: ['Taking shape', 'Taking shape', 'Needs you now', 'A strength'] };
  await save({ request: post('/api/compass', { token: 't1', stage: 'growing', results: full, answers: { a: 1 } }), env });
  const r = await (await save({ request: post('/api/compass', { token: 't1', stage: 'scaling', results: { scores: [0, 0, 0, 0], answered: [0, 0, 0, 0], bands: [null, null, null, null] }, answers: {} }), env })).json();
  const row = DB.raw.prepare("SELECT stage, results_json FROM compass WHERE student_id = 't1'").get();
  ok(r.kept === true && JSON.parse(row.results_json).answered[0] === 2 && row.stage === 'growing', 'an empty North Star is not saved over one with answers');
}
ok(/if \(!hasWork\(S\)\) \{\s*const theirs = await A\.loadCompass\(\)/.test(compass), 'signed in on a fresh browser: the account’s North Star comes here, nothing empty is sent');
const mentor = read('public/mentor/mentor.js');
ok(!mentor.includes('JSON.stringify(JSON.parse(C.results_json') && /function compassPanel\(C\)/.test(mentor) && mentor.includes("'Not answered yet'"), '/mentor shows the North Star in words, not raw data');

done();
