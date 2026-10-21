import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router-dom";
import XosPage from "../src/pages/xos1/XosPage.jsx";
import AboutPage from "../src/pages/about/AboutPage.jsx";
import PricingPage from "../src/pages/pricing/PricingPage.jsx";
import PlanPage from "../src/pages/pricing/PlanPage.jsx";
import FaqPage from "../src/pages/faq/FaqPage.jsx";
import EditorialPage from "../src/pages/editorial/EditorialPage.jsx";
import CareersPage from "../src/pages/careers/CareersPage.jsx";
import PressPage from "../src/pages/press/PressPage.jsx";
import SitemapPage from "../src/pages/sitemap/SitemapPage.jsx";
import LegalHub from "../src/site/legal/LegalHub.jsx";
import Privacy from "../src/site/legal/Privacy.jsx";
import Terms from "../src/site/legal/Terms.jsx";
import PolicyPage from "../src/site/legal/PolicyPage.jsx";
import CompanyPolicyPage from "../src/site/legal/CompanyPolicyPage.jsx";
import NotFoundPage from "../src/pages/not-found/NotFoundPage.jsx";
export { faqStructuredData, serializeFaqSchema } from "../src/pages/faq/faqSeo.js";

export function renderPage(page) {
  const components = {home:XosPage,about:AboutPage,pricing:PricingPage,plan:PlanPage,faq:FaqPage,careers:CareersPage,press:PressPage,sitemap:SitemapPage,legal:LegalHub,"not-found":NotFoundPage};
  let element, routePath = page.path;
  if (page.kind === "policy") {
    const Component = page.slug === "privacy" ? Privacy : page.slug === "terms" ? Terms : page.slug === "company-policy" ? CompanyPolicyPage : PolicyPage;
    element = createElement(Component);
    routePath = "/legal/:slug";
  } else if (page.kind === "news" || page.kind === "blog") {
    element = createElement(EditorialPage,{kind:page.kind});
    routePath = `/${page.kind}${page.slug ? "/:slug" : ""}`;
  } else {
    element = createElement(components[page.kind], {planId:page.planId,prerender:page.kind === "faq"});
  }
  return renderToString(createElement(StaticRouter,{location:page.path},
    createElement(Routes,null,createElement(Route,{path:routePath,element}))));
}
