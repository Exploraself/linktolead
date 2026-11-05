# ExploraSelf Leader’s North Star

The free Leader’s North Star at `/northstar` (design: North Star flow v18), with its
pages beside it. Plain HTML, CSS and JavaScript; no build, no dependencies.

| Path | What it is |
| --- | --- |
| `/northstar` | The North Star: one continuous page; the menu scrolls to each section. |
| `/northstar/summit` | The Summit, the top of Link to Lead ($1,989). |
| `/north3/` | Road 2, the North Star sales page: “Your business, on paper. Not in your head.” `/compass/welcome` and `/compass/welcome-a` redirect there. |

## Simpler (3 Nov 2026)

`clarity.js` holds three things beside `app.js`: on a phone, one Menu button for the Founder’s Blueprint, the Growth Toolkit, 12 Days, How to use this, Download, Full screen and Light and dark; Before you start one question at a time (“Before you start · 2 of 4”, Back beside Next); and the 12 Days to Start Winning bonus (a card in the side and at the end, a pop-up in place, `POST /api/course`). In `crown.css`: “four parts” said once, a locked part is one quiet line (the What-if lab waits for Part 3), the Growth Plan shows the next five steps with “See all 21 steps”, and the questions have Back beside Next, at the bottom on a phone.

## Clean look (5 Nov 2026)

`clean.css` loads last and changes the look only (Alexandru, 5 Nov 2026): a white page, Atkinson Hyperlegible for the text and Newsreader for titles, hairlines instead of heavy boxes, the left menu, the hero, the banner, the reading, the Growth Plan header and the next step on white. The four-domain wheel in the hero stays as it is (his pick). The what-if lab keeps one flat navy panel. The dark workspace theme keeps its own look. "How the North Star works" links to the presentation page, `/north1/`, under the four parts in the left menu and in the phone's Menu (`clarity.js`).

## Where the intelligence lives

- `engine.js`: the logic from “00 Leader’s North Star · The Intelligence” (Drive). Domain scores (0–6) and bands (Needs you now / Taking shape / A strength), the twelve feedback versions, pains and goals, the compass reading, the sixteen launchpad pieces, what each group of numbers already tells you, and the What-if lab. Tested in `tests/compass.test.mjs`.
- `model.js`: the eight questions for each of the four stages (Building, Growing, Scaling, Leading), each with the record to open before answering.
- `app.js`: the page, drawn in parts; only a part whose markup changed is rewritten.
- `style.css`: the live North Star palette and fonts; every colour is a token on `.cf`, redefined for the dark workspace theme. Motion stops under `prefers-reduced-motion`.
- `assets/`: logo, fallback fonts, favicon (SVG, 32px PNG, Apple touch, 512px) and the 1200×630 share image.

## Honest by design

- Every figure is worked out from what the founder entered. A range is used at its middle and said with “about”; “Not sure yet” stays blank. No benchmarks, no comparisons with other founders.
- Feedback cards say nothing about a domain until its questions are answered.
- The What-if lab runs on the founder’s own month (or, without customers yet, their offer and the customers a month they plan for). The helper rate and the cost of one more person are theirs to set; until they are, those figures show “—”.

## Data

While the North Star is in preview, answers stay in this browser (`exploraself-compass-v2`, every access guarded). Entries from the earlier North Star (`exploraself-compass-v1`) are carried over on first load and left in place. The sales page keeps the name, email and stage it collects in `exploraself-profile`, which the North Star picks up so nothing is asked twice. Nothing is sent anywhere, except “Email me my results”: the founder asks, and the results go once through `/api/send-plan` (shown as switched off until the email key is set).

Accounts, the email step and the Account Plans come in the next PR.
