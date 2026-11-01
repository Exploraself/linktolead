export default {
  id: 'p07',
  title: 'Features vs feelings: their words sell',
  pillar: 'Lead people & business',
  cta: 'unshakeable',
  why: 'Dove’s “Real Beauty Sketches” (2013) showed the gap between how we describe ourselves and how others see us. Here the gap is commercial: you sell features, clients buy what changed for them. The tool is three texts to three clients, and their exact words on your page. No invented quotes: the reader collects real ones.',
  caption: `You describe your business in features. Your clients describe it in feelings.

“Fast. Affordable. 20 years’ experience. Free quotes.” True, and invisible: it’s what everyone says.

Ask three clients three questions today: What were you worried about before you called us? What changed after? Why us and not someone else? Copy their exact words. Don’t tidy them.

Then put their words in your first line. AI can write a thousand taglines in a minute. It can’t know why your client finally slept well.

What would your best client say you do?

The Unshakeable assessment, link in bio.`,
  tags: ['#marketing', '#smallbusiness', '#founders', '#copywriting', '#customerexperience'],
  facts: [
    { claim: 'The website lines and the heating examples are illustrations; no client quotes are used.', source: 'The reader collects their own clients’ words.' },
  ],
  slides: [
    { type: 'poster', text: 'You describe your business in *features.*', rule: true, p: 'Your clients describe it in feelings. **The money is in the gap.**' },
    { type: 'story', title: 'How you describe it',
      card: { kind: 'doc', head: 'Your website, first lines', meta: 'today', rows: [['Fast and affordable', ''], ['20 years’ experience', ''], ['Free quotes', ''], ['Quality you can trust', '']], stamp: 'Same as everyone' },
      note: 'All true. All invisible.', foot: 'Now ask the people *who paid.*' },
    { type: 'notes', title: 'How *they* describe it', text: 'You don’t know yet. Ask three clients:', notes: [
      { t: 'What were you worried about before you called us?', lines: 1 }, { t: 'What changed after?', lines: 1 },
      { t: 'Why us, and not someone else?', lines: 1 }, { t: 'Write their exact words. Don’t tidy them.', s: 'The rule' }] },
    { type: 'diagram', title: 'Your words. *Their words.*',
      d: { kind: 'split', left: { h: 'Your words', items: ['Fast', 'Affordable', 'Experienced', 'Quality'] }, right: { h: 'Their words', items: ['{{their word}}', '{{their word}}', '{{their word}}', '{{their word}}'] } },
      foot: 'The right column *is your marketing.*' },
    { type: 'diagram', title: 'From their mouth *to your page*',
      d: { kind: 'flow', hl: [2], steps: [
        { h: 'Ask three clients', p: 'By text, today. Three questions.' }, { h: 'Copy their exact words', p: 'Spelling and all. Their words beat yours.' },
        { h: 'Put them first', p: 'Your website’s first line, your next proposal, your bio.' }, { h: 'Ask again in twelve weeks', p: 'The words change as you do.' }] } },
    { type: 'script', title: 'The text to send *today*', lines: [
      { label: 'You', text: 'Hi {{name}}, quick favour: I’m rewriting how I describe what we do, and I’d rather use your words than mine.' },
      { label: 'You', text: 'Three questions: what were you worried about before? What changed after? Why us? One line each is perfect.' },
      { who: 'aside', text: 'Send it to three clients. Not ten. Three you’d love to clone.' }] },
    { type: 'template', title: 'Your new first line', label: 'Built from their words', lines: ['Before us, you {{their worry}}.', 'After, you {{their change}}.', 'That’s what we do.'], hint: 'Read it out loud. If it sounds like you wrote it, use more of their words.' },
    { type: 'checklist', title: 'Before Friday', items: [['Send the text to three clients.'], ['Copy every answer word for word.'], ['Underline the words two people used.'], ['Change the first sentence on your page.', 'It does the most work. Start there.']] },
    { type: 'rule', kicker: 'The point', text: 'Your best marketing is already written. *It’s in your clients’ words.*', p: 'AI can write a thousand taglines in a minute. **It can’t know why your client finally slept well.**' },
    { type: 'cta', question: 'What would your best client *say you do?*', save: 'Save it. *Send the three texts tonight.*' },
  ],
};
