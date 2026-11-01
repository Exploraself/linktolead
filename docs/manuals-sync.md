# Manuals sync report

*Written by `node scripts/make-manuals.mjs`. The three manuals are built from `public/levels-v4.js`, so they match the app by construction; this report shows the counts.*

|  | Building | Growing | Scaling |
| --- | --- | --- | --- |
| Levels (promise, word, old and new) | 12 of 12 | 12 of 12 | 12 of 12 |
| Domains: tap, slide, sentence, four lines | 48 of 48 | 48 of 48 | 48 of 48 |
| Insights, “Done when”, what you keep, smaller steps | 48 of 48 | 48 of 48 | 48 of 48 |
| Day screens added (the day question) | 29 | 29 | 29 |
| Stage notes | 12 | 4 | 3 |
| Chapter readings, build pages, sessions | 3, 3, 3 | 3, 3, 3 | 3, 3, 3 |
| Blueprint parts | 8 | 8 | 8 |

## Against the manuals they replace

| | The old Library PDFs (27 Oct) | These manuals |
| --- | --- | --- |
| Method | The earlier seven clarity points, 28 answers a level | Version 4: tap, slide, write once, four lines back |
| Level promises matching the app | 0 of 36 | 36 of 36 |
| Actions with a day and a “Done when” | none | 48 of 48 |
| Built from | `levels-build/grow/scale.js` (old) | `levels-v4.js` (the app) |
| Pages (Building · Growing · Scaling) | 79 · 77 · 80 | 76 · 76 · 76 |

`node scripts/make-manuals.mjs --library` writes these to `public/library/blueprint-*.pdf`, the files founders download. Run it again whenever `public/levels-v4.js` changes, so the manuals never drift from the app.
