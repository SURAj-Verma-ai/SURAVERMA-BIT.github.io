import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { routes, origin } from "./routes.mjs";

const root = resolve(import.meta.dirname,"..");
const dist = join(root,"dist"), server = join(root,".static-render");
const escape = value => String(value).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
await build({root,configFile:false,plugins:[react()],logLevel:"error",build:{ssr:"scripts/staticServerEntry.jsx",outDir:server,emptyOutDir:true,rollupOptions:{output:{entryFileNames:"render.mjs"}}}});
try {
  const {renderPage,faqStructuredData,serializeFaqSchema} = await import(pathToFileURL(join(server,"render.mjs")));
  const template = await readFile(join(dist,"index.html"),"utf8");
  const manifest = JSON.parse(await readFile(join(dist,".vite/manifest.json"),"utf8"));
  const css = [...new Set(Object.values(manifest).flatMap(chunk => chunk.css || []))];
  // Preserve the original CSS order: shared styles, then the current page's.
  const entryFor = {
    home:"src/pages/xos1/XosPage.jsx",about:"src/pages/about/AboutPage.jsx",pricing:"src/pages/pricing/PricingPage.jsx",plan:"src/pages/pricing/PlanPage.jsx",faq:"src/pages/faq/FaqPage.jsx",news:"src/pages/editorial/EditorialPage.jsx",blog:"src/pages/editorial/EditorialPage.jsx",careers:"src/pages/careers/CareersPage.jsx",press:"src/pages/press/PressPage.jsx",sitemap:"src/pages/sitemap/SitemapPage.jsx",legal:"src/site/legal/LegalHub.jsx","not-found":"src/pages/not-found/NotFoundPage.jsx",
  };
  for (const page of routes) {
    const canonical = `${origin}${page.path}`;
    let html = template.replace(/<title>.*?<\/title>/s,`<title>${escape(page.title)}</title>`);
    for (const [attribute,key,value] of [["name","description",page.description],["property","og:title",page.title],["property","og:description",page.description],["property","og:url",canonical],["name","twitter:title",page.title],["name","twitter:description",page.description]]) {
      html = html.replace(new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`),`<meta ${attribute}="${key}" content="${escape(value)}" />`);
    }
    html = html.replace(/<link rel="canonical"[^>]*>/,page.kind === "not-found" ? "" : `<link rel="canonical" href="${canonical}" />`);
    html = html.replace(/<meta name="robots"[^>]*>/,`<meta name="robots" content="${page.noindex ? "noindex" : "index"}, follow" />`);
    const seen = new Set(),styles = new Set();
    const collect = key => {if(seen.has(key)) return; seen.add(key); const chunk=manifest[key]; if(!chunk) return; chunk.imports?.forEach(collect); chunk.css?.forEach(file => styles.add(file));};
    collect("src/main.jsx");
    const policyEntry = page.slug === "privacy" ? "Privacy" : page.slug === "terms" ? "Terms" : page.slug === "company-policy" ? "CompanyPolicyPage" : "PolicyPage";
    collect(page.kind === "policy" ? `src/site/legal/${policyEntry}.jsx` : entryFor[page.kind]);
    html = html.replace("</head>",[...styles].filter(file => css.includes(file) && !html.includes(`href="/${file}"`)).map(file => `<link rel="stylesheet" href="/${file}" />`).join("\n") + (page.kind === "faq" ? `\n<script id="faq-schema" type="application/ld+json">${serializeFaqSchema(faqStructuredData)}</script>` : "") + "\n</head>");
    html = html.replace('<div id="root"></div>',`<div id="root" data-prerender="${page.kind}">${renderPage(page)}</div>`);
    const file = page.path === "/" ? join(dist,"index.html") : join(dist,page.path.slice(1),"index.html");
    await mkdir(resolve(file,".."),{recursive:true});
    await writeFile(file,html);
    if(page.kind === "not-found") await writeFile(join(dist,"404.html"),html);
  }
  const urls = routes.filter(page => !page.noindex).map(page => `<url><loc>${escape(origin+page.path)}</loc></url>`).join("\n");
  await writeFile(join(dist,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await writeFile(join(dist,"robots.txt"),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  await writeFile(join(dist,"CNAME"),"xiteai.com\n");
  await writeFile(join(dist,".nojekyll"),"");
  // Compatibility for the previous product route, including its anchors.
  await mkdir(join(dist,"xos1"),{recursive:true});
  await writeFile(join(dist,"xos1/index.html"),`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>XOS1 · XiteAI</title><link rel="canonical" href="${origin}/"><meta http-equiv="refresh" content="0;url=/"><script>location.replace('/'+location.search+location.hash)</script></head><body><a href="/">Explore XOS1</a></body></html>`);
  console.log(`Generated ${routes.length} static pages, the XOS1 alias, sitemap.xml and robots.txt for ${origin}.`);
} finally {
  await rm(server,{recursive:true,force:true});
}
