import assert from "node:assert/strict";
import test from "node:test";
import { faqTopics } from "./faqContent.js";
import { filterQuestions } from "./faqSearch.js";

const ids = results => results.flatMap(topic => topic.questions.map(item => item.id));

test("FAQ search finds answers and synonyms across topics, ignoring case and punctuation", () => {
  assert.ok(ids(filterQuestions(faqTopics,"INTERNET, connection")).includes("faq-offline"));
  assert.ok(ids(filterQuestions(faqTopics,"resume")).includes("faq-application-draft"));
  assert.deepEqual(ids(filterQuestions(faqTopics,"résumé")),ids(filterQuestions(faqTopics,"resume")));
  assert.ok(ids(filterQuestions(faqTopics,"privacy choices")).includes("faq-cookies"));
  assert.ok(ids(filterQuestions(faqTopics,"how memory works")).includes("faq-memory-system"));
  assert.ok(ids(filterQuestions(faqTopics,"infinite memory")).includes("faq-infinite-memory"));
  assert.ok(ids(filterQuestions(faqTopics,"computer use")).includes("faq-computer-use"));
  assert.ok(ids(filterQuestions(faqTopics,"hefty")).includes("faq-pricing"));
  assert.ok(ids(filterQuestions(faqTopics,"data collected")).includes("faq-data-collected"));
});

test("topic selection and all-word searches narrow results without changing the catalog", () => {
  const snapshot = JSON.stringify(faqTopics);
  assert.equal(filterQuestions(faqTopics,"","careers")[0].questions.length,5);
  assert.equal(filterQuestions(faqTopics,"install code","privacy").length,0);
  assert.deepEqual(ids(filterQuestions(faqTopics,"install code")),["faq-support","faq-install-code"]);
  assert.deepEqual(filterQuestions(faqTopics,"unmatched words xyz"),[]);
  assert.deepEqual(filterQuestions(faqTopics,"未知问题"),[]);
  assert.equal(JSON.stringify(faqTopics),snapshot);
});

test("every FAQ has a stable unique link, an answer and valid support destinations", () => {
  const items = faqTopics.flatMap(topic => topic.questions);
  assert.ok(items.length >= 80);
  assert.equal(new Set(items.map(item => item.id)).size,items.length);
  const known = new Set(["/","/news","/blog","/about","https://xtec.xiteai.com/login","https://xtec.xiteai.com/join","/careers","https://xtec.xiteai.com/careers/open-roles","/legal/beta-terms","/legal/minors-policy","/legal/privacy","/legal/data-deletion","/legal/cookie-policy","/legal/security","/legal/company-policy","/legal/terms","/legal/ai-disclaimer","/legal/refund-policy","/legal/support-policy","https://xtec.xiteai.com/contact","https://xtec.xiteai.com/#help"]);
  for (const item of items) {
    assert.match(item.id,/^faq-[a-z0-9-]+$/);
    assert.ok(item.question && item.answers.every(answer => answer.trim().length));
    for (const link of item.links || []) assert.ok(link.action === "privacy" || known.has(link.to) || /^\/contact\?to=(privacy|security|careers|feedback)$/.test(link.to),link.to);
  }
});
