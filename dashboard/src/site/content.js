/* The public site's copy and data, carried over from the product site
   (XOS1web/website1, content/site.ts and content/legal.ts) so the Terminal's
   public pages and that site are one object rather than two that resemble
   each other.

   Policy metadata lives in `legalDocs`. The shared publication manifest
   controls which completed pages appear in navigation and the sitemap. */

import publishedSlugs from "./legal/published.json";
import { productAgePolicy } from "./agePolicy.js";

/* Public location only. No street address or incubation affiliation is claimed. */
export const office = {
  lines: ["Noida", "India"],
  timeZone: "Asia/Kolkata",
  maps: "https://www.google.com/maps/search/?api=1&query=Noida%2C+India",
};

export const site = {
  name: "XiteAI Operating System One",
  shortName: "XOS1",
  company: "XiteAI",
  companyAddress: office.lines.join(", "),
  // The marketing site. Pages that only exist there are linked absolutely, so
  // the footer never points at a route this app does not serve.
  web: "https://xiteai.com",
  terminal: "https://xtec.xiteai.com",
  minimumAge: productAgePolicy.minimumAge,
  contact: {
    general: "support@xiteai.com",
    privacy: "privacy@xiteai.com",
    security: "security@xiteai.com",
    legal: "legal@xiteai.com",
    careers: "careers@xiteai.com",
    enterprise: "enterprise@xiteai.com",
    contact: "contact@xiteai.com",
    feedback: "feedback@xiteai.com",
    investors: "investors@xiteai.com",
    press: "press@xiteai.com",
    sales: "sales@xiteai.com",
    vendors: "vendors@xiteai.com",
    concierge: "concierge@xiteai.com",
    noReply: "no-reply@xiteai.com",
  },
};

/* Who to write to, for the contact page. Each desk is one published address;
   the groups only decide how the list is spaced. An address that is not here
   (admin, founder, personal inboxes) is not public. */
export const desks = [
  { id: "enterprise", name: "Enterprise", group: "Commercial", email: site.contact.enterprise, about: "Deploying XiteAI across an organisation, at any scale." },
  { id: "sales", name: "Sales", group: "Commercial", email: site.contact.sales, about: "Pricing, licensing and purchasing." },
  { id: "investors", name: "Investors", group: "Commercial", email: site.contact.investors, about: "Investor relations, for current and prospective investors." },
  { id: "vendors", name: "Vendors", group: "Commercial", email: site.contact.vendors, about: "Suppliers and service providers to XiteAI." },
  { id: "support", name: "Support", group: "Product", email: site.contact.general, about: "Help with XOS1, your account or a request already open.",
    // The help desk first: it gives a reference to track, which an email does not.
    self: { href: "https://xtec.xiteai.com/#help", label: "Open the help desk" }, x: { handle: "@XiteAISupport", href: "https://x.com/XiteAISupport" } },
  { id: "feedback", name: "Feedback", group: "Product", email: site.contact.feedback, about: "What XiteAI should build next, and what it should build better." },
  { id: "press", name: "Press", group: "Company", email: site.contact.press, about: "Media inquiries, interviews and brand assets." },
  { id: "careers", name: "Careers", group: "Company", email: site.contact.careers, about: "Applications, interviews and offers.", link: { to: "https://xtec.xiteai.com/careers/open-roles", label: "View open roles" } },
  { id: "general", name: "General", group: "Company", email: site.contact.contact, about: "Anything no other desk covers." },
  { id: "security", name: "Security", group: "Trust", email: site.contact.security, about: "Report a vulnerability, or a message that claims to be from XiteAI." },
  { id: "privacy", name: "Privacy", group: "Trust", email: site.contact.privacy, about: "Data requests, deletion and questions about personal information." },
  { id: "legal", name: "Legal", group: "Trust", email: site.contact.legal, about: "Legal notices, contracts and regulatory matters." },
];

/** How soon a desk answers. One promise, said the same way everywhere. */
export const replyTime = "Replies within three to six business days.";

/* Where XiteAI is, besides here. Listed on the contact page and given to
   search engines as the company's own profiles. */
export const socials = [
  { name: "LinkedIn", handle: "xiteai-technologies", href: "https://www.linkedin.com/company/xiteai-technologies" },
  { name: "X", handle: "@XiteAI", href: "https://x.com/XiteAI" },
  { name: "Instagram", handle: "@xiteai", href: "https://www.instagram.com/xiteai/" },
  { name: "Threads", handle: "@xiteai", href: "https://www.threads.com/@xiteai" },
  { name: "Facebook", handle: "Xiteai", href: "https://www.facebook.com/people/Xiteai/61579296371742/" },
  { name: "Product Hunt", handle: "@xiteai", href: "https://www.producthunt.com/@xiteai" },
];

/* Founder-confirmed status, 24 October 2026. XiteAI is the startup's brand;
   do not add a corporate suffix, registration number or registered office. */
export const company = {
  name: "XiteAI",
  status: "Early-stage startup",
  identity: "XiteAI is an early-stage startup founded by Suraj Verma. It currently operates as an unregistered startup.",
  grievance: { name: "Suraj Verma", designation: "Grievance Officer", email: "grievance@xiteai.com" },
};

/* Press facts describe the startup. The kit contains the supplied brand assets. */
export const press = {
  boilerplate: "XiteAI is an early-stage startup founded by Suraj Verma in Noida, India. It is developing XOS1, an AI-native operating system that brings voice, memory and computer actions into one experience, with speech and identity processed on the user's machine.",
  facts: [
    ["Startup", company.name],
    ["Founder", "Suraj Verma"],
    ["Based in", "Noida, India"],
    ["Stage", company.status],
    ["Product", "XOS1, the XiteAI Operating System One"],
    ["Press contact", "press@xiteai.com"],
  ],
  logos: {
    zip: "/brand/press/xiteai-press-logos.zip",
    items: [
      { name: "XiteAI mark", edition: "Black", ground: "paper", src: "/brand/press/logos/xiteai/xiteai-mark-black.png", format: "PNG" },
      { name: "XiteAI mark", edition: "Original", ground: "ink", src: "/brand/press/logos/xiteai/xiteai-mark-white-512.png", format: "PNG" },
      { name: "XiteAI icon", edition: "Light", ground: "sunk", src: "/brand/press/logos/xiteai/xiteai-icon-light-180.png", format: "PNG", icon: true },
      { name: "XiteAI icon", edition: "Dark", ground: "paper", src: "/brand/press/logos/xiteai/xiteai-icon-dark.svg", format: "SVG", icon: true },
      { name: "XOS1 app icon", edition: "Gold", ground: "sunk", src: "/brand/press/logos/xos1/xos1-app-icon-1024.png", format: "PNG", icon: true },
      { name: "XOS1 mark", edition: "White", ground: "ink", src: "/brand/press/logos/xos1/xos1-mark-white.png", format: "PNG" },
    ],
  },
  founder: {
    zip: "/brand/press/suraj-verma-portraits.zip",
    photos: [
      { preview: "/brand/press/previews/founder.jpg", file: "/brand/press/founder/suraj-verma-founder-ceo-1.jpg", size: "1180 × 1080" },
      { preview: "/brand/press/previews/founder-2.jpg", file: "/brand/press/founder/suraj-verma-founder-ceo-2.jpg", size: "1600 × 1600" },
      { preview: "/brand/press/previews/founder-3.jpg", file: "/brand/press/founder/suraj-verma-founder-ceo-3.jpg", size: "892 × 924" },
    ],
  },
};

/** Local processing/storage. Relevant text can separately enter an AI request. */
export const staysLocal = [
  { what: "Your voice recording", where: "transcribed on-device" },
  { what: "Your voiceprint and faceprint", where: "local biometric templates" },
  { what: "XOS1’s spoken responses", where: "generated on-device" },
  { what: "Memory and conversation history", where: "stored locally; relevant text can enter AI requests" },
  { what: "Notes, calendar and wallet records", where: "stored locally; relevant context can enter AI requests" },
  { what: "Your documents", where: "read locally; selected text can enter AI requests" },
];

/** Leaves the machine. Every hostname here is real. */
export const leavesDevice = [
  { what: "AI request text and relevant context", where: "XiteAI gateway → the provider configured for your release" },
  { what: "Install, version, update and crash information", where: "XiteAI Terminal" },
  { what: "Optional profile and tool usage reports", where: "XiteAI Terminal, only when sharing is enabled" },
  { what: "What you ask XOS1 to look up", where: "duckduckgo · brave · yahoo" },
  { what: "Tickers you view", where: "yahoo finance · coingecko · nse" },
  { what: "Cities you save", where: "open-meteo" },
  { what: "News requests", where: "bbc · google news · indiatimes · livemint" },
  { what: "Updates and model fetches", where: "github · hugging face" },
];

export const legalGroups = [
  "Company",
  "Terms & Usage",
  "Privacy & Data",
  "AI & Ethics",
  "Support & Operations",
  "Other",
];

/* `status` records publication or what remains before publication:
     published — approved company copy available on the website
     drafted  — written, needs a solicitor's pass
     ready    — draftable now from the codebase alone
     decision — needs a commercial answer first */
export const legalDocs = [
  {
    slug: "company-policy",
    title: "XiteAI Company Policy",
    group: "Company",
    summary: "The XiteAI Code, our working practices and published company policies.",
    status: "published",
    updated: "13 October 2026",
    version: "1.0",
  },
  // ── Terms & Usage ──────────────────────────────────────────
  {
    slug: "terms", path: "terms-of-service",
    title: "Terms of Service",
    group: "Terms & Usage",
    summary: "The agreement between you and us. Eligibility, licence, subscriptions, and where you stand.",
    status: "drafted",
    updated: "13 October 2026",
    version: "0.1 draft",
  },
  {
    slug: "acceptable-use-policy",
    updated: "13 October 2026",
    title: "Acceptable Use Policy",
    group: "Terms & Usage",
    summary: "What XOS1 must not be used for, including enrolling another person's voice without telling them.",
    status: "ready",
  },
  {
    slug: "fair-usage-policy",
    title: "Fair Usage Policy",
    group: "Terms & Usage",
    summary: "What each tier includes, and what happens at the limits.",
    status: "decision",
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    group: "Terms & Usage",
    summary: "Refund eligibility, service discontinuation and payment errors.",
    status: "decision",
  },
  {
    slug: "beta-terms",
    updated: "13 October 2026",
    title: "Beta Terms",
    group: "Terms & Usage",
    summary: "What to expect from XOS1’s beta release, including updates and support.",
    status: "drafted",
  },

  // ── Privacy & Data ─────────────────────────────────────────
  {
    slug: "privacy", path: "privacy-policy",
    title: "Privacy Policy",
    group: "Privacy & Data",
    summary: "What stays on your computer, what leaves it, and who receives it.",
    status: "drafted",
    updated: "13 October 2026",
    version: "0.1 draft",
  },
  {
    slug: "biometrics-policy",
    updated: "13 October 2026",
    title: "Biometrics Policy",
    group: "Privacy & Data",
    summary: "How your voiceprint and faceprint are made, stored, and destroyed.",
    status: "ready",
  },
  {
    slug: "data-deletion",
    updated: "13 October 2026",
    title: "Data Deletion",
    group: "Privacy & Data",
    summary: "Deleting local records and requesting deletion of company-held data.",
    status: "ready",
  },
  {
    slug: "third-party-disclosure",
    updated: "13 October 2026",
    title: "Third-Party Disclosure",
    group: "Privacy & Data",
    summary: "Every outside service XOS1 contacts, and exactly what each one receives.",
    status: "ready",
  },
  {
    slug: "minors-policy",
    title: "Minors Policy",
    group: "Privacy & Data",
    summary: "All-age access, age-appropriate AI and the intended parental-control design.",
    updated: "13 October 2026",
    status: "ready",
  },
  {
    slug: "cookie-policy",
    updated: "13 October 2026",
    title: "Cookie Policy",
    group: "Privacy & Data",
    summary: "What this website stores in your browser.",
    status: "ready",
  },
  {
    slug: "copyright-policy",
    title: "Copyright Policy",
    group: "Privacy & Data",
    summary: "Ownership of what XOS1 produces, and how to report infringement.",
    status: "decision",
  },

  // ── AI & Ethics ────────────────────────────────────────────
  {
    slug: "ai-disclaimer",
    updated: "13 October 2026",
    title: "AI Disclaimer",
    group: "AI & Ethics",
    summary: "XOS1 can produce incorrect answers. What that means for money, health and law.",
    status: "ready",
  },
  {
    slug: "responsible-ai",
    title: "Responsible AI",
    group: "AI & Ethics",
    summary: "Emotion inference, interactions with XOS1, and the limits on its use.",
    status: "ready",
  },
  {
    slug: "file-prompt-policy",
    title: "File & Prompt Policy",
    group: "AI & Ethics",
    summary: "What XOS1 may read on your disk, what it may write, and what it never sends.",
    status: "ready",
  },

  // ── Support & Operations ───────────────────────────────────
  {
    slug: "security",
    updated: "13 October 2026",
    title: "Security",
    group: "Support & Operations",
    summary: "How the app and this site are protected, and how to report a vulnerability.",
    status: "ready",
  },
  {
    slug: "support-policy",
    updated: "13 October 2026",
    title: "Support Policy",
    group: "Support & Operations",
    summary: "How to contact support and what to include in your request.",
    status: "decision",
  },
  {
    slug: "uptime-policy",
    title: "Uptime Policy",
    group: "Support & Operations",
    summary: "What we promise about availability, and what we cannot.",
    status: "decision",
  },

  // ── Other ──────────────────────────────────────────────────
  {
    slug: "brand-guidelines",
    title: "Brand Guidelines",
    group: "Other",
    summary: "Using the XiteAI OS1 name and mark.",
    status: "ready",
  },
];

export const published = legalDocs.filter((d) => publishedSlugs.includes(d.slug)).map((d) => ({ ...d, updated: d.updated || "6 October 2026" }));
export const docsInGroup = (g) => legalDocs.filter((d) => d.group === g);
export const findDoc = (slug) => legalDocs.find((d) => d.slug === slug);
