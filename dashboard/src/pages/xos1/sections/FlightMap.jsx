import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { clamp } from "../scroll.js";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

/* The flight, on a real map: OpenFreeMap tiles in Lumen's own warm palette.
   Scroll flies the camera from all of India down onto the route, tilted and
   turned so the aircraft flies up the screen, and out again. The route draws
   behind the aircraft; both are drawn over the map from projected
   coordinates, so the map itself only ever moves its camera. MapLibre loads
   only when this is about to be needed. */

const DEL = [77.1, 28.56], BOM = [72.87, 19.09];
const STYLE = "https://tiles.openfreemap.org/styles/positron";

// The great circle between the two, sampled.
const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
function greatCircle(a, b, n) {
  const [l1, p1] = [rad(a[0]), rad(a[1])], [l2, p2] = [rad(b[0]), rad(b[1])];
  const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  return Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    return [deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.hypot(x, y)))];
  });
}
const ROUTE = greatCircle(DEL, BOM, 160);
const at = (t) => {
  const f = clamp(t) * (ROUTE.length - 1), i = Math.min(ROUTE.length - 2, Math.floor(f)), k = f - i;
  return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * k, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * k];
};
const BEARING = 208; // Delhi to Mumbai, roughly south-south-west

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (p, a, b) => clamp((p - a) / (b - a));
const mix = (a, b, t) => a + (b - a) * t;

// Lumen's warm palette over the positron style.
function warm(style) {
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    layer.paint ||= {};
    if (layer.type === "background") layer.paint["background-color"] = "#ece6d9";
    if (layer.type === "fill") {
      if (/water/.test(id)) layer.paint["fill-color"] = "#cdd8d4";
      else if (/building/.test(id)) layer.paint["fill-color"] = "#d8cebc";
      else if (/park|wood|grass|landcover/.test(id)) layer.paint["fill-color"] = "#dfe1cf";
      else layer.paint["fill-color"] = "#ede7dc";
    }
    if (layer.type === "line") {
      if (/boundary|admin/.test(id)) { layer.paint["line-color"] = "#b8ab95"; layer.paint["line-opacity"] = 0.55; }
      else if (/road|highway|bridge/.test(id)) layer.paint["line-color"] = /casing|case/.test(id) ? "#d5cbb9" : "#fbf6ec";
      else if (/water/.test(id)) layer.paint["line-color"] = "#bdccc9";
    }
    if (layer.type === "symbol") { layer.paint["text-color"] = "#6f6a5d"; layer.paint["text-halo-color"] = "#eee8dd"; layer.paint["text-halo-width"] = 1.2; }
  }
  return style;
}

/* An A320-family airliner from directly above, nose up: true proportions,
   swept wings over the engines, the tailplane, and a cylinder's shading. */
function Airliner() {
  return (
    <svg viewBox="0 0 360 380" className="fm-plane-svg" aria-hidden="true">
      <defs>
        <linearGradient id="fm-body" x1="0" x2="1">
          <stop offset="0" stopColor="#cfcac2" /><stop offset=".28" stopColor="#f4f2ee" /><stop offset=".5" stopColor="#ffffff" />
          <stop offset=".72" stopColor="#f1eee9" /><stop offset="1" stopColor="#c9c3ba" />
        </linearGradient>
        <linearGradient id="fm-wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f4f0" /><stop offset=".7" stopColor="#e8e4dd" /><stop offset="1" stopColor="#d6d0c6" />
        </linearGradient>
        <linearGradient id="fm-nac" x1="0" x2="1">
          <stop offset="0" stopColor="#b9b2a7" /><stop offset=".5" stopColor="#efebe5" /><stop offset="1" stopColor="#b3ab9f" />
        </linearGradient>
      </defs>
      {/* Engines, under the wings, their intakes ahead of the leading edge */}
      <rect x="111" y="116" width="22" height="62" rx="10" fill="url(#fm-nac)" />
      <rect x="227" y="116" width="22" height="62" rx="10" fill="url(#fm-nac)" />
      <ellipse cx="122" cy="118" rx="9" ry="3" fill="#6f665b" /><ellipse cx="238" cy="118" rx="9" ry="3" fill="#6f665b" />
      {/* Wings, swept 25°, with the flap line along the trailing edge */}
      <path d="M200 142 L356 214 L359 222 L357 230 L262 216 L204 204 Z" fill="url(#fm-wing)" stroke="#bdb5a8" strokeWidth=".8" />
      <path d="M160 142 L4 214 L1 222 L3 230 L98 216 L156 204 Z" fill="url(#fm-wing)" stroke="#bdb5a8" strokeWidth=".8" />
      <path d="M206 196 L262 207 L352 221 M154 196 L98 207 L8 221" fill="none" stroke="#b8b0a2" strokeWidth=".8" />
      <path d="M355 214 l4 1 M5 214 l-4 1" stroke="#a9683c" strokeWidth="3" strokeLinecap="round" />
      {/* Tailplane */}
      <path d="M192 318 L246 348 L247 358 L194 350 Z" fill="url(#fm-wing)" stroke="#bdb5a8" strokeWidth=".7" />
      <path d="M168 318 L114 348 L113 358 L166 350 Z" fill="url(#fm-wing)" stroke="#bdb5a8" strokeWidth=".7" />
      {/* Fuselage, nose to tail cone */}
      <path d="M180 2 C196 2 201 26 201 52 L201 296 C201 330 192 360 184 378 L176 378 C168 360 159 330 159 296 L159 52 C159 26 164 2 180 2 Z" fill="url(#fm-body)" stroke="#b9b1a4" strokeWidth=".8" />
      {/* Wing root fairing, and the fin seen edge-on, in the one colour */}
      <ellipse cx="180" cy="176" rx="22" ry="44" fill="#ffffff" opacity=".55" />
      <path d="M177.5 292 L182.5 292 L182 374 L178 374 Z" fill="#a9683c" />
      {/* Cockpit windows */}
      <path d="M170 22 Q180 15 190 22 L188 28 Q180 24 172 28 Z" fill="#3b3732" />
    </svg>
  );
}

export default function FlightMap({ p, near }) {
  const host = useRef(null);
  const svg = useRef(null);
  const trail = useRef(null);
  const ghost = useRef(null);
  const plane = useRef(null);
  const shadow = useRef(null);
  const pins = { del: useRef(null), bom: useRef(null) };
  const map = useRef(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  // Load MapLibre and the style the first time the flight is close.
  useEffect(() => {
    if (!near) return undefined;
    let dead = false;
    let instance;
    let resize;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setStatus("loading");
    (async () => {
      try {
        const [{ Map, setWorkerUrl }, style] = await Promise.all([
          import("maplibre-gl"),
          fetch(STYLE, { signal: controller.signal }).then((r) => {
            if (!r.ok) throw new Error(`Map style request failed (${r.status})`);
            return r.json();
          }),
        ]);
        if (dead || !host.current) return;
        // v6 exposes named exports and needs a bundled, same-origin worker URL.
        setWorkerUrl(workerUrl);
        instance = new Map({
          container: host.current, style: warm(style), center: [79, 22], zoom: 3.8,
          interactive: false, attributionControl: false, antialias: false,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5), fadeDuration: 0, maxPitch: 70,
        });
        map.current = instance;
        instance.on("render", draw);
        instance.once("load", () => {
          if (dead) return;
          frame(p.get());
          draw();
          setStatus("ready");
        });
        resize = new ResizeObserver(() => {
          instance.resize();
          frame(p.get());
          draw();
        });
        resize.observe(host.current);
      } catch (error) {
        if (!dead) {
          console.warn("Flight map could not initialize", error);
          setStatus("error");
        }
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {
      dead = true;
      clearTimeout(timeout);
      controller.abort();
      resize?.disconnect();
      instance?.remove();
      if (map.current === instance) map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, attempt]);

  // The camera, from scroll. The map only re-renders when this changes.
  const frame = (x) => {
    const m = map.current;
    if (!m) return;
    const fly = ease(span(x, 0.78, 0.92));
    const dive = ease(span(x, 0.76, 0.81)) * (1 - ease(span(x, 0.92, 0.97)));
    const c = at(fly);
    const portrait = window.innerWidth < window.innerHeight;
    m.jumpTo({
      center: [mix(79, c[0], dive), mix(22, c[1], dive)],
      zoom: mix(portrait ? 3.4 : 3.9, portrait ? 5.6 : 6.3, dive),
      pitch: mix(0, 58, dive),
      bearing: mix(0, BEARING, dive),
    });
  };
  useMotionValueEvent(p, "change", (x) => { if (x > 0.68 && x < 1.01) frame(x); });

  // Route, aircraft and pins, from projected coordinates after every map render.
  function draw() {
    const m = map.current;
    if (!m || !svg.current) return;
    const x = p.get();
    const prog = ease(span(x, 0.78, 0.92));
    const pts = ROUTE.map((q) => m.project(q));
    const d = pts.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
    ghost.current.setAttribute("d", d);
    trail.current.setAttribute("d", d);
    trail.current.style.strokeDashoffset = String(1 - prog);
    const here = m.project(at(prog)), ahead = m.project(at(Math.min(1, prog + 0.01)));
    const ang = (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI + 90;
    const scale = Math.pow(2, m.getZoom() - 6.3) * 0.44;
    const flying = prog > 0.001 && prog < 0.999;
    plane.current.style.opacity = flying ? 1 : 0;
    shadow.current.style.opacity = flying ? 0.22 : 0;
    // Centre the aircraft on its point first, then size and turn it there.
    plane.current.style.transform = `translate3d(${here.x}px, ${here.y}px, 0) rotate(${ang}deg) scale(${scale}) translate(-50%, -50%)`;
    // Its shadow falls on the ground below and behind it, as from a high sun.
    shadow.current.style.transform = `translate3d(${here.x + 70 * scale}px, ${here.y + 90 * scale}px, 0) rotate(${ang}deg) scale(${scale * 0.94}) translate(-50%, -50%)`;
    [["del", DEL], ["bom", BOM]].forEach(([k, c]) => {
      const q = m.project(c), el = pins[k].current;
      if (el) el.style.transform = `translate3d(${q.x}px, ${q.y}px, 0)`;
    });
  }

  return (
    <div className={`fm${status === "ready" ? " is-ready" : ""}`}>
      <div ref={host} className="fm-map" />
      <svg ref={svg} className="fm-lines" aria-hidden="true">
        <path ref={ghost} className="fm-ghost" />
        <path ref={trail} className="fm-trail" pathLength="1" />
      </svg>
      <div ref={pins.del} className="fm-pin"><i /><b>Delhi</b><span>09:30</span></div>
      <div ref={pins.bom} className="fm-pin"><i /><b>Mumbai</b><span>11:40</span></div>
      <div ref={shadow} className="fm-shadow"><Airliner /></div>
      <div ref={plane} className="fm-plane"><Airliner /></div>
      {near && status === "error" && (
        <div className="fm-message" role="status">
          <span>The map couldn’t load.</span>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
        </div>
      )}
      <p className="fm-credit">© OpenStreetMap · OpenFreeMap</p>
    </div>
  );
}
