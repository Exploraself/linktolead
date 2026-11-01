export default {
  id: 'p02',
  title: '520 Saturdays',
  pillar: 'Choose',
  cta: 'northstar',
  why: 'One number the reader can’t unsee, built from their own child’s age, paired with a picture they live every weekend. The emotion carries the number; the number makes the emotion undeniable. Then a Saturday rule, a script for the client who calls anyway, and a checklist for this weekend.',
  caption: `If your child is 8, you have about 520 Saturdays left before they’re 18.

(18 − 8) × 52. Do your own. It takes four seconds.

Saturday, 7:40 am. A client texts: “quick question, got 10 minutes?” You say yes. Ten minutes is never ten minutes. You’re there, at the edge of the field. You’re not there.

Your business will ask for every Saturday. Leading it means choosing which ones it can’t have.

This week: block Saturday 8–12 for the next twelve weeks. Tell the one client who calls most. Put the phone in a drawer until noon.

Whose Saturday are you building this for?

The Leader’s North Star, free, link in bio.`,
  tags: ['#founders', '#worklifebalance', '#family', '#leadership', '#smallbusinessowner'],
  facts: [
    { claim: 'A child aged 8 has 10 years until 18: 10 × 52 = 520 Saturdays (an example; the reader uses their own child’s age).', source: 'Arithmetic: (18 − 8) × 52 = 520. Years have 52 or 53 Saturdays, so “about”.' },
    { claim: 'The next twelve months are 52 of those Saturdays.', source: 'Arithmetic.' },
  ],
  slides: [
    { type: 'photo', img: 'cleats', num: '520', title: 'Saturdays *before they’re 18.*', text: 'If your child is 8 today (an example). The arithmetic is on slide 4.' },
    { type: 'phone', title: 'Saturday, *7:40 am.*', day: 'Saturday', time: '7:40', notifs: [
      { app: 'Messages', from: 'Client', text: 'Quick question, got 10 minutes?', ago: 'now' },
      { app: 'Mail', from: 'Supplier', text: 'Order delayed. Can you call me?', ago: '2m' },
      { app: 'Messages', from: 'Team parents', text: 'Game at 10! Who’s bringing oranges?', ago: '14m' }],
      side: ['You say *ten minutes.*', 'Ten minutes is never ten minutes.'] },
    { type: 'photo', img: 'touchline', title: 'You’re there. *You’re not there.*', text: 'Nobody sees it on an invoice. Your kid sees it from the field.' },
    { type: 'diagram', title: 'The arithmetic of *Saturdays*',
      d: { kind: 'equation', head: 0, hl: [1], rows: [['Years until 18', '×', 'Saturdays a year', '=', 'Saturdays left'], ['10\n*child aged 8*', '×', '52', '=', '520'], ['{{years}}', '×', '52', '=', '{{yours}}']] },
      foot: 'Do your own. *It takes four seconds.*' },
    { type: 'diagram', title: 'One year is *52 of them.*',
      d: { kind: 'dots', total: 520, cols: 26, groups: [{ n: 52, label: 'the next twelve months', tone: 'gold' }], rest: 'the rest of them' } },
    { type: 'steps', title: 'Protect *one Saturday block*', items: [
      { h: 'Open your calendar now', p: 'Block Saturday 8 to 12 for the next twelve weeks. Name the block after your kid.' },
      { h: 'Tell one client today', p: 'Not all of them. The one who calls most on weekends.' },
      { h: 'Set the auto-reply', p: 'Fridays at 6 pm: “Back Monday, 8 am. Urgent? Call {{name}}.”' }] },
    { type: 'script', title: 'When a client calls on Saturday anyway', lines: [
      { who: 'them', label: 'Client, Saturday 9:10', text: 'Sorry to bother you on a weekend, quick question…' },
      { label: 'You', text: 'I’m with my family until noon. I’ll call you Monday at 8 and we’ll sort it properly.' },
      { label: 'If it truly can’t wait', text: '{{name}} can help you today on {{number}}.' },
      { who: 'aside', text: 'Kind, clear, said once. Then the phone goes back in the drawer.' }] },
    { type: 'checklist', title: 'This Saturday', items: [['Phone in a drawer until noon.'], ['Let your kid choose the first hour.'], ['One photo. Then the phone goes back.'], ['Write down one thing they said.', 'Keep the note. You’ll want it in ten years.']] },
    { type: 'rule', kicker: 'The point', text: 'Your business will ask for every Saturday. *Leading it means choosing which ones it can’t have.*', p: 'No tool, no employee and no client will make that decision for you.' },
    { type: 'cta', question: 'Whose Saturday are you *building this for?*', save: 'Save it for Friday night. *Send it to a founder who has kids.*' },
  ],
};
