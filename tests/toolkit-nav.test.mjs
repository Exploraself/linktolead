// Where to go from every Growth Toolkit page (Alexandru, 2 Nov 2026: "give
// them a little bit of navigation"; AGENTS.md rule 13): All tools · Base
// Camp · North Star in the bar, and on a tool page "Growth Toolkit › the
// tool". Never on /toolkit/: a page people reach from ads keeps one offer.

import { readFileSync } from 'node:fs';
import { tally } from './_d1.mjs';

const { ok, done } = tally('toolkit-nav');
const read = (p) => readFileSync(new URL(`../public/${p}`, import.meta.url), 'utf8');
const TOOLS = { runway: 'Cash runway', bottleneck: 'The bottleneck test', 'off-switch': 'The off-switch check', '12-days': '12 Days to Start Winning' };

for (const p of ['tools', ...Object.keys(TOOLS)]) {
  const h = read(`${p}/index.html`);
  const nav = (/<nav class="tk-nav"[^>]*>([\s\S]*?)<\/nav>/.exec(h) || [])[1] || '';
  ok(/href="\/tools\/"[^>]*>[\s\S]*?All tools/.test(nav) && /href="\/ground-plan\/"[\s\S]*?Base Camp/.test(nav) && /href="\/northstar\/"[\s\S]*?North Star/.test(nav), `/${p}/: All tools · Base Camp · North Star`);
  ok((nav.match(/<svg[^>]*aria-hidden="true"/g) || []).length === 3, `/${p}/: a small icon on each, hidden from screen readers (the words carry the meaning)`);
  ok(/aria-current="page"/.test(nav) === (p === 'tools'), `/${p}/: "All tools" is marked as the page you are on only on /tools/`);
  if (TOOLS[p]) ok(h.includes(`<nav class="tk-crumb" aria-label="You are here"><a href="/tools/">Growth Toolkit</a><span aria-hidden="true">›</span><span aria-current="page">${TOOLS[p]}</span></nav>`), `/${p}/: Growth Toolkit › ${TOOLS[p]}`);
}
ok(!/class="tk-nav"/.test(read('toolkit/index.html')) && !/class="tk-crumb"/.test(read('toolkit/index.html')), '/toolkit/ (the ads page) has no toolkit nav: one offer');
const tp = read('teleprompter/index.html');
ok(/aria-label="Where to go"[\s\S]*?href="\/tools\/"[\s\S]*?href="\/ground-plan\/"[\s\S]*?href="\/northstar\/"/.test(tp), '/teleprompter/: the same three ways out');
const css = read('tools/tools.css');
ok(/@media \(max-width:760px\)\{\.tk-bar \.in\{flex-wrap:wrap/.test(css), 'on a phone the nav takes its own row (no sideways scroll at 390px)');

done();
