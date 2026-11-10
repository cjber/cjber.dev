# Agents guide

Source for cjber.dev: Next.js, deployed on Cloudflare Workers. `lib/github-data.json` and `lib/open-source.json` are snapshots the daily Refresh GitHub snapshot workflow regenerates; edit the fetch scripts, not the JSON.

## Commands

- `npm ci`, then `npm run lint`, `npx tsc --noEmit`, `npm run check-sync` and `npm run build`: the `check` job.
- `npm run fetch-data` and `npm run fetch-open-source` refresh the snapshots; `npm run dev` serves the site.

CI runs `check`, `workflows` (actionlint, zizmor) and `secrets` (gitleaks); the ruleset requires them by name.

## Standards

- `repo-standards`: the RS-* requirements every cjber repo meets (repo, Actions and security settings, rulesets, CI hardening, community files), a skill in cjber/skills whose `audit.py` checks this repo
