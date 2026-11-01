# The Founder’s Blueprint · Options, ready to approve

*Prepared 1 Nov 2026 for Alexandru. Nothing here is built. Each option is written out in full, so it can be built the day you say yes. Reply with the letters you want (for example “D3 yes, D5 no, LP yes, C yes”).*

| | What it is | Where it would change | My recommendation |
| --- | --- | --- | --- |
| **LP** | The seven Launchpad actions that repeat a level become counts | `public/launchpad-plan.js` (the PDF) | Yes |
| **B** | Save the Launchpad plan online, so its numbers and process fill the Blueprint | a small table, a page like the Growth Plan | Yes, after LP |
| **C** | One “build it” screen after each chapter reading | `public/levels-v4.js`, the programme | Yes |
| **D** | The Growth Plan words as a ninth part of the Blueprint | My Blueprint page | Later |
| **D3** | One weekly review length: ten minutes everywhere | Level 09 text, Launchpad PDF | Yes |
| **D5** | One horizon: twelve weeks everywhere, not 90 days | Level 12 text | Yes |

---

## LP · The seven Launchpad actions, as counts

The Launchpad plan is the numbers. Where one of its actions repeats a level, it becomes a count that a later level acts on. Same format as the plan today (title, why, lines, done), same weeks, so the PDF keeps its 8 · 8 · 4 split. Every line starts by naming what to open (rule 1).

| Domain · week | Today | Becomes |
| --- | --- | --- |
| Lead yourself · 1 | Name your enough | **Name your enough** (the money part moves to Level 01, which asks it the same week) |
| Lead your people · 1 | Say one expectation out loud | **Count your clear asks** |
| Lead your people · 2 | Give one thing away | **Count what came back** |
| Lead your people · 2 | Ask for the truth | **Count the hard truths** |
| Lead your people · 3 | Name what someone did well | **Count your thanks** |
| Lead the market · 2 | Say your offer in one sentence | **Count where clients came from** |
| Lead the market · 2 | Make three asks | **Count your asks since Level 01** |

```js
// Lead yourself, week 1
{ w: 1, title: 'Name your enough', why: 'Without a number for enough, the business decides for you.',
  lines: ['Your enough in money goes into Level 01 this week. Here, the rest: ____ free evenings a week, and time for ________.',
    'Open last week’s calendar. Hours I worked: ____. From now on, at most ____ hours a week.'],
  done: 'two lines written, and read out loud to someone close to you.' },

// Lead your people, week 1
{ w: 1, title: 'Count your clear asks', why: 'A frustration is often a request that was never made clearly.',
  lines: ['Open last week’s messages. Requests I made: ____ · with a date: ____ · with a picture of “done”: ____.',
    'The one I will make again, clearly: ________, by ________.'],
  done: 'three numbers counted from your messages, not from memory.' },

// Lead your people, week 2
{ w: 2, title: 'Count what came back', why: 'The hours you hand over are the hours you can now lead with.',
  lines: ['The task I handed over in Level 01: ________.',
    'Open your calendar. Hours it took me the week before: ____. Hours it took me this week: ____.',
    'What I did with the hours I got back: ________.'],
  done: 'both numbers taken from your calendar, and one line on where the hours went.' },

// Lead your people, week 2
{ w: 2, title: 'Count the hard truths', why: 'If nobody tells you anything hard, it is not because there is nothing to say.',
  lines: ['Open this month’s messages and notes. People who told me something hard: ____. Who: ________.',
    'The last hard thing someone said, in their words: “________________.” What I did with it: ________.'],
  done: 'the number written, and the last hard thing in their own words.' },

// Lead your people, week 3
{ w: 3, title: 'Count your thanks', why: 'What you name, people repeat.',
  lines: ['Open this week’s messages. Thanks that named what someone did: ____ · a quick “thanks”: ____.',
    'Whose work I have not named yet: ________.'],
  done: 'both numbers counted from your messages.' },

// Lead the market, week 2
{ w: 2, title: 'Count where clients came from', why: 'Your next clients come the way your last ones did, until you choose otherwise.',
  lines: ['Open your invoices. My last ten clients: from a referral ____ · repeat ____ · my network ____ · online ____ · other ____.',
    'The way I never ask for, and could: ________.'],
  done: 'every client counted from your invoices, not from memory.' },

// Lead the market, week 2
{ w: 2, title: 'Count your asks since Level 01', why: 'Clients come from asking, not from being ready.',
  lines: ['Open your messages since Level 01. Asks made: ____ · yes: ____ · no: ____ · no answer: ____.',
    'The person I will ask again, kindly, this week: ________.'],
  done: 'four numbers counted, and one person asked again.' },
```

Then the levels act on these numbers: Level 04 (clear asks), Level 05 (thanks), Level 08 (the offer line), Level 11 (hard truths). No level asks the same number twice.

---

## B · The Launchpad plan, online

Today the twenty actions are a PDF. Online (like the Growth Plan, for full accounts), each blank is a field, saved to the device first and the account in batches (rule 8). Two parts of the Blueprint get fuller without a single new question:

| Blueprint part | Gets |
| --- | --- |
| Your money | Last month’s in, out and left; what one sale leaves you; your Monday number |
| Your systems | Your first process, in ten lines |
| Your people | Who carries the business (the map), and the counts above |
| Your sales | Your conversations, counted on three Fridays |

Cost: one table (`launchpad_word`, like `growth_word`), one API, the plan drawn as fields. About the size of the Growth Plan online work.

---

## C · Three “build it” screens, after each chapter reading

The two thinnest parts of the Blueprint are Your systems (4 domains) and Your next ninety days (3). One extra screen after each reading fills them from what the founder already wrote. One question each, one field on screen.

### After Chapter I · One process in ten lines (Your systems)

- **Why it matters:** A business that lives in your head stops when you do. The first process on paper is the first job that can leave your hands.
- **Tap:** The thing you do most often that someone else could do: *the task you handed over in Level 01* · *client onboarding* · *sending invoices* · *ordering stock* · *something else*
- **Write, one step per screen:** “Step 1: ___” and Enter for the next, up to ten. “That’s the last step” ends it.
- **Done when:** someone else followed the steps once, without asking you.
- **Yours to keep:** *The steps for {task}*: the numbered list, ready to print or share.

### After Chapter II · Your operations page (Your systems)

No new question: one page assembled from Levels 07–09.

| On the page | From |
| --- | --- |
| Who owns what, up to which limit, and when they call you | Level 09 · Lean on roles |
| What happens after a client says yes | Level 08 · Others in it |
| The task moving up the ladder, and by when | Level 07 · Own it |
| The cash page, the alert line, the weekly review | Level 09 · One page of cash, First things weekly |

- **One question:** Who gets a copy of this page? (a name)
- **Done when:** the page is printed or shared with {who}, and they read it.

### After Chapter III · Your ninety-day page (Your next ninety days)

One page from Level 12 and the reading: the number and its checkpoints, the market test, the person you grow, the action carried forward.

- **One question:** The one thing you will say no to for these ninety days. (a few words)
- **Why it matters:** A plan is as much what you stop as what you start.
- **Done when:** the page is on your wall or the first page of your Planner, and one person has heard your no.

Cost: three screens and one page view, built from answers already saved. No new saved keys beyond `w.v4.5.b.*`, `w.v4.9.b.*`, `w.v4.12.b.*`.

---

## D · The Growth Plan as a ninth part

For full accounts: the Growth Plan’s words (the truth you hide, the root, out loud, the fear, twelve weeks) as a ninth part of My Blueprint, “The inner side”. Reads what is already saved. Recommended later, once enough founders have written in their Growth Plan to see how it reads.

---

## D3 · Ten minutes, everywhere

| Where | Today | Becomes |
| --- | --- | --- |
| Level 09 · First things weekly, sentence | “I spend 30 minutes: look back, read the numbers, choose …” | “I spend ten minutes: look back, read the numbers, choose …” |
| Level 09 · First things weekly, “Where you struggle” | “Give it 30 minutes.” | “Give it ten minutes.” |
| Launchpad plan PDF, intro | “Every Sunday, five minutes: …” | “Every Sunday, ten minutes: …” |
| Growth Plan step 21 | “ten minutes” | unchanged |

No saved answer changes meaning.

## D5 · Twelve weeks, everywhere

| Where | Today | Becomes |
| --- | --- | --- |
| Level 12 · promise | “a 90-day number with checkpoints” | “a twelve-week number with checkpoints” |
| Level 12 · Rule of life, sentence and Exactly line | “In 90 days I will be known for …” | “In twelve weeks I will be known for …” |
| Level 12 · Scale the number, tap, slide, sentence | “for 90 days”, “in 90 days”, “In 90 days: …” | “for twelve weeks”, “in twelve weeks”, “In twelve weeks: …” |
| Level 12 · Scale the number, checkpoints | “day 30”, “day 60” | “week 4”, “week 8” |
| Level 12 · floor and title | “your next ninety days” · “Your ninety days” | “your next twelve weeks” · “Your twelve weeks” |
| My Blueprint, part 8 | “Your next ninety days” | “Your next twelve weeks” |
| The reading after Level 12 | “for the next ninety days” | “for the next twelve weeks” |

The saved checkpoints (`c1`, `c2`) keep their meaning: the first and second checkpoint.
