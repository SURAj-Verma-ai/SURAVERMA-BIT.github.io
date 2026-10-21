import { useId } from "react";
import "./Orb.css";

/* Her presence: the orb XOS1 shows on the desktop. A 1:1 port of the app's
   Orb (XOS1 Frontend/src/components/Orb): same layers, gooey filter, timings
   and colours. The app's own note says it IS the identity, so nothing here is
   redrawn; only `size` is added. `active` blooms it, as when she speaks. */
export default function Orb({ active = false, size = 128, className = "" }) {
  const filterId = "xo-gooey-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <div className={`xo-orb-stage ${className}`} data-active={active} aria-hidden="true" style={{ "--orb-scale": size / 128 }}>
      <div className="xo-orb-float">
        <div className="xo-orb">
          <div className="xo-orb-ball" style={{ filter: `url(#${filterId})` }}>
            <div className="xo-orb-lines xo-orb-idle" />
            <div className="xo-orb-lines xo-orb-act" />
            <div className="xo-orb-rings" />
          </div>
          <svg className="xo-orb-filter">
            <filter id={filterId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" />
            </filter>
          </svg>
        </div>
      </div>
    </div>
  );
}
