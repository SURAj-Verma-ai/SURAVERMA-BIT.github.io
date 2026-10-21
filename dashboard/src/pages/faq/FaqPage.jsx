import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { motion, EASE } from "../../lib/motion.js";
import { usePageMeta, JsonLd } from "../../lib/seo.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import { openPrivacyChoices } from "../../site/privacyChoice.js";
import { faqTopics } from "./faqContent.js";
import { filterQuestions } from "./faqSearch.js";
import { faqMeta, faqStructuredData } from "./faqSeo.js";
import FaqScene from "./FaqScene.jsx";
import "@fontsource/lora/latin-500.css";
import "./FaqPage.css";

const questionIds = new Set(faqTopics.flatMap(topic => topic.questions.map(item => item.id)));

function Answer({item,prerender=false}) {
  return <div className="fq-answer">{item.answers.map(text => <p key={text}>{text}</p>)}<div className="fq-answer-links">{item.links?.map(link => link.action === "privacy" ? (prerender ? <a key={link.action} href="/legal/cookie-policy">Privacy choices and cookies<span aria-hidden="true">↗</span></a> : <button key={link.action} onClick={openPrivacyChoices}>{link.label}<span aria-hidden="true">↗</span></button>) : <Link key={link.to} to={link.to}>{link.label}<span aria-hidden="true">↗</span></Link>)}</div><a className="fq-permalink" href={`#${item.id}`}>Link to this answer <span aria-hidden="true">↗</span></a></div>;
}

// Native expanders keep the same content readable and usable before JS loads.
function StaticQuestion({item}) {
  return <details id={item.id} className="fq-item fq-static-question"><summary className="fq-toggle"><h3>{item.question}</h3><span className="fq-plus" aria-hidden="true" /></summary><Answer item={item} prerender /></details>;
}

const Question = memo(function Question({item,open,onToggle}) {
  const still = useReducedMotion();
  const buttonId = `${item.id}-button`;
  const panelId = `${item.id}-answer`;
  return <div id={item.id} className={`fq-item${open ? " is-open" : ""}`}>
    <h3><button id={buttonId} className="fq-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => onToggle(item.id)}><span>{item.question}</span><span className="fq-plus" aria-hidden="true" /></button></h3>
    <motion.div id={panelId} className="fq-answer-shell" role="region" aria-labelledby={buttonId} aria-hidden={!open} inert={open ? undefined : ""} initial={false} animate={{height:open ? "auto":0,opacity:open ? 1:0}} transition={{duration:still ? 0:.32,ease:EASE}}>
      <Answer item={item} />
    </motion.div>
  </div>;
});

export default function FaqPage({prerender=false,initialOpenId=null}) {
  const [query,setQuery] = useState("");
  const [topicId,setTopicId] = useState("all");
  const [openId,setOpenId] = useState(initialOpenId);
  const toggleQuestion = useCallback(id => setOpenId(previous => previous === id ? null : id),[]);
  usePageMeta(faqMeta);
  useEffect(() => {
    let frame;
    const followHash = () => {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      if (!questionIds.has(id)) return;
      setQuery(""); setTopicId("all"); setOpenId(id);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({block:"start",behavior:"instant"}));
    };
    if (window.location.hash) followHash(); else window.scrollTo(0,0);
    window.addEventListener("hashchange",followHash);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange",followHash); };
  },[]);
  const topics = useMemo(() => filterQuestions(faqTopics,query,topicId),[query,topicId]);
  const count = topics.reduce((total,topic) => total+topic.questions.length,0);
  const reset = () => { setQuery(""); setTopicId("all"); };
  return <div className="site fq-page">
    <JsonLd data={faqStructuredData} id="faq-schema" />
    <SiteNav />
    <main className="site-top">
      <header className="fq-hero fq-frame"><div className="fq-hero-grid"><div><p className="fq-eyebrow">XOS1 FAQ</p><h1>Frequently asked<br />questions.</h1><p className="fq-lede">Memory, computer access and your privacy.<br className="fq-desktop-break" /> Pricing, age safeguards and getting help.</p></div><FaqScene /></div></header>
      <div className="fq-body fq-frame">
        <aside className="fq-topics"><p className="fq-eyebrow">Browse topics</p><nav aria-label="FAQ topics">{prerender ? <a href="#faq-search">All questions</a> : <button aria-pressed={topicId === "all"} onClick={() => setTopicId("all")}>All questions</button>}{faqTopics.map(topic => prerender ? <a key={topic.id} href={`#fq-${topic.id}-title`}>{topic.title}</a> : <button key={topic.id} aria-pressed={topicId === topic.id} onClick={() => setTopicId(topic.id)}>{topic.title}</button>)}</nav><Link className="fq-topic-help" to="https://xtec.xiteai.com/contact">Contact XiteAI <span aria-hidden="true">↗</span></Link></aside>
        <div className="fq-content">
          <form className="fq-search" role="search" onSubmit={event => event.preventDefault()}><label htmlFor="faq-search">Find an answer</label><div className="fq-search-field"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><path d="m15 15 5 5" /></svg><input id="faq-search" type="search" disabled={prerender} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search questions and answers" autoComplete="off" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div></form>
          {prerender && <noscript><p className="fq-count">Browse a topic and expand any question, or use your browser’s Find command.</p></noscript>}
          <p className="fq-count" role="status">{count} {count === 1 ? "question" : "questions"}{query ? " match your search" : ""}</p>
          {topics.length ? topics.map(topic => <section className="fq-group" key={topic.id} aria-labelledby={`fq-${topic.id}-title`}><div className="fq-group-head"><h2 id={`fq-${topic.id}-title`}>{topic.title}</h2><p>{topic.description}</p></div>{topic.questions.map(item => prerender ? <StaticQuestion key={item.id} item={item} /> : <Question key={item.id} item={item} open={openId === item.id} onToggle={toggleQuestion} />)}</section>) : <section className="fq-empty" aria-labelledby="faq-empty-title"><h2 id="faq-empty-title">No matching questions.</h2><p>Try a different phrase or browse all topics. You can also send your question to XiteAI.</p><button onClick={reset}>Show all questions <span aria-hidden="true">↗</span></button></section>}
        </div>
      </div>
      <section className="fq-contact fq-frame" aria-labelledby="fq-contact-title"><div><h2 id="fq-contact-title">Still have a question?</h2><p>Contact the right team, or open a support request<br className="fq-desktop-break" /> that you can follow with a reference.</p></div><div className="fq-contact-actions"><Link to="https://xtec.xiteai.com/contact">Contact XiteAI <span aria-hidden="true">↗</span></Link><Link to="https://xtec.xiteai.com/#help">Help desk <span aria-hidden="true">↗</span></Link></div></section>
    </main><SiteFooter />
  </div>;
}
