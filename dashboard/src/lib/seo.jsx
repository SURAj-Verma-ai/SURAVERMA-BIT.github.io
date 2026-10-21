import { useEffect } from "react";
import { canonicalUrl, resolvePageSeo, pageGraph, serializeSchema, SEO_ORIGIN } from "../site/pageSeo.js";

// Lightweight head management. Updates the document's meta tags so each
// public page carries its own title, description and Open Graph card —
// search engines and social-media previews see the right copy for every URL.
//
// We avoid a full helmet library: the server already sets the base meta in
// index.html, so only public pages that need distinct cards call this.
export function usePageMeta({ title, description, path, type, image, noindex = false, article }) {
  useEffect(() => {
    const meta = resolvePageSeo(path,{title,description,image,noindex,article});
    const url = canonicalUrl(meta.path);
    document.title = meta.title;
    const picture = meta.image.startsWith("/") ? SEO_ORIGIN+meta.image : meta.image;
    const tags = {
      description:meta.description,"og:title":meta.title,"og:description":meta.description,
      "og:type":article?.status === "published" ? "article" : type || "website",
      "og:url":url,"og:image":picture,"og:image:alt":meta.title,
      ...(!article ? {"og:image:width":"1200","og:image:height":"630"} : {}),
      "twitter:title":meta.title,"twitter:description":meta.description,
      "twitter:image":picture,"twitter:image:alt":meta.title,
      robots:`${meta.noindex ? "noindex" : "index"}, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`,
    };
    if (article) document.querySelectorAll('meta[property="og:image:width"],meta[property="og:image:height"]').forEach(el=>el.remove());
    Object.entries(tags).forEach(([key, value]) => {
      if (!value) return;
      const attr = key.startsWith("og:") ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {el=document.createElement("meta");el.setAttribute(attr,key);document.head.appendChild(el);}
      el.setAttribute("content",value);
    });
    let canonical = document.querySelector('link[rel="canonical"]');
    if (meta.path === "/404") canonical?.remove();
    else {
      if (!canonical) {canonical=document.createElement("link");canonical.rel="canonical";document.head.appendChild(canonical);}
      canonical.href=url;
    }
    const graph = pageGraph(meta);
    let schema = document.getElementById("site-schema");
    if (graph) {
      if (!schema) {schema=document.createElement("script");schema.id="site-schema";schema.type="application/ld+json";document.head.appendChild(schema);}
      schema.textContent=serializeSchema(graph);
    } else schema?.remove();
    return () => {
      document.getElementById("site-schema")?.remove();
    };
  }, [title, description, path, type, image, noindex, article]);
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
