import { EASE, motion } from "../../../lib/motion.js";
import { cx } from "../../../lib/cx.js";

/* The words of the welcome scenes, and their last frame: "Say it." above,
   "It's done." below (with room between them for an object, or not), and the
   foot with the download under both. `step` 1 says it, 2 is done, 3 the foot. */

export function Words({ text, on = true, delay = 0, className }) {
  return (
    <motion.span className={cx("kw", className)} initial="h" animate={on ? "s" : "h"}
      variants={{ s: { transition: { staggerChildren: 0.08, delayChildren: delay } }, h: { transition: { staggerChildren: 0.02, staggerDirection: -1 } } }}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="xp-mask">
          <motion.span className="xp-word" variants={{
            h: { y: "110%", opacity: 0, transition: { duration: 0.45, ease: EASE } },
            s: { y: "0%", opacity: 1, transition: { duration: 1.2, ease: EASE, opacity: { duration: 0.3 } } },
          }}>{w}</motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export default function Finale({ step, tight = false, sayStyle }) {
  return (
    <div className={cx("kf", tight && "kf-tight")} aria-hidden={step === 0}>
      <motion.p className="kf-say" style={sayStyle}><Words text="Say it." on={step >= 1} /></motion.p>
      <p className="kf-done"><Words text="It's done." on={step >= 2} /></p>
      <motion.div className="xp-hero-foot kf-foot" initial={{ opacity: 0, y: 16 }} animate={step >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: step >= 3 ? 1.1 : 0.4, ease: EASE }}>
        <p className="xp-hero-name">XOS1 <span>for Windows</span></p>
        <p className="xp-hero-sub">An AI that lives on your PC. You say what you need, and it happens.</p>
        <a className="xp-btn" href="https://xtec.xiteai.com/download" tabIndex={step >= 3 ? 0 : -1}>Download for Windows</a>
      </motion.div>
    </div>
  );
}
