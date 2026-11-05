// The North Star: Back and Next right next to the question (Alexandru, 5 Nov 2026:
// "we want the user not to move the finger too much or the mouse, everything close").
import { readFileSync } from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('northstar-back-next');
const app = readFileSync('public/northstar/app.js', 'utf8'), css = readFileSync('public/northstar/crown.css', 'utf8');

// The markup: one footer, right after the answers, inside the question's column; the key hint after it.
const q = app.indexOf('<div class="nsb-opts" role="group" aria-labelledby="qt-'), qFoot = app.indexOf('${foot}', q), qKeys = app.indexOf('<p class="nsb-keys"><kbd>1–4</kbd>', q);
ok(q > 0 && qFoot > q && qKeys > qFoot, 'a question: the answers, then Back and Next, then the key hint');
const t = app.indexOf('<div class="nsb-opts" role="group" aria-labelledby="taps-h">'), tFoot = app.indexOf('${foot}', t), tKeys = app.indexOf('<p class="nsb-keys"><kbd>1–${T.list.length}</kbd>', t);
ok(t > 0 && tFoot > t && tKeys > tFoot, 'the taps pages: the answers, then Back and Next, then the key hint');
ok((app.match(/<footer class="nsb-foot">/g) || []).length === 1 && /const foot = `<footer class="nsb-foot">/.test(app), 'one footer, drawn once and placed by both pages');
ok(/tapsPage\(tap, qi \+ 1, total, foot\)/.test(app), 'the taps pages get the same footer');

// The look: close to the answers, never pinned to the bottom of a phone.
ok(css.includes('.nsb-foot{margin-top:14px;display:flex;') && !/\.nsb-foot\{margin-top:auto/.test(css), 'on a computer: 14px under the answers, not pushed to the bottom of the card');
ok(!css.includes('body.nsq-full .nsb-foot{position:fixed'), 'on a phone: no longer pinned to the bottom of the screen');
ok(css.includes('body.p2-full #p2>.card.cur{border:0;box-shadow:none;padding:6px 2px}'), 'Part 2 on a phone: the card no longer fills the screen, so Back and Next follow the answers');
// Part 3, Your numbers: Back beside Next under each group, on the left (no longer one button alone at the far right).
ok(/class="nsg-nav"[^>]*>\s*\$\{i > 0 \? `<button type="button" data-act="grp" data-i="\$\{i - 1\}"[^`]*← Back<\/button>` : ''\}\s*<button type="button" data-act="grp" data-i="\$\{i \+ 1\}"/.test(app) && !/data-f="grp-next-\$\{i\}" style="align-self: flex-end/.test(app), 'Part 3: Back beside Next under each group, on the left');
// Before you start: Back beside Next already (clarity.js).
ok(/<div class="bys-btns">\$\{bys > 0 \? '<button type="button" class="bys-back"/.test(readFileSync('public/northstar/clarity.js', 'utf8')), 'Before you start: Back beside Next');
done();
