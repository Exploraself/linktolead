export default {
  id: 'c02',
  title: 'One list saved the plane',
  pillar: 'Lead people & business',
  cta: 'northstar',
  caption: `30 October 1935. A new four-engine bomber crashes on a test flight. Not a lack of skill: one step, missed.

The pilots didn’t ask for more training. They wrote a checklist. The plane went on to become the B-17.

Your business has its own gust lock: the step you skip because you know the job too well.

Write your first checklist this week: one process, ten lines. Then hand it to someone and watch.

Which job in your business still lives only in your head?

Start with the free North Star, link in bio.`,
  tags: ['#systems', '#leadership', '#smallbusiness', '#founders', '#history'],
  facts: [
    { claim: 'On 30 October 1935 the Boeing Model 299 crashed during an evaluation flight at Wright Field, Dayton, Ohio.', source: 'Atul Gawande, The Checklist Manifesto (2009), chapter 2; National Museum of the US Air Force, “Boeing Model 299” fact sheet.' },
    { claim: 'The cause was a control gust lock left engaged before take-off.', source: 'Same sources.' },
    { claim: 'A newspaper called it “too much airplane for one man to fly” (paraphrased on the slide).', source: 'Gawande, The Checklist Manifesto, chapter 2.' },
    { claim: 'Test pilots then created a pilot’s checklist; the Army Air Corps went on to order the plane, which became the B-17.', source: 'Gawande, chapter 2; National Museum of the US Air Force.' },
    { claim: 'Explaining a task again every week: 30 minutes × 52 weeks = 26 hours a year.', source: 'Arithmetic, illustrative numbers.' },
  ],
  slides: [
    { type: 'hook', art: 'clipboard', pre: '30 October 1935', title: 'One list', post: 'saved the plane.' },
    { type: 'story', title: 'A new bomber crashed on its *test flight.*', text: 'Experienced crew. Four engines, new controls. Some said it was too much plane for one person to fly.',
      card: { kind: 'doc', head: 'Model 299 · test flight', meta: 'Wright Field · 1935', rows: [['Crew', 'Experienced test pilots'], ['Aircraft', 'New, four engines'], ['Cause', '**Gust lock left on**', 'total']], stamp: 'Not a skill problem' },
      note: 'One small step, missed by people who knew the job by heart.', foot: 'The fix wasn’t more *training*.' },
    { type: 'story', title: 'The pilots wrote a *checklist.*', text: 'Short enough to use every single time. Take-off, flight, landing.',
      card: { kind: 'list', head: 'Before take-off', meta: 'illustration', items: [{ t: 'Controls free to move', done: true }, { t: 'Instruments set', done: true }, { t: 'Doors and hatches closed', done: true }, { t: 'Ready to roll' }] },
      note: 'The Army went on to order the plane. It became the B-17.', foot: 'Your business has its own *gust lock.*' },
    { type: 'diagram', title: 'Mistakes hide in the steps you know *too well*',
      d: { kind: 'flow', hl: [2], steps: [{ h: 'Expert', p: 'You know the job by heart.' }, { h: 'Routine', p: 'You stop looking at it.' }, { h: 'One step skipped', p: 'A small thing, missed once.' }, { h: 'A costly result', p: 'A late order. A lost client. An angry call.' }] } },
    { type: 'diagram', title: 'The arithmetic of *one page*',
      d: { kind: 'bars', items: [{ label: 'Explaining it again: 30 min × 52 weeks', value: 26, display: '26 h a year' }, { label: 'Writing ten lines, once', value: 1, display: '1 h', hl: true }] },
      text: 'Put in your own numbers. A machine can do this sum; *only you can pick the task.*' },
    { type: 'steps', title: 'Your first checklist: *one process, ten lines*',
      items: [{ h: 'Pick the job you repeat most', p: 'Open last week’s calendar. The task that shows up **three times or more**.' }, { h: 'Do it once, slowly', p: 'Write each step as you go. One line each, verb first: *Open, Check, Send.*' }, { h: 'Keep only what hurts when missed', p: 'A checklist is not a manual. Cut every step nobody skips.' }] },
    { type: 'template', title: 'Fill this in', label: 'My first checklist',
      lines: ['Job: {{the task}}', 'Done when: {{what finished looks like}}', 'Never skip: {{step}} {{step}} {{step}}', 'Owner: {{name}}  Checked by: {{name}}'],
      hint: 'Ten lines or fewer. If it needs more, it is two jobs.' },
    { type: 'checklist', title: 'Test it the way the pilots did',
      items: [['Hand it to someone else.'], ['They follow it once, without asking you.'], ['Every question they ask is a missing line. Add it.'], ['Done when they finish it *without you.*']] },
    { type: 'rule', kicker: 'The point', text: 'A checklist doesn’t replace judgement. *It frees it.*',
      p: 'A machine can follow a list. Deciding which steps matter, and holding people to them, **is the leadership.**' },
    { type: 'cta', question: 'Which job in your business still lives *only in your head?*' },
  ],
};
