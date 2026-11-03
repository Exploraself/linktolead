# The Founder's Blueprint — rules for anyone working here

This applies to every contributor, human or AI.

## 1. A step names what to open, count and write

Every one of the seven clarity points must be answerable only by going and
looking. "Open last week's calendar and write the three activities that took
the most hours" is a step. "Reflect on how you use your time" is not, and does
not belong in this repo.

If a founder could answer it by thinking hard, rewrite it.

## 2. Four moves per domain are a fixed spine

Since Version 4 (Alexandru, 31 Oct 2026): Tap · Slide · Write once · Four lines.
Tap the line that sounds like you, slide to the honest number, write one
sentence with blanks, then read four lines back: where you were (admit it),
where you struggle (don't fight it), where you shine (don't ignore it), what
you will do (exactly). The four lines are built only from the founder's own
answers. Twelve levels, one four-letter word each (one letter per domain), in
three chapters, with a chapter reading after levels 05, 09 and 12. The
content lives in public/levels-v4.js. The earlier seven points (Name it ·
Evidence · Gap · Cost · Decision · Move · Review) shaped this and still sit
underneath it: the tap names it, the slide is the evidence and the gap, the
sentence is the decision and the move, the four lines are the review.

## 3. Every level opens with a promise, stated as things

"By Sunday you will have a block of time you defended, one person told plainly
what you expect, one process written in ten lines, and three named prospects
contacted." Not four insights — four things that happened. A promise that
cannot be checked on Sunday is not a promise.

## 4. The frameworks are context, not content

Alexandru's 99 tools and 32 frameworks are what the work is built from. They
are **not** displayed to the founder as content, and no tool names or numbers
appear on the surface. A founder arriving here has never heard of them, and
jargon they cannot place reads as noise.

## 5. Twelve levels exist regardless of payment

The ladder decides what **opens**. It never decides what gets **built**. Never
ship a level as "coming soon" because of its position on the ladder; a level
that is not written says so plainly, and a level that is locked shows its gate
and what opens it.

## 6. Honesty

No invented counts, no countdowns to nothing, no scarcity that is not real,
and never assert that a payment, subscription or booking succeeded. Levels one
to three are free and stay free.

## 7. Plain and free to run

No build step, no framework, no bundler, no dependency without a reason stated
in the PR. Static files on Cloudflare Pages. Must work at 390px wide with no
horizontal scroll, and respect `prefers-reduced-motion`.

## 8. The founder's answers

They are the most valuable thing in the product. They save to the device
first, always, in `localStorage` wrapped in try/catch, so the page works with
no account and no network. When the founder is signed in, they are also saved
to their account, in batches, never on every keystroke or tap. The device copy
comes first: a failed save only waits for the next batch. Answers given before
an account existed are moved into it on signup, never silently discarded, and
an account's token is only ever handed to the person who owns the email.

## 9. Numbers serve judgement. They are not the subject.

A founder can get a spreadsheet anywhere, and a machine can now do the
arithmetic, the forecast and the tidy chart in seconds. None of that decides
what matters, holds a standard, or has the conversation nobody wants.

So a number earns its place in this programme only when it forces a decision a
human has to own.

- **Teach the principle, not the technique.** Why a thin margin quietly
  removes your choices. Why an hour given to the wrong customer is an hour
  taken from the right one. Not how to build the model.
- **Every result points at a decision**, never at a benchmark. "Your rate here
  is lower than your other work — is this customer buying you something else?"
  Not "industry average is X."
- **Say plainly when a machine could do the step.** It costs nothing to admit
  it and it sharpens the point: the calculation is cheap, the choice is not.
  Then move the founder to the part only they can do.
- **Never let a worksheet become an accounting lesson.** If a framework needs
  a glossary, it is the wrong framework.
- The hard parts of this programme are the human ones: saying no, naming the
  cost, having the conversation, holding the standard on a bad week. The
  numbers exist to make those unavoidable, and for nothing else.

## 10. Practical first, outside in (Alexandru, 2 Nov 2026)

A founder coming in from outside meets the practical first, then the detail,
then the how. On every surface they see before they are deep inside a level
(sales pages, Base Camp, the level list, My Blueprint), a level is named by
what it is about in plain words: "What you believe", never "SEED". Framework
words (the level words, chapter names, P.A.C.E., tool names) appear only
inside a level, and more of them the deeper the founder goes.

My Blueprint goes the other way: it brings the founder back up to the
practical. The work is done inside; here is your playbook, print it, and do
exactly this.

Every action is a practical business step the founder can do and check this
week, tied to their mission, their vision, their goals and their mini-goals.
"Take a walk" or "breathe first" is not an action. If a founder could follow
it without moving their business, rewrite it.

## 11. Easy on the eye (Alexandru, 2 Nov 2026)

The Founder's Blueprint and My Blueprint are light and white, in one
easy-to-read font (Atkinson Hyperlegible, Alexandru's pick, 2 Nov 2026; not
Lexend), with few colours, one thing at a time: the way Google's
sign-in asks for one field per screen. A number that scares is left out:
show this level's twenty actions, never "240 actions".

## 12. Examples at every size (Alexandru, 2 Nov 2026)

Level 01 is not only for someone who cannot pay the rent. Alternate the
examples across the levels and domains: the founder with only an idea and no
money yet; the owner with ten or fifteen people and payroll every month; the
company with fifty people or $50 million, where one decision moves many
salaries. Name the pressure plainly, above all in Lead yourself: the rent,
the payroll, the bank, the investors, the people who depend on you. An
example is always marked as one, never presented as a real founder.

## 13. Design the journey, and let a small picture speak (Alexandru, 2 Nov 2026)

Think as a designer about the founder's comfort, on every page, letter and
deck. The journey makes sense in every direction: from any place, the
founder can see where they are, what comes next and how to get back. Each
step is simple, pleasant and productive.

Every way in, place, button group or heading wears a small line icon that
tells the founder something before they read: a toolbox with a rising arrow
for the Growth Toolkit, a letter for "we email you a code", a key for "type
the code", an hourglass for "being built". The words beside the icon always
carry the meaning too (icons are hidden from screen readers). One icon set
per surface, drawn in the text colour; the toolkit's lives in
public/tools/icons.js.

## 14. Every material follows a change; every email is on the map (Alexandru, 2 Nov 2026)

When anything merges, everything tied to it is updated in the same work, or
right after: the email journey map, the emails, the /internal decks, the
README, the START HERE doc. A change is not finished while a page, letter or
deck still describes the old way.

The email journey map in exploraself.com/internal (Internal → Emails) shows every
letter a founder can get, in the order they meet them, drawn from the code
that sends them. When you add or change a letter (functions/_letters.js,
functions/_course-letters.js, or a new send() call), in the same work:

1. add it to ENTRIES in scripts/email-map.mjs (stage, icon, when, who);
2. run `node scripts/email-map.mjs <out.html> --exploraself <exploraself repo>`
   and put the page in the exploraself repo, in the email-map folder of the
   unlisted internal folder (never name that folder in this public repo);
3. tell Alexandru what changed.

tests/email-map.test.mjs fails when a letter builder is missing from the map.

## 15. My direction, and what the first five levels are for (Alexandru, 2 Nov 2026)

**My Blueprint opens on the Blueprint itself** (Alexandru, 2 Nov 2026: "the
Blueprint is not fillable; it is filled while they do the work"). From the
first day the founder sees all twelve levels, in their three chapters, with
their titles and their four parts. A part fills only with what the founder
wrote and did; an empty part says what fills it; a locked level shows what
opens it. At the top, the plan (four squares a level) and "Your next square"
with one button; a finished level gets one quiet line, once. "See a finished
Blueprint" shows Rosa, always marked as an example. "Print my Blueprint" is
a plan worth keeping: the name, the date, the squares, a chapter a page.

The tab **My direction** is the one thing written there on purpose, once, one field per screen:
the mission, the vision, the values (locked in: changed only on purpose), two
goals for the twelve weeks (one for the business, one for the founder as a
leader) and two mini-goals for the week (one for the work, one personal).
Each one is purposeful and about the founder in relation to the business,
turned to the customer: who they serve, how they will serve them better, and
what customers say about their experience. Where a founder is unsure, the
screen sends them to ask their customers, not to think harder. Every action
in This week names the goal it serves. This week holds four actions, one per
area of the business, until all twelve levels are written; then the count is
looked at again.

The three chapters are **Start with you** (Levels 01–05), **Run the
business** (06–09) and **Grow the market** (10–12). Levels 01–05 are about the
founder: their mindset, and the basics of a business seen from there (what a
business is, the customer, serving, what stops them, their attitude to
serving, their relationship with money and with goals). From Level 06 the
questions go deeper into the business itself.

## 16. The elephant in the room, the door, and focus mode (Alexandru, 2 Nov 2026)

**The elephant in the room** opens Levels 01 (Your hidden potential), 04 (the
Boardroom: The future you), 06 (the LAB: The customer, not the ego) and 10
(the HUB: The money); a Summit founder meets Greatness at Level 01, and their
own last words at 04, 06 and 10. Four screens, one at a time, in this order:
we understand you (the pain, the problem, the struggles, the dreams); it is
possible (you are the hero, we are here to help you grow); the puzzle (so
much to do, a mindset that holds us back, advice that does not fit); here you
are (answer every question, fully). Alexandru speaks as "I", never he or him,
and only in his own story and words (his books, his profile, what he has
said): nothing invented. The last screen holds what the founder will have at
the end: each level's own promise, word for word. It is personal: the
founder's first name, and from Level 04 on, their own answers. Then three
questions, each a tap or a slider, never a sentence (Level 01 asks what stops
them; Level 04 reads it back). No welcome promises a video or the library.
Shown once, then one tap back from the level.

**The door** opens Level 01, before any question about mindset: which of the
four versions the founder sees (before the first sale, selling alone, a team
with payroll, 16 people or more), decided only from taps and sliders, because
nobody reads every founder's answers: customers in the last three months,
sales, people paid, how clear the offer is, how many people it takes to win
one customer, how many of ten said yes, how many come back, what is left of
every $100, and the twelve-week win. Every number has its "not yet" or "I
don't know"; before a first sale the selling questions are passed over. No
customer yet: before the first sale; customers, and nobody else paid:
selling alone (working alone); 1 to 14 paid: a team with payroll; 15 or
more: 16 people or more. "Your version"
shows it, reads up to three numbers back (each pointing at a decision and a
level, rule 9), and the founder says "That's me" or picks another. "Still
…?" asks again at 04, 06 and 10. The version sets the size of the examples
and actions (rule 12).

**The switch**: when the founder's own answers in the levels say they are
further on (a sale before the first sale, someone else running the work),
the week, "Still …?" and My Blueprint say so and offer the version that fits;
"Keep mine" is remembered. Practical, never a psychological test.

**Focus mode** is the only way to answer: one full-screen layer, the same on
a computer and a phone. One question in one centred column, the answer right
under it, Next right under the answer, and Back beside Next (at the bottom
on a phone; none on the first screen). The top line shows a thin progress
bar, where the founder is ("Lead yourself · 3 of 5") and Close. Keys 1–9
choose, the arrows move a slider, Enter is Next, Esc closes. A tap moves on
by itself after a short pause, unless it shows a reply to read. Done ✓ at
the end of a domain or a level closes the layer, back at the levels with the
new tick. Opening it is a step in the browser's history, so Back closes it.

**A level's list** (Alexandru, 3 Nov 2026): where a level opens with the
elephant, the first row is "Before you start" (the elephant and the founder's
version), drawn as an intro, never as a part. The right page has one way in.
Twelve squares, three per part, open any move. After the intro, one screen
says "Level NN begins" with its four parts, then the first part.

## 17. Every Mailchimp tag is on the tag page (Alexandru, 2 Nov 2026)

The people who work at ExploraSelf see every Mailchimp tag in
exploraself.com/internal (Internal → Mailchimp tags): what it means, where it
comes from (the sales page or form, as a full link) and at which moment it is
added. The page is drawn from functions/_tag-list.js, which /mentor → Settings
→ Mailchimp tags also reads to sort the audience's tags into Keep, Old (safe
to delete) and Ask.

Mailchimp can only delete a tag, never rename it: a new name is a new tag. So
a name is never invented: propose one that follows the system
(`linktolead-<group>-<value>`, small letters, dashes) and Alexandru approves
it first. Facts about a person (industry, interest, company) are contact
fields, never tags.

When you add, change or stop sending a tag (here, or in an exploraself.com
form), in the same work:

1. update functions/_tag-list.js: TAG_LIST (a linktolead tag), SITE_TAGS (an
   exploraself.com form's tag number, with the form in words) or OLD_TAGS (a
   name no code sends any more);
2. run `node scripts/tag-map.mjs <out.html> --exploraself <exploraself repo>`
   and put the page in the exploraself repo, in the tags folder beside the
   email map in the unlisted internal folder (never name that folder here);
   the run fails when an exploraself.com form adds a number the list does not
   describe;
3. tell Alexandru what changed, with the tag's name (never its number).

tests/tag-map.test.mjs fails when the code can send a tag the list does not
know.

## 18. What the team can do in /mentor (Alexandru, 2 Nov 2026)

Each team member has their own rights, ticked in /mentor → Settings → Team
("choose per team member what they can do … access like me on everything").
There are thirteen, in his words: answer questions, write letters and notes,
send sign-in links, send reset links, pause or resume a founder's letters,
change a founder's step (unlock), pause or unpause an account, delete a
founder, mentor profiles and a founder's mentor, the Mailchimp tools and tag
list, the payments (Stripe), the team itself, and inviting a founder at any
step, free (Founders → Invite a founder: the step opens at once and the gift
letter goes; nobody is ever moved down). "Everything (like Alexandru)" ticks
all thirteen.

A new member starts with the first six (TEAM_CAN in functions/api/mentor.js,
DEFAULT_RIGHTS in functions/_team.js); reading every founder and the CSV is
always allowed. The mentor key always has every right, and so do Alexandru's
own addresses (TEAM in functions/_team.js); nobody changes their own rights or
removes themselves. A member with the "team" right can add and remove members
and tick other members' rights.

This is enforced on the server: every /mentor action needs its right
(ACTION_RIGHT in functions/_team.js); an action that is not listed there is
the key's only. A new /mentor action: add it to ACTION_RIGHT under an existing
right, or add a right to TEAM_RIGHTS with its words (and RIGHT_WORDS in
public/mentor/mentor.js, which a test holds equal), and show or hide its button
with can('<right>') in public/mentor/mentor.js.
tests/team-permissions.test.mjs holds the rules.

## 19. Paid means paid (Alexandru, 2 Nov 2026)

In /mentor, "paid" is a real payment through Stripe (mode live). A test
payment is shown as Test and never counted; a founder on a paid step without
a payment (moved up or invited) is "given free". Grow opens with who joined,
how many paid and the share, who did not pay yet, who just paid and the money
in, for today, 7 days, 30 days or all (pulse in public/mentor/dash.js); the
amounts only for those with the payments right. A promise on a pay page or in
a letter names only what the step really opens (rule 6): the library is free
for everyone, so it is never sold as part of a step.

Refunds (Alexandru, 2 Nov 2026): every Base Camp has "Ask for a refund". The
founder chooses the programme they paid for and confirms their name and
email; it lands in /mentor → Refunds, in red, and Alexandru gets in touch
himself. Refunds are made in Stripe by a person: the code never refunds, and
never tells a founder a refund was made. "Mark done" needs the payments
right (functions/_refund.js, tests/refund.test.mjs).
