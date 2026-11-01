export default {
  id: 'c04',
  title: 'Kodak built the future and kept the past',
  pillar: 'Think bigger',
  cta: 'unshakeable',
  caption: `In 1975, an engineer at Kodak built the first self-contained digital camera. In January 2012, Kodak filed for bankruptcy protection.

Having the invention did not decide what to do with it. Invention is not direction.

AI now hands the invention to everyone: you, and every competitor you have. What you stop protecting is still your call.

Save this. Then open your last two years of sales and find what you guard hardest while your clients walk away from it.

What are you protecting that your clients have already left?

See how steady you stay when it is time to let go: the Unshakeable assessment, link in bio.`,
  tags: ['#leadership', '#innovation', '#founders', '#ai', '#strategy'],
  facts: [
    { claim: 'In 1975 Steve Sasson, an engineer at Kodak, built the first self-contained digital camera (a prototype).', source: 'National Inventors Hall of Fame, entry for Steven J. Sasson (digital camera); Kodak’s own company history; Sasson’s accounts in press interviews.' },
    { claim: 'The prototype recorded images of about 0.01 megapixels to a cassette tape, taking about 23 seconds per image.', source: 'Same sources as above.' },
    { claim: 'In January 2012, Eastman Kodak filed for Chapter 11 bankruptcy protection in the United States.', source: 'Eastman Kodak press release, 19 January 2012; news reports of the same day (e.g. Reuters, BBC News).' },
    { claim: '37 years between the prototype and the filing.', source: 'Arithmetic: 2012 − 1975 = 37.' },
  ],
  slides: [
    { type: 'hook', art: 'camera', pre: '1975 · Kodak built the', title: 'future', post: 'and kept the past.' },
    { type: 'story', title: '1975: Kodak builds the first *digital camera.*',
      card: { kind: 'doc', head: 'The prototype', meta: 'Kodak · 1975', rows: [['Built by', 'Steve Sasson'], ['Design', 'self-contained'], ['Image', 'about 0.01 MP'], ['Saved to', 'cassette tape'], ['Per picture', 'about 23 seconds', 'total']], stamp: 'Prototype' },
      note: 'Slow. Tiny. And first.', foot: 'Kodak had the future *first.*' },
    { type: 'story', title: 'January 2012: Kodak files for *bankruptcy protection.*',
      card: { kind: 'receipt', head: 'Between the two dates', meta: 'arithmetic', value: '37 years', unit: '2012 − 1975', rows: [['1975', 'the prototype'], ['2012', 'Chapter 11']] },
      note: 'Having the invention didn’t decide what to do with it.', foot: 'Invention is not *direction.*' },
    { type: 'diagram', title: 'Now AI hands *everyone* the invention',
      d: { kind: 'timeline', items: [
        { y: '1975', t: 'A Kodak engineer builds the first self-contained **digital camera**.' },
        { y: '2012', t: 'In January, Kodak files for **Chapter 11** bankruptcy protection.' },
        { y: 'Today', t: 'AI puts the invention in **everyone’s** hands: yours, and every competitor’s.', hl: true }] },
      foot: 'The tool is no longer *the advantage.*' },
    { type: 'diagram', title: 'Where does each thing you sell *sit?*',
      d: { kind: 'matrix', y: ['you guard it less', 'you guard it most'], x: ['clients leaving it', 'clients asking for it'],
        q: [[['Guarding the past', 'Your best hours go to what clients are leaving.'], ['Your core', 'Keep it. Make it better.']],
          [['Let it go', 'Stop selling it, on purpose.'], ['Your next move', 'Give it the hours you take back.']]], hl: [0, 0] } },
    { type: 'checklist', title: 'Find what you’re guarding',
      items: [['Open your sales for the last two years.', 'Invoices, till reports or your bank statement.'], ['List everything you sell, one line each.'], ['Beside each, write two numbers.', 'Sold this year ____ · sold last year ____'], ['Circle the one you defend hardest. Is its number falling?', 'If it is, that’s the past you’re guarding.']] },
    { type: 'script', title: 'Ask one client who stopped buying',
      lines: [{ label: 'You ask', text: 'You used to buy this from me. What do you use now instead?' }, { label: 'Then', text: 'What made you switch?' }, { label: 'And', text: 'What would I have to change for you to come back?' }, { who: 'aside', text: 'Write their exact words. Don’t defend. Don’t sell.' }] },
    { type: 'template', title: 'Write what you will stop protecting', label: 'By the end of this month',
      lines: ['I have been protecting {{what}}.', 'My clients are moving to {{what}}.', 'By {{date}}, I will stop {{one thing}}.'],
      hint: 'Then give those hours to what your clients are asking for.' },
    { type: 'rule', kicker: 'The point', text: 'Invention is not direction. *Choosing what to leave is.*',
      p: 'AI hands everyone the invention. **What you stop protecting** is still your call, and no tool will make it for you.' },
    { type: 'cta', question: 'What are you protecting that your clients have *already left?*' },
  ],
};
