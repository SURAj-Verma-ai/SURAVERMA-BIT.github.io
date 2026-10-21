import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import { useStep } from "../scroll.js";
import { useMemoryFlow, useMemoryProgress } from "./memoryMotion.js";
import { glideTo } from "../../../site/SmoothScroll.jsx";

const STATES = [
  { label: "A conversation", time: "MONDAY", spoken: "I moved to Mumbai last week. The sea is five minutes away.", reply: "That sounds like a good way to end the day. Have you been down there yet?", caption: "The conversation carries on. What matters stays with it." },
  { label: "A few days later", time: "THURSDAY", spoken: "Will I need an umbrella this evening?", reply: "Mumbai clears up by six. You should be fine for your walk.", caption: "It already has the context. You get straight to the answer." },
  { label: "Looking back", time: "ANOTHER CONVERSATION", spoken: "When did I move out of Delhi?", reply: "You told me on Monday that you’d moved to Mumbai the week before.", caption: "A new city becomes home. The old one is still part of your story." },
];

export default function MemoryControl({ preview }) {
  const ref = useRef(null);
  const progress = useMemoryProgress(ref);
  const still = useReducedMotion();
  const flow = useMemoryFlow();
  const [choice, setChoice] = useState(0);
  const scrollStage = useStep(progress, p => p < .34 ? 0 : p < .68 ? 1 : 2);
  const stage = still || flow ? choice : scrollStage;
  const state = STATES[stage];
  const jump = i => {
    if (still || flow) { setChoice(i); return; }
    const box = ref.current.getBoundingClientRect();
    glideTo(window.scrollY + box.top + (box.height - window.innerHeight) * [.12, .5, .88][i]);
  };
  return <>
    <section ref={ref} className={`mc-section${still || flow ? " is-still" : ""}`} aria-labelledby="mc-title">
      <div className="mc-stage">
        <header className="mc-heading"><p className="im-kicker">MEMORY IN EVERYDAY CONVERSATION</p><h2 id="mc-title">It gets to<br />know you.</h2><p>XOS1 picks up the details that matter as you speak. They’re already there when you need them again.</p></header>
        <div className="mc-device">
          <div className="mc-screen">
            <span className="mc-screen-brand">XOS1</span><span className="mc-screen-time">{state.time}</span>
            <motion.div className="mc-screen-content" key={stage} initial={still ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease: [.22, 1, .36, 1] }}>
              {stage === 1 ? <div className="mc-weather"><span>Mumbai</span><strong>27°</strong><span>Clear by evening</span><div className="mc-forecast">6 pm <i /> 7 pm <i /> 8 pm</div></div> : stage === 2 ? <div className="mc-locations"><span>Delhi</span><i>→</i><strong>Mumbai</strong><small>Home, since last week</small></div> : <div className="mc-heard"><span className="mc-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span><p>“{state.spoken}”</p></div>}
              <p className="mc-reply">{state.reply}</p>
            </motion.div>
          </div>
          <img className="mc-hardware" src="/media/memory/laptop.webp" alt="A Windows laptop showing an illustrative XOS1 conversation" width="800" height="548" loading="lazy" />
        </div>
        <div className="mc-narration" aria-live="polite"><p className="mc-spoken">“{state.spoken}”</p><p>{state.caption}</p></div>
        <div className="mc-chapters" role="group" aria-label="Explore a conversation over time">{STATES.map((item, i) => <button key={item.label} onClick={() => jump(i)} aria-pressed={i === stage}>{item.label}<i /></button>)}</div>
      </div>
    </section>
    <section className="mc-after" aria-labelledby="mc-after-title">
      <header><p className="im-kicker">BUILT TO REMEMBER ACCURATELY</p><h2 id="mc-after-title">Life changes.<br />Memory should, too.</h2></header>
      <div className="mc-principles">
        <article><div className="mc-change" aria-hidden="true"><span>Delhi</span><i>→</i><motion.strong initial={still ? false : { opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .8 }} transition={{ duration: .7 }}>Mumbai</motion.strong></div><h3>New facts become current.</h3><p>A move changes where you live. XOS1 keeps the previous city in your history, so earlier conversations still make sense.</p></article>
        <article><div className="mc-correction" aria-hidden="true"><s>14 June</s><motion.span initial={still ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .8 }} transition={{ duration: .7, delay: .15 }}>16 June</motion.span></div><h3>Corrections replace mistakes.</h3><p>Repeated facts don’t become duplicates. Clear corrections replace what was wrong. If a detail is uncertain, XOS1 asks.</p></article>
        <article><div className="mc-local" aria-hidden="true"><svg viewBox="0 0 80 52"><rect x="14" y="4" width="52" height="34" rx="3"/><path d="M5 44h70l-5 4H10z"/><motion.path d="m31 22 6 6 12-13" initial={still ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: .8 }} transition={{ duration: .7, delay: .3 }}/></svg><span>On your device</span></div><h3>You decide what stays.</h3><p>Your memory data is stored on your device. You can review it, correct it or delete it.</p></article>
      </div>
      <p className="im-storage-note">Memory capacity depends on available device storage. Conversations and forecasts shown are illustrative.</p>
      {preview && <a className="im-back" href="/#memory">Explore XOS1 <span>↗</span></a>}
    </section>
  </>;
}
