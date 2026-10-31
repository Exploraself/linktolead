/* The Massive Growth Plan, drawn (31 Oct 2026). Every word comes from
 * window.GrowthPlan (growth-plan.js); this file only draws it, so the text is
 * never copied into code. app.js puts it at the end of the North Star results
 * and handles the ticks; the tests run these same functions in Node.
 *
 * GrowthView.html(plan, { done, signedIn }) → the whole section
 * GrowthView.line(text)                     → one line: runs of ___ become a
 *                                             line to write on; "(day)" and
 *                                             "(date)" are drawn small
 * GrowthView.ids(plan)                      → every step id, in order */
(function (root) {
  'use strict';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${d.getDate()} ${MONTHS[d.getMonth()]}`; };

  /** One line of a step. A run of underscores is a blank to write on, as wide
   *  as the run (within reason); "(day)" and "(date)" are hints, drawn small. */
  function line(text) {
    return esc(text)
      // A quote or stop right after a blank stays on the blank's line.
      .replace(/(“?)(_{3,})(”?[.,:;]?)/g, (_, a, m, b) => `<span class="gp-bw">${a}<span class="gp-blank" style="--w:${Math.min(14, Math.max(4, Math.round(m.length * 0.45)))}em"><span class="gp-vh">blank</span></span>${b}</span>`)
      .replace(/\((day|date)\)/g, '<small class="gp-hint">($1)</small>');
  }

  const ids = (plan) => [...plan.domains.flatMap((d) => d.steps.map((s) => s.id)), plan.plus.id];

  function tick(step, at) {
    const on = !!at;
    return `<button type="button" class="gp-tick no-print" data-act="gp-tick" data-v="${esc(step.id)}" data-f="gp-${esc(step.id)}" aria-pressed="${on}"
      aria-label="${esc(step.title)}: ${on ? 'done' : 'not done yet'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>${on ? `<span class="gp-when">${esc(day(at))}</span>` : ''}`;
  }
  const foot = (plan, step, at) => `<div class="gp-foot"><p class="gp-done"><b>Done when</b> ${esc(step.done)}</p><span class="gp-tk">${tick(step, at)}</span></div>`;
  const top = (n, step) => `<div class="gp-top"><span class="gp-n">${n}</span><span class="gp-move">${esc(step.move)}</span></div>
      <h4 class="gp-t sf">${esc(step.title)}</h4>
      <p class="gp-truth"><i>${esc(step.truth)}</i></p>`;

  function html(plan, st) {
    const done = (st && st.done) || {}, all = ids(plan), count = all.filter((id) => done[id]).length;
    let n = 0;
    const steps = plan.domains.map((d) => `<div class="gp-dom" style="--c:${esc(d.col)}" data-k="${esc(d.k)}">
      <div class="gp-dh"><h3 class="sf">${esc(d.name)}</h3><span class="gp-ds">${esc(d.sub)}</span></div>
      <ol class="gp-steps">${d.steps.map((s) => { n += 1; return `<li class="gp-step${done[s.id] ? ' on' : ''}" id="gp-step-${esc(s.id)}">
        ${top(n, s)}
        <ul class="gp-lines">${s.lines.map((l) => `<li>${line(l)}</li>`).join('')}</ul>
        ${foot(plan, s, done[s.id])}</li>`; }).join('')}</ol></div>`).join('');
    const P = plan.plus;
    const plus = `<div class="gp-dom gp-plus">
      <ol class="gp-steps"><li class="gp-step${done[P.id] ? ' on' : ''}" id="gp-step-${esc(P.id)}">
        ${top(n + 1, P)}
        <ul class="gp-voices">${P.voices.map((v) => `<li><b class="sf">${esc(v.name)}</b><span>${esc(v.q)}</span></li>`).join('')}</ul>
        ${foot(plan, P, done[P.id])}
        <ul class="gp-dls">${P.downloads.map((d) => `<li><b class="sf">${esc(d.title)}</b><span>${esc(d.text)}</span>
          ${d.file ? `<a class="gp-dl" href="${esc(d.file)}">Download</a>` : `<a class="gp-soon" href="${esc(P.library)}">Coming soon to your Library</a>`}</li>`).join('')}</ul>
      </li></ol></div>`;
    return `<div class="gp-head">
      <h2 class="sf" id="gp-h">${esc(plan.name)}</h2>
      <p class="gp-sub">${esc(plan.subtitle)}</p>
      <p class="gp-tag">${plan.tagline}</p>
      <p class="gp-lead sf">${esc(plan.lead)}</p>
      <ol class="gp-moves">${plan.moves.map((m) => `<li>${esc(m)}</li>`).join('')}</ol>
      <div class="gp-prog" role="status"><span><b>${count}</b> of ${all.length} done</span><span class="gp-bar" aria-hidden="true"><i style="width:${Math.round((count / all.length) * 100)}%"></i></span></div>
    </div>
    ${steps}${plus}`;
  }

  root.GrowthView = { html, line, ids };
})(typeof window !== 'undefined' ? window : globalThis);
