// One Growth Toolkit, two front doors (Alexandru, 3 Nov 2026: "the Growth
// Toolkit and the tools … the same name … the same thing … and when we add
// it"). public/tools/catalog.js is the one list; public/tools/catalog.json is
// what exploraself.com/tools and exploraself.com/internal read. This test
// fails when the JSON is behind: run `node scripts/toolkit-json.mjs`.

import { readFileSync } from 'node:fs';
import { CATALOG, CATEGORIES, TOOLKIT_NAME } from '../public/tools/catalog.js';
import { toolkitJSON, SITE } from '../scripts/toolkit-json.mjs';
import { tally } from './_d1.mjs';

const { ok, done } = tally('toolkit-sync');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const json = JSON.parse(read('public/tools/catalog.json'));

ok(JSON.stringify(json) === JSON.stringify(toolkitJSON()), 'catalog.json is the catalog as it is now (else: node scripts/toolkit-json.mjs)');
ok(json.name === 'Growth Toolkit' && TOOLKIT_NAME === 'Growth Toolkit', 'one name: Growth Toolkit');
ok(json.categories.map((g) => g.name).join() === 'Personal leadership,Business', 'two lists: Personal leadership and Business');
ok(json.tools.length === CATALOG.length && json.tools.every((t) => CATEGORIES.some((g) => g.key === t.category)), 'every tool, each in its list');
const live = json.tools.filter((t) => !t.soon);
ok(live.every((t) => t.href.startsWith(`${SITE}/`) && t.head && t.art.startsWith('<svg') && t.strip.length === 2 && /^#[0-9A-F]{6}$/i.test(t.color)), 'each live tool: its address on linktolead, its cover, its colour');
ok(json.tools.filter((t) => t.soon).every((t) => !t.href && /Being built\.$/.test(t.sub)), 'being built: named, no link');
for (const g of json.categories) ok(live.filter((t) => t.category === g.key).length % 3 === 0, `${g.name}: live tools fill whole rows of three`);

const hub = read('public/tools/hub.js'), css = read('public/tools/tools.css');
ok(/class="dom-h"/.test(hub) && /<h2 id="g-\$\{g\.key\}">/.test(hub) && /Being built next:/.test(hub) && /free tools<\/span>/.test(hub), 'the toolkit page: each list with a large name, its count, and what is being built on one line');
ok(/\.dom-h h2\{font:500 clamp\(28px/.test(css) && /\.dom-h ~ \.shelf\{[^}]*repeat\(3,/.test(css), 'large list names, rows of three');

done();
