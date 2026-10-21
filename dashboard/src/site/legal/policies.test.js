import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { betaLaunchAvailability, consumerPlanRows, policies, refundRows } from "./policies.js";
import { draftPolicies } from "./drafts.js";

const published = JSON.parse(readFileSync(new URL("./published.json", import.meta.url), "utf8"));
const inventory = readFileSync(new URL("../content.js", import.meta.url), "utf8");
const known = new Set([...inventory.matchAll(/slug: "([a-z-]+)"/g)].map((m) => m[1]));

test("every published policy has a registry entry and an implementation", () => {
  assert.equal(new Set(published).size, published.length);
  assert.equal(published.length, 12);
  for (const slug of published) {
    assert.ok(known.has(slug), slug);
    assert.ok(["terms", "privacy"].includes(slug) || policies[slug], slug);
  }
  assert.deepEqual(Object.keys(policies).sort(), published.filter((s) => !["terms", "privacy"].includes(s)).sort());
});

test("section anchors are unique and policy links resolve to published pages", () => {
  for (const [slug, policy] of Object.entries(policies)) {
    const ids = policy.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, slug);
    for (const section of policy.sections) {
      assert.match(section.id, /^[a-z][a-z0-9-]+$/);
      assert.ok(section.title);
      for (const link of section.links || []) {
        assert.ok(link.to === "https://xtec.xiteai.com/#help" || published.includes(link.to.replace("/legal/", "")), link.to);
      }
      for (const row of section.table?.rows || []) assert.equal(row.length, section.table.head.length, slug);
    }
  }
});

test("refund policy and terms use one founder-confirmed four-part schedule", () => {
  assert.deepEqual(refundRows.map((r) => r[1]), ["100% of the payment", "75% of the payment", "50% of the payment", "25% of the payment"]);
  assert.equal(policies["refund-policy"].sections.find((s) => s.id === "discontinuation").table.rows, refundRows);
  const terms = readFileSync(new URL("./Terms.jsx", import.meta.url), "utf8");
  assert.match(terms, /rows=\{refundRows\}/);
});

test("new policies contain no old product branding, placeholders or invented SLAs", () => {
  const copy = JSON.stringify(policies);
  assert.doesNotMatch(copy, /\bELLA\b|\[X\]|\bTBD\b|—/i);
  assert.match(copy, /does not promise a fixed response time/);
  assert.match(copy, /not a secure wipe/);
  assert.match(copy, /does not automatically delete historical/);
});

test("policy contacts route to the appropriate confirmed company inbox", () => {
  for (const policy of Object.values(policies)) assert.ok(["legal", "general", "privacy", "security"].includes(policy.contact));
  assert.equal(policies.security.contact, "security");
  assert.equal(policies["data-deletion"].contact, "privacy");
  assert.equal(policies["refund-policy"].contact, "general");
});

test("beta copy states the release stage without inventing a launch date or waiving rights", () => {
  const copy = JSON.stringify(policies["beta-terms"]);
  assert.match(copy, /launching in beta/);
  assert.match(copy, /No date is promised/);
  assert.match(copy, /does not create a separate refund rule or remove rights/);
  assert.doesNotMatch(copy, /production.grade|free beta|waive|at your own risk/i);
  assert.ok(published.includes("beta-terms"));
});

test("initial beta markets are India and the United States in both terms pages", () => {
  assert.match(betaLaunchAvailability, /India and the United States/);
  assert.match(betaLaunchAvailability, /Other countries are not included/);
  assert.doesNotMatch(betaLaunchAvailability, /United Kingdom|worldwide/i);
  assert.ok(policies["beta-terms"].sections[0].paragraphs.includes(betaLaunchAvailability));
  const terms = readFileSync(new URL("./Terms.jsx", import.meta.url), "utf8");
  assert.match(terms, /\{betaLaunchAvailability\}/);
});

test("planned consumer prices are shared and unfinished policies stay unpublished", () => {
  assert.deepEqual(consumerPlanRows, [["Premium", "$20 per month"], ["Ultra", "$60 per month"], ["Max", "$350 per month"]]);
  const terms = readFileSync(new URL("./Terms.jsx", import.meta.url), "utf8");
  assert.match(terms, /rows=\{consumerPlanRows\}/);
  assert.match(terms, /before applicable taxes/);
  for (const [slug, draft] of Object.entries(draftPolicies)) {
    assert.ok(!published.includes(slug), slug);
    assert.ok(draft.pending.length > 0, slug);
    assert.equal(new Set(draft.sections.map((s) => s.id)).size, draft.sections.length, slug);
  }
  assert.equal(draftPolicies["fair-usage-policy"].recommendation.trialDays, 14);
  assert.equal(draftPolicies["fair-usage-policy"].recommendation.activeDevices, 2);
});

test("privacy separates development providers and planned biometric controls from production", () => {
  const privacy = readFileSync(new URL("./Privacy.jsx", import.meta.url), "utf8");
  assert.match(privacy, /DeepInfra is used for development testing/);
  assert.match(privacy, /Cerebras and Groq are candidates, not confirmed production recipients/);
  assert.match(privacy, /without a separate opt-in/);
  assert.match(privacy, /name or label may be included/);
});
