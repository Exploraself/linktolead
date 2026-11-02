/* /12-days/: 12 Days to Start Winning (2 Nov 2026). The cover, the promise,
 * the access step (the same rule as every tool: a full free account), then
 * one button to subscribe. Then "You’re in" and the twelve principles'
 * titles, which the server sends only once the founder has subscribed.
 * The letters themselves are functions/_twelve-days.js. */
import { TOOLS } from '/tools/catalog.js';
import { access, record, uses, flush } from '/tools/access.js';
import { cover } from '/tools/cover.js';

const C = TOOLS['twelve-days'];
const main = document.getElementById('main');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

main.innerHTML = `<section class="open" aria-label="${esc(C.name)}">
    ${cover(C, { h1: true })}
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="acc promise">
        <p class="eb">12 Days to Start Winning</p>
        <h2>One principle and one move each morning. By Day 12 you have made 12 moves.</h2>
        <ul>
          <li>A letter from Alexandru at 8:00 your time, for 12 mornings.</li>
          <li>In each: one principle from A New Way of Winning, in plain words. One small step you can take that day. One question you can answer by replying.</li>
          <li>On Day 13, what comes next. Then the letters stop.</li>
        </ul>
      </div>
      <div id="access"></div>
    </div>
  </section>`;
const box = document.getElementById('access');

/** The titles, numbered. */
const titles = (list) => `<p class="eb" style="margin-top:6px">The twelve principles</p>
  <ol class="titles">${list.map((t, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(t)}</span></li>`).join('')}</ol>
  <p class="fine">One each morning, with one move. Unsubscribe in one tap at the foot of any letter.</p>`;

/** "You’re in": just now (`fresh`), or earlier (the state from the server). */
function inside(r, fresh) {
  const w = r.twelve || { day: 0 };
  const off = !!r.lettersOff;
  const head = off ? 'You’re subscribed, but your letters are switched off.'
    : fresh ? 'You’re in: your first letter arrives tomorrow at 8:00 your time.'
    : w.done ? 'You walked all twelve days.'
    : w.day >= 12 ? 'You’re in. Day 12 of 12 has arrived; what comes next arrives at 8:00 your time.'
    : w.day > 0 ? `You’re in. Day ${w.day} of 12 has arrived; the next one comes at 8:00 your time.`
    : 'You’re in: your first letter arrives at 8:00 your time.';
  const line = off ? 'This account unsubscribed from letters, so nothing will arrive. To get the 12 days, turn on “Letters from your mentor” in the menu under your name at <a href="/ground-plan/">Your Base Camp</a>. The next letter then comes at 8:00 your time.'
    : fresh && r.welcome ? 'A short welcome from Alexandru is on its way to you now.'
    : w.done ? 'Alexandru and the team are still here: reply to any letter, any time.' : '';
  box.innerHTML = `<div class="acc">
    <p class="eb">12 Days to Start Winning</p>
    <h2 class="done-h" tabindex="-1" data-focus>${esc(head)}</h2>
    ${line ? `<p class="lede">${line}</p>` : ''}
    ${Array.isArray(r.principles) && r.principles.length ? titles(r.principles) : ''}
  </div>`;
  const h = box.querySelector('[data-focus]'); if (h && fresh) h.focus({ preventScroll: true });
}

/** The one button, once the account is in place: subscribe. */
async function subscribe(who) {
  if (who && who.preview) {
    box.innerHTML = `<div class="acc"><p class="eb">Preview copy</p><h2 class="done-h" tabindex="-1" data-focus>This is where “You’re in” appears.</h2>
      <p class="lede">Subscribing needs an account, and accounts are switched off on a preview copy, so nothing was saved or sent. On linktolead.exploraself.com the twelve principles appear here after subscribing.</p></div>`;
    box.querySelector('[data-focus]').focus({ preventScroll: true });
    return;
  }
  box.innerHTML = '<div class="acc" aria-busy="true"><p class="lede" role="status">One moment…</p></div>';
  const r = await record('twelve-days', 'subscribe');
  if (r && r.ok) return inside(r, !r.already);
  if (r && r.status === 403) return start();
  box.innerHTML = `<div class="acc"><h2>That did not go through.</h2><p class="lede" role="alert">${esc((r && r.error) || 'We could not reach the subscription just now. Check your connection and try again.')}</p>
    <div class="arow"><button type="button" class="go" data-again>Try again</button></div></div>`;
  box.querySelector('[data-again]').addEventListener('click', () => subscribe(who));
}

function start() { access(box, { tool: C, onOpen: subscribe }); }

(async () => {
  flush();
  const u = await uses();
  if (u && u.ok && u.twelve) return inside(u, false);
  start();
})();
