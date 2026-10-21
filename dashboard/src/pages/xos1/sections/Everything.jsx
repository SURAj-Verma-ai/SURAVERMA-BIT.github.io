import { useRef } from "react";
import { useInView } from "framer-motion";
import { Words } from "../welcome/Finale.jsx";
import "./sections.css";

/* And everything else. Each thing XOS1 does by voice, as one word in large
   type with the sentence that does it beside it. Each line comes up to full
   ink as it passes the middle of the screen; that is done by the browser's
   own scroll-linked animation, so it costs nothing per frame. */

const THINGS = [
  ["Weather", "Will it rain on Friday?"],
  ["Markets", "How did my portfolio open?"],
  ["Files", "Find the lease from March."],
  ["Documents", "Read me page three."],
  ["Notes", "Note that the meeting moved to four."],
  ["Calendar", "What am I doing on Saturday?"],
  ["Focus", "Twenty-five minutes. Keep it quiet."],
  ["Alarms", "Wake me at six thirty."],
  ["Music", "Pause that."],
  ["Volume", "Turn it down a little."],
  ["Brightness", "Dim the screen."],
  ["Your PC", "Why is my laptop slow?"],
  ["News", "What happened today?"],
  ["Chess", "Teach me the Sicilian."],
];

export default function Everything() {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-20% 0px" });
  return (
    <section ref={ref} className="ev" aria-label="Everything else">
      <h2 className="ev-title">
        <Words text="And everything else," on={seen} />
        <Words text="one sentence away." on={seen} delay={0.25} className="ev-serif" />
      </h2>
      <ul className="ev-list">
        {THINGS.map(([what, said]) => (
          <li key={what} className="ev-row">
            <span className="ev-what">{what}</span>
            <span className="ev-said">“{said}”</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
