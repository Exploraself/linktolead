export default {
  id: 'c05',
  title: 'The first flight lasted about 12 seconds',
  pillar: 'Think bigger',
  cta: 'northstar',
  caption: `The first powered flight lasted about 12 seconds.

17 December 1903, Kitty Hawk, North Carolina. Orville Wright flew about 120 feet. Two years earlier, in 1901, the Wright brothers had built a small wind tunnel and tested about 200 wing shapes in it.

Small tests first. Then the big bet.

AI can build your whole launch in a weekend. It cannot tell you whether anyone will pay. Only a small, real test can.

Design one test this week: who you ask, what you offer, what counts as a yes, and by when.

What could you test this week, before you build it?

Start with The Leader’s North Star, free, link in bio.`,
  tags: ['#founders', '#startup', '#leadership', '#entrepreneurship', '#history'],
  facts: [
    { claim: 'On 17 December 1903, at Kitty Hawk, North Carolina, Orville Wright made the first powered, controlled flight: about 12 seconds and about 120 feet.', source: 'Smithsonian National Air and Space Museum, “1903 Wright Flyer”; US National Park Service, Wright Brothers National Memorial. (The site is Kill Devil Hills, near Kitty Hawk; the flight is usually described as at Kitty Hawk.)' },
    { claim: 'In 1901 the Wright brothers built a small wind tunnel and tested about 200 wing shapes in it.', source: 'Smithsonian National Air and Space Museum, “The Wright Brothers: The Invention of the Aerial Age” (wind tunnel section); NASA Glenn Research Center pages on the Wrights’ 1901 wind tunnel.' },
    { claim: 'Two years between the wind tunnel tests and the first powered flight.', source: 'Arithmetic: 1903 − 1901 = 2.' },
  ],
  slides: [
    { type: 'hook', art: 'biplane', pre: 'The first flight:', title: 'Tiny.', post: 'About 12 seconds.', fig: 'FIG. 29 — 17 DEC 1903 · ABOUT 12 SECONDS' },
    { type: 'story', title: '1901: the Wrights build a small *wind tunnel.*',
      card: { kind: 'doc', head: 'Wind tunnel tests', meta: '1901', rows: [['Built by', 'the Wright brothers'], ['Tunnel', 'small'], ['Wing shapes tested', 'about 200', 'total']], stamp: 'Tested first' },
      note: 'Each shape was a question, asked small.', foot: 'Two years later: *Kitty Hawk.*' },
    { type: 'story', title: '1903: the first powered flight lasts *about 12 seconds.*',
      card: { kind: 'receipt', head: 'The first flight', meta: '17 Dec 1903', value: 'about 12 s', unit: 'in the air · about 120 feet', rows: [['Where', 'Kitty Hawk, NC'], ['Pilot', 'Orville Wright'], ['Kind', 'powered, controlled']] },
      note: 'Small enough to try. Real enough to learn from.', foot: 'Test small *before you bet big.*' },
    { type: 'diagram', title: 'AI can build the launch. *Only a buyer can say yes.*',
      d: { kind: 'split', left: { h: 'AI can build you', items: ['The website', 'The launch plan', 'The ads', 'The product page'] }, right: { h: 'Only a buyer can tell you', items: ['Whether they want it', 'What they’ll pay', 'What they’d change', 'When they’ll buy'] } },
      foot: 'Faster building makes *testing first* matter more.' },
    { type: 'diagram', title: 'A small test has *four parts*',
      d: { kind: 'flow', hl: [2], steps: [{ h: 'Who', p: 'Five people who look like your best client.' }, { h: 'What you offer', p: 'One offer, in one message, with a price.' }, { h: 'What counts as a yes', p: 'Money, a signature or a date in the diary.' }, { h: 'By when', p: 'A day this week. Silence counts as a no.' }], loop: 'yes: test bigger · no: change one thing' } },
    { type: 'template', title: 'Design this week’s test', label: 'My test',
      lines: ['I will offer {{what}} to {{who}}.', 'A yes means {{money, a signature or a date}}.', 'I will know by {{day}}.'],
      hint: 'If a yes costs them nothing, it isn’t a yes yet.' },
    { type: 'checklist', title: 'Run it this week',
      items: [['Open your client list. Pick five people who fit.'], ['Send each the offer, in one message, by Wednesday.'], ['On Friday, count the real yeses: ____ of 5', 'Money, a signature or a date. Not “sounds great”.'], ['Write the next step: test bigger, or change one thing.']] },
    { type: 'script', title: 'The offer, word for word',
      lines: [{ label: 'You say', text: 'I’m planning something for people like you, and I’d rather ask than guess.' }, { label: 'Then', text: 'It’s {{what}} for {{price}}. If I run it next month, will you book now?' }, { who: 'them', label: 'If they say', text: 'Sounds interesting. Send me more details.' }, { label: 'You say', text: 'Happy to. Is that a yes if the details work, or a no for now?' }] },
    { type: 'rule', kicker: 'The point', text: 'Test small before you bet big. *A short flight still flies.*',
      p: 'AI can build the whole launch in a weekend. **Finding out whether anyone wants it** still takes a person saying yes.' },
    { type: 'cta', question: 'What could you test this week, *before you build it?*' },
  ],
};
