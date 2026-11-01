export default {
  id: 'c03',
  title: '10% off = 50% more work',
  pillar: 'Choose',
  cta: 'unshakeable',
  caption: `“Can you do 10% off?” It feels like a small yes.

At a 30% margin, it isn’t. Your costs don’t get a discount, so a third of what you keep is gone. To earn the same, you now need 50% more sales.

The calculation is cheap: any spreadsheet does it in a second. Holding your price on a hard week is the part only you can do.

Save this for your next “can you do it for less?”

What would you charge if you believed in what you sell?

Find where your confidence breaks: the Unshakeable assessment, link in bio.`,
  tags: ['#pricing', '#sales', '#founders', '#smallbusiness', '#leadership'],
  facts: [
    { claim: 'Example: price €1,000, costs €700, left €300 (30% margin). With 10% off: €900 − €700 = €200 left, a third less.', source: 'Arithmetic, illustrative numbers.' },
    { claim: 'To keep €3,000: 10 sales at €300, or 15 sales at €200 (50% more).', source: 'Arithmetic: 3,000 ÷ 300 = 10; 3,000 ÷ 200 = 15.' },
    { claim: 'Sales needed for €3,000 at a 30% margin: no discount 10; 5% off 12; 10% off 15; 15% off 20; 20% off 30.', source: 'Arithmetic: 3,000 ÷ (300, 250, 200, 150, 100).' },
  ],
  slides: [
    { type: 'hook', art: 'tag', pre: '10% off', title: '50% more', post: 'work.', sub: 'The arithmetic nobody shows you.' },
    { type: 'story', title: 'A client asks: *“Can you do it for less?”*',
      card: { kind: 'chat', head: 'Client', meta: 'Thursday', msgs: [{ text: 'Love the proposal. Could you do 10% off?', at: '18:42' }, { me: true, text: 'Sure, no problem!', at: '18:43' }] },
      note: 'It feels like a small yes. Kind, even.', foot: 'Here is what it *really* costs.' },
    { type: 'story', title: 'Your costs don’t get a *discount.*',
      card: { kind: 'doc', head: 'One sale', meta: 'example', rows: [['Price', '€1,000'], ['Your costs', '€700'], ['Left for you', '€300'], ['*With 10% off:* price', '€900'], ['Costs (the same)', '€700'], ['Left for you', '€200', 'total']], stamp: 'A third gone' },
      note: 'The €100 comes straight out of what you keep.', foot: 'So how many more sales do you *need?*' },
    { type: 'diagram', title: 'To keep the same €3,000, you need *50% more sales*',
      d: { kind: 'equation', head: 0, hl: [2], rows: [['Left per sale', '×', 'Sales', '=', 'You keep'], ['€300', '×', '10', '=', '€3,000'], ['€200', '×', '15', '=', '€3,000']] },
      foot: 'Five extra clients. *For the same money.*' },
    { type: 'diagram', title: 'The deeper the discount, the *more you must sell*', text: 'Sales needed to keep €3,000, at a 30% margin.',
      d: { kind: 'bars', items: [{ label: 'No discount', value: 10, display: '10 sales' }, { label: '5% off', value: 12, display: '12 sales' }, { label: '10% off', value: 15, display: '15 sales', hl: true }, { label: '15% off', value: 20, display: '20 sales' }, { label: '20% off', value: 30, display: '30 sales' }] } },
    { type: 'steps', title: 'Instead of a discount',
      items: [{ h: 'Ask what the price is protecting', p: 'Ask: *“What would make this an easy yes?”* Often it’s timing, not money.' }, { h: 'Trade, don’t give', p: 'Less scope for less money. Take a part out; keep the price per part.' }, { h: 'Add, don’t cut', p: 'Keep the price. Add something cheap for you and valuable for them.' }] },
    { type: 'script', title: 'What to say when they ask for 10% off',
      lines: [{ who: 'them', label: 'They say', text: 'Can you do it for 10% less?' }, { label: 'You say', text: 'I keep my prices the same for every client. That’s how I stay fair to all of them.' }, { label: 'Then', text: 'If budget is the issue, we can start with a smaller first part at the same rate. Which part matters most to you?' }, { who: 'aside', text: 'Then stop talking. Let them answer.' }] },
    { type: 'checklist', title: 'Know your number before the next call',
      items: [['Open your last invoice. Write the price.'], ['Write what that job cost you: materials, help, your hours.'], ['Price − costs = what one sale leaves you: €____'], ['Write the lowest price you will accept, and why.']] },
    { type: 'rule', kicker: 'A machine can do this sum', text: 'The calculation is cheap. *The choice is not.*',
      p: 'A spreadsheet does this in a second. **Holding your price on a hard week** is the part only you can do.' },
    { type: 'cta', question: 'What would you charge if you *believed* in what you sell?' },
  ],
};
