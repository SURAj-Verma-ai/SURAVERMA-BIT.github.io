export const SEO_ORIGIN = "https://xiteai.com";
export const OG_IMAGE = `${SEO_ORIGIN}/brand/og.png`;

export function pagePath(value = "/") {
  const path = value.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return path === "/xos1" ? "/" : path;
}
export const canonicalUrl = path => SEO_ORIGIN + (pagePath(path) === "/" ? "/" : `${pagePath(path)}/`);
export function canonicalLink(to) {
  if (typeof to !== "string" || !to.startsWith("/") || to.startsWith("//")) return to;
  const match = to.match(/^([^?#]*)(.*)$/);
  if (/\.[^/]+$/.test(match[1])) return to;
  return (pagePath(match[1]) === "/" ? "/" : `${pagePath(match[1])}/`) + match[2];
}

// Authored descriptions describe the actual page, including release limits.
// There are no keyword lists, fabricated ratings or implied live checkout.
export const pageSeo = {
  "/": {title:"XOS1 by XiteAI | Say it. It's done.",description:"Talk to your PC and it does the work. XOS1 remembers what matters to you and keeps all of it on your machine instead of ours."},
  "/about": {title:"About XiteAI — The Startup Building XOS1",description:"Meet XiteAI, an early-stage startup developing XOS1 in Noida, India. Explore our mission, founder, working principles and approach to personal computing."},
  "/pricing": {title:"XOS1 Pricing — Compare Premium, Ultra & Max | XiteAI",description:"Compare planned XOS1 Premium, Ultra and Max subscriptions, model access, usage allowances and support, with monthly and yearly pricing in USD and INR."},
  "/pricing/premium": {title:"XOS1 Premium — Features & Planned Pricing | XiteAI",description:"Explore XOS1 Premium for personal use: voice and text, personal memory, computer actions and Lumen Visuals. Compare planned billing options and features."},
  "/pricing/ultra": {title:"XOS1 Ultra — Advanced Access & Pricing | XiteAI",description:"Explore XOS1 Ultra for demanding work, with advanced model access, expanded usage and priority support. Compare planned monthly and yearly subscriptions."},
  "/pricing/max": {title:"XOS1 Max — Model Access, Usage & Pricing | XiteAI",description:"Explore XOS1 Max for extensive daily use, with full model selection, the highest usage allowance and priority processing. Compare planned subscriptions."},
  "/faq": {title:"XOS1 FAQ — Memory, Privacy, Windows & Pricing | XiteAI",description:"Find answers about XOS1 for Windows: voice and text, personal memory, computer access, privacy, planned pricing, age safeguards and support."},
  "/news": {title:"XiteAI News — XOS1 & Company Announcements",description:"Explore XiteAI’s News page for company and XOS1 product announcements. Current editorial previews are clearly marked as sample content and dates."},
  "/blog": {title:"XiteAI Blog — AI, Memory & Interface Design",description:"Explore engineering, design and ideas behind XOS1 on the XiteAI Blog. Current essays are editorial previews with sample content and dates."},
  "/careers": {title:"Careers at XiteAI — Help Build XOS1",description:"Learn about working at XiteAI, our principles and interview process. Explore open roles on the Terminal or find information for invited candidates."},
  "/press": {title:"XiteAI Press Kit — Startup Facts, Logos & Media",description:"Find facts about XiteAI, the early-stage startup behind XOS1, plus official logos, brand assets and founder photographs. Contact the media desk."},
  "/legal": {title:"XiteAI Legal — XOS1 Terms, Privacy & Policies",description:"Read XiteAI’s published company, service, privacy, security and support policies for XOS1 and the Terminal. See which policies are still unpublished."},
  "/sitemap": {title:"XiteAI Sitemap — XOS1, Company & Legal Pages",description:"Browse the XiteAI website by page: XOS1, subscriptions, FAQ, company, careers, press, editorial previews and every published legal policy."},
  "/legal/company-policy": {title:"XiteAI Company Policy — Principles & Working Practices",description:"Read the XiteAI Code, company principles, published policies and proposed working practices. Find the right contact for questions and concerns."},
  "/legal/terms": {title:"XOS1 Terms of Service — Licence & Subscriptions | XiteAI",description:"Read the terms governing XOS1: eligibility, licence, subscriptions, permitted use, device access, AI limitations, service changes and responsibilities."},
  "/legal/acceptable-use-policy": {title:"XOS1 Acceptable Use Policy | XiteAI",description:"Understand responsible use of XOS1, prohibited activity, device permissions, biometric enrolment, age safeguards, security reports and enforcement."},
  "/legal/refund-policy": {title:"XOS1 Refund Policy — Eligibility & Requests | XiteAI",description:"Read XiteAI’s refund policy for XOS1 subscriptions, including eligibility, payment errors, service discontinuation and how to request assistance."},
  "/legal/beta-terms": {title:"XOS1 Beta Terms — Release, Updates & Support | XiteAI",description:"Read the XOS1 beta terms covering development-release limitations, availability, updates and support. No public launch date is promised here."},
  "/legal/privacy": {title:"XOS1 Privacy Policy — Local Data & Cloud AI | XiteAI",description:"Understand what XOS1 stores on your device, what enters cloud AI requests and which service records XiteAI receives. Review privacy choices and rights."},
  "/legal/data-deletion": {title:"XOS1 Data Deletion — Local Records & Requests | XiteAI",description:"Learn the difference between deleting XOS1 records on your device and requesting deletion of information held by XiteAI, including backups and limitations."},
  "/legal/minors-policy": {title:"XOS1 Minors Policy — Age Safeguards & Controls | XiteAI",description:"Read XOS1’s all-age eligibility policy, age-appropriate AI boundaries, intended parental-control design and privacy considerations for children and teens."},
  "/legal/cookie-policy": {title:"XiteAI Cookie Policy — Browser Storage & Choices",description:"See which cookies and browser storage XiteAI uses, how privacy preferences work and how to change your choices. Review necessary and optional storage."},
  "/legal/ai-disclaimer": {title:"XOS1 AI Disclaimer — Accuracy & Limitations | XiteAI",description:"Understand XOS1’s AI limitations, incorrect or outdated responses and the need to verify consequential information, actions and professional-advice claims."},
  "/legal/security": {title:"XiteAI Security — XOS1 Safeguards & Reporting",description:"Learn about XOS1 and website safeguards, responsible vulnerability reporting and how to contact XiteAI about security concerns or suspicious messages."},
  "/legal/support-policy": {title:"XOS1 Support Policy — Help & Request Tracking | XiteAI",description:"Find the support process for XOS1, what to include in a help request and how to use the Terminal help desk to track a request with its reference."},
  "/404": {title:"Page Not Found | XiteAI",description:"This XiteAI page could not be found. Return to XOS1 or explore pricing, company information, FAQ and published legal policies.",noindex:true},
};

export function resolvePageSeo(path, fallback = {}) {
  return {...fallback,...pageSeo[pagePath(path)],path:pagePath(path),image:fallback.image || OG_IMAGE};
}

const organizationId = `${SEO_ORIGIN}/#organization`;
const websiteId = `${SEO_ORIGIN}/#website`;
const softwareId = `${SEO_ORIGIN}/#xos1`;
export function pageGraph(meta) {
  if (pagePath(meta.path) === "/404") return null;
  const url = canonicalUrl(meta.path);
  const type = meta.path === "/about" ? "AboutPage" : ["/news","/blog","/pricing","/legal","/sitemap"].includes(meta.path) ? "CollectionPage" : "WebPage";
  const organization = {"@type":"Organization","@id":organizationId,name:"XiteAI",description:"XiteAI is an early-stage startup developing XOS1 in Noida, India. It currently operates as an unregistered startup.",url:`${SEO_ORIGIN}/`,logo:{"@type":"ImageObject",url:`${SEO_ORIGIN}/brand/xiteai.png`},email:"contact@xiteai.com",sameAs:["https://www.linkedin.com/company/xiteai-technologies","https://x.com/XiteAI","https://www.instagram.com/xiteai/","https://www.threads.com/@xiteai","https://www.facebook.com/people/Xiteai/61579296371742/","https://www.producthunt.com/@xiteai"]};
  const website = {"@type":"WebSite","@id":websiteId,url:`${SEO_ORIGIN}/`,name:"XiteAI",alternateName:"XiteAI Technologies",publisher:{"@id":organizationId},inLanguage:"en"};
  const webpage = {"@type":type,"@id":`${url}#webpage`,url,name:meta.title,description:meta.description,isPartOf:{"@id":websiteId},publisher:{"@id":organizationId},inLanguage:"en",primaryImageOfPage:{"@type":"ImageObject",url:meta.image.startsWith("/") ? SEO_ORIGIN+meta.image : meta.image}};
  const graph = [organization,website,webpage];
  if (meta.path === "/") {
    webpage.mainEntity = {"@id":softwareId};
    graph.push({"@type":"SoftwareApplication","@id":softwareId,name:"XOS1",alternateName:"XiteAI Operating System One",url,operatingSystem:"Windows",applicationCategory:"ProductivityApplication",description:meta.description,creator:{"@id":organizationId},featureList:["Voice and text conversation","Personal memory","Lumen Visuals","Computer use","Privacy and permission controls"]});
  }
  if (meta.path === "/about") webpage.about = {"@id":organizationId};
  if (meta.path.startsWith("/pricing")) webpage.about = {"@id":softwareId};
  if (meta.path !== "/") {
    const segments = meta.path.split("/").filter(Boolean);
    const crumbs = [{"@type":"ListItem",position:1,name:"XiteAI",item:`${SEO_ORIGIN}/`}];
    if (segments.length > 1) {
      const parent = `/${segments[0]}`;
      crumbs.push({"@type":"ListItem",position:2,name:({legal:"Legal",pricing:"Pricing",news:"News",blog:"Blog"})[segments[0]] || segments[0],item:canonicalUrl(parent)});
    }
    crumbs.push({"@type":"ListItem",position:crumbs.length+1,name:meta.title.replace(/\s*[|·]\s*XiteAI$/,""),item:url});
    webpage.breadcrumb = {"@id":`${url}#breadcrumb`};
    graph.push({"@type":"BreadcrumbList","@id":`${url}#breadcrumb`,itemListElement:crumbs});
  }
  if (meta.article?.status === "published") {
    const post = meta.article;
    graph.push({"@type":meta.path.startsWith("/news/") ? "NewsArticle" : "BlogPosting","@id":`${url}#article`,headline:post.title,description:post.summary,image:[webpage.primaryImageOfPage.url],datePublished:post.publishedAt,...(post.updatedAt ? {dateModified:post.updatedAt} : {}),author:{"@id":organizationId},publisher:{"@id":organizationId},mainEntityOfPage:{"@id":webpage["@id"]}});
  }
  return {"@context":"https://schema.org","@graph":graph};
}
export const serializeSchema = value => JSON.stringify(value).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
