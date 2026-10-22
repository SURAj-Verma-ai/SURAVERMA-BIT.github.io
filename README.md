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
The build also emits `404.html`, `robots.txt`, `sitemap.xml`, `CNAME`, `llms.txt`,
`llms-full.txt`, `.well-known/security.txt` and
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

`dashboard/public/llms.txt` and `llms-full.txt` describe XOS1 for AI assistants,
split into what is available now and what is coming. Move a feature from
"Coming" to "Now" only when it ships, and update the date at the top.
`robots.txt` names the main AI crawlers explicitly; the list is in
`dashboard/scripts/build-static.mjs`.

## Security

The site is static: no forms, logins or database live on this domain. What it
can protect is set in two places.

**In the build (automatic).** `dashboard/scripts/build-static.mjs` adds a
Content-Security-Policy meta tag and a referrer policy to every generated page.
Inline scripts are allowed by SHA-256 hash, calculated at build time, never by
`'unsafe-inline'`. The policy allows only this site, Cloudflare's analytics
beacon and the OpenFreeMap tiles used by the flight map. If you add a new
external script, image, font or API, add its origin to `contentSecurityPolicy`
or the browser will block it. The build also removes the bundler manifest from
`dist`, and `dashboard/public/.well-known/security.txt` gives the security
contact. `npm test` fails if a page loses its policy, carries an inline script
the policy does not allow, or `security.txt` expires within a month. Renew its
`Expires` date every year (currently 2027-10-22).

**In Cloudflare (manual, free plan).** GitHub Pages cannot send HTTP headers,
and some protections only work as headers. Set these once in the Cloudflare
dashboard for xiteai.com:

1. SSL/TLS > Edge Certificates > HTTP Strict Transport Security (HSTS):
   enable with Max Age 12 months, Include subdomains on (only if every
   subdomain in DNS serves HTTPS), Preload off, No-Sniff header on.
2. SSL/TLS > Edge Certificates: Always Use HTTPS on, Minimum TLS Version 1.2.
3. Rules > Transform Rules > Modify Response Header > Create rule, named
   "Main site security headers", with the custom filter `Hostname equals
   xiteai.com`. Scope it to that hostname only: xtec.xiteai.com sends its own,
   stricter policy, and a zone-wide rule would overwrite it. Add, each as
   "Set static":

   | Header | Value |
   |---|---|
   | `X-Frame-Options` | `DENY` |
   | `Content-Security-Policy` | `frame-ancestors 'none'` |
   | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
   | `Referrer-Policy` | `strict-origin-when-cross-origin` |

   The header policy only adds `frame-ancestors`, which a meta tag cannot
   carry; browsers enforce it together with the page's own policy.

Check the result with `curl -sI https://xiteai.com/`. Cloudflare's analytics
beacon and email obfuscation are allowed by the policy; if either is turned
off, its origin can be removed from `contentSecurityPolicy`.
