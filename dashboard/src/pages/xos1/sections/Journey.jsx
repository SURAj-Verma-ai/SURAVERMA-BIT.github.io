import { useEffect, useRef } from "react";
import { useReducedMotion, useTransform } from "framer-motion";
import { motion } from "../../../lib/motion.js";
import { cx } from "../../../lib/cx.js";
import { clamp, useNear, useScene, useStep } from "../scroll.js";
import { createStage } from "../welcome/gl.js";
import { buildRain } from "./rain.js";
import FlightMap from "./FlightMap.jsx";
import LumenIntro from "./LumenIntro.jsx";
import "./journey.css";

/* Lumen Visuals, a feature of XOS1, shown as one continuous piece of work.
   The sentence the conversation above ended on stays at the top as the
   request in hand; under it, the plan XOS1 made from it, each step lighting
   as it starts and ticking off as it's done. Each scene begins as the last
   one ends: the weather for the evening, the bookings, the alarm, the flight
   on a real map. All of it keyed to scroll. */

const SAID = "I'm flying to Mumbai to see Ananya on Saturday. Make it special.";

// The plan: what XOS1 is doing at each point of the scroll, and when it's done.
const STEPS = [
  { name: "Weather", from: 0.14, to: 0.27, doing: "Checking Saturday evening in Bandra", done: "Clear by six" },
  { name: "Table", from: 0.35, to: 0.39, doing: "Booking a rooftop table for two", done: "8 PM, booked" },
  { name: "Flowers", from: 0.39, to: 0.43, doing: "Ordering white lilies, to her door", done: "Arriving 6 PM" },
  { name: "Cab", from: 0.43, to: 0.47, doing: "Booking a cab from the airport", done: "11:55, booked" },
  { name: "Alarm", from: 0.54, to: 0.6, doing: "Setting your alarm", done: "6:30, Saturday" },
  { name: "Flight", from: 0.7, to: 0.9, doing: "Booking the 9:30 to Mumbai", done: "Seat 14A, booked" },
];
const TASKS = [
  ["Table for two, on the rooftop, at 8", "Booked"],
  ["White lilies, to her door", "Arriving 6 PM"],
  ["A cab from the airport", "11:55, booked"],
];
const HOURS = [
  ["3", 29, 70, 2.4], ["4", 28, 58, 1.6], ["5", 28, 34, 0.6], ["6", 27, 8, 0],
  ["7", 27, 4, 0], ["8", 26, 2, 0], ["9", 26, 2, 0], ["10", 25, 3, 0],
];

// A block of type that holds the screen between two points of the scroll.
function Beat({ p, k, className, children }) {
  const opacity = useTransform(p, k, [0, 1, 1, 0]);
  const y = useTransform(p, k, [26, 0, 0, -26]);
  return <motion.div className={cx("jy-beat", className)} style={{ opacity, y }}>{children}</motion.div>;
}

// The request in hand, and the plan under it.
function Thread({ p }) {
  const opacity = useTransform(p, [0.1, 0.13, 0.93, 0.96], [0, 1, 1, 0]);
  const y = useTransform(p, [0.1, 0.13], [-16, 0]);
  // 0..n: which steps have started; done is counted separately.
  const state = useStep(p, (x) => STEPS.map((s) => (x >= s.to ? 2 : x >= s.from ? 1 : 0)).join(""));
  const now = [...state].lastIndexOf("1");
  const last = [...state].lastIndexOf("2");
  const shown = now >= 0 ? STEPS[now] : last >= 0 ? STEPS[last] : null;
  const working = now >= 0;
  return (
    <motion.div className="jy-thread" style={{ opacity, y }}>
      <p className="jy-voice jy-voice-sm">
        <span className="jy-wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
        <span>{SAID}</span>
      </p>
      <ol className="jy-plan" aria-label="What XOS1 is doing">
        {STEPS.map((s, i) => (
          <li key={s.name} className={cx(state[i] === "1" && "is-now", state[i] === "2" && "is-done")}>
            <span className="jy-dot" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4L18 8.5" /></svg></span>
            {s.name}
          </li>
        ))}
      </ol>
      <p className="jy-status" key={shown ? shown.name + working : "idle"}>
        {shown ? (working ? <><span className="jy-spin" aria-hidden="true" />{shown.doing}</> : <><b>{shown.name}:</b> {shown.done}</>) : "Planning your Saturday"}
      </p>
    </motion.div>
  );
}

export default function Journey() {
  const still = useReducedMotion();
  const ref = useRef(null);
  const stage = useRef(null);
  const canvas = useRef(null);
  const umbrella = useRef(null);
  const p = useScene(ref);
  const introArrival = useScene(ref, ["start 90%", "start 20%"]);
  const visible = useNear(stage, "0px");
  const mapPrepare = useNear(ref, "200% 0px");
  const flightNear = useStep(p, x => x > .58 && x < .99);

  useEffect(() => createStage(canvas.current, (ctx) => buildRain(ctx, () => (still ? 0.2 : p.get()), () => umbrella.current), { fov: 40, env: false, progress: p, still }), [p, still]);

  const done = useStep(p, (x) => STEPS.slice(1, 4).filter((s) => x >= s.to).length);
  const veil = useTransform(p, [0.94, 0.97], [0, 0.9]);
  const ring = useTransform(p, [0.55, 0.6], [0, 1]);
  const mapO = useTransform(p, [0.645, 0.68], [0, 1]);
  const umbY = useTransform(p, [0.13, 0.19, 0.25, 0.31], ["-70svh", "0svh", "0svh", "-80svh"]);
  const umbO = useTransform(p, [0.13, 0.16, 0.27, 0.31], [0, 1, 1, 0]);
  const fc = useStep(p, (x) => (x > 0.15 && x < 0.34 ? 1 : 0));
  const umbrellaActive = useStep(p, x => x > .13 && x < .31);

  return (
    <section ref={ref} className={cx("jy", still && "is-still", !visible && "is-offscreen")} aria-label="Lumen Visuals, a feature of XOS1">
      <div ref={stage} className="jy-stage">
        <motion.div className="jy-mapwrap" style={{ opacity: mapO }}><FlightMap p={p} near={visible && flightNear} prepare={mapPrepare && !still} /></motion.div>
        <canvas ref={canvas} className="jy-canvas" aria-hidden="true" />
        {/* The rain's umbrella: open while it rains, lifted away as it clears. */}
        <motion.img ref={umbrella} className="jy-umbrella" src="/media/journey/umbrella.webp" alt="" draggable="false" style={{ y: umbY, opacity: umbO, animationPlayState: visible && umbrellaActive && !still ? "running" : "paused" }} />
        <motion.div className="jy-veil" style={{ opacity: veil }} aria-hidden="true" />

        <Beat p={p} k={[-1, 0, 0.08, 0.11]} className="jy-title">
          <LumenIntro arrival={introArrival} />
        </Beat>

        <Thread p={p} />

        <Beat p={p} k={[0.14, 0.17, 0.295, 0.315]} className="jy-caption jy-weather-caption">
          <h3>Rain clears by six. <em>The rooftop works.</em></h3>
          <p>Saturday evening, Bandra.</p>
        </Beat>

        <Beat p={p} k={[0.15, 0.18, 0.295, 0.315]} className={cx("jy-forecast", fc && "is-on")}>
          <div className="jf-now">
            <p className="jf-temp">27°</p>
            <div><p className="jf-cond">Clearing by evening</p><p className="jf-feels">Saturday, Bandra · Sunset 6:41</p></div>
          </div>
          <ol className="jf-hours">
            {HOURS.map(([h, t, pc, mm], i) => (
              <li key={h} className={cx(pc > 50 && "is-wet", +h >= 6 && "is-clear")} style={{ "--i": i, "--mm": Math.max(0.04, mm / 2.4) }}>
                <span className="jf-pc">{pc}%</span>
                <span className="jf-bar"><i /></span>
                <span className="jf-t">{t}°</span>
                <span className="jf-h">{h}</span>
              </li>
            ))}
          </ol>
          <dl className="jf-more">
            <div><dt>At 8 PM</dt><dd>Clear, 26°</dd></div>
            <div><dt>Humidity</dt><dd>78%</dd></div>
            <div><dt>Wind</dt><dd>12 km/h W</dd></div>
          </dl>
        </Beat>

        <Beat p={p} k={[0.315, 0.34, 0.5, 0.52]} className="jy-center">
          <ul className="jy-tasks">
            {TASKS.map(([t, d], i) => (
              <li key={t} className={cx(i < done && "is-done")}>
                <span className="jy-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                <span className="jy-task">{t}</span>
                <span className="jy-state">{d}</span>
              </li>
            ))}
          </ul>
        </Beat>

        <Beat p={p} k={[0.52, 0.545, 0.635, 0.655]} className="jy-center">
          <div className="jy-alarm">
            <svg viewBox="0 0 200 200" className="jy-ring" aria-hidden="true">
              <circle cx="100" cy="100" r="96" className="jy-ring-track" />
              <motion.circle cx="100" cy="100" r="96" className="jy-ring-ink" style={{ pathLength: ring }} />
            </svg>
            <p className="jy-time">6:30</p>
          </div>
          <p className="jy-under">Saturday. Your alarm is set.</p>
        </Beat>

        <Beat p={p} k={[0.86, 0.89, 0.93, 0.95]} className="jy-caption">
          <h3>IndiGo, <em>09:30 to 11:40.</em></h3>
          <p>Seat 14A, by the window. Booked.</p>
        </Beat>

        <Beat p={p} k={[0.955, 0.975, 1.2, 1.3]} className="jy-center jy-end">
          <h3>One sentence.</h3>
          <h3><em>From takeoff to the table.</em></h3>
        </Beat>
      </div>
    </section>
  );
}
