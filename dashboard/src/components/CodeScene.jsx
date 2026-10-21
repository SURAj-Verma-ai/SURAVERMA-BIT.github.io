import { useRef } from "react";
import { useInView } from "framer-motion";
import { cx } from "../lib/cx.js";

// The XiteAI Code, drawn. The straight path runs into a wall, a ranked list of
// workarounds is written, and the route is engineered over the wall to where it
// was going. Plays once, the first time it is scrolled into view; the list
// keeps a slow float after.
//
// Shared by the Handbook and the careers page. Strokes come from the scene
// vocabulary in styles/art.css, so it takes each page's own palette. Lines that
// draw themselves carry pathLength="1"; the dashed ones must not, or their
// dash lengths would be read in that unit too.
export default function CodeScene({ className }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  return (
    <svg ref={ref} className={cx("qlart code-scene", seen && "is-seen", className)} viewBox="0 0 340 160" role="img"
      aria-label="A path stops at a wall, a ranked list of workarounds is written, and the route is engineered over the wall to its destination.">
      <path className="hair-2" d="M10 140.6 H330" />

      {/* the wall */}
      <rect className="paper" x="160" y="52" width="44" height="88" />
      <path className="hair" d="M160 74 H204 M160 96 H204 M160 118 H204 M182 52 V74 M171 74 V96 M193 74 V96 M182 96 V118 M171 118 V140 M193 118 V140" />

      {/* the merit list, ranked: the first workaround is the one in ink */}
      <g className="cs-list">
        <rect className="paper" x="40" y="30" width="78" height="58" rx="3" />
        <circle className="ink" cx="52" cy="47" r="2.4" />
        <circle className="dot" cx="52" cy="60" r="2.4" />
        <circle className="dot" cx="52" cy="73" r="2.4" />
        <path className="hair cs-row cs-r1" pathLength="1" d="M61 47 H104" />
        <path className="hair-2 cs-row cs-r2" pathLength="1" d="M61 60 H98" />
        <path className="hair-2 cs-row cs-r3" pathLength="1" d="M61 73 H92" />
      </g>
      <path className="dash" d="M79 88 C79 112 96 128 108 137" />

      {/* the direct path, and the mark where it would have hit */}
      <circle className="paper" cx="24" cy="140" r="3" />
      <path className="hair cs-go" pathLength="1" d="M27 140 H110" />
      <path className="hair-2" d="M146 128 L152 134 M152 128 L146 134" />

      {/* the route, engineered over the wall on its struts */}
      <path className="hair-2 cs-strut" d="M167.5 33 V52 M182 26 V52 M196.5 33 V52" />
      <path className="ink-l cs-route" pathLength="1" d="M110 140 C140 140 146 26 182 26 C218 26 224 140 254 140 H306" />

      {/* where it was going */}
      <path className="hair" d="M306 140 V106" />
      <path className="paper" d="M306 106 L328 113 L306 120 Z" />
      <circle className="ink cs-dot" cx="306" cy="140" r="3.2" />
    </svg>
  );
}
