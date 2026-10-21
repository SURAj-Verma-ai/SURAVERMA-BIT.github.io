import { Suspense, lazy, useEffect } from "react";
import { cx } from "../../lib/cx.js";
import { usePageMeta } from "../../lib/seo.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import { Night } from "./Night.jsx";
import Keys from "./welcome/Keys.jsx";
import Apps from "./sections/Apps.jsx";
import Journey from "./sections/Journey.jsx";
import Everything from "./sections/Everything.jsx";
import "./XosPage.css";
import MemoryExperience from "./memory/MemoryExperience.jsx";

/* XOS1. A welcome to a new world of human interaction, which arrives at the
   line: Say it. It's done. Then how computers have been used until now (an app
   for everything); Lumen, where one sentence moves every app it needs; everything else it
   does, one sentence away; then the night, where its memory lives. */

// The ad scenes, for recording: ?ad=city or ?ad=spatial. Not linked anywhere.
const ADS = { city: lazy(() => import("./ads/City.jsx")), spatial: lazy(() => import("./ads/Spatial.jsx")) };

export default function XosPage() {
  usePageMeta({
    title: "XOS1 · XiteAI",
    description: "Say it. It's done. An AI that lives on your PC: you say what you need, and it happens.",
    path: "/",
  });
  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (anchor === "memory" || anchor === "xos1-finale" || anchor === "presence") {
      const frame = requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "instant" }));
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const search = typeof window === "undefined" ? "" : window.location.search;
  const memory = new URLSearchParams(search).get("memory");
  const memoryPreview = memory !== null;
  const adName = new URLSearchParams(search).get("ad");
  const Opening = ADS[adName] || Keys;
  return (
    <div className={cx("site pub xp", adName === "city" && "xp-dark-top")}>
      <SiteNav />
      <main>
        {memoryPreview ? <MemoryExperience preview /> : <>
        <Suspense fallback={<div style={{ height: "100svh" }} />}><Opening /></Suspense>
        {!adName && (
          <>
            <Apps />
            <Journey />
            <Everything />
            <MemoryExperience />
          </>
        )}
        <Night />
        </>}
      </main>
      <SiteFooter />
    </div>
  );
}
