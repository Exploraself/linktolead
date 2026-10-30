# ExploraSelf Leadership Compass

The free Leadership Compass at `/compass` (design: Compass flow v18), with its
pages beside it. Plain HTML, CSS and JavaScript; no build, no dependencies.

| Path | What it is |
| --- | --- |
| `/compass` | The Compass: one continuous page; the menu scrolls to each section. |
| `/compass/summit` | The Summit, the top of Link to Lead ($1,989). |
| `/road2/` | Road 2, the Compass sales page: “Your business, on paper. Not in your head.” `/compass/welcome` and `/compass/welcome-a` redirect there. |

## Where the intelligence lives

- `engine.js`: the logic from “00 Leadership Compass · The Intelligence” (Drive). Domain scores (0–6) and bands (Needs you now / Taking shape / A strength), the twelve feedback versions, pains and goals, the compass reading, the sixteen launchpad pieces, what each group of numbers already tells you, and the What-if lab. Tested in `tests/compass.test.mjs`.
- `model.js`: the eight questions for each of the four stages (Building, Growing, Scaling, Leading), each with the record to open before answering.
- `app.js`: the page, drawn in parts; only a part whose markup changed is rewritten.
- `style.css`: the live Compass palette and fonts; every colour is a token on `.cf`, redefined for the dark workspace theme. Motion stops under `prefers-reduced-motion`.
- `assets/`: logo, fallback fonts, favicon (SVG, 32px PNG, Apple touch, 512px) and the 1200×630 share image.

## Honest by design

- Every figure is worked out from what the founder entered. A range is used at its middle and said with “about”; “Not sure yet” stays blank. No benchmarks, no comparisons with other founders.
- Feedback cards say nothing about a domain until its questions are answered.
- The What-if lab runs on the founder’s own month (or, without customers yet, their offer and the customers a month they plan for). The helper rate and the cost of one more person are theirs to set; until they are, those figures show “—”.

## Data

While the Compass is in preview, answers stay in this browser (`exploraself-compass-v2`, every access guarded). Entries from the earlier Compass (`exploraself-compass-v1`) are carried over on first load and left in place. The sales page keeps the name, email and stage it collects in `exploraself-profile`, which the Compass picks up so nothing is asked twice. Nothing is sent anywhere, except “Email me my results”: the founder asks, and the results go once through `/api/send-plan` (shown as switched off until the email key is set).

Accounts, the email step and the Account Plans come in the next PR.
