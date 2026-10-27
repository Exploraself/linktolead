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

Each money question is one box: choose a range, or choose “Type the exact amount” and the same box becomes a number field (with a “Ranges” button to go back). A chosen range is used at its middle (an open top range at its floor), and every result that leans on a range is marked ≈. Only the explicit zero choice supplies zero. Range bounds are entry aids, not business benchmarks.

Calculations separate delivery/selling contribution, shared costs, the visitor's allowance for unpaid hours, and actual cash receipts/payments. Scenario sliders change only the assumptions the visitor moves. Results point to decisions and records to reopen. There are no comparisons with other founders, invented counts, general industry benchmarks, success claims, payment claims or automated readiness verdicts.

By Alex's explicit instruction in the task, the 35% single-customer and 50% founder-dependence prompts are retained as **questions worth checking**, with their source and limits stated. They are product conversation prompts, not safety thresholds or industry averages. The next-stage panel says **Next stage to explore** and never blocks navigation.

The Compass runs in four steps: **01 Get clear · Know yourself** (stage + eight questions), **02 See your numbers · Know your people** (inputs), **03 Know your numbers** (the picture + what-if lab), **04 Choose your next steps · Know your market** (feedback for all four domains, three lines of strategy per domain, the practical next steps, and the bridge into Link to Lead). The per-domain feedback steps (`FEED`) and the matching Blueprint level (`BP_LEVEL`, mirroring `LEVEL_NAMES` in `/content.js`) live in `app.js`.

The strategy asks three lines per domain (In 90 days I want · This week I will · I'll know it worked when), stored in the existing `goal`, `experiment` and `review` keys so older entries still show.

## Data and future changes

Answers use the separate `exploraself-compass-v1` localStorage key. Every access is guarded by try/catch; restricted/private storage falls back to the current in-memory session with a download backup available. Nothing is submitted to a server. The tool starts blank; it does not generate fictional customer records or revenue. Imported legacy data and strategy fields are preserved. Older automatic range amounts are kept visibly for review, but are not used until the visitor enters an amount. Moving between origins requires an explicit JSON backup/restore.

“Send it by email” posts the plan to `/api/send-plan`, which sends it once through Resend and stores nothing but a one-day rate-limit row. It sends from `support@exploraself.com` (already verified in Resend) and stays hidden until `RESEND_API_KEY` is set in the Cloudflare project. No analytics, CRM or list sign-up is included. Keep the Founder's Blueprint's files, existing `public/assets/`, `AGENTS.md`, `wrangler.toml`, `scripts/` and `tests/` unchanged.

## Checks

- Open `public/compass/index.html` directly or serve `public/` statically; check the overview, all four domains/stages, numbers, strategy and help.
- Check `/compass` and `/compass/` with local assets, no routing changes.
- Check 390px width, both themes, explicit light overriding device-dark, keyboard controls and reduced motion.
- Try blank/zero/conflicting entries, ranges followed by visitor-entered amounts, exact entry, independent scenario changes, backups (including older ones), blocked storage, refresh, text export and print.
- In a PR, verify every added/changed path begins `public/compass/` and all existing files are byte-identical to the base commit.
