import { useReducedMotion } from "framer-motion";
import { EASE, motion } from "../lib/motion.js";
import "./StruckWord.css";

// A rule's title, said instead of written: the word itself, set large, and a
// pen line drawn through it once it's scrolled to. Screen readers get the
// plain title; the drawing is for the eye only.
export default function StruckWord({ word, label, className = "" }) {
  const still = useReducedMotion();
  const seen = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-80px" } };
  return (
    <h3 className={`struck ${className}`}>
      <span className="struck-sr">{label}</span>
      <motion.span className="struck-word" aria-hidden="true" {...(still ? {} : seen)}
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
        <motion.span className="struck-ink"
          variants={{ hidden: { opacity: 1 }, show: { opacity: 0.6, transition: { delay: 0.8, duration: 0.6 } } }}>
          {word}
        </motion.span>
        <svg className="struck-line" viewBox="0 0 440 100" preserveAspectRatio="none">
          <motion.path d="M6 58 C 90 54, 170 61, 250 57 S 380 54, 434 56"
            variants={{ hidden: { pathLength: still ? 1 : 0 }, show: { pathLength: 1, transition: { delay: 0.45, duration: 0.7, ease: [0.65, 0, 0.35, 1] } } }} />
        </svg>
      </motion.span>
    </h3>
  );
}
