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
ok(!empty.includes('<dt>Stage today</dt>') && !empty.includes('<dt>Start here</dt>') && empty.includes('Take my Compass →') && empty.includes('Good'), 'missing values are left out, never invented');
ok(full.includes('data-cab-theme="light"') && read('public/cabinet.css').includes('.cab[data-cab-theme="dark"]'), 'Morning and Evening');
localStorage.setItem('cab-theme', 'dark');
ok(C.theme() === 'dark' && C.cabinetHTML({ tier: 'free' }).includes('data-cab-theme="dark"'), 'the founder’s pick is kept');
ok(full.includes('/cabinet/alexandru.jpg') && fs.existsSync('public/cabinet/alexandru.jpg'), 'Alexandru’s portrait in Ask Alexandru');
for (const f of ['cover-built-to-lead.jpg', 'cover-worth-building.jpg', 'cover-a-new-way-of-winning.jpg']) ok(full.includes('/library/' + f) && fs.existsSync('public/library/' + f), `the real cover: ${f}`);

const app = read('public/app.js'), js = read('public/cabinet.js');
ok(/if \(view !== 'home'\) cabinetHidden\(\);/.test(app) && /if \(view === 'home'\) cabinetShown\(\);/.test(app), 'music only while Your Ground Plan is on screen');
ok(/visibilitychange[\s\S]{0,120}document\.hidden[\s\S]{0,80}pause\(\)/.test(js), 'music fades out when the tab is hidden');
ok(/pointerdown/.test(js) && !/\.start\(\);\s*\}\s*\)\(\);/.test(js), 'it starts only after a click, never on its own');
ok(read('public/cabinet.css').includes('@media(prefers-reduced-motion:reduce){.cab *{animation:none!important'), 'reduced motion: no spinning record');
ok(read('public/ground-plan/index.html').includes('/cabinet.css') && read('functions/_landing.js').includes("'/start': '/ground-plan/'"), '/ground-plan/ with its styles; /start still lands there');
done();
