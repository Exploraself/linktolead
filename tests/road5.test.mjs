// /road5/: The Boardroom for people from ads (Alexandru, 2 Nov 2026). One
// offer, no links out but the legal ones, every button to the Boardroom's pay
// page with its own landing, no money-back line on this $27 page, and the
// founder's taps never leave the page. Since 3 Nov (an Offer Master run): one
// question on the first screen, the weeks drawn as tally marks, and anonymous
// moments counted (page and moment only) so the test can be read.
import fs from 'node:fs';
import { tally } from './_d1.mjs';

const { ok, done } = tally('road5');
const page = fs.readFileSync(new URL('../public/road5/index.html', import.meta.url), 'utf8');
const hrefs = [...page.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith('/assets/') && !h.startsWith('/northstar/assets/'));
ok(hrefs.filter((h) => h.startsWith('/pay/')).length >= 4 && hrefs.filter((h) => h.startsWith('/pay/')).every((h) => h === '/pay/?step=session&amp;from=road5'), 'every button: the Boardroom pay page, landing road5');
ok(hrefs.every((h) => h.startsWith('/pay/') || h === 'https://exploraself.com/privacy' || h === 'https://exploraself.com/terms'), 'no links out but privacy and terms');
ok(!/money back|14 days/i.test(page), 'no money-back line on this page');
ok(!/fetch\(|sendBeacon|XMLHttpRequest/.test(page) && page.includes("import { count, trackScroll } from '/road-kit.js';") && !/count\('road5', [^)]*pain[^_]/.test(page), 'the taps stay on the page; only anonymous moments are counted (road-kit, page and moment)');
ok(page.includes('data-tally') && page.indexOf('data-pains') < page.indexOf('id="h-how"') && page.includes('The next thirteen, if nothing changes'), 'the first screen: one question, then the weeks drawn as tally marks with the next thirteen');
ok(/utm_/.test(page) && /keep/.test(page), "the ad's utm tags ride along to the pay page");
ok(/class="ill plan how-plan rv"/.test(page) && page.indexOf('class="ill plan') > page.indexOf('id="h-how"'), 'the table plan opens How it works');
ok(page.indexOf('id="h-alx"') < page.indexOf('id="h-how"'), 'the proof (Alexandru, across the table) comes before How it works');
ok(/prefers-reduced-motion/.test(page), 'motion respects reduced motion');
done();
