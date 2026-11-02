# cjber.dev

Source for my personal site, [cjber.dev](https://cjber.dev). Next.js, deployed on Cloudflare Workers.

```bash
npm install
npm run fetch-data   # pull GitHub activity for the contributions graph
npm run fetch-open-source # public repositories
npm run check-sync   # project groups and links still match GitHub and the web
npm run dev
```

`npm run build` first renders `public/cv.pdf` from `lib/cv.ts`, the one source for the
CV page, the PDF, the homepage summary and the publication list.

The projects page groups public repositories by type, from `lib/projects.ts`.
Both GitHub snapshots refresh daily through a pull request that merges once CI
passes. CI runs `check-sync`, which fails when a grouped repository is no longer
public, an active public repository has no group, or an external link is broken.
A failing daily run opens a "Site out of sync" issue listing the fixes.
