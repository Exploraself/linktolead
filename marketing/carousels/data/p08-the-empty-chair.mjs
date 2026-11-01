export default {
  id: 'p08',
  title: 'Monday, 9:00. You’re not there.',
  pillar: 'Lead people & business',
  cta: 'northstar',
  why: 'A thought experiment the reader can’t skip, told through the messages that would pile up. It uses the one urgency signal we allow (how much of the work waits for the founder, from their own count), then gives a test to run on Thursday and a handover note to write the same day.',
  caption: `Monday, 9:00. You’re not there. What happens?

By 9:40: “Where’s the login?” “Can I give her the 10%?” “Who approves the big quote?” “Truck won’t start, what do we do?”

It’s not their fault. You built it this way. Every time you answered instead of teaching, the chair got harder to leave.

Count it this week: decisions that waited for you, out of all of them. More than half? Your business needs you more than it should.

Run the chair test on Thursday. Then write one handover note: when this happens, you can decide this, up to this limit, and call me only when this.

What would stop first if you disappeared for a week?

The Leader’s North Star, free, link in bio.`,
  tags: ['#founders', '#delegation', '#leadership', '#teambuilding', '#smallbusiness'],
  facts: [
    { claim: 'The messages are an illustration, not a real team.', source: 'Creative device.' },
    { claim: '“More than half of the work depends on the founder” is the one urgency signal the team allows, from the founder’s own count.', source: '01 START HERE, section 4 (real urgency).' },
  ],
  slides: [
    { type: 'poster', art: 'officechair', artW: 460, text: 'Monday, 9:00. *You’re not there.*', p: 'What happens next?' },
    { type: 'story', title: 'By 9:40, *your phone looks like this*',
      card: { kind: 'chat', head: 'Team', meta: 'Monday', msgs: [
        { text: 'Where’s the login for the supplier portal?', at: '09:04' }, { text: 'Client’s here. Can I give her the 10% she asked for?', at: '09:12' },
        { text: 'Who approves the big quote?', at: '09:23' }, { text: 'Truck won’t start. What do we do?', at: '09:37' }, { typing: true, text: 'Four more people are typing…' }] },
      note: 'Each one is a decision only you were allowed to make.' },
    { type: 'poster', center: true, text: 'It’s not their fault. *You built it this way.*', p: 'Every time you answered instead of teaching, the chair got harder to leave.' },
    { type: 'diagram', title: 'Count it *this week*',
      d: { kind: 'equation', head: 0, rows: [['Decisions that waited for you', '÷', 'All decisions', '=', 'Your share'], ['{{count}}', '÷', '{{count}}', '=', '{{share}}']] },
      foot: 'More than half? *It needs you more than it should.*' },
    { type: 'diagram', title: 'The chair test',
      d: { kind: 'tiles', cols: 3, label: 'Sort everything that stops when you’re away:', tiles: [
        { big: '1', small: '**Only you**\nKeep it, for now' }, { big: '2', small: '**You plus notes**\nWrite the steps' }, { big: '3', small: '**Anyone trained**\nHand it over' }] } },
    { type: 'steps', title: 'Run it *on Thursday*', items: [
      { h: 'List what stops', p: 'Write the ten things that stop when you’re away for a week.' },
      { h: 'Sort them 1, 2, 3', p: 'Only you · you plus notes · anyone trained.' },
      { h: 'Move one today', p: 'Take one “2”, write the notes, and give it to someone by Friday.' }] },
    { type: 'template', title: 'The handover note', label: 'One task, four lines', lines: ['When {{situation}},', 'you can decide {{what}}', 'up to {{limit}}.', 'Call me only when {{exception}}.'], hint: 'A limit and a “call me when” let people decide without you.' },
    { type: 'checklist', title: 'Test day', items: [['Thursday, 10 to 12: phone off.'], ['Count the messages waiting when it’s back on.'], ['Mark each one: could they have decided?'], ['Write one new handover note from what you found.']] },
    { type: 'rule', kicker: 'The point', text: 'A business that needs you every day *is a job with a logo.*', p: 'Leadership is building the thing that works **while you’re at your kid’s game.**' },
    { type: 'cta', question: 'What would stop first *if you disappeared for a week?*', save: 'Save it for Thursday. *Run the test.*' },
  ],
};
