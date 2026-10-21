import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { faqTopics } from "./faqContent.js";
import { faqCanonical, faqMeta, faqStructuredData, serializeFaqSchema } from "./faqSeo.js";

const questions = faqTopics.flatMap(topic => topic.questions);
const escapeHtml = value => value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;");

test("structured answers exactly match the human FAQ and stable answer links", () => {
  assert.equal(faqStructuredData.mainEntity.length,questions.length);
  for (const [i,item] of questions.entries()) {
    const entity = faqStructuredData.mainEntity[i];
    assert.equal(entity.name,item.question);
    assert.equal(entity.acceptedAnswer.text,item.answers.join("\n\n"));
    assert.equal(entity["@id"],`${faqCanonical}#${item.id}`);
  }
});

test("structured-data serialization cannot terminate its containing script", () => {
  const value = {text:'</script><script>alert("x")</script>\u2028\u2029'};
  const encoded = serializeFaqSchema(value);
  assert.ok(!encoded.includes("<"));
  assert.deepEqual(JSON.parse(encoded),value);
});

test("the production HTML contains every answer without executing JavaScript", () => {
  const directory = new URL("../../../dist/",import.meta.url);
  const html = readFileSync(new URL("faq.html",directory),"utf8");
  const body = html.split("<body>")[1];
  assert.equal((body.match(/<details\b/g) || []).length,questions.length);
  for (const item of questions) {
    assert.ok(body.includes(`id="${item.id}"`),item.id);
    assert.ok(body.includes(escapeHtml(item.question)),item.question);
    for (const answer of item.answers) assert.ok(body.includes(escapeHtml(answer)),item.id);
  }
  assert.ok(html.includes('data-prerender="faq"'));
  assert.ok(html.includes(`<title>${escapeHtml(faqMeta.title)}</title>`));
  assert.ok(html.includes(`href="${faqCanonical}"`));
  assert.equal((html.match(/rel="canonical"/g) || []).length,1);
  const schema = JSON.parse(html.match(/<script id="faq-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(schema,faqStructuredData);
  for (const match of html.matchAll(/<link rel="stylesheet"[^>]*href="\/([^"]+)"/g)) assert.ok(existsSync(new URL(match[1],directory)),match[1]);
  assert.ok(!existsSync(new URL(".faq-server.cjs",directory)));
});
