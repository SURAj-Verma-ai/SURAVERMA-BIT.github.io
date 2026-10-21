import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { getLatestPosts } from "./catalog.js";
import { postDate } from "./feed.js";
import PostCover from "./PostCover.jsx";

export default function EditorialCarousel({kind,title,description}) {
  const posts = getLatestPosts(kind,4);
  const track = useRef(null);
  const still = useReducedMotion();
  const [edges,setEdges] = useState({first:true,last:true});
  const measure = () => {
    const el = track.current;
    if (!el) return;
    const next = {first:el.scrollLeft <= 2,last:el.scrollLeft + el.clientWidth >= el.scrollWidth - 2};
    setEdges(prev => prev.first === next.first && prev.last === next.last ? prev : next);
  };
  useEffect(() => {
    const resize = new ResizeObserver(measure);
    resize.observe(track.current); measure();
    return () => resize.disconnect();
  },[kind]);
  const move = direction => {
    const el = track.current;
    const first = el.firstElementChild;
    if (!first) return;
    el.scrollBy({left:direction*(first.getBoundingClientRect().width+24),behavior:still ? "auto":"smooth"});
  };
  return <section className="ab-news ab-carousel ab-frame ab-section" aria-labelledby={`ab-${kind}-title`}>
    <div className="ab-news-head"><div><h2 id={`ab-${kind}-title`}>Latest {title.toLowerCase()}</h2><p className="ab-editorial-description">{description}</p></div><Link className="ab-text-link" to={`/${kind}`}>All {kind}<span aria-hidden="true">↗</span></Link></div>
    <div ref={track} className="ab-carousel-track" role="region" aria-label={`Latest ${title.toLowerCase()} posts`} tabIndex={0} onScroll={measure}>
      {posts.map(p => <Link key={p.id} className="ab-story ab-carousel-card" to={`/${kind}/${p.id}`}><span className="ab-story-image"><PostCover post={p} sizes="(max-width:760px) min(78vw,320px), (max-width:1050px) 30vw, 342px" /></span><span className="ab-story-category">{p.category} · <time dateTime={p.publishedAt}>{postDate(p.publishedAt)}</time>{p.status === "preview" ? " · Preview":""}</span><span className="ab-story-title">{p.title}<span aria-hidden="true">↗</span></span></Link>)}
    </div>
    {(!edges.first || !edges.last) && <div className="ab-carousel-controls" aria-label={`${title} carousel controls`}><button onClick={() => move(-1)} disabled={edges.first} aria-label={`Previous ${kind} posts`}>←</button><button onClick={() => move(1)} disabled={edges.last} aria-label={`Next ${kind} posts`}>→</button></div>}
  </section>;
}
