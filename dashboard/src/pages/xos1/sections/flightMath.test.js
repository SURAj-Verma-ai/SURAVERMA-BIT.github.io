import { test } from "node:test";
import assert from "node:assert/strict";
import { DEL,BOM,ROUTE,at,flightState } from "./flightMath.js";
import style from "./flight-map-style.json" with { type:"json" };

const close=(actual,expected)=>actual.forEach((value,index)=>assert.ok(Math.abs(value-expected[index])<1e-8));
test("detailed flight connects the original airports and requests only regional tiles",()=>{
  close(at(0),DEL);close(at(1),BOM);close(at(-1),DEL);close(at(2),BOM);
  for(const source of Object.values(style.sources)) assert.deepEqual(source.bounds,[60,8,92,36]);
  for(const [longitude,latitude] of ROUTE) {
    assert.ok(longitude>60&&longitude<92);assert.ok(latitude>8&&latitude<36);
  }
});
test("the original camera and completed flight are restored in both orientations",()=>{
  for(const portrait of [true,false]) {
    const overview=flightState(.7,portrait),flight=flightState(.85,portrait);
    close(overview.camera.center,[79,22]);assert.equal(overview.camera.pitch,0);
    assert.equal(overview.camera.zoom,portrait?3.4:3.9);
    close(flight.camera.center,flight.here);assert.equal(flight.camera.pitch,58);
    assert.equal(flight.camera.bearing,208);assert.equal(flight.camera.zoom,portrait?5.6:6.3);
    assert.equal(flightState(.98,portrait).progress,1);
  }
});
test("rapid and reverse scroll positions remain finite, monotone and deterministic",()=>{
  for(const portrait of [true,false]) {
    let previous=0;
    for(let i=0;i<=1000;i++) {
      const frame=flightState(i/1000,portrait);
      assert.ok(frame.progress>=previous);previous=frame.progress;
      assert.ok([frame.progress,...frame.here,...frame.before,...frame.after,...frame.camera.center,frame.camera.zoom,frame.camera.pitch,frame.camera.bearing].every(Number.isFinite));
      assert.deepEqual(frame,flightState(i/1000,portrait));
    }
  }
});
