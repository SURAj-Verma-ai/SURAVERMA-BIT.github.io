import { useEffect } from "react";
import { Link } from "../../site/CanonicalLink.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import { LineScene, Ink } from "../../site/LineScene.jsx";
import { usePageMeta } from "../../lib/seo.jsx";
import "@fontsource/lora/latin-500.css";
import "./NotFoundPage.css";

export const notFoundMeta = {title:"Page not found | XiteAI",description:"This page could not be found. Return to XiteAI or explore XOS1, pricing, careers and help.",path:"/404"};

function MissingPath() {
  return <LineScene className="nf-scene" viewBox="0 0 760 480">
    <path d="M 23 360 H 737 M 23 355 V 365 M 737 355 V 365" className="nf-baseline" />
    <Ink d="M 174 116 75 286 H 226 M 199 117 V 360" delay={0} />
    <Ink d="M 435 148 C 419 124 394 111 369 111 C 316 111 290 160 290 237 C 290 315 316 364 369 364 C 422 364 449 315 449 237 C 449 220 448 205 445 192" delay={.16} />
    <Ink d="M 623 116 524 286 H 675 M 648 117 V 360" delay={.3} />
    <path d="M 439 160 446 177" className="nf-missing-line" />
    <circle cx="435" cy="148" r="4" className="nf-point" /><circle cx="445" cy="192" r="4" className="nf-open-point" />
    <path d="M 369 386 V 408 H 292" className="nf-baseline" />
    <text x="288" y="412" textAnchor="end" className="nf-annotation">PAGE NOT FOUND</text>
  </LineScene>;
}

export default function NotFoundPage() {
  usePageMeta(notFoundMeta);
  useEffect(() => { window.scrollTo(0,0); },[]);
  return <div className="site nf-page"><SiteNav /><main className="site-top nf-main"><div className="nf-frame">
    <section className="nf-hero" aria-labelledby="nf-title"><div className="nf-copy"><p className="nf-label">404 / Page not found</p><h1 id="nf-title">This page<br />isn’t here.</h1><p className="nf-description">The link may have changed, or the address may be incomplete. You can start again from here.</p><div className="nf-actions"><Link to="/" className="nf-home">Go home <span aria-hidden="true">→</span></Link><Link to="/" className="nf-text-link">Explore XOS1 <span aria-hidden="true">↗</span></Link></div></div><MissingPath /></section>
    <nav className="nf-recovery" aria-label="Find another page"><p>Looking for something?</p><div><Link to="/about">About XiteAI <span aria-hidden="true">↗</span></Link><Link to="/pricing">Pricing <span aria-hidden="true">↗</span></Link><Link to="/careers">Careers <span aria-hidden="true">↗</span></Link><Link to="/faq">Questions & help <span aria-hidden="true">↗</span></Link></div></nav>
  </div></main><SiteFooter /></div>;
}
