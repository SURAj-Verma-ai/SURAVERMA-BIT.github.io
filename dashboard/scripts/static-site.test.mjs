import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, join } from "node:path";
import { routes, origin } from "./routes.mjs";
import { canonicalUrl, canonicalLink, resolvePageSeo, serializeSchema } from "../src/site/pageSeo.js";

const root = resolve(import.meta.dirname,".."), dist = join(root,"dist");
const htmlFor = page => readFileSync(page.path === "/" ? join(dist,"index.html") : join(dist,page.path.slice(1),"index.html"),"utf8");

test("flight ships one compact regional map without the tile engine or worker",() => {
  const assets=readdirSync(join(dist,"assets"));
  assert.ok(!assets.some(name=>/maplibre|maplibre-gl-worker/i.test(name)));
  const maps=assets.filter(name=>/^india-flight-map-.*\.svg$/.test(name));
  assert.equal(maps.length,1);
  const svg=readFileSync(join(dist,"assets",maps[0]));
  assert.ok(svg.length<65000);
  assert.ok(gzipSync(svg).length<26000);
  const html=htmlFor(routes.find(page=>page.path==="/"));
  assert.ok(html.includes(`/assets/${maps[0]}`));
  const js=assets.filter(name=>name.endsWith(".js")).map(name=>readFileSync(join(dist,"assets",name),"utf8")).join("");
  assert.ok(!/tiles\.openfreemap\.org|maplibre-gl/.test(js));
});

test("all retained pages have directly loadable HTML, content and main-domain metadata",() => {
  assert.equal(new Set(routes.map(page => page.path)).size,routes.length);
  for(const page of routes) {
    const html = htmlFor(page);
    assert.match(html,/<h1[\s>]/,page.path);
    assert.match(html,/<link rel="modulepreload"/);
    assert.ok(!html.includes('href="https://xtec.xiteai.com/legal'),page.path);
    if(page.kind !== "not-found") assert.ok(html.includes(`<link rel="canonical" href="${canonicalUrl(page.path)}"`),page.path);
    if(page.noindex) assert.match(html,/<meta name="robots" content="noindex, follow,/);
    for(const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)[^"\s]*"/g)) {
      const local = decodeURIComponent(match[1]);
      if(local.startsWith("//")) continue;
      const target = join(dist,local.slice(1));
      assert.ok(existsSync(target) || existsSync(join(target,"index.html")),`${page.path}: missing ${local}`);
    }
  }
});

test("sitemap advertises only main-domain static pages and excludes previews",() => {
  const xml = readFileSync(join(dist,"sitemap.xml"),"utf8");
  const actual = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(actual,routes.filter(page => !page.noindex).map(page => canonicalUrl(page.path)));
  assert.ok(!xml.includes("xtec."));
  assert.ok(!actual.some(url => /\/(contact|community|join|login|console|download)(?:\/|$)/.test(new URL(url).pathname)));
  assert.equal(readFileSync(join(dist,"CNAME"),"utf8").trim(),"xiteai.com");
  assert.ok(readFileSync(join(dist,"robots.txt"),"utf8").includes(`${origin}/sitemap.xml`));
});

test("every page has unique authored metadata and consistent social previews",() => {
  assert.equal(new Set(routes.map(page=>page.title)).size,routes.length);
  assert.equal(new Set(routes.map(page=>page.description)).size,routes.length);
  for(const page of routes) {
    const html=htmlFor(page);
    assert.equal((html.match(/<title>/g)||[]).length,1,page.path);
    assert.equal((html.match(/<meta name="description"/g)||[]).length,1,page.path);
    assert.ok(!page.description.includes("Explore XiteAI and XOS1."),page.path);
    if(!page.noindex) {
      assert.ok(page.description.length>=90 && page.description.length<=200,page.path);
      assert.ok(page.title.length<=80,page.path);
    }
    assert.match(html,/<meta property="og:image:alt"/);
    assert.match(html,/<meta name="twitter:image:alt"/);
    assert.match(html,/max-image-preview:large/);
  }
});

test("structured data is parseable, truthful and matches the canonical page",() => {
  for(const page of routes.filter(page=>page.kind!=="not-found")) {
    const html=htmlFor(page);
    const match=html.match(/<script id="site-schema" type="application\/ld\+json">(.*?)<\/script>/s);
    assert.ok(match,page.path);
    const graph=JSON.parse(match[1])["@graph"];
    const web=graph.find(node=>["WebPage","AboutPage","CollectionPage"].includes(node["@type"]));
    assert.equal(web.url,canonicalUrl(page.path));
    assert.equal(web.name,page.title);
    assert.equal(web.description,page.description);
    assert.ok(!match[1].includes("aggregateRating"));
    assert.ok(!graph.some(node=>node["@type"]==="JobPosting"));
    if(page.article?.status==="preview") assert.ok(!graph.some(node=>["NewsArticle","BlogPosting"].includes(node["@type"])));
    if(page.path!=="/") assert.ok(graph.some(node=>node["@type"]==="BreadcrumbList"));
  }
  assert.ok(!serializeSchema({text:"</script>"}).includes("</script>"));
});

test("preview content and missing pages stay noindex; published pages do not inherit it",() => {
  for(const page of routes) {
    const robots=htmlFor(page).match(/<meta name="robots" content="([^"]+)"/)[1];
    assert.equal(robots.startsWith("noindex"),Boolean(page.noindex),page.path);
    assert.equal(Boolean(resolvePageSeo(page.path,{noindex:page.noindex}).noindex),Boolean(page.noindex));
  }
  const custom=htmlFor(routes.find(page=>page.path==="/blog/designing-for-conversation"));
  assert.ok(custom.includes("Keep context visible."));
  assert.ok(!custom.includes("Loading article"));
});

test("legacy URLs redirect to canonical pages and query parameters do not fragment identity",() => {
  for(const [from,to] of [["privacy-policy","/legal/privacy"],["terms-of-service","/legal/terms"],["company","/about"]]) {
    const html=readFileSync(join(dist,from,"index.html"),"utf8");
    assert.ok(html.includes(canonicalUrl(to)));
    assert.match(html,/http-equiv="refresh" content="0;/);
  }
  assert.equal(canonicalUrl("/pricing/?currency=INR#plans"),canonicalUrl("/pricing"));
  assert.equal(canonicalUrl("/xos1"),origin+"/");
  assert.equal(canonicalLink("/faq#memory"),"/faq/#memory");
  assert.equal(canonicalLink("https://xtec.xiteai.com/contact"),"https://xtec.xiteai.com/contact");
});

test("homepage preserves the footer and routes working service actions to Terminal",() => {
  const home = htmlFor(routes[0]);
  assert.ok(home.includes('history.scrollRestoration = "manual"'));
  assert.match(home,/<link rel="stylesheet"[^>]+href="\/assets\/XosPage-[^"]+\.css"/);
  assert.match(home,/<link rel="modulepreload"[^>]+href="\/assets\/XosPage-[^"]+\.js"/);
  assert.match(home,/Say it\./);
  for(const text of ["Building the intelligence every computer will run on.","Contact XiteAI","Download XOS1","Help desk","Company policy","Community","Privacy choices","All policies"]) assert.ok(home.includes(text),text);
  for(const path of ["download","contact","community","#help"]) assert.ok(home.includes(`https://xtec.xiteai.com/${path}`),path);
  assert.ok(!home.includes('href="/login"'));
  assert.ok(!existsSync(join(dist,"community")));
  assert.ok(!existsSync(join(dist,"console")));
  assert.ok(!existsSync(join(dist,"pages")),"obsolete copied website pages are excluded");
  assert.match(readFileSync(join(dist,"404.html"),"utf8"),/This page/);
  assert.match(readFileSync(join(dist,"xos1/index.html"),"utf8"),/location\.replace/);
});
