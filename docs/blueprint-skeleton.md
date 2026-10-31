# The Founder’s Blueprint · Skeleton

*Draft for Alexandru’s approval · 31 Oct 2026 · Phase 2 of 4. Nothing here is live. Every question, option, scale and four-lines text below is read from `public/levels-v4.js` (Version 4); only what is new comes from `docs/blueprint-skeleton.data.mjs`.*

## Read this first

- **The spine stays.** Four domains, four moves (Tap · Slide · Write once · Four lines back), twelve words, three chapters, a reading after Levels 05, 09 and 12, a promise stated as things.
- **What is new is the end of each domain.** Every action now has a **day** (29 domains get a day screen) and a **Done when** you can check on Sunday, followed by one slide: how sure are you?
- **One question per screen.** Each blank of the sentence gets its own screen. Days are taps. Enter moves on.
- **Every Sunday counts.** From Level 02, a level opens by asking about last week’s four actions: Done, Partly, Not yet. The readings show what was done and how good the estimates were.
- **Nothing is asked twice.** Where the Launchpad plan or the Growth Plan already covers a step, the level shows that answer back or links to it. Seven Launchpad actions that repeat a level become counts (proposal).
- **Eight decisions are yours** (D1–D8, next). Saved answers keep their meaning: only new keys are added, so no migration.

## Decisions only you can make

|  | Question | What I found | My recommendation |
| --- | --- | --- | --- |
| D1 | How many 1:1 sessions, and where | The brief says two in Levels 04–12. The ladder on the site (public/content.js) says one in The Boardroom (04–05), two in the LAB, three in total with the HUB. | Two: Session 1 opens Level 04, Session 2 follows the Chapter II reading. Then the ladder copy changes to match (Phase 3). |
| D2 | Start with the weakest domain? | The level’s word is spelled one letter per domain, in order. | Keep the word order on screen. The weakest domain from the North Star gets the “Start here” mark, and its action becomes the week’s one move on the Planner’s Monday page. |
| D3 | How long is the weekly review? | Launchpad plan: 5 minutes. Growth Plan step 21: ten minutes. Level 09: 30 minutes. | Ten minutes, everywhere. A short review that happens beats a long one that does not. |
| D4 | Two things called “boardroom” | “The Boardroom” is the paid session for Levels 04–05. “Your inner boardroom” is the Sunday page of the Planner and Growth Plan step 21. | Keep both, always with their full names: “The Boardroom with Alexandru” and “your Sunday boardroom”. |
| D5 | Ninety days or twelve weeks? | Level 12 says 90 days. The Planner contract and Growth Plan step 5 say twelve weeks. The Planner’s reviews come every 13 weeks. | Say “twelve weeks” everywhere, Level 12 included. One horizon. |
| D6 | Level words that are also tool names | The book in public/library/built-to-lead.pdf lists 100 tools; three of its names are SEED, VIEW and FACT, with other meanings. | Keep the level words. The tool names never show on screen (rule 4). Rename the three tools in the book when it is next printed. |
| D7 | The Leading stage | The North Star has four stages; there are three manuals. Leading uses the Scaling manual today. | Keep it: Leading reads Scaling, with its own stage notes added only when you write them. |
| D8 | Book file names | public/library/built-to-lead.pdf is titled “100 Frameworks” (no byline); worth-building.pdf is “The Founder’s Manual · 32 frameworks”. | Tell me the right titles; quotes only come from books you confirm are yours. |

## The twelve weeks at a glance

| Week | Chapter | Level | Promise: by Sunday you will have | Part of | Also this week |
| --- | --- | --- | --- | --- | --- |
| 1 | The Inner Pyramid | 01 · SEED · What you believe | One old rule tested, one task handed over, your enough as a number, three people asked to buy. | The Founder Launchpad (free) | Launchpad plan, week 1 |
| 2 | The Inner Pyramid | 02 · VIEW · How you read it | One event written as facts, one person asked instead of judged, your five numbers read, one customer signal tested. | The Founder Launchpad (free) | Launchpad plan, week 2 |
| 3 | The Inner Pyramid | 03 · CALM · What you feel | One feeling named under the stress, one new first reaction, a storm rule written, one client’s fear in their own words. | The Founder Launchpad (free) | Launchpad plan, week 3 |
| 4 | The Inner Pyramid | 04 · STEP · What you do | One if–then plan kept, one clear ask with a date, your hour priced, a weekly selling hour booked. | The Boardroom | Session 1 opens it |
| 5 | The Inner Pyramid | 05 · FACT · What you became | One dated proof of who you are becoming, one person thanked specifically, one number read, three clients asked for their words. | The Boardroom | Chapter I reading |
| 6 | The Engine Room | 06 · TALK · The conversations you avoid | One postponed conversation held, one talk where you listened more, one late payment asked for, one kind no said. | Personal Leadership LAB | — |
| 7 | The Engine Room | 07 · HOUR · Your week | Protected hours in your calendar, one task one step up the ladder, your price floor, one marketing hour booked. | Personal Leadership LAB | — |
| 8 | The Engine Room | 08 · GOLD · Your offer | Your gift named and one thing dropped, three clear client steps, three price levels, your offer in one line. | Personal Leadership LAB | — |
| 9 | The Engine Room | 09 · FLOW · Your systems | A weekly review held, one area with an owner, one page of cash, your warm list written down. | Personal Leadership LAB | Chapter II reading; then Session 2 |
| 10 | The Open Market | 10 · NAME · Your first hundred names | Ten people contacted, one partner asked, your best client described, three customer conversations booked. | Business HUB | — |
| 11 | The Open Market | 11 · EDGE · Your advantage | Three people asked for honest feedback, one open question in a meeting, your advantage written with proof, three testimonials asked for. | Business HUB | — |
| 12 | The Open Market | 12 · RISE · Your ninety days | Your leader sentence written, one person given something to own, a 90-day number with checkpoints, one market test set. | Business HUB | Chapter III reading |
| 13 | — | The last Sunday | Level 12’s four actions checked, then the North Star again, to compare with where you began. | — | — |

## How one level runs, one question at a time

One field on screen. **Next** (or Enter) opens the next one. Number keys pick a tap, arrow keys move a slide. Typing comes last, in short blanks.

| # | Screen | What the founder does | Saved as |
| --- | --- | --- | --- |
| 1 | The level | Reads the word, the chapter and the promise. The North Star’s weakest domain is marked “Start here”. | — |
| 2 | Last week (from Level 02) | One screen per action of last week: Done · Partly · Not yet. Then one line back: “You were 70% sure. It happened: partly.” | `w.v4.<last level>.<d>.got` (new) |
| 3 | Old and new | Reads the level’s old sentence and its new one. | — |
| 4– | Per domain, in word order | Tap · Slide · one blank per screen · the day (if the sentence has none) · Done when + “how sure” · four lines back. | Version 4 keys, plus `on` and `sure` (new) |
| end | Your week | The four actions, each with its day and Done when, the Start-here one first. “Write these on your Planner’s Monday page: the first as My one move, the other three as Three goals.” | — |
| 05, 09, 12 | The chapter reading | Seven short screens (below), ending in one next move with a day. | `w.v4.<level>.r.carry`, `w.v4.<level>.r.on` (new) |

## How the pieces fit: one job each

| Piece | Its one job | What a level takes from it | What a level gives it |
| --- | --- | --- | --- |
| North Star (/northstar/) | Where you stand: 8 questions, 4 domains, your weakest. | The “Start here” domain each week; the stage for stage notes; the start point the readings compare with. | Retaken in week 13. |
| Growth Plan (North Star, 20 + 1) | The inner roots: the truth you hide, the root, out loud, the fear, twelve weeks. | Where a step is already written, its words show back (steps 6, 12, 16). | Done in a level ticks the matching step (8, 9, 13). |
| Launchpad plan (20 actions) | The numbers, in weeks 1–3. | The counts later levels act on (asks, thanks, conversations, cheapest hour). | — |
| Blueprint levels (12) | One week, four actions, each with a day and Done when. | — | The week’s four actions for the Planner. |
| Leader’s Growth Planner 2027 | The weekly rhythm: Monday plan, Sunday boardroom, estimates against reality. | Sunday’s Done · Partly · Not yet; the twelve-week contract. | Monday page: one move + three goals; the contract number (Level 12). |
| Library | Reading for your stage: 3 manuals, 3 books. | — | Each domain links to its manual section (Phase 4). |

## The principles underneath

Where each one lives. None is pasted on screen as a slogan.

| Principle | Where it lives |
| --- | --- |
| P.A.C.E. | The four moves of every domain: the tap pauses to name it, the slide assesses it, the sentence chooses, and the action with its day and “Done when” executes. The four lines read it back. |
| Inform. Reform. Transform. | The three chapters: the truth about you (I), the engine room rebuilt (II), the market coming to you (III). |
| Business is life, and life is business | Chapter I starts inside the founder. Every week mixes life and work: Level 01 is an evening off, a task handed over, a money move and three asks. The first reading quotes this page. |
| Stick to what you do best, and serve people | Level 08 (what you are best at, and one thing stopped) and Level 01 (asking to buy as service). The second reading quotes this page. |
| Unbalance for the balance | One domain leads each week (“Start here”, my one move), not four equal ones. Each reading names the lowest corner, and the next chapter leans there. |
| A time to push, a time to help | The “Done when” pushes: a day, checkable on Sunday. The Sunday check helps: “Not yet” is an answer, never a mark against you, and the next move carries it. The two sessions are where Alexandru and the team help. |
| Achievement is an act of kindness | Asking to buy (01), the money owed (06), the warm list moved (09): getting it done serves the people waiting on you. |
| Win with grace | The kind no with an alternative (06), feedback answered only with thank you (11), proof asked for in clients’ own words, never written for them (05, 11). |

## Chapter I · The Inner Pyramid

*The founder, from the base up: what you believe, how you read it, what you feel, what you do, what it makes of you.*

### Week 1 · Level 01 · SEED · What you believe

**Promise:** By Sunday you will have: One old rule tested, one task handed over, your enough as a number, three people asked to buy.  
**Floor:** Conviction · what you believe · **Part of:** The Founder Launchpad (free)  
**Old:** “This is just who I am.” **New:** “What I believe was learned. It can be tested and renewed.”  
**First screens:** the North Star result (Start here), then the promise.

#### S · Lead yourself · Settled

**Topic:** The rule that decides your worth

1. **Tap.** Finish the sentence that runs your work: “If I ___, then I’m worth something.”  
   Options: 1 hit my numbers · 2 work harder than everyone · 3 never let anyone down · 4 prove them wrong · 5 get it perfect
2. **Slide.** Last month, how often did that rule decide your day?  
   Scale 0 to 10, step 1; ends “Never” and “Every day”; starts at 5. Words: up to 2: rarely · 5: some days · 8: most days · 10: every day.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I am ___ before I achieve anything. On ___ I will ___.”
   - `who`: worth it, enough… (e.g. *enough*)
   - `day`: which day (e.g. *Thursday*) · day chips
   - `act`: one thing the old rule forbids (e.g. *take the evening off, phone in a drawer*)
4. **Done when** (shown, not typed): on *Thursday* you did “*take the evening off, phone in a drawer*”, and wrote one line on what really happened.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Last month the rule If I *hit my numbers*, then I’m worth something ran your day *most days*.
   - *Where you struggle. Don’t fight it.* It was learned, so it can be tested. Don’t argue with it. Test it once, on purpose.
   - *Where you shine. Don’t ignore it.* You named your rule in one sentence. That is the first lever, and you pulled it.
   - *What you will do. Exactly.* On *Thursday* you will *take the evening off, phone in a drawer*, and write what really happened. You are *enough* before you achieve anything.

**Links.** Growth Plan step 4: deepens (the voice that says you are not good enough). Planner: Monday page · The habit I’m fighting: the old rule, word for word. Manual for your stage · Level 01 · Lead yourself · Settled (anchor #l01-self, built in Phase 4).

#### E · Lead your people · Entrust

**Topic:** One task out of your hands

1. **Tap.** Finish it honestly: “People usually ___.”  
   Options: 1 let me down · 2 do it worse than I would · 3 need me to check everything · 4 rise when they are trusted
2. **Slide.** How much of last week’s work did you hold because “nobody else can do it right”?  
   Scale 0% to 100%, step 10; ends “None” and “All of it”; starts at 50. Words: 0% reads “some” · 50% reads “a lot” · 100% reads “almost all of it”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I hand ___ to ___ on ___. Done means ___.”
   - `task`: one task (e.g. *the weekly invoices*)
   - `who`: a name (e.g. *Marta*)
   - `day`: which day (e.g. *Monday*) · day chips
   - `done`: what finished looks like (e.g. *all sent by 5 pm*)
4. **Done when** (shown, not typed): *Marta* did *the weekly invoices* once, to “*all sent by 5 pm*”, and you checked it only once.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* About *60%* of last week, you held work because nobody else could do it right.
   - *Where you struggle. Don’t fight it.* You believe people usually *do it worse than I would*. Don’t fight the feeling. Test it in one small step.
   - *Where you shine. Don’t ignore it.* You named one task to let go. That is where trust starts.
   - *What you will do. Exactly.* On *Monday* you hand *the weekly invoices* to *Marta*. Done means *all sent by 5 pm*. You check once, not every hour.

**Links.** Growth Plan step 10: deepens. Launchpad plan, “Give one thing away”: proposed change, the same hand-over, a week later. The plan counts the hours it gave back instead. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 01 · Lead your people · Entrust (anchor #l01-people, built in Phase 4).

**Stage notes.** *Building:* No team yet? Hand it to a tool, a template, or a freelancer for two hours.

#### E · Lead your business · Enough

**Topic:** Money: the sentence you grew up with, and your enough

1. **Tap.** Which money sentence did you hear most growing up?  
   Options: 1 There is never enough · 2 Money is for greedy people · 3 We don’t talk about money · 4 Money proves you are someone · 5 Work hard and it will come
2. **Slide.** Money in, fixed costs, what was left last month: how sure are you of all three?  
   Scale 0 to 10, step 1; ends “Guessing” and “Exactly”; starts at 4. Words: up to 3: mostly guessing · 6: roughly · 8: quite sure · 10: certain.
3. **Write once**, one blank per screen, the sentence building above it:  
   “My enough is ___ a month. On ___ I will ___.”
   - `enough`: an amount (e.g. *€4,200*)
   - `day`: which day (e.g. *Wednesday*) · day chips
   - `move`: one money move (e.g. *raise my rate for new clients to €75*)
4. **Done when** (shown, not typed): on *Wednesday* you made one money move: *raise my rate for new clients to €75*.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You grew up with *There is never enough*, and you are *mostly guessing* about your own numbers.
   - *Where you struggle. Don’t fight it.* A guess becomes a number the day you open the statement. Don’t fight the fear; open it.
   - *Where you shine. Don’t ignore it.* You wrote your enough as one number. Now money has a finish line.
   - *What you will do. Exactly.* On *Wednesday* you will *raise my rate for new clients to €75*. Your enough is *€4,200* a month: a plan, not your worth.

**Links.** Growth Plan step 12: uses (if step 12 is written, its first line shows above the tap). Launchpad plan, “Name your enough”: proposed change, the money amount is asked here the same week. The plan keeps the time: free evenings and most hours a week. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 01 · Lead your business · Enough (anchor #l01-work, built in Phase 4).

#### D · Lead the market · Dignity

**Topic:** Asking someone to buy

1. **Tap.** When I ask someone to buy, I feel like I am…  
   Options: 1 begging · 2 bothering them · 3 showing off · 4 helping
2. **Slide.** In the last 30 days, how many times did you directly ask someone to buy or to book?  
   Scale 0 to 20, step 1; ends “None” and “20 or more”; starts at 2. Words: 0 reads “0 asks” · 10 reads “10 asks” · 20 reads “20 asks”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “My offer helps ___ with ___. By ___ I ask ___.”
   - `whom`: who (e.g. *café owners*)
   - `prob`: which problem (e.g. *empty tables on weekday afternoons*)
   - `day`: which day (e.g. *Friday*) · day chips
   - `names`: three names (e.g. *Luca, Sara and the bakery on Via Roma*)
4. **Done when** (shown, not typed): you asked *Luca, Sara and the bakery on Via Roma* by *Friday*, and wrote each answer word for word. A yes and a no both count.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *2 asks* in 30 days, and asking feels like *bothering them*.
   - *Where you struggle. Don’t fight it.* That feeling decides how often you ask. Don’t fight it. Let three real answers speak louder.
   - *Where you shine. Don’t ignore it.* You can say who you help, in one line: *café owners*, with *empty tables on weekday afternoons*.
   - *What you will do. Exactly.* By *Friday* you ask *Luca, Sara and the bakery on Via Roma*. Write what each one says, word for word.

**Links.** Growth Plan step 16: uses (the three names from step 16 are offered as taps). Growth Plan step 17: deepens. Launchpad plan, “Make three asks”: proposed change, the same three asks, the same fortnight. The plan counts asks, yes, no and no answer in week 3 instead. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 01 · Lead the market · Dignity (anchor #l01-market, built in Phase 4).

### Week 2 · Level 02 · VIEW · How you read it

**Promise:** By Sunday you will have: One event written as facts, one person asked instead of judged, your five numbers read, one customer signal tested.  
**Floor:** Reading · how you read what happens · **Part of:** The Founder Launchpad (free)  
**Old:** “I know what happened.” **New:** “I know what I saw. The rest is a story I can check.”  
**First screens:** last week’s four actions (Level 01): Done · Partly · Not yet; then the promise.

#### V · Lead yourself · Verify

**Topic:** Facts before the story

1. **Tap.** When something goes wrong, my first story is…  
   Options: 1 it’s my fault · 2 they did it on purpose · 3 it will all collapse · 4 I’ll never get this right
2. **Slide.** Last week, how often did the story come before the facts?  
   Scale 0 to 10, step 1; ends “Never” and “Every time”; starts at 5. Words: up to 2: rarely · 5: some days · 8: most days · 10: every day.
3. **Write once**, one blank per screen, the sentence building above it:  
   “The facts: ___. My story: ___. The truer reading: ___.”
   - `facts`: what a camera saw (e.g. *the client cancelled by email*)
   - `story`: what I told myself (e.g. *I’m not good enough*)
   - `truer`: what else could be true (e.g. *their budget was cut*)
4. **Day** (new screen, day chips): By which day will one more event be written this way?
5. **Done when** (shown, not typed): by *Friday*, one more event (the next thing that goes wrong, or the hardest moment of the week) is written as facts, story and a truer reading, before you acted on it.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your first story is *it’s my fault*, and it came before the facts *most days*.
   - *Where you struggle. Don’t fight it.* Stories are fast and feel true. Don’t fight that. Slow it down: facts first.
   - *Where you shine. Don’t ignore it.* You wrote facts and story apart. That is the whole skill.
   - *What you will do. Exactly.* Next time: facts “*the client cancelled by email*”, story “*I’m not good enough*”, and the truer reading, “*their budget was cut*”, before you act.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 02 · Lead yourself · Verify (anchor #l02-self, built in Phase 4).

#### I · Lead your people · Inquire

**Topic:** Ask before you judge

1. **Tap.** When someone lets me down, I usually…  
   Options: 1 decide why, without asking · 2 say nothing and remember · 3 fix it myself · 4 ask what happened
2. **Slide.** Out of 10 conclusions you drew about people last week, how many did you check by asking?  
   Scale 0 to 10, step 1; ends “None” and “All ten”; starts at 3. Words: up to 2: almost none · 5: a few · 8: most · 10: all of them.
3. **Write once**, one blank per screen, the sentence building above it:  
   “By ___ I ask ___: “When ___, what was going on for you?””
   - `day`: which day (e.g. *Tuesday*) · day chips
   - `who`: a name (e.g. *Andrea*)
   - `what`: what happened (e.g. *the order was late*)
4. **Done when** (shown, not typed): by *Tuesday* you asked *Andrea* the question, only listened, and wrote one line of what you heard.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* When people let you down, you *decide why, without asking*. Last week you checked *almost none* of your conclusions.
   - *Where you struggle. Don’t fight it.* Mind-reading feels quicker than asking. Don’t fight the habit. Ask once and compare.
   - *Where you shine. Don’t ignore it.* You chose one person and one real question. That is how trust is repaired.
   - *What you will do. Exactly.* By *Tuesday* you ask *Andrea*: “When *the order was late*, what was going on for you?” Then you only listen.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 02 · Lead your people · Inquire (anchor #l02-people, built in Phase 4).

#### E · Lead your business · Evidence

**Topic:** Your five numbers, on a fixed day

1. **Tap.** Most money decisions, I make…  
   Options: 1 by feel · 2 by today’s bank balance · 3 by a number I check · 4 by avoiding them
2. **Slide.** How many of these five do you know for last month: money in, money out, cash left, unpaid invoices, hours worked?  
   Scale 0 to 5, step 1; ends “None” and “All five”; starts at 2. Words: 0 reads “0 of 5” · 3 reads “3 of 5” · 5 reads “5 of 5”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Every ___ at ___ I read my five numbers. The one I fear most is ___.”
   - `day`: which day (e.g. *Monday*) · day chips
   - `time`: what time (e.g. *8:30*)
   - `fear`: which one (e.g. *cash left*)
4. **Done when** (shown, not typed): on *Monday* at *8:30* you read all five numbers, *cash left* first, and wrote them down.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You decide *by today’s bank balance*, and you know *2 of 5* of your numbers.
   - *Where you struggle. Don’t fight it.* Numbers feel like a verdict when worth is shaky. Don’t fight that. Read them anyway; they are information.
   - *Where you shine. Don’t ignore it.* You named the number you fear most. That is the first one to read.
   - *What you will do. Exactly.* Every *Monday* at *8:30* you read your five numbers, starting with *cash left*.

**Links.** Launchpad plan, “Read last month’s money”: uses, the statement you opened in week 1 holds four of the five. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 02 · Lead your business · Evidence (anchor #l02-work, built in Phase 4).

**Stage notes.** *Building:* No sales yet? Money in is zero: read it anyway, and add one more number, conversations held.

#### W · Lead the market · Watch signals

**Topic:** One customer signal, tested

1. **Tap.** When a customer goes quiet, I think…  
   Options: 1 they didn’t like it · 2 I was too pushy · 3 it’s timing · 4 I don’t know, I never asked
2. **Slide.** Of your last 10 “interested” people, how many paid?  
   Scale 0 to 10, step 1; ends “None” and “All ten”; starts at 2. Words: 0 reads “0 paid” · 5 reads “5 paid” · 10 reads “10 paid”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “The signal I’m testing: when a customer ___, it means ___. I check by ___.”
   - `does`: does what (e.g. *asks for the price twice*)
   - `means`: what you think (e.g. *they are close to yes*)
   - `check`: how (e.g. *asking them on Friday*)
4. **Day** (new screen, day chips): By which day will you have checked it once?
5. **Done when** (shown, not typed): by *Friday* you checked the signal once, by *asking them on Friday*, and wrote what the customer actually said.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Of 10 interested people, *2 paid*. When one goes quiet, you think *they didn’t like it*.
   - *Where you struggle. Don’t fight it.* Silence has many reasons. Don’t fight the worry. Test one signal this week.
   - *Where you shine. Don’t ignore it.* You chose one signal to test. That is reading the market, not your mood.
   - *What you will do. Exactly.* You watch for “*asks for the price twice*”, you believe it means *they are close to yes*, and you check by *asking them on Friday*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 02 · Lead the market · Watch signals (anchor #l02-market, built in Phase 4).

### Week 3 · Level 03 · CALM · What you feel

**Promise:** By Sunday you will have: One feeling named under the stress, one new first reaction, a storm rule written, one client’s fear in their own words.  
**Floor:** Emotion · what you feel, and do with it · **Part of:** The Founder Launchpad (free)  
**Old:** “Feelings get in the way.” **New:** “Feelings carry information. I name them, then I decide.”  
**First screens:** last week’s four actions (Level 02): Done · Partly · Not yet; then the promise.

#### C · Lead yourself · Call it

**Topic:** The feeling under the stress

1. **Tap.** Under “stressed”, the real feeling is most often…  
   Options: 1 afraid · 2 ashamed · 3 angry · 4 lonely · 5 tired
2. **Slide.** How strong is it on most days?  
   Scale 0 to 10, step 1; ends “Calm” and “Storm”; starts at 6. Words: up to 3: calm · 6: present · 8: heavy · 10: a storm.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Under my ___ is ___. When it comes, I ___.”
   - `surface`: stress, anger… (e.g. *stress*)
   - `feeling`: the real feeling (e.g. *fear of not paying the rent*)
   - `help`: one thing that helps (e.g. *walk ten minutes before I reply*)
4. **Day** (new screen, day chips): By which day will you have used it once?
5. **Done when** (shown, not typed): by *Friday*, the next time *fear of not paying the rent* came, you did this first: *walk ten minutes before I reply*. You wrote the day it happened.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Under the stress you mostly feel *afraid*, and most days it is *heavy*.
   - *Where you struggle. Don’t fight it.* A named feeling loosens its grip. Don’t fight it. Name it, then breathe, then decide.
   - *Where you shine. Don’t ignore it.* You found the feeling under the word. That is the hardest step.
   - *What you will do. Exactly.* When *fear of not paying the rent* comes, you *walk ten minutes before I reply*. Then you decide, not before.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 03 · Lead yourself · Call it (anchor #l03-self, built in Phase 4).

#### A · Lead your people · Atmosphere

**Topic:** Your first five seconds under pressure

1. **Tap.** Under pressure, the people around me see me…  
   Options: 1 snap · 2 go silent · 3 work alone · 4 stay steady
2. **Slide.** How safe is it for someone to bring you bad news?  
   Scale 0 to 10, step 1; ends “Not safe” and “Safe”; starts at 5. Words: up to 3: not safe · 6: sometimes safe · 8: mostly safe · 10: safe.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Under pressure, I will ___ instead of ___. I ask ___ to tell me when I slip.”
   - `will`: what you’ll do (e.g. *say “thank you for telling me” first*)
   - `instead`: what you do now (e.g. *sighing*)
   - `who`: a name (e.g. *Marta*)
4. **Day** (new screen, day chips): Which day will you ask Marta?
5. **Done when** (shown, not typed): you asked *Marta* on *Friday* to tell you when you slip, and under pressure you did this at least once: *say “thank you for telling me” first*.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Under pressure you *snap*, and bringing you bad news feels *sometimes safe*.
   - *Where you struggle. Don’t fight it.* People read your face before your plan. Don’t fight the pressure. Change the first five seconds.
   - *Where you shine. Don’t ignore it.* You chose one new first reaction. The room will notice in a week.
   - *What you will do. Exactly.* You will *say “thank you for telling me” first* instead of *sighing*, and *Marta* will tell you when you slip.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 03 · Lead your people · Atmosphere (anchor #l03-people, built in Phase 4).

**Stage notes.** *Building:* No team yet? The people around you are clients, partners and family. Ask one of them.

#### L · Lead your business · Lag

**Topic:** A rule for decisions in a storm

1. **Tap.** The decision I most often make in a storm  
   Options: 1 spending · 2 pricing · 3 hiring or firing · 4 quitting a project · 5 saying yes to everything
2. **Slide.** When you are upset, how many hours do you wait before a big decision?  
   Scale 0 to 48, step 2; ends “None” and “Two days”; starts at 0. Words: 0 reads “none” · 24 reads “24 hours” · 48 reads “48 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “When I feel ___ above 7 out of 10, I wait ___ hours before I decide about ___.”
   - `feel`: which feeling (e.g. *panic*)
   - `hours`: how many hours (e.g. *24*)
   - `about`: what (e.g. *money*)
4. **Day** (new screen, day chips): By which day will the rule be where you see it?
5. **Done when** (shown, not typed): by *Friday*, the rule is on your phone’s lock screen or on your desk, and one person knows it.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* In a storm you most often decide about *saying yes to everything*, and you wait *none* first.
   - *Where you struggle. Don’t fight it.* The storm will come again. Don’t fight it. Decide your rule now, while you are calm.
   - *Where you shine. Don’t ignore it.* You wrote a storm rule while calm. That is the lag.
   - *What you will do. Exactly.* When you feel *panic* above 7, you wait *24* hours before you decide about *money*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 03 · Lead your business · Lag (anchor #l03-work, built in Phase 4).

#### M · Lead the market · Meet their fear

**Topic:** Your client’s fear, in their words

1. **Tap.** My clients’ biggest fear is…  
   Options: 1 wasting money · 2 looking foolish · 3 losing time · 4 being let down again · 5 I don’t know
2. **Slide.** How sure are you, from their own words?  
   Scale 0 to 10, step 1; ends “Guessing” and “Their exact words”; starts at 3. Words: up to 3: mostly guessing · 6: roughly · 8: quite sure · 10: certain.
3. **Write once**, one blank per screen, the sentence building above it:  
   “My clients fear ___ and hope for ___. By ___ I ask ___ in their words.”
   - `fear`: their fear (e.g. *paying for nothing*)
   - `hope`: their hope (e.g. *full tables, without discounts*)
   - `day`: which day (e.g. *Thursday*) · day chips
   - `who`: a client (e.g. *Luca*)
4. **Done when** (shown, not typed): you asked *Luca* by *Thursday*, and wrote their fear and their hope in their own words.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You think your clients fear *wasting money*, and you are *mostly guessing*.
   - *Where you struggle. Don’t fight it.* People feel first and explain later. Don’t guess. Ask, and write their words.
   - *Where you shine. Don’t ignore it.* You named their fear and their hope. That is the start of every good message.
   - *What you will do. Exactly.* By *Thursday* you ask *Luca*. Then you speak to their fear of *paying for nothing* and their hope for *full tables, without discounts*, honestly.

**Links.** Launchpad plan, “Hear it in their words”: uses, ask one of the three people you heard in week 1, now about fear and hope. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 03 · Lead the market · Meet their fear (anchor #l03-market, built in Phase 4).

### Session 1 with Alexandru · Set the twelve weeks

**When:** Opens Level 04, before its first screen.  
**Before the call:** The North Star result, the answers of Levels 01 to 03, and the Launchpad plan counts. Alexandru and the team read them before the call.

1. Read the first three weeks together: which actions were Done, Partly, Not yet.
2. Name the one domain that costs the business most right now.
3. Set one number for the twelve weeks, with a date. It goes into the Planner’s twelve-week contract (Growth Plan step 5).
4. Write the first if–then plan of Level 04 together.

**Done when:** the number and its date are in your Planner’s twelve-week contract, and your first if–then is written.

### Week 4 · Level 04 · STEP · What you do

**Promise:** By Sunday you will have: One if–then plan kept, one clear ask with a date, your hour priced, a weekly selling hour booked.  
**Floor:** Deeds · how you manage action · **Part of:** The Boardroom  
**Old:** “I’ll do it when I feel ready.” **New:** “I decide once, in advance, and the day carries me.”  
**First screens:** last week’s four actions (Level 03): Done · Partly · Not yet; then the promise.

#### S · Lead yourself · Set it in advance

**Topic:** Decide once, in advance

1. **Tap.** What breaks my plans most  
   Options: 1 messages · 2 other people’s urgencies · 3 my mood · 4 perfectionism · 5 tiredness
2. **Slide.** Out of 10 plans you made last week, how many did you keep?  
   Scale 0 to 10, step 1; ends “None” and “All ten”; starts at 5. Words: up to 2: almost none · 5: a few · 8: most · 10: all of them.
3. **Write once**, one blank per screen, the sentence building above it:  
   “When ___, I will ___. If ___ shows up, then I ___.”
   - `when`: a moment (e.g. *I open my laptop*)
   - `will`: the action (e.g. *write for 45 minutes first*)
   - `if`: the obstacle (e.g. *a message pings*)
   - `then`: your answer (e.g. *answer at 11*)
4. **Day** (new screen, day chips): Which day will you use it first?
5. **Done when** (shown, not typed): you used the plan on *Friday* and on two more days, and wrote “kept” or “not kept” each time.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *messages* break your plans, and you kept *a few* of them last week.
   - *Where you struggle. Don’t fight it.* Willpower runs out by noon. Don’t fight it. Decide in advance.
   - *Where you shine. Don’t ignore it.* You wrote an if–then for your obstacle. That plan works on tired days too.
   - *What you will do. Exactly.* When *I open my laptop*, you *write for 45 minutes first*. If *a message pings*, then you *answer at 11*.

**Links.** Growth Plan step 3: deepens (two habits out). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 04 · Lead yourself · Set it in advance (anchor #l04-self, built in Phase 4).

#### T · Lead your people · Tell it clearly

**Topic:** One ask with a date and a done

1. **Tap.** My frustration with people is usually that they…  
   Options: 1 don’t finish · 2 do it differently · 3 don’t tell me · 4 wait for me
2. **Slide.** Out of 10 requests you made last week, how many had a clear “done” and a date?  
   Scale 0 to 10, step 1; ends “None” and “All ten”; starts at 3. Words: up to 2: almost none · 5: a few · 8: most · 10: all of them.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I ask ___ for ___ by ___. Done looks like ___.”
   - `who`: a name (e.g. *Andrea*)
   - `what`: what (e.g. *the supplier list*)
   - `when`: a date (e.g. *Wednesday noon*) · a date: day chips and “A date”
   - `done`: done (e.g. *one page, prices included*)
4. **Done when** (shown, not typed): *Andrea* has the ask in writing, with the date and the done, and on *Wednesday noon* you checked it once.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You get frustrated when people *don’t finish*, and *a few* of your requests were clear.
   - *Where you struggle. Don’t fight it.* A frustration is often a request you never made. Don’t fight it. Make the ask clear.
   - *Where you shine. Don’t ignore it.* You wrote one ask with a date and a “done”. Watch what changes.
   - *What you will do. Exactly.* You ask *Andrea* for *the supplier list* by *Wednesday noon*. Done looks like *one page, prices included*.

**Links.** Launchpad plan, “Say one expectation out loud”: proposed change, this level asks it with a date and a done. The plan counts last week’s clear asks instead. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 04 · Lead your people · Tell it clearly (anchor #l04-people, built in Phase 4).

#### E · Lead your business · Essential first

**Topic:** Your hour has a price

1. **Tap.** Where my hours go that are not mine  
   Options: 1 admin · 2 messages · 3 fixing others’ work · 4 low-paid jobs
2. **Slide.** Hours a week on work someone cheaper could do  
   Scale 0 to 40, step 1; ends “None” and “40 hours”; starts at 10. Words: 0 reads “0 hours” · 20 reads “20 hours” · 40 reads “40 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “My hour is worth ___. First, every day: ___. I hand back ___.”
   - `hour`: enough ÷ hours you want (e.g. *€35*)
   - `first`: your one priority (e.g. *two sales calls*)
   - `back`: one task (e.g. *the bookkeeping*)
4. **Day** (new screen, day chips): Which day will you hand back the bookkeeping?
5. **Done when** (shown, not typed): *two sales calls* came first on three days, and *the bookkeeping* was handed back by *Friday*.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *12 hours* a week go to *admin*.
   - *Where you struggle. Don’t fight it.* Busy feels like progress. Don’t fight that. Put a price on the hour.
   - *Where you shine. Don’t ignore it.* Few of your hours leak. Guard the first one of the day.
   - *What you will do. Exactly.* Your hour is worth *€35*. First comes *two sales calls*. You hand back *the bookkeeping*.

**Links.** Launchpad plan, “Find your cheapest hour”: uses, the cheapest hour found in week 2 is the first one to hand back. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 04 · Lead your business · Essential first (anchor #l04-work, built in Phase 4).

**Stage notes.** *Scaling:* Price your team’s hour too: what one hour of their work costs you.

#### P · Lead the market · Pace

**Topic:** A weekly selling hour

1. **Tap.** I look for clients…  
   Options: 1 only when it’s empty · 2 when I feel brave · 3 at a fixed time each week · 4 never, they find me
2. **Slide.** Buyer conversations per week right now  
   Scale 0 to 20, step 1; ends “None” and “20 a week”; starts at 1. Words: 0 reads “0 a week” · 10 reads “10 a week” · 20 reads “20 a week”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Every ___ at ___ I talk with ___ potential buyers. Everyone hears from me twice.”
   - `day`: which day (e.g. *Tuesday*) · day chips
   - `time`: what time (e.g. *9:00*)
   - `n`: how many (e.g. *3*)
4. **Done when** (shown, not typed): on *Tuesday* at *9:00* you talked with *3* potential buyers, and everyone heard from you twice.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You look for clients *only when it’s empty*, about *1 a week*.
   - *Where you struggle. Don’t fight it.* Delivery fills every free hour and the pipeline empties quietly. Don’t fight it. Book the hour.
   - *Where you shine. Don’t ignore it.* You set a day, a time and a number. That is a rhythm.
   - *What you will do. Exactly.* Every *Tuesday* at *9:00* you talk with *3* potential buyers, and everyone hears from you twice.

**Links.** Launchpad plan, “Count your conversations”: uses, the Friday count from week 3 is the number to beat. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 04 · Lead the market · Pace (anchor #l04-market, built in Phase 4).

### Week 5 · Level 05 · FACT · What you became

**Promise:** By Sunday you will have: One dated proof of who you are becoming, one person thanked specifically, one number read, three clients asked for their words.  
**Floor:** Outcome · what your results make of you · **Part of:** The Boardroom  
**Old:** “Results decide who I am.” **New:** “Results are feedback on who I am becoming.”  
**First screens:** last week’s four actions (Level 04): Done · Partly · Not yet; then the promise.

#### F · Lead yourself · Fruit is feedback

**Topic:** Proof of who you are becoming

1. **Tap.** The proof I see most since Level 01  
   Options: 1 I rest without guilt · 2 I decide faster · 3 I ask for money · 4 I stay calmer · 5 not yet
2. **Slide.** How much do you believe your new sentence from Level 01 today?  
   Scale 0 to 10, step 1; ends “Not at all” and “Fully”; starts at 6. Words: up to 3: a little · 6: half · 8: mostly · 10: fully.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I am becoming someone who ___. My proof: ___.”
   - `who`: who you are becoming (e.g. *decides calmly and asks for money*)
   - `proof`: one dated example (e.g. *14 Nov, I raised my rate and kept the client*)
4. **Day** (new screen, day chips): By which day will you add one more proof?
5. **Done when** (shown, not typed): by *Friday*, a second dated proof is written under the first.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Since Level 01: *I ask for money*. You believe your new sentence *half*.
   - *Where you struggle. Don’t fight it.* Old identities fade slowly. Don’t fight that. Keep collecting proof.
   - *Where you shine. Don’t ignore it.* You believe it more than half. Proof did that.
   - *What you will do. Exactly.* You are becoming someone who *decides calmly and asks for money*. Proof: *14 Nov, I raised my rate and kept the client*. Add one more this week.

**Links.** Shows back: Level 01 · your new sentence (“I am … before I achieve anything”). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 05 · Lead yourself · Fruit is feedback (anchor #l05-self, built in Phase 4).

#### A · Lead your people · Applaud

**Topic:** Thanks that names the thing

1. **Tap.** When people do well, I…  
   Options: 1 rarely say it · 2 say a quick thanks · 3 name exactly what they did · 4 pay them, that’s enough
2. **Slide.** Specific thanks you gave last week  
   Scale 0 to 10, step 1; ends “None” and “Ten”; starts at 1. Words: 0 reads “0 given” · 5 reads “5 given” · 10 reads “10 given”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I thank ___ for ___. It changed ___.”
   - `who`: a name (e.g. *Marta*)
   - `what`: what they did (e.g. *chasing the unpaid invoices*)
   - `changed`: what changed (e.g. *our cash this month*)
4. **Day** (new screen, day chips): Which day will you tell Marta?
5. **Done when** (shown, not typed): you told *Marta* on *Friday*, face to face or in writing, what they did and what it changed.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* When people do well, you *say a quick thanks*. Last week: *1 given*.
   - *Where you struggle. Don’t fight it.* People repeat what gets noticed. Don’t wait for big wins. Name the small ones.
   - *Where you shine. Don’t ignore it.* You named one win and what it changed. That is how people grow.
   - *What you will do. Exactly.* You thank *Marta* for *chasing the unpaid invoices*, and tell them it changed *our cash this month*.

**Links.** Launchpad plan, “Name what someone did well”: proposed change, this level does it. The plan counts specific thanks given in week 3 instead. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 05 · Lead your people · Applaud (anchor #l05-people, built in Phase 4).

#### C · Lead your business · Count

**Topic:** One number that tells the truth

1. **Tap.** The one number that tells the truth now  
   Options: 1 cash left · 2 money in · 3 profit per job · 4 hours worked · 5 new clients
2. **Slide.** Weeks in a row you have read it  
   Scale 0 to 12, step 1; ends “Never” and “12 weeks”; starts at 2. Words: 0 reads “0 weeks” · 6 reads “6 weeks” · 12 reads “12 weeks”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Every ___ I read ___. When it misses, I question ___, not only the tactic.”
   - `day`: which day (e.g. *Monday*) · day chips
   - `num`: the number (e.g. *cash left*)
   - `belief`: the belief behind it (e.g. *my fear of asking*)
4. **Done when** (shown, not typed): on *Monday* you read *cash left*, wrote it on your Planner’s Monday page, and, if it missed, one line on the belief behind it.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your truth number is *cash left*, read *2 weeks* in a row.
   - *Where you struggle. Don’t fight it.* A missed number is information, not a verdict. Don’t fight it. Ask what belief sits behind it.
   - *Where you shine. Don’t ignore it.* You chose one number. One, read weekly, beats ten read never.
   - *What you will do. Exactly.* Every *Monday* you read *cash left*. When it misses, you question *my fear of asking*.

**Links.** Launchpad plan, “Choose your Monday number”: uses, the same number: the slide asks how many weeks in a row you have read it. Planner: Monday page · the number, every week. Manual for your stage · Level 05 · Lead your business · Count (anchor #l05-work, built in Phase 4).

#### T · Lead the market · Testimony

**Topic:** Their words, not yours

1. **Tap.** Why clients really choose me (best guess)  
   Options: 1 price · 2 trust · 3 speed · 4 results · 5 I don’t know
2. **Slide.** Testimonials you have in writing  
   Scale 0 to 20, step 1; ends “None” and “20”; starts at 1. Words: 0 reads “0 in writing” · 10 reads “10 in writing” · 20 reads “20 in writing”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “When ___, my clients want to ___, so they can ___.”
   - `when`: their situation (e.g. *tables are empty midweek*)
   - `want`: what they want (e.g. *fill them without discounts*)
   - `so`: the result (e.g. *stop worrying about rent*)
4. **Day** (new screen, day chips): By which day will you ask three clients?
5. **Done when** (shown, not typed): you asked three clients by *Friday*, and wrote their answers word for word.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You think clients choose you for *trust*, and you have *1 in writing*.
   - *Where you struggle. Don’t fight it.* Your words sound like selling. Theirs sound like proof. Don’t write it yourself. Ask.
   - *Where you shine. Don’t ignore it.* You wrote their sentence. Now ask three clients to confirm it.
   - *What you will do. Exactly.* When *tables are empty midweek*, they want to *fill them without discounts*, so they can *stop worrying about rent*. You ask three clients by Friday.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 05 · Lead the market · Testimony (anchor #l05-market, built in Phase 4).

**Change from Version 4.** The “Exactly” line said “by Friday”. It now says “by {on}”, the day the founder chose.

### Chapter I reading · The Inner Pyramid (after Level 05)

One screen each, in this order. Actions counted: Levels 01 to 04 (16). Level 05’s four are checked when Level 06 opens.

1. **Where you were.** The Version 4 reading, unchanged: the four corners from your own slides, the lowest and the highest, four lines, and your own sentence to carry into the next chapter.
2. **What you did.** New. The chapter’s actions: how many Done, Partly, Not yet, from your Sunday answers.
3. **How you estimate.** New. Your “how sure” against what happened: too hopeful, about right, or too careful. The same three words as the Planner’s Sunday page.
4. **What you believed, what you believe now.** New. Each level’s old sentence and new sentence, side by side (Version 4 text).
5. **Where you began.** New. The domain the North Star told you to start with, against your lowest corner now.
6. **In his words.** New. One sentence from Alexandru, word for word from his book, with where it is found.
7. **Your next move.** New. Tap the one undone action that matters most, pick its day, and read its “Done when”. It is carried into next week next to the new level’s four, and asked about on Sunday like them.

**In his words:** “The way you run your day is the way you run your company. If you avoid your numbers at home, you will avoid them at work.” (Worth Building (the Library), page “Business is life, and life is business”).

## Chapter II · The Engine Room

*The business inside: conversations, time, your offer and its price, and systems that run without you.*

### Week 6 · Level 06 · TALK · The conversations you avoid

**Promise:** By Sunday you will have: One postponed conversation held, one talk where you listened more, one late payment asked for, one kind no said.  
**Floor:** Communication · the conversations you avoid · **Part of:** Personal Leadership LAB  
**Old:** “If I say it, it will get worse.” **New:** “What is unsaid costs more every week.”  
**First screens:** last week’s four actions (Level 05): Done · Partly · Not yet; then the promise.

#### T · Lead yourself · Truth first

**Topic:** The conversation you keep postponing

1. **Tap.** The conversation I keep postponing is about…  
   Options: 1 money owed · 2 a price · 3 a person’s work · 4 a partner · 5 my own limits
2. **Slide.** How many weeks have you postponed it?  
   Scale 0 to 26, step 1; ends “This week” and “Six months”; starts at 4. Words: 0 reads “0 weeks” · 13 reads “13 weeks” · 26 reads “26 weeks”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “On ___ I say to ___: “I need to talk about ___. What I see is ___. What I need is ___.””
   - `day`: which day (e.g. *Monday*) · day chips
   - `who`: a name (e.g. *Andrea*)
   - `about`: the topic (e.g. *deadlines*)
   - `see`: the facts (e.g. *three late orders*)
   - `need`: your ask (e.g. *a date you can keep*)
4. **Done when** (shown, not typed): the talk with *Andrea* happened on *Monday*, and you said the first sentence as you wrote it.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You have postponed a talk about *a person’s work* for *6 weeks*.
   - *Where you struggle. Don’t fight it.* It feels safer to wait. It isn’t; the cost grows. Don’t fight the fear. Say the first sentence.
   - *Where you shine. Don’t ignore it.* It’s only been *6 weeks*. Say it before it hardens.
   - *What you will do. Exactly.* On *Monday* you tell *Andrea*: “What I see is *three late orders*. What I need is *a date you can keep*.”

**Links.** Growth Plan step 6: uses (the person and the conversation named in step 6 show above the tap). Growth Plan step 8: feeds (Done here ticks step 8). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 06 · Lead yourself · Truth first (anchor #l06-self, built in Phase 4).

#### A · Lead your people · Ask, then listen

**Topic:** Ask, then listen

1. **Tap.** In hard talks I usually…  
   Options: 1 defend · 2 go quiet · 3 explain too much · 4 listen first
2. **Slide.** In your last hard talk, how much of the time did you speak?  
   Scale 0% to 100%, step 10; ends “None” and “All of it”; starts at 70. Words: 0% reads “less than half” · 50% reads “half” · 100% reads “most of it”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “In my next talk with ___ I ask “___” and speak less than half.”
   - `who`: a name (e.g. *Marta*)
   - `ask`: one open question (e.g. *What would make this easier for you?*)
4. **Day** (new screen, day chips): Which day is the talk with Marta?
5. **Done when** (shown, not typed): in the talk with *Marta* on *Friday* you asked “*What would make this easier for you?*”, and spoke less than half the time.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* In hard talks you *explain too much*, and you spoke *most of it* of the time.
   - *Where you struggle. Don’t fight it.* Talking feels like control. Don’t fight that urge. Ask, then count to three.
   - *Where you shine. Don’t ignore it.* You chose one open question. Questions open people.
   - *What you will do. Exactly.* With *Marta*, you ask “*What would make this easier for you?*” and speak less than half.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 06 · Lead your people · Ask, then listen (anchor #l06-people, built in Phase 4).

#### L · Lead your business · Late money

**Topic:** Money that is yours

1. **Tap.** The money talk I avoid is about…  
   Options: 1 an unpaid invoice · 2 a discount I regret · 3 extra work for free · 4 a supplier price
2. **Slide.** How much money is stuck there?  
   Scale €0 to €10,000, step €250; ends “€0” and “€10,000”; starts at 1500. Words: 0 reads “€0” · 5000 reads “€5,000” · 10000 reads “€10,000”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “By ___ I write to ___: “Invoice ___ was due on ___. Please pay by ___.””
   - `day`: which day (e.g. *Tuesday*) · day chips
   - `who`: a name (e.g. *Studio Rossi*)
   - `inv`: which invoice (e.g. *0412*)
   - `due`: the date (e.g. *1 Oct*)
   - `by`: a new date (e.g. *8 Nov*)
4. **Done when** (shown, not typed): the message went to *Studio Rossi* on *Tuesday*. Being paid by *8 Nov* is theirs to do; sending it was yours.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *€1,500* are stuck in *an unpaid invoice*.
   - *Where you struggle. Don’t fight it.* Asking for your own money feels rude. It isn’t. Don’t fight the discomfort. Send it.
   - *Where you shine. Don’t ignore it.* The amount is small. Clear it before it grows.
   - *What you will do. Exactly.* By *Tuesday* you write to *Studio Rossi*: invoice *0412*, due *1 Oct*, please pay by *8 Nov*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 06 · Lead your business · Late money (anchor #l06-work, built in Phase 4).

**Stage notes.** *Building:* Nothing unpaid? Take the work you did for free, and ask to be paid for it from now on.

#### K · Lead the market · Kind no

**Topic:** A kind no, with an alternative

1. **Tap.** The yes I should turn into a no  
   Options: 1 a client who isn’t a fit · 2 a free favour · 3 a discount request · 4 a project I don’t believe in
2. **Slide.** Hours a week on work you should have said no to  
   Scale 0 to 30, step 1; ends “None” and “30 hours”; starts at 6. Words: 0 reads “0 hours” · 15 reads “15 hours” · 30 reads “30 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I say no to ___, kindly: “This isn’t the right fit for ___. What I suggest is ___.””
   - `what`: what (e.g. *the 30% discount*)
   - `fit`: what (e.g. *what you need*)
   - `suggest`: an alternative (e.g. *the smaller package*)
4. **Day** (new screen, day chips): By which day will you say it?
5. **Done when** (shown, not typed): you said the kind no about *the 30% discount* by *Friday*, offered *the smaller package*, and added no discount.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *6 hours* a week go to *a discount request*.
   - *Where you struggle. Don’t fight it.* Every wrong yes is a no to the right client. Don’t fight the guilt. Offer an alternative.
   - *Where you shine. Don’t ignore it.* Few hours leak to wrong yeses. Keep that line.
   - *What you will do. Exactly.* You say no to *the 30% discount*, and suggest *the smaller package*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 06 · Lead the market · Kind no (anchor #l06-market, built in Phase 4).

### Week 7 · Level 07 · HOUR · Your week

**Promise:** By Sunday you will have: Protected hours in your calendar, one task one step up the ladder, your price floor, one marketing hour booked.  
**Floor:** Time · your week as an asset · **Part of:** Personal Leadership LAB  
**Old:** “There is never enough time.” **New:** “My hours have a price, and I decide who gets them.”  
**First screens:** last week’s four actions (Level 06): Done · Partly · Not yet; then the promise.

#### H · Lead yourself · Hold the line

**Topic:** Your best hours, guarded

1. **Tap.** What eats my best hours  
   Options: 1 messages · 2 meetings · 3 delivery · 4 admin · 5 other people’s urgencies
2. **Slide.** Hours of deep, focused work last week  
   Scale 0 to 30, step 1; ends “None” and “30 hours”; starts at 4. Words: 0 reads “0 hours” · 15 reads “15 hours” · 30 reads “30 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “My best hours are ___ to ___ on ___. Nothing goes there but ___.”
   - `from`: from (e.g. *8:00*)
   - `to`: to (e.g. *10:30*)
   - `days`: which days (e.g. *Monday to Thursday*)
   - `what`: what (e.g. *selling and building*)
4. **Done when** (shown, not typed): the hours from *8:00* to *10:30* are in your calendar for the next four weeks, and you kept them this week, *Monday to Thursday*.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *messages* eat your best hours. Last week you had *4 hours* of deep work.
   - *Where you struggle. Don’t fight it.* The urgent always shouts. Don’t fight it. Give it a later hour.
   - *Where you shine. Don’t ignore it.* You named your best hours. Now they have a guard.
   - *What you will do. Exactly.* From *8:00* to *10:30*, *Monday to Thursday*, only *selling and building*.

**Links.** Growth Plan step 15: deepens (a half-day without you). Launchpad plan, “Guard one block”: deepens, one block in week 2; here, your best hours, every week. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 07 · Lead yourself · Hold the line (anchor #l07-self, built in Phase 4).

#### O · Lead your people · Own it

**Topic:** One task, one step up

1. **Tap.** The task I hold most is at this step  
   Options: 1 I do it · 2 I do it, they watch · 3 they do it, I check · 4 they own it
2. **Slide.** Hours a week that task takes  
   Scale 0 to 20, step 1; ends “None” and “20 hours”; starts at 5. Words: 0 reads “0 hours” · 10 reads “10 hours” · 20 reads “20 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “By ___, ___ moves up one step: from “___” to “___”.”
   - `day`: a date (e.g. *30 Nov*)
   - `task`: the task (e.g. *the weekly orders*)
   - `from`: the step now (e.g. *I do it*)
   - `to`: the next step (e.g. *they do it, I check*)
4. **Day** (new screen, day chips): Which day this week will it run that way for the first time?
5. **Done when** (shown, not typed): on *Friday*, *the weekly orders* ran once at “*they do it, I check*”, and *30 Nov* is in your calendar as the day it stays there.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your biggest task is at “*I do it*”, and it takes *5 hours* a week.
   - *Where you struggle. Don’t fight it.* Letting go feels like losing quality. Don’t fight that. Move up one step, not four.
   - *Where you shine. Don’t ignore it.* It’s already shared. Finish the last step.
   - *What you will do. Exactly.* By *30 Nov*, *the weekly orders* moves from “*I do it*” to “*they do it, I check*”.

**Links.** Shows back: Level 01 · the task you handed over (Entrust). Growth Plan step 10: uses. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 07 · Lead your people · Own it (anchor #l07-people, built in Phase 4).

**Stage notes.** *Building:* No team? The next step is a template or a tool doing it, and you checking.

#### U · Lead your business · Unit cost

**Topic:** The price you never go below

1. **Tap.** What I sell most is priced…  
   Options: 1 by the hour · 2 per job · 3 as a package · 4 by guess
2. **Slide.** Hours a typical job really takes, start to finish  
   Scale 0 to 40, step 1; ends “0” and “40 hours”; starts at 6. Words: 0 reads “0 hours” · 20 reads “20 hours” · 40 reads “40 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “One job costs me ___ plus ___ hours × ___ = ___. I never sell it below ___.”
   - `mat`: materials and fees (e.g. *€80*)
   - `hrs`: hours (e.g. *6*)
   - `rate`: my hour (e.g. *€35*)
   - `total`: the total (e.g. *€290*)
   - `floor`: your floor (e.g. *€350*)
4. **Day** (new screen, day chips): By which day will the floor be written next to your prices?
5. **Done when** (shown, not typed): *€350* is written next to your price list by *Friday*, and your next quote was at or above it.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You price *by guess*, and a job really takes *6 hours*.
   - *Where you struggle. Don’t fight it.* Most underpricing hides in the hours you don’t count. Don’t fight the number. Write it down.
   - *Where you shine. Don’t ignore it.* You know the real hours. Now price from them.
   - *What you will do. Exactly.* One job costs you *€290*. You never sell it below *€350*.

**Links.** Launchpad plan, “Know your number”: uses, what one sale leaves you, from week 1. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 07 · Lead your business · Unit cost (anchor #l07-work, built in Phase 4).

#### R · Lead the market · Rhythm

**Topic:** One marketing hour a week

1. **Tap.** Where my buyers already gather  
   Options: 1 Instagram · 2 LinkedIn · 3 my neighbourhood · 4 other businesses · 5 I don’t know
2. **Slide.** Hours a week you spend finding buyers  
   Scale 0 to 10, step 1; ends “None” and “10 hours”; starts at 1. Words: 0 reads “0 hours” · 5 reads “5 hours” · 10 reads “10 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Every ___ from ___ to ___ I ___ on ___.”
   - `day`: which day (e.g. *Wednesday*) · day chips
   - `from`: from (e.g. *9:00*)
   - `to`: to (e.g. *10:00*)
   - `act`: one marketing action (e.g. *post one client story*)
   - `where`: where (e.g. *Instagram*)
4. **Done when** (shown, not typed): on *Wednesday*, from *9:00* to *10:00*, you did “*post one client story*” on *Instagram*, and the hour is in your calendar for four weeks.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your buyers gather on *Instagram*, and you give it *1 hours* a week.
   - *Where you struggle. Don’t fight it.* Marketing done only when it’s empty comes too late. Don’t fight that. Fix the hour.
   - *Where you shine. Don’t ignore it.* You booked one hour with one action. That compounds.
   - *What you will do. Exactly.* Every *Wednesday*, *9:00* to *10:00*, you *post one client story* on *Instagram*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 07 · Lead the market · Rhythm (anchor #l07-market, built in Phase 4).

### Week 8 · Level 08 · GOLD · Your offer

**Promise:** By Sunday you will have: Your gift named and one thing dropped, three clear client steps, three price levels, your offer in one line.  
**Floor:** Value · your offer and its price · **Part of:** Personal Leadership LAB  
**Old:** “I do a bit of everything.” **New:** “I am paid for what I do best, at a price that respects both of us.”  
**First screens:** last week’s four actions (Level 07): Done · Partly · Not yet; then the promise.

#### G · Lead yourself · Gift

**Topic:** What you are best at, and what to stop

1. **Tap.** What people thank me for most  
   Options: 1 solving problems · 2 teaching · 3 making things · 4 organising · 5 calming people down
2. **Slide.** How much of your paid work uses that gift?  
   Scale 0% to 100%, step 10; ends “None” and “All of it”; starts at 40. Words: 0% reads “little of it” · 50% reads “part of it” · 100% reads “most of it”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I am best at ___. People pay me for ___. I stop selling ___.”
   - `best`: your gift (e.g. *turning chaos into a plan*)
   - `pay`: what they pay for (e.g. *calm, organised openings*)
   - `stop`: one thing (e.g. *one-off logo jobs*)
4. **Day** (new screen, day chips): By which day will you stop selling one-off logo jobs?
5. **Done when** (shown, not typed): by *Friday*, *one-off logo jobs* came off your price list or offer page, or you said no to one request.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* People thank you for *solving problems*, and *40%* of your paid work uses it.
   - *Where you struggle. Don’t fight it.* Doing everything feels safe. It hides your best work. Don’t fight that. Drop one thing.
   - *Where you shine. Don’t ignore it.* You named your gift and what to stop. That is an offer forming.
   - *What you will do. Exactly.* You sell *calm, organised openings*, built on *turning chaos into a plan*, and stop selling *one-off logo jobs*.

**Links.** Growth Plan step 11: deepens (where you play small). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 08 · Lead yourself · Gift (anchor #l08-self, built in Phase 4).

#### O · Lead your people · Others in it

**Topic:** Three clear steps after yes

1. **Tap.** Where clients wait or get confused  
   Options: 1 at the start · 2 during delivery · 3 at payment · 4 after it’s done
2. **Slide.** Steps from “yes” to delivered  
   Scale 1 to 15, step 1; ends “1” and “15”; starts at 7. Words: 1 reads “1 steps” · 8 reads “8 steps” · 15 reads “15 steps”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “After a client says yes, they get: 1 ___, 2 ___, 3 ___. ___ handles step ___.”
   - `s1`: step one (e.g. *a welcome call*)
   - `s2`: step two (e.g. *a plan in 48 hours*)
   - `s3`: step three (e.g. *a weekly update*)
   - `who`: a name (e.g. *Marta*)
   - `which`: which step (e.g. *3*)
4. **Day** (new screen, day chips): By which day will the three steps be written?
5. **Done when** (shown, not typed): by *Friday*, the three steps are in the message every new client gets, and *Marta* knows step *3* is theirs.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Clients get confused *at the start*, across *9 steps*.
   - *Where you struggle. Don’t fight it.* Confusion costs referrals. Don’t fight it. Show them three clear steps.
   - *Where you shine. Don’t ignore it.* You wrote three steps and an owner. Clients feel led.
   - *What you will do. Exactly.* Yes, then *a welcome call*, *a plan in 48 hours*, *a weekly update*. *Marta* owns step *3*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 08 · Lead your people · Others in it (anchor #l08-people, built in Phase 4).

**Stage notes.** *Building:* No clients yet? Write the three steps for your first one, and walk a friend through them.

#### L · Lead your business · Levels

**Topic:** Three price levels

1. **Tap.** How I set prices now  
   Options: 1 same as others · 2 by the hour · 3 by feel · 4 from my costs and value
2. **Slide.** How confident are you saying your price out loud?  
   Scale 0 to 10, step 1; ends “I mumble” and “I say it calmly”; starts at 4. Words: up to 3: mostly guessing · 6: roughly · 8: quite sure · 10: certain.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Essential: ___ at ___. Complete: ___ at ___. Premium: ___ at ___.”
   - `e1`: what’s in it (e.g. *the plan*)
   - `p1`: price (e.g. *€390*)
   - `e2`: what’s in it (e.g. *plan and launch*)
   - `p2`: price (e.g. *€890*)
   - `e3`: what’s in it (e.g. *done with you, 3 months*)
   - `p3`: price (e.g. *€2,400*)
4. **Day** (new screen, day chips): By which day will the three levels be on your offer page?
5. **Done when** (shown, not typed): by *Friday*, the three levels are on your offer page or price list, and you said them out loud once to a buyer.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You price *by feel*, and you say it out loud *roughly*.
   - *Where you struggle. Don’t fight it.* A single price forces a yes or no. Don’t fight that. Give three choices.
   - *Where you shine. Don’t ignore it.* You built three levels. Most people choose the middle.
   - *What you will do. Exactly.* Essential at *€390*, Complete at *€890*, Premium at *€2,400*.

**Links.** Growth Plan step 13: feeds (saying the price out loud is step 13). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 08 · Lead your business · Levels (anchor #l08-work, built in Phase 4).

#### D · Lead the market · Desire

**Topic:** Your offer in one line

1. **Tap.** What my customer wants most  
   Options: 1 time back · 2 more money · 3 less worry · 4 to look good · 5 better health
2. **Slide.** Could a customer repeat your offer after hearing it once?  
   Scale 0 to 10, step 1; ends “No” and “Word for word”; starts at 4. Words: up to 3: not really · 6: roughly · 8: mostly · 10: word for word.
3. **Write once**, one blank per screen, the sentence building above it:  
   “For ___ who ___, I ___, so they ___, within ___.”
   - `who`: who (e.g. *café owners*)
   - `pain`: their problem (e.g. *have empty weekdays*)
   - `do`: what you do (e.g. *fill tables with local events*)
   - `gain`: their result (e.g. *stop discounting*)
   - `time`: how long (e.g. *60 days*)
4. **Day** (new screen, day chips): By which day will you have said it to three people?
5. **Done when** (shown, not typed): by *Friday*, you said the line to three people the same way, and one could say it back.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your customer wants *less worry*, and could repeat your offer *roughly*.
   - *Where you struggle. Don’t fight it.* A clever offer gets admired. A clear one gets bought. Don’t fight for clever.
   - *Where you shine. Don’t ignore it.* You wrote your offer in one line. Say it the same way every time.
   - *What you will do. Exactly.* For *café owners* who *have empty weekdays*: you *fill tables with local events*, so they *stop discounting*, within *60 days*.

**Links.** Shows back: Level 01 · who you help, and with what (Dignity). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 08 · Lead the market · Desire (anchor #l08-market, built in Phase 4).

### Week 9 · Level 09 · FLOW · Your systems

**Promise:** By Sunday you will have: A weekly review held, one area with an owner, one page of cash, your warm list written down.  
**Floor:** Systems · a business that runs without you · **Part of:** Personal Leadership LAB  
**Old:** “If I’m not there, it stops.” **New:** “A good system carries the business on my worst day.”  
**First screens:** last week’s four actions (Level 08): Done · Partly · Not yet; then the promise.

#### F · Lead yourself · First things weekly

**Topic:** A weekly review you keep

1. **Tap.** When I plan my week  
   Options: 1 never · 2 as it comes · 3 Monday morning · 4 Sunday evening
2. **Slide.** Weekly promises to yourself kept last week, out of 10  
   Scale 0 to 10, step 1; ends “None” and “All ten”; starts at 5. Words: up to 2: almost none · 5: a few · 8: most · 10: all of them.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Every ___ at ___ I spend 30 minutes: look back, read the numbers, choose ___ priorities.”
   - `day`: which day (e.g. *Friday*) · day chips
   - `time`: what time (e.g. *16:00*)
   - `three`: how many priorities (e.g. *three*)
4. **Done when** (shown, not typed): on *Friday* at *16:00* you held the review and wrote *three* priorities on your Planner’s Monday page.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You plan *as it comes*, and kept *a few* of your promises.
   - *Where you struggle. Don’t fight it.* Without a review, the week plans you. Don’t fight the mess. Give it 30 minutes.
   - *Where you shine. Don’t ignore it.* You keep most promises. A review will make it all of them.
   - *What you will do. Exactly.* Every *Friday* at *16:00*: look back, read the numbers, choose *three* priorities.

**Links.** Growth Plan step 21: uses (the inner boardroom is the review). Planner: Sunday page · what really happened; Monday page · three goals. Manual for your stage · Level 09 · Lead yourself · First things weekly (anchor #l09-self, built in Phase 4).

**Change from Version 4.** The sentence said “30 minutes”. Proposed: “ten minutes”, the same as Growth Plan step 21. Decision D3.

#### L · Lead your people · Lean on roles

**Topic:** One area with an owner

1. **Tap.** If I were sick for a week…  
   Options: 1 the business stops · 2 things slow down · 3 most of it runs · 4 it runs fine
2. **Slide.** Tasks only you can do today  
   Scale 0 to 20, step 1; ends “None” and “20”; starts at 9. Words: 0 reads “0 tasks” · 10 reads “10 tasks” · 20 reads “20 tasks”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “___ owns ___. They decide alone up to ___. They call me when ___.”
   - `who`: a name (e.g. *Marta*)
   - `owns`: an area (e.g. *orders and suppliers*)
   - `limit`: a limit (e.g. *€500*)
   - `call`: when (e.g. *a client complains*)
4. **Day** (new screen, day chips): By which day will Marta know?
5. **Done when** (shown, not typed): by *Friday*, *Marta* has it in writing: they own *orders and suppliers* up to *€500*, and one decision was made without you.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* If you were sick, *the business stops*. *9 tasks* sit with you alone.
   - *Where you struggle. Don’t fight it.* Being needed feels good. It is also a ceiling. Don’t fight it. Give one area an owner.
   - *Where you shine. Don’t ignore it.* You gave one area an owner and a limit. That is a system.
   - *What you will do. Exactly.* *Marta* owns *orders and suppliers*, decides up to *€500*, and calls you when *a client complains*.

**Links.** Growth Plan step 9: feeds (one decision made without you). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 09 · Lead your people · Lean on roles (anchor #l09-people, built in Phase 4).

**Stage notes.** *Building:* No team? Name the tool, template or freelancer that owns the area, and what you still check.

#### O · Lead your business · One page of cash

**Topic:** One page of cash

1. **Tap.** What I check every week  
   Options: 1 nothing · 2 the bank balance · 3 sales · 4 money in, out and left
2. **Slide.** Months you could pay all costs if sales stopped today  
   Scale 0 to 12, step 1; ends “0” and “12 months”; starts at 2. Words: 0 reads “0 months” · 6 reads “6 months” · 12 reads “12 months”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Every ___: money in ___, money out ___, left ___. My alert line is ___.”
   - `day`: which day (e.g. *Monday*) · day chips
   - `in`: amount (e.g. *€6,200*)
   - `out`: amount (e.g. *€4,900*)
   - `left`: amount (e.g. *€1,300*)
   - `alert`: the minimum (e.g. *€3,000 in the bank*)
4. **Done when** (shown, not typed): on *Monday* the page shows this week’s in, out and left, and you know what you do below *€3,000 in the bank*.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You check *the bank balance*, and you have *2 months* of runway.
   - *Where you struggle. Don’t fight it.* Cash surprises kill good businesses. Don’t fight the number. Look every week.
   - *Where you shine. Don’t ignore it.* You wrote one page of cash and an alert line. No more surprises.
   - *What you will do. Exactly.* Every *Monday*: in *€6,200*, out *€4,900*, left *€1,300*. Below *€3,000 in the bank*, you act that day.

**Links.** Launchpad plan, “Read last month’s money”: deepens, once in week 1; here, every week, with an alert line. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 09 · Lead your business · One page of cash (anchor #l09-work, built in Phase 4).

#### W · Lead the market · Warm list

**Topic:** A warm list you can see

1. **Tap.** Where my last five clients came from  
   Options: 1 referrals · 2 social media · 3 ads · 4 my network · 5 repeat clients
2. **Slide.** Warm conversations open right now  
   Scale 0 to 30, step 1; ends “None” and “30”; starts at 3. Words: 0 reads “0 open” · 15 reads “15 open” · 30 reads “30 open”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “My warm list has ___ names. Every ___ I move ___ of them one step closer, from ___ to ___.”
   - `n`: how many names (e.g. *12*)
   - `day`: which day (e.g. *Tuesday*) · day chips
   - `m`: how many (e.g. *3*)
   - `from`: a step (e.g. *met*)
   - `to`: the next step (e.g. *a call booked*)
4. **Done when** (shown, not typed): the *12* names are written down, and on *Tuesday* you moved *3* of them one step.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your clients come from *referrals*, and you have *3 open*.
   - *Where you struggle. Don’t fight it.* A list in your head is a list you forget. Don’t fight that. Write it down.
   - *Where you shine. Don’t ignore it.* You wrote your warm list. It is now a system, not a hope.
   - *What you will do. Exactly.* Every *Tuesday* you move *3* of your *12* names from *met* to *a call booked*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 09 · Lead the market · Warm list (anchor #l09-market, built in Phase 4).

**Stage notes.** *Scaling:* Each person who sells keeps their own list; you read the total every week.

### Chapter II reading · The Engine Room (after Level 09)

One screen each, in this order. Actions counted: Levels 05 to 08 (16). Then Session 2.

1. **Where you were.** The Version 4 reading, unchanged: the four corners from your own slides, the lowest and the highest, four lines, and your own sentence to carry into the next chapter.
2. **What you did.** New. The chapter’s actions: how many Done, Partly, Not yet, from your Sunday answers.
3. **How you estimate.** New. Your “how sure” against what happened: too hopeful, about right, or too careful. The same three words as the Planner’s Sunday page.
4. **What you believed, what you believe now.** New. Each level’s old sentence and new sentence, side by side (Version 4 text).
5. **Where you began.** New. The domain the North Star told you to start with, against your lowest corner now.
6. **In his words.** New. One sentence from Alexandru, word for word from his book, with where it is found.
7. **Your next move.** New. Tap the one undone action that matters most, pick its day, and read its “Done when”. It is carried into next week next to the new level’s four, and asked about on Sunday like them.

**In his words:** “Stick to what you do best, and serve people. The money follows the service, not the other way round.” (Worth Building (the Library), page “The 50/50 rule”).

### Session 2 with Alexandru · Open the market

**When:** After the Chapter II reading (end of Level 09), before Level 10.  
**Before the call:** The Chapter II reading, your offer line (Level 08), your three price levels and your warm list (Level 09).

1. Read the Chapter II reading together: what moved, what did not.
2. Say the offer line and the three prices out loud, and fix what stumbles.
3. Choose the first ten names from the warm list for Level 10.
4. Draft the 90-day number that Level 12 makes final.

**Done when:** ten names are chosen for Level 10, and a first draft of the 90-day number is written.

## Chapter III · The Open Market

*The business outside: reach, advantage and leadership, so the market comes to you.*

### Week 10 · Level 10 · NAME · Your first hundred names

**Promise:** By Sunday you will have: Ten people contacted, one partner asked, your best client described, three customer conversations booked.  
**Floor:** Reach · your first hundred names · **Part of:** Business HUB  
**Old:** “I don’t know anyone.” **New:** “I know more people than I think, and each knows more.”  
**First screens:** last week’s four actions (Level 09): Done · Partly · Not yet; then the promise.

#### N · Lead yourself · Network

**Topic:** People you already know

1. **Tap.** What stops me reaching out  
   Options: 1 fear of a no · 2 not wanting to bother · 3 no time · 4 not knowing who
2. **Slide.** People in your phone who fit your client, or know one  
   Scale 0 to 100, step 5; ends “None” and “100”; starts at 20. Words: 0 reads “0 people” · 50 reads “50 people” · 100 reads “100 people”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “This week I contact ___ people I already know, starting with ___. I say: “___””
   - `n`: how many (e.g. *10*)
   - `first`: a name (e.g. *Giulia*)
   - `say`: your opening line (e.g. *I’m helping cafés fill midweek tables. Who do you know?*)
4. **Day** (new screen, day chips): By which day will the messages be sent?
5. **Done when** (shown, not typed): by *Friday*, *10* messages are sent, starting with *Giulia*, and you counted the replies.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *fear of a no* stops you, and you know *20 people* who fit.
   - *Where you struggle. Don’t fight it.* Reaching out feels like begging. It is service. Don’t fight the nerves. Send the first ten.
   - *Where you shine. Don’t ignore it.* You wrote your opening line. The rest is repetition.
   - *What you will do. Exactly.* This week, *10* people, starting with *Giulia*: “*I’m helping cafés fill midweek tables. Who do you know?*”

**Links.** Shows back: Session 2 · the ten names chosen from your warm list. Growth Plan step 16: uses. Growth Plan step 19: deepens (the no you are afraid of). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 10 · Lead yourself · Network (anchor #l10-self, built in Phase 4).

#### A · Lead your people · Ambassadors

**Topic:** One partner asked

1. **Tap.** Who already meets my clients  
   Options: 1 an accountant · 2 a supplier · 3 another professional · 4 past clients
2. **Slide.** Possible partners you could name today  
   Scale 0 to 20, step 1; ends “None” and “20”; starts at 2. Words: 0 reads “0 partners” · 10 reads “10 partners” · 20 reads “20 partners”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I ask ___ to introduce me to two people who ___. In return I ___.”
   - `who`: a name (e.g. *Paolo, the coffee supplier*)
   - `need`: what they need (e.g. *want busier weekdays*)
   - `give`: what you give (e.g. *send clients his way*)
4. **Day** (new screen, day chips): By which day will you ask Paolo, the coffee supplier?
5. **Done when** (shown, not typed): you asked *Paolo, the coffee supplier* by *Friday*, and offered your part first.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *a supplier* already meets your clients, and you can name *2 partners*.
   - *Where you struggle. Don’t fight it.* Asking for introductions feels like a favour. It is a trade. Don’t fight that. Offer first.
   - *Where you shine. Don’t ignore it.* You wrote one partner ask with something in return. That is fair.
   - *What you will do. Exactly.* You ask *Paolo, the coffee supplier* for two introductions to people who *want busier weekdays*, and you *send clients his way*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 10 · Lead your people · Ambassadors (anchor #l10-people, built in Phase 4).

#### M · Lead your business · Map the money

**Topic:** Your best client, described

1. **Tap.** Most of my money comes from  
   Options: 1 a few big clients · 2 many small ones · 3 one client · 4 I don’t know
2. **Slide.** Share of sales from your top three clients  
   Scale 0% to 100%, step 5; ends “0%” and “100%”; starts at 50. Words: 0% reads “spread” · 50% reads “concentrated” · 100% reads “risky”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “My best clients share three things: ___, ___, ___. I want ___ more of them by ___.”
   - `a`: one (e.g. *own their place*)
   - `b`: two (e.g. *pay on time*)
   - `c`: three (e.g. *refer others*)
   - `more`: how many more (e.g. *five*)
   - `by`: a date (e.g. *March*)
4. **Day** (new screen, day chips): By which day will you list them?
5. **Done when** (shown, not typed): by *Friday*, every current client who shares all three is listed by name.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Most of your money comes from *a few big clients*; *55%* is from three clients.
   - *Where you struggle. Don’t fight it.* Depending on few feels fine until one leaves. Don’t fight that. Find more like them.
   - *Where you shine. Don’t ignore it.* You described your best client in three words. Now you can find them.
   - *What you will do. Exactly.* You look for clients who *own their place*, *pay on time* and *refer others*: *five* more by *March*.

**Links.** Launchpad plan, “Name your best customer”: uses, the person named in week 1 is the first example. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 10 · Lead your business · Map the money (anchor #l10-work, built in Phase 4).

**Stage notes.** *Building:* Fewer than three clients? Describe the one you want most, and the first one who paid.

#### E · Lead the market · Engage

**Topic:** Customer conversations about their past

1. **Tap.** The first thing I’ll ask a customer  
   Options: 1 what they struggle with · 2 what they tried · 3 what it costs them · 4 what they want instead
2. **Slide.** Customer conversations you can hold per week  
   Scale 0 to 15, step 1; ends “None” and “15”; starts at 3. Words: 0 reads “0 a week” · 8 reads “8 a week” · 15 reads “15 a week”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I ask ___ people: “When did you last ___? What did you try? What did it cost you?” I write their exact words.”
   - `n`: how many (e.g. *10*)
   - `last`: the problem (e.g. *have an empty Tuesday*)
4. **Day** (new screen, day chips): By which day will three be booked?
5. **Done when** (shown, not typed): by *Friday*, three of the *10* conversations are booked or held, and you wrote their exact words.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You’ll start with *what they struggle with*, at *3 a week*.
   - *Where you struggle. Don’t fight it.* You want to pitch. Don’t. Ask about their past, not your idea.
   - *Where you shine. Don’t ignore it.* You wrote three questions about their past. That is how real demand shows.
   - *What you will do. Exactly.* You ask *10* people: “When did you last *have an empty Tuesday*? What did you try? What did it cost you?”

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 10 · Lead the market · Engage (anchor #l10-market, built in Phase 4).

### Week 11 · Level 11 · EDGE · Your advantage

**Promise:** By Sunday you will have: Three people asked for honest feedback, one open question in a meeting, your advantage written with proof, three testimonials asked for.  
**Floor:** Advantage · why you, and not them · **Part of:** Business HUB  
**Old:** “Everyone does what I do.” **New:** “I am chosen for a reason I can name and prove.”  
**First screens:** last week’s four actions (Level 10): Done · Partly · Not yet; then the promise.

#### E · Lead yourself · Ego check

**Topic:** Feedback, asked for

1. **Tap.** When I get criticism, I…  
   Options: 1 defend myself · 2 shut down · 3 overthink for days · 4 use it
2. **Slide.** People who told you something hard this month  
   Scale 0 to 10, step 1; ends “None” and “Ten”; starts at 1. Words: 0 reads “0 people” · 5 reads “5 people” · 10 reads “10 people”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I ask ___, ___ and ___: “What’s one thing I do that makes working with me harder?” I only say thank you.”
   - `a`: one person (e.g. *Luca*)
   - `b`: another (e.g. *Sara*)
   - `c`: a third (e.g. *my accountant*)
4. **Day** (new screen, day chips): By which day will you have asked all three?
5. **Done when** (shown, not typed): by *Friday* you asked *Luca*, *Sara* and *my accountant*, wrote each answer down, and only said thank you.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* With criticism you *defend myself*, and *1 people* told you something hard this month.
   - *Where you struggle. Don’t fight it.* Feedback stings because worth is involved. Yours is settled (Level 01). Don’t fight it. Collect it.
   - *Where you shine. Don’t ignore it.* You chose three people to ask. You’ll hear what competitors never hear.
   - *What you will do. Exactly.* You ask *Luca*, *Sara* and *my accountant* the one question, and only say thank you.

**Links.** Launchpad plan, “Ask for the truth”: proposed change, this level asks three people. The plan counts the people who told you something hard instead. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 11 · Lead yourself · Ego check (anchor #l11-self, built in Phase 4).

#### D · Lead your people · Dialogue

**Topic:** One open question, every meeting

1. **Tap.** What my team or partners avoid telling me  
   Options: 1 bad news · 2 their ideas · 3 that they’re overloaded · 4 nothing, they tell me
2. **Slide.** How safe is it to disagree with you?  
   Scale 0 to 10, step 1; ends “Not safe” and “Safe”; starts at 5. Words: up to 3: not safe · 6: sometimes safe · 8: mostly safe · 10: safe.
3. **Write once**, one blank per screen, the sentence building above it:  
   “In every ___ I ask: “What isn’t working that I don’t know?” and I ___ before I answer.”
   - `meet`: which meeting (e.g. *Monday check-in*)
   - `do`: what you do first (e.g. *write it down*)
4. **Day** (new screen, day chips): Which day is the next Monday check-in?
5. **Done when** (shown, not typed): at the *Monday check-in* on *Monday* you asked “What isn’t working that I don’t know?”, and did this before you answered: *write it down*.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* People avoid telling you *bad news*, and disagreeing feels *sometimes safe*.
   - *Where you struggle. Don’t fight it.* Silence looks like agreement. It isn’t. Don’t fight that. Ask the question every week.
   - *Where you shine. Don’t ignore it.* Disagreement is safe with you. That is how good ideas surface.
   - *What you will do. Exactly.* Every *Monday check-in* you ask what isn’t working, and you *write it down* before you answer.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 11 · Lead your people · Dialogue (anchor #l11-people, built in Phase 4).

**Stage notes.** *Building:* No team meeting? Ask it of a partner, a supplier, or a client at the end of each job.

#### G · Lead your business · Gap

**Topic:** Your advantage, with proof

1. **Tap.** Customers compare me with  
   Options: 1 a competitor · 2 doing nothing · 3 doing it themselves · 4 a cheaper option
2. **Slide.** How different do you look to a buyer?  
   Scale 0 to 10, step 1; ends “The same” and “One of a kind”; starts at 3. Words: up to 3: the same · 6: a bit different · 8: clearly different · 10: one of a kind.
3. **Write once**, one blank per screen, the sentence building above it:  
   “Others offer ___. I offer ___, because ___. Proof: ___.”
   - `others`: what others offer (e.g. *discount cards*)
   - `mine`: what you offer (e.g. *events that bring regulars*)
   - `because`: why you can (e.g. *I know the neighbourhood*)
   - `proof`: one fact (e.g. *Bar Lina, +40% on Tuesdays*)
4. **Day** (new screen, day chips): By which day will it be where buyers see it?
5. **Done when** (shown, not typed): by *Friday*, the sentence and its proof are on your offer page or in your next proposal.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You are compared with *a competitor*, and you look *the same*.
   - *Where you struggle. Don’t fight it.* If you look the same, price decides. Don’t fight on price. Name the gap.
   - *Where you shine. Don’t ignore it.* You named your difference and its proof. That is an edge.
   - *What you will do. Exactly.* Others offer *discount cards*. You offer *events that bring regulars*, because *I know the neighbourhood*. Proof: *Bar Lina, +40% on Tuesdays*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 11 · Lead your business · Gap (anchor #l11-work, built in Phase 4).

#### E · Lead the market · Echo

**Topic:** Testimonials asked for

1. **Tap.** Where my proof lives  
   Options: 1 nowhere · 2 in my head · 3 screenshots on my phone · 4 public reviews
2. **Slide.** Written testimonials you could show today  
   Scale 0 to 20, step 1; ends “None” and “20”; starts at 2. Words: 0 reads “0 testimonials” · 10 reads “10 testimonials” · 20 reads “20 testimonials”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “By ___ I ask ___ clients for two sentences: what changed for them, and who they would recommend me to.”
   - `day`: a date (e.g. *15 Nov*) · a date: day chips and “A date”
   - `n`: how many (e.g. *3*)
4. **Done when** (shown, not typed): you asked *3* clients by *15 Nov*, and every answer you got is where buyers decide.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your proof lives *screenshots on my phone*, and you have *2 testimonials*.
   - *Where you struggle. Don’t fight it.* Asking for praise feels vain. It is evidence for the next client. Don’t fight that. Ask.
   - *Where you shine. Don’t ignore it.* You set a date to collect proof. Your clients will speak for you.
   - *What you will do. Exactly.* By *15 Nov* you ask *3* clients for two sentences, and you put them where buyers decide.

**Links.** Shows back: Level 05 · the three clients you asked for their words (Testimony). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 11 · Lead the market · Echo (anchor #l11-market, built in Phase 4).

### Week 12 · Level 12 · RISE · Your ninety days

**Promise:** By Sunday you will have: Your leader sentence written, one person given something to own, a 90-day number with checkpoints, one market test set.  
**Floor:** Leadership · your next ninety days · **Part of:** Business HUB  
**Old:** “I am a person with a business.” **New:** “I am a leader who builds people and serves a market.”  
**First screens:** last week’s four actions (Level 11): Done · Partly · Not yet; then the promise.

#### R · Lead yourself · Rule of life

**Topic:** Who you are now

1. **Tap.** What changed most in me since Level 01  
   Options: 1 what I believe · 2 how calm I stay · 3 how I decide · 4 how I handle money · 5 how I sell
2. **Slide.** How much do you trust yourself to decide now?  
   Scale 0 to 10, step 1; ends “Not at all” and “Fully”; starts at 7. Words: up to 3: a little · 6: more than before · 8: a lot · 10: fully.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I am a leader who ___. In 90 days I will be known for ___.”
   - `who`: who you are (e.g. *decides calmly and serves first*)
   - `known`: what for (e.g. *the busiest Tuesdays in Rome*)
4. **Day** (new screen, day chips): By which day will you read it aloud to someone?
5. **Done when** (shown, not typed): by *Friday*, the sentence is on the first page of your Planner, and you read it aloud to one person.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* What changed most is *how I decide*, and you trust yourself *a lot*.
   - *Where you struggle. Don’t fight it.* Old doubts return on hard days. Don’t fight them. Read your proof.
   - *Where you shine. Don’t ignore it.* You trust your decisions. That is leadership.
   - *What you will do. Exactly.* You are a leader who *decides calmly and serves first*. In 90 days, you are known for *the busiest Tuesdays in Rome*.

**Links.** Growth Plan step 2: deepens (the drive behind your desire). Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 12 · Lead yourself · Rule of life (anchor #l12-self, built in Phase 4).

#### I · Lead your people · Invest in people

**Topic:** Grow one leader

1. **Tap.** Who could lead with me  
   Options: 1 someone on my team · 2 a partner · 3 a client · 4 nobody yet
2. **Slide.** Hours a week you will invest in them  
   Scale 0 to 10, step 1; ends “None” and “10 hours”; starts at 1. Words: 0 reads “0 hours” · 5 reads “5 hours” · 10 reads “10 hours”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “I grow ___ by giving them ___ to own. Every ___ I ask: “___””
   - `who`: a name (e.g. *Marta*)
   - `own`: something to own (e.g. *all supplier decisions*)
   - `day`: which day (e.g. *Thursday*) · day chips
   - `ask`: your coaching question (e.g. *What did you decide, and why?*)
4. **Done when** (shown, not typed): *Marta* knows, in writing, that they own *all supplier decisions*, and on *Thursday* you asked “*What did you decide, and why?*”  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
5. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* *someone on my team* could lead with you, and you’ll give it *1 hours*.
   - *Where you struggle. Don’t fight it.* Doing it yourself is faster today and slower forever. Don’t fight that. Hand over ownership.
   - *Where you shine. Don’t ignore it.* You chose a person and a question. That is how leaders grow leaders.
   - *What you will do. Exactly.* You give *Marta* *all supplier decisions* to own, and every *Thursday* you ask: “*What did you decide, and why?*”

**Links.** Growth Plan step 10: uses. Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 12 · Lead your people · Invest in people (anchor #l12-people, built in Phase 4).

**Stage notes.** *Building:* Nobody yet? Pick the freelancer you use most, or the first person you would hire, and give them one decision.

#### S · Lead your business · Scale the number

**Topic:** One number for the next ninety days

1. **Tap.** The one number that matters most for 90 days  
   Options: 1 profit · 2 clients · 3 price · 4 cash · 5 my hours
2. **Slide.** Growth you aim for in 90 days  
   Scale 0% to 100%, step 5; ends “0%” and “100%”; starts at 20. Words: 0% reads “steady” · 50% reads “bold” · 100% reads “bold”.
3. **Write once**, one blank per screen, the sentence building above it:  
   “In 90 days: ___ from ___ to ___ a month. Checkpoints: ___, ___.”
   - `num`: the number (e.g. *profit*)
   - `from`: today (e.g. *€1,300*)
   - `to`: the target (e.g. *€2,000*)
   - `c1`: day 30 (e.g. *€1,500*)
   - `c2`: day 60 (e.g. *€1,750*)
4. **Day** (new screen, day chips): By which day will it be in your Planner?
5. **Done when** (shown, not typed): by *Friday*, your Planner’s twelve-week contract holds the number (*profit*, from *€1,300* to *€2,000*) and both checkpoints with their dates.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* You chose *profit*, and a *bold* target of *50%*.
   - *Where you struggle. Don’t fight it.* Big targets scare, small ones bore. Don’t fight the fear. Break it into checkpoints.
   - *Where you shine. Don’t ignore it.* Bold, with checkpoints. That is how growth stays honest.
   - *What you will do. Exactly.* *profit* from *€1,300* to *€2,000*, via *€1,500* and *€1,750*.

**Links.** Growth Plan step 5: feeds (twelve weeks of truth). Planner: Twelve-week contract (front pages). Manual for your stage · Level 12 · Lead your business · Scale the number (anchor #l12-work, built in Phase 4).

**Stage notes.** *Scaling:* Give each owner from Level 09 their own checkpoint, and read all of them on the same day.

#### E · Lead the market · Expand

**Topic:** One small market test

1. **Tap.** My next market move  
   Options: 1 raise my price · 2 a new customer group · 3 a new channel · 4 a partnership · 5 a new product
2. **Slide.** How confident are you it will work?  
   Scale 0 to 10, step 1; ends “Not at all” and “Certain”; starts at 5. Words: up to 3: mostly guessing · 6: roughly · 8: quite sure · 10: certain.
3. **Write once**, one blank per screen, the sentence building above it:  
   “By ___ I test ___ with ___ people. Success means ___. If not, I ___.”
   - `day`: a date (e.g. *31 Jan*)
   - `test`: the move (e.g. *a supper club for offices*)
   - `n`: how many people (e.g. *10*)
   - `win`: what counts (e.g. *4 bookings*)
   - `else`: plan B (e.g. *try lunch instead*)
4. **Day** (new screen, day chips): By which day will the first invitations go out?
5. **Done when** (shown, not typed): by *Friday*, the first invitations are out, and success (*4 bookings* by *31 Jan*) is written in your Planner.  
   Then one slide: “How sure are you that this is done by Sunday?” 0–100%.
6. **Four lines back** (the Version 4 example founder):
   - *Where you were. Admit it.* Your next move is *a new customer group*, and you feel *roughly* about it.
   - *Where you struggle. Don’t fight it.* Certainty comes after the test, not before. Don’t fight the doubt. Test small.
   - *Where you shine. Don’t ignore it.* You’re confident. Test it anyway; confidence isn’t data.
   - *What you will do. Exactly.* By *31 Jan* you test *a supper club for offices* with *10* people. Success: *4 bookings*. If not, *try lunch instead*.

**Links.** Planner: Monday page, as the one move (Start here) or one of three goals, with its day. Manual for your stage · Level 12 · Lead the market · Expand (anchor #l12-market, built in Phase 4).

### Chapter III reading · The Open Market (after Level 12)

One screen each, in this order. Actions counted: Levels 09 to 11 (12), and the whole programme. Level 12’s four are checked in week 13, which then opens the North Star again, to compare with where you began.

1. **Where you were.** The Version 4 reading, unchanged: the four corners from your own slides, the lowest and the highest, four lines, and your own sentence to carry into the next chapter.
2. **What you did.** New. The chapter’s actions: how many Done, Partly, Not yet, from your Sunday answers.
3. **How you estimate.** New. Your “how sure” against what happened: too hopeful, about right, or too careful. The same three words as the Planner’s Sunday page.
4. **What you believed, what you believe now.** New. Each level’s old sentence and new sentence, side by side (Version 4 text).
5. **Where you began.** New. The domain the North Star told you to start with, against your lowest corner now.
6. **In his words.** New. One sentence from Alexandru, word for word from his book, with where it is found.
7. **Your next move.** New. Tap the one undone action that matters most, pick its day, and read its “Done when”. It is carried into next week next to the new level’s four, and asked about on Sunday like them.

**In his words:** “I believe each of us has been given talents, and that we are meant to multiply them, not bury them.” (Worth Building (the Library), “A word from Alexandru · Allow yourself to rise”).

## Every change from Version 4

| Where | Change | Reason |
| --- | --- | --- |
| All levels | One question per screen: each blank of the sentence gets its own screen, with the sentence building above it. | The brief: one field on screen, typing last. |
| All day blanks | A day is a tap: seven day chips, and “A date” for anything further. | Tap before typing. |
| 29 domains | A day screen is added where the sentence has no day (new key `on`): 2.0, 2.3, 3.0, 3.1, 3.2, 4.0, 4.2, 5.0, 5.1, 5.3, 6.1, 6.3, 7.1, 7.2, 8.0, 8.1, 8.2, 8.3, 9.1, 10.0, 10.1, 10.2, 10.3, 11.0, 11.1, 11.2, 12.0, 12.2, 12.3. | Every action needs a day. |
| All 48 domains | A “Done when” line under “What you will do”, shown, not typed. | Checkable on Sunday. |
| All 48 domains | One slide after it: “How sure are you that this is done by Sunday?” (new key `sure`). | Estimates against reality build realism. |
| Levels 02–12, week 13 | The level opens with last week’s four: Done · Partly · Not yet (new key `got`). | Real change, measured. |
| Every level | The North Star’s weakest domain is marked “Start here”; its action comes first in “Your week”. | D2. |
| Every level | The credo screen becomes “Your week”: the four actions with day and Done when, in Planner order. | An action plan is not a memoir. |
| Readings 05, 09, 12 | Six short screens after the Version 4 reading: what you did, how you estimate, old and new beliefs, where you began, his words, and one next move with a day. | The readings look back at what happened, not only at the slides. |
| Levels 01, 06, 10 | Growth Plan words show above the tap when written (steps 12, 16, 6). | Ask once. |
| Levels 05, 07, 08, 11 | An earlier level’s answer shows back (5.0, 7.1, 8.3, 11.3). | Build on it, never ask again. |
| Level 05 · Testimony | “by Friday” becomes “by {on}”, the founder’s day. | The founder picks the day. |
| Level 09 · First things weekly | “30 minutes” becomes “ten minutes”, if D3 is approved. | One rhythm everywhere. |
| Level 12 | “90 days” becomes “twelve weeks”, if D5 is approved. | One horizon. |
| Levels 04 and 10 | Session 1 opens Level 04; Session 2 follows the Chapter II reading. | D1. The sessions had no stated place or purpose. |

**Unchanged:** every tap, option, slide, scale, sentence and four-lines text (except Level 05 · Testimony’s “by Friday”), the twelve words, the three chapters, the promises, the readings after 05, 09 and 12, and the meaning of every saved answer.

## Changes outside Version 4 (proposals)

The Launchpad plan is the numbers. Where one of its actions repeats a level, it becomes a count that a later level acts on.

| Domain | Launchpad action | Week | Proposed |
| --- | --- | --- | --- |
| Lead yourself | Name your enough | Week 1 | Drop the money amount (Level 01 asks it the same week). Keep: free evenings a week, time for ___, at most ___ hours a week. |
| Lead your people | Say one expectation out loud | Week 1 | “Count your clear asks”: last week’s requests ___, with a date ___, with a “done” ___. Level 04 acts on it. |
| Lead your people | Give one thing away | Week 2 | “Count what came back”: hours the task from Level 01 took you before ___, this week ___. |
| Lead your people | Ask for the truth | Week 2 | “Count the hard truths”: people who told you something hard this month ___. Level 11 acts on it. |
| Lead your people | Name what someone did well | Week 3 | “Count your thanks”: specific thanks you gave this week ___. Level 05 acts on it. |
| Lead the market | Say your offer in one sentence | Week 2 | “Count where clients came from”: your last ten, by referral ___, repeat ___, your network ___, online ___. Level 08 writes the offer line. |
| Lead the market | Make three asks | Week 2 | Move to week 3 as “Count your asks since Level 01”: asks ___, yes ___, no ___, no answer ___. |

## Saved answers

| Key | What it holds | Status |
| --- | --- | --- |
| `w.v4.<level>.<d>.t`, `.s`, every sentence field | The tap, the slide, the words written | Unchanged |
| `w.v4.<level>.<d>.on` | The added day, in 29 domains | New |
| `w.v4.<level>.<d>.sure` | How sure, 0–100 | New |
| `w.v4.<level>.<d>.got` | 0 Done · 1 Partly · 2 Not yet, asked when the next level opens | New |
| `w.v4.<5/9/12>.r.carry`, `.r.on` | The reading’s next move and its day | New |
| — | No key changes meaning, none is renamed: no migration needed. A level’s progress still counts 12 units (the day belongs to the sentence). | — |

## Phase 1 audit

### What each piece covers, per domain

|  | Lead yourself | Lead your people | Lead your business | Lead the market |
| --- | --- | --- | --- | --- |
| North Star (8 questions) | where you stand, 2 questions | where you stand, 2 questions | where you stand, 2 questions | where you stand, 2 questions |
| Growth Plan (20 + 1) | steps 1–5: exception, drive, habits, voice, 12 weeks | steps 6–10: postponed talk, who taught you, face to face, not needed, one person grows | steps 11–15: playing small, money belief, price aloud, fear of success, half-day away | steps 16–20: hidden from, begging, story, the no, a brave move a week |
| Launchpad plan (20) | count your week, enough, one block, a decision, promises kept | who carries it, an expectation, give one away, the truth, thanks | your number, last month’s money, one process, cheapest hour, Monday number | best customer, their words, offer line, three asks, conversations |
| Blueprint levels (48) | worth rule, reading, feeling, if–then, proof, … | trust, asking, atmosphere, clear asks, thanks, … | enough, five numbers, storm rule, hour, count, … | asking to buy, signals, their fear, selling hour, testimony, … |
| Planner 2027 | one move, habit fought, wisdom check | story bank | goals, estimate vs reality | story bank |
| Stage manuals (3) | old seven-step method | old seven-step method | old seven-step method | old seven-step method |
| Books (3) | strong | strong | money: Worth Building only | thinnest |

### Overlaps, and who owns each

| Level · domain | Meets | How | Note |
| --- | --- | --- | --- |
| 01 · Settled | Growth Plan step 4 | deepens | the voice that says you are not good enough |
| 01 · Entrust | Growth Plan step 10 | deepens |  |
| 01 · Entrust | Launchpad: Give one thing away | proposed change | the same hand-over, a week later. The plan counts the hours it gave back instead. |
| 01 · Enough | Growth Plan step 12 | uses | if step 12 is written, its first line shows above the tap |
| 01 · Enough | Launchpad: Name your enough | proposed change | the money amount is asked here the same week. The plan keeps the time: free evenings and most hours a week. |
| 01 · Dignity | Growth Plan step 16 | uses | the three names from step 16 are offered as taps |
| 01 · Dignity | Growth Plan step 17 | deepens |  |
| 01 · Dignity | Launchpad: Make three asks | proposed change | the same three asks, the same fortnight. The plan counts asks, yes, no and no answer in week 3 instead. |
| 02 · Evidence | Launchpad: Read last month’s money | uses | the statement you opened in week 1 holds four of the five. |
| 03 · Meet their fear | Launchpad: Hear it in their words | uses | ask one of the three people you heard in week 1, now about fear and hope. |
| 04 · Set it in advance | Growth Plan step 3 | deepens | two habits out |
| 04 · Tell it clearly | Launchpad: Say one expectation out loud | proposed change | this level asks it with a date and a done. The plan counts last week’s clear asks instead. |
| 04 · Essential first | Launchpad: Find your cheapest hour | uses | the cheapest hour found in week 2 is the first one to hand back. |
| 04 · Pace | Launchpad: Count your conversations | uses | the Friday count from week 3 is the number to beat. |
| 05 · Fruit is feedback | Level 01 | shows back | your new sentence (“I am … before I achieve anything”) |
| 05 · Applaud | Launchpad: Name what someone did well | proposed change | this level does it. The plan counts specific thanks given in week 3 instead. |
| 05 · Count | Launchpad: Choose your Monday number | uses | the same number: the slide asks how many weeks in a row you have read it. |
| 06 · Truth first | Growth Plan step 6 | uses | the person and the conversation named in step 6 show above the tap |
| 06 · Truth first | Growth Plan step 8 | feeds | Done here ticks step 8 |
| 07 · Hold the line | Growth Plan step 15 | deepens | a half-day without you |
| 07 · Hold the line | Launchpad: Guard one block | deepens | one block in week 2; here, your best hours, every week. |
| 07 · Own it | Growth Plan step 10 | uses |  |
| 07 · Own it | Level 01 | shows back | the task you handed over (Entrust) |
| 07 · Unit cost | Launchpad: Know your number | uses | what one sale leaves you, from week 1. |
| 08 · Gift | Growth Plan step 11 | deepens | where you play small |
| 08 · Levels | Growth Plan step 13 | feeds | saying the price out loud is step 13 |
| 08 · Desire | Level 01 | shows back | who you help, and with what (Dignity) |
| 09 · First things weekly | Growth Plan step 21 | uses | the inner boardroom is the review |
| 09 · Lean on roles | Growth Plan step 9 | feeds | one decision made without you |
| 09 · One page of cash | Launchpad: Read last month’s money | deepens | once in week 1; here, every week, with an alert line. |
| 10 · Network | Growth Plan step 16 | uses |  |
| 10 · Network | Growth Plan step 19 | deepens | the no you are afraid of |
| 10 · Network | Session 2 | shows back | the ten names chosen from your warm list |
| 10 · Map the money | Launchpad: Name your best customer | uses | the person named in week 1 is the first example. |
| 11 · Ego check | Launchpad: Ask for the truth | proposed change | this level asks three people. The plan counts the people who told you something hard instead. |
| 11 · Echo | Level 05 | shows back | the three clients you asked for their words (Testimony) |
| 12 · Rule of life | Growth Plan step 2 | deepens | the drive behind your desire |
| 12 · Invest in people | Growth Plan step 10 | uses |  |
| 12 · Scale the number | Growth Plan step 5 | feeds | twelve weeks of truth |
| 09 · First things weekly | Planner Sunday page, Growth Plan step 21 | owned by the Planner | the app only records Done · Partly · Not yet |

### Gaps

- In 28 of 48 domains the sentence has no day for its action, and one more (Own it) has a date weeks away; none has a “Done when”.
- Nothing in the app records what really happened, or how sure the founder was. Only the Planner does, on paper.
- The three readings never look back at the actions, or at the North Star.
- The two sessions have no stated purpose or result.
- The manuals do not teach Version 4: 0 of 36 manual promises match (scripts/make-manuals.mjs reads the old levels, never levels-v4.js).
- The market domain is the thinnest in the books; money is only in Worth Building.

### Contradictions

- Sessions: two (brief) against one, two and three (site ladder). D1.
- Weekly review: 5, 10 and 30 minutes. D3.
- “Boardroom” means a paid session and a Sunday page. D4.
- 90 days (Level 12) against twelve weeks (Planner, Growth Plan) against 13 weeks (Planner reviews). D5.
- SEED, VIEW, FACT are level words and also tool names in a book. D6.
- The North Star promises Version 4 for weeks 1–3; the manuals teach the old method. Phase 4.
- Four North Star stages, three manuals. D7.

## After your approval

- **Phase 3:** the approved skeleton goes into `public/levels-v4.js` (data first), then the one-question flow on the programme screen. Saved keys keep their meaning. 390px with no sideways scroll, reduced motion, light and dark. Every test runs, new ones added. A new PR with phone screenshots.
- **Phase 4** (after Phase 3 is merged): `scripts/make-manuals.mjs` builds the three manuals from Version 4, with a section per level and domain. A sync report, preview PDFs, and the Library files replaced only after you approve the previews.
