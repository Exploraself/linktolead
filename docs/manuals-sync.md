# Manuals sync report

*Written by `node scripts/make-manuals.mjs`. The three manuals are built from `public/levels-v4.js`, so they match the app by construction; this report shows the counts.*

|  | Building | Growing | Scaling |
| --- | --- | --- | --- |
| Levels (promise, word, old and new) | 12 of 12 | 12 of 12 | 12 of 12 |
| Domains: tap, slide, sentence, four lines | 48 of 48 | 48 of 48 | 48 of 48 |
| Insights, “Done when”, what you keep, smaller steps | 48 of 48 | 48 of 48 | 48 of 48 |
| Day screens added (the day question) | 29 | 29 | 29 |
| Stage notes | 12 | 4 | 3 |
| Chapter readings, build pages, sessions | 3, 3, 2 | 3, 3, 2 | 3, 3, 2 |
| Blueprint parts | 8 | 8 | 8 |

## Against the manuals in the Library today

| | Library PDFs (27 Oct) | These previews |
| --- | --- | --- |
| Method | The earlier seven clarity points, 28 answers a level | Version 4: tap, slide, write once, four lines back |
| Level promises matching the app | 0 of 36 | 36 of 36 |
| Actions with a day and a “Done when” | none | 48 of 48 |
| Built from | `levels-build/grow/scale.js` (old) | `levels-v4.js` (the app) |

The Library PDFs (`public/library/blueprint-*.pdf`) are replaced only when Alexandru approves the previews: `node scripts/make-manuals.mjs --library`.
