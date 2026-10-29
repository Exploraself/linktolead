# The Founder's Blueprint

Link to Lead — the twelve-week founder programme. Lives at
**linktolead.exploraself.com**, separate from Broadcast and from the main site.

## What it is

Four domains — Self, People, Work, Market. Twelve levels. Seven clarity points
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
