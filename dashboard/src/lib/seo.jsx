import { useEffect } from "react";

// Lightweight head management. Updates the document's meta tags so each
// public page carries its own title, description and Open Graph card —
// search engines and social-media previews see the right copy for every URL.
//
// We avoid a full helmet library: the server already sets the base meta in
// index.html, so only public pages that need distinct cards call this.
export function usePageMeta({ title, description, path, type }) {
  useEffect(() => {
    if (title) document.title = title;
    const tags = {
      "description": description,
      "og:title": title,
      "og:description": description,
      "og:type": type || "website",
      "og:url": path ? `https://xiteai.com${path}` : undefined,
      "twitter:title": title,
      "twitter:description": description,
    };
    const restored = [];
    Object.entries(tags).forEach(([key, value]) => {
      if (!value) return;
      const isOg = key.startsWith("og:");
      const attr = isOg ? "property" : "name";
      const el = document.querySelector(`meta[${attr}="${key}"]`);
      if (el) {
        restored.push([el, attr, el.getAttribute("content")]);
        el.setAttribute("content", value);
      }
    });
    const canonical = path && document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute("href");
    if (canonical) canonical.setAttribute("href",`https://xiteai.com${path}`);
    return () => {
      restored.forEach(([el, , prev]) => el.setAttribute("content", prev));
      if (canonical && previousCanonical !== null) canonical.setAttribute("href",previousCanonical);
    };
  }, [title, description, path, type]);
}

// Structured data for Google Jobs and rich results.
export function JsonLd({ data, id }) {
  useEffect(() => {
    const script = (id && document.getElementById(id)) || document.createElement("script");
    if (id) script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => script.remove();
  }, [data, id]);
  return null;
}
