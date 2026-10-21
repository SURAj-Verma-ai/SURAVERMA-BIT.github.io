import { useRef } from "react";
import { useInView } from "framer-motion";
import { cx } from "../lib/cx.js";
import "./WallScene.css";

// The XiteAI Code for the careers page, in the palette of the interview
// illustration below it. The workarounds ranked, the first one taken; below,
// the direct path stopped at the wall, and the route taken over it to where it
// was going. Plays once, when first scrolled to.
export default function WallScene({ className }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-60px" });
  return (
    <svg ref={ref} className={cx("ws", seen && "is-seen", className)} viewBox="165 43 330 242" role="img"
      aria-label="A ranked list with its first option chosen. Below it, the direct path stops at a wall and a route goes over it to the flag.">
      <rect className="ws-ground" x="165" y="43" width="330" height="242" />

      {/* the workarounds, ranked; the first one taken */}
      <rect className="ws-y ws-pick" x="216" y="66" width="12" height="12" rx="2" />
      <path className="ws-k ws-pick" d="M219 72 l2.6 2.8 l4.4 -5.5" />
      <rect className="ws-box" x="216" y="88" width="12" height="12" rx="2" />
      <rect className="ws-box" x="216" y="110" width="12" height="12" rx="2" />
      <path className="ws-k2 ws-row ws-r1" pathLength="1" d="M240 72 H322" />
      <path className="ws-k ws-row ws-r2" pathLength="1" d="M240 94 H306" />
      <path className="ws-k ws-row ws-r3" pathLength="1" d="M240 116 H292" />
      <path className="ws-k ws-faint" d="M214 142 H446" />

      {/* the direct path, stopped at the wall */}
      <circle className="ws-box" cx="226" cy="258" r="4" />
      <path className="ws-k ws-start" pathLength="1" d="M230 258 H286" />
      <path className="ws-k2 ws-fail" d="M290.5 253.5 l9 9 m0 -9 l-9 9" />
      <rect className="ws-c" x="306" y="200" width="32" height="58" rx="2" />
      <path className="ws-seam" d="M306 219.3 H338 M306 238.7 H338 M322 200 V219.3 M314 219.3 V238.7 M330 219.3 V238.7 M322 238.7 V258" />

      {/* the route taken: over it, to where it was going */}
      <path className="ws-route" pathLength="1" d="M262 258 C270 150 380 150 388 258 H418" />
      <circle className="ws-g ws-fork" cx="262" cy="258" r="3.4" />
      <g className="ws-flag">
        <path className="ws-k" d="M418 258 V224" />
        <path className="ws-y ws-edge" d="M418 224 L438 231 L418 238 Z" />
      </g>
      <circle className="ws-c" cx="418" cy="258" r="3.4" />
    </svg>
  );
}
