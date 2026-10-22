import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import mapStyle from "./flight-map-style.json";
import { DEL, BOM, ROUTE, flightState } from "./flightMath.js";

const loadRenderer = () => import("maplibre-gl");

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

export default function FlightMap({p,near,prepare=near}) {
  const host=useRef(null),ghost=useRef(null),trail=useRef(null);
  const plane=useRef(null),shadow=useRef(null),delhi=useRef(null),mumbai=useRef(null);
  const state=useRef({map:null,ready:false,camera:null,drawn:null});
  const active=useRef(near),sync=useRef(null),draw=useRef(null);
  const [requested,setRequested]=useState(false),[status,setStatus]=useState("loading"),[attempt,setAttempt]=useState(0);
  active.current=near;
  useEffect(()=>{if(prepare)setRequested(true);},[prepare]);

  sync.current=()=>{
    const s=state.current;
    if(!s.map || !active.current || document.hidden) return;
    const next=flightState(p.get(),window.innerWidth<window.innerHeight);
    const camera=JSON.stringify(next.camera);
    if(s.camera!==camera) {
      s.camera=camera;s.drawn=null;
      s.map.jumpTo(next.camera);
    }
  };
  draw.current=()=>{
    const s=state.current;
    if(!s.ready || !active.current || document.hidden) return;
    const next=flightState(p.get(),window.innerWidth<window.innerHeight);
    const signature=s.camera+"|"+next.progress;
    // Tile/font arrivals can render repeatedly with an unchanged camera.
    // Reproject the route only when the camera or actual flight has changed.
    if(signature===s.drawn) return;
    s.drawn=signature;
    const m=s.map;
    const path=ROUTE.map((point,index)=>{
      const q=m.project(point);return `${index?"L":"M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    }).join(" ");
    ghost.current.setAttribute("d",path);trail.current.setAttribute("d",path);
    trail.current.style.strokeDashoffset=String(1-next.progress);
    const here=m.project(next.here),before=m.project(next.before),after=m.project(next.after);
    const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI+90;
    const scale=Math.pow(2,m.getZoom()-6.3)*.44,flying=next.progress>.001&&next.progress<.999;
    plane.current.style.opacity=flying?"1":"0";shadow.current.style.opacity=flying?".22":"0";
    plane.current.style.transform=`translate3d(${here.x}px,${here.y}px,0) rotate(${angle}deg) scale(${scale}) translate(-50%,-50%)`;
    shadow.current.style.transform=`translate3d(${here.x+70*scale}px,${here.y+90*scale}px,0) rotate(${angle}deg) scale(${scale*.94}) translate(-50%,-50%)`;
    for(const [element,point] of [[delhi.current,DEL],[mumbai.current,BOM]]) {
      const q=m.project(point);element.style.transform=`translate3d(${q.x}px,${q.y}px,0)`;
    }
  };
  useMotionValueEvent(p,"change",()=>sync.current());

  useEffect(()=>{
    if(!requested) return undefined;
    let disposed=false,instance,resize,idle=null;
    const s=state.current;
    s.ready=false;s.camera=null;s.drawn=null;
    setStatus("loading");
    const timeout=setTimeout(()=>{if(!disposed&&!s.ready)setStatus("error");},20000);
    loadRenderer().then(({Map,setWorkerUrl,setWorkerCount})=>{
      if(disposed) return;
      const initialize=()=>{
        idle=null;if(disposed)return;
        try {
          setWorkerUrl(workerUrl);setWorkerCount(1);
          const initial=flightState(p.get(),window.innerWidth<window.innerHeight).camera;
          instance=new Map({container:host.current,style:structuredClone(mapStyle),...initial,
            interactive:false,attributionControl:false,antialias:false,
            pixelRatio:Math.min(window.devicePixelRatio||1,1.5),maxPitch:70,fadeDuration:0,
            renderWorldCopies:false,maxTileCacheSize:128,cancelPendingTileRequestsWhileZooming:true});
          s.map=instance;s.camera=JSON.stringify(initial);
          instance.on("render",()=>draw.current());
          instance.once("load",()=>{
            if(disposed)return;
            clearTimeout(timeout);s.ready=true;setStatus("ready");sync.current();draw.current();
          });
          instance.on("error",()=>{if(!disposed&&!s.ready)setStatus("error");});
          resize=new ResizeObserver(()=>{
            instance.resize();s.camera=null;s.drawn=null;sync.current();
          });
          resize.observe(host.current);
        } catch { if(!disposed)setStatus("error"); }
      };
      if(window.requestIdleCallback) idle=window.requestIdleCallback(initialize,{timeout:1000});
      else initialize();
    }).catch(()=>{if(!disposed)setStatus("error");});
    return ()=>{
      disposed=true;clearTimeout(timeout);
      if(idle!==null)window.cancelIdleCallback?.(idle);
      resize?.disconnect();instance?.remove();
      if(s.map===instance)s.map=null;s.ready=false;
    };
    // The instance survives scrolling away and returning. Only leaving the
    // page or explicitly retrying tears it down.
  },[requested,attempt]);
  useEffect(()=>{
    if(near){sync.current();draw.current();}
  },[near]);
  useEffect(()=>{
    const resume=()=>{if(!document.hidden){sync.current();draw.current();}};
    document.addEventListener("visibilitychange",resume);
    return()=>document.removeEventListener("visibilitychange",resume);
  },[]);

  return <div className={`fm${status==="ready"?" is-ready":""}`}>
    <div ref={host} className="fm-map" />
    <svg className="fm-lines" aria-hidden="true">
      <path ref={ghost} className="fm-ghost" />
      <path ref={trail} className="fm-trail" pathLength="1" />
    </svg>
    <div ref={delhi} className="fm-pin"><i/><b>Delhi</b><span>09:30</span></div>
    <div ref={mumbai} className="fm-pin"><i/><b>Mumbai</b><span>11:40</span></div>
    <div ref={shadow} className="fm-shadow"><Airliner/></div>
    <div ref={plane} className="fm-plane"><Airliner/></div>
    {near&&status!=="ready"&&<div className="fm-message" role="status">
      <span>{status==="error"?"The flight map couldn’t load.":"Loading flight map…"}</span>
      {status==="error"&&<button type="button" onClick={()=>setAttempt(value=>value+1)}>Try again</button>}
    </div>}
    <p className="fm-credit">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · OpenFreeMap</p>
  </div>;
}
