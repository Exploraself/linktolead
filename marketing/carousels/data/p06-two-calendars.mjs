export default {
  id: 'p06',
  title: 'Same founder. Same week. Two businesses.',
  pillar: 'Lead people & business',
  cta: 'northstar',
  why: 'Before and after is the oldest frame in advertising because the eye reads contrast before words. Two Tuesdays of the same founder make the difference between doing and leading visible in one swipe; then three moves to redraw the reader’s own week, with their own count.',
  caption: `Same founder. Same week. Two different businesses.

Tuesday A: email in bed at 7, a site visit someone else could do, a “quick call” that wasn’t, quotes at 9 pm. Every block is someone else’s urgency.

Tuesday B: a decision hour at 7, a 15-minute huddle, sales calls, training the person who takes the site visits, home at 6. Every block is a decision.

Your calendar is your strategy, written in hours. Read last week’s as if someone else wrote it. Then decide who that person should be.

Whose urgency runs your Tuesday?

The Leader’s North Star, free, link in bio.`,
  tags: ['#founders', '#productivity', '#leadership', '#delegation', '#smallbusiness'],
  facts: [
    { claim: 'Both Tuesdays and the hours on slide 4 are an example, not data.', source: 'Illustration; the reader counts their own on slide 6.' },
  ],
  slides: [
    { type: 'poster', text: 'Same founder. Same week. *Two different businesses.*', rule: true, p: 'Swipe to see both Tuesdays.' },
    { type: 'story', title: 'Tuesday A: *everyone else’s urgency*',
      card: { kind: 'calendar', head: 'Tuesday', meta: 'version A', days: ['Tue'], hours: [7, 22], rowH: 44, blocks: [
        { d: 0, from: 7, to: 8, label: 'Email, still in bed' }, { d: 0, from: 8, to: 10, label: 'Site visit (Sam could do it)' }, { d: 0, from: 10, to: 10.6, label: '“Quick” call', hl: true },
        { d: 0, from: 10.6, to: 12, label: 'Fixing an invoice' }, { d: 0, from: 12, to: 13, label: 'Lunch at the desk', dark: true }, { d: 0, from: 13, to: 15, label: 'Quotes nobody else can do' },
        { d: 0, from: 15, to: 16, label: 'Team questions, one by one', hl: true }, { d: 0, from: 16, to: 18, label: 'Firefighting' }, { d: 0, from: 18, to: 19, label: 'Drive home, on the phone', hl: true }, { d: 0, from: 20, to: 22, label: 'Email again', dark: true }] },
      foot: 'Every block is *someone else’s urgency.*' },
    { type: 'story', title: 'Tuesday B: *your decisions*',
      card: { kind: 'calendar', head: 'Tuesday', meta: 'version B', days: ['Tue'], hours: [7, 22], rowH: 44, blocks: [
        { d: 0, from: 7, to: 8, label: 'Decision hour: pricing', hl: true }, { d: 0, from: 8, to: 8.5, label: 'Huddle, 15 min' }, { d: 0, from: 8.5, to: 10, label: 'Sales calls' },
        { d: 0, from: 10, to: 12, label: 'Training Sam on site visits', hl: true }, { d: 0, from: 12, to: 13, label: 'Lunch, away from the desk' }, { d: 0, from: 13, to: 15, label: 'Quotes, now with a template' },
        { d: 0, from: 15, to: 16, label: 'Open door for the team' }, { d: 0, from: 16, to: 17.5, label: 'Clients you chose' }, { d: 0, from: 17.5, to: 18, label: 'Plan tomorrow', hl: true }, { d: 0, from: 18, to: 22, label: 'Home', dark: true }] },
      foot: 'Every block is *a decision you made.*' },
    { type: 'diagram', title: 'The same day, *spent differently*', text: 'An example, not data. You’ll count your own on slide 6.',
      d: { kind: 'bars', max: 9, items: [
        { label: 'Tuesday A · deciding', value: 0.5, display: '½ hour' }, { label: 'Tuesday A · work others could do', value: 7, display: '7 hours' },
        { label: 'Tuesday B · deciding', value: 3, display: '3 hours', hl: true }, { label: 'Tuesday B · work others could do', value: 1, display: '1 hour', hl: true }] } },
    { type: 'diagram', title: 'Where each hour *belongs*',
      d: { kind: 'matrix', x: ['Others could do it', 'Only you can'], y: ['Can wait', 'Can’t wait'], hl: [1, 1], q: [
        [['Hand it over now', 'And write the steps'], ['Do it', 'Then ask why it became urgent']],
        [['Drop it, or delegate', 'Nobody will miss it'], ['Your decision hour', 'Book it before anyone else does']]] } },
    { type: 'steps', title: 'Redraw your Tuesday *in three moves*', items: [
      { h: 'Colour last week', p: 'Open your calendar. Mark each block **deciding** or **doing**. Count both.' },
      { h: 'Move one block', p: 'Pick one recurring “doing” block. Write who takes it, and from when.' },
      { h: 'Book your decision hour', p: 'Same time every day. In the calendar before anyone else is.' }] },
    { type: 'template', title: 'Your decision hour', label: 'Write it, then book it', lines: ['My decision hour: {{day}} at {{time}}.', 'Waiting for a decision: {{one}}, {{two}}, {{three}}.'], hint: 'Three decisions, one hour. The rest of the day gets lighter.' },
    { type: 'script', title: 'Tell your team *this week*', lines: [
      { label: 'You', text: 'From Tuesday, 7 to 8 is my decision hour. Unless it’s an emergency, it waits until the 8 o’clock huddle.' },
      { label: 'You', text: 'An emergency means {{what counts}}. Everything else, bring it to the huddle and we’ll answer it together.' },
      { who: 'aside', text: 'The questions that can’t wait an hour show you what to fix next.' }] },
    { type: 'rule', kicker: 'The point', text: 'Your calendar is your strategy, *written in hours.*', p: 'Read last week’s as if someone else wrote it. **Then decide who that person should be.**' },
    { type: 'cta', question: 'Whose urgency *runs your Tuesday?*', save: 'Save it for Monday. *Send it to the founder who’s always on a call.*' },
  ],
};
