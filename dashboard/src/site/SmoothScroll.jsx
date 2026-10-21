import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import { scrollMotion } from "./scrollMotion.js";
import { createSceneTouch } from "./touchSceneScroll.js";
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
    let l = null;
    let frame = 0;
    let userMotion = null, motionElapsed = 0;
    let sceneTouch = null;
    const advanceScroll = (time) => {
      frame = 0;
      // Track the same elapsed time Lenis uses, so a new wheel event can pick
      // up the curve's exact velocity without estimating it from rounded pixels.
      const now = Math.max(time, l?.time || 0);
      if (userMotion && l?.isScrolling === "smooth") motionElapsed += (now - l.time) / 1000;
      l?.raf(now);
      if (l?.isScrolling === "smooth") frame = requestAnimationFrame(advanceScroll);
      else userMotion = null;
    };
    const setup = () => {
      cancelAnimationFrame(frame); frame = 0;
      userMotion = null; motionElapsed = 0;
      l?.destroy(); l = null; lenis.current = null; active = null;
      if (reduced.matches) return;
      sceneTouch = createSceneTouch({
        position: () => l.actualScroll,
        height: () => window.innerHeight,
        limit: () => l.limit,
        scrollTo: (target, options) => l.scrollTo(target, options),
        eligible: target => {
          if (!(target instanceof Element) || !window.matchMedia("(pointer: coarse)").matches) return false;
          if (target.closest("a,button,input,textarea,select,summary,[contenteditable],[role='slider'],[data-lenis-prevent]")) return false;
          if (window.getSelection()?.isCollapsed === false) return false;
          const scene = target.closest(".xp .wl-scene,.xp .ap,.xp .jy,.xp .im-sequence,.xp .mu,.xp .nt-yours");
          if (!scene || scene.getBoundingClientRect().height <= window.innerHeight * 1.2) return false;
          for (let el = target; el && el !== scene; el = el.parentElement) {
            if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1) return false;
          }
          return true;
        },
      });
      l = new Lenis({
        duration: .65,
        smoothWheel: true,
        // Normal pages retain native touch. The story handler keeps dragging
        // direct and only shortens the post-release glide in pinned scenes.
        syncTouch: false,
        virtualScroll: data => sceneTouch.handle(data),
        allowNestedScroll: true,
        anchors: true,
        autoRaf: false,
      });
      // Retain Lenis' nested scrolling, touch handling and anchor focus. Only
      // change the duration and destination of user-driven page movement.
      const scrollTo = l.scrollTo.bind(l);
      l.scrollTo = (target, options = {}) => {
        // Prime the clock before starting a new glide after idle. Only an
        // active glide needs frames; a resting page does no scroll-loop work.
        if (!frame) l.raf(performance.now());
        if (typeof target === "number" && !options.immediate && options.programmatic === false) {
          const velocity = userMotion && l.isScrolling === "smooth" ? userMotion.velocityAt(motionElapsed / userMotion.duration) : 0;
          const motion = scrollMotion(l.animatedScroll, l.targetScroll, target, window.innerHeight, l.limit, velocity);
          // Lenis ignores an unchanged destination. Keep its current curve and
          // clock too, especially for repeated notches against a page boundary.
          if (motion.target !== l.targetScroll) {
            userMotion = motion; motionElapsed = 0;
            scrollTo(motion.target, { ...options, offset: 0, lerp: undefined, duration: motion.duration, easing: motion.easing });
          }
        } else { userMotion = null; motionElapsed = 0; scrollTo(target, options); }
        if (l.isScrolling !== "smooth") { cancelAnimationFrame(frame); frame = 0; }
        if (!frame && l.isScrolling === "smooth") frame = requestAnimationFrame(advanceScroll);
      };
      lenis.current = l; active = l;
    };
    const stopGlide = () => {
      sceneTouch?.cancel();
      if (l?.isScrolling !== "smooth") return;
      l.stop(); l.start();
      cancelAnimationFrame(frame); frame = 0;
      userMotion = null; motionElapsed = 0;
    };
    const visibility = () => { if (document.hidden) stopGlide(); };
    const keyboard = (event) => {
      if (!l || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Home" || event.key === "End") { stopGlide(); return; }
      const el = event.target;
      if (el instanceof Element && el.closest("input,textarea,select,button,a,[contenteditable],[role='slider'],[role='tablist'],[data-lenis-prevent]")) return;
      const page = window.innerHeight * .8;
      const moves = { ArrowDown: 90, ArrowUp: -90, PageDown: page, PageUp: -page, " ": event.shiftKey ? -page : page };
      const delta = moves[event.key];
      if (delta === undefined) return; // Preserve deliberate Home/End navigation.
      for (const node of event.composedPath()) {
        if (node === document.documentElement || node === document.body) break;
        if (node instanceof HTMLElement && l.hasNestedScroll(node, { deltaX: 0, deltaY: delta })) return;
      }
      event.preventDefault();
      l.scrollTo(l.targetScroll + delta, { programmatic: false });
    };
    setup();
    reduced.addEventListener("change", setup);
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
      cancelAnimationFrame(frame); frame = 0;
      l?.destroy(); lenis.current = null; active = null;
    };
  }, [on]);

  useEffect(() => {
    if (!window.location.hash) lenis.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);
  return null;
}
