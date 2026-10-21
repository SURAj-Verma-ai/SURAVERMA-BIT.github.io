import test from "node:test";
import assert from "node:assert/strict";
import { pricingLines } from "./pricingLines.js";

// Numerically measure the actual quadratic paths, including their curves.
function measure(d) {
  const tokens = d.match(/[MHQV]|-?\d+(?:\.\d+)?/g);
  let x = 0, y = 0, length = 0, start;
  const next = () => Number(tokens.shift());
  while (tokens.length) {
    const command = tokens.shift();
    if (command === "M") { x = next(); y = next(); start = [x,y]; }
    if (command === "H") { const end = next(); length += Math.abs(end-x); x = end; }
    if (command === "V") { const end = next(); length += Math.abs(end-y); y = end; }
    if (command === "Q") {
      const cx = next(), cy = next(), endX = next(), endY = next(), beginX = x, beginY = y;
      for (let step = 1; step <= 128; step++) {
        const t = step/128, u = 1-t;
        const px = u*u*beginX + 2*u*t*cx + t*t*endX;
        const py = u*u*beginY + 2*u*t*cy + t*t*endY;
        length += Math.hypot(px-x,py-y); x = px; y = py;
      }
    }
  }
  return {start, end:[x,y], length};
}

for (const [width,height,centreWidth] of [[360,510,312],[768,530,237],[1440,530,461],[2560,555,461]]) {
  test(`four edge strokes meet simultaneously at the two centre joins (${width}px)`, () => {
    const {strokes} = pricingLines(width,height,centreWidth);
    const paths = strokes.map(measure);
    assert.deepEqual(paths.map(p => p.start),[[0,1],[width,1],[0,height-1],[width,height-1]]);
    assert.deepEqual(paths.map(p => p.end),[[width/2,height-1],[width/2,height-1],[width/2,1],[width/2,1]]);
    paths.forEach(p => assert.ok(Math.abs(p.length-paths[0].length) < .001));
    strokes.forEach(d => assert.ok(!d.includes("Z"),"Each stroke stays open; there are no separate rectangular borders."));
  });
}
