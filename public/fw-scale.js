// SCALING — the worksheets. One per domain per level, forty-eight in all.
//
// At this stage the constraint is no longer the work. It is judgement, trust
// and where the founder's attention goes. So the arithmetic changes again:
// not what the business costs to run, but what a decision costs while it
// waits, what a departure would take with it, how much of the business is
// still arriving through one relationship, and whether anything would run on
// a Monday when the founder does not appear.
//
// Rule nine still governs, and at this stage it matters most: a founder with
// a team can generate any figure on request. A number earns its place only
// when it forces a decision a human has to own.
//
// `after` is the clarity point the worksheet appears under, 1 to 7.

export const FW_SCALE = {

  // ── Level 1 · The decisions only you should still make ─────────────────────
  1: {
    self: {
      k: 's1-self', n: 'The short list, and everything off it', after: 3, shape: 'table',
      lead: 'Decisions you personally made last week. Beside each, whether it genuinely required you — and if not, who it should have belonged to.',
      cols: [{ k: 'dec', n: 'Decision', t: 'text' }, { k: 'mine', n: 'Genuinely yours? y/n', t: 'text' }, { k: 'whose', n: 'Whose it should be', t: 'text' }],
      rows: 8,
      out: { op: 'filled', of: ['whose:0', 'whose:1', 'whose:2', 'whose:3', 'whose:4', 'whose:5', 'whose:6', 'whose:7'], label: 'Decisions with another name beside them',
        note: 'A decision you make that someone else should own costs twice: your attention, and their development. The second cost is the one that compounds.' },
      teach: { n: 'Three kinds of decision', t: 'Some decisions are irreversible and large — those stay yours for now. Some are reversible and small — those should never reach you. The middle group is where founders get stuck, because each one feels important in isolation. Sorting by reversibility rather than importance is what empties the middle.' },
      decides: 'Two decisions that move to a named person this month.',
    },
    people: {
      k: 's1-people', n: 'Authority stated, not implied', after: 5, shape: 'table',
      lead: 'For each person reporting to you: what they may decide alone, what they decide and tell you, and what they bring to you first.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'alone', n: 'Decides alone', t: 'text' }, { k: 'tells', n: 'Decides and tells you', t: 'text' }, { k: 'asks', n: 'Brings to you first', t: 'text' }],
      rows: 5,
      out: { op: 'filled', of: ['alone:0', 'alone:1', 'alone:2', 'alone:3', 'alone:4'], label: 'People who know what they may decide alone',
        note: 'Unstated authority defaults downward to caution. People do not guess generously about what they are allowed to do — they guess safely, and ask.' },
      decides: 'Who you tell this week, and in what words.',
    },
    work: {
      k: 's1-work', n: 'Where decisions queue', after: 4, shape: 'calc',
      lead: 'Decisions currently waiting on you, and how long the average one has waited.',
      fields: [{ k: 'n', n: 'Decisions waiting on you', t: 'num' }, { k: 'days', n: 'Average days waited', t: 'num' }],
      out: { op: 'mul', a: 'n', b: 'days', label: 'Decision-days currently queued', unit: ' days',
        read: [[10, 'A short queue. Keep it measured — it lengthens quietly and nobody raises it.'],
               [60, 'Weeks of work standing still, waiting for judgement that takes minutes to give.'],
               [1e9, 'The queue is now the business’s main constraint. Faster decisions would do more this quarter than any hire.']] },
      teach: { n: 'A decision has a holding cost', t: 'While a decision waits, the work behind it waits too — and that waiting is invisible from the desk of the person deciding. A fast adequate decision usually beats a slow excellent one, because the difference in quality is small and the difference in elapsed time is not. This is the clearest arithmetic at this stage and the least often done.' },
      decides: 'Which category of decision you stop making, so the queue stops forming.',
    },
    market: {
      k: 's1-market', n: 'Speed the customer feels', after: 3, shape: 'calc',
      lead: 'The last five customer requests that needed a decision. Hours before the customer had an answer, on average, against what you would consider acceptable.',
      fields: [{ k: 'real', n: 'Average hours to an answer', t: 'num' }, { k: 'ok', n: 'Hours you would consider acceptable', t: 'num' }],
      out: { op: 'sub', a: 'real', b: 'ok', label: 'Hours beyond your own standard', unit: 'h',
        read: [[2, 'Within your own standard. Unusual at this size, and worth protecting as you grow.'],
               [24, 'A day beyond what you would accept. Customers rarely say so; they simply notice who answers faster.'],
               [1e9, 'Speed has become part of what you sell, and you are currently selling it badly. This is a structural answer, not an effort one.']] },
      decides: 'Who can answer this class of request without you, starting Monday.',
    },
  },

  // ── Level 2 · The bench you are building ───────────────────────────────────
  2: {
    self: {
      k: 's2-self', n: 'What you are training people into', after: 2, shape: 'table',
      lead: 'Four habits of yours that your team has copied. Whether you intended each one.',
      cols: [{ k: 'habit', n: 'Habit they copied', t: 'text' }, { k: 'meant', n: 'Intended? y/n', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['habit:0', 'habit:1', 'habit:2', 'habit:3'], label: 'Habits you can see reflected',
        note: 'People learn what you do under pressure, not what you say in calm meetings. Late replies, skipped reviews and reopened decisions all transmit faster than any value on a wall.' },
      decides: 'One unintended habit you change in yourself, visibly.',
    },
    people: {
      k: 's2-people', n: 'Who could do more', after: 3, shape: 'table',
      lead: 'Everyone who could hold more than they currently do. What they would need, and whether anyone has told them you see it.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'more', n: 'What they could hold', t: 'text' }, { k: 'need', n: 'What they would need', t: 'text' }, { k: 'told', n: 'Told? y/n', t: 'text' }],
      rows: 5,
      out: { op: 'filled', of: ['told:0', 'told:1', 'told:2', 'told:3', 'told:4'], label: 'People you have an answer about',
        note: 'Read the last column. Someone you have privately earmarked and never told is someone who may be quietly deciding they have gone as far as they can here.' },
      decides: 'Who you tell this week, and what you offer them.',
    },
    work: {
      k: 's2-work', n: 'Written before it is needed', after: 6, shape: 'grid',
      lead: 'A role you will need within a year. Four boxes: the outcomes it owns, what it decides, who it works with, and what good looks like after six months.',
      boxes: [{ k: 'owns', n: 'Outcomes it owns' }, { k: 'dec', n: 'What it decides' }, { k: 'with', n: 'Who it works with' }, { k: 'good', n: 'Good, after six months' }],
      out: { op: 'filled', of: ['owns', 'dec', 'with', 'good'], label: 'Boxes answered',
        note: 'A role written a year early can be grown into. A role written the week it becomes urgent gets filled by whoever is available.' },
      decides: 'Whether somebody already here grows into it, or it is hired.',
    },
    market: {
      k: 's2-market', n: 'Whose relationship is it', after: 3, shape: 'calc',
      lead: 'Of your revenue, how much comes from customers whose main relationship is with you personally rather than with the business.',
      fields: [{ k: 'mine', n: 'Revenue tied to you personally', t: 'num' }, { k: 'all', n: 'Total revenue', t: 'num' }],
      out: { op: 'pct', a: 'mine', b: 'all', label: 'Revenue that depends on you by name', unit: '%',
        read: [[20, 'Mostly the business’s relationships rather than yours. That is the state worth defending.'],
               [50, 'A substantial share still arrives through you. Transferable, but only deliberately and only over quarters.'],
               [1e9, 'Most of the business is a relationship with one person. That caps what it can become and what it could ever be worth to anyone else.']] },
      teach: { n: 'The difference between a practice and a business', t: 'When customers buy the founder, the enterprise cannot be sold, cannot be left and cannot grow past one diary. Moving a relationship takes introductions made on purpose, a second person present before there is a problem, and the founder deliberately not being the one who answers. It is slow, and it is the single thing that changes what the business is.' },
      decides: 'Which three relationships move to someone else, and by when.',
    },
  },

  // ── Level 3 · The system that survives you ─────────────────────────────────
  3: {
    self: {
      k: 's3-self', n: 'The saves nobody asked for', after: 2, shape: 'table',
      lead: 'Four times last month you stepped in to rescue something. What would have happened if you had not.',
      cols: [{ k: 'save', n: 'What you rescued', t: 'text' }, { k: 'if', n: 'If you had not', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['if:0', 'if:1', 'if:2', 'if:3'], label: 'Rescues examined',
        note: 'Some of these were necessary. The rest taught someone that you will catch it, which guarantees you will have to again.' },
      decides: 'One rescue you will not make next time, and who you warn in advance.',
    },
    people: {
      k: 's3-people', n: 'Who owns the system', after: 5, shape: 'table',
      lead: 'Every system the business runs on. Its owner, and when that owner last changed anything in it.',
      cols: [{ k: 'sys', n: 'System', t: 'text' }, { k: 'owner', n: 'Owner', t: 'text' }, { k: 'last', n: 'Last improved', t: 'text' }],
      rows: 6,
      out: { op: 'filled', of: ['owner:0', 'owner:1', 'owner:2', 'owner:3', 'owner:4', 'owner:5'], label: 'Systems with a named owner',
        note: 'A process without an owner decays at the speed the business changes. The third column tells you which ones already have.' },
      decides: 'Which ownerless system gets an owner, by name, this week.',
    },
    work: {
      k: 's3-work', n: 'Tested without you', after: 7, shape: 'fill',
      lead: 'The real test of a system is absence, not documentation. Design the test.',
      line: 'Between {dates}, {who} runs {system} without me. I will not be asked unless {exception}. Afterwards we review {review}.',
      blanks: [{ k: 'dates', n: 'the dates' }, { k: 'who', n: 'who runs it' }, { k: 'system', n: 'the system' }, { k: 'exception', n: 'the one genuine exception' }, { k: 'review', n: 'what you review together' }],
      out: { op: 'line', label: 'The absence test', note: 'If you could not name a single genuine exception, the system is more ready than you think. If you named four, it is not a test yet.' },
      decides: 'Put the dates in the calendar, and tell them today.',
    },
    market: {
      k: 's3-market', n: 'What customers never see fail', after: 2, shape: 'table',
      lead: 'Four things that must never fail from the customer’s side. What protects each, and what happens when that protection is absent.',
      cols: [{ k: 'thing', n: 'Must not fail', t: 'text' }, { k: 'prot', n: 'What protects it', t: 'text' }, { k: 'if', n: 'If the protection is away', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['prot:0', 'prot:1', 'prot:2', 'prot:3'], label: 'Promises with a protection',
        note: 'If any protection in the middle column is a person’s name rather than a system, that promise is only as reliable as one person’s week.' },
      decides: 'Which name in the middle column becomes a system this quarter.',
    },
  },

  // ── Level 4 · Where the next demand is ─────────────────────────────────────
  4: {
    self: {
      k: 's4-self', n: 'Attention is a strategic act', after: 3, shape: 'table',
      lead: 'Where your attention actually went last month. Five areas, with roughly what share of your thinking each took.',
      cols: [{ k: 'area', n: 'Area', t: 'text' }, { k: 'pct', n: 'Share of attention %', t: 'num' }],
      rows: 5,
      out: { op: 'sumcol', col: 'pct', label: 'Accounted for', unit: '%',
        read: [[70, 'A third of your attention is unaccounted for, which usually means it went to whatever arrived.'],
               [105, 'Roughly accounted for. Now read the areas: is the future anywhere on this list, or only the present?'],
               [1e9, 'Over a hundred, which is itself the finding. Attention does not scale with conviction.']] },
      decides: 'Which area gets attention next month that got none last month.',
    },
    people: {
      k: 's4-people', n: 'Who hears the market first', after: 2, shape: 'table',
      lead: 'The people at the edges — support, delivery, sales. What each has heard more than once lately, and whether it ever reached you.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'heard', n: 'What they keep hearing', t: 'text' }, { k: 'reached', n: 'Reached you before? y/n', t: 'text' }],
      rows: 5,
      out: { op: 'filled', of: ['heard:0', 'heard:1', 'heard:2', 'heard:3', 'heard:4'], label: 'Signals collected from the edges',
        note: 'The market speaks first to whoever answers the phone. If the last column is mostly no, the problem is a route, not a perception.' },
      decides: 'What route carries this to you every month without a worksheet.',
    },
    work: {
      k: 's4-work', n: 'Capability already in the building', after: 3, shape: 'table',
      lead: 'Four things you could deliver tomorrow with what already exists here, and have not. What stopped each.',
      cols: [{ k: 'could', n: 'What you could deliver', t: 'text' }, { k: 'stop', n: 'What stopped it', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['stop:0', 'stop:1', 'stop:2', 'stop:3'], label: 'Unused capability, with its reason',
        note: 'Read the second column. If the reasons are mostly attention rather than capability, this page is worth more than a strategy day.' },
      decides: 'One capability you take to market this quarter.',
    },
    market: {
      k: 's4-market', n: 'Evidence, not instinct', after: 2, shape: 'table',
      lead: 'Four pieces of evidence that demand is moving. Where each came from, and how strong it is.',
      cols: [{ k: 'ev', n: 'Evidence', t: 'text' }, { k: 'src', n: 'Source', t: 'text' }, { k: 'str', n: 'How strong', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['src:0', 'src:1', 'src:2', 'src:3'], label: 'Signals with a source',
        note: 'A signal without a source is instinct, and instinct at this stage is expensive because other people now act on it.' },
      teach: { n: 'Why a source matters more than a conclusion', t: 'At this size your conclusions become other people’s instructions. A conclusion carries no way for anyone to check it, so it cannot be corrected and cannot be improved — it can only be obeyed or quietly ignored. Stating the source lets someone bring you better evidence, which is the only way a leader at this stage stays accurate.' },
      decides: 'Which signal you test, and what would prove you wrong.',
    },
  },

  // ── Level 5 · The conversation your team cannot have ───────────────────────
  5: {
    self: {
      k: 's5-self', n: 'The thing nobody names', after: 1, shape: 'fill',
      lead: 'Everybody knows. Nobody says it. Write it once, plainly, where only you can see it.',
      line: 'The thing we are all avoiding is {thing}. I have not said it because {why}. Saying it would mean {means}.',
      blanks: [{ k: 'thing', n: 'the thing' }, { k: 'why', n: 'why you have not' }, { k: 'means', n: 'what it would mean' }],
      out: { op: 'line', label: 'Named, at least here', note: 'Only you can open this. People below you cannot name it safely, which is precisely why it has lasted.' },
      decides: 'Whether you open it, and in which room.',
    },
    people: {
      k: 's5-people', n: 'Opening it safely', after: 5, shape: 'grid',
      lead: 'Four boxes before you raise it: what you will say first, what you will not do with what you hear, who speaks before you, and what happens afterwards.',
      boxes: [{ k: 'first', n: 'What you say first' }, { k: 'wont', n: 'What you will not do with it' }, { k: 'before', n: 'Who speaks before you' }, { k: 'after', n: 'What happens afterwards' }],
      out: { op: 'filled', of: ['first', 'wont', 'before', 'after'], label: 'Boxes answered',
        note: 'The second box is what makes honesty possible. Without it people tell you what is safe, and you conclude the problem was smaller than it is.' },
      decides: 'The date, and who you tell beforehand.',
    },
    work: {
      k: 's5-work', n: 'What the silence costs the work', after: 4, shape: 'calc',
      lead: 'The unspoken thing has an operational shadow. How many people work around it, and hours a month each loses to the workaround.',
      fields: [{ k: 'n', n: 'People working around it', t: 'num' }, { k: 'hrs', n: 'Hours a month each', t: 'num' }],
      out: { op: 'mul', a: 'n', b: 'hrs', label: 'Hours a month spent working around it', unit: 'h',
        read: [[10, 'Small, and possibly cheaper than the conversation. Decide that deliberately rather than by default.'],
               [60, 'A significant monthly cost, paid by people who cannot raise it and are managing around you.'],
               [1e9, 'The workaround has become a second, unofficial operating model. Those are expensive, and they outlive the problem that created them.']] },
      decides: 'Whether the conversation is now cheaper than the workaround.',
    },
    market: {
      k: 's5-market', n: 'Whether the customer can tell', after: 3, shape: 'table',
      lead: 'Three ways internal strain could be visible from outside. What a customer would notice, and whether any has.',
      cols: [{ k: 'way', n: 'How it could show', t: 'text' }, { k: 'notice', n: 'What they would notice', t: 'text' }, { k: 'has', n: 'Has anyone? y/n', t: 'text' }],
      rows: 3,
      out: { op: 'filled', of: ['notice:0', 'notice:1', 'notice:2'], label: 'Ways it could reach outside',
        note: 'Internal strain reaches customers through tone, pace and inconsistency long before it reaches them through failure.' },
      decides: 'Which outward symptom you protect while you fix the inward cause.',
    },
  },

  // ── Level 6 · The number that tells the truth ──────────────────────────────
  6: {
    self: {
      k: 's6-self', n: 'The number you avoid', after: 1, shape: 'fill',
      lead: 'There is one you do not look at often. Name it and say why.',
      line: 'I avoid looking at {number} because {why}. The last time I checked it was {when}, and it was {value}.',
      blanks: [{ k: 'number', n: 'the number' }, { k: 'why', n: 'why you avoid it' }, { k: 'when', n: 'when you last checked' }, { k: 'value', n: 'what it was' }],
      out: { op: 'line', label: 'The avoided number', note: 'If you could not fill the last two blanks, that is the answer. Go and look now, then come back.' },
      decides: 'Who else sees it from now on, so avoiding it stops being available.',
    },
    people: {
      k: 's6-people', n: 'Every person with one real figure', after: 5, shape: 'table',
      lead: 'One number each person owns — one they can actually move, not one they are merely measured by.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'num', n: 'Their number', t: 'text' }, { k: 'move', n: 'Can they actually move it? y/n', t: 'text' }],
      rows: 5,
      out: { op: 'filled', of: ['num:0', 'num:1', 'num:2', 'num:3', 'num:4'], label: 'People with a number',
        note: 'Read the last column. Holding someone to a figure they cannot influence is not accountability; it is a way of making them anxious on a schedule.' },
      decides: 'Which number changes hands, because the wrong person is holding it.',
    },
    work: {
      k: 's6-work', n: 'One figure, weekly', after: 6, shape: 'fill',
      lead: 'Not a dashboard. One figure, checked on a named day, with a stated consequence.',
      line: 'Every {day}, {who} reports {number}. It is {today} now. If it goes below {floor}, {then}.',
      blanks: [{ k: 'day', n: 'the day' }, { k: 'who', n: 'who reports it' }, { k: 'number', n: 'the figure' }, { k: 'today', n: 'where it is now' }, { k: 'floor', n: 'the line' }, { k: 'then', n: 'what happens' }],
      out: { op: 'line', label: 'The weekly number' },
      teach: { n: 'Why one, and why it must be reportable by somebody else', t: 'A dashboard tells you everything and decides nothing, and software will assemble one this afternoon. One figure, named day, stated consequence, reported by a person who is not you — that changes behaviour, because it can be missed and missing it means something. Choose the figure closest to the work rather than the one easiest to collect.' },
      decides: 'Whether you would actually do what the last blank says.',
    },
    market: {
      k: 's6-market', n: 'The number the customer creates', after: 3, shape: 'calc',
      lead: 'An outside measure rather than an inside one. Customers at the start of the last twelve months, and how many are still with you.',
      fields: [{ k: 'kept', n: 'Still with you', t: 'num' }, { k: 'start', n: 'Customers twelve months ago', t: 'num' }],
      out: { op: 'pct', a: 'kept', b: 'start', label: 'Customers who stayed a year', unit: '%',
        read: [[60, 'Four in ten left. Growth here means refilling a bucket, and the refilling costs more every year.'],
               [85, 'A solid base. The departures are worth understanding individually rather than as a rate.'],
               [1e9, 'Almost everyone stayed. Find out why before you change anything about delivery.']] },
      teach: { n: 'Inside numbers and outside numbers', t: 'Revenue, utilisation and pipeline are produced by you and can be made to look better without anything improving. Retention is produced by customers and cannot. At this stage, when there are enough internal figures to tell any story, it is worth keeping at least one measure you do not control.' },
      decides: 'Which departing customer you call, and what you ask.',
    },
  },

  // ── Level 7 · The bet you are making ───────────────────────────────────────
  7: {
    self: {
      k: 's7-self', n: 'What you are assuming', after: 2, shape: 'table',
      lead: 'Every plan rests on something unproven. Four assumptions underneath yours, and what would show each to be wrong.',
      cols: [{ k: 'ass', n: 'Assumption', t: 'text' }, { k: 'wrong', n: 'What would show it is wrong', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['wrong:0', 'wrong:1', 'wrong:2', 'wrong:3'], label: 'Assumptions that could be disproved',
        note: 'An assumption with no disproof is a belief. Beliefs are fine in a founder and expensive in a plan.' },
      decides: 'Which assumption you test first, because it is cheapest to be wrong about now.',
    },
    people: {
      k: 's7-people', n: 'Your bet is their job', after: 4, shape: 'table',
      lead: 'Who carries risk if this bet fails. What they stand to lose, and whether they know the bet is being made.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'risk', n: 'What they stand to lose', t: 'text' }, { k: 'knows', n: 'Knows? y/n', t: 'text' }],
      rows: 5,
      out: { op: 'filled', of: ['knows:0', 'knows:1', 'knows:2', 'knows:3', 'knows:4'], label: 'People whose exposure you have considered',
        note: 'A founder’s bet is distributed whether or not it is announced. Telling people is not a courtesy; it is the condition under which they can make their own decisions.' },
      decides: 'Who you tell, what you tell them, and when.',
    },
    work: {
      k: 's7-work', n: 'What the bet asks of operations', after: 3, shape: 'table',
      lead: 'A new direction lands on existing capacity. Four things that would have to change, and who absorbs each.',
      cols: [{ k: 'change', n: 'What must change', t: 'text' }, { k: 'who', n: 'Who absorbs it', t: 'text' }, { k: 'inst', n: 'Instead of what', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['inst:0', 'inst:1', 'inst:2', 'inst:3'], label: 'Changes with something named in exchange',
        note: 'The third column is the honest one. A new direction that displaces nothing is being added on top, and will be paid for in evenings.' },
      teach: { n: 'Capacity is conserved', t: 'A business has a fixed amount of attention at any moment, and a new direction does not create more of it. Whatever the plan requires is taken from something, and if nobody names what, it is taken from quality, from recovery or from the people least able to refuse. Naming the exchange in advance is not pessimism; it is the difference between a decision and an announcement.' },
      decides: 'What stops, so the bet has somewhere to live.',
    },
    market: {
      k: 's7-market', n: 'The bet, stated plainly', after: 5, shape: 'fill',
      lead: 'One sentence, with a date and a condition for being wrong. Written down so it cannot be quietly rewritten later.',
      line: 'We are betting that {bet}. We will know by {date}. We will have been wrong if {wrong}, and then we will {then}.',
      blanks: [{ k: 'bet', n: 'the bet' }, { k: 'date', n: 'the date' }, { k: 'wrong', n: 'what would mean you were wrong' }, { k: 'then', n: 'what you would do' }],
      out: { op: 'line', label: 'The bet, with its date', note: 'A bet with no date is a direction, and a direction cannot be lost — which is why it also cannot be learned from.' },
      decides: 'Who holds you to the date.',
    },
  },

  // ── Level 8 · Who is becoming a leader ─────────────────────────────────────
  8: {
    self: {
      k: 's8-self', n: 'What you model when it is hard', after: 2, shape: 'table',
      lead: 'Three difficult moments in the last quarter. What you did, and what somebody watching would have learned from it.',
      cols: [{ k: 'when', n: 'The moment', t: 'text' }, { k: 'did', n: 'What you did', t: 'text' }, { k: 'learn', n: 'What they learned', t: 'text' }],
      rows: 3,
      out: { op: 'filled', of: ['learn:0', 'learn:1', 'learn:2'], label: 'Lessons you taught without meaning to',
        note: 'People learn leadership from your worst week, not your best. That is not a criticism; it is simply when they are watching most closely.' },
      decides: 'What you would want them to learn, and what has to change for that.',
    },
    people: {
      k: 's8-people', n: 'Named, told, and given something real', after: 5, shape: 'table',
      lead: 'Who is becoming a leader here. What real thing they will own next, and when you tell them.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'own', n: 'What they will own', t: 'text' }, { k: 'when', n: 'When you tell them', t: 'text' }],
      rows: 3,
      out: { op: 'filled', of: ['when:0', 'when:1', 'when:2'], label: 'People with a date',
        note: 'Development that is never said aloud is indistinguishable from being overlooked. The date is the whole worksheet.' },
      decides: 'Nothing further. Put the three conversations in the calendar.',
    },
    work: {
      k: 's8-work', n: 'What leading here means', after: 6, shape: 'grid',
      lead: 'Four boxes so it can be learned rather than guessed: what a leader here decides, protects, is accountable for, and is never allowed to do.',
      boxes: [{ k: 'dec', n: 'Decides' }, { k: 'prot', n: 'Protects' }, { k: 'acc', n: 'Accountable for' }, { k: 'never', n: 'Never does' }],
      out: { op: 'filled', of: ['dec', 'prot', 'acc', 'never'], label: 'Boxes answered',
        note: 'The fourth box is the one that teaches fastest, because it is the only one with a clear edge.' },
      decides: 'Who reads this and tells you what they would have guessed wrong.',
    },
    market: {
      k: 's8-market', n: 'Who represents the business', after: 3, shape: 'table',
      lead: 'Every outward-facing situation — pitches, events, difficult calls. Who does it now, and who else could within six months.',
      cols: [{ k: 'sit', n: 'Situation', t: 'text' }, { k: 'now', n: 'Who does it now', t: 'text' }, { k: 'next', n: 'Who else could', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['next:0', 'next:1', 'next:2', 'next:3'], label: 'Situations with a second name',
        note: 'Count how many rows say your name twice. Those are the places where the business is still one person in public.' },
      decides: 'Which outward situation somebody else takes next, with you in the room.',
    },
  },

  // ── Level 9 · What you will stop doing ─────────────────────────────────────
  9: {
    self: {
      k: 's9-self', n: 'What you protect for your own reasons', after: 1, shape: 'fill',
      lead: 'There is work you keep that the business does not need you to keep. Say why you keep it.',
      line: 'I keep doing {what} because {reason}. The business would be fine if {who} did it. What I would lose is {lose}.',
      blanks: [{ k: 'what', n: 'the work' }, { k: 'reason', n: 'your reason' }, { k: 'who', n: 'who could do it' }, { k: 'lose', n: 'what you would lose' }],
      out: { op: 'line', label: 'Why it is still yours', note: 'Sometimes the last blank is a good enough answer, and keeping the work is right. Decide it rather than drift into it.' },
      decides: 'Keep it on purpose, or let it go — and say which out loud.',
    },
    people: {
      k: 's9-people', n: 'What they should stop', after: 3, shape: 'table',
      lead: 'Everybody has one. For each person, the thing they do that no longer earns its place, and what they do instead.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'stop', n: 'What they stop', t: 'text' }, { k: 'inst', n: 'What instead', t: 'text' }],
      rows: 5,
      out: { op: 'filled', of: ['inst:0', 'inst:1', 'inst:2', 'inst:3', 'inst:4'], label: 'Stops with a replacement',
        note: 'A stop without a replacement is received as a demotion, however it is phrased. The third column is what makes it an opportunity.' },
      decides: 'Which conversation you have first.',
    },
    work: {
      k: 's9-work', n: 'Stopped, not deprioritised', after: 6, shape: 'table',
      lead: 'Four things the business stops. The date each actually ends, who is told, and what is freed.',
      cols: [{ k: 'what', n: 'What stops', t: 'text' }, { k: 'date', n: 'Ends on', t: 'text' }, { k: 'told', n: 'Who is told', t: 'text' }, { k: 'free', n: 'What it frees', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['date:0', 'date:1', 'date:2', 'date:3'], label: 'Stops with a real date',
        note: 'Deprioritised work does not stop. It continues at reduced quality, still consuming attention, and nobody can be held to it.' },
      teach: { n: 'Why stopping is harder than starting', t: 'Starting is visible, flattering and easy to approve. Stopping requires admitting something was worth doing once and is not now, and it usually touches someone who has been doing it well. That is why portfolios of initiatives grow and almost never shrink — and why one real stop with a date does more for capacity than three new priorities.' },
      decides: 'Which stop you announce this week, with its date.',
    },
    market: {
      k: 's9-market', n: 'The customers you stop serving', after: 4, shape: 'calc',
      lead: 'The segment you would stop. What it brings in a year, and the hours a year it consumes across everyone.',
      fields: [{ k: 'rev', n: 'Annual revenue from them', t: 'num' }, { k: 'hrs', n: 'Hours a year across everyone', t: 'num' }],
      out: { op: 'div', a: 'rev', b: 'hrs', label: 'What this segment pays an hour', unit: ' an hour',
        read: [[35, 'Well below what the rest of the business earns. Those hours are being bought from your better customers.'],
               [90, 'Reasonable. If you still want to stop, the reason is strategic, not financial — say so plainly when you announce it.'],
               [1e9, 'This segment pays well. Stopping it would need a strong strategic reason, written down before anyone acts on it.']] },
      decides: 'Stop, reprice, or reshape — with a date and who tells them.',
    },
  },

  // ── Level 10 · The edge that is actually yours ─────────────────────────────
  10: {
    self: {
      k: 's10-self', n: 'Yours, not the business’s', after: 2, shape: 'table',
      lead: 'Three things you are genuinely good at — yours personally. Evidence for each from outside your own judgement.',
      cols: [{ k: 'good', n: 'What you are good at', t: 'text' }, { k: 'ev', n: 'Evidence from outside', t: 'text' }],
      rows: 3,
      out: { op: 'filled', of: ['ev:0', 'ev:1', 'ev:2'], label: 'Strengths with outside evidence',
        note: 'A strength only you can see is a preference. At this stage the distinction matters, because the business is being arranged around your answer.' },
      decides: 'Which one the next year is arranged around.',
    },
    people: {
      k: 's10-people', n: 'Capability that took years', after: 3, shape: 'table',
      lead: 'Four things this team is uniquely good at. How long each took to build, and what would happen if the person holding it left.',
      cols: [{ k: 'cap', n: 'Capability', t: 'text' }, { k: 'yrs', n: 'Years to build', t: 'num' }, { k: 'if', n: 'If they left', t: 'text' }],
      rows: 4,
      out: { op: 'sumcol', col: 'yrs', label: 'Years of capability in the building', unit: ' years',
        read: [[4, 'Young capability. Fast to rebuild, and therefore fast for others to copy.'],
               [15, 'Years of accumulated judgement, most of it undocumented and unlikely to be noticed until it is missing.'],
               [1e9, 'A great deal of irreplaceable capability. Read the third column: that is your risk register, and it has names in it.']] },
      teach: { n: 'Capability is not the same as headcount', t: 'Skills can be hired. Judgement built on hundreds of specific cases cannot, and it leaves in a single afternoon with no handover. Counting the years makes visible what no org chart shows — and it is the clearest argument for writing things down while the person who knows them is still here.' },
      decides: 'Which capability gets a second holder this quarter.',
    },
    work: {
      k: 's10-work', n: 'What cannot be copied quickly', after: 3, shape: 'table',
      lead: 'Four things in how you operate that a competitor could not replicate in six months. Why not, honestly.',
      cols: [{ k: 'what', n: 'What you do', t: 'text' }, { k: 'why', n: 'Why it is hard to copy', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['why:0', 'why:1', 'why:2', 'why:3'], label: 'Advantages with a reason',
        note: 'If a reason is "we work harder" or "we care more", it is not an advantage — it is an intention, and anyone can have one.' },
      decides: 'Which advantage you deliberately deepen, rather than assume.',
    },
    market: {
      k: 's10-market', n: 'Stated, evidenced, visible', after: 5, shape: 'fill',
      lead: 'The edge in one sentence, with the evidence attached and a place it is actually visible to customers.',
      line: 'Our edge is {edge}. The evidence is {evidence}. A customer meets it at {where}.',
      blanks: [{ k: 'edge', n: 'the edge' }, { k: 'evidence', n: 'the evidence' }, { k: 'where', n: 'where a customer meets it' }],
      out: { op: 'line', label: 'The edge, stated', note: 'If the third blank was hard, you have an advantage customers cannot find. That is a marketing problem with an operational answer.' },
      decides: 'Where it becomes visible this quarter.',
    },
  },

  // ── Level 11 · What success should make possible ───────────────────────────
  11: {
    self: {
      k: 's11-self', n: 'The question the business cannot answer', after: 1, shape: 'fill',
      lead: 'Imagine the business reaches the number. Picture the Tuesday afterwards, not the celebration.',
      line: 'If this works, I want more room for {room} and to be present for {who}. I would finally give attention to {attention}.',
      blanks: [{ k: 'room', n: 'what you want room for' }, { k: 'who', n: 'who you want to be present for' }, { k: 'attention', n: 'what you would attend to' }],
      out: { op: 'line', label: 'What success is for', note: 'This answer belongs in the plan you are making now, not in the one you make afterwards. Afterwards is when the habits are already set.' },
      decides: 'One thing from this answer that starts before the number arrives.',
    },
    people: {
      k: 's11-people', n: 'Who else is paying for it', after: 4, shape: 'table',
      lead: 'The cost of this plan rarely stops at you. Who else carries it, what it costs them, and whether it was ever discussed.',
      cols: [{ k: 'who', n: 'Who', t: 'text' }, { k: 'cost', n: 'What it costs them', t: 'text' }, { k: 'talked', n: 'Discussed? y/n', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['cost:0', 'cost:1', 'cost:2', 'cost:3'], label: 'Costs carried by other people',
        note: 'Ambition is rarely paid for alone. Where the last column says no, that is a conversation owed rather than a problem to manage.' },
      decides: 'Which conversation you have, and when.',
    },
    work: {
      k: 's11-work', n: 'Can the business hold it', after: 3, shape: 'table',
      lead: 'The life you described has operational consequences. Four of them, and what each requires of the business.',
      cols: [{ k: 'want', n: 'What you want', t: 'text' }, { k: 'needs', n: 'What the business must be able to do', t: 'text' }],
      rows: 4,
      out: { op: 'filled', of: ['needs:0', 'needs:1', 'needs:2', 'needs:3'], label: 'Wants with an operational requirement',
        note: 'A life change with no operational requirement is a wish. Every real one shows up as something the business must be able to do without you.' },
      decides: 'Which requirement the next quarter builds.',
    },
    market: {
      k: 's11-market', n: 'What the business is for now', after: 5, shape: 'fill',
      lead: 'The purpose, at this size. It is allowed to have changed since the beginning — most do.',
      line: 'At this size, this business exists so that {who} can {what}. That is different from when we started, because {change}.',
      blanks: [{ k: 'who', n: 'who' }, { k: 'what', n: 'what becomes possible' }, { k: 'change', n: 'what changed' }],
      out: { op: 'line', label: 'The purpose, restated' },
      decides: 'Who hears this version first.',
    },
  },

  // ── Level 12 · The business, held together ─────────────────────────────────
  12: {
    self: {
      k: 's12-self', n: 'Twelve levels, honestly reviewed', after: 2, shape: 'table',
      lead: 'Three things that changed in how you lead. The evidence for each — something somebody else would have noticed.',
      cols: [{ k: 'change', n: 'What changed', t: 'text' }, { k: 'ev', n: 'What somebody else noticed', t: 'text' }],
      rows: 3,
      out: { op: 'filled', of: ['ev:0', 'ev:1', 'ev:2'], label: 'Changes with outside evidence',
        note: 'The same standard every step in this programme has used: a change only you can see has not happened yet.' },
      decides: 'What carries forward, and what you deliberately stop.',
    },
    people: {
      k: 's12-people', n: 'The map of accountability', after: 6, shape: 'table',
      lead: 'Everything the business depends on, and who carries it. Then the honest column: what happens if that person is away for a month.',
      cols: [{ k: 'area', n: 'Area', t: 'text' }, { k: 'who', n: 'Carries it', t: 'text' }, { k: 'away', n: 'If they are away a month', t: 'text' }],
      rows: 7,
      out: { op: 'filled', of: ['away:0', 'away:1', 'away:2', 'away:3', 'away:4', 'away:5', 'away:6'], label: 'Areas with an honest answer',
        note: 'Count how many answers are serious. That figure, not revenue, is what tells you whether this is a business or a very good arrangement.' },
      decides: 'The single most exposed area, and what you do about it first.',
    },
    work: {
      k: 's12-work', n: 'What runs without you', after: 7, shape: 'calc',
      lead: 'Not assumed — tested. Of the areas on the map above, how many ran for two weeks without you being asked anything.',
      fields: [{ k: 'ran', n: 'Areas that ran without you', t: 'num' }, { k: 'all', n: 'Areas in total', t: 'num' }],
      out: { op: 'pct', a: 'ran', b: 'all', label: 'The business that runs without you', unit: '%',
        read: [[30, 'Most of it still needs you. That is where this stage began, and it is an honest place to start the next twelve weeks.'],
               [70, 'A majority runs without you. The remaining areas are now a short, specific list rather than a feeling.'],
               [1e9, 'Nearly all of it runs without you. The question has changed: it is no longer whether the business needs you, but what you now choose to do with that.']] },
      teach: { n: 'The only test that counts', t: 'Documentation, delegation and org charts all describe an intention. Absence measures it. Two weeks is long enough for the ordinary exceptions to arrive and short enough to be survivable — and the result is the only figure in this programme that cannot be improved by trying harder, only by having built something.' },
      decides: 'Which area you test next, and on which dates.',
    },
    market: {
      k: 's12-market', n: 'Somebody else reads it back', after: 7, shape: 'fill',
      lead: 'The business on one page. Then hand it to someone who joined this year and have them read it back to you.',
      line: 'We are {what}. We serve {who}. They choose us because {why}. We can hold that at {scale}. The person who read this back was {reader}.',
      blanks: [{ k: 'what', n: 'what the business is' }, { k: 'who', n: 'who it serves' }, { k: 'why', n: 'why they choose you' }, { k: 'scale', n: 'at what scale' }, { k: 'reader', n: 'who read it back' }],
      out: { op: 'line', label: 'The business, in one page', note: 'What they could not say back is the part that only exists in your head. That is the finding, and it is the last one this programme gives you.' },
      decides: 'What you rewrite, based on what they could not repeat.',
    },
  },
};
