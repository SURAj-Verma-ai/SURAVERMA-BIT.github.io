import { useRef } from "react";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";
import { motion } from "../../lib/motion.js";

function Milestone({item,index,count,progress}) {
  const still = useReducedMotion();
  const step = 1 / Math.max(1,count*2-1);
  const from = index*2*step;
  const opacity = useTransform(progress,[from,from+step*.65],[0,1]);
  const y = useTransform(progress,[from,from+step*.65],[14,0]);
  const line = useTransform(progress,[(index*2+1)*step,(index*2+2)*step],[0,1]);
  return <li>
    {index < count-1 && <motion.span className="ab-progress-connector" style={still ? undefined : {"--ab-line":line}} aria-hidden="true" />}
    <motion.div style={still ? undefined : {opacity,y}}><span className="ab-year">{item.year}</span><span className="ab-milestone-dot" aria-hidden="true" /><p className="ab-milestone-status">{item.status}</p><h3>{item.title}</h3><p className="ab-milestone-copy">{item.text}</p></motion.div>
  </li>;
}

export default function ProgressTimeline({milestones}) {
  const ref = useRef(null);
  const {scrollYProgress} = useScroll({target:ref,offset:["start 85%","end 60%"]});
  return <div ref={ref} className="ab-timeline ab-progress-sequence"><ol style={{"--ab-years":milestones.length}}>{milestones.map((item,index) => <Milestone key={item.year} item={item} index={index} count={milestones.length} progress={scrollYProgress} />)}</ol></div>;
}
