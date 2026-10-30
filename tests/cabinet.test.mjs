// The Cabinet: the top of Your Ground Plan (/ground-plan/). Only the founder's
// own data, light and dark, music only on Your Ground Plan, the old /start
// address still lands.
import fs from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('cabinet');
globalThis.localStorage = { _: {}, getItem(k) { return this._[k] ?? null; }, setItem(k, v) { this._[k] = String(v); } };
globalThis.matchMedia = () => ({ matches: false });
const C = await import('../public/cabinet.js');
const read = (f) => fs.readFileSync(f, 'utf8');

const full = C.cabinetHTML({ first: 'Ana', name: 'Ana Pop', stageName: 'Growing', startHere: 'Lead the market', tier: 'lab',
  bands: ['A strength', 'Taking shape', 'Taking shape', 'Needs you now'], plans: { count: 3, total: 32, next: { title: 'Book three conversations', domain: 'Lead the market' } },
  prog: { level: 2, title: 'Why it exists', done: 7 }, askUnread: 1 });
ok(full.includes('<i>Ana.</i>') && full.includes('Ana Pop') && full.includes('Lead the market') && full.includes('3 of 32') && full.includes('7 of 28'), 'the founder’s own name, stage, plans and level');
ok(full.includes('Needs you now') && full.includes('Open my reading →') && full.includes('Read the answer →'), 'Compass bands and a new answer');
ok(C.handAngle('free') === -120 && C.handAngle('lab') === 0 && C.handAngle('premium') === 120 && full.includes('rotate(0 180 180)'), 'the dial hand points at the founder’s step');
ok(!/Elena|Marsh|example/i.test(full), 'no example founder anywhere');
const empty = C.cabinetHTML({ first: '', tier: 'free', bands: [], plans: null, prog: null });
ok(!empty.includes('<dt>Stage today</dt>') && !empty.includes('<dt>Start here</dt>') && empty.includes('Take my North Star →') && empty.includes('Good'), 'missing values are left out, never invented');
ok(read('public/cabinet.css').includes(':root[data-theme="dark"] .cab{') && C.theme() === 'light', 'Morning and Evening follow the site light (theme.js)');
localStorage.setItem('es-theme', 'dark');
ok(C.theme() === 'dark', 'the founder’s pick is kept on this browser');
localStorage.setItem('es-theme', '');
localStorage.setItem('cab-theme', 'dark');
ok(C.theme() === 'dark', 'the old Cabinet pick still counts');
ok(full.includes('/cabinet/alexandru.jpg') && fs.existsSync('public/cabinet/alexandru.jpg'), 'Alexandru’s portrait in Ask Alexandru');
for (const f of ['cover-built-to-lead.jpg', 'cover-worth-building.jpg', 'cover-a-new-way-of-winning.jpg']) ok(full.includes('/library/' + f) && fs.existsSync('public/library/' + f), `the real cover: ${f}`);

const app = read('public/app.js'), js = read('public/cabinet.js');
const mu = read('public/music.js');
ok(/const DASHBOARD = \['home', 'work', 'library', 'ask'\]/.test(app) && /if \(!DASHBOARD\.includes\(view\)\) cabinetHidden\(\);/.test(app) && /else if \(DASHBOARD\.includes\(view\)\) dashboardShown\(\);/.test(app), 'music on Your Ground Plan, the programme, the Library and Ask Alexandru');
ok(/visibilitychange[\s\S]{0,120}document\.hidden[\s\S]{0,80}pause\(\)/.test(mu), 'music fades out when the tab is hidden');
ok(/pointerdown/.test(mu) && !/\.start\(\);\s*\}\s*\)\(\);/.test(mu) && js.includes("import * as M from './music.js'"), 'it starts only after a click, never on its own');
ok(read('public/cabinet.css').includes('@media(prefers-reduced-motion:reduce){.cab *{animation:none!important'), 'reduced motion: no spinning record');
ok(read('public/ground-plan/index.html').includes('/cabinet.css') && read('functions/_landing.js').includes("'/start': '/ground-plan/'"), '/ground-plan/ with its styles; /start still lands there');

// The incubator band: FULL accounts only, real data, static.
const dots = C.levelDots(3, (n) => (n < 3 ? 28 : n === 3 ? 9 : 0), (n) => n <= 5);
ok(dots.join() === 'done,done,here,open,open,gate,gate,gate,gate,gate,gate,gate', 'the twelve dots: done, here, open, behind a gate');
const banded = C.cabinetHTML({ tier: 'session', band: { level: 3, title: 'Name the gap', done: 9, dots } });
ok(banded.includes('class="incub"') && banded.includes('Level 03 of 12 · <b>Name the gap</b> · 9 of 28 answers') && banded.includes('data-level="3"') && banded.includes('Continue Level 03 →'), 'band: the founder’s level, its answers and Continue');
ok(!full.includes('class="incub"') && !C.cabinetHTML({ tier: 'free', band: null }).includes('class="incub"'), 'no band without a FULL account');
ok(!/animation/.test(read('public/cabinet.css').split('.incub{')[1].split('/* The Leader’s North Star')[0]), 'the band is static');
ok(/full = pulled && signupType !== 'simple'/.test(app), 'band only once the account is read, and never for simple accounts');
// The North Star strip, and the music module.
ok(C.compassStripHTML(true).includes('Open my North Star →') && C.compassStripHTML(false).includes('Take my North Star →') && app.includes('compassStripHTML(!!compassRec)'), 'the Leader’s North Star has its own strip');
const Mu = await import('../public/music.js');
const { readFileSync: rfMu } = await import('node:fs');
ok(!/crackle/.test(rfMu(new URL('../public/music.js', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')), 'no vinyl crackle in the music');
ok(Mu.shade(100) === 0 && Mu.shade(0) === 0.62 && Mu.shade(50) === 0.31, 'light: 100 is no shade, lower is dimmer');
ok(Mu.tempo('trio', 0) < Mu.tempo('trio', 100) && Mu.tempo('ambient', 50) < Mu.tempo('trio', 50), 'energy moves the tempo');
ok(Object.keys(Mu.TRACKS).length === 6 && ['road','burn','riff'].every((k) => Mu.TRACKS[k]) && Mu.MODES.focus.light < Mu.MODES.study.light && Mu.MODES.focus.lamp === true && Mu.MODES.study.lamp === false, 'six pieces (three rock); Focus mode = light, music and the Lamp');
ok(/M\.answered\(answered\(st, level, dom\)\)/.test(app) && /chime\(\)/.test(mu) && read('public/music.css').includes('#mp-dim.lamp.aimed'), 'the Lamp: a pool of light on the question, a chord and a candle per answer');
ok(Mu.mayAsk('2000-01-01') === true, 'the two-minute invitation may show');
ok(/ASK_AFTER = 120/.test(mu) && /if \(!here \|\| isOn\(\) \|\| !mayAsk\(\)/.test(mu), 'after two minutes on the dashboard, once a day, never while music plays');
ok(read('public/music.css').includes('@media(prefers-reduced-motion:reduce)'), 'reduced motion respected in the player');
done();
