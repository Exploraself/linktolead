export default {
  id: 'c01',
  title: 'AI multiplies everything. Even your mistakes.',
  pillar: 'Think bigger',
  cta: 'unshakeable',
  caption: `AI multiplies everything. Even your mistakes.

It writes, sums and plans in seconds. I use it every day to build ExploraSelf. But it answers the question you ask. It cannot tell you which question matters.

Results = Direction × Execution. AI raises execution for everyone. Direction is still yours.

Save this and run the D/E test on today’s list.

What is one task on your list that should not be done at all?

Find where to start: the Unshakeable assessment, link in bio.`,
  tags: ['#leadership', '#founders', '#ai', '#entrepreneurship', '#decisionmaking'],
  facts: [
    { claim: 'Results = Direction × Execution, with the sign of direction (+1 / −1) and AI multiplying execution (× 10).', source: 'Illustrative arithmetic, not data: +1 × 10 = +10; −1 × 10 = −10.' },
  ],
  slides: [
    { type: 'hook', art: 'vectors', pre: 'AI multiplies', title: 'everything', post: 'even your mistakes.' },
    { type: 'story', title: 'AI is *brilliant* at execution.', text: 'It writes, sums and plans in seconds. I use it every day to build ExploraSelf.',
      card: { kind: 'list', head: 'Done before 9:05', meta: 'Monday', items: [{ t: 'Five follow-up emails drafted', done: true }, { t: 'Price list rewritten', done: true }, { t: 'Launch plan in twelve steps', done: true }, { t: 'Last month’s numbers summed', done: true }] },
      note: 'Four minutes. Real work, done.', foot: 'So why can it still feel like you’re *standing still*?' },
    { type: 'story', title: 'It answers the question you ask. It can’t tell you *which question matters.*',
      card: { kind: 'chat', head: 'You and your AI', meta: '09:06', msgs: [{ me: true, text: 'Make my launch plan faster.' }, { text: 'Here is a plan you can finish in three weeks: 1. Book the venue…' }, { typing: true, text: 'Nobody asked: should this launch happen at all?' }] },
      note: 'Faster at the wrong thing is still the wrong thing.', foot: 'That question is *leadership*.' },
    { type: 'diagram', title: 'Results = *Direction × Execution*',
      d: { kind: 'equation', head: 0, hl: [2], dim: [3], rows: [['Direction', '×', 'Execution', '=', 'Results'], ['+1\n*right way*', '×', '1\n*you alone*', '=', '+1'], ['+1', '×', '10\n*with AI*', '=', '+10'], ['−1\n*wrong way*', '×', '10\n*with AI*', '=', '−10']] },
      foot: 'AI raises execution for everyone. *Direction is still yours.*' },
    { type: 'diagram', title: 'Know which kind of question you’re *holding*',
      d: { kind: 'split', left: { h: 'AI can answer', items: ['How do I write this?', 'How fast can we ship?', 'What does the data say?', 'What are my options?'] }, right: { h: 'Only you can answer', items: ['Is this worth doing?', 'Who is it really for?', 'What will I say no to?', 'Which option will I carry?'] } },
      foot: 'A wrong direction, multiplied, just gets you *lost faster.*' },
    { type: 'steps', title: 'Before you hand it to AI: *P.A.C.E.*',
      items: [{ h: 'Pause', p: 'Write the task in one line before you open any tool.' }, { h: 'Assess', p: 'Open last month’s results. Did the last task like this move a number? **Which one?**' }, { h: 'Choose', p: 'Write **yes**, **no** or **later** beside it. One word.' }, { h: 'Execute', p: 'Now hand the *how* to AI. Keep the *why*.' }] },
    { type: 'template', title: 'Write your direction line', label: 'This week',
      lines: ['I am building {{what}} for {{who}}, so that {{result}}.', 'I will know it worked when {{number}} by {{day}}.'],
      hint: 'If you can’t fill a blank, that blank is the work. Not the tool.' },
    { type: 'checklist', title: 'Run the D/E test on today’s list',
      items: [['Open today’s to-do list.'], ['Mark each task **D** (direction) or **E** (execution).'], ['Count them: D ____ · E ____'], ['Hand two E tasks to a tool or a person.', 'Give the hour you get back to one D task.']] },
    { type: 'rule', kicker: 'The point', text: 'AI multiplies what you do. *Leadership decides what is worth doing.*',
      p: 'Same tools for everyone means the tool stops being the advantage. **You become it.**' },
    { type: 'cta', question: 'What is one task on your list that should *not be done at all?*' },
  ],
};
