import { useEffect, useState } from "react";
import { useScene } from "../scroll.js";

export function useMemoryProgress(ref) {
  // Lenis already smooths wheel input. A second spring makes the scene trail
  // behind its sticky section when someone scrolls quickly.
  return useScene(ref);
}

// Short viewports use a normal document layout, so readable text never has to
// compete with a pinned canvas for the last few pixels of screen height.
export function useMemoryFlow() {
  const query = "(max-width: 380px), (max-height: 740px)";
  const [flow, setFlow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setFlow(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return flow;
}
