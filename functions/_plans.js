// The Account Plans: what a founder opens with a free account.
//
// Copied word for word from "00 Leader’s North Star · The Account Plans"
// (Drive). Sixteen domain steps (four per domain) and the What-if steps
// (four per lever). Nothing here is written by the code; where the document
// does not give a part (the What-if steps have no "why", "ask" or band notes),
// the part is null and the page leaves it out.
//
// These live on the server and are only ever returned to a signed-in founder
// (GET /api/plans). The free North Star shows the titles, locked.
//
// The four steps for "Each sale takes fewer hours" (hours-1 to hours-4) are a
// DRAFT from PR 3, written in the same style, waiting for Alexandru's wording.
//
// `band` holds the three band notes: now = Needs you now, shape = Taking
// shape, strength = A strength. `variant` names who a note was written for
// where the document says so, e.g. "(solo)" or "(no customers yet)".

export const DOMAIN_ORDER = ['self', 'people', 'work', 'market'];
export const DOMAIN_NAME = { self: 'Lead yourself', people: 'Lead your people', work: 'Lead your business', market: 'Lead the market' };
export const BAND_KEY = ['now', 'shape', 'strength'];
export const BAND_NAME = { now: 'Needs you now', shape: 'Taking shape', strength: 'A strength' };

export const DOMAIN_INTRO = {
  self: 'The business serves a life, not the other way round. These four steps set what success must protect and turn it into how the week is run.',
  people: 'A business is carried by people: the ones at home, the ones who tell you the truth, and the ones who do the work. These steps work for a solo founder and for a team.',
  work: 'Numbers reveal what is happening; leadership decides what to do about it. These steps give the founder four numbers they understand and a habit of using them.',
  market: 'You may know your product better than you know your customer. These steps put the customer\'s own words at the centre of the offer, and turn growth into a choice.',
};

const step = (id, domain, title, why, what, about, done, ask, band, variant = null) =>
  ({ id, domain, title, why, what, about, done, ask, band, variant });

export const DOMAIN_STEPS = [
  step('self-1', 'self', 'Write what success must protect',
    'Without a clear purpose for your life, every opportunity looks urgent and you say yes to too much.',
    'Write three short lines: what this business must protect (for example health, evenings, a person), what it must give you, and what you will not trade for growth.',
    '30 minutes, alone and without your phone.',
    'Three lines you could read to someone close to you without changing a word.',
    'If I reached my goal and lost these three things, would it still be a win?',
    { now: 'Write them even if they feel obvious.', shape: 'Check them against last month\'s calendar.', strength: 'Share them with one person who works with you.' }),
  step('self-2', 'self', 'Set your limits: hours, money, risk',
    'Limits make decisions fast. Without them, every request becomes a negotiation with yourself.',
    'Set three numbers: the most hours a week you will work, the least you need to take home each month, and the most money you will put at risk this year.',
    '45 minutes, with last month\'s hours and bank statement open.',
    'Three numbers written down, and one person told about them.',
    'Which of these limits have I already broken this month?',
    { now: 'Start with hours; it is the limit that protects the rest.', shape: 'Write what you will do when a limit is crossed.', strength: 'Review the limits each quarter as the business grows.' }),
  step('self-3', 'self', 'Choose one thing to stop',
    'New habits need room. Room comes from stopping, not from trying harder.',
    'List everything you did last week. Mark one task, client, meeting or habit that does not serve your three lines, and stop it, hand it over or shrink it.',
    '20 minutes to choose; one week to stop.',
    'One thing gone from next week\'s calendar, and the hours it gave back written down.',
    'What am I keeping only because stopping would feel uncomfortable?',
    { now: 'Choose the easiest one first.', shape: 'Choose the one that costs you the most energy.', strength: 'Choose one that only you can let go of.' }),
  step('self-4', 'self', 'Review your week every Sunday',
    'Clarity fades by Wednesday. A short review brings it back before the week starts.',
    'Every Sunday, 15 minutes: did the week protect my three lines, did I stay inside my limits, what is the one thing that matters most next week?',
    '15 minutes a week, for four weeks.',
    'Four reviews written, and one pattern you noticed.',
    'What keeps pulling me away from what I said matters?',
    { now: 'Keep it to three questions.', shape: 'Add one line on energy.', strength: 'Turn it into the way your team plans its week.' }),

  step('people-1', 'people', 'Have the honest conversation at home',
    'The people closest to you pay for what is not said out loud: late nights, money worries, plans they never heard.',
    'Choose the person most affected. Tell them what the business needs from you in time and money for the next three months, and ask what they need from you.',
    'One conversation of 45 minutes, prepared in 15.',
    'An agreement you both said out loud, for example two evenings a week that stay free.',
    'What have I been avoiding saying, and what is it costing us?',
    { now: 'Start with time, not money.', shape: 'Agree how you will check in each month.', strength: 'Ask them what they see that you do not.' }),
  step('people-2', 'people', 'Find one honest critic',
    'Friends encourage. Founders also need one person who will say what might be wrong.',
    'Pick someone who understands business and has no reason to flatter you. Show them your plan and ask for the three biggest risks they see.',
    'One hour, then one follow-up a month.',
    'Three risks written down in their words, and one you decided to act on.',
    'Whose opinion do I avoid because I suspect they are right?',
    { now: 'One person is enough.', shape: 'Make it a monthly hour.', strength: 'Build a small circle of two or three.' }),
  step('people-3', 'people', 'Hand over one bounded decision',
    'As long as every decision comes back to you, the business cannot grow past your hours.',
    'Pick one small, repeated decision. Write its limits (budget, quality, when to ask you) and give it to someone: a team member, a freelancer or a supplier.',
    '30 minutes to write the limits; two weeks to test.',
    'The decision made twice without you, inside the limits.',
    'What would "good enough" look like if I were not the one doing it?',
    { now: 'Hand it to a supplier, a freelancer or a simple system.', shape: 'Hand it to the person most ready.', strength: 'Hand over a decision that matters.' },
    { now: 'solo' }),
  step('people-4', 'people', 'Run a short absence test',
    'The clearest test of a business is what happens when you are not there.',
    'Plan one day (or half a day) when you are unreachable. Before it, write what others should do if something comes up. After it, note what broke and what did not.',
    'One day away, plus 30 minutes to prepare and 30 to review.',
    'A short list: what held without you, and the one thing to fix next.',
    'What did I learn about the business from not being in it?',
    { now: 'Start with half a day and an automatic reply.', shape: 'One full day.', strength: 'One full week, with someone named in charge.' },
    { now: 'solo' }),

  step('work-1', 'work', 'Know what one sale leaves you',
    'It is the money every other bill is paid from. Most pricing, hiring and growth mistakes start with not knowing it.',
    'Take your last ten sales. For each, subtract what it cost to deliver (materials, fees, help). Average what is left.',
    '45 minutes with last month\'s sales and costs.',
    'One number: "each sale leaves me about ___."',
    'Which kind of sale leaves me the most, and am I chasing it?',
    { now: 'A rough average is enough.', shape: 'Split it by product or client type.', strength: 'Track it every month.' }),
  step('work-2', 'work', 'Set your price with your time in it',
    'A price that ignores your hours quietly borrows from your life.',
    'Add your hours to each sale at an hourly value you choose. If the sale no longer leaves enough, write a new price and the sentence you will use to explain it.',
    '1 hour.',
    'A price you can say out loud without apologising, tested on one customer.',
    'Am I pricing for the customer I have, or the one I fear losing?',
    { now: 'Raise one offer only.', shape: 'Review all prices once.', strength: 'Design an offer that does not need your hours.' }),
  step('work-3', 'work', 'Choose one weekly number',
    'A number checked only when worried is a worry, not a tool.',
    'Pick one number to check every Monday (cash in the bank, sales this week, or what sales leave you). Write one action for when it drops below a line you set.',
    '10 minutes a week.',
    'Four Mondays checked in a row, each with a one-line note.',
    'What will I do differently when this number moves?',
    { now: 'Cash in the bank is the simplest start.', shape: 'Sales this week.', strength: 'What sales leave you, by type.' }),
  step('work-4', 'work', 'Plan the two months you hope never come',
    'Profit on paper is not safety in the bank. A plan made calmly beats one made in panic.',
    'Write what you would do if sales dropped by a third for two months: what you would cut first, who you would call, how long your savings last.',
    '1 hour.',
    'One page you could follow on a bad day, and a savings target in months.',
    'How many months could I keep going if new sales stopped today?',
    { now: 'Start with how long savings last.', shape: 'Add what you cut first.', strength: 'Turn it into a yearly plan with two roads: grow, or grow better.' }),

  step('market-1', 'market', 'Book ten real conversations',
    'A nice comment is not a sale. Ten conversations about the problem teach more than any website or advert.',
    'Find ten people you want to help (or ten recent customers). Ask about their problem, not your product: what it costs them, what they tried, what they would pay to fix it.',
    '20 minutes each, over two weeks.',
    'Ten sets of notes, and the three phrases you heard most.',
    'What surprised me, and what did I hope to hear that nobody said?',
    { now: 'Start with people who have the problem, not friends.', shape: 'Talk to recent customers.', strength: 'Talk to the customers you lost.' },
    { now: 'no customers yet' }),
  step('market-2', 'market', 'Write your offer in their words',
    'If customers cannot repeat your offer, they cannot recommend it.',
    'Using the phrases from your conversations, write one sentence: who it is for, the problem it solves, and what they get. Test it on three people and ask them to say it back.',
    '1 hour to write, one week to test.',
    'One sentence three people repeated back correctly.',
    'Would my best customer describe it the way I just did?',
    { now: 'One sentence, one customer type.', shape: 'Put it on your page and in your messages.', strength: 'Write one for each customer type you serve.' }),
  step('market-3', 'market', 'Track where customers come from',
    'If you do not know why they arrive, you cannot repeat it on purpose.',
    'For every new enquiry over the next month, note where it came from (referral, social, search, event, other) and whether it became a sale.',
    '2 minutes per enquiry, for one month.',
    'A short list: your best source, and what one new customer costs you from it.',
    'Which channel brings the customers I actually want?',
    { now: 'Simply ask every new person: "How did you find me?"', shape: 'Add the cost of each channel.', strength: 'Double the best channel and drop the weakest.' }),
  step('market-4', 'market', 'Choose who to grow toward',
    'With a clear customer, growth becomes a choice, not a chase.',
    'List your five best customers and what they share. Write who you want more of, and one kind of work or customer you will politely stop taking.',
    '45 minutes.',
    'A one-line description of your ideal customer, and one "no" you have said.',
    'Which customers make the business better, and which make it harder?',
    { now: 'Describe the first customer you most want.', shape: 'Name your best five.', strength: 'Choose the next market to enter, on purpose.' }),
];

/** The three levers, in the What-if lab's order: price, message, handover.
 *  `max` is each slider's range, used to find the lever moved most. */
export const LEVERS = [
  { id: 'price', key: 'p', max: 200, name: 'Raise your price' },
  { id: 'message', key: 'm', max: 100, name: 'Make your message clearer' },
  { id: 'hours', key: 'f', max: 50, name: 'Each sale takes fewer hours' },
  { id: 'handover', key: 'd', max: 60, name: 'Someone else does part of the work' },
];

const wi = (id, lever, domain, title, what, about, done) =>
  ({ id, lever, domain, title, why: null, what, about, done, ask: null, band: null, variant: null });

export const WHATIF_STEPS = [
  wi('price-1', 'price', 'work', 'Find your fair price', 'Add your hours at a value you choose to what one sale costs you; set the price that leaves enough', '1 hour', 'One new price, written down'),
  wi('price-2', 'price', 'market', 'Test it on three customers', 'Offer the new price to three people, starting with your best customers', '2 weeks', 'Three answers, yes or no, and why'),
  wi('price-3', 'price', 'self', 'Explain the value in their words', 'Write two sentences on what the customer gets, using phrases they used', '30 minutes', 'A sentence you can say without apologising'),
  wi('price-4', 'price', 'work', 'Review who stayed and why', 'After a month, note who stayed, who left and what each said', '30 minutes', 'A decision: keep, adjust or roll out'),

  wi('message-1', 'message', 'market', 'Ask three customers why they chose you', 'Ask what they were looking for, and what made them say yes', '3 short calls', 'Their exact words, written down'),
  wi('message-2', 'message', 'market', 'Write the one-sentence offer', 'Who it is for, the problem, what they get, in their words', '1 hour', 'One sentence three people can repeat'),
  wi('message-3', 'message', 'market', 'Put it where they already look', 'Your page, profile, email signature and first reply to every enquiry', '1 hour', 'The sentence live in four places'),
  wi('message-4', 'message', 'work', 'Track who says yes', 'Note each enquiry and whether it became a sale, for one month', '2 minutes each', 'A before-and-after count'),

  // DRAFT (PR 3), waiting for Alexandru's wording: not yet in "The Account Plans".
  wi('hours-1', 'hours', 'self', 'Time one sale from start to finish', 'Pick your most common sale. For the next three, write down every task it takes and the minutes each one took', '3 sales', 'A list of tasks with real minutes beside each'),
  wi('hours-2', 'hours', 'work', 'Cut, template or batch the slowest task', 'Take the task that took longest. Drop it, turn it into a template or checklist, or do it for several customers at once', '1 hour', 'One task changed, and how, written down'),
  wi('hours-3', 'hours', 'market', 'Tell customers what changes for them', 'If the change touches them (a form instead of a call, set delivery days), tell them in two sentences and why it serves them', '30 minutes', 'Customers told, and what they said noted'),
  wi('hours-4', 'hours', 'self', 'Time it again and decide where the hours go', 'Time the next three sales the same way. Write the hours saved and choose what they go to: rest, better work or more customers', '30 minutes', 'Hours saved, written down, and where they go'),

  wi('handover-1', 'handover', 'self', 'Pick one task to hand over', 'List three tasks you think only you can do; choose the one that is not really true', '20 minutes', 'One task named'),
  wi('handover-2', 'handover', 'people', 'Write what "finished" looks like', 'Steps, the standard, and when to ask you', '45 minutes', 'One page someone else could follow'),
  wi('handover-3', 'handover', 'people', 'Run a two-week test', 'Hand it over to a team member, freelancer or tool, and stay out of it', '2 weeks', 'The task done twice without you'),
  wi('handover-4', 'handover', 'self', 'Review, then hand over the next', 'Note the hours you got back and what you would change; pick the next task', '30 minutes', 'Hours returned, written down, and task two chosen'),
];

export const ALL_STEP_IDS = [...DOMAIN_STEPS, ...WHATIF_STEPS].map((s) => s.id);

/** Pains and goals, by the North Star's own ids, and the domain each runs through
 *  ("The Intelligence", section 3). */
export const PAIN = {
  clients: ['Not enough clients', 'market'], cash: ['Cash is tight', 'work'], time: ['No time for myself', 'self'],
  alone: ['Doing everything myself', 'people'], team: ['Team not stepping up', 'people'], direction: ['Unclear direction', 'self'],
  price: ['Prices feel too low', 'work'], switch: ['I can’t switch off', 'self'],
};
export const GOAL = {
  freedom: ['More free time', 'self'], income: ['Higher income', 'work'], steady: ['Steady clients', 'market'],
  team: ['A team I trust', 'people'], clarity: ['Clarity on direction', 'self'], grow: ['A new market', 'market'],
};

const bandOf = (score) => (score <= 2 ? 'now' : score <= 4 ? 'shape' : 'strength');

/** The lever moved most, as a share of its range, or null if none moved. */
export function leverMoved(lab) {
  const share = LEVERS.map((l) => Math.max(0, Number(lab && lab[l.key]) || 0) / l.max);
  const max = Math.max(...share);
  return max > 0 ? LEVERS[share.indexOf(max)] : null;
}

/**
 * One founder's plans, in their order.
 *
 * `c` is what the North Star saved: scores[4] (0–6 per domain, in DOMAIN_ORDER),
 * answered[4] (0–2), pains (ids), want (goal id) and lab { p, m, d }.
 *
 * The lowest answered domain opens first. The other three follow in the fixed
 * order, and a tie for lowest goes to whichever comes first in it. A domain
 * that has not been answered has no band, so no band note. With nothing
 * answered, the fixed order stands.
 */
export function planFor(c = {}) {
  const scores = DOMAIN_ORDER.map((_, i) => Number(c.scores && c.scores[i]));
  const answered = DOMAIN_ORDER.map((_, i) => Number(c.answered && c.answered[i]) || 0);
  let lowest = -1;
  DOMAIN_ORDER.forEach((_, i) => {
    if (!answered[i] || !Number.isFinite(scores[i])) return;
    if (lowest < 0 || scores[i] < scores[lowest]) lowest = i;
  });
  const order = lowest < 0 ? DOMAIN_ORDER.slice() : [DOMAIN_ORDER[lowest], ...DOMAIN_ORDER.filter((_, i) => i !== lowest)];
  const pains = Array.isArray(c.pains) ? c.pains.filter((p) => PAIN[p]) : [];
  const goal = GOAL[c.want] || null;

  const domains = order.map((id) => {
    const i = DOMAIN_ORDER.indexOf(id);
    const band = answered[i] ? bandOf(scores[i]) : null;
    return {
      id, name: DOMAIN_NAME[id], intro: DOMAIN_INTRO[id], first: i === lowest,
      band, bandName: band ? BAND_NAME[band] : null,
      said: pains.filter((p) => PAIN[p][1] === id).map((p) => PAIN[p][0]),
      goal: goal && goal[1] === id ? `Your goal, ${goal[0].toLowerCase()}, runs through here.` : null,
      steps: DOMAIN_STEPS.filter((s) => s.domain === id).map((s) => ({
        ...s, note: band ? s.band[band] : null, noteFor: band && s.variant ? s.variant[band] || null : null,
      })),
    };
  });

  const lever = leverMoved(c.lab);
  const whatif = lever ? {
    id: lever.id, name: lever.name,
    steps: WHATIF_STEPS.filter((s) => s.lever === lever.id).map((s) => ({ ...s, domainName: DOMAIN_NAME[s.domain] })),
  } : null;

  return { domains, whatif };
}
