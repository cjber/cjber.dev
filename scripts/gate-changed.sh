#!/usr/bin/env bash
# Fast local gate for the branch's changed files: eslint on them, then tsc and check-sync.
set -euo pipefail
base=$(git merge-base origin/main HEAD)
mapfile -t files < <(git diff --name-only --diff-filter=d "$base" -- '*.ts' '*.tsx' '*.js' '*.mjs')
if [ "${#files[@]}" -gt 0 ]; then npx eslint "${files[@]}"; fi
npx tsc --noEmit
npm run check-sync
