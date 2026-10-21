import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SiteNav from "../../site/SiteNav.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import { usePageMeta } from "../../lib/seo.jsx";
import { pricingOverview, pricingMeta, pricingAvailability, pricingQuestions } from "./pricingContent.js";
import { pricingLines } from "./pricingLines.js";
import { planCatalog, planQuote } from "./planCatalog.js";
import BillingControls, { BillingPrice, useBillingOptions } from "./BillingControls.jsx";
import "@fontsource/lora/latin-500.css";
import "./PricingLines.css";

// Each entrance plays once. Leaving the viewport or hiding the tab pauses it
// at its current frame; there is no scroll scrub, render loop or pointer loop.
function usePricingEntrance(ref) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = ref.current;
    const elements = root.matches("[data-pr-entrance]") ? [root] : [...root.querySelectorAll("[data-pr-entrance]")];
    const visible = new Set();
    const update = () => elements.forEach(element => {
      const running = visible.has(element) && !document.hidden;
      if (running && !media.matches) element.dataset.entered = "true";
      element.dataset.running = String(running && !media.matches);
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      update();
    }, { threshold: .08 });
    elements.forEach(element => observer.observe(element));
    document.addEventListener("visibilitychange", update);
    media.addEventListener("change", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); media.removeEventListener("change", update); };
  }, [ref]);
}

function PlanCard({ plan, active, options }) {
  const quote = planQuote(plan,options.currency,options.billing);
  return <article id={`pr-plan-${plan.id}`} className={`pr-plan-card pr-plan-${plan.id}`} data-active={active} aria-labelledby={`pr-${plan.id}`}>
    <div className="pr-card-top">
      <h2 id={`pr-${plan.id}`} className="pr-plan-name">{plan.name}</h2>
      <BillingPrice quote={quote} className="pr-price-line" />
      <p className="sr-only">{plan.name}: {plan.price} in USD before applicable taxes.</p>
      <p className="pr-plan-description">{pricingOverview.planSummaries[plan.id]}</p>
    </div>
    <div className="pr-card-rule" />
    <ul className="pr-plan-features">{plan.features.map(detail => <li key={detail}><span className="pr-check" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" /></svg></span><span>{detail}</span></li>)}</ul>
    <Link to={`/pricing/${plan.id}${options.query}`} className="pr-plan-cta"><span>Explore {plan.name}</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg></Link>
  </article>;
}

function PricingStage({options}) {
  const stage = useRef(null);
  const [active, setActive] = useState(1);
  const [switched, setSwitched] = useState(false);
  const [size, setSize] = useState({ width:1440, height:540, centreWidth:440 });
  usePricingEntrance(stage);
  useEffect(() => {
    const element = stage.current;
    const band = element.querySelector(".pr-line-band");
    const measure = () => {
      const width = band.clientWidth;
      const height = band.clientHeight;
      const card = band.querySelector(window.matchMedia("(max-width: 760px)").matches ? '[data-active="true"]' : ".pr-plan-ultra");
      const centreWidth = card.getBoundingClientRect().width;
      if (width && height && centreWidth) setSize(previous => previous.width === width && previous.height === height && previous.centreWidth === centreWidth ? previous : { width, height, centreWidth });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(band);
    element.querySelectorAll(".pr-plan-card").forEach(card => observer.observe(card));
    measure();
    return () => observer.disconnect();
  }, [active]);
  const {strokes, fills} = pricingLines(size.width, size.height, size.centreWidth);
  const replay = () => stage.current.querySelector(".pr-line-band").getAnimations({subtree:true}).forEach(animation => { animation.currentTime = 0; });
  return <section ref={stage} className="pr-plans" aria-label="XOS1 monthly subscription prices">
    <div className="pr-frame pr-mobile-plans" role="group" aria-label="Choose a subscription">{planCatalog.map((plan, index) => <button key={plan.id} type="button" aria-controls={`pr-plan-${plan.id}`} aria-pressed={active === index} onClick={() => { setActive(index); setSwitched(true); }}>{plan.name}<span>{planQuote(plan,options.currency,options.billing).formatted} / mo</span></button>)}</div>
    <div className="pr-line-band" data-pr-entrance data-switched={switched}>
      <svg className="pr-connected-lines" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <g className="pr-line-surfaces">{fills.map((d,index) => <path key={index} d={d} />)}</g>
        <g className="pr-four-strokes">{strokes.map((d,index) => <path key={index} d={d} pathLength="1" vectorEffect="non-scaling-stroke" />)}</g>
      </svg>
      <div className="pr-frame pr-plan-stage">{planCatalog.map((plan, index) => <PlanCard plan={plan} active={index === active} options={options} key={plan.id} />)}</div>
    </div>
    <div className="pr-frame pr-pricing-foot"><p>Prices before tax. Annual subscriptions are billed once a year.</p><div><button className="pr-replay" type="button" onClick={replay}>Replay animation <span aria-hidden="true">↻</span></button><a href="#pricing-details">Billing and availability <span aria-hidden="true">↓</span></a></div></div>
  </section>;
}

export default function PricingPage() {
  const main = useRef(null);
  const options = useBillingOptions();
  usePageMeta(pricingMeta);
  usePricingEntrance(main);
  useEffect(() => { window.scrollTo(0,0); },[]);
  return <div className="site pr-page">
    <SiteNav />
    <main className="site-top pr-main">
      <div className="pr-opening">
      <header className="pr-frame pr-heading" data-pr-entrance ref={main}>
        <p className="pr-kicker pr-hero-kicker">{pricingOverview.kicker}</p>
        <h1><span>{pricingOverview.headline}</span></h1>
        <p className="pr-hero-description">{pricingOverview.description}</p>
        <BillingControls options={options} />
      </header>
      <PricingStage options={options} />
      </div>
      <section id="pricing-details" className="pr-frame pr-details" aria-labelledby="pr-details-title">
        <div className="pr-section-heading"><p className="pr-kicker">Before you subscribe</p><h2 id="pr-details-title">Billing and availability.</h2></div>
        <div className="pr-notes">
          <div><h3>Beta availability</h3><p>{pricingAvailability}</p><Link to="/legal/beta-terms" className="pr-inline">Beta Terms <span aria-hidden="true">↗</span></Link></div>
          <div><h3>Clear billing</h3><p>The currency, billing period, applicable taxes and total will be shown before payment.</p><Link to="/legal/terms" className="pr-inline">Subscription terms <span aria-hidden="true">↗</span></Link></div>
          <div><h3>Privacy and permissions</h3><p>A subscription does not change the permissions you grant or the policies that govern your information.</p><Link to="/legal/privacy" className="pr-inline">Privacy Policy <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
      <section className="pr-frame pr-faq" aria-labelledby="pr-faq-title"><div className="pr-section-heading"><p className="pr-kicker">Questions</p><h2 id="pr-faq-title">Pricing questions.</h2><Link to="/faq" className="pr-inline">All questions <span aria-hidden="true">↗</span></Link></div><div className="pr-answers">{pricingQuestions.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><div className="pr-answer"><p>{item.answer}</p><Link to={item.to} className="pr-inline">{item.label} <span aria-hidden="true">↗</span></Link></div></details>)}</div></section>
      <section className="pr-frame pr-business"><h2>For an organisation?</h2><p>Talk to XiteAI about team and enterprise requirements.</p><Link to="https://xtec.xiteai.com/contact?to=enterprise" className="pr-inline">Contact the team <span aria-hidden="true">↗</span></Link></section>
    </main>
    <SiteFooter />
  </div>;
}
