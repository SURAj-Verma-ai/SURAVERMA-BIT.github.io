import { useParams } from "react-router-dom";
import { Link } from "../CanonicalLink.jsx";
import LegalLayout from "./LegalLayout.jsx";
import { Clause, DocTable } from "./prose.jsx";
import { policies } from "./policies.js";
import { site, published } from "../content.js";
import { openPrivacyChoices } from "../privacyChoice.js";

export default function PolicyPage({ slug: providedSlug } = {}) {
  const params = useParams();
  const slug = providedSlug || params.slug;
  const policy = policies[slug];
  const live = published.some((doc) => doc.slug === slug);
  if (!policy || !live) return (
    <LegalLayout slug={slug} rail={[]}>
      <p>This policy has not been published. Contact us if you need information about it.</p>
      <p><Link to="/legal">Back to legal</Link></p>
    </LegalLayout>
  );
  const rail = [{ title: "On this page", items: policy.sections.map((section) => ({ href: `#${section.id}`, label: section.title })) }];
  return (
    <LegalLayout slug={slug} rail={rail} contact={site.contact[policy.contact]}>
      {policy.sections.map((section, i) => (
        <Clause key={section.id} n={i + 1} id={section.id} title={section.title}>
          {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {slug === "cookie-policy" && section.id === "controls" && <p><button className="policy-privacy-button" onClick={openPrivacyChoices}>Open privacy choices</button></p>}
          {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
          {section.table && <DocTable head={section.table.head} rows={section.table.rows} />}
          {section.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.links && <p className="policy-links">{section.links.map((link) => link.to.includes("#")
            ? <a key={link.to} href={link.to}>{link.label}</a>
            : <Link key={link.to} to={link.to}>{link.label}</Link>)}</p>}
        </Clause>
      ))}
    </LegalLayout>
  );
}
