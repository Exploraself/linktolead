# The Founder's Blueprint

Link to Lead — the twelve-week founder programme. Lives at
**linktolead.exploraself.com**, separate from Broadcast and from the main site.

## What it is

Four domains — Lead yourself, Lead your people, Lead your business, Lead the
market. Twelve levels. Seven clarity points
in each domain at each level, so twenty-eight answers close a level and
eighty-four close the programme in one domain.

Three versions of the twelve, because the same question means a different
thing to a founder building, growing or scaling. The emphasis moves with the
stage: Building leans Self and Market, Growing leans People and Work, Scaling
spreads across all four.

## The ladder

| Levels | Opens with |
| --- | --- |
| 1–3 | The Founder Launchpad. Free. |
| 4–5 | The Boardroom: one session with Alexandru, and the full North Star. |
| 1–9 | Personal Leadership LAB, self-paced: the second session, two in total. $97. |
| All 12 | Business HUB: the third session, three in total (the Boardroom’s, the LAB’s, the HUB’s), and the LAB included. $750. |
| Everything | The Summit, with Alexandru every week. $1,989. (Internal tier key: `premium`.) |

All twelve are built regardless of what anyone pays. The ladder decides what
opens, never what exists.

## Running it

No build step, no dependencies. Serve `public/`.

```
npx serve public      # or any static server
```

## Deploying

Cloudflare Pages, connected to this repo.

- Framework preset: **None**
- Build command: **empty**
- Build output directory: **public**

## Rules

See `AGENTS.md` before changing anything. Most of what makes this programme
work is easy to remove by accident.

### Cloudflare settings

Two apps are built from this repo (checked 2 Nov 2026). The **Pages** app
**linktolead** serves the live site, linktolead.exploraself.com, with its
variables and secrets (section 8). The **Worker** **linktolead** runs the
hourly letters (`wrangler.toml` `[triggers]`; `SERIES_MODE` is set there).
The Worker's dashboard defaults are correct as they stand:

- Build command: **empty**
- Deploy command: **`npx wrangler deploy`**

`wrangler.toml` is the Worker's: it points at `public/`, bundles `worker.js`
(the hourly letters, and `/api/*` to `functions/api/`) and keeps the dashboard's
variables (`keep_vars`).

## 8. Settings in Cloudflare

Everything the site reads from Cloudflare lives on the Pages project
**linktolead** → **Settings → Variables and Secrets → Production**. After adding
or changing one, open **Deployments** and press **Retry deployment** on the
latest one, so the site picks it up. `wrangler.toml` keeps `keep_vars = true`,
so a deploy never removes them.

| Name | Type | What it does |
|---|---|---|
| `MAIL_POSTAL_ADDRESS` | Text | The postal address in every email footer. Without it no email is sent. |
| `MENTOR_KEY` | Secret | The key that opens `/mentor`. |
| `MAIL_FROM` | Text, optional | A different sender than `support@exploraself.com`. |
| `MENTOR_EMAIL` | Text, optional | Where a founder's question in **Ask Alexandru** is announced. Empty means `alex@exploraself.com`. |
| `MAILCHIMP_MODE` | Text, optional | `test` stops every Mailchimp call: each join is built and logged on `/mentor`, nothing is sent. Empty means send. |
| `MAILCHIMP_FORM_URL` | Text, optional | A different Mailchimp sign-up form link (`…list-manage.com/subscribe/post?u=…&id=…`). Empty uses the Link to Lead form. |
| `MAILCHIMP_AUDIENCE_ID` | Text, optional | The audience for API mode. Empty uses the form's list id. |
| `MAILCHIMP_API_KEY` | **Secret** | Switches Mailchimp to API mode: tags, updates and unsubscribes, and no form fields to satisfy. |
| `MAILCHIMP_DOUBLE_OPTIN` | Text, optional | `yes` makes Mailchimp send its own confirmation email before someone joins (API mode). |
| `SERIES_MODE` | Text, optional | The letters that follow each pain (`functions/_series.js`). Empty or `off` (the default): nobody is enrolled and nothing is sent. `test`: founders are enrolled and each letter that would go is logged (event `series-test`); nothing goes to founders and no Mailchimp tag is sent. `on`: the letters go, and each founder gets the series tag in Mailchimp. |
| `TOOLKIT_CODE` | Text, optional | The one 4-digit code that opens the Growth Toolkit for people without an account. Empty means `5689`. |

### Three roads, two forms, one account

Three sales pages, the roads, all ending at `/start`:

| Road | Address | Old addresses (302 here, query string kept) | Account form | Landing |
|---|---|---|---|---|
| Road 1 | `/road1/` (the long page, with the What-if Lab before the close) | `/`, `/b` | FULL | `road1` |
| Road 2 | `/road2/` (since 31 Oct, the Blueprint page "You keep making it better. You keep putting off the selling.": for the founder who builds, polishes and rebuilds; your week as two bars, six taps, four questions of their own answered back and gathered in "Your answers", nothing saved or sent) | — | FULL | `road2` |
| Road 3 | `/road3/` (the 12 Scrolls page) | `/a` | SIMPLE | `road3` |
| Road 4 | `/road4/` (the sales page for The Founder's Blueprint: the mirror of eight taps, the two kinds of stuck, week one drawn day by day, the twelve weeks as a climb) | — | FULL | `road4` |
| North 2 | `/north2/` (a North Star sales page; was `/road2.1/`) | `/road2.1` | FULL | `north2` |
| North 3 | `/north3/` (the North Star sales page; was `/road2/` until 31 Oct) | `/compass/welcome`, `/compass/welcome-a`, `/c` | FULL | `north3` |

**The landing rule (31 Oct 2026).** A page's landing is its address, and its
Mailchimp tag is `linktolead-` + that landing (`linktolead-road2`,
`linktolead-north3` …). Road pages and The Summit are Blueprint doors and send
the Founder Launchpad welcome; `/north1/`, `/north2/`, `/north3/` and the
North Star box are North Star doors and send "Your Leader's North Star is
open". Until 31 Oct `/north3/` stored `road2` and `/north2/` stored `road21`.
The first time the database opens after that, a one-time step (marker
`landing-north-2026-10-31` in the `migration` table) moves those founders,
only those who joined before the step ran, to `north3` / `north2`, so they
still count as North Star. Their Mailchimp tag is kept as it was
(`linktolead-road2` / `linktolead-road2.1`, in `student_profile.landing_tag`):
no tag on an existing contact is changed.

The redirects live in `functions/_landing.js` (the Worker and Pages both use
it), and every old address is in `run_worker_first` in `wrangler.toml`.

Every call to action on the three roads opens that page's form; none of them sends
a visitor to another page. The North Star's own "Who is this compass for?" box is
the SIMPLE form (landing `compass`, no landing tag). SIMPLE: first name, surname, email, consent — no password, ever;
these founders sign in by email link. FULL: also company (or "No company yet"),
what they want most, industry and a password (required, at least 10
characters). Either way the founder is signed in at once and lands on `/start`.

Road 4 asks nothing to be typed: its mirror is eight yes-or-no taps, read on the
page and never saved or sent. Its motion stops under `prefers-reduced-motion`
and with the **Pause motion** button in its footer.
`student_profile` keeps `signup_type`, `landing` and the `utm_*` tags they
arrived with. Mailchimp gets `Signup - Full` / `Signup - Simple`,
`salespageincubator1` / `salespageincubator2` / `salespageincubator3`,
`Interest - <goal>`, `Industry - <name>` and
COMPANY. `/mentor` shows all of it and a table of sign-ups per landing.
Landings stored before the roads (`a`, `b`, `c`) are moved to `road3`, `road1`
and `north3` the first time the database is opened; founders tagged before keep
their old Mailchimp landing tags, and get the new one at their next sync.
Unknown addresses get `public/404.html` with a 404 status.

### Emails: letters from Alexandru

Every email goes by Resend (Mailchimp sends none) as a short letter from Alexandru
(`functions/_letters.js`): paper background, Georgia, no banner, no buttons, plain
links, the signature image `/mail/signature.png` ("Alexandru" in a handwriting
font until a scan of the real one replaces the file), a plain-text part, and a
P.S. offer. The welcome (`launchpad-welcome`, once, on account creation), the
North Star results, Alexandru's notes and his answers in **Ask Alexandru** may carry
a paid offer (The Boardroom, Unshakeable); the sign-in link and **Your password was
changed** carry free ones only (Leadionaire, First 100 Clients, Built to Lead).
The footer (why it came, unsubscribe, postal address) is on every one.

Library downloads go through `/api/library?item=<key>`: signed-in only, logged,
and tagged once per book in Mailchimp as `Library - <book>` (API mode). `/mentor`
lists them per founder, filters the roster by them and puts them in the CSV.

The LAB workbook goes through `/api/workbook`: only for The LAB, The HUB and
The Summit (anyone else is sent to `/pay/?step=lab`), logged as
`workbook-download`, served from the private R2 bucket bound as `WORKBOOKS`.
The PDF is paid content and never sits in this public repo. Base Camp shows
“Download your workbook” only on those steps.

### Mailchimp, in three modes

- **Test** (`MAILCHIMP_MODE` = `test`): nothing leaves; `/mentor` shows what would have been sent.
- **Form** (the default): new founders with consent go through the public Link to Lead sign-up form. It cannot tag or unsubscribe, and Mailchimp refuses the join while the form marks a field as required that the account box does not ask for (Company and Phone). Fix that in Mailchimp: **Audience → Settings → Audience fields and \*|MERGE|\* tags**, untick **Required** for Company and Phone. Or add the API key.
- **Live API** (`MAILCHIMP_API_KEY` set): the founder is added or updated with tags `linktolead`, where they came from (`compass` / `sales-page`), their stage (`build` / `grow` / `scale`), once the North Star is done their weakest domain, and one tag per programme step reached: `Link to Lead - The Founder Launchpad`, `- The Boardroom`, `- The LAB`, `- The HUB`, `- The Summit`. Step tags accumulate: a founder in The LAB carries the Launchpad, Boardroom and LAB tags, and lowering a step in `/mentor` removes none. A step change in `/mentor` sends the tags at once. Unsubscribing, a pause or a delete marks them unsubscribed in Mailchimp (never a hard delete).

To get an API key: Mailchimp → your profile → **Extras → API keys → Create A Key**. Copy it once and add it in Cloudflare as a **Secret** named `MAILCHIMP_API_KEY`. Never paste it into the code, a chat or an email.

Nobody is sent to Mailchimp without consent. `/mentor` shows the mode, what is missing, the last 20 calls, a **Send a test join** button and **Send everyone with consent** for founders not yet in Mailchimp, which also sends the step tags to founders who joined before they existed. Each founder's page in `/mentor` shows their **Climb**: the step they started on and every change, with its date.

## 9. Light and dark, music, mentors (30 Oct 2026)

| What | Where |
|---|---|
| Light and dark on every page, kept per browser, following the device until picked (Device → Light → Dark) | `public/theme.js` (in every page's `<head>`), the switch in the header, the North Star top bar and the profile menu |
| Fonts: Newsreader (headings) + Inter (text), self-hosted | `public/assets/fonts.css` |
| The study room: music on Your Ground Plan, the programme, the Library and Ask Alexandru; the mini player (three pieces, light, energy, volume); Study and Focus mode; the Lamp (a pool of light on the question being written, a chord and a candle for each answer); the two-minute invitation | `public/music.js`, `public/music.css` |
| The incubator band (FULL accounts) and the Leader’s North Star strip | `public/cabinet.js` |
| Letters from the founder's mentor: name, title, photo, signature and reply address, set in `/mentor` (Mentors) and per founder; every letter closes with a good word, reply-here shortcuts, "See you soon" and a wish for the founder's part of the day, the signature and photo, and a P.S. | `functions/_mentor.js`, `functions/_letters.js` |
| Profile menu: Leader’s North Star, Light/Dark, "Letters from your mentor: On/Off" (consent, synced to Mailchimp; turning back on asks Mailchimp to confirm), "Delete my account" (two steps; Mailchimp unsubscribed, never hard-deleted) | `public/profile-menu.js`, `/api/letters`, `/api/account-delete` |
| Mailchimp landing tags | `salespageincubator1` / `2` / `3` (Road 1, 2, 3) |
| The North Star sales page | `/north1/` |

## 10. The Massive Growth Plan (31 Oct 2026)

The North Star ends with the Massive Growth Plan: 20 + 1 steps, after the
North Star Action Plan (which stays as it is, with its PDF).

| What | Where |
|---|---|
| Every word of the plan (Alexandru's approved text, ids `mgp-1` … `mgp-21`) | `public/northstar/growth-plan.js` (`window.GrowthPlan`): change the text there, never in code |
| Drawing it: the header, four domains in their colours, step 21, blanks as lines, "x of 21 done" | `public/northstar/growth.js`, styles in `public/northstar/crown.css` |
| Ticks (signed in only; a signed-out tick opens the sign-in) | `GET/POST /api/growth-plan` (`functions/api/growth-plan.js`), saved in `plan_tick` |
| The server's own list of the 21 ids (a test holds it equal to the file) | `functions/_growth.js` |
| /mentor: "Growth plan x/21" in Founders, the ticked steps with dates in the drawer, a "Growth plan" CSV column | `functions/api/mentor.js`, `public/mentor/` |

**Writing in it (full accounts).** Every run of `___` is a field in place
(blank id = step id + "." + its number in the step, counted across its
lines: `mgp-7.1` … never renumbered; the server's own list is
`GROWTH_BLANK_IDS` in `functions/_growth.js`, held equal to the file by a
test). What a founder writes is kept on the device first, then saved to
`growth_word` a moment after they stop typing and when a field loses focus
(`POST /api/growth-plan { token, blank, text }`, at most 500 characters; an
empty text deletes it; refused for an account that is not full,
`missingOf()`). Not full or signed out: lines, and "Complete your account to
write here". Filling a step never ticks it. The Library's plan card links to
`/northstar/#growth-plan` ("Fill it in online →"): Blueprint founders cross
with the North Star's one question, then land on the plan. /mentor's drawer
shows what they wrote under each step (`GET /api/mentor?growth=id`).
Deleting an account deletes `growth_word` too.

Growth Plan ticks share `plan_tick` with the Account Plans but are never
counted with them: `/api/plans` ("x of 32"), the count `/api/plans/tick`
returns and /mentor's "Plan steps done" stay the plans' own. No Mailchimp
tags.

## The Growth Toolkit (2 Nov 2026)

Free tools in two lists, **Personal leadership** (Lead yourself, Lead your
people) and **Business** (Lead your business, Lead the market), at `/tools/`.
One entry per tool in `public/tools/catalog.js`; a new tool is one entry
there, a page of its own, and its key in `functions/_tools.js`.

| Address | What |
| --- | --- |
| `/tools/` | Every tool in its list; signed in, the last result of each |
| `/runway/`, `/bottleneck/`, `/off-switch/` | Cover → the way in → one question per screen → the reading → The Leader's North Star |
| `/teleprompter/` | The teleprompter (Business), scripts kept on the device |
| `/12-days/` | 12 Days to Start Winning: letters sent by the site (`functions/_course.js`), the welcome at once, then one a morning from 8:00 the founder's time, Day 1 to 12 and a last "what next". Needs an account |
| `/toolkit/` | The page for ads and links: one offer, one button |

The way in (`public/tools/gate.js`): an account opens it at once. Without one,
the visitor asks for a code (`/api/toolkit`), gets their own six digits by
email, types them in, and keeps a pass in the browser. Addresses in
`TOOLKIT_EMAILS` (Cloudflare settings, comma separated) and the team skip the
code. Mailchimp tag `Growth Toolkit` (it replaced `TOOLS`) the first time an
account opens each tool. The welcome, "Welcome to the Growth Toolkit", goes
once per address the first time an account opens the toolkit, new or
existing, with their yes to letters (`toolkit_welcome` table); its P.S. is one
free assessment or article on exploraself.com, matched by the tool they
opened, or on the Tools page by what they want most (`TOOLKIT_BY_TOOL`,
`TOOLKIT_BY_INTEREST` in `functions/_letters.js`). A code holder's welcome is
the code letter itself.
`/mentor` shows which tools each founder opened and their day in the 12 days.
The North Star has the Growth Toolkit in its left bar. The 12-day letters need
the hourly cron in `wrangler.toml` (`[triggers]`), which runs `JOBS` in
`worker.js` (the letters that follow each pain first, then 12 Days).

## The letters that follow each pain (2 Nov 2026)

37 letters approved by Alexandru, word for word, in
`functions/_series-letters.js`; the engine is `functions/_series.js`, sent by
the site (Resend) like 12 Days, from the same hourly cron. Off until
`SERIES_MODE` says otherwise (see 8. Settings in Cloudflare).

| Series | Starts when | Letters | Mailchimp tag |
| --- | --- | --- | --- |
| After the North Star | The Leader's North Star is finished (every domain answered) with a first pain | That pain's 4: day 1, 3, 6, 10 after | `linktolead-letters-northstar` |
| Never started | An account is made (sign-up or Google) and nothing is written in Level 01 | 3: day 2, 5, 9 after; stops when they write in Level 01 | `linktolead-letters-not-started` |
| Finished Level 03 | Levels 01, 02 and 03 all hold an answer | 2: the morning after, then day 4 | `linktolead-letters-level3` |

Each letter goes from 8:00 in the founder's time zone (never after 21:00).
At most one automatic letter a day across every series and 12 Days: the
series run first in the hour, so 12 Days waits for tomorrow on that day.
Letters that count the days ("Ten days ago…") go on their own day or not at
all; any other goes up to 3 days late, never on the next letter's day. Only
founders who said yes to letters. A later series stops an earlier one;
unsubscribing stops it; a paused account waits; a question in Ask Alexandru
pauses the letters until the mentor presses **Resume letters** in the
founder's drawer in `/mentor` (which also shows the series, the letter and
**Pause letters**). The name, the want, the day the step is due ("by
Wednesday") and the storm rule from Level 03 are filled from the founder's
own answers; one that is not known is left out, never invented.

## The email journey map (2 Nov 2026)

`node scripts/email-map.mjs out.html --exploraself ../exploraself` draws
every letter a founder can get, in journey order (they find us → they open a
door → they use it → we stay close → their account stays safe → the team
hears), rendered by the real letter builders for a sample founder, Sam. With
the exploraself repo, the assessment results letters of exploraself.com are
drawn too (bundled with esbuild from that repo; set `ESBUILD=` to its path if
it is not in that repo's node_modules). The page lives in /internal,
Internal → Emails. AGENTS.md rule 14 keeps it current; tests/email-map.test.mjs
fails when a letter is missing.

## The team in /mentor (2 Nov 2026)

A team account reads everything, answers, writes letters, sends sign-in
links, pauses or resumes letters and changes a step. Pausing or deleting a
founder, the team, the mentor profiles and the Mailchimp tools stay with the
mentor key: `TEAM_CAN` / `KEY_ONLY` in `functions/api/mentor.js` (AGENTS.md
rule 18). Settings shows a team account what it can and cannot do.

## The Mailchimp tag page (2 Nov 2026)

`node scripts/tag-map.mjs out.html --exploraself ../exploraself` draws every
Mailchimp tag: what it means, where it comes from and when it is added, from
`functions/_tag-list.js`, and checks every tag number the exploraself.com
forms add. The page lives in /internal, Internal → Mailchimp tags. In
`/mentor` → Settings → **Mailchimp tags** (mentor key only), the audience's
own tags are read from Mailchimp and sorted Keep · Old (safe to delete) ·
Ask, by name, never by number. An address Mailchimp deleted for good is shown
as "deleted in Mailchimp", never as failed or waiting. AGENTS.md rule 17
keeps it current; tests/tag-map.test.mjs fails when a tag is missing.
