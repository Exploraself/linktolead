// What a discovery call is about (Alexandru, 3 Nov 2026: "in /mentor I have
// to see what this discovery is connected to: the LAB, the HUB, the Summit or
// wherever else … the Boardroom 1:1 is for who unlocks the Boardroom").

import { readFileSync } from 'node:fs';
import { ABOUT, aboutOf } from '../functions/_booking.js';
import { bookingNotice } from '../functions/_letters.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('discovery-about');
const read = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

ok(ABOUT.lab === 'The LAB' && ABOUT.hub === 'The HUB' && ABOUT.summit === 'The Summit' && aboutOf('hub') === 'hub' && aboutOf('<script>') === '' && aboutOf('') === '', 'known words only: the LAB, the HUB, the Summit, the pages and assessments');
const N = bookingNotice('https://linktolead.exploraself.com', { name: 'Ana', email: 'a@x.com', kind: 'discovery', times: [], about: 'The HUB' });
ok(/About: The HUB/.test(N.text), 'Alexandru’s booking email says what the call is about');
const api = read('functions/api/book.js'), page = read('public/book/book.js'), ui = read('public/mentor/mentor.js');
ok(/student_id, about\) VALUES/.test(api) && api.includes('aboutOf(body.about)'), 'the booking keeps what it is about');
ok(page.includes("q.get('about') || q.get('utm_medium')") && page.includes('about: ABOUT_KEY'), 'the page sends it, from ?about= or the utm_medium the links already carry');
ok(ui.includes('function bookAboutHTML(b, s)') && ui.includes("'not said (a direct link)'") && ui.includes('Needs first:'), '/mentor: About, and who asks (step, levels, company, interest, the side that needs them first)');
const summit = read('public/northstar/summit/index.html');
ok((summit.match(/\/book\/discovery\/\?about=summit/g) || []).length === 2, 'The Summit: “Book a call” and “Prefer to talk first?” open the discovery call, about the Summit');
ok(read('public/book/boardroom/index.html') && read('public/book/book.js').includes("KIND === 'boardroom'"), 'the Boardroom 1:1 stays for founders who unlocked The Boardroom');
done();
