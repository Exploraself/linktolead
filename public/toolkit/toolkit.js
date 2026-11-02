/* /toolkit/: one offer, one button. A full account goes straight to the
 * Tools page; anyone else makes (or completes) the free account first, one
 * field at a time (public/tools/gate.js). */
import { CATALOG, coverHTML } from '/tools/catalog.js';
import * as G from '/tools/gate.js';

const $ = (id) => document.getElementById(id);
$('covers').innerHTML = CATALOG.filter((c) => !c.soon).map((c) => coverHTML(c)).join('');
const home = () => { location.href = '/tools/'; };

$('go').addEventListener('click', async () => {
  const st = await G.state();
  if (st.kind === 'full') return home();
  const panel = $('panel'); panel.hidden = false;
  G.open($('gate'), { name: 'my toolkit', path: '/tools/', st: st.kind === 'offline' ? { kind: 'guest' } : st, ready: home, cancel: () => { panel.hidden = true; $('go').focus(); } });
  panel.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});
