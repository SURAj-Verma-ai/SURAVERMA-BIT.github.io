import { useEffect, useRef, useState } from "react";
import { Link } from "../../site/CanonicalLink.jsx";
import { useReducedMotion } from "framer-motion";
import { motion, rise, stagger, whenSeen } from "../../lib/motion.js";
import { usePageMeta } from "../../lib/seo.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import { press, site } from "../../site/content.js";
import "../shared/ContactFrame.css";
import "./Press.css";

/* Press. What a journalist needs, in the order they need it: who to ask, the
   company in a paragraph they can lift whole, the facts, and the files. The
   kit shows every file as itself before it is taken: each mark on the ground
   it was made for, the portraits at full height. */

const seen = { variants: stagger, initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-60px" } };

export default function PressPage() {
  usePageMeta({
    title: "Press · XiteAI",
    description: "Press resources for XiteAI: the company in brief, key facts, logos, product images and the press contact.",
    path: "/press",
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const still = useReducedMotion();

  return (
    <div className="site ct-page pr-page">
      <SiteNav />
      <main className="site-top">
        <motion.section className="ct-hero pr-hero" variants={stagger} initial={still ? false : "hidden"} animate="show">
          <motion.p variants={rise} className="ct-kicker">Press</motion.p>
          <motion.h1 variants={rise}>XiteAI, on the record.</motion.h1>
          <motion.p variants={rise} className="ct-lede">
            The company in brief, the facts, and assets cleared for publication. For interviews and inquiries, write to the Press desk.
          </motion.p>
          <motion.div variants={rise} className="ct-btns pr-ask">
            <Link className="ct-write" to="https://xtec.xiteai.com/contact?to=press">Write to Press <span aria-hidden="true">→</span></Link>
            <a className="ct-plain" href={`mailto:${site.contact.press}`}>{site.contact.press}</a>
          </motion.div>
        </motion.section>

        <section className="pr-sec" aria-labelledby="pr-about">
          <motion.h2 id="pr-about" {...whenSeen}>About XiteAI</motion.h2>
          <motion.div className="pr-about" {...whenSeen}>
            <p>{press.boilerplate}</p>
            <CopyText text={press.boilerplate} label="Copy paragraph" />
          </motion.div>
        </section>

        <section className="pr-sec" aria-labelledby="pr-facts">
          <motion.h2 id="pr-facts" {...whenSeen}>The facts</motion.h2>
          <motion.dl className="pr-facts" {...seen}>
            {press.facts.map(([k, v]) => (
              <motion.div key={k} variants={rise}><dt>{k}</dt><dd>{v}</dd></motion.div>
            ))}
          </motion.dl>
        </section>

        <section className="pr-kitsec" aria-labelledby="pr-kit">
          <motion.h2 id="pr-kit" {...whenSeen}>Press kit</motion.h2>
          <Logos />
          <Founder />
          <motion.p className="pr-use" {...whenSeen}>
            Use the marks as supplied, on a clear background. Do not alter their proportions, colours or orientation, or set them
            beside other marks. For anything else, write to <a href={`mailto:${site.contact.press}`}>{site.contact.press}</a>.
          </motion.p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CopyText({ text, label }) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
  };
  return (
    <button type="button" className={`ct-copy${done ? " is-done" : ""}`} onClick={copy}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" /></svg>
      <span>{done ? "Copied" : label}</span>
    </button>
  );
}

/* One part of the kit: its name, what is in it, and the whole set at once. */
function Head({ title, about, zip }) {
  return (
    <motion.div className="pr-head" {...whenSeen}>
      <div>
        <h3>{title}</h3>
        <p>{about}</p>
      </div>
      <a className="pr-all" href={zip} download>Download all <span aria-hidden="true">↓</span></a>
    </motion.div>
  );
}

/* Each mark on the ground it was made for, the way a brand page shows them. */
function Logos() {
  return (
    <div className="pr-part">
      <Head title="Logos" about="The XiteAI mark and icon, and the XOS1 icon and mark." zip={press.logos.zip} />
      <motion.ul className="pr-swatches" role="list" {...seen}>
        {press.logos.items.map((l) => (
          <motion.li key={l.src} variants={rise}>
            <a className={`pr-swatch is-${l.ground}${l.icon ? " is-icon" : ""}`} href={l.src} download>
              <img src={l.src} alt={`${l.name}, ${l.edition.toLowerCase()}`} loading="lazy" decoding="async" />
              <span className="pr-swatch-go">{l.format} <span aria-hidden="true">↓</span></span>
            </a>
            <p className="pr-label"><b>{l.name}</b><span>{l.edition}</span></p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

function Founder() {
  return (
    <div className="pr-part">
      <Head title="Founder" about="Suraj Verma, Founder and CEO of XiteAI." zip={press.founder.zip} />
      <motion.ul className="pr-portraits" role="list" {...seen}>
        {press.founder.photos.map((f, n) => (
          <motion.li key={f.file} variants={rise}>
            <a className="pr-portrait" href={f.file} download>
              <img src={f.preview} alt={`Suraj Verma, portrait ${n + 1}`} loading="lazy" decoding="async" />
            </a>
            <p className="pr-label"><b>Portrait {n + 1}</b><span>JPG, {f.size}</span></p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
