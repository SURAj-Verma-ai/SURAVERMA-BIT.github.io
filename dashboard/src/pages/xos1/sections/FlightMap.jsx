import { useEffect, useRef } from "react";
import { useMotionValueEvent } from "framer-motion";
import regionalMap from "./india-flight-map.svg?url";
import { flightFrame, MAP_EXTENT, project, ROUTE_PATH } from "./flightMath.js";

// The regional map stays mounted. Scroll changes two transforms and the
// aircraft, without map tiles, a worker, WebGL or a continuous render loop.
const PLACES = [
  ["Jaipur",75.79,26.91], ["Ahmedabad",72.57,23.02],
  ["Bhopal",77.41,23.26], ["Indore",75.86,22.72],
  ["Surat",72.83,21.17], ["Pune",73.86,18.52],
  ["Lucknow",80.95,26.85], ["Nagpur",79.09,21.15],
  ["Jodhpur",73.02,26.24], ["Udaipur",73.68,24.59],
].map(([name,lon,lat]) => ({ name, point: project([lon,lat]) }));
const INITIAL = flightFrame(0,1280,720);
const matrixStyle = frame => ({ transform: `matrix(${frame.matrix.join(",")})` });

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
  const host = useRef(null), base = useRef(null), lines = useRef(null);
  const world = useRef(null), route = useRef(null), names = useRef(null);
  const trail = useRef(null), plane = useRef(null), shadow = useRef(null);
  const delhi = useRef(null), mumbai = useRef(null);
  const active = useRef(near), size = useRef([1280,720]), pending = useRef(0);
  const drawRef = useRef(null);
  active.current = near;

  drawRef.current = () => {
    if (!world.current) return;
    const frame = flightFrame(p.get(),...size.current);
    const transform = `matrix(${frame.matrix.join(",")})`;
    world.current.style.transform = transform;
    route.current.style.transform = transform;
    names.current.style.opacity = String(Math.max(0,1-frame.dive*3));
    trail.current.style.strokeDashoffset = String(1-frame.progress);
    const [x,y] = frame.aircraft, scale = frame.planeScale;
    const flying = frame.progress>.001 && frame.progress<.999;
    plane.current.style.opacity = flying ? "1" : "0";
    shadow.current.style.opacity = flying ? ".22" : "0";
    plane.current.style.transform = `translate3d(${x}px,${y}px,0) rotate(${frame.angle}deg) scale(${scale}) translate(-50%,-50%)`;
    shadow.current.style.transform = `translate3d(${x+70*scale}px,${y+90*scale}px,0) rotate(${frame.angle}deg) scale(${scale*.94}) translate(-50%,-50%)`;
    delhi.current.style.transform = `translate3d(${frame.delhi[0]}px,${frame.delhi[1]}px,0)`;
    mumbai.current.style.transform = `translate3d(${frame.mumbai[0]}px,${frame.mumbai[1]}px,0)`;
  };
  const schedule = () => {
    if (!active.current || pending.current || document.hidden) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = 0;
      drawRef.current();
    });
  };
  useMotionValueEvent(p,"change",schedule);

  useEffect(() => {
    const resize = new ResizeObserver(([entry]) => {
      const { width,height } = entry.contentRect;
      if (!width || !height) return;
      size.current = [width,height];
      base.current.setAttribute("viewBox",`0 0 ${width} ${height}`);
      lines.current.setAttribute("viewBox",`0 0 ${width} ${height}`);
      drawRef.current();
    });
    resize.observe(host.current);
    document.addEventListener("visibilitychange",schedule);
    return () => {
      resize.disconnect();
      document.removeEventListener("visibilitychange",schedule);
      cancelAnimationFrame(pending.current);
      pending.current = 0;
    };
  },[]);
  useEffect(() => {
    if (near) schedule();
    else { cancelAnimationFrame(pending.current); pending.current=0; }
  },[near]);

  return (
    <div ref={host} className="fm is-ready">
      <svg ref={base} className="fm-map" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden="true">
        <g ref={world} className="fm-world" style={matrixStyle(INITIAL)}>
          <image href={regionalMap} {...MAP_EXTENT} preserveAspectRatio="none" />
          <g ref={names} className="fm-place-names">
            {PLACES.map(({name,point:[x,y]}) => <g key={name} transform={`translate(${x},${y})`}>
              <circle r="2" /><text x="7" y="3">{name}</text>
            </g>)}
          </g>
        </g>
      </svg>
      <svg ref={lines} className="fm-lines" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden="true">
        <g ref={route} className="fm-world" style={matrixStyle(INITIAL)}>
          <path d={ROUTE_PATH} className="fm-ghost" vectorEffect="non-scaling-stroke" />
          <path ref={trail} d={ROUTE_PATH} className="fm-trail" pathLength="1" vectorEffect="non-scaling-stroke" style={{strokeDashoffset:1}} />
        </g>
      </svg>
      <div ref={delhi} className="fm-pin"><i /><b>Delhi</b><span>09:30</span></div>
      <div ref={mumbai} className="fm-pin"><i /><b>Mumbai</b><span>11:40</span></div>
      <div ref={shadow} className="fm-shadow"><Airliner /></div>
      <div ref={plane} className="fm-plane"><Airliner /></div>
      <p className="fm-credit">Map data: Natural Earth</p>
    </div>
  );
}
