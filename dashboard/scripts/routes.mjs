import { readFileSync, readdirSync } from "node:fs";
import { resolvePageSeo } from "../src/site/pageSeo.js";

export const origin = "https://xiteai.com";
const source = new URL("../src/", import.meta.url);
const readJSON = path => JSON.parse(readFileSync(new URL(path, source), "utf8"));
const legalTitles = {
  "company-policy":"XiteAI Company Policy",terms:"Terms of Service",
  "acceptable-use-policy":"Acceptable Use Policy","refund-policy":"Refund Policy",
  "beta-terms":"Beta Terms",privacy:"Privacy Policy","data-deletion":"Data Deletion",
  "minors-policy":"Minors Policy","cookie-policy":"Cookie Policy",
  "ai-disclaimer":"AI Disclaimer",security:"Security","support-policy":"Support Policy",
};
const page = (path,title,kind,extra={}) => ({kind,...resolvePageSeo(path,{title:`${title} · XiteAI`,description:`${title}. Explore XiteAI and XOS1.`,...extra})});
export const routes = [
  page("/","XOS1","home",{description:"Say it. It's done. An AI that lives on your PC: you say what you need, and it happens."}),
  page("/about","About XiteAI","about"),
  page("/pricing","XOS1 Pricing","pricing"),
  ...["premium","ultra","max"].map(id => page(`/pricing/${id}`,`XOS1 ${id[0].toUpperCase()+id.slice(1)}`,"plan",{planId:id})),
  page("/faq","XOS1 FAQ","faq"),
  page("/news","News","news"),page("/blog","Blog","blog"),
  page("/careers","Careers","careers"),page("/press","Press","press"),
  page("/legal","Legal","legal"),page("/sitemap","Sitemap","sitemap"),
  ...readJSON("site/legal/published.json").map(slug => page(`/legal/${slug}`,legalTitles[slug] || slug,"policy",{slug})),
  ...["news","blog"].flatMap(kind => readdirSync(new URL(`pages/editorial/posts/${kind}/`,source))
    .filter(file => file.endsWith(".json"))
    .map(file => readJSON(`pages/editorial/posts/${kind}/${file}`))
    .filter(post => post.status !== "draft" && Number.isFinite(Date.parse(post.publishedAt)))
    .map(post => page(`/${kind}/${post.id}`,`${post.title}${post.status === "preview" ? " — Preview" : ""}`,kind,{description:post.summary,slug:post.id,noindex:post.status !== "published",image:post.image,article:post}))),
  page("/404","Page not found","not-found",{noindex:true}),
];
