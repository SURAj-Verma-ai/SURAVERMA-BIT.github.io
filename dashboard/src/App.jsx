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

export default function App() {
  return <>
    <ScrollRail /><SmoothScroll /><PrivacyChoices />
    <Suspense fallback={<div style={{height:"100vh",display:"grid",placeItems:"center"}}><Spinner size={20} delay={300} /></div>}>
      <Routes>
        <Route path="/" element={<XosPage />} />
        <Route path="/xos1" element={<HomeAlias />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        {["premium","ultra","max"].map(planId => <Route key={planId} path={`/pricing/${planId}`} element={<PlanPage planId={planId} />} />)}
        <Route path="/news" element={<EditorialPage kind="news" />} />
        <Route path="/news/:slug" element={<EditorialPage kind="news" />} />
        <Route path="/blog" element={<EditorialPage kind="blog" />} />
        <Route path="/blog/:slug" element={<EditorialPage kind="blog" />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/legal" element={<LegalHub />} />
        {published.map(doc => <Route key={doc.slug} path={`/legal/${doc.slug}`} element={
          doc.slug === "privacy" ? <Privacy /> : doc.slug === "terms" ? <Terms /> : doc.slug === "company-policy" ? <CompanyPolicyPage /> : <PolicyPage slug={doc.slug} />
        } />)}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </>;
}
