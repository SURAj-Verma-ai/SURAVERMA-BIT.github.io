import { useEffect, useRef, useState } from "react";
import "./LineScene.css";

// Native, finite SVG animations. Paused outside the viewport and in hidden
// tabs; no frame loop, timers or canvas. The scene is entirely decorative.
export function LineScene({children,className="",viewBox="0 0 640 500"}) {
  const ref = useRef(null);
  const [running,setRunning] = useState(false);
  useEffect(() => {
    let visible = false;
    const update = () => setRunning(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; update();
    },{threshold:.15});
    observer.observe(ref.current);
    document.addEventListener("visibilitychange",update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange",update); };
  },[]);
  return <div ref={ref} className={`line-scene ${className}`} data-running={running} aria-hidden="true"><svg viewBox={viewBox} fill="none" focusable="false" preserveAspectRatio="xMidYMid meet">{children}</svg></div>;
}

export function Ink({d,delay=0,className=""}) {
  return <path d={d} pathLength="1" className={`ls-ink ${className}`} style={{"--ls-delay":`${delay}s`}} />;
}
