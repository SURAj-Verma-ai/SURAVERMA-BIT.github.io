import { useTransform } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import Scene from "../welcome/Scene.jsx";
import "./ads.css";
import { buildCity } from "./city.js";

/* Welcome, by city. Not everyone can use a computer; everyone can talk. One
   window lights, then the whole city. */

const OPTIONS = { env: false, fov: 38 };
const LINES = [
  { from: 0.13, to: 0.33, text: <>Not everyone can use <span className="wk-serif">a computer.</span></> },
  { from: 0.37, to: 0.56, text: <>Everyone <span className="wk-serif">can talk.</span></> },
  { from: 0.6, to: 0.8, text: <>Now, that's <span className="wk-serif">all it takes.</span></> },
];

function Sky({ p }) {
  const morning = useTransform(p, [0.86, 0.885], [0, 1]);
  return (
    <>
      <div className="wc-sky" aria-hidden="true" />
      <motion.div className="wc-morning" style={{ opacity: morning }} aria-hidden="true" />
    </>
  );
}
function Scrim({ p }) {
  const opacity = useTransform(p, [0.78, 0.84], [1, 0]);
  return <motion.div className="wc-scrim" style={{ opacity }} aria-hidden="true" />;
}

export default function City() {
  return <Scene className="wc" build={buildCity} options={OPTIONS} lines={LINES} end={[0.86, 0.885]} sayAt={0.885}
    under={(p) => <Sky p={p} />} over={(p) => <Scrim p={p} />} />;
}
