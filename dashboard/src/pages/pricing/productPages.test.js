import assert from "node:assert/strict";
import { readFileSync,existsSync } from "node:fs";
import test from "node:test";
import { consumerPlanRows } from "../../site/legal/policies.js";
import { pricingPlans } from "./pricingContent.js";

test("pricing uses the same exact plan prices as the published terms", () => {
  assert.deepEqual(pricingPlans.map(plan => [plan.name,plan.price]),consumerPlanRows);
  const html = readFileSync(new URL("../../../dist/pricing.html",import.meta.url),"utf8");
  const body = html.split("<body>")[1];
  for (const plan of pricingPlans) {
    assert.ok(body.includes(plan.name));
    assert.ok(body.includes(plan.price));
    assert.ok(body.includes(`/pricing/${plan.id}?billing=monthly&amp;currency=USD`));
  }
  assert.match(body,/Prices before tax/);
  assert.doesNotMatch(body,/Buy now|most popular|unlimited usage|free trial for \d+ days/i);
});

test("both built pages are readable, styled, and have appropriate indexing metadata", () => {
  const directory = new URL("../../../dist/",import.meta.url);
  for (const file of ["pricing.html","404.html"]) {
    const html = readFileSync(new URL(file,directory),"utf8");
    assert.match(html,/data-prerender=/);
    for (const match of html.matchAll(/<link rel="stylesheet"[^>]*href="\/([^"]+)"/g)) assert.ok(existsSync(new URL(match[1],directory)),match[1]);
    if (file === "404.html") {
      assert.match(html,/name="robots" content="noindex, follow"/);
      assert.doesNotMatch(html,/rel="canonical"/);
      for (const route of ["/","/","/pricing","/careers","/faq"]) assert.ok(html.includes(`href="${route}"`));
    } else assert.match(html,/rel="canonical" href="https:\/\/xtec.xiteai.com\/pricing"/);
  }
  assert.ok(!existsSync(new URL(".product-pages-server.cjs",directory)));
});
