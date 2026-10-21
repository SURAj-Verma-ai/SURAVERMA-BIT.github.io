import Scene from "../welcome/Scene.jsx";
import "./ads.css";
import { buildSpatial } from "../welcome/spatial.js";

/* Welcome, by space. Everything your computer does, around you, close enough
   to read; then out the far side into open light. */

const OPTIONS = { fov: 40 };
const LINES = [
  { from: 0.15, to: 0.36, className: "ws-line", text: <>Everything your computer <span className="wk-serif">can do,</span></> },
  { from: 0.42, to: 0.64, className: "ws-line", text: <>now one sentence <span className="wk-serif">away.</span></> },
  { from: 0.7, to: 0.85, className: "ws-line", text: <>In <span className="wk-serif">your</span> words.</> },
];

export default function Spatial() {
  return <Scene className="ws" build={buildSpatial} options={OPTIONS} lines={LINES} />;
}
