import { useEffect, useRef, useState } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";

export default function MemorySculpture({ kind, progress, selection = 0 }) {
  const canvas = useRef(null);
  const selected = useMotionValue(selection);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  useEffect(() => { selected.set(selection); }, [selection, selected]);
  useEffect(() => {
    let cancelled = false, dispose;
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      try {
        const { createMemorySculpture } = await import("./MemorySculptureScene.js");
        if (!cancelled) dispose = createMemorySculpture(canvas.current, kind, progress, selected, reduced);
      } catch { if (!cancelled) setFailed(true); }
    }, { rootMargin: "100% 0px" });
    io.observe(canvas.current);
    return () => { cancelled = true; io.disconnect(); dispose?.(); };
  }, [kind, progress, selected, reduced]);
  return <div className={`ms-picture ms-${kind}`} aria-hidden="true"><canvas ref={canvas} />{failed && <span className="ms-fallback">{kind === "types" ? "Six kinds of memory." : "Memory stored on your device."}</span>}</div>;
}
