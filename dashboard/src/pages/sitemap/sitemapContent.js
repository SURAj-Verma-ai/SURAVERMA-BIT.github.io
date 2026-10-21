import { desks, office, published, socials, site } from "../../site/content.js";
import { getPosts } from "../editorial/catalog.js";

const main = path => `${site.web}${path}`;
const terminal = path => `${site.terminal}${path}`;
const link = (to, label) => ({ to, label });

// Deployed to both sites: the visitor's directory spans the whole company.
export function sitemapGroups(roles = []) {
  return [
    { title: "XiteAI", links: [
      link(main("/"), "Main website home"), link(terminal("/"), "Terminal home"),
      ...[["about", "About XiteAI"], ["news", "News"], ["blog", "Blog"], ["careers", "Careers"], ["press", "Press"], ["faq", "FAQ"]].map(([path, label]) => link(main(`/${path}/`), label)),
    ] },
    { title: "XOS1", links: [link(main("/"), "Overview"), link(main("/pricing/"), "Pricing"),
      ...["premium", "ultra", "max"].map(id => link(main(`/pricing/${id}/`), `XOS1 ${id[0].toUpperCase() + id.slice(1)}`)),
      link(terminal("/download"), "Download"), link(terminal("/#help"), "Help desk and request tracking"),
    ] },
    { title: "Community", links: [link(terminal("/community"), "All conversations"),
      ...[["help", "Help and questions"], ["bugs", "Bug reports"], ["ideas", "Ideas and feedback"], ["reviews", "Reviews"]].map(([section, label]) => link(terminal(`/community?section=${section}`), label)),
      link(terminal("/community/signin"), "Community sign in"),
    ] },
    { title: "Careers and team", links: [link(main("/careers/"), "Working at XiteAI"), link(terminal("/careers/open-roles"), "Open roles"),
      link(terminal("/join"), "Immediate hire"), link(terminal("/login"), "Work account and applicant sign in"), link(terminal("/console"), "Team workspace"),
      ...roles.map(role => link(terminal(`/careers/${role.id}`), role.title)),
    ] },
    ...["news", "blog"].map(kind => ({ title: kind === "news" ? "News articles" : "Blog articles", links: getPosts(kind).map(post => link(main(`/${kind}/${post.id}/`), `${post.title}${post.status === "preview" ? " · Preview" : ""}`)) })),
    { title: "Trust", links: [link(main("/legal/security/"), "Security"), link(terminal("/contact?to=security"), "Report a vulnerability"), link(terminal("/contact?to=privacy"), "Privacy requests"), link(main("/legal/data-deletion/"), "Data deletion")] },
    { title: "Contact", links: [link(terminal("/contact"), "Contact XiteAI"), ...desks.map(desk => link(terminal(`/contact?to=${desk.id}`), desk.name)), { href: office.maps, label: "Headquarters on Maps", external: true }] },
    { title: "Legal", links: [link(main("/legal/"), "All policies"), ...published.map(doc => link(main(`/legal/${doc.slug}/`), doc.title))] },
    { title: "Elsewhere", links: [...socials.map(social => ({ href: social.href, label: social.name, external: true })), ...desks.filter(desk => desk.x).map(desk => ({ href: desk.x.href, label: `X ${desk.name}`, external: true }))] },
    { title: "Sitemaps", links: [link(main("/sitemap/"), "Main website sitemap"), link(terminal("/sitemap"), "Terminal sitemap"), link(main("/sitemap.xml"), "Main website XML sitemap"), link(terminal("/sitemap.xml"), "Terminal XML sitemap")] },
  ];
}
