import { test } from "node:test";
import assert from "node:assert/strict";
import { DEL, BOM, MAP_EXTENT, ROUTE, flightFrame, mapPoint, pointAt, project } from "./flightMath.js";

const close = (actual,expected) => actual.forEach((value,i) => assert.ok(Math.abs(value-expected[i])<1e-8));

test("route connects both airports and stays inside the bundled region",() => {
  close(pointAt(0),project(DEL));
  close(pointAt(1),project(BOM));
  close(pointAt(-1),project(DEL));
  close(pointAt(2),project(BOM));
  for (const [x,y] of ROUTE) {
    assert.ok(x>MAP_EXTENT.x && x<MAP_EXTENT.x+MAP_EXTENT.width);
    assert.ok(y>MAP_EXTENT.y && y<MAP_EXTENT.y+MAP_EXTENT.height);
  }
});

test("overview fits both airports on phones, tablets and laptops",() => {
  for (const [width,height] of [[320,568],[390,844],[768,1024],[1366,768],[1920,1080]]) {
    for (const progress of [0,.7,.98,1]) {
      const frame=flightFrame(progress,width,height);
      for (const [x,y] of [frame.delhi,frame.mumbai]) {
        assert.ok(x>25 && x<width-25,`${width}x${height}: ${x}`);
        assert.ok(y>70 && y<height-70,`${width}x${height}: ${y}`);
      }
    }
  }
});

test("aircraft stays on the projected route through camera motion and reverse scrolling",() => {
  for (const [width,height] of [[320,568],[390,844],[844,390],[1366,768],[1920,1080]]) {
    let previous=0;
    for (let i=0;i<=1000;i++) {
      const value=i/1000,frame=flightFrame(value,width,height);
      assert.ok(Object.values(frame).flat().every(Number.isFinite));
      assert.ok(frame.progress>=previous);
      previous=frame.progress;
      close(frame.aircraft,mapPoint(frame.matrix,pointAt(frame.progress)));
      assert.deepEqual(frame,flightFrame(value,width,height));
      if (frame.dive===1) close(frame.aircraft,[width/2,height/2]);
    }
  }
});
