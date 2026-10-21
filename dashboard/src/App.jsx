import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ScrollRail from "./components/ScrollRail.jsx";
import SmoothScroll from "./site/SmoothScroll.jsx";
import PrivacyChoices from "./site/PrivacyChoices.jsx";
import Spinner from "./components/Spinner.jsx";
import { published } from "./site/content.js";

const XosPage = lazy(() => import("./pages/xos1/XosPage.jsx"));
const AboutPage = lazy(() => import("./pages/about/AboutPage.jsx"));
const FaqPage = lazy(() => import("./pages/faq/FaqPage.jsx"));
const PricingPage = lazy(() => import("./pages/pricing/PricingPage.jsx"));
const PlanPage = lazy(() => import("./pages/pricing/PlanPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/not-found/NotFoundPage.jsx"));
const EditorialPage = lazy(() => import("./pages/editorial/EditorialPage.jsx"));
const CareersPage = lazy(() => import("./pages/careers/CareersPage.jsx"));
const PressPage = lazy(() => import("./pages/press/PressPage.jsx"));
const SitemapPage = lazy(() => import("./pages/sitemap/SitemapPage.jsx"));
const LegalHub = lazy(() => import("./site/legal/LegalHub.jsx"));
const Privacy = lazy(() => import("./site/legal/Privacy.jsx"));
const Terms = lazy(() => import("./site/legal/Terms.jsx"));
const PolicyPage = lazy(() => import("./site/legal/PolicyPage.jsx"));
const CompanyPolicyPage = lazy(() => import("./site/legal/CompanyPolicyPage.jsx"));

function HomeAlias() {
  const location = useLocation();
  return <Navigate replace to={`/${location.search}${location.hash}`} />;
}

export default function App({ initialPages = {} }) {
  const Home = initialPages.home || XosPage;
  const About = initialPages.about || AboutPage;
  const Faq = initialPages.faq || FaqPage;
  const Pricing = initialPages.pricing || PricingPage;
  const Plan = initialPages.plan || PlanPage;
  const Editorial = initialPages.editorial || EditorialPage;
  const Careers = initialPages.careers || CareersPage;
  const Press = initialPages.press || PressPage;
  const Sitemap = initialPages.sitemap || SitemapPage;
  const Legal = initialPages.legal || LegalHub;
  const PrivacyPolicy = initialPages.privacy || Privacy;
  const TermsPolicy = initialPages.terms || Terms;
  const CompanyPolicy = initialPages.company || CompanyPolicyPage;
  const Policy = initialPages.policy || PolicyPage;
  const NotFound = initialPages.notFound || NotFoundPage;
  return <>
    <ScrollRail /><SmoothScroll /><PrivacyChoices />
    <Suspense fallback={<div style={{height:"100vh",display:"grid",placeItems:"center"}}><Spinner size={20} delay={300} /></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/xos1" element={<HomeAlias />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/pricing" element={<Pricing />} />
        {["premium","ultra","max"].map(planId => <Route key={planId} path={`/pricing/${planId}`} element={<Plan planId={planId} />} />)}
        <Route path="/news" element={<Editorial kind="news" />} />
        <Route path="/news/:slug" element={<Editorial kind="news" />} />
        <Route path="/blog" element={<Editorial kind="blog" />} />
        <Route path="/blog/:slug" element={<Editorial kind="blog" />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<Press />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/legal" element={<Legal />} />
        {published.map(doc => <Route key={doc.slug} path={`/legal/${doc.slug}`} element={
          doc.slug === "privacy" ? <PrivacyPolicy /> : doc.slug === "terms" ? <TermsPolicy /> : doc.slug === "company-policy" ? <CompanyPolicy /> : <Policy slug={doc.slug} />
        } />)}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>;
}
