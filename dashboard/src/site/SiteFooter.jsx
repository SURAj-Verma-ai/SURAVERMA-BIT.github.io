import { useEffect, useRef, useState } from "react";
import { Link } from "./CanonicalLink.jsx";
import SocialMark from "./SocialMark.jsx";
import { openPrivacyChoices } from "./privacyChoice.js";
import { office, published, site, socials } from "./content.js";
import "./site.css";
import "./SiteFooter.css";

/* The footer, one component on every public page. Four layers, top to bottom:
   the company's line and the two things most people came to do; the index of
   the site; who and where the company is; and the name itself, set across the
   full width, rising in when it is reached and catching the light under the
   pointer.

   Every link here goes to a route this app serves. Nothing points at a page
   that does not exist. */

const COLUMNS = [
  {
    title: "Product",
    links: [
      { to: "/", label: "XOS1" },
      { to: "/pricing", label: "Pricing" },
      { href: "https://xtec.xiteai.com/download", label: "Download" },
      { href: "https://xtec.xiteai.com/#help", label: "Help desk" },
      { to: "/faq", label: "FAQ" },
      { to: "/legal/privacy", label: "Where data goes" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About XiteAI" },
      { to: "/legal/company-policy", label: "Company policy" },
      { to: "/news", label: "News" },
      { to: "/blog", label: "Blog" },
      { to: "/careers", label: "Careers" },
      { to: "/press", label: "Press" },
      { to: "https://xtec.xiteai.com/community", label: "Community" },
      { to: "https://xtec.xiteai.com/contact", label: "Contact" },
    ],
  },
  {
    title: "Trust",
    links: [
      { to: "/legal/security", label: "Security" },
      { to: "https://xtec.xiteai.com/contact?to=security", label: "Report a vulnerability" },
      { to: "https://xtec.xiteai.com/contact?to=privacy", label: "Privacy requests" },
      { to: "/legal/data-deletion", label: "Data deletion" },
    ],
  },
];

const LEGAL = ["terms", "privacy", "cookie-policy", "refund-policy"];

function Item({ l }) {
  return l.to
    ? <Link to={l.to} className="ft-link">{l.label}</Link>
    : <a href={l.href} className="ft-link">{l.label}</a>;
}

export default function SiteFooter() {
  return (
    <footer className="ft">
      <div className="ft-in">
        <div className="ft-top">
          <p className="ft-line">Building the intelligence every computer will run on.</p>
          <div className="ft-go">
            <Link to="https://xtec.xiteai.com/contact" className="ft-pill">Contact XiteAI <span aria-hidden="true">→</span></Link>
            <a href="https://xtec.xiteai.com/download" className="ft-plain">Download XOS1</a>
          </div>
        </div>

        <div className="ft-cols">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="ft-head">{col.title}</p>
              <ul className="ft-list">
                {col.links.map((l) => <li key={l.label}><Item l={l} /></li>)}
              </ul>
            </nav>
          ))}
          <nav aria-label="Legal">
            <p className="ft-head">Legal</p>
            <ul className="ft-list">
              {published.filter((d) => LEGAL.includes(d.slug)).map((d) => (
                <li key={d.slug}><Link to={`/legal/${d.slug}`} className="ft-link">{d.title}</Link></li>
              ))}
              <li><Link to="/legal" className="ft-link">All policies</Link></li>
            </ul>
          </nav>
          <nav aria-label="Follow XiteAI" className="ft-follow">
            <p className="ft-head">Follow</p>
            <ul className="ft-list">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer me" className="ft-link ft-social">
                    <SocialMark social={s} size={16} />{s.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="ft-meta">
          <address>{office.lines.join(", ")}</address>
          <a href={`mailto:${site.contact.contact}`} className="ft-link">{site.contact.contact}</a>
        </div>

        <div className="ft-base">
          <span>© {new Date().getFullYear()} {site.company}. All rights reserved.</span>
          <span className="ft-base-links">
            <Link to="/legal/privacy" className="ft-link">Privacy</Link>
            <Link to="/legal/terms" className="ft-link">Terms</Link>
            <Link to="/legal/cookie-policy" className="ft-link">Cookies</Link>
            <button className="ft-link" onClick={openPrivacyChoices}>Privacy choices</button>
            <Link to="/sitemap" className="ft-link">Sitemap</Link>
          </span>
        </div>
      </div>

      <Wordmark />
    </footer>
  );
}

/* The name, across the full width, pressed blind into the footer's paper the
   way the envelope's mark is: no ink, only the edges of the impression. The
   light rakes across it from wherever the pointer is, as a lamp would across
   an embossed letterhead. It rises in the first time it is reached. */
function Wordmark() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => io.disconnect();

    // The light's direction, from the word's centre toward the pointer. The
    // impression's lit edge faces it; its shadowed edge faces away.
    const move = (e) => {
      if (e.movementX === 0 && e.movementY === 0) return;   // the page scrolled under a still cursor
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      el.style.setProperty("--lx", `${(-dx / len) * 2}px`);
      el.style.setProperty("--ly", `${(-dy / len) * 2}px`);
    };
    const leave = () => { el.style.removeProperty("--lx"); el.style.removeProperty("--ly"); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className={`ft-word${seen ? " is-seen" : ""}`} aria-hidden="true">
      <div className="ft-word-clip">
        <span className="ft-word-in">XiteAI</span>
      </div>
    </div>
  );
}
