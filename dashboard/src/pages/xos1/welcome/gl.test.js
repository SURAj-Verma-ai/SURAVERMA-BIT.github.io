import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

// Run the actual stage lifecycle against a deterministic browser/GPU adapter.
// This checks scheduling and disposal, not visual quality or hardware FPS.
function stage({ still = false } = {}) {
  const frames = new Map(), idle = new Map(), observers = [], events = new Map();
  const stats = { created:0, rendered:0, cleared:0, ticked:0, disposed:0 };
  let next = 1, sceneVisible = true, animate = true, change;
  class Renderer {
    constructor() { stats.created++; }
    setPixelRatio() {} setClearColor() {} setSize() {}
    render() { stats.rendered++; } clear() { stats.cleared++; }
    compileAsync() { return Promise.resolve(); }
    dispose() { stats.disposed++; }
  }
  class Observer {
    constructor(callback, options = {}) { this.callback = callback; this.options = options; observers.push(this); }
    observe() {} disconnect() {}
    emit(visible) { this.callback([{isIntersecting:visible}]); }
  }
  const document = {hidden:false,addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};
  const context = vm.createContext({
    THREE:{WebGLRenderer:Renderer, Scene:class {traverse(){}}, PerspectiveCamera:class {updateProjectionMatrix(){}}},
    window:{devicePixelRatio:1,innerHeight:800,matchMedia:()=>({matches:false}),
      requestIdleCallback:fn=>{const id=next++;idle.set(id,fn);return id;},cancelIdleCallback:id=>idle.delete(id)},
    document, IntersectionObserver:Observer, ResizeObserver:class {observe(){} disconnect(){}},
    requestAnimationFrame:fn=>{const id=next++;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
  });
  const source = readFileSync(new URL("./gl.js",import.meta.url),"utf8").replace(/^import .*;\r?$/gm,"").replace(/^export /gm,"");
  vm.runInContext(source,context);
  const progress = {on:(_event,fn)=>{change=fn;return ()=>{change=null;};}};
  const dispose = context.createStage({clientWidth:800,clientHeight:600},()=>({
    tick(){stats.ticked++;},isVisible:()=>sceneVisible,isAnimating:()=>animate,
  }),{env:false,progress,still});
  const flush = () => {
    const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(100));
  };
  return {stats,frames,idle,document,dispose,flush,
    prepare:visible=>observers[0].emit(visible),view:visible=>observers[1].emit(visible),
    scroll:()=>change?.(),
    hide:()=>{document.hidden=true;events.get("visibilitychange")();},
    show:()=>{document.hidden=false;events.get("visibilitychange")();},
    scene:visible=>{sceneVisible=visible;},settle:()=>{animate=false;},
  };
}

test("offscreen and hidden-tab scenes cancel frames and resume their existing renderer", () => {
  const s=stage();
  s.scroll();assert.equal(s.frames.size,0);assert.equal(s.stats.created,0);
  s.view(true);s.flush();assert.equal(s.stats.rendered,1);assert.equal(s.frames.size,1);
  s.view(false);assert.equal(s.frames.size,0);s.scroll();s.flush();assert.equal(s.stats.rendered,1);
  s.view(true);s.flush();assert.equal(s.stats.rendered,2);assert.equal(s.stats.created,1);
  s.hide();assert.equal(s.frames.size,0);s.scroll();s.flush();assert.equal(s.stats.rendered,2);
  s.show();s.flush();assert.equal(s.stats.rendered,3);
  s.dispose();assert.equal(s.frames.size,0);assert.equal(s.stats.disposed,1);
});

test("a faded-out scene clears once and stops issuing invisible GPU renders", () => {
  const s=stage();s.view(true);s.flush();
  s.scene(false);s.flush();assert.equal(s.stats.cleared,1);assert.equal(s.frames.size,0);
  for(let i=0;i<30;i++){s.scroll();s.flush();}
  assert.equal(s.stats.rendered,1);assert.equal(s.stats.cleared,1);
  s.scene(true);s.scroll();s.flush();assert.equal(s.stats.rendered,2);s.dispose();
});

test("adjacent preparation waits for idle time and is cancelled on departure", () => {
  const s=stage();s.prepare(true);assert.equal(s.stats.created,0);assert.equal(s.idle.size,1);
  s.prepare(false);assert.equal(s.idle.size,0);s.view(true);assert.equal(s.stats.created,1);
  s.settle();s.flush();assert.equal(s.frames.size,0);s.scroll();s.flush();assert.equal(s.stats.rendered,2);s.dispose();
});

test("reduced-motion stages remain static during scrolling", () => {
  const s=stage({still:true});s.view(true);s.flush();
  assert.equal(s.frames.size,0);s.scroll();s.flush();assert.equal(s.stats.rendered,1);s.dispose();
});
