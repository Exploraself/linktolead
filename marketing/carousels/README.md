# Founder carousels

Instagram carousels for Alexandru Cojocari (ExploraSelf): ten slides of 1080 × 1350 each, drawn from plain data so the words can change without touching a design tool.

| | |
| --- | --- |
| `data/cNN-*.mjs` | One carousel per file: the ten slides, the caption, the hashtags and the facts to check. |
| `BRIEF.md` | How to write a new one: voice, rules, slide types, sizes. |
| `lib/` | The template: two fonts (Newsreader, Inter), three colours (warm black, ivory, gold), gold line drawings on a blueprint grid. |
| `render.mjs` | Draws the slides with the browser already used for the manuals. |
| `gallery.mjs` | Builds a review page from the drawn slides. |
| `captions.md`, `facts.md` | Written by `render.mjs` from the data: every caption, and every fact and sum to check before posting. |

## Make the slides

```bash
node marketing/carousels/render.mjs --video
```

Writes `marketing/carousels/out/<id>/` (ignored by git): ten PNGs, a contact sheet, and with `--video` an MP4 of slide 1 that draws itself in. Give ids to draw only some: `node marketing/carousels/render.mjs c04 c09`. It refuses a carousel that breaks the spine (ten slides, a hook first, a question last) and warns when text overflows.

```bash
node marketing/carousels/gallery.mjs
```

Builds `marketing/carousels/out/gallery/`: one page with every carousel, its caption and its facts, and buttons to save a slide, the moving cover or all ten.

## Before posting

1. Read `facts.md`. Every historical fact has a source to check; every sum is shown.
2. The footer shows “Alexandru Cojocari”. To show the Instagram handle instead, change `BRAND` in `lib/template.mjs`.
3. The call to action is one of two, set per carousel: the Unshakeable assessment (`exploraself.com/unshakeable`, paid, never called free) or the free North Star (`linktolead.exploraself.com/northstar`).
