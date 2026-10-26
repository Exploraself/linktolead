# ExploraSelf Leadership Compass

A self-contained addition to the existing Founder's Blueprint. All files belong under `public/compass/`. There is no build, package manager, backend or new Pages configuration.

## Where the intelligence lives

- `model.js`: the 32 reflection questions, four domains and stages, 18 number definitions, arithmetic, input validation, money-range choices, dependence questions and suggested action ordering. These are transparent JavaScript rules, not a remote AI or hidden model.
- `app.js`: screen rendering, visual maps, question responses, the seven-point strategy cards, scenario controls, backup/restore, text plan, print and browser persistence.
- `style.css`: exact host palette, domain colours, Fraunces/Libre Franklin fonts, larger text, responsive layout, light/device/dark themes and print layout. Every colour is a token on `:root`; the required device and explicit dark-mode selectors override them.
- `index.html`: entry point, local scripts, host font stylesheet, navigation and settings. The small `<base>` initializer handles the bare `/compass` URL without a redirect, routing changes or a server dependency. It also works from `file://`.
- `assets/`: local logo and fallback fonts. The requested Google Fonts CSS is included; there are no CDN scripts or runtime dependencies.

Any contributor with access to **Exploraself/linktolead** can inspect these files. Making edits requires repository write access or a pull request from a fork. Access to a different repository does not grant access here. Merge a reviewed PR into `main` for the existing deployment to pick it up.

## Inputs and results

The visitor chooses their stage, answers eight reflection questions for that stage (two per domain) and records dated examples. The numeric questions ask for the same month's sales, orders, delivery/selling/running costs, customers, founder hours, available cash, receipts, payments and visitor-selected limits. Unknowns stay blank.

Money ranges are entry aids only. After a nonzero range is chosen, the visitor enters their own approximate amount. No midpoint or default is manufactured. Only an explicit zero choice supplies zero. Approximate entries are labelled. Range bounds validate the visitor's amount; they are not business benchmarks.

Calculations separate delivery/selling contribution, shared costs, the visitor's allowance for unpaid hours, and actual cash receipts/payments. Scenario sliders change only the assumptions the visitor moves. Results point to decisions and records to reopen. There are no comparisons with other founders, invented counts, general industry benchmarks, success claims, payment claims or automated readiness verdicts.

By Alex's explicit instruction in the task, the 35% single-customer and 50% founder-dependence prompts are retained as **questions worth checking**, with their source and limits stated. They are product conversation prompts, not safety thresholds or industry averages. The next-stage panel says **Next stage to explore** and never blocks navigation.

The strategy cards use the host's fixed seven-point order in every domain: **Name it · Evidence · Gap · Cost · Decision · Move · Review**. Prompts name the records to open, what to count/copy and what to write. No programme framework names are surfaced.

## Data and future changes

Answers use the separate `exploraself-compass-v1` localStorage key. Every access is guarded by try/catch; restricted/private storage falls back to the current in-memory session with a download backup available. Nothing is submitted to a server. The tool starts blank; it does not generate fictional customer records or revenue. Imported legacy data and strategy fields are preserved. Older automatic range amounts are kept visibly for review, but are not used until the visitor enters an amount. Moving between origins requires an explicit JSON backup/restore.

No analytics, CRM, account system, email collection, paid API or credentials are included. Adding one requires a separately scoped change. Keep the Founder's Blueprint's files, existing `public/assets/`, `AGENTS.md`, `wrangler.toml`, `scripts/` and `tests/` unchanged.

## Checks

- Open `public/compass/index.html` directly or serve `public/` statically; check the overview, all four domains/stages, numbers, strategy and help.
- Check `/compass` and `/compass/` with local assets, no routing changes.
- Check 390px width, both themes, explicit light overriding device-dark, keyboard controls and reduced motion.
- Try blank/zero/conflicting entries, ranges followed by visitor-entered amounts, exact entry, independent scenario changes, backups (including older ones), blocked storage, refresh, text export and print.
- In a PR, verify every added/changed path begins `public/compass/` and all existing files are byte-identical to the base commit.
