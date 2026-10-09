# cillian.dev

Source for my personal site, [cillian.dev](https://cillian.dev). Next.js, deployed on Cloudflare Workers.

```bash
npm install
npm run fetch-data   # pull GitHub activity for the contributions graph
npm run fetch-open-source # public repositories
npm run dev
```

`npm run build` first renders `public/cv.pdf` from `lib/cv.ts`, the one source for the
CV page, the PDF, the homepage summary and the publication list.

The projects page includes projects grouped by type, with archived work
under each group and existing project marks where available. Both GitHub snapshots refresh daily. The public-project
fetcher needs only public GitHub access and leaves the snapshot untouched if a
request fails.
