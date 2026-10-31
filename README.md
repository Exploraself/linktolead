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
| 1–9 | Personal Leadership LAB, self-paced, two sessions. $97. |
| All 12 | Business HUB, three sessions in total and the LAB included. $397. |
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

The dashboard's defaults are correct as they stand:

- Build command: **empty**
- Deploy command: **`npx wrangler deploy`**

`wrangler.toml` points at `public/` and declares no Worker script, so Cloudflare
serves the files directly.

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

Growth Plan ticks share `plan_tick` with the Account Plans but are never
counted with them: `/api/plans` ("x of 32"), the count `/api/plans/tick`
returns and /mentor's "Plan steps done" stay the plans' own. No Mailchimp
tags.
