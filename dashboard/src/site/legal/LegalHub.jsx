import { Link } from "../CanonicalLink.jsx";
import { motion } from "../../lib/motion.js";
import SiteNav from "../SiteNav.jsx";
import SiteFooter from "../SiteFooter.jsx";
import { site, legalGroups, docsInGroup, published } from "../content.js";
import { usePageMeta } from "../../lib/seo.jsx";

/* The legal index, carried over from the product site (website1
   app/legal/page.tsx).

   Reads as a contents page, not a dashboard. Groups are the structural
   device because they encode something true — the five buckets are genuinely
   different kinds of promise — and the row is the unit, because a row is what
   an index is made of. No cards: nineteen cards is a grid to scan, nineteen
   rows is a document to read.

   Unwritten policies are listed and not linked. Hiding them would be tidier
   and would also mean the page quietly lies about how much of this is
   finished. */

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function LegalHub() {
  usePageMeta({title:`Legal · ${site.company}`,description:"Company working principles, terms, privacy and service policies for XOS1 and the XiteAI Terminal.",path:"/legal"});

  return (
    <div className="site">
      <SiteNav />
      <main className="site-wrap site-top">
        <header className="lh-head">
          <p className="lh-eyebrow">{site.company}</p>
          <h1>Legal</h1>
          <p className="lh-lede">
            Company working principles, terms, privacy and service policies for XOS1 and the XiteAI Terminal.
          </p>
        </header>

        {/* Start here. Two published documents should not be hunted for in a
            list of nineteen, and these are the two anyone actually came for. */}
        <motion.section className="lh-start" variants={rise} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: "-60px" }}>
          {published.filter((d) => ["terms", "privacy"].includes(d.slug)).map((d) => (
            <Link key={d.slug} to={`/legal/${d.slug}`}>
              <p className="lh-kicker">Start here</p>
              <p className="lh-start-title">{d.title}</p>
              <p className="lh-start-sum">{d.summary}</p>
              {d.updated && <p className="lh-start-date">Updated {d.updated}</p>}
            </Link>
          ))}
        </motion.section>

        <div className="lh-index">
          {legalGroups.map((group, gi) => {
            const docs = docsInGroup(group);
            if (!docs.length) return null;
            return (
              <motion.section key={group} className="lh-group" variants={rise}
                initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: gi * 0.04 }}>
                <h2>{group}</h2>
                <ul className="lh-rows">
                  {docs.map((doc) => {
                    const live = published.some((d) => d.slug === doc.slug);
                    const row = (
                      <>
                        <span className="lh-row-head">
                          <span className="lh-row-title">{doc.title}</span>
                          {!live && (
                            <span className="lh-row-state">
                              Not yet published
                            </span>
                          )}
                        </span>
                        <span className="lh-row-sum">{doc.summary}</span>
                      </>
                    );
                    return (
                      <li key={doc.slug}>
                        {live ? (
                          <Link to={`/legal/${doc.slug}`} className="lh-row">
                            <span style={{ minWidth: 0 }}>{row}</span>
                            <span aria-hidden="true" className="lh-arrow">→</span>
                          </Link>
                        ) : (
                          <div className="lh-row lh-row-pending">
                            <span style={{ minWidth: 0 }}>{row}</span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            );
          })}
        </div>

        <div className="lh-ask">
          <p>Questions about any of this, or something that reads as wrong? These
            pages are meant to be understood, so that is worth telling us.</p>
          <a href={`mailto:${site.contact.legal}`}>{site.contact.legal}</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
