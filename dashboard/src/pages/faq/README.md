# FAQ content and indexing

The FAQ uses one authored catalog for the interactive page, readable production HTML and Schema.org answers. Existing answer IDs are permanent links; preserve them when editing a question.

- `faqContent.js` holds the original company, careers and help questions and assembles the catalog.
- `productQuestions.js` holds the expanded product, memory, computer-access, privacy, pricing and safety answers.
- Prices and age bands come from the shared product policies. Check release evidence before replacing an intended capability with a statement that it is available.
- `faqSeo.js` holds the title, description, canonical URL and structured answers. Its canonical matches the public Terminal domain; update it alongside the site's head configuration if the domain changes.

`npm run build` also runs `scripts/prerenderFaq.js`. It renders the actual FAQ component with native expanders, adds the appropriate CSS and metadata, and writes `dist/faq.html`. FastAPI serves this file at `/faq` for every visitor without checking user agents. JavaScript adds search and the existing animated accordion; the readable HTML stays in place until that module is ready. No separate crawler-only copy is maintained.

Run the build before `node --test src/pages/faq/faqSearch.test.js src/pages/faq/faqSeo.test.js`. Those checks verify search, stable links, exact answer/schema parity, script-safe serialization and every answer in the generated HTML. `python tests/run_all.py about_pages --bundled` checks route fallback and sitemap discovery.

The markup is for content understanding, not a ranking or rich-result promise. Google recommends considering prerendering because not every crawler executes JavaScript ([JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)). Google retired its FAQ rich-result feature in May 2026 ([documentation updates](https://developers.google.com/search/updates)); the Schema.org FAQPage type remains available for consumers that use it ([type reference](https://schema.org/FAQPage)). Do not advertise FAQ markup as a guaranteed special Google result.
