import { DRAWINGS } from '../lib/premium.mjs';

export default {
  id: 'p09',
  title: 'What do you do all day?',
  pillar: 'Think bigger',
  cta: 'northstar',
  why: 'The simplest question, from the most honest audience. A child’s drawing disarms the reader before the business point lands: if a child can’t repeat what you do, a client can’t pass it on either. The tool is a one-breath sentence and three tests, ending in a sharper offer.',
  caption: `“What do you do all day?”

You try: “I help businesses streamline integrated solutions…” They’re gone by the third word. So is everyone else.

What a child sees instead: you work on the phone, you fix things for people, you come home tired.

Ouch. And also: the start of a great offer.

Write your one-breath sentence: I help [who], who [struggle with what], so they can [what changes]. Say it to a child. Ask them to say it back tomorrow. Cut the words they dropped.

If they can’t say what you do, they can’t send you the next client.

Could your kid explain what you do?

The Leader’s North Star, free, link in bio.`,
  tags: ['#founders', '#branding', '#smallbusiness', '#marketing', '#clarity'],
  facts: [
    { claim: 'The drawing, the child’s lines and the heating examples are illustrations.', source: 'Creative device.' },
  ],
  slides: [
    { type: 'crayon', lines: [{ t: 'What do you do all day?' }], draw: DRAWINGS.phoneParent, foot: 'The hardest question in business. *Answer it in one breath.*' },
    { type: 'poster', text: 'You try: “I help businesses streamline *integrated solutions…*”', p: 'They’re gone by the third word. **So is everyone else.**' },
    { type: 'crayon', title: 'What they see instead', lines: [{ t: 'You work on the phone.' }, { t: 'You fix things for people.', c: 'grn' }, { t: 'You come home tired.', c: 'red' }], foot: 'Ouch. *And the start of a great offer.*' },
    { type: 'diagram', title: 'Say it like *you’d say it to them*', text: 'An example from a heating business. Yours comes on slide 6.',
      d: { kind: 'split', left: { h: 'What you say', items: ['Integrated facility solutions', 'End-to-end service', 'Customer-centric approach'] }, right: { h: 'What they understand', items: ['We fix the heating so families stay warm', 'We pick up when it breaks', 'We come back until it works'] } } },
    { type: 'diagram', title: 'Three tests *for one sentence*',
      d: { kind: 'tiles', cols: 3, tiles: [
        { big: '1', small: '**The child test**\nCan a 7-year-old say it back?' }, { big: '2', small: '**The dinner test**\nCan your partner repeat it?' }, { big: '3', small: '**The friend test**\nCan a client explain you to a friend?' }] } },
    { type: 'template', title: 'Your one-breath sentence', label: 'Fill it, then say it out loud', lines: ['I help {{who}}', 'who {{struggle with what}},', 'so they can {{what changes}}.'], hint: 'No word a child wouldn’t know. If you need “and”, it’s two businesses.' },
    { type: 'steps', title: 'Test it *before Sunday*', items: [
      { h: 'Say it to a child', p: 'Or anyone outside your trade. Ask them to say it back tomorrow.' },
      { h: 'Write what they dropped', p: 'The words they lost are the words to cut.' },
      { h: 'Use it in three places', p: 'Your website’s first line, your email signature, your profile.' }] },
    { type: 'checklist', title: 'You’ll know it works when', items: [['A client says it back to you.'], ['Your team uses the same words.'], ['Referrals start with “they’re the ones who…”']] },
    { type: 'rule', kicker: 'The point', text: 'Clarity is a kindness. *To your clients, your team and your family.*', p: 'If they can’t say what you do, **they can’t send you the next client.**' },
    { type: 'cta', question: 'Could your kid *explain what you do?*', save: 'Save it. *Try it at dinner tonight.*' },
  ],
};
