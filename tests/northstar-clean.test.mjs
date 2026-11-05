// The Leader's North Star, the clean look (Alexandru, 5 Nov 2026): white,
// one easy-to-read font, hairlines, the four-domain wheel kept; the look only,
// the words and the flow unchanged. And "How the North Star works": a link to
// the presentation page, /north1/, in the left menu and in the phone's Menu.
import { readFileSync } from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('northstar-clean');
const html = readFileSync('public/northstar/index.html', 'utf8'), css = readFileSync('public/northstar/clean.css', 'utf8'),
  js = readFileSync('public/northstar/clarity.js', 'utf8'), readme = readFileSync('public/northstar/README.md', 'utf8');

// The look, loaded last.
const at = (s) => html.indexOf(s);
ok(at('href="clean.css"') > at('href="crown.css"') && at('href="crown.css"') > 0, 'clean.css loads after crown.css, so it decides the look');
ok(html.split('href="clean.css"').length === 2, 'clean.css is loaded once');
ok(/font-family:'Atkinson Hyperlegible'/.test(css) && html.includes('href="/assets/fonts.css"'), 'the text is in Atkinson Hyperlegible (AGENTS.md rule 11), from the shared fonts');
ok(/\.cf:not\(\[data-theme="dark"\]\) \.side\{background:#FFFFFF/.test(css), 'the left menu is white');
ok(/\.cf:not\(\[data-theme="dark"\]\) \.hz\{background:#FFFFFF/.test(css) && /\.hz \.hz-sky\{display:none\}/.test(css), 'the hero is white, without the star sky');
ok(/\.hz-go\{background:var\(--ink\);color:#FFFFFF/.test(css), '"Show me my road" is one dark, round button');
ok(/#s-whatif\.nslocked\{background:none/.test(css), 'Part 4 waits as one quiet line, like Parts 2 and 3');
ok((css.match(/:not\(\[data-theme="dark"\]\)/g) || []).length > 40 && !/\.cf\[data-theme="dark"\][^{]*\.side\{background:#FFFFFF/.test(css), 'the light changes stay out of the dark theme');

// The wheel stays, word for word.
ok(html.includes('<path id="cmp-ring"') && html.includes('PURPOSE · JUDGMENT · ENERGY · TRUST · BOUNDARIES · CONVERSATIONS · OFFER · COST · SYSTEMS · CUSTOMERS · DEMAND · IMPACT ·'), 'the hero wheel and its ring of words are unchanged');
ok(['Lead</tspan><tspan x="262" dy="19">yourself', 'Lead your</tspan><tspan x="262" dy="19">people', 'Lead your</tspan><tspan x="138" dy="19">business', 'Lead the</tspan><tspan x="138" dy="19">market'].every((t) => html.includes(t)), 'the four domains sit where they were');
ok(/<span class="hz-w hz-l sf">From founder<\/span>/.test(html) && html.includes('<span class="hz-w hz-r sfi">to intentional leader.</span>'), 'the headline is unchanged');

// How the North Star works.
const link = '/north1/?utm_source=northstar&amp;utm_medium=menu';
ok(new RegExp('<a class="ns-intro" href="' + link.replace(/[?.]/g, '\\$&') + '">[\\s\\S]*?</a>\\s*<div class="side-extra"[^>]*>YOUR NEXT CHAPTER</div>').test(html) && html.indexOf('class="ns-intro"') < html.indexOf('id="nav"'), 'the link is first in the left menu, above the four parts (5 Nov)');
ok(/<aside class="side"[\s\S]*class="ns-intro"[\s\S]*How the North Star works[\s\S]*<\/aside>/.test(html), 'the link says "How the North Star works", inside the left menu');
const rowA = js.indexOf("'/north1/?utm_source=northstar&utm_medium=menu', IC.info, 'How the North Star works'"), rowB = js.indexOf("'How to use this'");
ok(rowA > 0 && rowB > rowA && js.indexOf('const ROWS = [\n  [\'a\', \'/north1/') > 0, 'the phone Menu has the same link, as its first row');
// Blue and flashing for two minutes, then calm; once opened, never again (Alexandru, 5 Nov 2026).
ok(/\.cf \.side a\.ns-intro\{color:#3E6A94/.test(css) && /\.cf \.side a\.ns-intro\.flash\{background:#3E6A94;color:#FFFFFF[^}]*animation:nsIntroPulse/.test(css), 'the link is blue, and blue-filled while it flashes');
ok(css.includes('@media (prefers-reduced-motion:reduce){.cf .hz-go{transition:none}.cf .side a.ns-intro.flash{animation:none}}'), 'no flashing for people who turn motion off');
ok(/INTRO_SEEN = 'ns-intro-opened', INTRO_MS = 120000/.test(js) && /try \{ seen = localStorage\.getItem\(INTRO_SEEN\) === '1'; \} catch/.test(js), 'it flashes for two minutes, and remembers on this browser once opened (every access guarded)');
ok(/closest\('a\[href\^="\/north1\/"\]'\)[\s\S]{0,200}localStorage\.setItem\(INTRO_SEEN, '1'\)[\s\S]{0,120}classList\.remove\('flash'\)/.test(js), 'opening it (left menu or phone Menu) stops the flashing for good');
ok(/if \(seen \|\| !a\) return;\s*a\.classList\.add\('flash'\)/.test(js), 'once opened, it never flashes again');
ok(/@media \(max-width:860px\)\{[^}]*\.side \.ns-intro\{display:none !important\}/.test(css), 'on a phone the link lives in the Menu only');
ok(readme.includes('clean.css') && readme.includes('/north1/'), 'the README says where the look and the link live');

// House words.
const words = (css + html.match(/<a class="ns-intro"[\s\S]*?<\/a>/)[0]).toLowerCase();
ok(!/most founders|incubator|constellation/.test(words), 'no forbidden words in the new look or the link');
done();
