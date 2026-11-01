/* The Founder Launchpad Action Plan (31 Oct 2026).
 *
 * The North Star gives five actions for one week, one in each domain. The
 * Launchpad gives the full plan: five actions in EACH domain, twenty in all,
 * over the three free weeks. Week 1 sets the ground, week 2 moves it, week 3
 * checks it. Every action names what to open, what to count and what to
 * write, and ends with a "done when" a founder can check on Sunday.
 *
 * Shown on Your Base Camp as a card with one button; downloaded as a real
 * PDF made in the browser by the same builder as the North Star plan
 * (/northstar/plan-pdf.js). The domain that needs the founder first (from
 * their North Star) is marked START HERE. No framework or tool names. */

export const DOMAIN_NAMES = { self: 'Lead yourself', people: 'Lead your people', work: 'Lead your business', market: 'Lead the market' };
const ORDER = ['self', 'people', 'work', 'market'];
export const WEEKS = [
  { n: 1, name: 'Week 1 · Set the ground' },
  { n: 2, name: 'Week 2 · Move it' },
  { n: 3, name: 'Week 3 · Check it' },
];

/** Five per domain, in the order they build. `w` is the week. */
export const ACTIONS = {
  self: [
    { w: 1, title: 'Count your week', why: 'You cannot lead time you have not counted.',
      lines: ['Open last week’s calendar. Hours on work only I can do: ____. Work anyone could do: ____. Time for me and mine: ____.',
        'The hour I would take back first: ________.'],
      done: 'three numbers written from the calendar, not from memory.' },
    { w: 1, title: 'Name your enough', why: 'Without a number for enough, the business decides for you.',
      lines: ['Your enough in money goes into Level 01 this week. Here, the rest: ____ free evenings a week, and time for ________.',
        'Open last week’s calendar. Hours I worked: ____. From now on, at most ____ hours a week.'],
      done: 'two lines written, and read out loud to someone close to you.' },
    { w: 2, title: 'Guard one block', why: 'What you protect on the calendar is what you actually believe matters.',
      lines: ['Every ________ (day), from ____ to ____, I work on ________ and nothing else.',
        'If someone asks for that time, I will say: “________________.”'],
      done: 'the block is in the calendar for the next three weeks, and you kept it twice.' },
    { w: 2, title: 'Make the decision you keep postponing', why: 'A decision you carry costs energy every day you do not make it.',
      lines: ['The decision I keep postponing: ________________.',
        'Waiting costs me ________ every week.',
        'I decide by ________ (date), and I tell ________.'],
      done: 'decided, and one person told.' },
    { w: 3, title: 'Count the promises you kept', why: 'Leading yourself is keeping the promises nobody else sees.',
      lines: ['In three weeks I kept ____ of my ____ blocks, and worked ____ hours against the ____ I set.',
        'What got in the way most: ________. From now on I will ________.'],
      done: 'the count written, and one rule changed for next month.' },
  ],
  people: [
    { w: 1, title: 'Map who carries the business', why: 'You cannot lead people you have not named.',
      lines: ['Everyone who helps the business run (team, freelancers, suppliers, family): ________ does ________, about ____ hours a week.',
        'Just me so far? The tools and people I lean on: ________________.'],
      done: 'every name written, with what they do.' },
    { w: 1, title: 'Count your clear asks', why: 'A frustration is often a request that was never made clearly.',
      lines: ['Open last week’s messages. Requests I made: ____ · with a date: ____ · with a picture of “done”: ____.',
        'The one I will make again, clearly: ________, by ________.'],
      done: 'three numbers counted from your messages, not from memory.' },
    { w: 2, title: 'Count what came back', why: 'The hours you hand over are the hours you can now lead with.',
      lines: ['The task I handed over in Level 01: ________. (No team yet? A tool, a template, or a freelancer for two hours.)',
        'Open your calendar. Hours it took me the week before: ____. Hours it took me this week: ____.',
        'What I did with the hours I got back: ________.'],
      done: 'both numbers taken from your calendar, and one line on where the hours went.' },
    { w: 2, title: 'Count the hard truths', why: 'If nobody tells you anything hard, it is not because there is nothing to say.',
      lines: ['Open this month’s messages and notes. People who told me something hard: ____. Who: ________.',
        'The last hard thing someone said, in their words: “________________.” What I did with it: ________.'],
      done: 'the number written, and the last hard thing in their own words.' },
    { w: 3, title: 'Count your thanks', why: 'What you name, people repeat.',
      lines: ['Open this week’s messages. Thanks that named what someone did: ____ · a quick “thanks”: ____.',
        'Whose work I have not named yet: ________.'],
      done: 'both numbers counted from your messages.' },
  ],
  work: [
    { w: 1, title: 'Know your number', why: 'Your enough becomes a target only when you know what one sale leaves you.',
      lines: ['One sale brings in $________. It costs me $________ and ____ hours of my time.',
        'So one sale leaves me $________, which is $________ for each hour of mine.'],
      done: 'the number written where you see it every day.' },
    { w: 1, title: 'Read last month’s money', why: 'Money you do not look at makes decisions for you.',
      lines: ['Open last month’s bank statement. In: $________. Out: $________. Left: $________.',
        'The three biggest costs: ________, ________, ________. The one I would question: ________.'],
      done: 'three numbers and three costs written from the statement.' },
    { w: 2, title: 'Write one process in ten lines', why: 'A process on paper is the first job that can leave your head.',
      lines: ['The thing I do most often: ________________.',
        'When ________ happens: 1 ________, 2 ________, 3 ________ … up to ten lines.',
        'Someone else could do it if they had ________.'],
      done: 'ten lines a stranger could follow.' },
    { w: 2, title: 'Find your cheapest hour', why: 'Your lowest-paid work quietly sets your real price.',
      lines: ['Last month my lowest-paid hour was on ________: about $____ an hour.',
        'Next time I will charge $________, change ________, or say no.'],
      done: 'one price changed, or one “no” said.' },
    { w: 3, title: 'Choose your Monday number', why: 'One number checked every week beats a dashboard you never open.',
      lines: ['Every Monday I check ________. Today it is ________.',
        'In three weeks I want it at ________. To get there I will ________.'],
      done: 'checked on three Mondays in a row, written down each time.' },
  ],
  market: [
    { w: 1, title: 'Name your best customer', why: 'Your next customers look like your best one.',
      lines: ['My best customer is ________. They came because ________________.',
        'They pay $________ and have stayed ________. What they value most: ________.',
        'No customers yet? The one person I most want to help: ________.'],
      done: 'one real person named, not a type.' },
    { w: 1, title: 'Hear it in their words', why: 'Their words sell better than yours.',
      lines: ['I asked ________, ________ and ________: “What made you choose me?” (No customers yet: “What is hardest about ________ for you, and what have you tried?”)',
        'The words they used: “________________________________”'],
      done: 'three conversations had, and their words written down.' },
    { w: 2, title: 'Count where clients came from', why: 'Your next clients come the way your last ones did, until you choose otherwise.',
      lines: ['Open your invoices. My last ten clients: from a referral ____ · repeat ____ · my network ____ · online ____ · other ____.',
        'The way I never ask for, and could: ________.'],
      done: 'every client counted from your invoices, not from memory.' },
    { w: 2, title: 'Count your asks since Level 01', why: 'Clients come from asking, not from being ready.',
      lines: ['Open your messages since Level 01. Asks made: ____ · yes: ____ · no: ____ · no answer: ____.',
        'The person I will ask again, kindly, this week: ________.'],
      done: 'four numbers counted, and one person asked again.' },
    { w: 3, title: 'Count your conversations', why: 'What you count every Friday is what grows.',
      lines: ['This week: people I talked to ____ · asked ____ · said yes ____.',
        'Next week I will talk to ____ more, starting with ________.'],
      done: 'the three numbers written on three Fridays.' },
  ],
};

/** The plan for the PDF builder. `thin`: the domain key that needs them first. */
export function launchpadPlan({ first = '', full = '', stage = '', thin = '', logo = '' } = {}) {
  const date = (() => { try { return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); } catch { return ''; } })();
  const start = DOMAIN_NAMES[thin] ? thin : '';
  const actions = [];
  for (const wk of WEEKS) {
    for (const d of ORDER) {
      ACTIONS[d].forEach((a, i) => {
        if (a.w !== wk.n) return;
        actions.push({ section: wk.name, domain: `${DOMAIN_NAMES[d]} · ${i + 1} of 5`, title: a.title, why: a.why, lines: a.lines, done: a.done,
          start: !!start && d === start && i === 0 });
      });
    }
  }
  const recap = [];
  if (stage) recap.push(['Where you are', stage]);
  if (start) recap.push(['Start here', `${DOMAIN_NAMES[start]}: the side that needs you first, from your North Star`]);
  recap.push(['Three weeks', 'Week 1: actions 1–8 · Week 2: 9–16 · Week 3: 17–20']);
  recap.push(['Your free weeks', 'The Founder Launchpad, levels 01–03 of The Founder’s Blueprint']);
  return {
    name: full, date, logo,
    brand: 'The Founder’s Blueprint', footName: 'The Founder Launchpad Action Plan',
    title: `${first ? first + '’s' : 'Your'} Launchpad Action Plan`,
    subtitle: 'Twenty actions for three weeks. Five in each domain.',
    recap,
    intro: `Week 1 sets the ground, week 2 moves it, week 3 checks it. In each domain the five actions build in order. Fill in the blanks with a pen, not in your head.${start ? ` Start where it says START HERE.` : ''} Every Sunday, ten minutes: read what you wrote, and pick next week’s one move.`,
    actions,
    closing: { title: 'When you’re ready, one hour with Alexandru opens the next two weeks.',
      lines: ['Bring this plan to The Boardroom. Alexandru and the team read it with you and help you choose the one road that matters most. It opens levels 04 and 05 of The Founder’s Blueprint.'],
      cta: 'YOUR BASE CAMP', url: 'linktolead.exploraself.com/ground-plan', mentor: 'ExploraSelf · exploraself.com · Mentor: Alexandru Cojocari' },
  };
}

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STYLE = `.lpp{max-width:1080px;margin:0 auto 28px;padding:0 24px}
.lpp-in{border:1px solid rgba(180,151,95,.55);border-radius:16px;padding:clamp(20px,3.4vw,32px);background:linear-gradient(160deg,#FFFDF8,#F6EEDD);display:flex;flex-direction:column;gap:16px}
.lpp-eb{margin:0;font:600 11px/1.2 Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#7A5C16}
.lpp h2{margin:0;font:440 clamp(24px,3.2vw,32px)/1.15 Newsreader,Georgia,serif;color:#14100B}
.lpp h2 i{color:#8A6A2A}
.lpp p.lpp-l{margin:0;font-size:15px;line-height:1.6;color:#4A3F33;max-width:720px}
.lpp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.lpp-d{border-top:2px solid #B4975F;padding-top:10px;min-width:0}
.lpp-d.start{border-top-color:#A8623A}
.lpp-d h3{margin:0 0 6px;font:600 13px/1.3 Inter,Arial,sans-serif;color:#14100B;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.lpp-d h3 em{font-style:normal;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#FFF7EE;background:#A8623A;border-radius:999px;padding:2px 8px}
.lpp-d ol{margin:0;padding-left:18px;font-size:13.5px;line-height:1.55;color:#4A3F33}
.lpp-acts{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.lpp-go{min-height:48px;padding:0 22px;border-radius:999px;border:0;background:#14100B;color:#F6EEDD;font:600 14px Inter,Arial,sans-serif;cursor:pointer}
.lpp-go:hover,.lpp-go:focus-visible{background:#B4975F;color:#14100B;outline:none}
.lpp-go:disabled{opacity:.6;cursor:wait}
.lpp-note{font-size:13px;color:#5F5648}
@media (max-width:860px){.lpp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:520px){.lpp-grid{grid-template-columns:1fr}}
:root[data-theme="dark"] .lpp-in{background:linear-gradient(160deg,#1C150E,#120D08);border-color:#3A2E1F}
:root[data-theme="dark"] .lpp h2,:root[data-theme="dark"] .lpp-d h3{color:#F1E8D6}
:root[data-theme="dark"] .lpp h2 i,:root[data-theme="dark"] .lpp-eb{color:#D6BF8F}
:root[data-theme="dark"] .lpp p.lpp-l,:root[data-theme="dark"] .lpp-d ol,:root[data-theme="dark"] .lpp-note{color:#CFC3AA}
:root[data-theme="dark"] .lpp-go{background:#D6BF8F;color:#14100B}
@media print{.lpp{display:none}}`;

/** The Base Camp card: what is inside, and one button. */
export function launchpadCardHTML({ thin = '' } = {}) {
  if (typeof document !== 'undefined' && !document.getElementById('lpp-style')) {
    const st = document.createElement('style'); st.id = 'lpp-style'; st.textContent = STYLE; document.head.appendChild(st);
  }
  return `<section class="lpp" aria-label="Your Launchpad Action Plan"><div class="lpp-in">
    <p class="lpp-eb">The Founder Launchpad · your action plan · PDF</p>
    <h2>Twenty actions. Five in each domain. <i>Fill in the blanks.</i></h2>
    <p class="lpp-l">Your three free weeks, in the order they build: what to open, what to count, what to write. With your name and today’s date. Yours to keep, at no cost.</p>
    <div class="lpp-grid">${ORDER.map((d) => `<div class="lpp-d${d === thin ? ' start' : ''}"><h3>${esc(DOMAIN_NAMES[d])}${d === thin ? '<em>Start here</em>' : ''}</h3><ol>${ACTIONS[d].map((a) => `<li>${esc(a.title)}</li>`).join('')}</ol></div>`).join('')}</div>
    <div class="lpp-acts"><button type="button" class="lpp-go" data-lpp>Download my Launchpad Action Plan ↓</button><span class="lpp-note" role="status" id="lpp-msg"></span></div>
  </div></section>`;
}

let logoCache = null;
function logoData() {
  if (logoCache) return logoCache;
  logoCache = fetch('/northstar/assets/logo.webp').then((r) => (r.ok ? r.blob() : null))
    .then((b) => b && new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = () => ok(''); fr.readAsDataURL(b); }))
    .catch(() => '');
  return logoCache;
}

/** Make and download the PDF. */
export async function downloadLaunchpadPlan(btn, info) {
  const msg = typeof document !== 'undefined' ? document.getElementById('lpp-msg') : null;
  if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Making your plan…'; }
  try {
    const [{ makePlanPDF }, logo] = await Promise.all([import('/northstar/plan-pdf.js'), logoData()]);
    const blob = await makePlanPDF(launchpadPlan({ ...info, logo: logo || '' }));
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${(info.first || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-launchpad-action-plan.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    if (msg) msg.textContent = 'Your Launchpad Action Plan is downloaded.';
  } catch { if (msg) msg.textContent = 'Your browser would not make the PDF. Try again in a moment.'; }
  if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t || 'Download my Launchpad Action Plan ↓'; }
}
