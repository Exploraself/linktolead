# Offer Master: test a page whenever you want

Eight Claude skills that check an offer the way a careful buyer would: where
people drop off, what their "no" really means, the four levers (what you
promise, how much they believe it, how fast it works, how easy it feels), one
fair guarantee, an honest reason to buy now, and an honesty check that catches
invented numbers and fake scarcity. Free, MIT licence, by Liam Johnston
(github.com/Liamrjohnston/offer-master-skill; licence in
`.claude/skills/OFFER-MASTER-LICENSE`).

They live in `.claude/skills/`, so every Claude Code session on this repo has
them: on the web (claude.ai/code), in the desktop app, or in a terminal.

## The one command

Type this in a Claude Code session on linktolead, and change the page and the
facts:

```
/offer-master Test the offer on /road5/ (public/road5/index.html).
It sells The Boardroom: $27, one hour 1:1 with Alexandru online, Levels 04–05,
what they write read before the call. Use the real numbers from the database
(page_count for road5, accounts, live payments for step "session") and these
objections: [what people said, in their words, or "none yet"].
```

You get back one card: where it leaks (with your numbers), what buyers mean,
the four levers scored, the offer rebuilt, the honesty check, and **one test
for this month**.

## One part only

| Want | Type |
|---|---|
| Is it the offer, or traffic? | `/offer-diagnosis` + the page and your numbers |
| What's weak about this page? | `/offer-levers` + the page |
| A sharper one-line promise and a first win | `/offer-included` |
| Check a page for anything invented or pushy | `/offer-honesty-check` + the page |
| A fair guarantee, and what it costs | `/offer-guarantee` |
| Price, honest urgency, the cost of waiting | `/offer-urgency-name-price` |

## Our rules come first

AGENTS.md wins over the skill: no invented counts or testimonials (rule 6),
refunds are asked for in Base Camp (no new money-back lines unless Alexandru
decides), the step names (The Boardroom, the LAB, the HUB, the Summit) are
kept, and any change to a page is previewed at 390 and 1280 before a PR.

## Where the numbers are

- **Page moments:** `page_count` (road1, road3, road4, road5): view, scrolled
  25/50/75/100%, a pain tapped, the weeks moved, a pay button tapped. Also in
  /mentor.
- **Accounts, steps, payments:** /mentor → Grow (live payments only; tests are
  shown as Test).
- **What people say:** replies to the letters, refund requests, the calls.
