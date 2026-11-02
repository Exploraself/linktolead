// My Blueprint v2 (Alexandru, 2 Nov 2026): the chapter names; My direction
// (mission, vision, values, a business goal and a leadership goal, two
// mini-goals), one field per screen and turned to the customer; This week,
// My playbook, Strengths and My journey; light, white, Atkinson Hyperlegible.

import fs from 'node:fs';
import * as V from '../public/levels-v4.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('my-blueprint');
const app = fs.readFileSync('public/app.js', 'utf8'), css = fs.readFileSync('public/my-blueprint.css', 'utf8');
const fonts = fs.readFileSync('public/assets/fonts.css', 'utf8'), page = fs.readFileSync('public/ground-plan/index.html', 'utf8');
const rules = fs.readFileSync('AGENTS.md', 'utf8'), road4 = fs.readFileSync('public/road4/index.html', 'utf8');

// The chapters, in plain words.
ok(V.CHAPTERS4.map((c) => c.name).join(' / ') === 'Start with you / Run the business / Grow the market', 'the three chapters: Start with you, Run the business, Grow the market');
ok(/customer, serving, money and goals/.test(V.CHAPTERS4[0].about), 'Chapter I is about the founder and the basics of a business');
const old = /Inner Pyramid|Engine Room|Open Market/;
ok(!old.test(fs.readFileSync('public/levels-v4.js', 'utf8')) && !old.test(road4) && !old.test(app), 'the old chapter names are gone from the programme and the sales page');

// My direction.
const K = V.DIRECTION4.map((F) => F.k);
ok(K.join() === 'mission,vision,values,goalBiz,goalLead,miniWork,miniLife', 'My direction: mission, vision, values, two goals, two mini-goals');
ok(V.DIRECTION4.filter((F) => /customer/i.test(F.q + F.hint + F.ask)).length >= 5, 'turned to the customer');
ok(V.DIRECTION4.find((F) => F.k === 'mission').ask.includes('Ask three customers'), 'unsure? ask your customers');
ok(V.DIRECTION4.find((F) => F.k === 'values').lock === true, 'the values are locked in');
ok(V.DIRECTION4.every((F) => F.q && F.label && F.ph && F.ex.length === 2 && F.ex[0] && F.ex[1]), 'every screen: a question, a label, a hint in the box, an example');
const sizes = V.DIRECTION4.map((F) => F.ex[0]).join(' | ');
ok(/idea and no money/.test(sizes) && /12 people and payroll/.test(sizes) && /50 people/.test(sizes), 'examples at every size (rule 12)');
ok(/Example · \$\{esc\(F\.ex\[0\]\)\}/.test(app), 'every example is marked as one');
const d = V.directionOf({ 'w.v4.dir.mission': '  Cafés fill their quiet afternoons. ', 'w.v4.dir.goalBiz': '10 paying cafés' });
ok(d.mission === 'Cafés fill their quiet afternoons.' && d.goalBiz === '10 paying cafés' && d.vision === '', 'directionOf reads the saved lines');
ok(V.goalFor(0) === 'goalLead' && V.goalFor(1) === 'goalLead' && V.goalFor(2) === 'goalBiz' && V.goalFor(3) === 'goalBiz', 'yourself and your people serve the leadership goal; business and market the business goal');
ok(K.every((k) => /^w\.[\w.:-]{1,80}$/.test(`w.v4.dir.${k}`)), 'the account keeps every line (the /api/state key rule)');
ok(app.includes("const key = `w.v4.dir.${DIRECTION4[i].k}`;") && app.includes("state.work[key] = v; save(); account.touch('work', key, v);"), 'saved to the device first, then to the account in its batch');
ok(app.includes('if (needsAccount()) { askAccount(keepDir); return; }'), 'an incomplete account is asked to finish first, and the line is kept');
ok(app.includes('class="mb-one" data-dirform=') && app.includes('id="mb-in"') && app.includes("'Write one line, or skip it for now.'"), 'one field on screen, with Back, Next and Skip');

// The five tabs and the top menu.
ok(['My Blueprint', 'This week', 'My direction', 'Strengths', 'My journey'].every((t) => app.includes(`'${t}'`)) && app.includes("let bpTab = 'book'"), 'five tabs, and My Blueprint opens on the Blueprint itself (Alexandru, 2 Nov 2026)');
ok(app.includes('role="tablist" aria-label="My Blueprint"') && app.includes("['ArrowLeft', 'ArrowRight', 'Home', 'End']"), 'the tabs are a tab list, with the arrow keys');
ok(app.includes(`data-go="blueprint" \${view === 'blueprint' ? 'aria-current="page"' : ''}>My Blueprint</button>`), 'My Blueprint in the top menu');
ok(app.includes('This week: 4 things to do') && app.includes('Serves: ${goalLine(d)}') && app.includes('Done when: <span class="mb-ink">${doneOf(w, lv, d)}</span>'), 'This week: four actions, the goal each serves, Done when');
ok(app.includes("keep4(d, 'got', gotOf(state.work, lv, d) === 0 ? '' : 0, lv);"), 'a tick is Sunday’s “Done”, saved on its level');
ok(app.includes('<b>By the end:</b> ${esc(L.promise)}') && app.includes('Opens with ${') && app.includes('Open it · ${esc(rung.price)}'), 'a level not begun shows what it gives; a locked one, what opens it');
ok(app.includes('function planGrid(') && app.includes('Fills in when you write it in Level') && app.includes('nothing here is a form'), 'all twelve levels from day one, filled only with what was written and done');
ok(!/240/.test(app.slice(app.indexOf('// ── My Blueprint (Alexandru'), app.indexOf('function libraryView()'))), 'no scary totals');
ok(app.includes('function blueprintDoc()') && app.includes('data-bpdoc="1"') && app.includes('data-bpdoc="0"'), 'every answer, in the eight parts, is still one tap away');
ok(!/L\.word|\.word\)/.test(app.slice(app.indexOf('// ── My Blueprint (Alexandru'), app.indexOf('function libraryView()'))), 'plain level names, never the level words (rule 10)');

// Light, white, one font.
ok(css.includes("--mb-font:'Atkinson Hyperlegible'") && css.includes('color-scheme:light') && css.includes('--mb-card:#FFFFFF'), 'light and white, in Atkinson Hyperlegible');
ok(fonts.includes("font-family:'Atkinson Hyperlegible';font-style:normal;font-weight:400") && fonts.includes('atkinson-hyperlegible-700.woff2'), 'the font is served from this site, regular and bold');
ok(['400', '700'].every((w) => fs.statSync(`public/assets/fonts/atkinson-hyperlegible-${w}.woff2`).size > 10000), 'both font files are here');
ok(page.includes('<link rel="stylesheet" href="/my-blueprint.css">'), 'Base Camp loads the My Blueprint styles');
ok(css.includes('prefers-reduced-motion') && css.includes('@media print'), 'reduced motion and print');

ok(rules.includes('## 15. My direction, and what the first five levels are for') && rules.includes('**Start with you**'), 'the rules are saved for every session');

done();
