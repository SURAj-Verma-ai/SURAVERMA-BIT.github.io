import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, useReducedMotion, useTransform } from "framer-motion";
import { EASE, motion } from "../../lib/motion.js";
import { cx } from "../../lib/cx.js";
import { clamp, useNear, useScene, useStep } from "./scroll.js";
import "./Night.css";
import Finale from "./Finale.jsx";

/* The day gives way to a memory universe and a quieter account of presence.
   After Pulse, the page returns from space to its original warm paper. */

// Seeded, so the sky is the same for everyone and every render.
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function stars(seed, count, size, alpha) {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    const a = (alpha[0] + r() * (alpha[1] - alpha[0])).toFixed(2);
    return `${(r() * 100).toFixed(2)}vw ${(r() * 200).toFixed(2)}svh 0 ${size} rgba(255,255,255,${a})`;
  }).join(",");
}

/* ── The memory universe ──────────────────────────────────────────────── */

const AREAS = ["People", "Habits", "Skills", "Relationships", "Films, books and music", "Your stories"];

// Points in six galaxies on a ring, plus a faint haze between them. Each has a
// depth, so the pull-back reads as space, not a flat zoom.
function buildUniverse() {
  const r = rng(91);
  const gauss = () => (r() + r() + r() + r() - 2) / 2;
  const pts = [];
  const centres = AREAS.map((_, i) => {
    const a = (i / AREAS.length) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(a) * 0.62, Math.sin(a) * 0.4];
  });
  centres.forEach(([cx0, cy0], g) => {
    for (let k = 0; k < 520; k++) {
      const ang = r() * Math.PI * 2, rad = Math.abs(gauss()) * 0.22;
      pts.push({ x: cx0 + Math.cos(ang) * rad * 1.3, y: cy0 + Math.sin(ang) * rad, z: 0.6 + r() * 0.8, g, s: 0.5 + r() * 1.3, tw: r() * 6.28 });
    }
  });
  for (let k = 0; k < 900; k++) pts.push({ x: gauss() * 1.4, y: gauss() * 0.9, z: 0.4 + r(), g: -1, s: 0.4 + r() * 0.7, tw: r() * 6.28 });
  // The one memory the scene starts on: in the Relationships galaxy.
  const focus = { x: centres[3][0] + 0.035, y: centres[3][1] - 0.02 };
  return { pts, centres, focus };
}

function MemoryUniverse() {
  const ref = useRef(null);
  const canvas = useRef(null);
  const p = useScene(ref);
  const uni = useMemo(buildUniverse, []);
  const phase = useStep(p, (x) => (x < 0.28 ? 0 : x < 0.62 ? 1 : 2));

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return undefined;
    const ctx = cv.getContext("2d");
    let raf = 0, w = 0, h = 0, dpr = 1, visible = true;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(cv);
    // The loop only runs while the canvas is on screen; off screen it stops entirely.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    }, { rootMargin: "100px" });
    io.observe(cv);
    const draw = (t) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(draw);
      const x = clamp(p.get());
      // Camera: from deep on one memory to the whole of it.
      const pull = clamp((x - 0.12) / 0.55);
      const e = 1 - Math.pow(1 - pull, 3);
      const zoom = 14 * Math.pow(1 / 14, e);
      const spin = t * 0.00002 + x * 0.35;
      // The memory we start on turns with its galaxy; the camera follows it in,
      // then lets go as it pulls back to the whole.
      const ca0 = Math.cos(spin), sa0 = Math.sin(spin);
      const ffx = uni.focus.x * ca0 - uni.focus.y * sa0 * 0.6, ffy = uni.focus.x * sa0 * 0.6 + uni.focus.y * ca0;
      const cx0 = ffx * (1 - e), cy0 = ffy * (1 - e);
      const S = Math.min(w, h * 1.6) * 0.55;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const q of uni.pts) {
        const ca = Math.cos(spin * q.z), sa = Math.sin(spin * q.z);
        const px = q.x * ca - q.y * sa * 0.6, py = q.x * sa * 0.6 + q.y * ca;
        const sx = w / 2 + (px - cx0) * S * zoom * q.z;
        const sy = h / 2 + (py - cy0) * S * zoom * q.z;
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
        const tw = 0.65 + 0.35 * Math.sin(t * 0.0015 + q.tw);
        const a = (q.g < 0 ? 0.25 : 0.75) * tw;
        const rad = q.s * Math.min(2.6, 0.7 + zoom * 0.08);
        ctx.fillStyle = q.g < 0 ? `rgba(255,255,255,${a})` : `rgba(255,${226 - q.g * 6},${190 - q.g * 10},${a})`;
        ctx.beginPath(); ctx.arc(sx, sy, rad, 0, 6.283); ctx.fill();
      }
      // The memory you started on: one crisp star with a thin ring, gone once
      // the camera has pulled back to the whole.
      const fa = 1 - clamp(e * 1.6);
      if (fa > 0) {
        const fx = w / 2 + (ffx - cx0) * S * zoom, fy = h / 2 + (ffy - cy0) * S * zoom;
        ctx.fillStyle = `rgba(255,244,228,${fa})`;
        ctx.beginPath(); ctx.arc(fx, fy, 3, 0, 6.283); ctx.fill();
        ctx.strokeStyle = `rgba(255,244,228,${fa * 0.45})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(fx, fy, 11, 0, 6.283); ctx.stroke();
      }
    };
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [p, uni]);

  return (
    <section ref={ref} className="mu">
      <div className="nt-stick mu-stick">
        <canvas ref={canvas} className="mu-canvas" aria-hidden="true" />
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="one" className="mu-one" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
              <span>8:02 AM · You said</span>
              <p>“Rohan lands at nine tonight.”</p>
            </motion.div>
          )}
          {phase === 1 && (
            <motion.p key="mid" className="mu-mid" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.9 } }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
              One moment, among all of them.
            </motion.p>
          )}
          {phase === 2 && (
            <motion.div key="all" className="mu-all" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 1, ease: EASE } }} exit={{ opacity: 0 }}>
              <h2>It remembers your life.</h2>
              <p>Every person, habit and story you mention, dated and kept, and found again the moment it matters.</p>
              <ul>{AREAS.map((a) => <li key={a}>{a}</li>)}</ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ── Tomorrow ─────────────────────────────────────────────────────────── */

function Lit({ text, on }) {
  return text.split(" ").map((w, i) => <span key={i} className={cx("nt-w", i < on && "is-lit")}>{w} </span>);
}

function Tomorrow() {
  const ref = useRef(null);
  const p = useScene(ref);
  const A = "Tomorrow, it knows you", B = "a little better.";
  const nA = A.split(" ").length, nB = B.split(" ").length;
  const lit = useStep(p, (x) => Math.round(clamp((x - 0.15) / 0.55) * (nA + nB)));
  const sub = useStep(p, (x) => x > 0.75);
  return (
    <section ref={ref} className="nt-tomorrow">
      <div className="nt-stick">
        <h2 className="nt-line">
          <span><Lit text={A} on={lit} /></span>
          <span className="nt-line-b"><Lit text={B} on={lit - nA} /></span>
        </h2>
        <p className={cx("nt-sub", sub && "is-on")}>It gets better with you.</p>
      </div>
    </section>
  );
}

/* ── Presence: recognition, screen context, and Pulse. ─────────────────── */

const PROMISES = [
  "It recognises you by voice and face.",
  "It understands what's on your screen.",
  "Pulse notices how you write, not just what you send.",
];

function Yours({ sectionRef, p, departure }) {
  const still = useReducedMotion();
  const exitOpacity = useTransform(departure, [0,.2], [1,0]);
  const at = useStep(p, (x) => Math.min(PROMISES.length - 1, Math.floor(clamp((x - 0.04) / 0.9) * PROMISES.length)));
  return (
    <section ref={sectionRef} className="nt-yours" id="presence">
      <motion.div className="nt-stick" style={still ? undefined : {opacity:exitOpacity}}>
        <div className="nt-promise-box">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={at} className="nt-promise"
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } }}
              exit={{ opacity: 0, y: -22, filter: "blur(10px)", transition: { duration: 0.4, ease: EASE } }}>
              {PROMISES[at]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="nt-ticks" aria-hidden="true">{PROMISES.map((_, i) => <i key={i} className={cx(i <= at && "is-on")} />)}</div>
      </motion.div>
    </section>
  );
}

export function Night() {
  const still = useReducedMotion();
  const wrap = useRef(null);
  const entry = useRef(null);
  const departureRef = useRef(null);
  const arrival = useScene(entry, ["start start", "end start"]);
  // Finish the full-screen colour return before the final section's top
  // enters the viewport, rather than waiting until it reaches the top.
  const departure = useScene(departureRef, ["start end", "end end"]);
  // One background for every section: the same curve runs forwards and back.
  const nightfall = useTransform([arrival, departure], ([enter, leave]) => enter * (1 - leave));
  const background = useTransform(nightfall, [0, .35, .85], ["#efeae1", "#514b43", "#030303"]);
  const yoursRef = useRef(null);
  const close = useNear(wrap, "0px");
  const all = useScene(wrap, ["start start", "end end"]);
  const yours = useScene(yoursRef);
  // Depth: the far stars barely move, the near ones travel.
  const far = useTransform(all, [0, 1], ["0svh", "-30svh"]);
  const mid = useTransform(all, [0, 1], ["0svh", "-70svh"]);
  const near = useTransform(all, [0, 1], ["0svh", "-130svh"]);
  // The sky empties after the last line, leaving only the product name.
  const sky = useTransform(yours, [0.72, 0.97], [1, 0.03]);
  const skyReveal = useTransform([sky, nightfall], ([opacity, p]) => opacity * clamp((p - .2) / .65));
  const skyVisible = useStep(skyReveal, opacity => opacity > .001);
  const layers = useMemo(() => [
    stars(11, 300, "0px", [0.15, 0.45]),
    stars(29, 110, "0.5px", [0.3, 0.75]),
    stars(47, 34, "1px", [0.55, 1]),
  ], []);
  return (
    <div ref={wrap} className={cx("nt", still && "is-still", !close && "is-far")}>
      <motion.div className="nt-backdrop" style={still ? undefined : { backgroundColor: background }} aria-hidden="true">
        <motion.div className="nt-sky" data-running={close && skyVisible && !still} style={{ opacity: still ? sky : skyReveal }} aria-hidden="true">
          <motion.i className="nt-stars" style={{ boxShadow: layers[0], y: far }} />
          <motion.i className="nt-stars" style={{ boxShadow: layers[1], y: mid }} />
          <motion.i className="nt-stars nt-stars-near" style={{ boxShadow: layers[2], y: near }} />
          <i className="nt-shoot" />
        </motion.div>
      </motion.div>
      <div ref={entry} className="nt-entry" aria-hidden="true" />
      <Tomorrow />
      <Yours sectionRef={yoursRef} p={yours} departure={departure} />
      <div ref={departureRef} className="nt-return" aria-hidden="true" />
      <Finale />
    </div>
  );
}
