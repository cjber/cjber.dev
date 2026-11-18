# Agents guide

Source for cjber.dev: Next.js, deployed on Cloudflare Workers. `lib/github-data.json` and `lib/open-source.json` are snapshots the daily Refresh GitHub snapshot workflow regenerates; edit the fetch scripts, not the JSON.

## Commands

- `npm ci`, then `npm run gate` (lint, typecheck, check-sync) or `npm run gate:changed` (eslint on changed files, then typecheck and check-sync). CI's `check` job adds `npm run build`.
- `npm run fetch-data` and `npm run fetch-open-source` refresh the snapshots; `npm run dev` serves the site.

CI runs `check`, `workflows` (actionlint, zizmor) and `secrets` (gitleaks); the ruleset requires them by name.

## Standards

- `repo-standards`: the RS-* requirements every cjber and agent-labs-dev repo meets; its `audit.py` checks this repo.
