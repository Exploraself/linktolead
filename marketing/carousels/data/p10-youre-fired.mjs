export default {
  id: 'p10',
  title: 'You’re fired (from the wrong job)',
  pillar: 'Lead people & business',
  cta: 'unshakeable',
  why: 'Humour carries a hard truth: the founder hired themselves into a job nobody else would take. The job ad makes the absurdity visible in one glance; the termination letter, the new job description and the Monday script make it something to do this week.',
  caption: `You’re fired. From the job you should have left two years ago.

WANTED: Owner. Answer every email personally. Approve every quote, refund and discount. Cover every sick day. Fix what breaks, nights and weekends included. Also: strategy, if there’s time. Hours: all of them. Pay: whatever’s left.

You hired yourself for this job. Nobody else would take it. That’s not a badge; it’s a job description that needs rewriting.

Ten hours a week on the old job is 520 hours a year. Thirteen working weeks.

Write your termination letter: five duties, a successor for each, a last day for each. Then promote yourself to the part only you can do.

Which duty would you fire yourself from first?

The Unshakeable assessment, link in bio.`,
  tags: ['#founders', '#delegation', '#leadership', '#ceo', '#smallbusiness'],
  facts: [
    { claim: 'Ten hours a week is 520 hours a year, thirteen 40-hour weeks.', source: 'Arithmetic: 10 × 52 = 520; 520 ÷ 40 = 13. Ten hours is an example.' },
  ],
  slides: [
    { type: 'poster', stamp: 'Terminated', text: 'You’re fired.', xl: true, p: 'From the job you should have left two years ago.' },
    { type: 'jobad', title: 'The job you *hired yourself* for', head: 'WANTED: Owner', sub: 'Small business. Big hours. Growing fast.', items: [
      'Answer every email, call and message, personally', 'Approve every quote, refund and discount', 'Cover every sick day and every late delivery', 'Fix what breaks, nights and weekends included', 'Also: strategy, if there’s time'],
      meta: [['Hours', 'All of them'], ['Pay', 'Whatever’s left'], ['Holiday', 'Next year, probably']] },
    { type: 'poster', center: true, text: 'You hired yourself for this job. *Nobody else would take it.*', p: 'That’s not a badge. It’s a job description that needs rewriting.' },
    { type: 'diagram', title: 'The job you do. *The job only you can do.*',
      d: { kind: 'split', left: { h: 'Fire yourself from', items: ['Answering every question', 'Approving small spends', 'Fixing the same problem twice', 'Being everyone’s backup'] }, right: { h: 'Promote yourself to', items: ['Where the business goes', 'Who joins the team', 'What you charge, and why', 'The standard everyone keeps'] } } },
    { type: 'diagram', title: 'What the old job *costs a year*', text: 'Example: ten hours a week. Put in your own.',
      d: { kind: 'equation', head: 0, hl: [1], rows: [['Hours a week, old job', '×', 'Weeks', '=', 'Hours a year'], ['10', '×', '52', '=', '520'], ['{{yours}}', '×', '52', '=', '{{total}}']] },
      foot: '520 hours is *thirteen working weeks.*' },
    { type: 'steps', title: 'Write your *termination letter*', items: [
      { h: 'List five duties', p: 'Open last week’s calendar and messages. Write the five things you’re fired from.' },
      { h: 'Name a successor for each', p: 'A person, a tool, a checklist, or “nobody: we stop doing it”.' },
      { h: 'Set a last day for each', p: 'One date per duty, in your calendar, today.' }] },
    { type: 'template', title: 'Your new job description', label: 'Owner', lines: ['Starting {{date}}, responsible for: {{three things}}.', 'No longer responsible for: {{three things}}.', 'Hours: {{number}} a week. Saturdays: {{yours}}.'] },
    { type: 'script', title: 'Tell your team *on Monday*', lines: [
      { label: 'You', text: 'I’m changing my job. I’ve been the bottleneck, and that’s on me.' },
      { label: 'You', text: 'From today, {{name}} owns {{task}}. If you’d normally ask me, ask {{name}}.' },
      { label: 'You', text: 'I’m still here. I’ll be doing the part only I can do.' }] },
    { type: 'rule', kicker: 'The point', text: 'The founder who does everything *is the ceiling.* Promote yourself.', p: 'Your business can only grow as far as **the job you’re willing to leave.**' },
    { type: 'cta', question: 'Which duty would you *fire yourself from first?*', save: 'Send it to the founder who *answers every email.*' },
  ],
};
