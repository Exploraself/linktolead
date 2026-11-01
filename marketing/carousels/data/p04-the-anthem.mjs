export default {
  id: 'p04',
  title: 'For the one who started with one van',
  pillar: 'Confidence',
  cta: 'unshakeable',
  why: 'A manifesto in the tradition of the great brand anthems: it names the reader’s private sacrifices so exactly that they feel seen, then turns pride and tiredness into a next step. Emotion first; the reason (doer, manager, leader) in the middle; tools at the end. Written in our own words, for the founder who started small.',
  caption: `This is for the one who started with one van and a lot of nerve.

Who opens before the sun and closes after everyone’s gone. Who covered payroll before paying themselves, more than once, and told no one.

Who is proud of it. And tired of it. Both are true. Neither makes you weak.

Hard work got you here. It won’t get you there. Not because you’re not enough, but because the next job is different: decide what matters, hand over what doesn’t, and be the person your people follow.

You were never meant to carry it all. You were meant to lead it.

What did you start with?

Send this to the founder who started with even less. And when you’re ready: the Unshakeable assessment, link in bio.`,
  tags: ['#founders', '#smallbusiness', '#entrepreneur', '#leadership', '#hardwork'],
  facts: [
    { claim: 'The people in the photographs are illustrations, not clients or real stories.', source: 'Generated images; say so if asked.' },
  ],
  slides: [
    { type: 'photo', img: 'van', kicker: 'This is for the one', title: 'Who started with *one van* and a lot of nerve.' },
    { type: 'photo', img: 'bakery', title: 'Who opens *before the sun.* And closes after everyone’s gone.' },
    { type: 'poster', text: 'Who covered payroll *before paying yourself.*', rule: true, p: 'More than once. And told no one.' },
    { type: 'poster', center: true, text: 'Who is proud of it. *And tired of it.*', p: 'Both are true. **Neither makes you weak.**' },
    { type: 'diagram', title: 'Hard work got you here. *It won’t get you there.*',
      d: { kind: 'stack', items: [['Doer', 'You do the work'], ['Manager', 'You check the work'], ['Leader', 'You decide what matters, and who does it']] },
      foot: 'Not because you’re not enough. *The next job is different.*' },
    { type: 'steps', title: 'The next job, *in three moves*', items: [
      { h: 'Decide what matters', p: 'Write the three results that would change your year. Only three.' },
      { h: 'Hand over what doesn’t', p: 'Open last week’s calendar. Pick one recurring task to give away by Friday.' },
      { h: 'Be the one they follow', p: 'Tell your team the three results. Ask what they need from you.' }] },
    { type: 'template', title: 'Write why *you* started', label: 'For the bad days', lines: ['I’m building this so that {{who}} can {{what}}.', 'This month I’ll stop carrying {{one thing}}.'], hint: 'Keep it where you’ll see it on a Tuesday night.' },
    { type: 'checklist', title: 'When the week gets heavy', items: [['Write the one decision only you can make today.'], ['Hand one task to someone. Today, not someday.'], ['Leave at the time you said.', 'Tell someone the time, so it counts.'], ['On Sunday, write one thing that went right.']] },
    { type: 'rule', kicker: 'The point', text: 'You were never meant to carry it all. *You were meant to lead it.*', p: 'Pride got you started. **Leadership lets you keep going without losing yourself.**' },
    { type: 'cta', question: 'What did *you* start with?', save: 'Send it to the founder who started with *even less.*' },
  ],
};
