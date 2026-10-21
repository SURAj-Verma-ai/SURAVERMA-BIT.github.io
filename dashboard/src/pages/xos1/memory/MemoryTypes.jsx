import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import { MEMORY_TYPES } from "./memoryData.js";

export default function MemoryTypes() {
  const [selected, setSelected] = useState(0);
  const still = useReducedMotion();
  const memory = MEMORY_TYPES[selected];
  const choose = (e, i) => {
    const next = e.key === "ArrowRight" ? (i + 1) % 6 : e.key === "ArrowLeft" ? (i + 5) % 6 : e.key === "Home" ? 0 : e.key === "End" ? 5 : null;
    if (next !== null) { e.preventDefault(); setSelected(next); document.getElementById(`mt-tab-${next}`)?.focus(); }
  };
  return <section className="mt-section" aria-labelledby="mt-title">
    <div className="mt-stage">
      <header className="mt-heading"><p className="im-kicker">THE SHAPE OF MEMORY</p><h2 id="mt-title">Six kinds of memory.</h2><p>XOS1 finds what matters in a conversation.<br />And knows where it belongs.</p></header>
      <div className="mt-gallery" aria-hidden="true">
        {MEMORY_TYPES.map((type, i) => <div key={type.name} className={`mt-frame${i === selected ? " is-selected" : ""}`} onClick={() => setSelected(i)}>
          <img src={`/media/memory/${type.image}.jpg`} alt="" loading="lazy" decoding="async" width="1200" height="900" />
          <span className="mt-frame-name">{type.name}</span><p className="mt-quote">“{type.quote}”</p>
        </div>)}
      </div>
      <div className="mt-selector" role="tablist" aria-label="Explore the six memory types">
        {MEMORY_TYPES.map((type, i) => <button key={type.name} role="tab" id={`mt-tab-${i}`} aria-selected={selected === i} aria-controls="mt-detail" tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={e => choose(e, i)}>{type.name}</button>)}
      </div>
      <div id="mt-detail" className="mt-detail" role="tabpanel" aria-labelledby={`mt-tab-${selected}`} tabIndex={0}>
        <motion.div key={memory.name} initial={still ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}><h3>{memory.title}</h3><p>{memory.description}</p></motion.div>
      </div>
    </div>
  </section>;
}
