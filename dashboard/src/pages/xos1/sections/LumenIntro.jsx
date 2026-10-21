import { useReducedMotion, useTransform } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import "./LumenIntro.css";

function TitleWord({ arrival, range, children }) {
  const still = useReducedMotion();
  const y = useTransform(arrival, range, ["105%", "0%"]);
  const rotate = useTransform(arrival, range, [5, 0]);
  return <span className="li-word-mask"><motion.span style={still ? undefined : { y, rotate }}>{children}</motion.span></span>;
}

// Typography only. Every reveal follows scroll in both directions, with no
// timed playback that a fast scroll can leave unfinished.
export default function LumenIntro({ arrival }) {
  const still = useReducedMotion();
  const kickerO = useTransform(arrival, [.02, .3], [0, 1]);
  const kickerY = useTransform(arrival, [.02, .3], [12, 0]);
  const tagO = useTransform(arrival, [.6, .95], [0, 1]);
  const tagY = useTransform(arrival, [.6, .95], [18, 0]);
  return <div className="li">
    <motion.p className="li-kicker" style={still ? undefined : { opacity:kickerO, y:kickerY }}>Introducing the all-new</motion.p>
    <h2 aria-label="Lumen Visuals."><span aria-hidden="true"><TitleWord arrival={arrival} range={[.12,.62]}>Lumen</TitleWord>{" "}<TitleWord arrival={arrival} range={[.25,.75]}>Visuals.</TitleWord></span></h2>
    <motion.p className="li-tag" style={still ? undefined : { opacity:tagO, y:tagY }}>In XOS1, answers don't only speak. They appear around you.</motion.p>
  </div>;
}
