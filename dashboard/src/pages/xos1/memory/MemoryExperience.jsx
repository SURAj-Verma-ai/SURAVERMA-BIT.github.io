import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useTransform } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import { useMemoryProgress } from "./memoryMotion.js";
import MemoryTypes from "./MemoryTypes.jsx";
import MemoryControl from "./MemoryControl.jsx";
import "./memory.css";
import "./sculpture.css";

function Scene({ progress, still }) {
  const canvas = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false, release;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const { createMemoryScene } = await import("./MemoryScene.js");
        if (!cancelled) release = createMemoryScene(canvas.current, progress, still);
      } catch { if (!cancelled) setFailed(true); }
    }, { rootMargin: "100% 0px" });
    observer.observe(canvas.current);
    return () => { cancelled = true; observer.disconnect(); release?.(); };
  }, [progress, still]);
  return <div className="im-picture" aria-hidden="true"><canvas ref={canvas} className="im-canvas" />{failed && <div className="im-fallback">A whole life.<br />Quietly remembered.</div>}</div>;
}

function Caption({ progress, range, className = "", children }) {
  const still = useReducedMotion();
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [24, 0, 0, -24]);
  return <motion.div className={`im-caption ${className}`} style={still ? undefined : { opacity, y }}>{children}</motion.div>;
}

export default function MemoryExperience({ preview = false }) {
  const ref = useRef(null);
  const progress = useMemoryProgress(ref);
  const still = useReducedMotion();
  const introOpacity = useTransform(progress, [0, .18, .25], [1, 1, 0]);
  const introY = useTransform(progress, [0, .25], [0, -35]);
  return <div className={`im-memory${still ? " im-still" : ""}`} id="memory">
    <section ref={ref} className="im-sequence" aria-label="XOS1 memory, from a moment to a lifetime">
      <div className="im-stage">
        <Scene progress={progress} still={still} />
        <motion.header className="im-intro" style={still ? undefined : { opacity: introOpacity, y: introY }}>
          <p className="im-kicker">XOS1 MEMORY</p><h2>Infinite memory.</h2><p className="im-deck">Every conversation builds on the last.</p>
        </motion.header>
        <Caption progress={progress} range={[.25, .32, .55, .63]} className="im-expanse"><h2>You don’t have to<br />start over.</h2><p>XOS1 remembers what matters in your conversations.<br />So you can pick up where you left off.</p></Caption>
        <Caption progress={progress} range={[.65, .73, .985, 1.1]} className="im-retrieve"><h2>Back to the exact moment.</h2><p>“When did I say I wanted to learn the piano?”</p></Caption>
        <motion.div className="im-opening-note" style={still ? undefined : { opacity: introOpacity }}><p>Tell it once.<br />Come back to it whenever you need.</p><span>Scroll to explore <i>↓</i></span></motion.div>
        <Caption progress={progress} range={[.78, .84, .99, 1.15]} className="im-recall-note"><p>“You told me on 14 June at 8:02 pm.”</p><span>The exact conversation, with its date and context.</span></Caption>
      </div>
    </section>
    <MemoryTypes />
    <MemoryControl preview={preview} />
  </div>;
}
