// /start as the home base: who lands where, which programme they walk, and a
// Base Camp that only ever says what the founder's own North Star supports.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { entry, programmeStage, groundPlan, PROGRAMME } from '../public/home.js';
import { STAGES, LEVELS, weekTitle, loadStage } from '../public/content.js';
const require = createRequire(import.meta.url);
const E = require('../public/northstar/engine.js');
await Promise.all(['build', 'grow', 'scale'].map(loadStage));

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL ' + m)); };
const promise = (st, n) => (LEVELS[st][n] && LEVELS[st][n].promise) || '';
const C = { STAGES, weekTitle, promise };

// ── Where /start opens ──────────────────────────────────────────────────────
ok(entry({ joined: false, old: false }) === 'redirect', '/start without an account redirects to the sales page');
ok(entry({ joined: false, old: true }) === 'redirect', 'old local work without an account still redirects');
ok(entry({ joined: false, old: false, hash: '#signin' }) === 'signin', '#signin shows the sign-in screen');
ok(entry({ joined: true, old: true }) === 'work', 'an old founder opens on their programme');
ok(entry({ joined: true, old: false }) === 'home', 'a new founder opens on the Base Camp');
ok(entry({ joined: true, old: true, hash: '#home' }) === 'home', '#home is honoured for an old founder');
ok(entry({ joined: true, old: false, hash: '#programme' }) === 'work', '#programme is honoured');
ok(entry({ joined: true, old: false, hash: '#library' }) === 'library', '#library is honoured');

// The page itself sends a visitor with no account away before any programme
// code loads, but leaves the sign-in screen and a sign-in link alone.
const html = readFileSync(new URL('../public/ground-plan/index.html', import.meta.url), 'utf8');
const early = html.indexOf("location.replace('/north3/#join')");
ok(early > 0 && early < html.indexOf('<link rel="stylesheet"') && early < html.indexOf('app.js'), '/start redirects before its styles and programme load');
ok(/location\.hash !== '#signin'/.test(html) && /signin=/.test(html), 'the early redirect spares #signin and sign-in links');

// ── Which programme ─────────────────────────────────────────────────────────
ok(programmeStage({}) === 'build', 'nothing known: Building, where the programme starts');
ok(programmeStage({ local: 'grow', compass: 'leading' }) === 'grow', 'a stage in use on this device stays');
ok(programmeStage({ compass: 'leading' }) === 'scale', 'Leading walks the Scaling programme');
ok(programmeStage({ compass: 'growing', account: 'build' }) === 'grow', 'the North Star beats the account stage');
ok(programmeStage({ account: 'scaling' }) === 'scale', 'the account stage is used last');
ok(PROGRAMME.building === 'build' && PROGRAMME.scaling === 'scale', 'four North Star stages map to three programmes');

// ── The Base Camp before and after the North Star ────────────────────────────
ok(groundPlan(null, E, C) === null, 'before the North Star there is no Base Camp');

const rec = (over = {}) => ({ stage: 'leading', results_json: JSON.stringify({ scores: [5, 2, 4, 2], answered: [2, 2, 2, 2] }),
  flags_json: JSON.stringify({ want: 'income', pains: ['cash', 'time'] }), ...over });
const gp = groundPlan(rec(), E, C);
ok(gp.programme === 'scale', 'Leading → the Scaling programme');
ok(gp.stage.line === 'You chose Leading; your programme is Scaling, the top of the road.', 'the Leading line, exactly');
ok(gp.stage.programme === STAGES.scale.n, 'the programme name comes from content.js');
ok(gp.weakest.name === E.DOMAINS[1].name, 'a tie on the lowest score goes to the first domain in order');
ok(gp.weakest.big === E.FEEDBACK[1][0].big && gp.weakest.week === E.FEEDBACK[1][0].week, 'the weakest domain uses the North Star’s own feedback');
ok(gp.weakest.band === E.BANDS[0], 'band from the score');
ok(gp.goal.label === 'Higher income' && gp.goal.domain === E.DOMAINS[2].name, 'the goal and its domain');
ok(gp.pains.map((p) => p.label).join() === 'Cash is tight,No time for myself', 'only the pains the founder ticked');
ok(gp.moves.length === 3 && gp.moves.every((m, i) => m.n === i + 1 && m.title === weekTitle('scale', i + 1)), 'first three moves are the programme’s first three levels');
ok(gp.moves.every((m) => m.promise && m.promise === promise('scale', m.n)), 'each move carries its level’s promise');

const g2 = groundPlan(rec({ stage: 'growing' }), E, C);
ok(g2.programme === 'grow' && g2.stage.line === `You chose Growing; your programme is ${STAGES.grow.n}.`, 'Growing → Growing');

// Nothing invented: what was not answered is not said.
const bare = groundPlan({ stage: 'building', results_json: '{}', flags_json: '{}' }, E, C);
ok(bare.weakest === null, 'no answered domain: no weakest domain');
ok(bare.goal === null && bare.pains.length === 0, 'no goal or pains when none were chosen');
const unanswered = groundPlan(rec({ results_json: JSON.stringify({ scores: [0, 3, 3, 3], answered: [0, 2, 2, 2] }) }), E, C);
ok(unanswered.weakest.i === 1, 'a domain with no answers is never the weakest');
const odd = groundPlan({ stage: 'nonsense', results_json: 'not json', flags_json: null }, E, C);
ok(odd && odd.stage === null && odd.weakest === null, 'a broken record says nothing rather than guessing');

console.log(`home: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
