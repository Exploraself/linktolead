# Carousel brief · how to write one

Read this whole page, then read `data/c01-ai-multiplies.mjs`, `data/c02-checklist-1935.mjs` and `data/c03-discount-math.mjs`. They are the standard: copy their voice, density and rhythm.

## Who it is for, and what it says

- **Voice:** Alexandru Cojocari, leadership mentor and coach (business and life), speaking in the first person (“I”) or to the reader (“you”). UK English. Short sentences someone could say on camera. Direct, warm, clear. Never “he/him” about Alexandru; if a third person is needed, “Alexandru and the team”.
- **Audience:** early-stage founders and ambitious people who feel called to more but lack direction or confidence.
- **Core message, in a new form each time:** *AI multiplies what you do. Leadership decides what is worth doing.* Results = Direction × Execution. Never anti-AI: Alexandru uses AI every day to build ExploraSelf, and speaks as a builder who knows where AI stops. Pattern: concede what AI (or the tool, or the spreadsheet) does well, then turn to what it cannot do.
- **Arguments bank** (one per carousel): scarcity (same tools for everyone, so the person becomes the advantage) · direction (AI answers the question you ask; leadership decides which question matters) · responsibility (AI suggests; only a person chooses and carries the consequence) · confidence (information never made anyone brave; kept promises do) · trust (in infinite content, people follow the person they trust).
- **Name the feeling before the argument.** Pain: productive but lost; others moving faster; knowing but not doing; “if AI can do my job, what am I worth?”. Desire: be the one people look to; build something with your name on it that serves people; the peace of a clear direction; confidence from evidence.
- **P.A.C.E.** = Pause, Assess, Choose, Execute. Never “Calculate”.

## Real stories only (never add a detail)

- Furniture business in his late teens: a great craftsman, poor money management, late orders; his father closed it. Lesson: skill without leadership collapses.
- Moldova to Italy; a business degree and a master’s in political science. Lesson: choose a bigger life.
- Classic Physique win (IFBB, 2019). Lesson: discipline unseen; confidence from evidence.
- Personal trainer: “a time to push, a time to help”. Lesson: leadership is serving.
- “Unbalance for the balance”. Lesson: choose a season of focus and own the trade-off.
- Building ExploraSelf with AI tools. Lesson: he knows what AI cannot do.

The one quote of his you may use (quote card): “I believe each of us has been given talents, and that we are meant to multiply them, not bury them.” No other quotes, from anyone. History is told in your own words, never as a quotation.

## Rules that are never broken

1. **No invented numbers, testimonials, clients, results or scarcity.** Every number is (a) a fact on your assignment’s list, (b) arithmetic anyone can redo (show it), or (c) a blank for the founder’s own number. Never “studies show”, never “most founders…”, never a benchmark (“industry average is…”). Speak to the reader, not about other people.
2. **History is exact or absent.** Use only the facts listed for your carousel. Add every fact and every sum to `facts` with where to check it. If unsure of a detail, leave it out.
3. **A practical step names what to open, count and write.** “Open last week’s calendar and write the three activities that took the most hours” is a step. “Reflect on your time” is not.
4. **Numbers serve judgement.** Every number points at a decision a person has to own. Say plainly when a machine could do the sum; then move the reader to the part only they can do.
5. **Calls to action:** `cta: 'unshakeable'` (the Unshakeable assessment, paid: never call it free) or `cta: 'northstar'` (the North Star, free). The slide is built for you; you only write the question.
6. No emoji. No hashtags on slides. No framework or tool names from Alexandru’s books. No New Age language.

## The ten slides (fixed)

| # | Type | Job |
| --- | --- | --- |
| 1 | `hook` | Stop the scroll: a feeling, a sharp contrast, a number or a date. |
| 2 | `story` | Build interest with an example: the truth (what AI or the obvious way does well, or the story’s set-up). |
| 3 | `story` | The turn: the example confirms the hook and pushes the reader on. |
| 4–5 | `diagram` | Keep attention with a picture: the arithmetic, the timeline, the map. |
| 6–9 | `steps`, `template`, `script`, `checklist`, `rule` | Practical: what to do this week. Use at least three different types; slide 9 is usually a `rule` (the point in one sentence). |
| 10 | `cta` | One question, then the action. |

## Text markup

`*word*` gold accent (italic in headlines) · `**word**` bold · `{{label}}` a blank with its label · `\n` new line.

## Slide fields and sizes (stay inside them; the renderer warns when text overflows or shrinks)

- `hook`: `art` (a name below) **or** `big` (a short number such as `'168'`, `'$5'`, `'1.01<sup>52</sup>'`), `pre` (≤ 22 characters, caps line above), `title` (one or two words, ≤ 10 characters, the gold line), `post` (≤ 22 characters, italic line), optional `sub` (≤ 50), optional `fig` (the drawing’s caption, e.g. `'FIG. 07 — 14 JULY 1863'`).
- `story`: `title` (≤ 70), optional `text` (≤ 130), `card` (below), optional `note` (≤ 60, beside the card; leave it out for a full-width card), optional `foot` (≤ 55, bottom right with the arrow).
- `diagram`: `title` (≤ 70), optional `text` (≤ 110), `d` (below), optional `foot` (≤ 55).
- `steps`: `title` (≤ 55), `items`: 3 or 4 of `{ h (≤ 34), p (≤ 100) }`.
- `template`: `title` (≤ 45), optional `label`, `lines`: 2–4 sentences with `{{blanks}}`, optional `hint` (≤ 90).
- `script`: `title` (≤ 50), `lines`: 3–5 of `{ who: 'them'|'me'|'aside', label, text (≤ 120) }`.
- `checklist`: `title` (≤ 50), `items`: 3–5 of `['main line (≤ 60)', 'optional small line (≤ 70)']`.
- `rule`: optional `kicker`, `text` (≤ 85, the point), optional `p` (≤ 140).
- `cta`: `question` (≤ 75), optional `save` (≤ 60; default “Save it for Monday. Send it to one founder who needs it.”), optional `kicker`.

### Cards (slides 2–3)

- `calendar`: `head`, `meta`, `days` (default Mon–Fri), `hours: [8, 18]`, `blocks: [{ d: 0, from: 9, to: 11, label, hl, dark, span }]`
- `chat`: `head`, `meta`, `msgs: [{ text, me, at }]` and `{ typing: true, text }` for a small line under them
- `doc`: `head`, `meta`, `rows: [['label', 'value'], ['label', 'value', 'total']]`, optional `stamp` (≤ 20)
- `note`: `text` (≤ 120), `sign`
- `list`: `head`, `meta`, `items: [{ t, done, v }]` (`v: ''` draws a blank to fill)
- `quote`: `text`, `who` (only the one quote above)
- `art`: `art` (a name below), `fig`, `caption`
- `receipt`: `head`, `meta`, `value`, `unit`, `rows: [['label', 'value']]`

### Diagrams (slides 4–5)

- `equation`: `rows` of terms and operators (`×`, `=`, `+`, `−`, `÷`, `→`), `head` (index of a label row), `hl`, `dim`
- `bars`: `items: [{ label, value, display, hl, note }]` (2–6)
- `columns`: same, upright (3–6)
- `curve`: `series: [{ label, points: [[x, y]…], end, hl }]`, `xLabels: [[x, 'label']]`, `grid: [values]`, `ymin`, `ymax`
- `dots`: `total`, `cols`, `groups: [{ n, label, tone: 'gold'|'soft'|'dim'|'ink'|'paper' }]`, `rest` (label for the uncoloured dots)
- `matrix`: `x: ['low', 'high']`, `y: ['low', 'high']`, `q: [[top-left, top-right], [bottom-left, bottom-right]]` (each `'Title'` or `['Title', 'line']`), `hl: [row, col]`
- `flow`: `steps: [{ h, p }]` (3–5), `hl`, `loop` (text)
- `tiles`: `cols`, `tiles: [{ big, small, dim }]`, `label`, `after`
- `split`: `left: { h, items }`, `right: { h, items }` (the right one is the good one; 3–4 items each)
- `timeline`: `items: [{ y, t, hl }]` (3–4)
- `stack`: `items` bottom to top (`'Title'` or `['Title', 'side note']`), the top one gold
- `big`: `value`, `label`, `note`
- `compare`: `items: [{ k, v, l, hl }]` (2), `note`

### Drawings (`art`)

compass · vectors · hourglass · tree · chair · camera · route · seesaw · signpost · tag · dumbbell · lamp · drop · stopwatch · cord · bridge · bubbles · clipboard · invoice · network · sameness · megaphone · coins · weeks · mountain · key · lighthouse · moon · biplane · book · plane · scale · door

Each has a default caption; pass `fig` to change it (keep the “FIG. NN — …” form).

## File shape

`data/cNN-short-name.mjs`, exporting `default { id, title, pillar, cta, caption, tags, facts, slides }`.
`pillar` is one of: `Think bigger` · `Choose` · `Confidence` · `Lead people & business`.
`caption`: the Instagram caption (hook line, three or four short paragraphs, the question, then one line for the action: “…link in bio.”). `tags`: five hashtags.

## Check your work

```bash
node marketing/carousels/render.mjs c04
```

Fix every warning it prints. Then look at `marketing/carousels/out/c04/c04-sheet.jpg` (all ten) and at slides 1, 4 and 5 full size. Text must never touch an edge, overlap or look cramped; a slide with too much on it is cut, not shrunk.
