import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { routes, origin } from "./routes.mjs";
import { canonicalUrl, canonicalLink, resolvePageSeo, serializeSchema } from "../src/site/pageSeo.js";

const root = resolve(import.meta.dirname,".."), dist = join(root,"dist");
const htmlFor = page => readFileSync(page.path === "/" ? join(dist,"index.html") : join(dist,page.path.slice(1),"index.html"),"utf8");

test("detailed flight renderer stays deferred and the replaced regional image is absent",() => {
  const assets=readdirSync(join(dist,"assets"));
  const engine=assets.find(name=>/^maplibre-gl-.*\.js$/.test(name));
  const worker=assets.find(name=>/^maplibre-gl-worker-.*\.mjs$/.test(name));
  assert.ok(engine); assert.ok(worker);
  assert.ok(readFileSync(join(dist,"assets",engine)).length<1200000);
  assert.ok(readFileSync(join(dist,"assets",worker)).length<550000);
  assert.ok(!assets.some(name=>/^india-flight-map-/.test(name)));
  const html=htmlFor(routes.find(page=>page.path==="/"));
  assert.ok(!html.includes(`href="/assets/${engine}"`));
  assert.ok(!html.includes(`href="/assets/${worker}"`));
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

test("every page carries a hash-based security policy and security.txt is current",() => {
  const pages=readdirSync(dist,{recursive:true}).filter(name=>name.endsWith(".html"));
  assert.ok(pages.length>30);
  for(const name of pages) {
    const html=readFileSync(join(dist,name),"utf8");
    const policy=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
    assert.ok(policy,`${name} has no policy`);
    assert.ok(html.indexOf("Content-Security-Policy")<html.indexOf("<script"),`${name} runs a script before its policy`);
    const scripts=policy.match(/script-src ([^;]+)/)[1];
    assert.ok(!scripts.includes("unsafe-inline") && !scripts.includes("unsafe-eval"),name);
    for(const directive of ["default-src 'self'","object-src 'none'","base-uri 'self'","form-action 'self'"]) assert.ok(policy.includes(directive),`${name}: ${directive}`);
    for(const [,body] of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g))
      assert.ok(scripts.includes(`'sha256-${createHash("sha256").update(body).digest("base64")}'`),`${name} has an inline script the policy does not allow`);
    assert.match(html,/<meta name="referrer" content="strict-origin-when-cross-origin"/);
  }
  const security=readFileSync(join(dist,".well-known","security.txt"),"utf8");
  assert.match(security,/^Contact: mailto:security@xiteai\.com$/m);
  assert.ok(Date.parse(security.match(/^Expires: (.+)$/m)[1])>Date.now()+30*24*3600*1000,"security.txt expires within a month; renew it");
  assert.ok(!existsSync(join(dist,".vite")),"the bundler manifest must not be published");
});

test("AI crawlers are explicitly allowed and the llms files are published and honest",() => {
  const robots=readFileSync(join(dist,"robots.txt"),"utf8");
  for(const bot of ["GPTBot","ClaudeBot","PerplexityBot"]) assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /\n`),bot);
  assert.ok(!/Disallow:\s*\//.test(robots));
  for(const file of ["llms.txt","llms-full.txt"]) {
    const text=readFileSync(join(dist,file),"utf8");
    assert.match(text,/^# XOS1/);
    assert.match(text,/beta/i);
    assert.ok(!text.includes("—"),`${file} has an em dash`);
    for(const [,url] of text.matchAll(/\]\((https:\/\/xiteai\.com[^)\s]*)\)/g)) {
      const path=new URL(url).pathname;
      assert.ok(path==="/"||path==="/sitemap.xml"||path==="/llms-full.txt"||existsSync(join(dist,path.slice(1),"index.html")),`${file} links to missing ${path}`);
    }
  }
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
