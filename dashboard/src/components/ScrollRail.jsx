import { useEffect, useRef } from "react";
import "./ScrollRail.css";

// The page's scrollbar, drawn by us. The browser's own is hidden everywhere
// (base.css); this takes its place: a slim thumb that appears while the page
// moves, or when the pointer comes to the right edge, and fades once it rests.
// A page that barely scrolls gets nothing at all. It can still be dragged.
//
// A scroll frame here does the least it can: read scrollY, move the thumb by
// transform. The page's size is measured only when the page changes size
// (ResizeObserver) or locks (a dialog setting body overflow), never per frame:
// reading layout on every frame of a scroll is what makes a page stutter.
//
// Deliberately NOT done: switching hover off while scrolling (the old
// pointer-events trick). Flipping it restyles the whole page at the start and
// end of every gesture, which measured far worse than the hovers it saves.

const EDGE = 6;          // gap above and below the thumb's travel
const MIN_THUMB = 40;    // never shorter than this, however long the page
const IDLE_MS = 1100;    // how long it lingers after the page stops
const SHORT = 0.25;      // scrolls less than a quarter of a screen: no rail

export default function ScrollRail() {
  const railRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    const doc = document.documentElement;
    let frame = 0;
    let idle = 0;
    let drag = null;
    let geo = { track: 0, size: 0, range: 0, off: true };

    const rest = () => {
      clearTimeout(idle);
      idle = setTimeout(() => { if (!drag && !rail.matches(":hover")) delete rail.dataset.live; }, IDLE_MS);
    };
    // Only touch an attribute when it actually changes: rewriting it on every
    // scroll event would restyle for nothing.
    const wake = () => { if (!("live" in rail.dataset)) rail.dataset.live = ""; rest(); };

    const place = () => {
      frame = 0;
      if (geo.off) return;
      thumb.style.transform = `translateY(${(Math.min(window.scrollY, geo.range) / geo.range) * (geo.track - geo.size)}px)`;
    };
    const measure = () => {
      const vh = window.innerHeight;
      const total = doc.scrollHeight;
      const range = total - vh;
      const locked = document.body.style.overflow === "hidden" || getComputedStyle(document.body).overflow === "hidden";
      const off = locked || range < vh * SHORT;
      if (rail.hidden !== off) rail.hidden = off;
      const track = vh - EDGE * 2;
      const size = Math.max(MIN_THUMB, (track * vh) / total);
      geo = { track, size, range, off };
      if (!off) thumb.style.height = `${size}px`;
      place();
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(place); };
    const onScroll = () => {
      queue();
      wake();
    };

    const down = (e) => {
      e.preventDefault();
      drag = { y: e.clientY, top: window.scrollY };
      thumb.setPointerCapture(e.pointerId);
      rail.dataset.drag = "";
      wake();
    };
    const move = (e) => {
      if (!drag) return;
      const { track, size, range } = geo;
      window.scrollTo({ top: drag.top + ((e.clientY - drag.y) * range) / (track - size), behavior: "instant" });
    };
    const up = () => { drag = null; delete rail.dataset.drag; rest(); };

    const sizes = new ResizeObserver(measure);
    sizes.observe(document.body);
    const locks = new MutationObserver(measure);
    locks.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    rail.addEventListener("pointerenter", wake);
    rail.addEventListener("pointerleave", rest);
    thumb.addEventListener("pointerdown", down);
    thumb.addEventListener("pointermove", move);
    thumb.addEventListener("pointerup", up);
    thumb.addEventListener("pointercancel", up);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      sizes.disconnect();
      locks.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={railRef} className="srail" aria-hidden="true">
      <div ref={thumbRef} className="srail-thumb" />
    </div>
  );
}
