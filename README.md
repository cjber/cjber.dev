# cillian.dev

Source for my personal site, [cillian.dev](https://cillian.dev). Next.js, deployed on Cloudflare Workers.

```bash
npm install
npm run fetch-data   # pull GitHub activity for the contributions graph
npm run fetch-open-source # public repositories and merged upstream PRs
npm run dev
```

The projects page includes active repositories, archived work, forks, and merged
upstream pull requests. Both GitHub snapshots refresh daily. The public-project
fetcher needs only public GitHub access and leaves the snapshot untouched if a
request fails or search results are incomplete.
