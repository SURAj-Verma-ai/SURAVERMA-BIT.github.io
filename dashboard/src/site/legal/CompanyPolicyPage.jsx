import { useEffect } from "react";
import { Link } from "../CanonicalLink.jsx";
import SiteNav from "../SiteNav.jsx";
import SiteFooter from "../SiteFooter.jsx";
import { legalGroups, published } from "../content.js";
import { usePageMeta } from "../../lib/seo.jsx";
import { companyPolicy, workingPractices } from "./companyPolicy.js";
import CompanyPolicyScene from "./CompanyPolicyScene.jsx";
import "@fontsource/lora/latin-500.css";
import "./CompanyPolicyPage.css";

const section = id => companyPolicy.sections.find(item => item.id === id);

export default function CompanyPolicyPage() {
  usePageMeta({title:"XiteAI Company Policy",description:"The XiteAI Code, our working practices and published company policies.",path:"/legal/company-policy"});
  useEffect(() => { window.scrollTo(0,0); },[]);
  return <div className="site cpl-page">
    <SiteNav />
    <main className="site-top">
      <header className="cpl-hero cpl-frame">
        <nav className="cpl-crumb" aria-label="Breadcrumb"><Link to="/legal">Legal</Link><span aria-hidden="true">/</span><span>Company policy</span></nav>
        <div className="cpl-hero-grid"><div><p className="cpl-label">XiteAI</p><h1>XiteAI Company Policy.</h1><p className="cpl-lede">The XiteAI Code, our working practices and published company policies.</p><p className="cpl-date">Updated 21 October 2026</p></div><CompanyPolicyScene /></div>
        <nav className="cpl-index" aria-label="On this page"><a href="#code">The XiteAI Code <span aria-hidden="true">↓</span></a><a href="#practices">Working practices <span aria-hidden="true">↓</span></a><a href="#documents">Policy documents <span aria-hidden="true">↓</span></a></nav>
      </header>
      <section className="cpl-scope cpl-frame cpl-section" aria-labelledby="cpl-scope-title"><h2 id="cpl-scope-title">About this document</h2><div>{section("scope").paragraphs.map(text => <p key={text}>{text}</p>)}</div></section>
      <section id="code" className="cpl-code cpl-frame cpl-section" aria-labelledby="cpl-code-title"><div><p className="cpl-label">How we work</p><h2 id="cpl-code-title">The XiteAI Code</h2><p className="cpl-side-note">The standards we follow in our work.</p></div><div className="cpl-code-copy">{section("code").paragraphs.map(text => <p key={text}>{text}</p>)}</div></section>
      <section id="practices" className="cpl-frame cpl-section" aria-labelledby="cpl-practices-title"><div className="cpl-section-head"><div><p className="cpl-label">{section("practices").title}</p><h2 id="cpl-practices-title">Decisions, responsibility<br />and communication.</h2></div><p>{section("practices").paragraphs[0]}</p></div><ol className="cpl-practices">{workingPractices.map(rule => <li key={rule.id}><h3>{rule.title}</h3><p>{rule.text}</p></li>)}</ol></section>
      <section id="documents" className="cpl-frame cpl-section" aria-labelledby="cpl-documents-title"><div className="cpl-section-head"><div><p className="cpl-label">Policy documents</p><h2 id="cpl-documents-title">Read each policy in full.</h2></div><p>{section("documents").paragraphs[0]}</p></div><div className="cpl-directory">{legalGroups.map(group => {
        const docs = published.filter(doc => doc.group === group && doc.slug !== "company-policy");
        if (!docs.length) return null;
        return <section key={group} aria-label={group}><h3>{group}</h3><ul>{docs.map(doc => {
          return <li key={doc.slug}><Link className="cpl-doc-row" to={`/legal/${doc.slug}`}><span><span className="cpl-doc-title">{doc.title}</span><span className="cpl-doc-summary">{doc.summary}</span></span><span className="cpl-doc-state">Read policy <span aria-hidden="true">↗</span></span></Link></li>;
        })}</ul></section>;
      })}</div></section>
      <section className="cpl-questions cpl-frame cpl-section" aria-labelledby="cpl-questions-title"><div><h2 id="cpl-questions-title">Questions and concerns</h2>{section("questions").paragraphs.map(text => <p key={text}>{text}</p>)}</div><div className="cpl-contact-links"><Link to="https://xtec.xiteai.com/contact">Contact XiteAI <span aria-hidden="true">↗</span></Link><Link to="https://xtec.xiteai.com/contact?to=privacy">Privacy requests <span aria-hidden="true">↗</span></Link><Link to="https://xtec.xiteai.com/contact?to=security">Security reports <span aria-hidden="true">↗</span></Link></div></section>
    </main><SiteFooter />
  </div>;
}
