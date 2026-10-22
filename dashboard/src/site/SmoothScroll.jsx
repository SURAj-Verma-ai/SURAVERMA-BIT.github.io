import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let active = null;
export function glideTo(y) {
  if (active) active.scrollTo(y, { duration: .9 });
  else window.scrollTo({ top: y, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

export default function SmoothScroll() {
  const { pathname } = useLocation();
  const lenis = useRef(null);
  const on = true;

  useEffect(() => {
    if (!on) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touch = window.matchMedia("(any-pointer: coarse)");
    let l = null;
    let frame = 0;
    const advanceScroll = (time) => {
      frame = 0;
      l?.raf(time);
      if (l?.isScrolling === "smooth") frame = requestAnimationFrame(advanceScroll);
    };
    const setup = () => {
      cancelAnimationFrame(frame); frame = 0;
      l?.destroy(); l = null; lenis.current = null; active = null;
      // Touch devices retain the browser's complete fling and pinch behaviour.
      // No JS touch listeners, release-distance cap or custom deceleration.
      if (reduced.matches || touch.matches) return;
      l = new Lenis({
        lerp: .1,
        smoothWheel: true,
        syncTouch: false,
        allowNestedScroll: true,
        anchors: true,
        autoRaf: false,
      });
      const scrollTo = l.scrollTo.bind(l);
      l.scrollTo = (target, options = {}) => {
        // Wake one clock for an active glide. Lenis handles interpolation;
        // incoming wheel distances are no longer shortened or speed limited.
        if (!frame) l.raf(performance.now());
        scrollTo(target, options);
        if (!frame && l.isScrolling === "smooth") frame = requestAnimationFrame(advanceScroll);
      };
      lenis.current = l; active = l;
    };
    const stopGlide = () => {
      if (l?.isScrolling !== "smooth") return;
      l.stop(); l.start();
      cancelAnimationFrame(frame); frame = 0;
    };
    const visibility = () => { if (document.hidden) stopGlide(); };
    const keyboard = (event) => {
      // Native keys retain focus, nested scrolling and their full page distance.
      if (!event.defaultPrevented && ["Home","End","ArrowDown","ArrowUp","PageDown","PageUp"," "].includes(event.key)) stopGlide();
    };
    setup();
    reduced.addEventListener("change", setup);
    touch.addEventListener("change", setup);
    window.addEventListener("keydown", keyboard);
    window.addEventListener("pointerdown", stopGlide, { passive: true });
    window.addEventListener("touchcancel", stopGlide, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", keyboard);
      window.removeEventListener("pointerdown", stopGlide);
      window.removeEventListener("touchcancel", stopGlide);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", setup);
      touch.removeEventListener("change", setup);
      cancelAnimationFrame(frame); frame = 0;
      l?.destroy(); lenis.current = null; active = null;
    };
  }, [on]);

  useEffect(() => {
    if (window.location.hash) return;
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
