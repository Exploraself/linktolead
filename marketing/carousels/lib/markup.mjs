// Text markup for every slide, kept tiny on purpose.
//   *word*      → the accent (gold; italic in the serif)
//   **word**    → bold
//   {{label}}   → a blank to fill, with its label under the line
//   \n          → a line break
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function md(s) {
  return esc(s)
    .replace(/\{\{([^}]*)\}\}/g, (_, l) => `<span class="blank"><span class="bl"></span><i>${l}</i></span>`)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<em class="acc">$1</em>')
    .replace(/\n/g, '<br>');
}

// Every stroked shape in an illustration draws itself in, one after another.
export function drawable(svg) {
  let i = 0;
  return svg.replace(/<(path|line|circle|rect|polyline|polygon|ellipse)\b(?![^>]*\bdata-still\b)/g, (m) => `${m} pathLength="1" class="s" style="--i:${i++}"`);
}
