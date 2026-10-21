# XiteAI main website

Static website for https://xiteai.com, copied from XiteAI Terminal's public
pages with the existing design, assets, animation and typography preserved.

- `/` displays the original XOS1 page; `/xos1` redirects to it.
- Company, pricing, FAQ, editorial, press, careers introduction and published
  legal pages are included. The sitemap is generated from those static routes.
- Community, support, contact forms, downloads, open jobs, applications,
  employee login and the console stay at https://xtec.xiteai.com.
- The main navigation contains XOS1, Pricing, About, Legal and Download.
- There is no Python server, database, API proxy or employee app in this copy.

## Local development

```sh
cd dashboard
npm ci
npm run dev
```

## Build and verify

```sh
cd dashboard
npm run build
npm test
npm run preview
```

`dashboard/dist` is the complete GitHub Pages artifact. Every retained page
has its own `index.html`, so direct links and refreshes work on static hosting.
The build also emits `404.html`, `robots.txt`, `sitemap.xml`, `CNAME` and
`.nojekyll`. Preview articles remain available but are excluded from the
search-engine sitemap and marked noindex.

The GitHub Actions workflow builds and deploys to GitHub Pages on pushes to
`main`. The custom domain is xiteai.com; the Terminal is deployed separately.
