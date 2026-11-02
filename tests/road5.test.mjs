// /road5/: The Boardroom for people from ads (Alexandru, 2 Nov 2026). One
// offer, no links out but the legal ones, every button to the Boardroom's pay
// page with its own landing, no money-back line on this $27 page, and the
// founder's taps never leave the page.
import fs from 'node:fs';
import { tally } from './_d1.mjs';

const { ok, done } = tally('road5');
const page = fs.readFileSync(new URL('../public/road5/index.html', import.meta.url), 'utf8');
const hrefs = [...page.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith('/assets/') && !h.startsWith('/northstar/assets/'));
ok(hrefs.filter((h) => h.startsWith('/pay/')).length >= 4 && hrefs.filter((h) => h.startsWith('/pay/')).every((h) => h === '/pay/?step=session&amp;from=road5'), 'every button: the Boardroom pay page, landing road5');
ok(hrefs.every((h) => h.startsWith('/pay/') || h === 'https://exploraself.com/privacy' || h === 'https://exploraself.com/terms'), 'no links out but privacy and terms');
ok(!/money back|14 days/i.test(page), 'no money-back line on this page');
ok(!/fetch\(|sendBeacon|XMLHttpRequest/.test(page), 'the three questions stay on the page: nothing is sent');
ok(/utm_/.test(page) && /keep/.test(page), "the ad's utm tags ride along to the pay page");
ok(/class="ill plan"/.test(page) && page.indexOf('class="ill plan"') < page.indexOf('id="h-qs"'), 'the table plan opens the page');
ok(/prefers-reduced-motion/.test(page), 'motion respects reduced motion');
done();
