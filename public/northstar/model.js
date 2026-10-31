/* The Leader’s North Star questions: eight per stage, two per domain, asked
 * for the stage the founder is in today. Rewritten 31 Oct 2026 (Alexandru:
 * easier, better questions, nothing to write): each is one plain question,
 * one short hint, and two lines of feedback shown the moment it is answered,
 * `lo` for Not yet / I think so and `hi` for Mostly / Yes, I’ve checked.
 * `short` is its name in the list of questions. */
(function (root) {
  'use strict';
  const Q = [
  {"id": "q1", "stage": "building", "domain": "self", "short": "What the business is for", "text": "Do you know what this business must give your life: the income, the time and the people it must protect?", "prompt": "Your “enough”: money, free time, health and the people you love.", "lo": "Then the business will decide for you. Name your enough tonight: one number and one day off a week.", "hi": "Good. Now hold it against last week: did your hours pay for that life, or postpone it?"},
  {"id": "q2", "stage": "building", "domain": "self", "short": "What you can risk", "text": "Do you know how much time and money you can risk on this, and when you would stop?", "prompt": "A limit set before you start protects you later.", "lo": "Set your limit now, while you are calm: an amount, a number of months, and the sign that says stop.", "hi": "Then you can be bold inside a limit. Keep it where you will see it."},
  {"id": "q3", "stage": "building", "domain": "people", "short": "The people affected", "text": "Have the people closest to you agreed to what this business will cost them?", "prompt": "Partner, family, a co-founder: their time, money and evenings.", "lo": "An agreement never made becomes a fight later. Have one honest talk this week.", "hi": "Then they are with you, not just near you. Check in again in a month."},
  {"id": "q4", "stage": "building", "domain": "people", "short": "An honest voice", "text": "Is there someone who tells you plainly what could be wrong with your idea?", "prompt": "Not a cheerleader. Someone who will say no.", "lo": "Find one honest voice and ask: “What would make this fail?”", "hi": "Keep them close, and ask before big decisions, not after."},
  {"id": "q5", "stage": "building", "domain": "work", "short": "What a sale really costs", "text": "Do you know what one sale really costs you, including your own hours?", "prompt": "Materials, fees, and the hours you never count.", "lo": "Count one job from start to finish, hours included. That number is your price floor.", "hi": "Then you can price with confidence. Never sell below it."},
  {"id": "q6", "stage": "building", "domain": "work", "short": "Your monthly number", "text": "Do you know how much you must sell each month to cover your costs and pay yourself?", "prompt": "One monthly target, and the cash you keep aside.", "lo": "Write one number: what a month must bring in. Everything else follows from it.", "hi": "Then every week has a target. Check it every Monday."},
  {"id": "q7", "stage": "building", "domain": "market", "short": "Their problem, tested", "text": "Have you asked real customers about their problem, and has anyone paid you yet?", "prompt": "Payment is evidence. Praise is only interest.", "lo": "Talk to five people with the problem this week. Ask what they tried and what it cost them.", "hi": "Then you have evidence. Ask the next ten the same questions."},
  {"id": "q8", "stage": "building", "domain": "market", "short": "Who you help", "text": "Can you say in one sentence who you help and what they get?", "prompt": "If a customer can repeat it, it works.", "lo": "Fill in: “I help ___ with ___, so they ___.” Test it on one person this week.", "hi": "Then say it the same way every time. Clarity sells."},
  {"id": "q9", "stage": "growing", "domain": "self", "short": "Where your week went", "text": "Do you check each week whether your time went to what matters most?", "prompt": "Last week’s calendar against your top priority.", "lo": "Fifteen minutes on Friday: where did the hours go, and what moves next week?", "hi": "Then you lead your week. Protect the first hours of the day."},
  {"id": "q10", "stage": "growing", "domain": "self", "short": "Growth you can keep up", "text": "Can you grow without wearing yourself out?", "prompt": "Sleep, evenings off, energy at the end of the week.", "lo": "Growth that burns you out is borrowed. Take back one evening this week.", "hi": "Then your pace can last. Keep the evening that keeps you."},
  {"id": "q11", "stage": "growing", "domain": "people", "short": "What is included", "text": "Do clients and helpers know what is included, and what happens if things change?", "prompt": "Scope, deadlines and extra work, said before the work starts.", "lo": "Write what is included on one page. Unclear terms become unpaid work.", "hi": "Then fewer surprises. Update it when something new comes up."},
  {"id": "q12", "stage": "growing", "domain": "people", "short": "Hard talks, early", "text": "Do you deal with difficult conversations early, before they grow?", "prompt": "A late payment, a mistake, a disappointment.", "lo": "Name the conversation you are avoiding. Have it this week, kindly and plainly.", "hi": "Then problems stay small. Keep the habit."},
  {"id": "q13", "stage": "growing", "domain": "work", "short": "What is left", "text": "Do you know each month what is left after costs?", "prompt": "Money in, money out, what is left, and your hours.", "lo": "Read three numbers every month: in, out and left. Busy is not the same as profitable.", "hi": "Then you can decide with numbers, not with your mood."},
  {"id": "q14", "stage": "growing", "domain": "work", "short": "Delivery without starting over", "text": "Can you deliver your main service the same good way every time?", "prompt": "A checklist, a template, a routine.", "lo": "Write the ten steps of your main job. That one page saves hours every week.", "hi": "Then someone else could help you deliver it. That is how you grow."},
  {"id": "q15", "stage": "growing", "domain": "market", "short": "Where customers come from", "text": "Do you know where your new customers come from?", "prompt": "Referrals, social media, ads, partners.", "lo": "Ask your last five clients how they found you. Do more of what worked.", "hi": "Then put your marketing hour there, every week."},
  {"id": "q16", "stage": "growing", "domain": "market", "short": "Why they stay or leave", "text": "Do you know why customers come back, or stop buying?", "prompt": "Ask them. Their words are evidence.", "lo": "Ask two clients who came back and one who stopped. Write down their exact words.", "hi": "Then you know what to protect, and what to fix."},
  {"id": "q17", "stage": "scaling", "domain": "self", "short": "Letting a decision go", "text": "Can you let someone else decide, without taking it back?", "prompt": "Trust given in steps, with one check.", "lo": "Hand over one decision this week, with a clear limit. Then do not take it back.", "hi": "Then you are building leaders, not helpers."},
  {"id": "q18", "stage": "scaling", "domain": "self", "short": "When your way slows things", "text": "Do you notice when wanting it done your way slows the business?", "prompt": "Work that waits for your approval.", "lo": "Count what waited for you last week. Each item is a decision someone else could make.", "hi": "Then you know where to let go next."},
  {"id": "q19", "stage": "scaling", "domain": "people", "short": "Who decides what", "text": "Does everyone know what they can decide, and when to call you?", "prompt": "For each area: an owner, a limit, and when to call.", "lo": "For each area write who owns it, their limit, and when they call you.", "hi": "Then the team moves without you in every room."},
  {"id": "q20", "stage": "scaling", "domain": "people", "short": "Bad news, early", "text": "Can people tell you something is going wrong, safely?", "prompt": "Bad news early is a gift.", "lo": "Thank the next person who brings you bad news, before you react.", "hi": "Then you hear problems while they are still small."},
  {"id": "q21", "stage": "scaling", "domain": "work", "short": "What more work costs", "text": "Before taking on more work, do you check what it will cost to deliver?", "prompt": "Extra people, extra hours, and cash before you are paid.", "lo": "Before the next big yes, write who delivers it, what it costs, and when the cash arrives.", "hi": "Then you grow without cash surprises."},
  {"id": "q22", "stage": "scaling", "domain": "work", "short": "The work without you", "text": "Could the main work run for two weeks without you?", "prompt": "Written steps, an owner and a backup.", "lo": "Pick one process. Write it down, hand it over, and step away for a day.", "hi": "Then the business is an asset, not only a job."},
  {"id": "q23", "stage": "scaling", "domain": "market", "short": "A new market, tested", "text": "Do you test a new market or channel before betting on it?", "prompt": "A small test with a number that counts as success.", "lo": "Test small: ten people, two weeks, and one number that counts as success.", "hi": "Then you expand on evidence, not hope."},
  {"id": "q24", "stage": "scaling", "domain": "market", "short": "If your biggest client left", "text": "Do you know what would happen if your biggest client or channel disappeared?", "prompt": "The share of your sales from your top client.", "lo": "Find your top client’s share of sales. Above a third, start a second source now.", "hi": "Then you are protected. Keep it that way."},
  {"id": "q25", "stage": "leading", "domain": "self", "short": "What enough looks like", "text": "Do you know what enough looks like now, and why you want the next goal?", "prompt": "Is the next goal yours, or a habit?", "lo": "Write why you want the next goal. If you cannot, wait before you chase it.", "hi": "Then your ambition serves your life, not the other way round."},
  {"id": "q26", "stage": "leading", "domain": "self", "short": "What to stop", "text": "Do you make time to question your plans and stop what no longer matters?", "prompt": "One thing to stop, every quarter.", "lo": "Each quarter, stop one thing. Choose it today.", "hi": "Then the business stays light enough to steer."},
  {"id": "q27", "stage": "leading", "domain": "people", "short": "Growing leaders", "text": "Are you growing people who can lead without you?", "prompt": "Who could take your place in one area?", "lo": "Choose one person. Give them something real to own, and meet every week.", "hi": "Then your leadership outlives your presence."},
  {"id": "q28", "stage": "leading", "domain": "people", "short": "Who steps in", "text": "If you were away for a month, would everyone know who is responsible?", "prompt": "Roles, backups and decisions.", "lo": "Write who steps in for each area. Then test it with a week away.", "hi": "Then the business is ready for your absence, and for your future."},
  {"id": "q29", "stage": "leading", "domain": "work", "short": "Options, compared", "text": "Do you compare options before committing big money or time?", "prompt": "Two options, side by side, on paper.", "lo": "For the next big decision, write two options and what each one costs.", "hi": "Then you decide with clarity and courage."},
  {"id": "q30", "stage": "leading", "domain": "work", "short": "A shock, tested", "text": "Have you tested how the business would handle a serious shock?", "prompt": "A lost client, an illness, late payments.", "lo": "Pick one shock. Write the first three things you would do. That is your plan.", "hi": "Then you stay steady when others panic."},
  {"id": "q31", "stage": "leading", "domain": "market", "short": "Who is better off", "text": "Do you check who is better off because of your business: customers, your people and others?", "prompt": "Their words, not your guess.", "lo": "Ask three clients what changed for them, and write down their words.", "hi": "Then your impact is your message. Share it."},
  {"id": "q32", "stage": "leading", "domain": "market", "short": "Changing needs", "text": "Do you watch how your customers’ needs are changing?", "prompt": "New requests, lost deals, new competitors.", "lo": "Each month, write down one thing customers asked for that you do not offer yet.", "hi": "Then you move before the market forces you to."}
  ];
  /* Part 2 · Your people (31 Oct 2026): first who works with you today, then
   * three questions about customers (two sets: with paying customers, or not
   * yet) and three about the people who do the work (two sets: just me, so how
   * to build a team; or with help or a team). Same four answers as Part 1. */
  const P2 = {
    team: [['solo', 'Just me', 'I do the work myself'], ['help', 'Me and some help', 'Freelancers, family or part-timers'], ['team', 'A team', 'People who work with me every week']],
    customers: {
      yes: [
        { id: 'cy1', short: 'Your best customers', text: 'Can you name your best customers, and say what they have in common?', prompt: 'Who pays on time, comes back, and sends others.', lo: 'List your five best customers tonight. Circle what they share. That is who you grow toward.', hi: 'Then you know who to find more of. Say no faster to the rest.' },
        { id: 'cy2', short: 'What they would miss', text: 'Do you know what your customers would miss if you closed tomorrow?', prompt: 'In their words, not yours.', lo: 'Ask two customers: “What would you miss if we stopped?” Write down their exact words.', hi: 'Then that is your message. Put their words where new customers look.' },
        { id: 'cy3', short: 'Listening, then changing', text: 'In the last three months, did you change something because a customer told you?', prompt: 'A price, a step, a message, a delivery day.', lo: 'Ask one customer what annoys them about working with you. Fix one small thing this month.', hi: 'Then customers feel heard. Tell them what you changed: that is how loyalty is built.' },
      ],
      plan: [
        { id: 'cn1', short: 'The first five', text: 'Can you name five real people who have the problem you solve?', prompt: 'Names, not a market.', lo: 'Write five names tonight. If you cannot, that is your first job this week.', hi: 'Then talk to them before you build more. Their words will shape the offer.' },
        { id: 'cn2', short: 'Their words', text: 'Have you heard someone describe the problem in their own words?', prompt: 'What it costs them, and what they already tried.', lo: 'Have one conversation this week. Ask what they tried and what it cost them.', hi: 'Then use their exact words in your offer. People buy what they recognise.' },
        { id: 'cn3', short: 'The first yes', text: 'Have you asked anyone to buy, or to pay a deposit?', prompt: 'A yes with money is evidence. A compliment is not.', lo: 'Ask one person for a small yes this month: a pre-order, a deposit, a paid trial.', hi: 'Then you have evidence. Ask the next five the same way.' },
      ],
    },
    people: {
      solo: [
        { id: 'ts1', short: 'The first handover', text: 'Do you know the first task you would give to someone else?', prompt: 'One you do often, that someone could learn.', lo: 'List what you did last week. Circle one task someone else could learn in a day.', hi: 'Then write it down. That page is your first hire.' },
        { id: 'ts2', short: 'Written down', text: 'Could someone do your main task from a written page?', prompt: 'The steps, the standard, and when to ask you.', lo: 'Write the ten steps of one task. Ten lines is enough to start.', hi: 'Then test it: hand it to someone for one week and stay out of it.' },
        { id: 'ts3', short: 'When you can pay', text: 'Do you know how much you could pay for help, and from when?', prompt: 'An hourly rate or a monthly amount, and the month it starts.', lo: 'Pick a number and a month. A plan with a date gets done; a wish does not.', hi: 'Then put the date in your calendar and start looking a month before.' },
      ],
      team: [
        { id: 'tt1', short: 'A good week, defined', text: 'Does each person know what a good week looks like in their role?', prompt: 'One or two results, not a list of tasks.', lo: 'For each person, write the one result that makes their week good. Tell them.', hi: 'Then they can judge their own work. Ask them how the week went before you say.' },
        { id: 'tt2', short: 'Plain feedback', text: 'Do you tell people plainly when work is good, and when it is not?', prompt: 'Soon, kindly, and specific.', lo: 'This week, give one person one specific thank-you and one specific fix.', hi: 'Then trust grows both ways. Keep it weekly.' },
        { id: 'tt3', short: 'Deciding without you', text: 'Could someone decide something today without asking you?', prompt: 'A refund, a schedule, a small spend.', lo: 'Give one person one decision with a limit. Then do not take it back.', hi: 'Then you are building leaders. Give the next decision a bigger limit.' },
      ],
    },
  };
  /** The six Part 2 questions for this founder: customers first, then people. */
  P2.questions = (mode, team) => [...P2.customers[mode === 'yes' ? 'yes' : 'plan'], ...P2.people[team === 'solo' || !team ? 'solo' : 'team']];
  P2.ids = () => [...P2.customers.yes, ...P2.customers.plan, ...P2.people.solo, ...P2.people.team].map((q) => q.id);

  /* What they care about most (Part 1, page 11): two of these. */
  const VALUES = [['family', 'Family'], ['faith', 'Faith'], ['freedom', 'Freedom'], ['health', 'Health'], ['integrity', 'Integrity'], ['growth', 'Growth'], ['service', 'Service'], ['legacy', 'Legacy']];

  /* A word between questions, shown on six of the eleven pages once answered.
   * The lines marked `by` are Alexandru's own principles. */
  const SPARKS = {
    1: { t: 'Honest beats impressive. Nobody is grading this, not even us.' },
    3: { t: 'Business is life, and life is business.', by: 'Alexandru' },
    5: { t: 'Halfway. Coffee is optional; honesty is not.' },
    7: { t: 'There is a time to push, and a time to help.', by: 'Alexandru' },
    8: { t: 'Stick to what you do best, and serve people.', by: 'Alexandru' },
    10: { t: 'Unbalance for the balance.', by: 'Alexandru', sub: 'Sometimes you tip the scale on purpose, to find your balance.' },
  };

  const api = { Q, P2, VALUES, SPARKS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Compass = api;
})(this);
