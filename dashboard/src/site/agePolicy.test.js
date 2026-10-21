import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { productAgePolicy, productAgeBands, productAgeEligibility, productAgeSummary, ageControlsReleaseStatus, guardianAccess, ageDataUse, ageTransitionLimits } from "./agePolicy.js";
import { faqTopics } from "../pages/faq/faqContent.js";
import { policies } from "./legal/policies.js";

test("XOS1 has all-age eligibility with the founder's intended 13 and 18 thresholds", () => {
  assert.equal(productAgePolicy.minimumAge,null);
  assert.equal(productAgePolicy.parentalControlsBelow,13);
  assert.equal(productAgePolicy.adultModeFrom,18);
  assert.deepEqual(productAgeBands.map(band => band.label),["Under 13","13–17","18 and over"]);
  assert.match(productAgeBands[0].description,/optional parental controls/);
  assert.match(productAgeBands[1].description,/does not include parental activity-monitoring/);
  assert.match(ageControlsReleaseStatus,/has not yet been verified/);
});

test("guardian rights and age transitions do not silently authorise access, processing or billing", () => {
  const minors = policies["minors-policy"];
  assert.ok(minors.sections.find(section => section.id === "age-information").paragraphs.includes(ageDataUse));
  assert.ok(minors.sections.find(section => section.id === "adult-transition").paragraphs.includes(ageTransitionLimits));
  for (const [slug,id] of [["minors-policy","rights"],["data-deletion","child-records"]]) {
    assert.ok(policies[slug].sections.find(section => section.id === id).paragraphs.includes(guardianAccess));
  }
  const privacy = readFileSync(new URL("./legal/Privacy.jsx",import.meta.url),"utf8");
  const terms = readFileSync(new URL("./legal/Terms.jsx",import.meta.url),"utf8");
  assert.match(privacy,/\{guardianAccess\}/);
  assert.match(privacy,/\{ageDataUse\}/);
  for (const copy of [privacy,terms]) assert.match(copy,/\{ageTransitionLimits\}/);
  assert.match(privacy,/Continuing to use XOS1 or browse this website does not by itself provide consent/);
  assert.doesNotMatch(privacy,/Continuing to use XOS1 after that means you accept|Consent, withdrawable in Settings/);
  assert.match(terms,/Turning 18 does not automatically create a new subscription/);
});

test("related policies preserve child safeguards without asserting a shipped dashboard", () => {
  assert.ok(policies["beta-terms"].sections.find(section => section.id === "age-safeguards").paragraphs.includes(ageControlsReleaseStatus));
  assert.match(JSON.stringify(policies.security),/does not claim a parental dashboard is already available/);
  assert.match(JSON.stringify(policies["acceptable-use-policy"]),/covert or unauthorised monitoring/);
  assert.match(JSON.stringify(policies["cookie-policy"]),/does not verify age, establish guardian authority/);
  assert.match(JSON.stringify(policies["minors-policy"]),/Consent|consent/);
  assert.match(JSON.stringify(policies["minors-policy"]),/Prohibited processing must remain disabled/);
  assert.match(JSON.stringify(policies["minors-policy"]),/reaches 13.*verify that access is revoked/);
});

test("FAQ and published product policies use the same age design instead of an adults-only restriction", () => {
  const faq = faqTopics.flatMap(topic => topic.questions).find(item => item.id === "faq-age");
  assert.equal(faq.answers,productAgeSummary);
  const minors = policies["minors-policy"];
  assert.ok(minors.sections[0].paragraphs.includes(productAgeEligibility));
  assert.deepEqual(minors.sections[0].table.rows,productAgeBands.map(band => [band.label,band.description]));
  const terms = readFileSync(new URL("./legal/Terms.jsx",import.meta.url),"utf8");
  const privacy = readFileSync(new URL("./legal/Privacy.jsx",import.meta.url),"utf8");
  const combined = terms+privacy+JSON.stringify(minors)+JSON.stringify(faq);
  assert.doesNotMatch(combined,/18 or older|at least.*<strong>18|not intended for children|intended only for people aged 18/);
  for (const copy of [terms,privacy]) assert.match(copy,/\{productAgeEligibility\}/);
  assert.match(minors.sections.find(item => item.id === "consent").paragraphs.join(" "),/controls and parental consent are separate/);
});
