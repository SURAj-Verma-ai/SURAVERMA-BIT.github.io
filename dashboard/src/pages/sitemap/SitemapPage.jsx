import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion, rise, stagger } from "../../lib/motion.js";
import { usePageMeta } from "../../lib/seo.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import { site } from "../../site/content.js";
import { sitemapGroups } from "./sitemapContent.js";
import "../shared/ContactFrame.css";
import "./Sitemap.css";

export default function SitemapPage() {
  usePageMeta({title:"Sitemap · XiteAI",description:"Every public page across XiteAI and Terminal: XOS1, the company, policies, community, careers and contact desks.",path:"/sitemap"});
  const still = useReducedMotion();
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const mainHost = window.location.hostname === "xiteai.com" || window.location.hostname === "www.xiteai.com";
    fetch(`${mainHost ? site.terminal : ""}/api/careers/board`, {credentials:"omit",signal:controller.signal})
      .then(response => { if (!response.ok) throw new Error("Board unavailable"); return response.json(); })
      .then(board => { if (!controller.signal.aborted) setRoles((board.departments || []).flatMap(department => (department.roles || []).filter(role => !role.is_demo))); })
      .catch(() => { /* The permanent Open roles link remains usable. */ })
      .finally(() => clearTimeout(timeout));
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);
  return <div className="site ct-page sm-page"><SiteNav /><main className="site-top">
    <motion.section className="ct-hero sm-hero" variants={stagger} initial={still ? false : "hidden"} animate="show">
      <motion.p className="ct-kicker" variants={rise}>Sitemap</motion.p>
      <motion.h1 variants={rise}>Everything, in one place.</motion.h1>
      <motion.p className="ct-lede" variants={rise}>Every public page across XiteAI and Terminal, from XOS1 and company policies to community, careers and contact desks.</motion.p>
    </motion.section>
    <motion.div className="sm-index" variants={stagger} initial={still ? false : "hidden"} animate="show">
      {sitemapGroups(roles).map(group => <motion.section key={group.title} className="sm-group" variants={rise} aria-label={group.title}>
        <h2>{group.title}</h2><ul>{group.links.map(link => <li key={link.label+(link.to || link.href)}>
          <a className="sm-link" href={link.to || link.href} {...(link.external ? {target:"_blank",rel:"noopener noreferrer"} : {})}>{link.label}<span className="sm-arrow" aria-hidden="true">{link.external ? "↗" : "→"}</span></a>
        </li>)}</ul>
      </motion.section>)}
    </motion.div>
  </main><SiteFooter /></div>;
}
