import { useRef } from "react";
import { AnimatePresence, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { EASE, motion } from "../../lib/motion.js";
import { cx } from "../../lib/cx.js";
import { DAY, LIGHT, fmtTime } from "./day.js";
import { clamp, useScene, useStep } from "./scroll.js";
import Orb from "./Orb.jsx";
import "./Day.css";

/* The day, as XOS1 itself. One pinned stage; scrolling through it is the day
   passing, and the page's light follows the hours.

   It looks the way the product does: her orb in the upper middle, one line of
   speech at the bottom. You speak (a voice, word by word, never typed); she
   answers in K-lines, each word out of a soft blur, the orb blooming while she
   talks; and what she does arrives in the space between, out of depth, then
   recedes back into it when the next hour comes. */

const N = DAY.length;
const STEPS = 240;                     // per scene; enough for smooth, few renders
const CENTERS = DAY.map((_, i) => (i + 0.5) / N);
const MINUTES = DAY.map((s) => s.time[0] * 60 + s.time[1]);
// Each hour's light holds steady while its scene plays and changes only in
// the handover between scenes, so no scene is ever seen in a half-light.
const HOLD = DAY.flatMap((_, i) => [(i + 0.06) / N, (i + 0.94) / N]);
const held = (pick) => DAY.flatMap((s) => [LIGHT[s.light][pick], LIGHT[s.light][pick]]);

const phase = (lp, from, to) => clamp((lp - from) / (to - from));

/* ── What she does, scene by scene. Each takes a = 0 → 1. ─────────────── */

function Rain({ a }) {
  const hours = ["7", "8", "9", "10", "11", "12", "1"];
  const chance = [8, 14, 72, 88, 81, 64, 12];
  return (
    <div className="dy-rain">
      <div className="dy-rain-cols">
        {hours.map((h, i) => {
          const fill = clamp(a * 1.6 - i * 0.1) * chance[i];
          return (
            <div key={h} className={cx("dy-rain-col", chance[i] > 50 && "is-wet")}>
              <span className="dy-rain-pct">{Math.round(fill)}%</span>
              <span className="dy-rain-bar"><i style={{ height: `${fill}%` }} /></span>
              <span className="dy-rain-h">{h}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SPARK = [0, -0.4, -0.2, 0.3, 0.1, 0.45, 0.38, 0.62, 0.55, 0.8];
function Stocks({ a }) {
  const w = 520, h = 150;
  const pts = SPARK.map((v, i) => [i * (w / (SPARK.length - 1)), h * 0.62 - v * h * 0.62]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const shown = Math.max(1, Math.round(a * (pts.length - 1)));
  const [ex, ey] = pts[shown];
  return (
    <div className="dy-stocks">
      <p className="dy-stocks-n">+{(a * 0.8).toFixed(1)}<span>%</span></p>
      <svg viewBox={`0 0 ${w} ${h}`} className="dy-spark">
        <defs>
          <linearGradient id="dy-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".14" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <clipPath id="dy-spark-clip"><rect x="0" y="0" width={w * a} height={h} /></clipPath>
        </defs>
        <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="url(#dy-spark-fill)" clipPath="url(#dy-spark-clip)" />
        <path d={d} className="dy-spark-line" pathLength="1" style={{ strokeDashoffset: 1 - a }} />
        <circle cx={ex} cy={ey} r="5" className="dy-spark-dot" style={{ opacity: a > 0.05 ? 1 : 0 }} />
      </svg>
      <p className="dy-stocks-note">Banks leading · Rate news, 8:30 AM</p>
    </div>
  );
}

function Deck({ a }) {
  const slides = 5;
  return (
    <div className="dy-deck">
      <p className={cx("dy-deck-file", a > 0.05 && "is-on")}><span>pitch_deck_final_v3.pptx</span> · 12 slides</p>
      <div className="dy-deck-fan">
        {Array.from({ length: slides }, (_, i) => {
          const k = i - (slides - 1) / 2;
          const t = clamp(a * 1.4 - 0.1);
          return (
            <div key={i} className="dy-slide" style={{
              transform: `translateX(calc(${k * t} * var(--fan))) translateY(${Math.abs(k) * 14 * t}px) rotate(${k * 5 * t}deg)`,
              zIndex: 10 - Math.abs(k),
            }}>
              <i className="dy-slide-title" style={{ width: `${46 + ((i * 13) % 30)}%` }} />
              <div className="dy-slide-body">
                {i % 2 === 0
                  ? [44, 70, 58, 86].map((v, j) => <b key={j} style={{ height: `${v}%` }} />)
                  : <><i /><i /><i style={{ width: "62%" }} /></>}
              </div>
              <span className="dy-slide-n">{i + 3}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PROCS = [
  { name: "Chrome", note: "31 tabs", gb: 2.4 },
  { name: "Visual Studio Code", note: "4 windows", gb: 1.1 },
  { name: "Teams", note: "In a call", gb: 0.6 },
  { name: "XOS1", note: "Counts itself too", gb: 0.3 },
];
function Slow({ a }) {
  return (
    <div className="dy-slow">
      {PROCS.map((p, i) => {
        const t = clamp(a * 1.5 - i * 0.12);
        return (
          <div key={p.name} className={cx("dy-proc", i === 0 && "is-top")} style={{ opacity: clamp(t * 3), transform: `translateY(${(1 - clamp(t * 2)) * 12}px)` }}>
            <span className="dy-proc-name">{p.name}<em>{p.note}</em></span>
            <span className="dy-proc-bar"><i style={{ width: `${(p.gb / 2.4) * 100 * t}%` }} /></span>
            <span className="dy-proc-gb">{(p.gb * t).toFixed(1)} GB</span>
          </div>
        );
      })}
      <p className="dy-slow-up" style={{ opacity: clamp(a * 2 - 1) }}>Last restart: 19 days ago</p>
    </div>
  );
}

function Focus({ a }) {
  const fly = clamp((a - 0.45) / 0.4);
  const left = 1 - clamp((a - 0.5) / 0.5) * 0.06;
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="dy-focus-home">
      <div className="dy-focus" style={{ "--fly": fly }}>
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} className="dy-focus-track" />
          <circle cx="60" cy="60" r={r} className="dy-focus-ring" style={{ strokeDasharray: c, strokeDashoffset: c * (1 - left * clamp(a * 3)) }} />
        </svg>
        <p><b>{a > 0.9 ? "24:58" : "25:00"}</b><span>Focus</span></p>
      </div>
    </div>
  );
}

function Recall({ a, earlier }) {
  const line = clamp(a * 1.6 - 0.2);
  return (
    <div className="dy-recall">
      <div className={cx("dy-recall-then", a > 0.02 && "is-on")}>
        <span className="dy-recall-t">{earlier.time} · You said</span>
        <p>“{earlier.said}”</p>
      </div>
      <div className="dy-recall-track"><i style={{ transform: `scaleX(${line})` }} /></div>
      <div className={cx("dy-recall-now", line > 0.98 && "is-on")}>
        <span className="dy-recall-t">8:30 PM · Now</span>
      </div>
    </div>
  );
}

function Dim({ a }) {
  return (
    <div className="dy-dim">
      <svg viewBox="0 0 24 24" className="dy-dim-sun" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        {Array.from({ length: 8 }, (_, i) => {
          const t = (i * Math.PI) / 4;
          return <path key={i} d={`M${12 + Math.cos(t) * 7.4} ${12 + Math.sin(t) * 7.4} L${12 + Math.cos(t) * 9.6} ${12 + Math.sin(t) * 9.6}`} />;
        })}
      </svg>
      <span className="dy-dim-track"><i style={{ width: `${80 - a * 68}%` }} /></span>
      <span className="dy-dim-pct">{Math.round(80 - a * 68)}%</span>
    </div>
  );
}

const DOES = { rain: Rain, stocks: Stocks, deck: Deck, slow: Slow, focus: Focus, recall: Recall, dim: Dim };

/* ── One scene, as the product shows it. ──────────────────────────────── */

// Your voice: a live waveform while you speak.
function Wave({ on }) {
  return <span className={cx("dy-wave", on && "is-on")} aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <i key={i} />)}</span>;
}

function Speech({ s, lp, clockRef }) {
  const youWords = s.you.split(" ");
  const heard = Math.round(phase(lp, 0.04, 0.26) * youWords.length);
  const herWords = s.her.split(" ");
  const said = Math.round(phase(lp, 0.36, 0.64) * herWords.length);
  const hers = lp >= 0.34;
  return (
    <div className="dy-speech">
      <AnimatePresence mode="wait" initial={false}>
        {!hers ? (
          <motion.p key="you" className="dy-you" exit={{ opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.35 } }}>
            <span className="dy-you-meta"><Wave on={heard > 0 && heard < youWords.length} /><span ref={clockRef}>{fmtTime(...s.time)}</span></span>
            <span className="dy-you-words">
              {youWords.map((w, i) => {
                const typo = s.typo && w.toLowerCase().startsWith(s.typo);
                return <span key={i} className={cx("dy-kw", i < heard && "is-on", typo && "dy-typo")}>{w}</span>;
              })}
            </span>
          </motion.p>
        ) : (
          <motion.p key="her" className="dy-her" aria-label={s.her}
            initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            {herWords.map((w, i) => <span key={i} className={cx("dy-kw", i < said && "is-on")}>{w}</span>)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// What she did, in space: it comes out of depth as she names it.
function Surface({ s, lp }) {
  const Does = DOES[s.id];
  const arrive = phase(lp, 0.4, 0.62);
  const ease = 1 - Math.pow(1 - arrive, 3);
  const a = phase(lp, 0.46, 0.9);
  const tilt = (lp - 0.5) * 7;
  return (
    <div className="dy-surface" style={{
      opacity: ease,
      transform: `translate3d(0, ${(1 - ease) * 40}px, ${(1 - ease) * -900}px) rotateX(${(1 - ease) * 12}deg) rotateY(${tilt}deg)`,
    }}>
      <Does a={a} earlier={s.earlier} />
    </div>
  );
}

/* For anyone who has asked for less motion: the whole day, still, in order. */
function StillDay() {
  return (
    <section className="dy-still">
      {DAY.map((s) => {
        const Does = DOES[s.id];
        const [bg, ink] = LIGHT[s.light];
        return (
          <div key={s.id} className="dy-still-scene" style={{ background: bg, color: ink }}>
            <Orb size={80} />
            <p className="dy-still-you">{fmtTime(...s.time)} · “{s.you}”</p>
            <div className="dy-surface"><Does a={1} earlier={s.earlier} /></div>
            <p className="dy-her dy-her-still">{s.her}</p>
          </div>
        );
      })}
    </section>
  );
}

export default function Day() {
  const still = useReducedMotion();
  const ref = useRef(null);
  const clockRef = useRef(null);
  const p = useScene(ref);

  // The light and the clock: continuous, straight from the scroll.
  const bg = useTransform(p, HOLD, held(0));
  const ink = useTransform(p, HOLD, held(1));
  const minutes = useTransform(p, CENTERS, MINUTES);
  useMotionValueEvent(minutes, "change", (m) => {
    if (!clockRef.current) return;
    const t = Math.round(m);
    clockRef.current.textContent = fmtTime(Math.floor(t / 60), t % 60);
  });
  const starsO = useTransform(p, [CENTERS[5] - 0.04, CENTERS[6]], [0, 1]);
  const dark = useTransform(p, [CENTERS[6] - 0.02, 1], [0, 0.55]);

  const step = useStep(p, (x) => Math.min(N * STEPS - 1, Math.floor(clamp(x) * N * STEPS)));
  if (still) return <StillDay />;
  const scene = Math.floor(step / STEPS);
  const lp = (step % STEPS) / STEPS;
  const s = DAY[scene];
  const speaking = lp > 0.34 && lp < 0.7;

  return (
    <section ref={ref} className="dy" style={{ height: `${N * 125 + 60}svh` }} aria-label="A day with XOS1">
      <motion.div className="dy-stage" style={{ backgroundColor: bg, color: ink }}>
        <motion.div className="dy-stars" style={{ opacity: starsO }} aria-hidden="true" />
        {s.id === "rain" && <div className="dy-rainfall" style={{ opacity: phase(lp, 0.5, 0.8) }} aria-hidden="true" />}
        <div className="dy-orb"><Orb size={118} active={speaking} /></div>
        <div className="dy-space">
          <AnimatePresence initial={false}>
            <motion.div key={s.id} className="dy-space-slot"
              exit={{ opacity: 0, z: -700, x: "-18vw", rotateY: 18, filter: "blur(6px)", transition: { duration: 0.9, ease: EASE } }}>
              <Surface s={s} lp={lp} />
            </motion.div>
          </AnimatePresence>
        </div>
        <Speech s={s} lp={lp} clockRef={clockRef} />
        <motion.div className="dy-night" style={{ opacity: dark }} aria-hidden="true" />
      </motion.div>
    </section>
  );
}
