import { useEffect, useRef } from "react";
import { useReducedMotion, useTransform } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import { cx } from "../../../lib/cx.js";
import { clamp, useNear, useScene, useStep } from "../scroll.js";
import { createStage } from "../welcome/gl.js";
import { buildWall } from "./wall.js";
import "./sections.css";

/* How a computer has been used since the 1980s: an app for everything. A
   wall of them, in 3D (wall.js), pulled back until it fills the world; AI
   arrives as one more tile; then every tile streams into a single line, the
   conversation. */

// Fine-line glyphs, 24 units square, drawn for this page.
const G = {
  mail: "M3.5 6.5h17v11h-17z M3.5 7l8.5 6 8.5-6",
  calendar: "M4 6h16v14H4z M4 10h16 M8 3.5v4 M16 3.5v4",
  notes: "M6 3.5h9l3 3V20.5H6z M9 10h6 M9 13.5h6 M9 17h4",
  files: "M3.5 7.5h6l2 2h9v10h-17z",
  music: "M9 17.5V5.5l10-2v12 M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z M19 15.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
  photos: "M4 5.5h16v13H4z M4 15l5-4.5 4 3.5 3-2.5 4 3.5 M15.5 9.5h.01",
  maps: "M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z M9 4.5v13 M15 6.5v13",
  weather: "M7.5 17.5h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6-1.4A4.2 4.2 0 0 0 7.5 17.5z",
  settings: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M12 3v2.5 M12 18.5V21 M3 12h2.5 M18.5 12H21 M5.6 5.6l1.8 1.8 M16.6 16.6l1.8 1.8 M5.6 18.4l1.8-1.8 M16.6 7.4l1.8-1.8",
  browser: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z M3.5 12h17 M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5S14.6 18.1 12 20.5 M12 3.5C9.4 5.9 8.2 8.7 8.2 12s1.2 6.1 3.8 8.5",
  calculator: "M6 3.5h12v17H6z M8.5 6.5h7v3h-7z M9 13h.01 M12 13h.01 M15 13h.01 M9 16.5h.01 M12 16.5h.01 M15 16.5h.01",
  clock: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z M12 7.5V12l3 2",
  camera: "M4 8h3.5L9 5.5h6L16.5 8H20v11H4z M12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  chat: "M4 5.5h16v10H10l-4 3.5v-3.5H4z",
  terminal: "M3.5 5h17v14h-17z M7 9.5l3 2.5-3 2.5 M12.5 15h4.5",
  stocks: "M3.5 18.5h17 M4.5 15l4.5-5 3.5 3 6.5-7 M15 6h4v4",
  video: "M3.5 6.5h12.5v11H3.5z M16 10.5l4.5-3v9l-4.5-3z",
  document: "M6 3.5h8l4 4V20.5H6z M14 3.5v4h4",
  store: "M5 8.5h14l-1 11.5H6z M9 8.5V7a3 3 0 0 1 6 0v1.5",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5 M16 11a2.5 2.5 0 1 0 0-5 M17.5 14.2c1.8.6 3 2.2 3 4.8",
};
const APPS = ["mail", "calendar", "notes", "files", "music", "photos", "maps", "weather", "settings", "browser", "calculator", "clock", "camera", "chat", "terminal", "stocks", "video", "document", "store", "people"];
const SAID = "I'm flying to Mumbai to see Ananya on Saturday. Make it special.".split(" ");

function Line({ p, from, to, children }) {
  const k = [from, from + 0.04, to - 0.04, to];
  const opacity = useTransform(p, k, [0, 1, 1, 0]);
  const y = useTransform(p, k, [28, 0, 0, -28]);
  const filter = useTransform(p, k, ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  return <motion.p className="ap-line" style={{ opacity, y, filter }}>{children}</motion.p>;
}

export default function Apps() {
  const still = useReducedMotion();
  const ref = useRef(null);
  const canvas = useRef(null);
  const stage = useRef(null);
  const visible = useNear(stage, "0px");
  const p = useScene(ref);
  const speaking = useStep(p, x => x >= .81);
  useEffect(() => createStage(canvas.current, (ctx) => buildWall(ctx, () => (still ? 0.3 : p.get()), APPS.map((k) => G[k])), { fov: 32, progress: p, still }), [p, still]);
  // The AI tile becomes the conversation: at the moment the camera has it
  // centred, the page takes over with a copper square exactly where the tile
  // is, which widens into the bar and turns to paper as the words come.
  const glO = useTransform(p, [0.815, 0.84], [1, 0]);
  const barO = useTransform(p, [0.81, 0.815], [0, 1]);
  const grow = useTransform(p, [0.84, 0.885], [0, 1]);
  const barW = useTransform(grow, (g) => `calc(var(--tile) + (100% - var(--tile)) * ${(g * g * (3 - 2 * g)).toFixed(4)})`);
  const barH = useTransform(grow, (g) => `calc(var(--tile) + (var(--barh) - var(--tile)) * ${(g * g * (3 - 2 * g)).toFixed(4)})`);
  const barR = useTransform(grow, [0, 1], ["22%", "999px"]);
  const barBg = useTransform(grow, [0, 0.6], ["#c27a4a", "#f8f4ed"]);
  const inO = useTransform(p, [0.87, 0.89], [0, 1]);
  const words = useStep(p, (x) => Math.round(clamp((x - 0.875) / 0.08) * SAID.length));
  const firstO = useTransform(p, [0, 0.22, 0.28], [1, 1, 0]);
  const firstY = useTransform(p, [0, 0.22, 0.28], [0, 0, -28]);
  const firstF = useTransform(p, [0, 0.22, 0.28], ["blur(0px)", "blur(0px)", "blur(8px)"]);

  return (
    <section ref={ref} className={cx("ap", still && "is-still", !visible && "is-offscreen", visible && speaking && "is-speaking")} aria-label="Every app, by itself">
      <div ref={stage} className="ap-stage">
        <motion.canvas ref={canvas} className="ap-canvas" style={still ? undefined : { opacity: glO }} aria-hidden="true" />
        <div className="ap-shade" aria-hidden="true" />
        <motion.h2 className="ap-first" style={still ? undefined : { opacity: firstO, y: firstY, filter: firstF }}>
          <span className="ap-kicker">Since the 1980s</span>
          An app for everything. <span className="ap-serif">And you, running all of them.</span>
        </motion.h2>
        {!still && (
          <>
            <Line p={p} from={0.3} to={0.58}>Then AI arrived, <span className="ap-serif">and became one more app.</span></Line>
            <Line p={p} from={0.6} to={1.2}>Now every app lives <span className="ap-serif">inside one conversation.</span></Line>
          </>
        )}
        <motion.div className="ap-bar" style={{ opacity: barO }} aria-hidden={still ? undefined : true}>
          <motion.span className="ap-bar-track" style={{ width: barW, height: barH, borderRadius: barR, backgroundColor: barBg }} />
          <motion.span className="ap-bar-in" style={{ opacity: inO }}>
            <span className="ap-wave"><i /><i /><i /><i /><i /></span>
            <span className="ap-said">{SAID.map((w, i) => <span key={i} className={cx(i < words && "on")}>{w} </span>)}</span>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
