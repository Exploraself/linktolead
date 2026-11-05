// Good People Win (Alexandru, 5 Nov 2026): ten letters for everyone who leaves
// their name and email, on linktolead.exploraself.com or exploraself.com, with
// an account or without. Letter 1 at once, then one every 48 hours
// (functions/_gpw.js sends them). The name is his ("Good People Win?
// Absolutely, yes. I love it.").
//
// Each letter, in this order (the sales-page order, "00 Sales pages READ ME",
// told as a letter): a small cover; a thank-you; five short numbered
// sections (1 Where it hurts: their words and one question · 2 a story ·
// 3 Today's tool: one diagram · 4 Your 10 minutes: one step and "Done when" ·
// 5 The hard truth: the cost of waiting, then encouragement); one invitation
// (one button); "Reply and tell me"; a P.S. with something free.
//
// The stories are Alexandru's own, told to us on 5 Nov 2026 and written in
// plain English with his meaning kept (his kitchens and his father's words;
// Moldova and Rome; the shared room, bread and hot dogs; the university place
// he left for freedom; promises to ourselves; the IFBB win in 2019;
// restaurants and his first programmes; reputation; winning only for
// yourself). Where no story of his fits, the section is "From the book" and
// says which book. The tools are word for word from Built to Lead (99
// practical tools), The Founder's Growth Manual and A New Way of Winning: he
// asked for them here ("share some frameworks … when you give value"), the
// one place where a tool is named to someone who has not opened a level
// (AGENTS.md rule 4). Quotes from the books are word for word.
//
// **double stars** mark bold words. Never "free" next to a price.

export const GPW_NAME = 'Good People Win';
const LIB = 'https://linktolead.exploraself.com/library/';
const LTL = 'https://linktolead.exploraself.com';
const ES = 'https://exploraself.com';

export const GPW_LETTERS = [
  {
    n: 1, title: 'Why we exist', good: 2,
    hello: 'Thank you for leaving your name. For the next 18 days I’ll send you **ten short letters, one tool in each.**',
    hurt: 'You work hard. You care. And some weeks, the results are not there.\n**What is your business teaching you about yourself?**',
    story: { head: 'My story', paras: [
      'In my late teens I made kitchens and wardrobes to measure. I loved the craft. But I overspent, I didn’t manage the money, and orders ran late.',
      'My father closed the business. He told me: **“You are making these mistakes on my reputation. If you want to make mistakes, make them on your own.”** He was right. The business had learned my habits.',
      'That is why ExploraSelf exists: to help leaders, from the first client to big teams, lead themselves and their business. **We believe good people can win.**',
    ] },
    tool: { kind: 'grid', title: 'P.A.C.E. · the loop behind every tool we teach', rows: [
      ['P', 'Pause', 'Make space before the automatic answer.'],
      ['A', 'Assess', 'Separate the facts from the story.'],
      ['C', 'Choose', 'Name the decision that is yours.'],
      ['E', 'Execute', 'Take one step, then look at what happened.'],
    ], foot: 'Then back to 1, a little wiser.' },
    step: { do: 'Write down one decision you rushed this week. Under it, write one line for each of the four steps.', done: 'you know what you’ll do differently next time.' },
    truth: ['Your business learns your habits. **All of them.** The good news: habits can be learned again.'],
    invite: { button: 'Read what we believe →', url: `${ES}/welead` },
    reply: 'what made you start your business?',
    ask: ['What made me start', 'Where should I start this week?'],
    ps: { text: 'The first pages of A New Way of Winning are free to read. It is the book behind everything we teach. ', label: 'Read the first pages', url: `${LIB}a-new-way-of-winning-preview.pdf` },
  },
  {
    n: 2, title: 'Busy is not winning', good: 3,
    hello: 'Letter 2 of 10. Thank you for opening it. I know your inbox is full.',
    hurt: '“I spend so much time on this, and the results are not there.”\n**Of the things that felt urgent this week, how many really were?**',
    story: { head: 'My story', paras: [
      'Moldova and Rome taught me this about work: it teaches discipline, but **its point is not to make us work more. Its point is to change us, so we can create value.** Not all work creates value. Working more is not always the answer.',
    ] },
    tool: { kind: 'ladder', title: 'TEMPO · from our book Built to Lead', rows: [
      ['T', 'Trace', 'what set you off.'],
      ['E', 'Explain', 'the feeling.'],
      ['M', 'Map', 'what it really means.'],
      ['P', 'Pause', 'before you choose.'],
      ['O', 'Open', 'one option, with a date.'],
    ], foot: 'Urgency is a feeling. Timing is a decision.' },
    after: 'An example from the book: a new project sounds flattering, and you want to say yes before the silence gets awkward. Instead, you check next week, then answer with a real date.',
    step: { do: 'Find one message you answered “right now” that could have waited. Write the date it really needed.', done: 'the next request like it gets a date, not an instant yes.' },
    truth: ['**If the next twelve weeks look like the last twelve, what changes?** You don’t need more hours. You need one minute, used well.'],
    invite: { lead: 'Want to see what is really holding you back? The Rise assessment takes four minutes.', button: 'Take the Rise assessment →', url: `${ES}/rise` },
    reply: 'which request will you answer with a date this week?',
    ask: ['My answer with a date', 'I’m too busy to start. Help?'],
    ps: { text: 'The first pages of Built to Lead are free: 99 practical tools like TEMPO, each with a real founder moment. ', label: 'Read the first pages', url: `${LIB}built-to-lead-preview.pdf` },
  },
  {
    n: 3, title: 'The story you told yourself', good: 4,
    hello: 'Letter 3 of 10. Thank you for staying with me.',
    hurt: '“I know what the problem is.” We all say it. Sometimes we are right. Sometimes it is only a story.\n**What do you know for sure, and what did your mind add?**',
    story: { head: 'My story', paras: [
      'When I came to Italy from Moldova, I had a lot of pride. I was a good student. I was smart. I expected the world to see it.',
      'Instead, for months, I paid €130 a month for a bed in a shared room, and I lived on bread and hot dogs. I didn’t speak the language yet.',
      'The question was never “how smart am I?” It was **“what can I do with it?”** Life works on an exchange of value. My story about myself had to meet the facts.',
    ] },
    tool: { kind: 'ladder', title: 'SIFT · from our book Built to Lead', rows: [
      ['S', 'Stop', 'the automatic answer.'],
      ['I', 'Identify', 'what is known.'],
      ['F', 'Find', 'the interpretation.'],
      ['T', 'Test', 'it with evidence.'],
    ], foot: 'Separate what you saw from what you concluded.' },
    after: 'An example from the book: sales drop for one week, and your mind jumps to “the offer is wrong”. The drop is a fact. The rest is a guess. Compare more weeks and ask customers before you change anything.',
    step: { do: 'Write one conclusion you reached this week, about a client, a number or yourself. Split it into two columns: **what I saw** and **what I concluded**.', done: 'you know one thing to check before you act on it.' },
    truth: ['Some of the walls you push against are stories. **You can’t fix a story with more effort, only with facts.** And you are more capable than the story you tell yourself on a hard day.'],
    invite: { lead: 'The EQ Dividend shows which of your five emotional strengths pays you back, and which one leaks. About five minutes.', button: 'Take the EQ Dividend →', url: `${ES}/eq` },
    reply: 'what did your mind add this week?',
    ask: ['What my mind added', 'How do I tell a fact from a story?'],
    ps: { text: 'The first pages of The Founder’s Growth Manual are free: personal leadership as part of how the business runs. ', label: 'Read the first pages', url: `${LIB}founders-growth-manual-preview.pdf` },
  },
  {
    n: 4, title: 'The life it postpones', good: 0,
    hello: 'Letter 4 of 10. Thank you for reading. Today is about choices.',
    hurt: '“I’ll slow down when things calm down.” But things rarely calm down by themselves.\n**What is your business making possible, and what is it putting off?**',
    story: { head: 'My story', paras: [
      'In my twenties I had a free place at a well-known university, earned with good grades. The classic road was open.',
      'I wanted freedom more. I left Moldova for Italy, worked in restaurants and learned the language. Later I finished my degree, and a master’s, on my own terms.',
      'Was it the right choice? Who knows. But **whatever you choose, you can learn from it and take your next step.** Life teaches different lessons at different times. There is a time to push, a time to learn, a time to wait, and a time to grow, bear fruit and share.',
    ] },
    tool: { kind: 'ladder', title: 'NEST · from our book Built to Lead', rows: [
      ['N', 'Name', 'the need behind the goal.'],
      ['E', 'Estimate', 'the energy it will take.'],
      ['S', 'See', 'the season you are in.'],
      ['T', 'Trade', 'one thing, on purpose.'],
    ], foot: 'A goal needs a place in this season of life.' },
    after: 'The book asks: **is this the right goal for this season, or just a familiar one?**',
    step: { do: 'Pick one goal you have carried for a long time. Write one line for each of the four letters.', done: 'you have chosen one thing to trade to make room for it, or you have let the goal go.' },
    truth: ['In A New Way of Winning I wrote: **“Keeping it moving can occupy a life.”** Don’t let yours go only to keeping it moving. You are allowed to choose what this season is for.'],
    invite: { lead: 'The Leader’s North Star shows where you are going, and which side of your leadership needs you first. It’s free.', button: 'Find my North Star →', url: `${LTL}/northstar/` },
    reply: 'what is one thing your business is putting off for you?',
    ask: ['What my business puts off', 'Is this the right season for my goal?'],
    ps: { text: 'The first pages of Worth Building are free: 32 frameworks to lead yourself, your people, your business and your market. ', label: 'Read the first pages', url: `${LIB}worth-building-preview.pdf` },
  },
  {
    n: 5, title: 'Postpone needs a date', good: 1,
    hello: 'Letter 5 of 10. Halfway. Thank you for being here.',
    hurt: '“I’ll decide next week.” And next week, it waits again.\n**How many weeks has your biggest decision been waiting?**',
    story: { head: 'From the book', paras: [
      'In A New Way of Winning I sort every move into three: do now, prepare next, and postpone on purpose.',
      '**Postponing is allowed, but only with a reason and a date to look again.** Without them it becomes what the book calls “an elegant name for avoidance.”',
    ] },
    tool: { kind: 'ladder', title: 'Three lanes · from A New Way of Winning', rows: [
      ['1', 'Do now:', 'what protects a promise, or clears the real block.'],
      ['2', 'Prepare next:', 'what a later move will need.'],
      ['3', 'Postpone on purpose:', 'with a reason and a date to look again.'],
    ], foot: 'Every waiting decision belongs in one lane.' },
    step: { do: 'List the three decisions that have waited longest for you. Put each one in a lane. Give the postponed one a reason and a date.', done: 'nothing on your list is just “waiting” any more.' },
    truth: ['Waiting feels safe. **But a decision you don’t make is still made, by default.** You already know what to do with at least one of them. Start there.'],
    invite: { lead: 'The Founder Launchpad is free: three levels that turn decisions like these into steps you can check.', button: 'Open the Launchpad →', url: `${LTL}/ground-plan/#programme` },
    reply: 'which decision will you make this week?',
    ask: ['The decision I made', 'Where do I start the Launchpad?'],
    ps: { text: 'The first pages of The Leader’s Growth Planner 2027 are free: fifty-two seeds, one for every week of your year. ', label: 'See the planner', url: `${LIB}leaders-growth-planner-2027-preview.pdf` },
  },
  {
    n: 6, title: 'A value needs a behaviour', good: 2,
    hello: 'Letter 6 of 10. Thank you. Today is about promises.',
    hurt: '“I said I would, and I didn’t.” Not to a client. To yourself.\n**Which promise to yourself do you keep breaking?**',
    story: { head: 'My story', paras: [
      'The promises that hurt most are the ones we break to ourselves. Only when we learn from those do we really start to understand other people, and stop breaking our promises to them.',
      'In 2019 I competed in Classic Physique with the IFBB, and I won. It taught me that **confidence comes from evidence: the discipline nobody sees.** Not from a speech you give yourself.',
    ] },
    tool: { kind: 'ifthen', title: 'Four if-then promises · from The Founder’s Growth Manual', rows: [
      ['I don’t know', 'Say what I need to check.'],
      ['I promise a date', 'Name the trade-off.'],
      ['I make a mistake', 'Say so before someone finds it.'],
      ['I’m overloaded', 'Renegotiate my priorities.'],
    ], foot: 'A value without a behaviour is branding.' },
    step: { do: 'Write one if-then promise of your own: “When ___, I will ___.” Test it once in a real conversation this week.', done: 'you have kept it once, and noted what it cost you.' },
    truth: ['**Which principle would cost you something to keep this week?** That one is real. You don’t need to be perfect. You need one promise you keep.'],
    invite: { lead: 'Unshakeable, our Personal Leadership Audit, looks at exactly this: how you lead yourself. It costs $9.99.', button: 'Take Unshakeable, $9.99 →', url: `${ES}/unshakeable` },
    reply: 'what is your if-then promise?',
    ask: ['My if-then promise', 'What is in Unshakeable?'],
    ps: { text: 'The first pages of the Massive Growth Plan are free: 20 + 1 steps to grow, and win with grace. ', label: 'See the plan', url: `${LIB}massive-growth-plan-preview.pdf` },
  },
  {
    n: 7, title: 'Everything comes back to you', good: 1,
    hello: 'Letter 7 of 10. Thank you for reading on a busy day.',
    hurt: '“If I don’t do it, it doesn’t get done.” So everything comes back to you.\n**If you stepped away for two weeks, what would break first?**',
    story: { head: 'From the book', paras: [
      'Built to Lead has a founder moment I hear about often: a new client asks for urgent work, and you already have promises due this week.',
      'The book’s move: **write down the promises already due. Then offer a later date, a smaller scope, or an honest no you can stand behind.**',
    ] },
    tool: { kind: 'ladder', title: 'BREATHE · from our book Built to Lead', rows: [
      ['B', 'Body:', 'what is it telling you?'],
      ['R', 'Reality:', 'what is already promised this week?'],
      ['E', 'Energy:', 'what do you really have left?'],
      ['A', 'Ask:', 'what can move?'],
      ['T', 'Time:', 'where is your boundary?'],
      ['H', 'Human:', 'what do you, and the others, need?'],
      ['E', 'Experiment:', 'pause before you say yes.'],
    ], foot: 'Check capacity before you give another yes.' },
    step: { do: 'Write the promises already due this week. Next to each one, write: keep, move, shrink or no.', done: 'one of them has a new date or a smaller scope, and you have told the person.' },
    truth: ['**If everything waits for you, your business can only be as big as your week.** Saying “not this week” is not weakness. It is how you keep the promises that matter.'],
    invite: { lead: 'The Two-Week Test asks twenty questions on your time, your people, your systems and your clients, and gives you a seven-day handover plan. It’s free.', button: 'Take the Two-Week Test →', url: `${ES}/two-week-test` },
    reply: 'which promise did you move, shrink or say no to?',
    ask: ['What I moved this week', 'How do I hand work over?'],
    ps: { text: '12 Days to Start Winning is free: twelve mornings, twelve principles from my book A New Way of Winning, one thing done each day. ', label: 'Start the 12 days', url: `${LTL}/12-days/` },
  },
  {
    n: 8, title: 'Whose day gets better?', good: 2,
    hello: 'Letter 8 of 10. Thank you. Today is about the people you serve.',
    hurt: '“People don’t get it.” Maybe. Or maybe we built what we love, not what they need.\n**Whose day gets better because your business exists?**',
    story: { head: 'My story', paras: [
      'My first lesson in service came in restaurants, when I arrived in Italy. It was never about how many plates I carried. **It was about how the other person felt.** Serving people is a noble thing.',
      'Years later I forgot it. My first ExploraSelf programmes were built around what I was passionate about, and others explained those topics in more depth. I had made my passion the solution, without asking whose problem it solved.',
      'Now I ask one question first: **does this make people’s lives better, or more complicated?** It is much easier to sell when you start from their comfort.',
    ] },
    tool: { kind: 'ladder', title: 'Three questions before you build anything', rows: [
      ['1', 'Who', 'is it for, by name or by situation?'],
      ['2', 'What', 'changes in their day when it works?'],
      ['3', 'Better', 'or more complicated for them?'],
    ], foot: 'Respect the problem they actually brought you.' },
    after: 'In A New Way of Winning I wrote: **“A customer may want a reliable appointment rather than participation in your grand vision.”**',
    step: { do: 'Ask one customer, or someone you want to serve: “What were you trying to fix when you found me?” Write down their exact words.', done: 'you have one sentence in their words, not yours.' },
    truth: ['If you only build what you love, you may be serving yourself. **Serve their day, and the business follows.** You care; that is why you are reading this. Point that care at them.'],
    invite: { lead: 'First 100 Clients is a free 16-question assessment. It finds the gap between you and your first 100 perfect clients, with a seven-day plan.', button: 'Take First 100 Clients →', url: `${ES}/first-100-clients` },
    reply: 'what did they say, in their words?',
    ask: ['What my customer said', 'How do I find my first clients?'],
    ps: { text: 'The Growth Toolkit is free: the bottleneck test, cash runway, the offer check and more. ', label: 'Open the Growth Toolkit', url: `${LTL}/tools/` },
  },
  {
    n: 9, title: 'Your team feels your pressure first', good: 3,
    hello: 'Letter 9 of 10. Thank you for coming this far.',
    hurt: '“I’m fine. It’s just a busy week.” But the people around you feel it before you say a word.\n**What do you make harder for others when you feel pressure?**',
    story: { head: 'My story', paras: [
      'My father’s word stayed with me: reputation. Over the years I understood what it really is. **Reputation is the mirror of who we are.**',
      'We can’t fake, for long, a behaviour that doesn’t match our values. Good values inside are what build a good name outside, above all on the hard days.',
    ] },
    tool: { kind: 'ladder', title: 'From event to response · from The Founder’s Growth Manual', rows: [
      ['1', 'Event:', 'something happens.'],
      ['2', 'Interpretation:', 'your pattern reads it.'],
      ['3', 'Check:', 'you test that reading.'],
      ['4', 'Response:', 'what your team actually sees.'],
    ], foot: 'Your team lives with step 4. Make room for step 3.' },
    after: 'An example from the manual: Marta runs a studio. A client disputes an invoice. She pauses, checks the signed scope and finds one unfinished item. She offers a date to finish it and asks the client to confirm the payment date. One check, and no fight.',
    step: { do: 'Ask one person you trust: **“What do I make harder when I feel pressure?”** Then listen. Don’t explain.', done: 'you have written their answer down, word for word.' },
    truth: ['From the manual: **“Every company eventually reflects the judgement habits of the people running it.”** Asking takes courage. It is also how good leaders are made.'],
    invite: { lead: 'The Inner Boardroom shows which voice runs your business decisions, in about ten minutes. It’s free, with the ebook Unbound.', button: 'Meet my inner boardroom →', url: `${ES}/unbound` },
    reply: 'what did they tell you?',
    ask: ['What they told me', 'How do I lead under pressure?'],
    ps: { text: 'Want to talk it through? A free discovery call with me is open. ', label: 'Ask for a call', url: `${LTL}/book/discovery/` },
  },
  {
    n: 10, title: 'Ambition is good. Let’s give it a road.', good: 4,
    hello: 'Letter 10 of 10, the last one. Thank you for reading every one of them.',
    hurt: 'Eighteen days ago you left your name. **What has changed since?** Maybe a lot. Maybe not yet. Both are honest answers.',
    story: { head: 'My story', paras: [
      'Moldova and Rome taught me one more thing. When I worked and won only for myself, I got what I wanted. But it wasn’t fulfilling. It was always about me.',
      '**Thinking of other people gives you much more, and it makes the world a little better.** That is what Good People Win means: we want to do good, and we want to win. Both.',
    ] },
    tool: { kind: 'ladder', title: 'The seven clarity points · from A New Way of Winning', rows: [
      ['1', 'Name it', 'in plain words.'],
      ['2', 'Evidence:', 'something you can open, count or quote.'],
      ['3', 'Gap:', 'what you say, against what the record shows.'],
      ['4', 'Cost:', 'in time, money, people or missed work.'],
      ['5', 'Decision:', 'the part that is yours.'],
      ['6', 'Move:', 'specific, owned and dated.'],
      ['7', 'Review:', 'what you will check, and when.'],
    ], foot: 'P.A.C.E. from letter 1, opened out.' },
    step: { do: 'Take the thing you have carried the longest. Walk it through the seven points, one line each.', done: 'your Move has a date, and your Review has a date.' },
    truth: ['In A New Way of Winning I wrote: **“Build something you are willing to stand behind.”** You can. Ambition is good. Let’s give it a road.'],
    invite: { lead: 'If you want someone beside you on that road, The Boardroom is one hour, one to one, with me. It costs $27.', button: 'See The Boardroom, $27 →', url: `${LTL}/boardroom/`,
      or: { text: 'Or walk it on your own, free, in the Founder Launchpad: ', label: 'open the Launchpad', url: `${LTL}/ground-plan/#programme` } },
    reply: 'what will you stand behind a year from now?',
    ask: ['What I will stand behind', 'What happens in The Boardroom?'],
    ps: { text: 'This was the last letter of Good People Win. My door stays open: reply any time, and I will read it.' },
  },
];
