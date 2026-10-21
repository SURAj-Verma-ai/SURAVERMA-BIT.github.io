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

## Search metadata

`dashboard/src/site/pageSeo.js` contains the authored metadata, canonical URL
rules and structured entity graph. The same data is used in generated HTML
and browser navigation. Internal page links, canonical tags and sitemap URLs
use trailing slashes to match GitHub Pages directory URLs.

Every build validates all 34 pages and emits `seo-audit.json` with their titles,
descriptions, canonical URLs, indexing eligibility and schema types. The eight
editorial previews and the error page are noindex; the other 25 pages are in
`sitemap.xml`. An article gets publication schema only after its JSON metadata
is marked `published`; keep its dates and content accurate. Custom article
bodies are rendered into HTML during the build, without adding them to the
initial browser bundle.

Old company and published policy URLs have instant static redirects to their
current counterparts. GitHub Pages does not support custom HTTP redirect rules
in this workflow. Sitemap aliases and query variants are not separate pages.

After deployment, submit `https://xiteai.com/sitemap.xml` through a verified
Google Search Console property. Use URL Inspection and Search Console reports
to track real indexing and search traffic. This repository does not contain
Search Console credentials and does not claim guaranteed rankings or rich
results. The software entity has no fabricated ratings, reviews or live offers.
