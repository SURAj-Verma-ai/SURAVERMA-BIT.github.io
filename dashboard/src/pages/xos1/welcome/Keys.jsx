import { useEffect, useRef } from "react";
import { useReducedMotion, useTransform } from "framer-motion";
import { EASE, motion } from "../../../lib/motion.js";
import { useScene, useStep } from "../scroll.js";
import { createStage } from "./gl.js";
import { buildKeys } from "./keys.js";
import { Words } from "./Finale.jsx";
import "./welcome.css";

/* The XOS1 welcome, by keyboard (keys.js has the story). Words always have
   the screen to themselves: the 3D picture is held below them. When the voice
   has said its piece and the keys have gone, the page's line arrives at the
   width of the screen: "Say it." from the left, "It's done." from the right. */

const OPTIONS = { fov: 28, env: true };

function Line({ p, from, to, children }) {
  const k = [from, from + 0.035, to - 0.035, to];
  const opacity = useTransform(p, k, [0, 1, 1, 0]);
  const y = useTransform(p, k, [28, 0, 0, -28]);
  const filter = useTransform(p, k, ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  return <motion.p className="wk-line" style={{ opacity, y, filter }}>{children}</motion.p>;
}

// "Say it." and "It's done." rise as the keys fall away; then the foot.
function SayIt({ on, foot = on }) {
  return (
    <div className="wl-sayit" aria-hidden={!on}>
      <div className="xp-hero-type">
        <div className="xp-row xp-row-serif"><Words text="Say it." on={on} className="xp-rise" /></div>
        <div className="xp-row xp-row-sans"><Words text="It's done." on={on} delay={0.3} className="xp-rise" /></div>
      </div>
      <motion.div className="xp-hero-foot" initial={{ opacity: 0, y: 16 }} animate={foot ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: foot ? 1 : 0.3, ease: EASE }}>
        <p className="xp-hero-name">XOS1 <span>for Windows</span></p>
        <p className="xp-hero-sub">An AI that lives on your PC. You say what you need, and it happens.</p>
        <a className="xp-btn" href="https://xtec.xiteai.com/download" tabIndex={foot ? 0 : -1}>Download for Windows</a>
      </motion.div>
    </div>
  );
}

export default function Keys() {
  const still = useReducedMotion();
  const ref = useRef(null);
  const canvas = useRef(null);
  const p = useScene(ref);
  useEffect(() => createStage(canvas.current, (ctx) => buildKeys(ctx, () => (still ? 0 : p.get())), { ...OPTIONS, progress: p, still }), [p, still]);

  const headO = useTransform(p, [0.04, 0.1], [1, 0]);
  const headY = useTransform(p, [0, 0.1], [0, -70]);
  const headF = useTransform(p, [0.04, 0.1], ["blur(0px)", "blur(10px)"]);
  const glO = useTransform(p, [0.855, 0.87], [1, 0]);
  const step = useStep(p, (x) => (x > 0.89 ? 2 : x > 0.855 ? 1 : 0));

  const head = (
    <motion.div className="wk-head" style={still ? undefined : { opacity: headO, y: headY, filter: headF }}>
      <h1 className="wk-title">
        <Words text="Welcome to a new world" delay={0.5} />
        <Words text="of human interaction." delay={0.8} className="wk-serif" />
      </h1>
    </motion.div>
  );

  if (still) {
    return (
      <>
        <section ref={ref} className="wl-scene kk is-still" aria-label="Welcome">
          <div className="wl-stage">
            <canvas ref={canvas} className="wk-canvas" aria-hidden="true" />
            {head}
          </div>
        </section>
        <section className="wl-still-say"><SayIt on /></section>
      </>
    );
  }

  return (
    <section ref={ref} className="wl-scene kk" aria-label="Welcome">
      <div className="wl-stage">
        <motion.canvas ref={canvas} className="wk-canvas" style={{ opacity: glO }} aria-hidden="true" />
        {head}
        <motion.div className="wl-cue" style={{ opacity: headO }}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}>Scroll</motion.span>
        </motion.div>
        <Line p={p} from={0.125} to={0.335}>For fifty years, we learned <span className="wk-serif">the computer's language.</span></Line>
        <Line p={p} from={0.635} to={0.8}>Now it speaks <span className="wk-serif">yours.</span></Line>
        <SayIt on={step >= 1} foot={step >= 2} />
      </div>
    </section>
  );
}
