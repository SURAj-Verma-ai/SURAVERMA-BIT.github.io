import { useEffect, useRef } from "react";
import { useReducedMotion, useTransform } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import { cx } from "../../../lib/cx.js";
import { useScene, useStep } from "../scroll.js";
import { createStage } from "./gl.js";
import Finale, { Words } from "./Finale.jsx";
import "./welcome.css";

/* One welcome scene: a tall section with a pinned stage, a 3D picture keyed
   to how far you've scrolled, the welcome on the first screen, a line or two
   on the way, and "Say it. It's done." as the last frame. For anyone who has
   asked for less motion, the first frame stands still and the line follows. */

const WELCOME_A = "Welcome to a new world";
const WELCOME_B = "of human interaction.";

// A line that holds the stage between two points of the scroll.
function Line({ p, from, to, children, className }) {
  const k = [from, from + 0.04, to - 0.04, to];
  const opacity = useTransform(p, k, [0, 1, 1, 0]);
  const y = useTransform(p, k, [28, 0, 0, -28]);
  const filter = useTransform(p, k, ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  return <motion.p className={cx("wk-line", className)} style={{ opacity, y, filter }}>{children}</motion.p>;
}

export default function Scene({ className, build, options, lines = [], under, over, end = [0.86, 0.92], sayAt = 0.885 }) {
  const still = useReducedMotion();
  const ref = useRef(null);
  const canvas = useRef(null);
  const p = useScene(ref);
  useEffect(() => createStage(canvas.current, (ctx) => build(ctx, () => (still ? 0 : p.get())), options), [p, build, options, still]);

  const headO = useTransform(p, [0.04, 0.11], [1, 0]);
  const headY = useTransform(p, [0, 0.11], [0, -60]);
  const glO = useTransform(p, end, [1, 0]);
  const step = useStep(p, (x) => (x > sayAt + 0.04 ? 3 : x > sayAt + 0.02 ? 2 : x > sayAt ? 1 : 0));

  const head = (
    <motion.div className="wk-head" style={still ? undefined : { opacity: headO, y: headY }}>
      <h1 className="wk-title">
        <Words text={WELCOME_A} delay={0.5} />
        <Words text={WELCOME_B} delay={0.8} className="wk-serif" />
      </h1>
    </motion.div>
  );

  if (still) {
    return (
      <>
        <section ref={ref} className={cx("wl-scene is-still", className)} aria-label="Welcome">
          <div className="wl-stage">
            {under?.(p)}
            <canvas ref={canvas} className="wk-canvas" aria-hidden="true" />
            {head}
          </div>
        </section>
        <section className="wl-still-say"><Finale step={3} tight /></section>
      </>
    );
  }

  return (
    <section ref={ref} className={cx("wl-scene", className)} aria-label="Welcome">
      <div className="wl-stage">
        {under?.(p)}
        <motion.canvas ref={canvas} className="wk-canvas" style={{ opacity: glO }} aria-hidden="true" />
        {over?.(p)}
        {head}
        <motion.div className="wl-cue" style={{ opacity: headO }}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}>Scroll</motion.span>
        </motion.div>
        {lines.map((l) => <Line key={l.from} p={p} from={l.from} to={l.to} className={l.className}>{l.text}</Line>)}
        <Finale step={step} tight />
      </div>
    </section>
  );
}
