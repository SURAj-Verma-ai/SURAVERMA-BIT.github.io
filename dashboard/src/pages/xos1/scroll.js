import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

/* Scroll-driven scenes for the XOS1 page. A scene is a tall section with a
   sticky stage inside it; how far you've scrolled through the section is its
   progress, 0 to 1. The browser's own scrolling is never taken over. */

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0 → 1 as the section scrolls past, pinned stage from top to bottom. */
export function useScene(ref, offset = ["start start", "end end"]) {
  return useScroll({ target: ref, offset }).scrollYProgress;
}

/** Map progress to a discrete step (a character count, a stage number) and
 *  re-render only when the step changes. With reduced motion, the last step. */
export function useStep(progress, fn) {
  const still = useReducedMotion();
  const [v, setV] = useState(() => fn(still ? 1 : progress.get()));
  const current = useRef(v);
  useMotionValueEvent(progress, "change", (x) => {
    const next = fn(still ? 1 : x);
    if (!Object.is(current.current, next)) { current.current = next; setV(next); }
  });
  return still ? fn(1) : v;
}

/** True while the element is on screen or within one screen of it. Heavy
 *  work (canvases, loops, decorative animation) runs only while this is
 *  true, so at any moment only the section you're in and its neighbours do
 *  anything at all. */
export function useNear(ref, margin = "100% 0px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let intersects = false;
    const update = () => setNear(intersects && !document.hidden);
    const io = new IntersectionObserver(([e]) => { intersects = e.isIntersecting; update(); }, { rootMargin: margin });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, [ref, margin]);
  return near;
}
