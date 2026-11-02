// Base Camp and the programme, Alexandru's asks of 2 Nov 2026: the twelve
// levels always visible on the left on a wide screen; Growth Toolkit in the
// top menu; signed out, the sign-in screen, never a sales page; the ledger
// button says where it goes; the rules saved in AGENTS.md.

import fs from 'node:fs';
import { entry } from '../public/home.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('basecamp-nav');
const app = fs.readFileSync('public/app.js', 'utf8'), css = fs.readFileSync('public/crown.css', 'utf8');
const cab = fs.readFileSync('public/cabinet.js', 'utf8'), rules = fs.readFileSync('AGENTS.md', 'utf8');

ok(['#home', '#programme', '#blueprint', '#library', ''].every((h) => entry({ joined: false, old: false, hash: h }) === 'signin'), 'signed out, every Base Camp address shows sign-in');
ok(!app.includes("location.replace('/north3/#join')") && app.includes('New here? <a href="/north3/#join">Create your free account →</a>'), 'no sales-page redirect; sign-in still links to a free account');

ok(app.includes('<a class="tbook ttools" href="/tools/">Growth Toolkit</a>'), 'Growth Toolkit in the top menu, to /tools/');
ok(/@media \(min-width:1180px\)\{\s*body\.inwork \.cw-drawer\{top:var\(--topbar,72px\);width:300px/.test(css) && css.includes('body.inwork .cw{margin-left:300px;max-width:none}'), 'wide screens: the twelve levels stay on the left, under the top bar');
ok(css.includes('.cw-all[data-go="rail"]{display:inline-flex') && css.includes('min-height:40px'), 'phones: the levels button is big enough to see');
ok(app.includes("document.documentElement.style.setProperty('--topbar'") && app.includes("addEventListener('resize', topbar"), 'the bar sits under the top bar at every width');

ok(app.includes('return x ? x.title : weekTitle(st, n);'), 'the level list and Base Camp use plain names, not the level words');
ok(cab.includes("p && p.total ? 'Open the ledger →' : 'Take my North Star first →'"), 'the ledger button says where it goes when there is no reading yet');

ok(rules.includes('## 10. Practical first, outside in') && rules.includes('## 11. Easy on the eye') && rules.includes('Atkinson Hyperlegible') && rules.includes('## 12. Examples at every size'), 'the rules are saved for every session');

done();
