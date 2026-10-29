/* Tap a number on the sales page to type it exactly. The slider jumps to the
 * nearest place; the maths keeps the typed value, even above the slider's
 * top. Percentages stop at 100. Loaded by sales.js on the first tap. */
export function edit(span, { val, RANGES, LADDER, PERCENT, posOf, redraw }) {
  const k = span.dataset.edit, slider = document.querySelector(`[data-in="${k}"]`);
  if (!slider || span.querySelector('input')) return;
  const [min, max] = RANGES[k] || [0, Infinity];
  const box = document.createElement('input');
  box.type = 'text'; box.inputMode = 'numeric'; box.className = 'numbox'; box.value = String(val[k]);
  box.setAttribute('aria-label', (slider.labels && slider.labels[0] ? slider.labels[0].textContent : k) + ', exact number');
  const keepText = span.textContent; span.textContent = ''; span.appendChild(box); box.focus(); box.select();
  let done = false;
  const commit = (save) => {
    if (done) return; done = true;
    const typed = Number(String(box.value).replace(/[^\d.]/g, ''));
    span.textContent = keepText;
    if (save && box.value.trim() !== '' && Number.isFinite(typed)) {
      val[k] = Math.max(min, PERCENT.has(k) ? Math.min(100, typed) : typed);
      slider.value = String(LADDER[k] ? posOf(LADDER[k], val[k]) : Math.min(max, val[k]));
      slider.setAttribute('aria-valuetext', String(val[k]));
    }
    redraw(k);
    span.focus();
  };
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') { e.preventDefault(); commit(false); } });
  box.addEventListener('blur', () => commit(true));
}
