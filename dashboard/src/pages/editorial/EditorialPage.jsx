import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "../../site/CanonicalLink.jsx";
import { useReducedMotion } from "framer-motion";
import { motion, EASE } from "../../lib/motion.js";
import { usePageMeta } from "../../lib/seo.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import { getPosts } from "./catalog.js";
import { postDate } from "./feed.js";
import PostCover from "./PostCover.jsx";
import "@fontsource/lora/latin-500.css";
import "../about/AboutPage.css";
import "./EditorialPage.css";

const customBodies = import.meta.glob("./posts/*/*.jsx");

export default function EditorialPage({kind,prerenderBody}) {
  const {slug} = useParams();
  const [category,setCategory] = useState("All");
  const still = useReducedMotion();
  const posts = getPosts(kind);
  const CustomBody = useMemo(() => {
    if (prerenderBody) return prerenderBody;
    const load = customBodies[`./posts/${kind}/${slug}.jsx`];
    return load ? lazy(load) : null;
  },[kind,slug,prerenderBody]);
  const title = kind === "news" ? "News" : "Blog";
  const description = kind === "news" ? "Company and product announcements from XiteAI." : "Engineering, design and ideas from the people building XiteAI.";
  const post = slug ? posts.find(p => p.id === slug) : null;
  usePageMeta({title:`${post ? post.title + (post.status === "preview" ? " — Preview" : "") : title} · XiteAI`,description:post?.summary || description,path:`/${kind}${slug ? `/${slug}` : ""}`,image:post?.image,noindex:Boolean(slug && (!post || post.status !== "published")),article:post});
  useEffect(() => { window.scrollTo(0,0); setCategory("All"); },[kind,slug]);
  const visible = category === "All" ? posts : posts.filter(p => p.category === category);
  const arrival = {initial:still ? false : {opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.7,ease:EASE}};
  return <div className={`site ab-page ed-page ed-${kind}`}>
    <SiteNav />
    <main className="site-top">
      {slug && !post ? <section className="ed-header ab-frame"><p className="ab-label">{title}</p><h1>Article not found.</h1><Link to={`/${kind}`} className="ab-text-link">Back to {title}<span aria-hidden="true">↗</span></Link></section> : post ? <article>
        <motion.header className="ed-article-head ab-frame" {...arrival} key={`${kind}/${slug}`}><Link className="ed-back" to={`/${kind}`}>← {title}</Link><p className="ab-label">{title} / {post.category}</p><h1>{post.title}</h1><p className="ed-standfirst">{post.summary}</p><div className="ed-byline"><span>XiteAI</span><time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time>{post.status === "preview" && <span>Editorial preview · Sample content and date</span>}</div></motion.header>
        <div className="ed-article-photo ab-frame"><PostCover post={post} loading="eager" sizes="(max-width:760px) calc(100vw - 48px), (max-width:1496px) calc(100vw - 56px), 1440px" />{post.imageCredit && <p className="ed-photo-credit">{post.status === "preview" && "Illustrative photograph · "}Photo: <a href={post.imageCredit.url} target="_blank" rel="noopener noreferrer">{post.imageCredit.name} / Unsplash</a></p>}</div>
        {CustomBody ? <Suspense fallback={<div className="ab-frame ed-custom-loading" role="status">Loading article…</div>}><CustomBody post={post} kind={kind} /></Suspense> : <div className="ed-article-body ab-frame"><aside><p className="ab-label">{title}</p><p>{post.category}</p>{post.status === "preview" && <p className="ed-preview">This article and its date are a design preview.</p>}</aside><div>{post.paragraphs.map(p => <p key={p}>{p}</p>)}<Link className="ab-text-link" to={post.id === "building-the-team" || post.id === "work" ? "/careers" : "/"}>{post.id === "building-the-team" || post.id === "work" ? "Explore careers" : "Explore XOS1"}<span aria-hidden="true">↗</span></Link></div></div>}
        <div className="ed-article-end ab-frame"><Link className="ab-text-link" to={`/${kind}`}>All {kind}<span aria-hidden="true">↗</span></Link><Link className="ab-text-link" to="/about">About XiteAI<span aria-hidden="true">↗</span></Link></div>
      </article> : <>
        <motion.header className="ed-header ab-frame" {...arrival} key={kind}><p className="ab-label">XiteAI / {title}</p><div><h1>{title}</h1><p>{description}</p></div>{posts.some(p => p.status === "preview") && <p className="ed-preview">{posts.every(p => p.status === "preview") ? "Editorial previews. Sample content and dates for the page design." : "Entries marked Preview contain sample content and dates."}</p>}</motion.header>
        <section className="ed-archive ab-frame" aria-label={`${title} articles`}><div className="ed-filters" role="group" aria-label={`Filter ${title} by category`}>{["All",...new Set(posts.map(p => p.category))].map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}<span>{visible.length} {visible.length === 1 ? "article" : "articles"}</span></div><div className="ed-grid">{visible.map(p => <Link key={p.id} className="ab-story" to={`/${kind}/${p.id}`}><span className="ab-story-image"><PostCover post={p} /></span><span className="ab-story-category">{p.category} · <time dateTime={p.publishedAt}>{postDate(p.publishedAt)}</time>{p.status === "preview" ? " · Preview":""}</span><span className="ab-story-title">{p.title}<span aria-hidden="true">↗</span></span><span className="ab-story-description">{p.summary}</span><span className="ed-read">Read {kind === "news" ? "announcement" : "article"} <span aria-hidden="true">↗</span></span></Link>)}</div></section>
      </>}
    </main>
    <SiteFooter />
  </div>;
}
