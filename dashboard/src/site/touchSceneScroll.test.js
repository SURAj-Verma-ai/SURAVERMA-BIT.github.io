import {test} from "node:test";
import assert from "node:assert/strict";
import {createSceneTouch, sceneGlide} from "./touchSceneScroll.js";

test("a fast fling coasts at most half a viewport and respects document bounds",()=>{
  for(const h of [320,568,844,1024]) for(const v of [-100,-2,0,2,100]) {
    const g=sceneGlide(2000,v,h,10000);
    assert.ok(Math.abs(g.target-2000)<=h*.55+1e-8);
    assert.ok(g.duration>=.18 && g.duration<=.32);
  }
  assert.equal(sceneGlide(10,-10,800,10000).target,0);
  assert.equal(sceneGlide(9990,10,800,10000).target,10000);
});

function setup(eligible=true) {
  let y=1000;
  const calls=[];
  const control=createSceneTouch({eligible:()=>eligible,position:()=>y,height:()=>800,limit:()=>10000,
    scrollTo:(target,options)=>{calls.push({target,options});y=target;}});
  const send=(type,time,dy=0,dx=0,touches=1)=>control.handle({deltaX:dx,deltaY:dy,event:{type,timeStamp:time,target:{},touches:Array(touches).fill({}),cancelable:true,preventDefault(){}}});
  return {control,send,calls};
}

test("finger movement is direct even for a very long swipe; only release is shortened",()=>{
  const {send,calls}=setup();
  send("touchstart",0);send("touchmove",16,900);send("touchend",32,0,0,0);
  assert.equal(calls[0].target,1900);
  assert.equal(calls[0].options.immediate,true);
  assert.ok(calls[1].target<=2340);
});

test("normal pages, taps, horizontal gestures and pinch zoom remain native",()=>{
  for(const mode of ["outside","tap","horizontal","pinch"]) {
    const {send,calls}=setup(mode!=="outside");
    send("touchstart",0);
    if(mode==="outside") send("touchmove",16,300);
    if(mode==="horizontal") send("touchmove",16,10,100);
    if(mode==="pinch") send("touchmove",16,100,0,2);
    send("touchend",32,0,0,0);
    assert.equal(calls.length,0,mode);
  }
});

test("holding the finger still before release or cancelling does not fling",()=>{
  const {control,send,calls}=setup();
  send("touchstart",0);send("touchmove",16,100);send("touchend",200,0,0,0);
  assert.equal(calls.length,1);
  send("touchstart",300);send("touchmove",316,100);control.cancel();send("touchend",332,0,0,0);
  assert.equal(calls.length,2);
});
