import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { routes, origin } from "./routes.mjs";

const root = resolve(import.meta.dirname,".."), dist = join(root,"dist");
const htmlFor = page => readFileSync(page.path === "/" ? join(dist,"index.html") : join(dist,page.path.slice(1),"index.html"),"utf8");

test("all retained pages have directly loadable HTML, content and main-domain metadata",() => {
  assert.equal(new Set(routes.map(page => page.path)).size,routes.length);
  for(const page of routes) {
    const html = htmlFor(page);
    assert.match(html,/<h1[\s>]/,page.path);
    assert.match(html,/<link rel="modulepreload"/);
    assert.ok(!html.includes('href="https://xtec.xiteai.com/legal'),page.path);
    if(page.kind !== "not-found") assert.ok(html.includes(`<link rel="canonical" href="${origin}${page.path}"`),page.path);
    if(page.noindex) assert.match(html,/<meta name="robots" content="noindex, follow"/);
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
  assert.deepEqual(actual,routes.filter(page => !page.noindex).map(page => origin+page.path));
  assert.ok(!xml.includes("xtec."));
  assert.ok(!actual.some(url => /\/(contact|community|join|login|console|download)(?:\/|$)/.test(new URL(url).pathname)));
  assert.equal(readFileSync(join(dist,"CNAME"),"utf8").trim(),"xiteai.com");
  assert.ok(readFileSync(join(dist,"robots.txt"),"utf8").includes(`${origin}/sitemap.xml`));
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
