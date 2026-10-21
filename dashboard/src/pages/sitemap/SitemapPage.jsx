import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { motion, rise, stagger } from "../../lib/motion.js";
import { usePageMeta } from "../../lib/seo.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import { published, socials } from "../../site/content.js";
import { getPosts } from "../editorial/catalog.js";
import "../shared/ContactFrame.css";
import "./Sitemap.css";

export default function SitemapPage() {
  usePageMeta({title:"Sitemap · XiteAI",description:"Explore XOS1, pricing, XiteAI, news, blog articles and every published policy.",path:"/sitemap"});
  useEffect(() => { window.scrollTo(0,0); },[]);
  const still = useReducedMotion();
  const groups = [
    {title:"XiteAI",links:[{to:"/about",label:"About XiteAI"},{to:"/news",label:"News"},{to:"/blog",label:"Blog"},{to:"/careers",label:"Careers"},{to:"/press",label:"Press"},{to:"/faq",label:"FAQ"}]},
    {title:"XOS1",links:[{to:"/",label:"Home · XOS1"},{to:"/pricing",label:"Pricing"},...["premium","ultra","max"].map(id => ({to:`/pricing/${id}`,label:`XOS1 ${id[0].toUpperCase()+id.slice(1)}`}))]},
    ...["news","blog"].map(kind => ({title:kind === "news" ? "News articles" : "Blog articles",links:getPosts(kind).map(post => ({to:`/${kind}/${post.id}`,label:`${post.title}${post.status === "preview" ? " · Preview" : ""}`}))})),
    {title:"Legal",links:[{to:"/legal",label:"All policies"},...published.map(doc => ({to:`/legal/${doc.slug}`,label:doc.title}))]},
    {title:"Elsewhere",links:socials.map(social => ({href:social.href,label:social.name}))},
  ];
  return <div className="site ct-page sm-page"><SiteNav /><main className="site-top">
    <motion.section className="ct-hero sm-hero" variants={stagger} initial={still ? false : "hidden"} animate="show">
      <motion.p className="ct-kicker" variants={rise}>Sitemap</motion.p>
      <motion.h1 variants={rise}>Everything, in one place.</motion.h1>
      <motion.p className="ct-lede" variants={rise}>Every page on XiteAI, from the company and XOS1 to every published policy.</motion.p>
    </motion.section>
    <motion.div className="sm-index" variants={stagger} initial={still ? false : "hidden"} animate="show">
      {groups.map(group => <motion.section key={group.title} className="sm-group" variants={rise} aria-label={group.title}>
        <h2>{group.title}</h2><ul>{group.links.map(link => <li key={link.to || link.href}>{link.to
          ? <Link className="sm-link" to={link.to}>{link.label}<span className="sm-arrow" aria-hidden="true">→</span></Link>
          : <a className="sm-link" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<span className="sm-arrow" aria-hidden="true">↗</span></a>
        }</li>)}</ul>
      </motion.section>)}
    </motion.div>
  </main><SiteFooter /></div>;
}
