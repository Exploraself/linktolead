/* A tool's cover, from its catalog.js entry (the approved design, 2 Nov
 * 2026): the kicker, the headline, the curiosity line, the picture and the
 * bottom strip. `h1`: the cover is the page's own heading. `small`: the
 * covers on /toolkit/. */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** The headline keeps its <em> and nothing else. */
const headline = (h) => esc(h).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');

export function cover(t, { h1 = false, small = false } = {}) {
  const c = t.cover, H = h1 ? 'h1' : 'p';
  return `<div class="cover${small ? ' small' : ''}" data-tone="${esc(c.tone)}">
    <p class="k">${esc(c.kicker)}</p>
    <${H} class="h">${headline(c.h)}</${H}>
    <p class="sub">${esc(c.sub)}</p>
    ${c.svg}
    <div class="strip"><span>${esc(c.strip[0])}</span><b>${esc(c.strip[1])}</b></div>
  </div>`;
}
