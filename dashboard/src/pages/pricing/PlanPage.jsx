import { useEffect } from "react";
import { Link } from "../../site/CanonicalLink.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import { usePageMeta } from "../../lib/seo.jsx";
import { planCatalog, planMeta, planQuote } from "./planCatalog.js";
import BillingControls, { BillingPrice, useBillingOptions } from "./BillingControls.jsx";
import "./PlanDetail.css";

const Arrow = () => <span aria-hidden="true">↗</span>;
function Intro({plan,options}) {
  const quote = planQuote(plan,options.currency,options.billing);
  return <div className="tier-intro"><div className="tier-intro-copy"><p className="tier-eyebrow">XOS1 subscription</p><h1>XOS1 {plan.name}.</h1><p className="tier-description">{plan.intro}</p></div><div className="tier-intro-purchase"><p className="tier-purchase-label">Your subscription</p><BillingControls options={options} /><BillingPrice quote={quote} className="tier-hero-price" /><Link className="tier-primary" to={`https://xtec.xiteai.com/contact?to=sales&plan=${plan.id}&billing=${options.billing}&currency=${options.currency}`}>Ask about {plan.name}<Arrow /></Link><p className="tier-tax">{quote.currency} · Before applicable tax</p></div></div>;
}
function Inclusions({plan}) {
  return <section className="tier-inclusions" aria-labelledby="tier-includes-title"><h2 id="tier-includes-title">{plan.name} includes</h2><ul>{plan.features.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul></section>;
}
function Comparison({plan,options}) {
  return <section className="tier-comparison" aria-labelledby="tier-compare-title"><header><p className="tier-eyebrow">Subscriptions</p><h2 id="tier-compare-title">Compare the plans.</h2><Link to={`/pricing${options.query}`}>All pricing <Arrow /></Link></header><div className="tier-table-scroll" data-lenis-prevent><table><caption className="sr-only">XOS1 model access, usage and support by subscription</caption><thead><tr><th scope="col">Plan</th>{planCatalog.map(item => <th key={item.id} scope="col" data-current={item.id === plan.id}><Link to={`/pricing/${item.id}${options.query}`}>{item.name}</Link></th>)}</tr></thead><tbody>{[["Model access","modelAccess"],["Usage allowance","usage"],["Support","support"]].map(([name,key]) => <tr key={key}><th scope="row">{name}</th>{planCatalog.map(item => <td key={item.id} data-current={item.id === plan.id}>{item[key]}</td>)}</tr>)}<tr><th scope="row">Monthly equivalent</th>{planCatalog.map(item => <td key={item.id} data-current={item.id === plan.id}>{planQuote(item,options.currency,options.billing).formatted}</td>)}</tr></tbody></table></div></section>;
}
export default function PlanPage({planId}) {
  const plan = planCatalog.find(item => item.id === planId);
  const options = useBillingOptions();
  usePageMeta(planMeta(plan));
  useEffect(()=>{ window.scrollTo(0,0); },[planId]);
  return <div className={`site tier-page tier-${planId}`}><SiteNav /><main className="site-top tier-frame">
    <nav className="tier-nav" aria-label="XOS1 subscriptions"><Link to={`/pricing${options.query}`}>← Pricing</Link><div>{planCatalog.map(item => <Link key={item.id} to={`/pricing/${item.id}${options.query}`} aria-current={item.id === planId ? "page" : undefined}>{item.name}</Link>)}</div></nav>
    <section className="tier-hero"><Intro plan={plan} options={options} /></section>
    <Inclusions plan={plan} />
    <Comparison plan={plan} options={options} />
    <section className="tier-confidence"><h2>Your permissions.<br />Your information.</h2><div><p>Privacy, age safeguards and the permissions you grant are part of every XOS1 experience.</p><Link to="/legal/privacy">Privacy Policy <Arrow /></Link><Link to="/legal/minors-policy">Age safeguards <Arrow /></Link></div></section>
    <section className="tier-closing"><div><p className="tier-eyebrow">XOS1 {plan.name}</p><h2>{plan.intro}</h2></div><Link className="tier-primary" to={`https://xtec.xiteai.com/contact?to=sales&plan=${plan.id}&billing=${options.billing}&currency=${options.currency}`}>Talk to XiteAI <Arrow /></Link></section>
  </main><SiteFooter /></div>;
}
