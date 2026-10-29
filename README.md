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
| 4–5 | The Boardroom: one session with Alexandru, and the full Compass. |
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

### Three sales pages, two forms, one account

Three sales pages, all ending at `/start`:

| Page | Address | Account form | Landing |
|---|---|---|---|
| A | `/a` (the 12 Scrolls page) | SIMPLE | `a` |
| B | `/` and `/b` (the long page, with the What-if Lab before the close; `/b/index.html` is a copy of `/index.html`) | FULL | `b` |
| C | `/c` → 302 to `/compass/welcome` (query string kept), and `/compass/welcome-a` | FULL | `c` |

Every call to action on A, B and C opens that page's form; none of them sends
a visitor to another page. The Compass's own "Who is this compass for?" box is
the SIMPLE form (landing `compass`, no landing tag). SIMPLE: first name, surname, email, consent — no password, ever;
these founders sign in by email link. FULL: also company (or "No company yet"),
what they want most, industry and a password (required, at least 10
characters). Either way the founder is signed in at once and lands on `/start`.
`student_profile` keeps `signup_type`, `landing` and the `utm_*` tags they
arrived with. Mailchimp gets `Signup - Full` / `Signup - Simple`,
`Landing - 12 Scrolls` (A) / `Landing - Home` (B) / `Landing - Compass welcome` (C),
`Interest - <goal>`, `Industry - <name>` and
COMPANY. `/mentor` shows all of it and a table of sign-ups per landing.
Unknown addresses get `public/404.html` with a 404 status.

### Emails: letters from Alexandru

Every email goes by Resend (Mailchimp sends none) as a short letter from Alexandru
(`functions/_letters.js`): paper background, Georgia, no banner, no buttons, plain
links, the signature image `/mail/signature.png` ("Alexandru" in a handwriting
font until a scan of the real one replaces the file), a plain-text part, and a
P.S. offer. The welcome (`launchpad-welcome`, once, on account creation), the
Compass results, Alexandru's notes and his answers in **Ask Alexandru** may carry
a paid offer (The Boardroom, Unshakeable); the sign-in link and **Your password was
changed** carry free ones only (Leadionaire, First 100 Clients, Built to Lead).
The footer (why it came, unsubscribe, postal address) is on every one.

Library downloads go through `/api/library?item=<key>`: signed-in only, logged,
and tagged once per book in Mailchimp as `Library - <book>` (API mode). `/mentor`
lists them per founder, filters the roster by them and puts them in the CSV.

### Mailchimp, in three modes

- **Test** (`MAILCHIMP_MODE` = `test`): nothing leaves; `/mentor` shows what would have been sent.
- **Form** (the default): new founders with consent go through the public Link to Lead sign-up form. It cannot tag or unsubscribe, and Mailchimp refuses the join while the form marks a field as required that the account box does not ask for (Company and Phone). Fix that in Mailchimp: **Audience → Settings → Audience fields and \*|MERGE|\* tags**, untick **Required** for Company and Phone. Or add the API key.
- **Live API** (`MAILCHIMP_API_KEY` set): the founder is added or updated with tags `linktolead`, where they came from (`compass` / `sales-page`), their stage (`build` / `grow` / `scale`), once the Compass is done their weakest domain, and one tag per programme step reached: `Link to Lead - The Founder Launchpad`, `- The Boardroom`, `- The LAB`, `- The HUB`, `- The Summit`. Step tags accumulate: a founder in The LAB carries the Launchpad, Boardroom and LAB tags, and lowering a step in `/mentor` removes none. A step change in `/mentor` sends the tags at once. Unsubscribing, a pause or a delete marks them unsubscribed in Mailchimp (never a hard delete).

To get an API key: Mailchimp → your profile → **Extras → API keys → Create A Key**. Copy it once and add it in Cloudflare as a **Secret** named `MAILCHIMP_API_KEY`. Never paste it into the code, a chat or an email.

Nobody is sent to Mailchimp without consent. `/mentor` shows the mode, what is missing, the last 20 calls, a **Send a test join** button and **Send everyone with consent** for founders not yet in Mailchimp, which also sends the step tags to founders who joined before they existed. Each founder's page in `/mentor` shows their **Climb**: the step they started on and every change, with its date.
