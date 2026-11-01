export default {
  id: 'p03',
  title: 'What did this year cost you?',
  pillar: 'Choose',
  cta: 'unshakeable',
  why: 'A receipt is the most rational object we carry. Filled with blanks for evenings and birthdays, it turns “the cost of not acting” into a question the reader answers in their own numbers (none invented). Honest like Patagonia’s “Don’t buy this jacket”: show the real price, then budget next year’s.',
  caption: `You track every dollar. Not this.

Evenings worked after 7 pm. Weekends on the phone. Birthdays you left early. Hours on work someone else could do. Every “next month”.

Paid with: time. Refunds: none.

A two-hour weekly favour is 104 hours a year. Two and a half working weeks, for favours.

Profit is what’s left after costs. Count all of them. Then write next year’s receipt before the year writes it for you.

Which line would you refund first?

Find where your steadiness breaks under pressure: the Unshakeable assessment, link in bio.`,
  tags: ['#founders', '#timemanagement', '#leadership', '#smallbusiness', '#family'],
  facts: [
    { claim: 'A two-hour weekly favour is 104 hours a year, about two and a half 40-hour weeks.', source: 'Arithmetic: 2 × 52 = 104; 104 ÷ 40 = 2.6.' },
    { claim: 'Every line on the receipts is a blank for the reader’s own count.', source: 'No numbers are claimed.' },
  ],
  slides: [
    { type: 'poster', kicker: 'Year-end statement', text: 'What did this year *really* cost you?', rule: true, p: 'Not the software. Not the van. The things that never show up on a bank statement.' },
    { type: 'receipt', title: 'You track every dollar. *Not this.*', head: 'Your business, Inc.', sub: 'Statement · January to December', rows: [
      ['Evenings worked after 7 pm', ''], ['Weekends on the phone', ''], ['Birthdays you left early', ''], ['Dinners, laptop open', ''], ['Hours of work others could do', ''], ['Times you said “next month”', ''], '-', ['TOTAL PAID', '', 'tot']], foot: 'Fill it in honestly. Nobody else will see it.', barcode: false },
    { type: 'receipt', title: 'And the line at the bottom:', head: 'Your business, Inc.', sub: 'Payment details', rows: [
      ['Subtotal', 'one year'], ['Paid with', 'time'], ['Refunds', 'none'], '-', ['Change given', '0', 'tot']], foot: 'Thank you for your business. *Please come again.*' },
    { type: 'diagram', title: 'The price of one *small yes*',
      d: { kind: 'equation', head: 0, hl: [1], rows: [['A weekly favour', '×', 'Weeks', '=', 'Hours a year'], ['2 hours', '×', '52', '=', '104'], ['{{your hours}}', '×', '52', '=', '{{your total}}']] },
      foot: '104 hours is two and a half working weeks. *For favours.*' },
    { type: 'diagram', title: 'What you were buying. *What you paid with.*',
      d: { kind: 'split', left: { h: 'What you paid with', items: ['Evenings', 'Sleep', 'Saturdays', 'Being fully there'] }, right: { h: 'What you were buying', items: ['Security', 'Freedom', 'Respect', 'A future for them'] } },
      foot: 'The deal only works if you *get what you paid for.*' },
    { type: 'steps', title: 'Read your receipt *in twenty minutes*', items: [
      { h: 'Open last month’s calendar', p: 'Count the evenings with work after 7 pm. Write the number.' },
      { h: 'Open your screen time', p: 'Write the weekend hours spent in work apps.' },
      { h: 'Circle one line', p: 'The one you would refund first. Only one.' }] },
    { type: 'receipt', title: 'Now write *next year’s* receipt', head: 'Your business, Inc.', sub: 'Budget · the next twelve months', rows: [
      ['Evenings protected a week', ''], ['Saturdays kept', ''], ['Hours handed over a week', ''], ['Birthdays', 'all of them'], '-', ['Paid with', 'decisions', 'tot']], foot: 'Budgets work for time too.', barcode: false },
    { type: 'script', title: 'Then say it out loud, *at home*', lines: [
      { label: 'You', text: 'I counted what this year cost us. Here’s the line I want to change first.' },
      { label: 'You', text: 'Starting this week, {{what changes}}. Hold me to it.' },
      { who: 'aside', text: 'Said to someone you love, a plan becomes a promise.' }] },
    { type: 'rule', kicker: 'The point', text: 'Profit is what’s left after costs. *Count all of them.*', p: 'A business that makes money and costs you your family isn’t profitable yet. **Leadership reads the whole receipt.**' },
    { type: 'cta', question: 'Which line would you *refund first?*', save: 'Save it for New Year. *Or do it tonight.*' },
  ],
};
