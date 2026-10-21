import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Logo from "./Logo.jsx";
import { site } from "./content.js";
import "./site.css";

/* The nav, carried over from the product site (website1 components/chrome/Nav)
   so the two halves of xiteai.com are the same object. Two behaviours, and
   they are separate on purpose:

   MATERIALISE is progressive, not a switch. The chrome fades up across the
   first 120px of scroll via --nav-t (0→1), so the bar appears to condense out
   of the page rather than snapping on at a threshold. A binary toggle is the
   thing that reads as "a component with a scrolled state"; a ramp reads as a
   surface.

   RETREAT is directional. Scrolling down is reading, so the bar leaves;
   scrolling up is looking for something, so it returns immediately. It never
   leaves near the top, and never while keyboard focus is inside it.

   Aligned to the shared page frame in tokens.css. The content edges and the
   floating bar follow the same width and responsive gutters on every route. */

/** How far you scroll before the chrome is fully present. */
const RAMP_PX = 120;
/** Half the first screen. The bar never retreats while you are still reading
 *  the opening — a flat threshold pulls it away mid-sentence on a tall hero. */
const keepPx = () => (typeof window === "undefined" ? 110 : window.innerHeight / 2);
/** Ignore jitter smaller than this so a trackpad twitch cannot flip it. */
const DIR_PX = 6;

/* The one list. Every public page renders this same nav with no options, so a
   link added here appears everywhere at once and no page can drift. */
const LINKS = [
  { to: "/", label: "XOS1" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/legal", label: "Legal" },
];

export default function SiteNav() {
  const links = LINKS;
  const ref = useRef(null);
  const lastY = useRef(0);
  const keep = useRef(220);
  const pinned = useRef(false); // keyboard focus is inside — never retreat
  const lastT = useRef("");
  const [away, setAwayState] = useState(false);
  // Only ask React to re-render when the answer changes, not on every frame.
  const awayNow = useRef(false);
  const setAway = (v) => { if (awayNow.current !== v) { awayNow.current = v; setAwayState(v); } };
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    // Re-measured on resize: a phone rotating, or desktop chrome appearing,
    // changes what "the first screen" means.
    const measure = () => { keep.current = keepPx(); };
    measure();

    const read = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);

      // Progressive presence. Written straight to a custom property rather
      // than through React state: this changes on every frame of every
      // scroll, and re-rendering a component that often to move one number is
      // how a smooth page becomes a janky one.
      // Only while it is changing: past the ramp the bar is finished, and
      // rewriting the same value every frame would restyle it for nothing.
      const t = Math.min(y / RAMP_PX, 1).toFixed(3);
      if (t !== lastT.current) { el.style.setProperty("--nav-t", t); lastT.current = t; }

      const dy = y - lastY.current;
      if (Math.abs(dy) > DIR_PX) {
        const down = dy > 0;
        setAway(!reduced && !pinned.current && down && y > keep.current);
        lastY.current = y;
      }
      if (y <= keep.current) setAway(false);

    };

    // One read per frame. The listener itself must stay trivial.
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      data-away={away ? "" : undefined}
      onFocusCapture={() => { pinned.current = true; setAway(false); }}
      onBlurCapture={() => { pinned.current = false; }}
      className="nav-shell"
    >
      <nav className="nav-bar">
        <Link to="/" className="nav-brand">
          <Logo variant="xiteai" size={18} className="nav-mark" />
          XiteAI
        </Link>

        <span className="nav-rule" />

        {links.map((l) => (l.href
          ? <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
          : <Link key={l.label} to={l.to} className="nav-link">{l.label}</Link>))}

        <span className="nav-spacer" />
        <div className="nav-auth"><a href="https://xtec.xiteai.com/download" className="nav-login">Download</a></div>
        <button type="button" className="nav-menu" aria-label="Open navigation" aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}>
          <Icon name={menuOpen ? "x" : "menu"} size={18} />
        </button>
        {menuOpen && (
          <div className="nav-mobile-menu">
            {links.map((l) => (l.href
              ? <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
              : <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)}>{l.label}</Link>))}
          </div>
        )}
      </nav>
    </header>
  );
}
