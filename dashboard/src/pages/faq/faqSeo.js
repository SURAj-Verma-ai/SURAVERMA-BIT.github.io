import { faqTopics } from "./faqContent.js";

export const faqMeta = {
  title:"XOS1 FAQ: Memory, Privacy, Computer Use & Pricing | XiteAI",
  description:"Answers about XOS1’s infinite memory, computer access, privacy, data collection, planned pricing, age safeguards and Windows compatibility.",
  path:"/faq",
};
export const faqCanonical = "https://xiteai.com/faq";
export const faqStructuredData = {
  "@context":"https://schema.org",
  "@type":"FAQPage",
  "@id":`${faqCanonical}#faq`,
  url:faqCanonical,
  name:faqMeta.title,
  description:faqMeta.description,
  inLanguage:"en",
  mainEntity:faqTopics.flatMap(topic => topic.questions.map(item => ({
    "@type":"Question",
    "@id":`${faqCanonical}#${item.id}`,
    name:item.question,
    acceptedAnswer:{"@type":"Answer",text:item.answers.join("\n\n")},
  }))),
};

// Escape script-closing sequences even though the catalog is authored code.
export const serializeFaqSchema = data => JSON.stringify(data).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
