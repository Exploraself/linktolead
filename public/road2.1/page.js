/* Road 2.1 (30 Oct): the hours slider, the first question, and the account
 * box. Light on purpose: no dependencies; the account box (account-box.js)
 * loads the first time it opens. Nothing slid or tapped here is saved or sent. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };

  /* 4 · Count it yourself: the hours given beyond the week they want. */
  var now = $('#s-now'), want = $('#s-want');
  function hours() {
    var n = +now.value, w = +want.value, extra = Math.max(0, n - w) * 52;
    $('#o-now').textContent = n + ' h';
    $('#o-want').textContent = w + ' h';
    $('#o-year').textContent = extra.toLocaleString('en-US') + ' h';
    $('#r-ask').textContent = extra
      ? 'Who got those hours last year, and who went without them?'
      : 'You work the week you want. Then the question is what each of those hours is buying you.';
  }
  if (now && want) { now.addEventListener('input', hours); want.addEventListener('input', hours); hours(); }

  /* 7 · Try the first question. The reading is the same plain words the
   * North Star uses for this answer; the other seven are inside. */
  var SAY = [
    '<b>Not yet.</b> That is the most useful place to start. The North Star begins there.',
    '<b>I think so.</b> Then the next step is to check it against your real week.',
    '<b>Mostly.</b> You have examples. The other seven questions show where it holds and where it slips.',
    '<b>Yes, I’ve checked.</b> Good. Now see whether your people, your business and your market are built around it.'
  ];
  document.querySelectorAll('.opts button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.opts button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $('#q1-say').innerHTML = SAY[+b.dataset.a] + ' Seven more questions, and your full reading, are in your North Star.';
    });
  });

  /* 5 · The four sides scan only while they are on screen. */
  var four = document.querySelector('.four');
  if (four) {
    try { new IntersectionObserver(function (es) { four.classList.toggle('run', es[0].isIntersecting); }).observe(four); }
    catch (e) { four.classList.add('run'); }
  }

  /* The account box: the FULL form, landing "road21". /road2.1/#join opens it. */
  var gate = $('#gate'), box = null;
  try { import('/forms.js').then(function (m) { m.rememberUtm(); }).catch(function () {}); } catch (e) { /* old browser */ }
  function loadBox() { return box || (box = import('/account-box.js').catch(function () { box = null; })); }
  function openGate(e) {
    var opener = e && e.currentTarget;
    gate.hidden = false;
    loadBox().then(function (m) { if (m) m.open({ gate: gate, opener: opener, stage: null, variant: 'full', landing: 'road21' }); });
  }
  document.querySelectorAll('[data-gate]').forEach(function (b) { b.addEventListener('click', openGate); });
  if (location.hash === '#join') {
    var has = false; try { has = !!localStorage.getItem('ftb-token'); } catch (e) { /* private mode */ }
    if (has) location.replace('/ground-plan/#home'); else openGate();
  }
})();
