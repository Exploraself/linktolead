/* ExploraSelf Leader’s North Star: the intelligence.
 *
 * How the North Star asks, scores and answers, as plain rules. The logic and the
 * copy follow "00 Leader’s North Star · The Intelligence" (Drive): eight
 * questions for the stage today, two per domain; a band per domain (Needs you
 * now / Taking shape / A strength) that picks one of twelve feedback versions;
 * pains and a goal that say "You said:" on their domain; a compass reading from
 * answers and strengths; sixteen launchpad pieces; and the What-if lab.
 *
 * Every figure the founder sees is worked out from what they entered. A range
 * is used at its middle and the result is said with "about". Nothing here is a
 * benchmark, and nothing is filled in for them: a blank stays blank.
 */
(function (root) {
  'use strict';

  const DOMAINS = [
    { id: 'self', name: 'Lead yourself', short: 'SELF', hex: '#A8623A', light: '#E0A282',
      icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      step: 'Write down what success must protect: money, time, health, people.' },
    { id: 'people', name: 'Lead your people', short: 'PEOPLE', hex: '#4C7355', light: '#9BC0A1',
      icon: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c1-3.5 3.5-5 7-5s6 1.5 7 5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 15c2 .6 3.4 2.3 4 5',
      step: 'Ask one honest person what might be wrong with your plan.' },
    { id: 'work', name: 'Lead your business', short: 'BUSINESS', hex: '#36607F', light: '#91B8D5',
      icon: 'M3 8h18v12H3zM8 8V5h8v3M3 13h18',
      step: 'Count what one sale costs you, including your own time.' },
    { id: 'market', name: 'Lead the market', short: 'MARKET', hex: '#9A7418', light: '#DDBD69',
      icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21M12 3C9.5 5.5 8.2 8.5 8.2 12s1.3 6.5 3.8 9',
      step: 'Ask three customers about their problem this week, in their words.' },
  ];

  /* The four business stages. The ids match model.js, whose questions are
   * asked for the stage the founder is in today. */
  const STAGES = [
    { id: 'building', name: 'Building', focus: 'Find a reason and a useful promise.' },
    { id: 'growing', name: 'Growing', focus: 'Give the work a human shape.' },
    { id: 'scaling', name: 'Scaling', focus: 'Build capacity you can trust.' },
    { id: 'leading', name: 'Leading', focus: 'Steward what you have built.' },
  ];

  const ANSWERS = [['Not yet', 'I need to work on this.'], ['I think so', 'I have not checked it yet.'],
    ['Mostly', 'I have real examples.'], ['Yes, I’ve checked', 'I can show what happened.']];

  /* Pains and goals, each tied to the domain it runs through (index into DOMAINS). */
  const PAINS = [['clients', 'Not enough clients', 3], ['cash', 'Cash is tight', 2], ['time', 'No time for myself', 0],
    ['alone', 'Doing everything myself', 1], ['team', 'Team not stepping up', 1], ['direction', 'Unclear direction', 0],
    ['price', 'Prices feel too low', 2], ['switch', 'I can’t switch off', 0]];
  const GOALS = [['freedom', 'More free time', 0], ['income', 'Higher income', 2], ['steady', 'Steady clients', 3],
    ['team', 'A team I trust', 1], ['clarity', 'Clarity on direction', 0], ['grow', 'A new market', 3]];

  const BANDS = ['Needs you now', 'Taking shape', 'A strength'];
  const band = (score) => (score <= 2 ? 0 : score <= 4 ? 1 : 2);

  /* The twelve feedback versions: domain × band. */
  const FEEDBACK = [
    [{ big: 'You are building without a clear “why”.', why: 'When the business has no clear purpose for your life, every opportunity looks urgent.', feel: ['Saying yes to almost everything', 'Tired, even after good weeks', 'Hard to switch off at night'], ask: 'What must this business protect in your life, no matter what?', deep: 'Start with limits, not goals: the hours, the money and the risk you will not go past. Clear limits make every next decision faster.', week: 'Write three lines: what success must protect.' },
      { big: 'Your direction is there, but it is not guarding your week yet.', why: 'You know what matters. Your calendar does not show it yet.', feel: ['Good intentions, crowded weeks', 'Some days clear, others reactive', 'Guilt when you rest'], ask: 'Which hour of next week will you protect for what matters most?', deep: 'Turn what you value into one fixed block in your week. When it survives a busy week, add a second.', week: 'Block one protected hour and keep it.' },
      { big: 'You lead yourself well. Now make it repeatable.', why: 'Your clarity is a strength. The risk is that it lives only in your head.', feel: ['Clear on what you want', 'Impatient when others are slower', 'Ready for the next level'], ask: 'How will others know what you know, without you in the room?', deep: 'Write down how you decide: your rules, your limits, your “no”. That page becomes the start of leading others.', week: 'Write your three decision rules.' }],
    [{ big: 'The business leans on you, and on the people at home.', why: 'Your people pay for what is not said out loud.', feel: ['Doing everything yourself', 'Tension at home about time or money', 'No one to tell you the truth'], ask: 'Who needs to hear, this week, what this business really costs you?', deep: 'Before a team, you need two things: the support of the people at home and one honest critic. Both start with one conversation.', week: 'Have one honest conversation about time and money.' },
      { big: 'You have support, but you still hold the keys.', why: 'People help, yet the decisions keep coming back to you.', feel: ['Answering the same questions again', 'Fixing others’ work at night', 'Unsure whom to trust with more'], ask: 'Which one decision could someone else make next week?', deep: 'Give away one small, clear decision with its limits written down. Watch what happens before you give the next.', week: 'Hand over one decision, with its limits.' },
      { big: 'People trust you. Now let them lead.', why: 'Your next stage depends on others deciding without you.', feel: ['A team or circle you rely on', 'Still the final word on most things', 'Ready to grow leaders'], ask: 'Who is ready to lead something you still own?', deep: 'Pick one person and one area. Agree what “good” looks like, then step back for a month.', week: 'Name one person and one area to hand over.' }],
    [{ big: 'You are guessing your numbers.', why: 'Without numbers, every decision is a feeling.', feel: ['Not sure what each sale leaves you', 'Cash surprises at the end of the month', 'Prices set by fear'], ask: 'What does one sale really leave you, after costs and your time?', deep: 'Start with one number: what each sale leaves you. Everything else, price, hours and growth, is easier once you know it.', week: 'Work out what one sale leaves you.' },
      { big: 'You know your numbers, but they do not lead your decisions yet.', why: 'The numbers are there; the habit is not.', feel: ['Checking only when worried', 'Busy months that leave little', 'Unsure which work pays best'], ask: 'Which number will you check every week, and what will you do when it moves?', deep: 'Choose one weekly number and one action for when it drops. A number without an action is only a worry.', week: 'Pick your weekly number and your rule.' },
      { big: 'Your numbers are clear. Now plan ahead with them.', why: 'Strong numbers let you choose growth instead of chasing it.', feel: ['Confident on cost and price', 'Thinking about the next stage', 'Want a plan beyond this year'], ask: 'What would you build if the next twelve months were already planned?', deep: 'Use your numbers to draw two roads for the year: grow, or grow better. Choose with your life in mind, not only the money.', week: 'Sketch two roads for the next twelve months.' }],
    [{ big: 'You do not know your customer well yet.', why: 'You may know your product better than you know your customer.', feel: ['Few or uneven enquiries', 'Unsure who to target', 'Competing on price'], ask: 'Can you say, in their words, what problem they pay you to solve?', deep: 'Talk before you build. Ten real conversations about the problem will teach you more than any website or advert.', week: 'Book three conversations with possible customers.' },
      { big: 'Customers come, but you cannot yet say why.', why: 'If you do not know why they buy, you cannot repeat it.', feel: ['Word of mouth, but not on purpose', 'Some months full, some empty', 'Hard to explain your offer simply'], ask: 'What did your last three customers say right before they said yes?', deep: 'Collect the exact words your best customers use. Those words become your offer, your page and your message.', week: 'Ask your last three customers why they chose you.' },
      { big: 'Your market knows you. Now choose where to grow.', why: 'With a clear customer, growth becomes a choice.', feel: ['Steady demand', 'Asked to do more than you can', 'Thinking about new markets'], ask: 'Which customers do you want more of, and which should you let go?', deep: 'Name your best customers and what they share. Grow toward them, and let the rest go gently.', week: 'List your five best customers and what they share.' }],
  ];

  /* The titles of the four steps per domain that open in a free account. */
  const PLAN_STEPS = [
    ['Write what success must protect', 'Set your limits: hours, money, risk', 'Choose one thing to stop', 'Review your week every Sunday'],
    ['Have the honest conversation at home', 'Find one honest critic', 'Hand over one bounded decision', 'Run a short absence test'],
    ['Know what one sale leaves you', 'Set your price with your time in it', 'Choose one weekly number', 'Plan the two months you hope never come'],
    ['Book ten real conversations', 'Write your offer in their words', 'Track where customers come from', 'Choose who to grow toward'],
  ];

  const STRENGTHS = [
    { name: 'Knowing what I want and staying focused', d: 0, icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { name: 'Leading and working with people', d: 1, icon: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c1-3.5 3.5-5 7-5s6 1.5 7 5' },
    { name: 'Numbers, money and systems', d: 2, icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
    { name: 'Speaking, writing and selling', d: 3, icon: 'M4 5h16v10H8l-4 4z' },
  ];

  const MODES = [['yes', 'Yes, I have customers', 'People pay me already'],
    ['offer', 'Not yet, my offer is ready', 'I know what I sell, no sales yet'],
    ['idea', 'Not yet, it is an idea', 'Still shaping what I will sell']];

  /* ── The number questions ──────────────────────────────────────────────────
   * Each choice is [label, value]. A bounded range carries its middle, an open
   * one ("Under…", "Over…") its edge; either way the result is said with
   * "about". The founder can type an exact amount instead, or say "Not sure". */
  const r = (label, value) => [label, value];
  const MONEY = [r('Under 1,000', 500), r('1,000–2,500', 1750), r('2,500–5,000', 3750), r('5,000–10,000', 7500),
    r('10,000–25,000', 17500), r('25,000–50,000', 37500), r('50,000–100,000', 75000), r('100,000–250,000', 175000),
    r('250,000–500,000', 375000), r('500,000–1,000,000', 750000), r('1,000,000–2,000,000', 1500000), r('Over 2,000,000', 2000000)];
  const HOURS = [r('Under 40', 20), r('40–80', 60), r('80–120', 100), r('120–160', 140), r('160–200', 180), r('200–250', 225), r('Over 250', 250)];
  const WEEK = [r('Under 5', 2.5), r('5–10', 7.5), r('10–20', 15), r('20–30', 25), r('30–40', 35), r('Over 40', 40)];
  const COUNT = [r('0', 0), r('1–5', 3), r('5–10', 7.5), r('10–25', 17.5), r('25–50', 37.5), r('50–100', 75), r('100–250', 175),
    r('250–500', 375), r('500–1,000', 750), r('Over 1,000', 1000)];
  const MONTHS = [r('Less than 1', 0.5), r('1', 1), r('2', 2), r('3', 3), r('6', 6), r('12', 12), r('18', 18), r('24', 24)];
  const PER_CUSTOMER = [r('1–2', 1.5), r('2–5', 3.5), r('5–10', 7.5), r('10–20', 15), r('Over 20', 20)];
  const WHERE = ['Online communities', 'Social media', 'Referrals and word of mouth', 'Local, in person', 'Events and conferences'].map((t) => r(t, t));
  /* Exact choices: a picked value from these is the real figure, not a middle. */
  const EXACT = new Set(['0', '1', '2', '3', '6', '12', '18', '24']);

  const IC = {
    money: 'M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.6 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3',
    time: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    bank: 'M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
    cust: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c1-3.5 3.5-5 7-5s6 1.5 7 5M16 11l2 2 4-4',
    offer: 'M20 12l-8 8-9-9V3h8zM7.5 7.5h.01',
    road: 'M4 20L9 4M20 20L15 4M12 6v2M12 11v2M12 16v2',
  };

  /* Groups of three: four for founders with customers, three for those without. */
  const GROUPS = {
    yes: [
      { key: 'money', title: 'Your sales & costs', icon: IC.money, d: 2, fields: [['sales', 'Sales this month', MONEY], ['deliv', 'Cost of delivering the work', MONEY], ['run', 'Regular running costs', MONEY]] },
      { key: 'time', title: 'Your time & energy', icon: IC.time, d: 0, fields: [['hrs', 'Hours you worked this month', HOURS], ['want', 'Hours you want to work', HOURS], ['unpaid', 'Hours nobody paid for', HOURS]] },
      { key: 'bank', title: 'Money in the bank', icon: IC.bank, d: 3, fields: [['save', 'Savings in the bank', MONEY], ['months', 'Months of bills you want covered', MONTHS], ['out', 'Paid out this month', MONEY]] },
      { key: 'cust', title: 'Your customers', icon: IC.cust, d: 1, fields: [['newc', 'New paying customers', COUNT], ['acq', 'Spent to win customers', MONEY], ['back', 'Customers who came back', COUNT]] },
    ],
    plan: [
      { key: 'offer', title: 'Your offer', icon: IC.offer, d: 2, fields: [['price', 'What you will charge one customer', MONEY], ['hpc', 'Hours to serve one customer', PER_CUSTOMER], ['cpc', 'What it costs you to serve one', MONEY]] },
      { key: 'road', title: 'Your runway', icon: IC.road, d: 0, fields: [['risk', 'Money you can put at risk', MONEY], ['wait', 'Months you can wait for income', MONTHS], ['week', 'Hours a week you can give', WEEK]] },
      { key: 'market', title: 'Your first buyers', icon: IC.cust, d: 1, fields: [['talked', 'People you have talked to about the problem', COUNT], ['pay', 'People who said they would pay', COUNT], ['where', 'Where they gather', WHERE]] },
    ],
  };
  const groupsFor = (mode) => (mode === 'yes' ? GROUPS.yes : GROUPS.plan);
  const fieldsFor = (mode) => groupsFor(mode).flatMap((g) => g.fields);

  /** What one number entry stands for: { v, est } or null when unknown.
   *  An entry is { pick: index | 'own' | 'unsure' | '', own: '1234' }. */
  function valueOf(entry, choices) {
    if (!entry || entry.pick === '' || entry.pick === undefined || entry.pick === 'unsure') return null;
    if (entry.pick === 'own') {
      // "Where they gather" takes words, not a number.
      if (choices[0] && typeof choices[0][1] === 'string') {
        const t = String(entry.own ?? '').trim().slice(0, 80);
        return t ? { v: t, est: false } : null;
      }
      const n = Number(String(entry.own ?? '').replace(/[,\s]/g, ''));
      return String(entry.own ?? '').trim() !== '' && Number.isFinite(n) && n >= 0 ? { v: n, est: false } : null;
    }
    const c = choices[Number(entry.pick)];
    if (!c) return null;
    return { v: c[1], est: typeof c[1] === 'number' && !EXACT.has(c[0]) };
  }
  /** All of one mode's numbers as { key: { v, est } }, unknowns left out. */
  function numbers(state) {
    const out = {};
    for (const [key, , choices] of fieldsFor(state.mode)) {
      const x = valueOf((state.nums || {})[state.mode + '.' + key], choices);
      if (x) out[key] = x;
    }
    return out;
  }

  /* ── Scoring ─────────────────────────────────────────────────────────────── */
  /** The eight questions for a stage, in domain order (two each). */
  function questionsFor(model, stageId) {
    const qs = model.Q.filter((q) => q.stage === stageId);
    return DOMAINS.flatMap((d) => qs.filter((q) => q.domain === d.id));
  }
  /** Per domain: answered (0–2), score (0–6), band index. */
  function scores(model, state) {
    const qs = questionsFor(model, state.stage);
    return DOMAINS.map((d) => {
      const mine = qs.filter((q) => q.domain === d.id);
      const known = mine.filter((q) => Number.isInteger(state.ans[q.id]));
      const score = known.reduce((s, q) => s + state.ans[q.id], 0);
      return { id: d.id, answered: known.length, score, band: band(score) };
    });
  }
  /** The compass reading: score/6 + strength/5 per domain. Strongest and
   *  lowest, or null before anything is answered or rated. */
  function reading(sc, strengths) {
    const str = DOMAINS.map((_, i) => Number(strengths[i]) || 0);
    const any = sc.some((s) => s.answered > 0) || str.some((v) => v > 0);
    const combo = sc.map((s, i) => s.score / 6 + str[i] / 5);
    if (!any) return { any, combo, str, hi: null, lo: null };
    return { any, combo, str, hi: combo.indexOf(Math.max(...combo)), lo: combo.indexOf(Math.min(...combo)) };
  }
  /** Launchpad: four pieces per domain = two answers, one strength, one "Got it". */
  function pieces(sc, strengths, got) {
    const per = sc.map((s, i) => s.answered + ((Number(strengths[i]) || 0) > 0 ? 1 : 0) + (got[i] ? 1 : 0));
    return { per, total: per.reduce((a, b) => a + b, 0) };
  }

  /** One domain's feedback card, personalised by its band, pains and goal. */
  function feedback(i, s, pains, goal) {
    const c = FEEDBACK[i][s.band];
    // One goal, or the two the founder picked (31 Oct): the one running through this domain.
    const goals = [].concat(goal || []), g = GOALS.find((x) => goals.includes(x[0]) && x[2] === i) || GOALS.find((x) => x[0] === goals[0]);
    return Object.assign({}, c, {
      band: s.answered ? BANDS[s.band] : 'Not answered yet', bandIndex: s.answered ? s.band : null,
      pains: PAINS.filter((p) => p[2] === i && (pains || []).includes(p[0])).map((p) => p[1]),
      goalLine: g && g[2] === i ? 'Your goal, ' + g[1].toLowerCase() + ', runs through this domain.' : '',
      steps: PLAN_STEPS[i],
    });
  }

  /* ── What the numbers already tell you ───────────────────────────────────── */
  /** One plain sentence per group, from the founder's own entries only.
   *  `money` formats an amount; returns null when there is not enough yet. */
  function insight(groupKey, n, mode, money) {
    const has = (...k) => k.every((x) => n[x]);
    const ab = (...k) => (k.some((x) => n[x] && n[x].est) ? 'about ' : '');
    const num = (v) => (Math.round(v * 10) / 10).toLocaleString('en-US');
    switch (groupKey) {
      case 'money': {
        if (has('sales', 'deliv', 'run')) {
          const left = n.sales.v - n.deliv.v - n.run.v;
          return left > 0
            ? `After delivery and running costs, ${ab('sales', 'deliv', 'run')}${money(left)} is left this month. That is what every other bill, and you, are paid from.`
            : `After delivery and running costs, nothing is left this month: ${ab('sales', 'deliv', 'run')}${money(-left)} short. Every other decision waits on this one.`;
        }
        if (has('sales', 'deliv')) return `After delivery, ${ab('sales', 'deliv')}${money(n.sales.v - n.deliv.v)} is left before running costs.`;
        return null;
      }
      case 'time': {
        if (!has('hrs', 'want') || n.want.v <= 0) return null;
        const pct = Math.round(n.hrs.v / n.want.v * 100);
        const unpaid = n.unpaid && n.unpaid.v > 0 ? ` ${n.unpaid.est ? 'About ' : ''}${num(n.unpaid.v)} of those hours nobody paid for.` : '';
        return pct > 100
          ? `You worked ${ab('hrs', 'want')}${pct}% of the hours you chose. Growth would borrow from your life.${unpaid}`
          : `You worked ${ab('hrs', 'want')}${pct}% of the hours you chose. There is room, if you protect it.${unpaid}`;
      }
      case 'bank': {
        if (!has('save', 'out') || n.out.v <= 0) return null;
        const cover = n.save.v / n.out.v;
        const want = n.months ? ` You chose ${num(n.months.v)}.` : '';
        return `Your savings cover ${ab('save', 'out')}${num(cover)} ${Math.round(cover * 10) === 10 ? 'month' : 'months'} of what went out.${want}`;
      }
      case 'cust': {
        if (!n.newc) return null;
        if (n.newc.v === 0) return 'No new paying customers this month. Before spending more to win them, ask your last ones why they chose you.';
        const back = n.back ? ` ${n.back.est ? 'About ' : ''}${num(n.back.v)} came back.` : '';
        return n.acq
          ? `Each new customer cost you ${ab('newc', 'acq')}${money(n.acq.v / n.newc.v)} to win. Now you can judge if that is worth it.${back}`
          : `${n.newc.est ? 'About ' : ''}${num(n.newc.v)} new paying customers this month.${back}`;
      }
      case 'offer': {
        if (has('price', 'cpc')) {
          const per = n.price.v - n.cpc.v;
          const hourly = n.hpc && n.hpc.v > 0 ? `, for ${ab('hpc')}${num(n.hpc.v)} hours of your time: ${ab('price', 'cpc', 'hpc')}${money(per / n.hpc.v)} an hour` : '';
          return per > 0
            ? `Each customer would leave you ${ab('price', 'cpc')}${money(per)} after costs${hourly}.`
            : `At this price, each customer costs you more to serve than they pay. Look at the price before anything else.`;
        }
        return mode === 'idea' ? 'Pick one person you want to help and one problem you solve. A clear offer comes before any numbers.' : null;
      }
      case 'road': {
        if (!n.wait) return null;
        const pm = n.risk && n.wait.v > 0 ? ` That is ${ab('risk', 'wait')}${money(n.risk.v / n.wait.v)} a month to learn with.` : '';
        return `You can test for ${ab('wait')}${num(n.wait.v)} ${n.wait.v === 1 ? 'month' : 'months'} before the business has to pay you. Use them to learn, not only to build.${pm}`;
      }
      case 'market': {
        if (!n.talked) return null;
        const where = n.where ? ` They gather here: ${String(n.where.v).toLowerCase()}. Go and listen.` : '';
        if (n.pay && n.pay.v === 0) return `Nobody has said they would pay yet. That is not a verdict; it is the next ten conversations.${where}`;
        if (n.talked.v < 10) return `You have talked to ${n.talked.est ? 'about ' : ''}${num(n.talked.v)} ${n.talked.v === 1 ? 'person' : 'people'} about the problem. Ten real conversations will tell you more than a website.${where}`;
        return n.pay
          ? `${n.pay.est ? 'About ' : ''}${num(n.pay.v)} of ${n.talked.est ? 'about ' : ''}${num(n.talked.v)} said they would pay. That is a start, not yet a market: now ask them to.${where}`
          : `You have talked to ${n.talked.est ? 'about ' : ''}${num(n.talked.v)} people. How many said they would pay?${where}`;
      }
      default: return null;
    }
  }

  /** The "Your numbers" line on each domain's feedback card (customers only). */
  function numberLines(n, money) {
    const ab = (...k) => (k.some((x) => n[x] && n[x].est) ? 'about ' : '');
    const out = ['', '', '', ''];
    if (n.hrs && n.want && n.want.v > 0) out[0] = `${ab('hrs', 'want')}${Math.round(n.hrs.v / n.want.v * 100)}% of the hours you chose`;
    if (n.unpaid) out[1] = `${ab('unpaid')}${Math.round(n.unpaid.v)} unpaid hours a month`;
    const w = [];
    if (n.sales && n.deliv && n.run) w.push(`${ab('sales', 'deliv', 'run')}${money(n.sales.v - n.deliv.v - n.run.v)} left this month`);
    if (n.save && n.out && n.out.v > 0) w.push(`savings cover ${ab('save', 'out')}${Math.round(n.save.v / n.out.v * 10) / 10}${n.months ? ' of ' + n.months.v : ''} months`);
    out[2] = w.join(' · ');
    const m = [];
    if (n.newc && n.newc.v > 0 && n.acq) m.push(`${ab('newc', 'acq')}${money(n.acq.v / n.newc.v)} to win each new customer`);
    if (n.back) m.push(`${ab('back')}${Math.round(n.back.v)} came back`);
    out[3] = m.join(' · ');
    return out;
  }

  /* ── The What-if lab ─────────────────────────────────────────────────────────
   * Four levers, each paired with the answer it moves most, and every lever
   * moves all four answers ("The Intelligence", section 6, v2):
   *   price  = today × (1 + price%)            → cash left each month
   *   demand = today × (1 + message%)          → clients each month
   *   hours  = hours per sale × (1 − fewer%)   → your hours a month
   *   handed = that share of delivery hours, at a helper rate you set → people
   * Worked on the founder's own month, scaled as a whole: a "unit" is today's
   * volume of work, so no count of sales is needed. Without customers yet, the
   * month is their offer × the customers a month they plan for.
   *
   * The switch decides where the gain goes. "Give me back time": serve only the
   * work needed to keep today's money, never more than the demand there is, so
   * a higher price lowers the hours. "Give me more money": serve all of it. */
  function labBase(state) {
    const n = numbers(state), lab = state.lab || {};
    const pos = (v) => { const x = Number(v); return String(v ?? '').trim() !== '' && Number.isFinite(x) && x >= 0 ? x : null; };
    const rate = pos(lab.rate), hire = pos(lab.hire);
    const est = (...k) => k.some((x) => n[x] && n[x].est);
    if (state.mode === 'yes') {
      const need = ['sales', 'deliv', 'run', 'hrs'].filter((k) => !n[k]);
      if (need.length) return { ready: false, need };
      return { ready: true, plan: false, sales: n.sales.v, deliv: n.deliv.v, fixed: n.run.v, acq: n.acq ? n.acq.v : 0, acqMissing: !n.acq,
        hours: n.hrs.v, limit: n.want ? n.want.v : null, clients: n.newc ? n.newc.v : null, rate, hire,
        est: est('sales', 'deliv', 'run', 'hrs', 'want', 'acq', 'newc') };
    }
    const planned = pos(lab.plan);
    const need = ['price', 'cpc', 'hpc'].filter((k) => !n[k]);
    if (need.length || !planned) return { ready: false, need, planned: !planned };
    return { ready: true, plan: true, sales: n.price.v * planned, deliv: n.cpc.v * planned, fixed: 0, acq: 0, acqMissing: false,
      hours: n.hpc.v * planned, limit: n.week ? n.week.v * 52 / 12 : null, clients: planned, rate, hire,
      est: est('price', 'cpc', 'hpc', 'week') };
  }

  /** The four levers, in the lab's order, with their ranges. */
  const LEVER_RANGE = { p: 200, m: 100, f: 50, d: 60 };
  const LEVER_KEYS = ['p', 'm', 'f', 'd'];

  /**
   * One month under the levers. `s` = { p, m, f, d } in percent, and `mode`
   * 'time' (default) or 'money'.
   * Returns vol (today = 1), demand, cash (null when work is handed over and no
   * helper rate is set), mine (your hours), helpHours, helpCost, clients (null
   * without a count of customers), clientsWanted, and people (null without the
   * monthly cost of one more person, or without a cash figure).
   */
  function month(b, s = {}, mode = 'time') {
    const p = Number(s.p) || 0, m = Number(s.m) || 0, f = Number(s.f) || 0, d = Number(s.d) || 0;
    const pr = 1 + p / 100, hf = 1 - f / 100, demand = 1 + m / 100, share = d / 100;
    const unitHours = b.hours * hf, unitHelpHours = unitHours * share;
    const unitHelp = unitHelpHours > 0 ? (b.rate === null ? null : unitHelpHours * b.rate) : 0;
    const fixed = b.fixed + b.acq, cash0 = b.sales - b.deliv - fixed;
    // What one unit of work leaves after delivery and help. Unknown help cost:
    // the hours still move, the money cannot be said.
    const perUnit = unitHelp === null ? null : b.sales * pr - b.deliv - unitHelp;
    let vol = demand;
    const keep = b.sales - b.deliv; // what today's work leaves before running costs
    if (mode !== 'money' && perUnit !== null && perUnit > 0 && keep > 0) vol = Math.min(demand, keep / perUnit);
    // 'both' (31 Oct): half the gain goes to time, half to money.
    if (mode === 'both') vol = (vol + demand) / 2;
    const cash = perUnit === null ? null : vol * perUnit - fixed;
    const helpHours = vol * unitHelpHours, helpCost = unitHelp === null ? null : vol * unitHelp;
    const mine = vol * unitHours * (1 - share);
    const people = cash === null || b.hire === null || !(b.hire > 0) ? null : (Math.max(0, cash - cash0) + (helpCost || 0)) / b.hire;
    return { vol, demand, cash, cash0, mine, helpHours, helpCost, people,
      clients: b.clients === null ? null : b.clients * vol, clientsWanted: b.clients === null ? null : b.clients * demand };
  }
  /** The lever moved most, as a share of its range: 0 price, 1 message,
   *  2 fewer hours, 3 handover; -1 when none moved. */
  function strongestLever(p, m, f, d) {
    const share = [p / LEVER_RANGE.p, m / LEVER_RANGE.m, (f || 0) / LEVER_RANGE.f, (d || 0) / LEVER_RANGE.d], max = Math.max(...share);
    return max > 0 ? share.indexOf(max) : -1;
  }
  /* The lever "Each sale takes fewer hours" and its plan are a DRAFT, waiting
   * for Alexandru's wording (PR 3). */
  const LEVERS = [
    { id: 'price', name: 'You raise your price', watch: 'Some customers may leave. Ask your best three first, and explain the value, not the cost.', first: 'Write your new price and say it out loud to one customer this week.', steps: ['Find your fair price, with your time in it', 'Test it on three customers', 'Explain the value in their words', 'Review who stayed and why'] },
    { id: 'message', name: 'Your message gets clearer', watch: 'More enquiries need answering. Decide now who replies, and how fast.', first: 'Rewrite your offer in one sentence a customer would say.', steps: ['Ask three customers why they chose you', 'Write the one-sentence offer', 'Put it where they already look', 'Track who says yes'] },
    { id: 'hours', name: 'Each sale takes fewer hours', watch: 'Faster can become careless. Check the work still meets the standard your customers chose you for.', first: 'Time your next sale, task by task, and circle the slowest step.', steps: ['Time one sale from start to finish', 'Cut, template or batch the slowest task', 'Tell customers what changes for them', 'Time it again and decide where the hours go'] },
    { id: 'handover', name: 'Someone else does part of the work', watch: 'Handing over takes time before it saves time. Expect two slow weeks.', first: 'List three tasks you think only you can do. Pick one that is not true.', steps: ['Pick one task to hand over', 'Write what “finished” looks like', 'Run a two-week test', 'Review, then hand over the next'] },
  ];
  /** Does this change move the founder toward their goal? */
  function goalHelped(goal, s0, s, d) {
    const more = (a, b) => a !== null && b !== null && a > b + 1e-9;
    return { freedom: s.mine < s0.mine - 1e-9, income: more(s.cash, s0.cash), steady: s.vol > s0.vol + 1e-9 || more(s.clients, s0.clients),
      team: d > 0 || (s.people || 0) > 0, clarity: true, grow: s.demand > s0.demand + 1e-9 }[goal];
  }

  const api = { DOMAINS, STAGES, ANSWERS, PAINS, GOALS, BANDS, FEEDBACK, PLAN_STEPS, STRENGTHS, MODES, GROUPS, LEVERS,
    band, groupsFor, fieldsFor, valueOf, numbers, questionsFor, scores, reading, pieces, feedback, insight, numberLines,
    labBase, month, LEVER_RANGE, LEVER_KEYS, strongestLever, goalHelped };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CompassEngine = api;
})(this);
