// 30 Oct: the Compass asks outsiders for the full account, any account opens
// the whole Compass, the Compass banner in the programme (first five visits),
// the profile menu on the Compass and in the incubator, and one share preview.
import fs from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('compass-access');
const read = (f) => fs.readFileSync(f, 'utf8');
const compass = read('public/compass/app.js'), box = read('public/account-box.js'), app = read('public/app.js');

// The Compass: outsiders make the full account; signed-in founders see all.
ok(/function gated\(change\)[\s\S]{0,200}if \(!signedIn\(\)\) fullAccount\(\)/.test(compass), 'a first answer without an account opens the full account form');
ok(/variant: 'full', landing: 'compass', stay: true/.test(compass), 'the Compass form is the full one (password, company, interest, industry), landing "compass"');
ok(!/createAccount\(fromSales \? 'sales-page' : 'compass', true\)/.test(compass), 'no quiet simple account from the Compass any more');
ok(/if \(!signedIn\(\)\) \{ fullAccount\(\); return; \}/.test(compass), '"Email me my results" without an account: the full form first');
ok(/if \(ctx\.stay\) location\.reload\(\)/.test(box) && /OPEN MY COMPASS →/.test(box), 'after the form: back on the Compass, signed in');
ok(/stay \? '' : '<button type="button" data-close[^']*Not now/.test(box), 'no "Not now" on the Compass: the account is required');
ok(/const r = await A\.pull\(\);[\s\S]{0,300}S\.profile/.test(compass), 'an account from any page: the Compass knows the founder');
ok(read('public/compass/index.html').includes('<div id="acct-gate" hidden></div>'), 'its own box, apart from the Compass sign-in box');

// The Compass banner in the programme.
ok(/CB_TIMES = 5/.test(app) && /function compassBanner\(\)/.test(app) && /href="\/compass\/"/.test(app), 'the Compass banner, for five visits, links to /compass/');
ok(/dataset\.cban === 'close'\) \{ cbSet\(CB_TIMES\)/.test(app), 'closing it ends it early');
ok(read('public/style.css').includes('.cban,.cban::after,.cban-needle{animation:none}'), 'still with reduced motion');

// The profile menu, both places.
ok(compass.includes("import('/profile-menu.js')") && app.includes("import('/profile-menu.js')"), 'profile menu on the Compass and in the incubator');
ok(read('public/start/index.html').includes('<div id="pmhost"></div>') && read('public/compass/index.html').includes('id="top-tools"'), 'its places in both headers');
const src = read('public/profile-menu.js');
ok(/signupType === 'simple' && !me\.hasPassword/.test(src) && src.includes("'Change my password'") && src.includes("premium: 'The Summit'"), 'menu: password only for full accounts, step names');
ok(/key === 'Escape'/.test(src) && /!root\.contains\(e\.target\)/.test(src), 'Escape and a click outside close it');

// One share preview everywhere.
for (const f of ['public/road1/index.html', 'public/road2/index.html', 'public/road3/index.html', 'public/start/index.html', 'public/compass/index.html']) {
  const h = read(f);
  ok(h.includes('https://linktolead.exploraself.com/compass/assets/og-image.png') && h.includes('assets/favicon.svg') && h.includes('summary_large_image'), `${f}: the Compass share image and icon`);
}
done();
