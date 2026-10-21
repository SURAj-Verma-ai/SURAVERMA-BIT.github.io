import { useEffect } from "react";
import { Link } from "../../site/CanonicalLink.jsx";
import { useReducedMotion } from "framer-motion";
import { motion, EASE } from "../../lib/motion.js";
import { usePageMeta } from "../../lib/seo.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import { office } from "../../site/content.js";
import { XITEAI_CODE } from "../../site/xiteaiCode.js";
import ProgressTimeline from "./ProgressTimeline.jsx";
import { milestones, principles } from "./aboutContent.js";
import EditorialCarousel from "../editorial/EditorialCarousel.jsx";
import "@fontsource/lora/latin-500.css";
import "./AboutPage.css";
import "../editorial/EditorialPage.css";

function Reveal({children,className="",delay=0}) {
  const still = useReducedMotion();
  return <motion.div className={className} initial={still ? false : {opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.75,delay:still ? 0:delay,ease:EASE}}>{children}</motion.div>;
}

export default function AboutPage() {
  usePageMeta({title:"About XiteAI · The company behind XOS1",description:"XiteAI is building an AI-native operating system. Our mission, work, founder and path forward.",path:"/about"});
  useEffect(() => { window.scrollTo(0,0); },[]);
  return <div className="site ab-page">
    <SiteNav />
    <main className="ab-main site-top">
      <section className="ab-hero ab-frame" aria-labelledby="ab-title">
        <Reveal className="ab-hero-top"><p className="ab-label">About XiteAI</p><p className="ab-location">Noida, India <span aria-hidden="true">↗</span></p></Reveal>
        <div className="ab-hero-body">
          <Reveal><h1 id="ab-title">Building the intelligence every computer will run on.</h1></Reveal>
          <Reveal className="ab-hero-copy" delay={.12}><p>XiteAI is building XOS1, an AI-native operating system that brings voice, memory and action into the same conversation.</p><p>We want people to spend less of their lives operating a computer, and more on what they want to do.</p><div className="ab-actions"><Link className="ab-button" to="/">Explore XOS1 <span aria-hidden="true">↗</span></Link><Link className="ab-text-link" to="/careers">Join XiteAI <span aria-hidden="true">↗</span></Link></div></Reveal>
        </div>
        <nav className="ab-index" aria-label="On this page">{[["mission","Mission"],["work","Our work"],["values","Values"],["safeguards","Safeguards"],["founder","Founder"],["progress","Progress"]].map(([id,label]) => <a href={`#${id}`} key={id}>{label}<span aria-hidden="true">↓</span></a>)}</nav>
      </section>

      <section id="mission" className="ab-mission ab-frame ab-section" aria-labelledby="ab-mission-title">
        <Reveal className="ab-section-top"><p className="ab-label ab-section-label">Our mission</p></Reveal>
        <Reveal className="ab-mission-copy"><h2 id="ab-mission-title">More time to think.<br />More room to create.</h2><p>Make everyday computing simpler, so people can spend more time on their work, their ideas and their lives.</p></Reveal>
        <Reveal className="ab-mission-photo"><img src="/media/company/people-and-technology.webp" srcSet="/media/company/people-and-technology-960.webp 960w, /media/company/people-and-technology.webp 1721w" sizes="(max-width:760px) calc(100vw - 48px), (max-width:1440px) 69vw, 997px" width="1721" height="914" loading="lazy" decoding="async" alt="A woman wearing an earbud rests beside a sunlit window" /><p>We are building technology<br />around the people who use it.</p></Reveal>
      </section>

      <section id="work" className="ab-work ab-frame ab-section" aria-labelledby="ab-work-title">
        <Reveal className="ab-work-intro"><p className="ab-label ab-section-label">What we do</p><h2 id="ab-work-title">We build XOS1.</h2><p>We are creating an AI-native operating system. Our goal is a computer people can talk to and work with directly.</p><Link className="ab-text-link" to="/">Meet XOS1 <span aria-hidden="true">↗</span></Link></Reveal>
        <Reveal className="ab-company-purpose"><p>Good technology should be useful in everyday life.</p><p>That means making it understandable, being honest about its limits and taking care with the information people entrust to it.</p><p>Those standards guide what we build and how we work.</p></Reveal>
      </section>

      <section id="values" className="ab-values ab-frame ab-section" aria-labelledby="ab-values-title">
        <Reveal className="ab-values-head"><p className="ab-label ab-section-label">Our values</p><h2 id="ab-values-title">Speak openly.<br />Solve together.</h2><p>Raise concerns early, use practical evidence and share the work with the people and support it needs.</p></Reveal>
        <ol className="ab-principles">{principles.map(p => <li key={p.title}><Reveal className="ab-principle"><h3>{p.title}</h3><p>{p.text}</p></Reveal></li>)}</ol>
        <details className="ab-code"><summary>Read the XiteAI Code <span aria-hidden="true">+</span></summary>{XITEAI_CODE.map(rule => <section key={rule.id}><h3>{rule.title}</h3><p>{rule.text}</p></section>)}</details>
        <div className="ab-policy-reference"><p>Our working practices explain how we make decisions, hand over work and raise concerns.</p><Link className="ab-text-link" to="/legal/company-policy">XiteAI Company Policy <span aria-hidden="true">↗</span></Link></div>
      </section>

      <section id="safeguards" className="ab-safeguards ab-frame ab-section" aria-labelledby="ab-safeguards-title">
        <Reveal className="ab-safeguards-head"><p className="ab-label ab-section-label">Our responsibilities</p><h2 id="ab-safeguards-title">Privacy and safeguards.</h2><p>We publish our privacy, security and use policies. They explain how information is handled, how to make a request and where to report a problem.</p></Reveal>
        <div className="ab-safeguard-links">{[
          ["Privacy","We explain what information is collected and why. People can request access, correction or deletion.","/legal/privacy"],
          ["Security","We provide a direct way to report security concerns and describe how access to the Terminal is protected.","/legal/security"],
          ["Responsible use","Our policies set out appropriate use and important limits. People should be able to understand the decisions and actions that affect them.","/legal/acceptable-use-policy"],
        ].map(([title,text,to]) => <Reveal key={title}><Link to={to}><h3>{title}<span aria-hidden="true">↗</span></h3><p>{text}</p></Link></Reveal>)}</div>
      </section>

      <section id="founder" className="ab-founder ab-frame ab-section" aria-labelledby="ab-founder-title">
        <Reveal className="ab-founder-heading"><p className="ab-label ab-section-label">Founder</p></Reveal>
        <div className="ab-founder-layout">
          <Reveal className="ab-founder-portrait"><img src="/brand/press/previews/founder.jpg" width="900" height="824" alt="Suraj Verma" loading="lazy" decoding="async" /><div className="ab-founder-name"><h2 id="ab-founder-title">Suraj Verma</h2><p>Founder & CEO</p></div></Reveal>
          <Reveal className="ab-founder-copy"><blockquote>“Honestly? I just wanted to build something. XiteAI is what came out of it.”</blockquote><p className="ab-founder-bio">Suraj started working on XiteAI in 2024 with the Student Chat App. He now leads the development of XOS1.</p><Link className="ab-text-link" to="/press">Press resources <span aria-hidden="true">↗</span></Link></Reveal>
        </div>
      </section>

      <section id="progress" className="ab-progress ab-frame ab-section" aria-labelledby="ab-progress-title">
        <Reveal className="ab-progress-head"><div><p className="ab-label ab-section-label">Our path of progress</p><h2 id="ab-progress-title">From 2024 to today.</h2></div></Reveal>
        <ProgressTimeline milestones={milestones} />
      </section>

      <EditorialCarousel kind="news" title="News" description="Company and product announcements." />
      <EditorialCarousel kind="blog" title="Blog" description="Engineering, design and ideas from XiteAI." />

      <section className="ab-join ab-frame ab-section" aria-labelledby="ab-join-title"><Reveal className="ab-join-inner"><div><p className="ab-label">Built in Noida. Made for people.</p><h2 id="ab-join-title">Help build XiteAI.</h2><p>{office.lines[0]}, {office.lines[1]}.</p></div><div className="ab-actions"><Link className="ab-button" to="/careers">Explore careers <span aria-hidden="true">↗</span></Link><Link className="ab-text-link" to="https://xtec.xiteai.com/contact">Contact us <span aria-hidden="true">↗</span></Link></div></Reveal></section>
    </main>
    <SiteFooter />
  </div>;
}
