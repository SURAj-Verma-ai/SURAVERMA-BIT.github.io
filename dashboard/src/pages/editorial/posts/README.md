# Adding News and Blog posts

Create one JSON file in `news/` or `blog/`. The directory determines the feed.
No changes to About, the archives, or routes are needed. Run the site build
and deploy it as usual; the latest four entries appear on About automatically.
The sitemap page lists each visible article too. The XML sitemap reads these
same JSON files and includes articles marked `published`; `preview` and `draft`
articles are excluded from that crawler index.

Required fields: `id` (URL slug), `title`, `summary`, `category`, `publishedAt`
(ISO date), `status` (`published`, `preview`, or `draft`), `alt`, and either
`image` (asset path) or `cover` (`xos1`, `company`, `careers`, `lumen`).
Use `paragraphs` for the standard article body. Drafts are excluded from the
public catalog. Preview dates and entries are visibly marked as sample content.

For responsive photographs, add `imageSmall` (480px wide) alongside `image`
(1200px wide). Use self-hosted assets so the page needs no external image
requests. Add `imageCredit: {"name":"Photographer", "url":"https://source-page"}`
to show a linked credit beneath the article image. Preview photographs are
labelled illustrative. Record licensed sources in the asset directory's
`CREDITS.md`, and replace stock office/product imagery before real announcements.

To design an individual article body, add a JSX file beside its JSON file,
with exactly the same filename. Export a default React component accepting
`{ post, kind }`. It is discovered automatically and loaded only when that
article is opened. The site's header, article metadata and footer remain common.

Published dates determine newest-first ordering in both the archive and About.
Use an ISO timestamp when more than one post is published on the same day.
