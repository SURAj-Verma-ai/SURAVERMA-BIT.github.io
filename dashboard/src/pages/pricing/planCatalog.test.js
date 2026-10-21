import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planCatalog,planQuote } from "./planCatalog.js";

test("INR monthly prices match the user-supplied USD conversion, including paise",()=>{
  assert.deepEqual(planCatalog.map(plan=>planQuote(plan,"INR","monthly").formatted),["₹1,901.41","₹5,704.23","₹33,274.68"]);
});
test("all billing/currency combinations preserve monthly equivalents and actual annual totals",()=>{
  for(const [index,plan] of planCatalog.entries()) {
    const monthly=planQuote(plan,"USD","monthly");
    const annual=planQuote(plan,"USD","yearly");
    assert.equal(monthly.amount,[20,60,350][index]);
    assert.equal(annual.amount,[16,48,280][index]);
    assert.equal(annual.total,[192,576,3360][index]);
    for(const currency of ["USD","INR"]) for(const billing of ["monthly","yearly"]) {
      const quote=planQuote(plan,currency,billing);
      assert.ok(Number.isFinite(quote.amount) && Number.isFinite(quote.total));
      assert.ok(Math.abs(quote.amount * (billing === "yearly" ? 12 : 1)-quote.total)<.061);
    }
  }
  assert.equal(planQuote(planCatalog[0],"INR","yearly").totalFormatted,"₹18,253.54");
  assert.equal(planQuote(planCatalog[2],"INR","yearly").totalFormatted,"₹3,19,436.88");
});
test("invalid query values fall back to supported monthly USD pricing",()=>{
  assert.equal(planQuote(planCatalog[0],"EUR","lifetime").formatted,"$20");
});
test("three tier pages retain inclusions, comparison, privacy and working billing destinations",()=>{
  for(const plan of planCatalog) {
    const html=readFileSync(new URL(`../../../dist/pricing-${plan.id}.html`,import.meta.url),"utf8").replace(/<!--.*?-->/gs,"");
    assert.ok(html.includes(`XOS1 ${plan.name}.`));
    assert.ok(html.includes(`https://xiteai.com/pricing/${plan.id}`));
    assert.ok(html.includes(`https://xtec.xiteai.com/contact?to=sales&amp;plan=${plan.id}`));
    assert.ok(html.includes('data-prerender="plan"'));
    for(const feature of plan.features) assert.ok(html.includes(feature));
    assert.ok(html.includes(`${plan.name} includes`));
    assert.ok(html.includes('Compare the plans.'));
    assert.ok(html.includes('/legal/privacy'));
    assert.doesNotMatch(html.split("<body>")[1],/tier-photo|tier-feature-explorer|Inside XOS1\.|Speak or type\./);
    assert.doesNotMatch(html,/preview estimates|provisional prices|fake data/i);
  }
});
