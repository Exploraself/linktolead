/* The three tools' logic, as Alexandru approved it in the preview ("Tonight
 * 04 · Three free tools", 1 Nov 2026): every question, hint, sum, result line,
 * the four lines, the book quotes (checked word for word: never edit them
 * without the book open) and the share card. Ported unchanged, except: the
 * cover (catalog.js) replaces the old intro, a tool now opens after the free
 * account, so the name and email steps are gone, and the one button goes to
 * /northstar/ on this site.
 *
 * Every number a tool shows is the founder's own, or a plain sum of them.
 * public/tools/run.js draws the screens; this file only knows the tools. */
/* ── Small helpers ─────────────────────────────────────────── */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = (n) => (n < 0 ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US');
const num = (n) => Math.round(n).toLocaleString('en-US');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const MONEY_STEPS = [0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000];
export const MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/><path d="m12 5.7 2 4.3 4.3 2-4.3 2-2 4.3-2-4.3-4.3-2 4.3-2Z" fill="currentColor" stroke="none"/></svg>';
/** The one button on every result: The Leader’s North Star itself. */
export const NS_URL = '/northstar/';

/* The next seven days, starting today, on the visitor's own clock. */
export const DAYS = (() => { const out = [], t = new Date(); t.setHours(12, 0, 0, 0); for (let i = 0; i < 7; i++) { const d = new Date(t); d.setDate(t.getDate() + i); out.push(d); } return out; })();
export const dayLong = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
const dayOf = (a) => DAYS[a.day || 0];
const onDay = (a) => (a.day === 0 ? 'Today' : 'On ' + dayLong(dayOf(a)));
const dayTitle = (a) => (a.day === 0 ? 'Today, ' + dayLong(dayOf(a)) : dayLong(dayOf(a)));
const dateAfterWeeks = (w) => { const d = new Date(); d.setDate(d.getDate() + Math.round(w * 7)); return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); };

/** Weeks said simply, always from the founder's own numbers. */
export function weeks(w) {
  if (!isFinite(w)) return 'no end in sight';
  if (w <= 0) return '0 weeks';
  if (w < 1) { const d = Math.max(1, Math.round(w * 7)); return d + (d === 1 ? ' day' : ' days'); }
  if (w >= 520) return 'more than 10 years';
  if (w >= 104) { const y = Math.round(w / 52 * 10) / 10; return y + ' years'; }
  const r = Math.round(w); return r + (r === 1 ? ' week' : ' weeks');
}

/* ── The three tools ───────────────────────────────────────── */
export const FOUR = [['Where you were', 'admit it'], ['Where you struggle', 'don’t fight it'], ['Where you shine', 'don’t ignore it'], ['What you will do', 'exactly']];

export const TOOLS = {
  /* ═════ 1. Cash runway in 60 seconds · Cash is tight · Lead your business ═════ */
  cash: {
    id: 'cash', name: 'Cash runway', domain: 'Lead your business', domColor: '#91B8D5',
    qs: [
      { id: 'look', type: 'tap', q: 'When you check your cash, what do you look at?', hint: 'Think of last month. Honest beats impressive.', options: ['I avoid looking', 'Today’s bank balance', 'Money in and money out', 'A weekly page: in, out and what’s left'] },
      { id: 'cash', type: 'money', q: 'Cash in the business account today', hint: 'Open your banking app if it’s close. Rough is fine.', start: 17 },
      { id: 'costs', type: 'money', q: 'What a normal month costs the business', hint: 'Rent, software, wages, loan payments: everything that leaves in an ordinary month.', start: 13, minIdx: 1 },
      { id: 'payin', type: 'tap', q: 'Is your own pay inside that number?', hint: 'Your pay is part of the real cost, even when it waits.', options: ['Yes, my pay is in it', 'No, I pay myself from what’s left', 'I don’t pay myself yet'] },
      { id: 'enough', type: 'money', cond: (a) => a.payin > 0, q: 'What you need to take home each month', hint: 'Your enough: what your life needs from this business. Not the dream number.', start: 10 },
      { id: 'promised', type: 'money', q: 'Bills already promised in the next 30 days, on top of a normal month', hint: 'Tax, a supplier, a loan to repay: money in the account that isn’t really yours. None? Slide to $0.', start: 8 },
      { id: 'owed', type: 'money', q: 'Money customers owe you that you’d bet arrives in the next 30 days', hint: 'Only what you would bet on. None? Slide to $0.', start: 8 },
      { id: 'late', type: 'money', q: 'Money customers owe you that is already late', hint: 'Past its due date, even by a day. None? Slide to $0.', start: 4 },
      { id: 'day', type: 'day', q: 'Which day this week will you give this twenty minutes?', hint: 'Pick one. Twenty minutes is enough for the first move.' },
      { id: 'who', type: 'text', cond: (a) => a.late > 0, optional: true, q: 'Who owes you the most of that late money?', hint: 'A client’s name, so your first move has an address.', ph: 'e.g. Miller & Co.' },
    ],
    calc(a) {
      const wk = (m) => m * 12 / 52;
      const pay = a.payin > 0 ? (a.enough || 0) : 0;
      const free = a.cash - a.promised;
      const weekly = wk(a.costs);
      return { pay, free, weekly, A: free / weekly, B: pay > 0 ? free / wk(a.costs + pay) : null, C: a.owed > 0 ? (free + a.owed) / weekly : null, L: a.late > 0 ? a.late / weekly : null };
    },
    insight(a) {
      const c = this.calc(a);
      const calcline = `${money(a.cash)} today − ${money(a.promised)} already promised = ${money(c.free)} free ÷ ${money(c.weekly)} a week (${money(a.costs)} a month × 12 ÷ 52)`;
      if (c.free <= 0) {
        return { big: money(-c.free) + ' short', line: 'The bills already promised are bigger than today’s cash. Before a normal month even starts, the account is short. That is information, not a verdict.', calcline, vis: strip(0, null), tease: this.tease(a, c) };
      }
      let line = `If no new money came in, your free cash would pay a normal month’s costs for about ${weeks(c.A)}${c.A < 104 ? ': to around ' + dateAfterWeeks(c.A) : ''}.`;
      if (c.B !== null) line += ' That’s before you pay yourself.';
      return { big: weeks(c.A), line, calcline, vis: strip(c.A, c.C), tease: this.tease(a, c) };
    },
    tease(a, c) {
      const t = [];
      if (c.B !== null) t.push('your runway with your own pay in it');
      if (c.C !== null) t.push('your runway if the money owed arrives');
      if (c.L !== null) t.push('what the late money is worth in weeks');
      t.push('your one move for ' + (a.day === 0 ? 'today' : dayLong(dayOf(a))));
      return t;
    },
    result(a, st) {
      const c = this.calc(a);
      const nm = st.name ? esc(st.name) + ', y' : 'Y';
      const h = c.free <= 0 ? `${nm}our account is ${money(-c.free)} short before the month starts.` : `${nm}our runway is about ${weeks(c.A)}.`;
      const rows = [
        ['Cash in the account today', money(a.cash)],
        ['− Bills already promised (next 30 days)', money(a.promised)],
        ['= Free cash', money(c.free)],
        ['÷ A normal week of costs', money(c.weekly), `${money(a.costs)} a month × 12 ÷ 52`],
      ];
      const total = ['= Runway, if no new money came in', c.free <= 0 ? '0 weeks' : 'about ' + weeks(c.A), c.free > 0 && c.A < 104 ? 'To around ' + dateAfterWeeks(c.A) : ''];
      const others = [];
      if (c.B !== null) others.push([`With your own pay in it (${money(c.pay)} a month)`, c.free <= 0 ? '0 weeks' : 'about ' + weeks(c.B), a.payin === 2 ? 'You don’t pay yourself yet. If that is a season you chose, give it an end date.' : 'This is the real cost of the business, you included.']);
      if (c.C !== null) others.push([`If the ${money(a.owed)} owed arrives`, (c.free + a.owed) <= 0 ? '0 weeks' : 'about ' + weeks(c.C), 'Only money you said you would bet on.']);
      if (c.L !== null) others.push([`Late money: ${money(a.late)}`, 'about ' + weeks(c.L) + ' of costs', 'Waiting in other people’s accounts.']);
      const lookAdmit = [
        'Until today you avoided looking.',
        'You check today’s bank balance.',
        'You check money in and money out.',
        'You keep a weekly page: in, out and what’s left.',
      ][a.look];
      const admit = `${lookAdmit} After the bills already promised, your free cash covers ${c.free <= 0 ? 'no weeks of costs' : 'about ' + weeks(c.A) + ' of costs'}.`;
      let struggle;
      if (a.late > 0) struggle = `${money(a.late)} is late. Asking for your own money can feel rude. It isn’t. Don’t fight the discomfort. Send the note.`;
      else if (c.B !== null) struggle = 'Part of this business runs on your unpaid time. If that is a season you chose, give it an end date. Don’t fight the number. Write it down.';
      else if (a.look < 2) struggle = 'A balance looks like yours until the promises leave it. Don’t fight the fear. Read the numbers on a fixed day.';
      else struggle = 'A runway shrinks quietly when nobody reads it. Don’t fight the routine. Keep the day.';
      const shine = a.look === 3 ? 'You already keep a weekly page. That is leadership by evidence.' : 'You counted it. Your runway is a number now, not a feeling.';
      const who = (a.who || '').trim();
      let exactly, action;
      if (a.late > 0) {
        exactly = `${onDay(a)}, you write to ${who ? esc(who) : 'the client who owes you most'}: “Invoice [number] was due on [date]. Please pay by [new date].” Firm and polite.`;
        action = `Write to ${who || 'the client who owes you most'}: “Invoice [number] was due on [date]. Please pay by [new date]. Thank you.” Then spend what’s left of the twenty minutes on one page: money in, money out, what’s left.`;
      } else {
        exactly = `${onDay(a)}, twenty minutes: one page of cash (money in, money out, what’s left) and an alert line: the amount where you act that same day.`;
        action = 'Twenty minutes, one page: money in, money out, what’s left. Then write your alert line: the amount in the bank where you act that same day.';
      }
      const ask = c.free <= 0 ? 'If nothing changed this month, what would you have to say no to first?'
        : c.A < 104 ? `Your runway reaches about ${dateAfterWeeks(c.A)}. What would you want to have decided long before then?`
        : `With about ${weeks(c.A)} of runway, what is this cash meant to make possible?`;
      return {
        h, sub: 'Worked out only from your answers. A machine could do this sum in a second; the decision it points to is yours.',
        rows, total, others, lines: [admit, struggle, shine, exactly], ask, action, when: dayTitle(a),
        quote: { t: 'A cash balance carries promises within it.', src: 'Alexandru Cojocari, A New Way of Winning' },
        bridge: 'Cash is one number on one side. The Leader’s North Star reads all four: Lead yourself, Lead your people, Lead your business and Lead the market, and ends with a plan you can tick off.',
        honest: '<strong>Honest note.</strong> A self-reflection tool, not financial advice. It uses only the numbers you entered, rounded, and a simple sum. For accounts, tax and borrowing, talk to a qualified accountant.',
        caption: 'I counted my cash runway in 60 seconds. A number now, not a feeling. This week I act on it.',
      };
    },
    card(a, show) {
      const c = this.calc(a);
      const has = c.free > 0;
      return show && has
        ? { head: `About ${weeks(c.A)} of runway.`, sub: 'Counted in 60 seconds. This week I decide what they’re for.', visual: (x, X, Y, W, H) => cardStrip(x, X, Y, W, H, c.A, true) }
        : { head: 'I counted my cash runway.', sub: 'A number now, not a feeling. This week I act on it.', visual: (x, X, Y, W, H) => cardStrip(x, X, Y, W, H, 0, false) };
    },
  },

  /* ═════ 2. The bottleneck test · Team not stepping up · Lead your people ═════ */
  bottleneck: {
    id: 'bottleneck', name: 'The bottleneck test', domain: 'Lead your people', domColor: '#9BC0A1',
    qs: [
      { id: 'people', type: 'tap', q: 'Finish it honestly: “People usually…”', hint: 'The first one that sounds like you.', options: ['let me down', 'do it worse than I would', 'need me to check everything', 'rise when they are trusted'] },
      { id: 'stop', type: 'slide', q: 'If you stepped away for two weeks, how much of the work would stop?', hint: 'Not what should happen. What would.', min: 0, max: 100, step: 10, start: 50, fmt: (v) => v + '%', words: (v) => (v >= 80 ? 'almost all of it' : v > 50 ? 'more than half' : v >= 30 ? 'a good part' : v > 0 ? 'a little' : 'nothing'), ends: ['Nothing', 'All of it'] },
      { id: 'waiting', type: 'slide', q: 'Decisions waiting for you right now', hint: 'Approvals, answers, “can you just check this?”. Count your messages if they’re close.', min: 0, max: 40, step: 1, start: 10, fmt: (v) => String(v), words: (v) => (v === 1 ? 'decision' : 'decisions') + (v === 40 ? ' or more' : ''), ends: ['None', '40 or more'] },
      { id: 'wait', type: 'tap', q: 'How long does a question usually wait for your answer?', hint: 'From the moment someone asks to the moment they can move.', options: ['Under an hour', 'Until the end of the day', 'Two or three days', 'A week or more'] },
      { id: 'hours', type: 'slide', q: 'Hours you worked last week', hint: 'Count the evenings and the weekend too.', min: 0, max: 100, step: 1, start: 50, fmt: (v) => String(v), words: (v) => (v === 1 ? 'hour' : 'hours'), ends: ['0', '100'] },
      { id: 'need', type: 'slide', cond: (a) => a.hours > 0, q: (a) => `Of those ${a.hours} hours, how many truly needed you?`, hint: 'Your skill, your authority, or a relationship only you hold. The rest reached you by habit.', min: 0, max: (a) => a.hours, step: 1, start: (a) => Math.round(a.hours / 2), fmt: (v) => String(v), words: (v) => (v === 1 ? 'hour' : 'hours'), ends: ['0', (a) => String(a.hours)] },
      { id: 'back', type: 'slide', q: 'Of the last 10 things you handed over, how many came back to you?', hint: 'You redid it, took it back, or answered every step.', min: 0, max: 10, step: 1, start: 5, fmt: (v) => v + ' of 10', words: (v) => (v >= 7 ? 'most came back' : v >= 4 ? 'about half came back' : v > 0 ? 'a few came back' : 'none came back'), ends: ['None', 'All ten'] },
      { id: 'day', type: 'day', q: 'Which day this week will you hand one decision over?', hint: 'Pick the day you can sit down with them for fifteen minutes.' },
      { id: 'decision', type: 'text', optional: true, q: 'Which decision will you hand over?', hint: 'Small and reversible is perfect. For example: refunds up to $100, next week’s schedule, reordering supplies.', ph: 'e.g. refunds up to $100' },
      { id: 'owner', type: 'text', optional: true, q: 'Who will own it?', hint: 'A first name.', ph: 'e.g. Marta' },
    ],
    calc(a) {
      const hours = a.hours || 0, need = a.hours > 0 ? Math.min(a.need || 0, hours) : 0;
      const habit = Math.max(0, hours - need);
      return { hours, need, habit, month: habit * 52 / 12, waitText: ['under an hour', 'until the end of the day', 'two or three days', 'a week or more'][a.wait] };
    },
    insight(a) {
      const c = this.calc(a), n = a.waiting;
      const big = n + (n === 1 ? ' decision' : ' decisions');
      let line = n === 0
        ? `Nothing is waiting at your desk right now, and about ${a.stop}% of the work would stop if you stepped away.`
        : `${n === 1 ? 'is' : 'are'} waiting at your desk, usually for ${c.waitText}, and about ${a.stop}% of the work would stop if you stepped away.`;
      if (a.stop > 50) line += ' More than half the work runs through you. The business can’t grow past that.';
      const calcline = c.hours > 0 ? `Last week: ${c.hours} hours worked − ${c.need} that truly needed you = ${c.habit} hours that reached you by habit.` : '';
      const dec = (a.decision || '').trim();
      const tease = [...(c.hours > 0 ? [`the ${c.habit} ${c.habit === 1 ? 'hour' : 'hours'} that reached you by habit, counted for a month`] : []), 'why handovers come back, and what to check first', dec ? `the exact words to hand over “${dec}” ${a.day === 0 ? 'today' : 'on ' + dayLong(dayOf(a))}` : `your handover, ${a.day === 0 ? 'today' : 'on ' + dayLong(dayOf(a))}, in three lines`];
      return { big, bigIsLabel: n !== 0, line, calcline, vis: hourglass(n, a.stop), tease };
    },
    result(a, st) {
      const c = this.calc(a), n = a.waiting;
      const nm = st.name ? esc(st.name) + ', ' : '';
      const h = (n === 0 && a.stop <= 30) ? `${cap(nm + 'your team isn’t waiting for you. Keep it that way.')}` : `${cap(nm + 'the work narrows at your desk.')}`;
      const rows = [
        ['Hours you worked last week', String(c.hours)],
        ['− Hours that truly needed you', String(c.need)],
      ];
      const total = ['= Hours that reached you by habit', String(c.habit), c.habit > 0 ? `If last week was normal: about ${num(c.month)} hours a month (× 52 ÷ 12)` : ''];
      const others = [
        ['Decisions waiting for you', String(n), `Each usually waits ${c.waitText}.`],
        ['Work that stops without you', a.stop + '%', 'Your own estimate for two weeks away.'],
        ['Handovers that came back', a.back + ' of 10', 'Out of the last ten things you handed over.'],
      ];
      const tPeople = ['let me down', 'do it worse than you would', 'need you to check everything', 'rise when they are trusted'][a.people];
      const admit = `${n} ${n === 1 ? 'decision waits' : 'decisions wait'} for you, usually ${c.waitText}, and about ${a.stop}% of the work stops without you.`;
      let struggle = a.people === 3
        ? `You believe people rise when they are trusted. Then ask why ${n} ${n === 1 ? 'decision still waits' : 'decisions still wait'} for you. Don’t fight it. Hand over the authority, not only the task.`
        : `You believe people usually ${tPeople}. Don’t fight the feeling. Test it in one small step.`;
      if (a.back >= 3) struggle += ` ${a.back} of 10 handovers came back. When work returns, it looks like proof that nobody can be trusted. First check what you handed over: the task, or the right to decide.`;
      let shine;
      if (a.back <= 2) shine = `${10 - a.back} of 10 handovers stayed handed over. People can carry more than your desk suggests.`;
      else if (c.hours > 0 && c.need / c.hours >= 0.6) shine = `${c.need} of your ${c.hours} hours went to work that truly needs you. Guard them.`;
      else shine = 'You named one decision to let go. That is where trust starts.';
      const dec = (a.decision || '').trim() || 'one small, reversible decision';
      const own = (a.owner || '').trim();
      const exactly = `${onDay(a)}, you hand “${esc(dec)}” to ${own ? esc(own) : 'one person'}. Together you write three lines: what they decide alone, what they decide and tell you, and when they ask you first. Then you don’t take it back.`;
      const action = `Hand “${dec}” to ${own || 'one person'}. Fifteen minutes, three lines, written where the work happens: 1) You decide alone up to ___. 2) You decide and tell me when ___. 3) You ask me first when ___. Then don’t take it back.`;
      return {
        h, sub: 'Built only from your answers. No score and no comparison: your week against your own words.',
        rows, total, others, lines: [admit, struggle, shine, exactly],
        ask: 'What could your team do next month if they didn’t have to wait for you?', action, when: dayTitle(a),
        quote: { t: 'Often the constraint is the founder’s approval. Check your own desk first.', src: 'Worth Building, by Alexandru Cojocari' },
        bridge: 'Your desk is one side of Lead your people. The Leader’s North Star reads all four: Lead yourself, Lead your people, Lead your business and Lead the market, and ends with a plan you can tick off.',
        honest: '<strong>Honest note.</strong> A self-reflection tool, not HR or legal advice. It uses only your own answers about last week. Hand over decisions your business, your contracts and the law allow.',
        caption: 'I took the bottleneck test. This week, one decision leaves my desk for good.',
      };
    },
    card(a, show) {
      const n = a.waiting;
      return show
        ? { head: `${n} ${n === 1 ? 'decision was' : 'decisions were'} waiting on me.`, sub: 'This week, one of them leaves my desk for good.', visual: (x, X, Y, W, H) => cardGlass(x, X, Y, W, H, n, true) }
        : { head: 'I found my bottleneck.', sub: 'This week, one decision leaves my desk for good.', visual: (x, X, Y, W, H) => cardGlass(x, X, Y, W, H, 9, false) };
    },
  },

  /* ═════ 3. The off-switch check · I can't switch off · Lead yourself ═════ */
  offswitch: {
    id: 'offswitch', name: 'The off-switch check', domain: 'Lead yourself', domColor: '#E0A282',
    qs: [
      { id: 'where', type: 'tap', q: 'Where does work find you most when you’re off?', hint: 'The first one that comes to mind.', options: ['In bed, at night', 'At the dinner table', 'At the weekend', 'First thing in the morning', 'On holiday'] },
      { id: 'off', type: 'slide', q: 'Last week, how many evenings were fully off?', hint: 'No work, no messages, no “quick look”.', min: 0, max: 7, step: 1, start: 3, fmt: (v) => v + ' of 7', words: (v) => (v === 7 ? 'every evening' : v === 1 ? 'evening' : 'evenings'), ends: ['None', 'All seven'] },
      { id: 'extra', type: 'slide', q: 'Hours of work outside your planned hours last week', hint: 'Evenings, weekends, and the quick checks that weren’t quick.', min: 0, max: 40, step: 1, start: 8, fmt: (v) => String(v), words: (v) => (v === 1 ? 'hour' : 'hours') + (v === 40 ? ' or more' : ''), ends: ['None', '40 or more'] },
      { id: 'checks', type: 'slide', q: 'How many times a day do you check work messages outside work hours?', hint: 'A rough count is fine.', min: 0, max: 40, step: 1, start: 8, fmt: (v) => String(v), words: (v) => (v === 1 ? 'time a day' : 'times a day') + (v === 40 ? ' or more' : ''), ends: ['Never', '40 or more'] },
      { id: 'reply', type: 'tap', q: 'If you didn’t reply until morning, what would really happen?', hint: 'Not the fear. What has actually happened before.', options: ['Something would break', 'A client might be upset', 'Nothing much, honestly', 'I don’t know. I’ve never tried'] },
      { id: 'value', type: 'tap', q: 'Who or what should your evenings belong to?', hint: 'Pick the one that matters most this year.', options: ['My family', 'My partner', 'My health', 'My faith', 'My friends', 'Rest, simply'] },
      { id: 'day', type: 'day', q: 'Which evening this week will be fully off?', hint: 'One evening. Small enough to keep.' },
      { id: 'time', type: 'tap', q: 'From what time?', hint: 'The moment the switch goes off.', options: ['6 pm', '7 pm', '8 pm', '9 pm'] },
      { id: 'urgent', type: 'text', optional: true, q: 'Who handles anything truly urgent that evening?', hint: 'A name, or write “it waits until morning”.', ph: 'e.g. Maria' },
      { id: 'phone', type: 'text', optional: true, q: 'Where will your phone sleep that evening?', hint: 'Somewhere you can’t reach from the sofa.', ph: 'e.g. a kitchen drawer' },
    ],
    calc(a) {
      const worked = 7 - a.off, year = a.extra * 52;
      return { worked, year, days: year / 8, checksWeek: a.checks * 7 };
    },
    insight(a) {
      const c = this.calc(a);
      if (c.worked === 0 && a.extra === 0) return { big: '7 of 7', line: 'evenings were fully yours last week, with no work outside your planned hours. Your off-switch works.', calcline: '', vis: moons(a.off, false), tease: ['what keeps it working', 'one rule that protects it', `your evening ${a.day === 0 ? 'tonight' : 'on ' + dayLong(dayOf(a))}`] };
      const line = `${c.worked === 1 ? 'evening' : 'evenings'} had work in ${c.worked === 1 ? 'it' : 'them'} last week, and about ${a.extra} ${a.extra === 1 ? 'hour' : 'hours'} of work fell outside your planned hours.`;
      const calcline = a.extra > 0 ? `If last week was a normal week: ${a.extra} × 52 = ${num(c.year)} hours a year, about ${num(c.days)} eight-hour days.` : '';
      return { big: c.worked + ' of 7', line, calcline, vis: moons(a.off, false), tease: ['what keeps your switch on', 'one rule that protects your evening', `your evening ${a.day === 0 ? 'tonight' : 'on ' + dayLong(dayOf(a))}, from ${['6 pm', '7 pm', '8 pm', '9 pm'][a.time]}`] };
    },
    result(a, st) {
      const c = this.calc(a);
      const nm = st.name ? esc(st.name) + ', ' : '';
      const time = ['6 pm', '7 pm', '8 pm', '9 pm'][a.time];
      const ev = a.day === 0 ? 'tonight is yours' : dayLong(dayOf(a)).split(',')[0] + ' evening is yours';
      const h = cap(nm + ev + '.');
      const rows = [
        ['Evenings with work in them last week', c.worked + ' of 7'],
        ['Hours outside your planned hours', String(a.extra)],
      ];
      const total = ['= If every week is like last week', num(c.year) + ' hours a year', `${a.extra} × 52 · about ${num(c.days)} eight-hour days`];
      const others = [
        ['Work messages checked outside work', a.checks + ' a day', `About ${num(c.checksWeek)} times a week work walks back in.`],
      ];
      const whereTxt = ['in bed, at night', 'at the dinner table', 'at the weekend', 'first thing in the morning', 'on holiday'][a.where];
      const admit = `Work found you ${whereTxt}, on ${c.worked} of 7 evenings, and you checked messages about ${num(c.checksWeek)} times a week outside work.`;
      const struggle = [
        'If one evening off would break something, the business has one point of failure: you. Don’t fight that. Name who handles what is truly urgent.',
        'A client might be upset. Don’t fight the worry. Tell them when you reply, then keep your word. A clear rule is a kind of service.',
        'You already know it can wait. Only the habit holds the door open. Don’t fight the habit. Give the phone a place to sleep.',
        'You have never tested it. Don’t fight the doubt. One evening is a small, safe test.',
      ][a.reply];
      const valueTxt = ['your family', 'your partner', 'your health', 'your faith', 'your friends', 'rest'][a.value];
      const shine = a.off >= 1 ? `You kept ${a.off} ${a.off === 1 ? 'evening' : 'evenings'} fully off last week. You can do this; you already did.` : `You named who your evenings belong to: ${valueTxt}. That is the reason the switch exists.`;
      const urgent = (a.urgent || '').trim(), phone = (a.phone || '').trim();
      const waits = /wait/i.test(urgent);
      const urgentLine = !urgent ? 'Decide before then who handles anything truly urgent.' : waits ? 'Anything urgent waits until morning.' : `${esc(urgent)} handles anything truly urgent.`;
      const place = !phone ? 'out of reach' : /^(in|on|at|by|under|inside|outside|with|behind)\s/i.test(phone) ? phone : 'in ' + phone;
      const exactly = `From ${time} ${a.day === 0 ? 'tonight' : 'on ' + dayLong(dayOf(a))}, you are off. Your phone sleeps ${esc(place)}. ${urgentLine} Everything else waits until morning.`;
      const action = `From ${time}: off. Phone ${place}. ${!urgent ? 'Choose who handles anything truly urgent.' : waits ? 'Anything urgent waits until morning.' : urgent + ' handles anything truly urgent.'} Tell one person at home, so they can hold you to it.`;
      return {
        h, sub: `Built only from your answers. Your evenings belong to ${valueTxt}; this reading helps you give one back.`,
        rows, total, others, lines: [admit, struggle, shine, exactly],
        ask: 'If every week next year looks like last week, is that the life you started this business for?', action, when: `${a.day === 0 ? 'Tonight' : dayLong(dayOf(a))} · from ${time}`,
        quote: { t: 'Founders do not burn out because they work hard. They burn out because the push never ends. Choose your season. Then choose your restore.', src: 'Alexandru Cojocari, Worth Building' },
        bridge: 'Your evenings are part of Lead yourself. The Leader’s North Star reads all four sides: Lead yourself, Lead your people, Lead your business and Lead the market, and ends with a plan you can tick off.',
        honest: '<strong>Honest note.</strong> A self-reflection tool, not medical or psychological advice. If you haven’t been able to switch off for weeks, or sleep and mood are suffering, please talk to your doctor.',
        caption: 'I took the off-switch check. One evening this week is fully mine.',
      };
    },
    card(a, show) {
      return show
        ? { head: a.off === 7 ? 'Seven of seven evenings were mine last week.' : `${a.off} of 7 evenings were mine last week.`, sub: a.off === 7 ? 'I’m keeping it that way.' : 'This week I take one more back.', visual: (x, X, Y, W, H) => cardMoons(x, X, Y, W, H, a.off, true) }
        : { head: 'I chose an evening that is fully mine.', sub: 'Phone asleep. Me, present.', visual: (x, X, Y, W, H) => cardMoons(x, X, Y, W, H, 1, false) };
    },
  },
};
/** Each page's id (catalog.js) and its tool here. */
export const BY_PAGE = { runway: TOOLS.cash, bottleneck: TOOLS.bottleneck, 'off-switch': TOOLS.offswitch };

/* ── In-page visuals (SVG, theme colours) ──────────────────── */
function strip(A, C) {
  const n = 52, bw = 8, gap = 2, W = n * (bw + gap), filled = Math.min(n, Math.max(0, A)), ext = C !== null && C > A ? Math.min(n, C) : filled;
  let bars = '';
  for (let i = 0; i < n; i++) {
    const f = i < Math.floor(filled) ? 1 : i < filled ? filled - i : 0;
    const e = !f && i < Math.floor(ext);
    bars += `<rect x="${i * (bw + gap)}" y="14" width="${bw}" height="44" rx="2" fill="var(--steel-soft)" stroke="var(--line)" stroke-width=".6"/>`;
    if (f) bars += `<rect x="${i * (bw + gap)}" y="14" width="${(bw * f).toFixed(2)}" height="44" rx="2" fill="var(--acc)"/>`;
    else if (e) bars += `<rect x="${i * (bw + gap)}" y="14" width="${bw}" height="44" rx="2" fill="var(--acc)" opacity=".28"/>`;
  }
  const endX = Math.min(W - 2, Math.max(0, filled * (bw + gap)));
  const lab = A <= 0 ? '' : A >= 52 ? 'a year and more' : 'about ' + weeks(A);
  const anchor = endX > W - 90 ? 'end' : endX < 90 ? 'start' : 'middle';
  return `<svg viewBox="-4 0 ${W + 8} 96" role="img" aria-label="Your runway on a strip of 52 weeks: ${esc(lab || 'no weeks')}">
    ${bars}
    ${A > 0 ? `<line x1="${endX}" y1="6" x2="${endX}" y2="64" stroke="var(--ink)" stroke-width="1.2"/>` : ''}
    <text x="0" y="82" font-size="12" fill="var(--muted)" font-family="Inter,sans-serif">Today</text>
    <text x="${W}" y="82" font-size="12" fill="var(--muted)" text-anchor="end" font-family="Inter,sans-serif">52 weeks</text>
    ${A > 0 && A < 46 && A > 6 ? `<text x="${endX}" y="82" font-size="12.5" font-weight="600" fill="var(--ink)" text-anchor="${anchor}" font-family="Inter,sans-serif">${esc(lab)}</text>` : ''}
    ${C !== null && C > A ? `<text x="0" y="8" font-size="11" fill="var(--muted)" font-family="Inter,sans-serif">Pale: if the money owed arrives</text>` : ''}
  </svg>`;
}
function hourglass(n, stop) {
  const dots = Math.min(n, 40); let d = '';
  const cols = 8;
  for (let i = 0; i < dots; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const rowW = 150 - row * 22; const cx = 140 - rowW / 2 + (col + .5) * (rowW / cols);
    if (cx < 140 - rowW / 2 + 6 || cx > 140 + rowW / 2 - 6) continue;
    d += `<circle cx="${cx.toFixed(1)}" cy="${(46 + row * 15).toFixed(1)}" r="5" fill="var(--acc)"/>`;
  }
  const people = [100, 120, 140, 160, 180].map((x) => `<circle cx="${x}" cy="196" r="7" fill="none" stroke="var(--muted)" stroke-width="1.4"/><path d="M${x - 10} 214c2-6 6-9 10-9s8 3 10 9" fill="none" stroke="var(--muted)" stroke-width="1.4"/>`).join('');
  return `<svg viewBox="0 0 420 230" role="img" aria-label="An hourglass: ${n} decisions waiting above, the narrow neck is you, your team below.">
    <path d="M50 22h180M50 228h180" stroke="var(--line)" stroke-width="2"/>
    <path d="M60 24c0 60 60 70 72 92c-12 22-72 32-72 92M220 24c0 60-60 70-72 92c12 22 72 32 72 92" fill="none" stroke="var(--ink)" stroke-width="1.6"/>
    ${d}
    <rect x="120" y="106" width="40" height="20" rx="10" fill="var(--acc)"/>
    <text x="140" y="120" font-size="10.5" font-weight="700" letter-spacing="1.5" text-anchor="middle" fill="var(--paper)" font-family="Inter,sans-serif">YOU</text>
    ${people}
    <text x="250" y="60" font-size="13" fill="var(--ink)" font-weight="600" font-family="Inter,sans-serif">${n} waiting${n > 40 ? ' (40 shown)' : ''}</text>
    <text x="250" y="78" font-size="12" fill="var(--muted)" font-family="Inter,sans-serif">for your answer</text>
    <text x="250" y="190" font-size="13" fill="var(--ink)" font-weight="600" font-family="Inter,sans-serif">${stop}% stops</text>
    <text x="250" y="208" font-size="12" fill="var(--muted)" font-family="Inter,sans-serif">if you step away</text>
  </svg>`;
}
function moons(off) {
  let s = '';
  for (let i = 0; i < 7; i++) {
    const x = 34 + i * 62, isOff = i >= 7 - off;
    s += isOff
      ? `<circle cx="${x}" cy="44" r="22" fill="var(--gold)" opacity=".18"/><circle cx="${x}" cy="44" r="16" fill="var(--gold)"/>`
      : `<circle cx="${x}" cy="44" r="16" fill="var(--steel-soft)" stroke="var(--line)"/><rect x="${x - 8}" y="38" width="16" height="11" rx="1.5" fill="var(--acc)" opacity=".75"/><path d="M${x - 11} 51h22" stroke="var(--acc)" stroke-width="1.6"/>`;
  }
  return `<svg viewBox="0 0 440 100" role="img" aria-label="Seven evenings: ${off} fully off, ${7 - off} with work in them.">
    ${s}
    <text x="12" y="92" font-size="12" fill="var(--muted)" font-family="Inter,sans-serif">Laptop: work came home</text>
    <text x="428" y="92" font-size="12" fill="var(--muted)" text-anchor="end" font-family="Inter,sans-serif">Moon: fully off</text>
  </svg>`;
}

/* ── The share card (canvas, 1200 × 630) ───────────────────── */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function wrapText(c, text, maxW) { const words = text.split(' '), lines = []; let line = ''; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); return lines; }
const spacing = (c, v) => { if ('letterSpacing' in c) c.letterSpacing = v; };
function markC(c, x, y, s, col) { const k = s / 24; c.save(); c.translate(x, y); c.scale(k, k); c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(12, 2.5); c.lineTo(21.5, 12); c.lineTo(12, 21.5); c.lineTo(2.5, 12); c.closePath(); c.stroke(); c.fillStyle = col; c.beginPath(); c.moveTo(12, 5.7); c.lineTo(14, 10); c.lineTo(18.3, 12); c.lineTo(14, 14); c.lineTo(12, 18.3); c.lineTo(10, 14); c.lineTo(5.7, 12); c.lineTo(10, 10); c.closePath(); c.fill(); c.restore(); }
function cardStrip(c, X, Y, W, H, A, show) {
  const cols = 13, rows = 4, s = 22, g = 8, gw = cols * (s + g) - g, x0 = X + (W - gw) / 2, y0 = Y + 120;
  markC(c, X + W / 2 - 22, Y + 20, 44, '#E8D9B5');
  for (let i = 0; i < 52; i++) {
    const r = Math.floor(i / cols), k = i % cols, x = x0 + k * (s + g), y = y0 + r * (s + g);
    const f = show ? Math.max(0, Math.min(1, A - i)) : 0;
    c.fillStyle = 'rgba(169,192,217,.14)'; c.strokeStyle = 'rgba(169,192,217,.35)'; c.lineWidth = 1;
    c.beginPath(); c.rect(x, y, s, s); c.fill(); c.stroke();
    if (f > 0) { c.fillStyle = '#A9C0D9'; c.fillRect(x, y, s * f, s); }
  }
  c.textAlign = 'center'; c.fillStyle = '#DCE6F1'; c.font = 'italic 400 30px Newsreader, Georgia, serif';
  c.fillText('One square, one week.', X + W / 2, y0 + rows * (s + g) + 52);
  c.fillStyle = '#A9C0D9'; c.font = '500 17px Inter, Arial, sans-serif';
  c.fillText(show ? 'Lit: the weeks my cash covers.' : 'Now I know how many are mine.', X + W / 2, y0 + rows * (s + g) + 84);
  c.textAlign = 'left';
}
function cardGlass(c, X, Y, W, H, n, show) {
  const cx = X + W / 2, top = Y + 30, mid = Y + 190, bot = Y + 350;
  c.strokeStyle = 'rgba(220,230,241,.75)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx - 120, top); c.bezierCurveTo(cx - 120, top + 100, cx - 20, mid - 40, cx - 14, mid); c.bezierCurveTo(cx - 20, mid + 40, cx - 120, bot - 100, cx - 120, bot); c.stroke();
  c.beginPath(); c.moveTo(cx + 120, top); c.bezierCurveTo(cx + 120, top + 100, cx + 20, mid - 40, cx + 14, mid); c.bezierCurveTo(cx + 20, mid + 40, cx + 120, bot - 100, cx + 120, bot); c.stroke();
  c.strokeStyle = 'rgba(169,192,217,.45)'; c.beginPath(); c.moveTo(cx - 150, top); c.lineTo(cx + 150, top); c.moveTo(cx - 150, bot); c.lineTo(cx + 150, bot); c.stroke();
  const dots = Math.min(n, 40), cols = 8;
  c.fillStyle = '#A9C0D9';
  for (let i = 0; i < dots; i++) {
    const r = Math.floor(i / cols), k = i % cols, rw = 200 - r * 34, x = cx - rw / 2 + (k + .5) * (rw / cols);
    if (rw < 40) continue;
    c.beginPath(); c.arc(x, top + 24 + r * 22, 7, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = '#E8D9B5'; c.beginPath(); if (c.roundRect) c.roundRect(cx - 34, mid - 15, 68, 30, 15); else c.rect(cx - 34, mid - 15, 68, 30); c.fill();
  c.fillStyle = '#0E1C2B'; c.font = '700 15px Inter, Arial, sans-serif'; spacing(c, '3px'); c.textAlign = 'center'; c.fillText('YOU', cx + 1.5, mid + 5); spacing(c, '0px');
  c.strokeStyle = 'rgba(220,230,241,.55)'; c.lineWidth = 1.6;
  [-76, -38, 0, 38, 76].forEach((dx) => { c.beginPath(); c.arc(cx + dx, bot - 40, 9, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(cx + dx - 13, bot - 12); c.quadraticCurveTo(cx + dx, bot - 30, cx + dx + 13, bot - 12); c.stroke(); });
  c.fillStyle = '#DCE6F1'; c.font = 'italic 400 28px Newsreader, Georgia, serif';
  c.fillText('The narrow point was my desk.', cx, bot + 44);
  c.textAlign = 'left';
}
function cardMoons(c, X, Y, W, H, off, show) {
  const r = 22, gap = 56, x0 = X + (W - 6 * gap) / 2, y = Y + 170;
  for (let i = 0; i < 7; i++) {
    const x = x0 + i * gap, lit = i >= 7 - off;
    if (lit) {
      const g = c.createRadialGradient(x, y, 4, x, y, r * 2.2); g.addColorStop(0, 'rgba(232,217,181,.55)'); g.addColorStop(1, 'rgba(232,217,181,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 2.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E8D9B5'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    } else {
      c.strokeStyle = 'rgba(169,192,217,.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
    }
  }
  c.textAlign = 'center'; c.fillStyle = '#DCE6F1'; c.font = 'italic 400 30px Newsreader, Georgia, serif';
  c.fillText(show ? 'Moon: an evening fully off.' : 'One evening, fully off.', X + W / 2, y + 110);
  c.fillStyle = '#A9C0D9'; c.font = '500 17px Inter, Arial, sans-serif';
  c.fillText(show ? 'Last week.' : 'This week.', X + W / 2, y + 142);
  c.textAlign = 'left';
}
let fontsReady = null;
function loadFonts() {
  if (!fontsReady) {
    const f = typeof document !== 'undefined' ? document.fonts : null;
    fontsReady = f && f.load ? Promise.race([Promise.all(['500 58px Newsreader', 'italic 400 30px Newsreader', '500 19px Inter', '600 17px Inter', '700 15px Inter'].map((s) => f.load(s).catch(() => null))), new Promise((r) => setTimeout(r, 1800))]) : Promise.resolve();
  }
  return fontsReady;
}
export async function drawCard(cv, t, a, show) {
  await loadFonts();
  const c = cv.getContext('2d'), W = 1200, H = 630, spec = t.card(a, show);
  c.clearRect(0, 0, W, H);
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#15283F'); g.addColorStop(.55, '#0E1C2B'); g.addColorStop(1, '#0A1522');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const rg = c.createRadialGradient(W * .78, H * .42, 10, W * .78, H * .42, 430); rg.addColorStop(0, 'rgba(111,147,184,.24)'); rg.addColorStop(1, 'rgba(111,147,184,0)');
  c.fillStyle = rg; c.fillRect(0, 0, W, H);
  const r = rng(t.id.length * 97 + 11);
  for (let i = 0; i < 110; i++) { c.globalAlpha = .12 + r() * .5; c.fillStyle = '#DCE6F1'; c.beginPath(); c.arc(r() * W, r() * H * .9, r() * 1.4 + .3, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  c.strokeStyle = 'rgba(169,192,217,.25)'; c.lineWidth = 1.5; c.strokeRect(30, 30, W - 60, H - 60);
  markC(c, 70, 64, 30, '#A9C0D9');
  c.fillStyle = '#EEF2F7'; c.font = '600 17px Inter, Arial, sans-serif'; spacing(c, '4px'); c.fillText('EXPLORASELF', 112, 85);
  c.fillStyle = '#A9C0D9'; c.font = '600 16px Inter, Arial, sans-serif'; spacing(c, '3px'); c.fillText(t.name.toUpperCase(), 72, 170); spacing(c, '0px');
  c.fillStyle = '#F4F7FB'; c.font = '500 58px Newsreader, Georgia, serif';
  let y = 246; wrapText(c, spec.head, 610).slice(0, 3).forEach((l) => { c.fillText(l, 70, y); y += 66; });
  c.fillStyle = '#B8C6D6'; c.font = 'italic 400 30px Newsreader, Georgia, serif'; y += 8;
  wrapText(c, spec.sub, 590).slice(0, 2).forEach((l) => { c.fillText(l, 72, y); y += 40; });
  c.fillStyle = t.domColor; c.beginPath(); c.arc(79, H - 82, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DCE6F1'; c.font = '500 19px Inter, Arial, sans-serif'; c.fillText(t.domain, 96, H - 75);
  c.fillStyle = '#A9C0D9'; c.textAlign = 'right'; c.fillText('linktolead.exploraself.com', W - 72, H - 75); c.textAlign = 'left';
  spec.visual(c, 740, 110, 390, 400);
  return cv.toDataURL('image/png');
}
