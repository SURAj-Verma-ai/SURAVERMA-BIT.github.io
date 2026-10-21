import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/art.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./components/Toast.jsx";

// Keep each page's already-rendered HTML visible until its own code is ready.
// Other routes remain split into separate chunks and load only when visited.
const loaders = {
  home:() => import("./pages/xos1/XosPage.jsx"),
  about:() => import("./pages/about/AboutPage.jsx"),
  faq:() => import("./pages/faq/FaqPage.jsx"),
  pricing:() => import("./pages/pricing/PricingPage.jsx"),
  plan:() => import("./pages/pricing/PlanPage.jsx"),
  editorial:() => import("./pages/editorial/EditorialPage.jsx"),
  careers:() => import("./pages/careers/CareersPage.jsx"),
  press:() => import("./pages/press/PressPage.jsx"),
  sitemap:() => import("./pages/sitemap/SitemapPage.jsx"),
  legal:() => import("./site/legal/LegalHub.jsx"),
  privacy:() => import("./site/legal/Privacy.jsx"),
  terms:() => import("./site/legal/Terms.jsx"),
  company:() => import("./site/legal/CompanyPolicyPage.jsx"),
  policy:() => import("./site/legal/PolicyPage.jsx"),
  notFound:() => import("./pages/not-found/NotFoundPage.jsx"),
};
async function mount() {
  const path = window.location.pathname.replace(/\/+$/,"") || "/";
  const exact = {"/":"home","/xos1":"home","/about":"about","/faq":"faq","/pricing":"pricing","/careers":"careers","/press":"press","/sitemap":"sitemap","/legal":"legal","/legal/privacy":"privacy","/legal/terms":"terms","/legal/company-policy":"company"};
  const kind = exact[path] || (/^\/pricing\/(premium|ultra|max)$/.test(path) ? "plan" : /^\/(news|blog)(\/|$)/.test(path) ? "editorial" : path.startsWith("/legal/") ? "policy" : "notFound");
  const { default: InitialPage } = await loaders[kind]();
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode><MotionConfig reducedMotion="user"><BrowserRouter><ToastProvider>
      <ErrorBoundary resetKey="app"><App initialPages={{[kind]:InitialPage}} /></ErrorBoundary>
    </ToastProvider></BrowserRouter></MotionConfig></React.StrictMode>,
  );
}
mount().catch(error => console.error("The page could not finish loading. Please reload.",error));
