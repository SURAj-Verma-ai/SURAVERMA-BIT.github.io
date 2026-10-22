import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Execute the actual controller lifecycle against browser/input adapters.
// This verifies gesture ownership and scheduling, not simulated device FPS.
function mount({coarse=false,reduced=false,hash=""}={}) {
  const media=new Map(),events=new Map(),frames=new Map(),engines=[],cleanups=[],native=[];
  let next=1;
  const query = name => {
    if (!media.has(name)) media.set(name,{
      matches:name.includes("coarse")?coarse:reduced,
      callbacks:new Set(),
      addEventListener(_name,callback){this.callbacks.add(callback);},
      removeEventListener(_name,callback){this.callbacks.delete(callback);},
      set(value){this.matches=value;this.callbacks.forEach(callback=>callback());},
    });
    return media.get(name);
  };
  class Lenis {
    constructor(options){this.options=options;this.calls=[];this.isScrolling=false;this.time=0;engines.push(this);}
    raf(time){this.time=time;if(this.settled)this.isScrolling=false;}
    scrollTo(target,options){this.calls.push({target,options});this.isScrolling=options.immediate?false:"smooth";}
    stop(){this.isScrolling=false;this.stopped=true;} start(){}
    destroy(){this.destroyed=true;this.isScrolling=false;}
  }
  const context=vm.createContext({Lenis,performance:{now:()=>10},
    useLocation:()=>({pathname:"/about"}),useRef:value=>({current:value}),
    useEffect:callback=>{const cleanup=callback();if(cleanup)cleanups.push(cleanup);},
    window:{location:{hash},matchMedia:query,scrollTo:options=>native.push(options),
      addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:name=>events.delete(name)},
    document:{hidden:false,addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:name=>events.delete(name)},
    requestAnimationFrame:callback=>{const id=next++;frames.set(id,callback);return id;},
    cancelAnimationFrame:id=>frames.delete(id),
  });
  const source=readFileSync(new URL("./SmoothScroll.jsx",import.meta.url),"utf8")
    .replace(/^import .*;\r?$/gm,"").replace(/^export default /gm,"").replace(/^export /gm,"");
  vm.runInContext(source,context);
  context.SmoothScroll();
  return {media,events,frames,engines,native,
    glide:target=>context.glideTo(target),
    flush:()=>{const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(26));},
    cleanup:()=>cleanups.forEach(callback=>callback()),
  };
}

test("phones and tablets keep native momentum with no JS scroll engine",()=>{
  const device=mount({coarse:true});
  assert.equal(device.engines.length,0);
  assert.equal(device.frames.size,0);
  assert.equal(device.events.has("touchmove"),false);
  assert.equal(device.events.has("touchend"),false);
  device.glide(9000);
  assert.equal(device.native.at(-1).top,9000);
  assert.equal(device.native.at(-1).behavior,"smooth");
  device.cleanup();
});

test("desktop smoothing retains a full requested distance and stops its clock at rest",()=>{
  const desktop=mount(),engine=desktop.engines[0];
  assert.equal(desktop.frames.size,0);
  engine.scrollTo(9000,{programmatic:false});
  assert.equal(engine.calls.at(-1).target,9000);
  assert.equal(desktop.frames.size,1);
  engine.scrollTo(12000,{programmatic:false});
  assert.equal(engine.calls.at(-1).target,12000);
  assert.equal(desktop.frames.size,1);
  engine.settled=true;desktop.flush();
  assert.equal(desktop.frames.size,0);
  desktop.cleanup();assert.equal(engine.destroyed,true);
});

test("keyboard navigation is native and interrupts a pending wheel glide",()=>{
  const desktop=mount(),engine=desktop.engines[0];
  engine.scrollTo(3000,{programmatic:false});
  desktop.events.get("keydown")({key:"PageDown",preventDefault(){assert.fail("native key was cancelled");}});
  assert.equal(engine.stopped,true);
  assert.equal(desktop.frames.size,0);
  desktop.cleanup();
});

test("changing input or motion preference tears down the previous engine and frames",()=>{
  const desktop=mount(),engine=desktop.engines[0];
  engine.scrollTo(3000,{programmatic:false});
  desktop.media.get("(any-pointer: coarse)").set(true);
  assert.equal(engine.destroyed,true);
  assert.equal(desktop.frames.size,0);
  desktop.glide(5000);assert.equal(desktop.native.at(-1).behavior,"smooth");
  desktop.media.get("(prefers-reduced-motion: reduce)").set(true);
  desktop.glide(5000);assert.equal(desktop.native.at(-1).behavior,"instant");
  desktop.cleanup();
  assert.ok([...desktop.media.values()].every(query=>query.callbacks.size===0));
});

test("native navigation resets a new page but preserves a requested fragment",()=>{
  const page=mount({coarse:true});
  assert.equal(page.native[0].top,0);
  assert.equal(page.native[0].behavior,"instant");
  page.cleanup();
  const fragment=mount({coarse:true,hash:"#memory"});
  assert.equal(fragment.native.length,0);
  fragment.cleanup();
});
