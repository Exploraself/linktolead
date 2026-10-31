/* Full screen, for the Founder's Blueprint and the Leader's North Star.
 * Any button with data-fs toggles it. Where the browser cannot (an iPhone),
 * the button is not shown at all. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var can = !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
  var on = function () { return !!(d.fullscreenElement || d.webkitFullscreenElement); };
  var ENTER = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var LEAVE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  function paint() {
    var bs = d.querySelectorAll('[data-fs]');
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!can) { b.hidden = true; continue; }
      b.innerHTML = on() ? LEAVE : ENTER;
      b.setAttribute('aria-pressed', String(on()));
      b.setAttribute('aria-label', on() ? 'Leave full screen' : 'Full screen');
      b.title = on() ? 'Leave full screen (Esc)' : 'Full screen';
    }
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-fs]');
    if (!b || !can) return;
    try {
      if (on()) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    } catch (x) { /* the browser said no; nothing changes */ }
  });
  d.addEventListener('fullscreenchange', paint);
  d.addEventListener('webkitfullscreenchange', paint);
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', paint); else paint();
})();
