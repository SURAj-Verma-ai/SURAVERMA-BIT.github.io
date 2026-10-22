import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { transformSync } from "esbuild";
import { DEL,BOM,ROUTE,flightState } from "./flightMath.js";
import mapStyle from "./flight-map-style.json" with {type:"json"};

// Exercise the real component's effects and event handlers. The map adapter
// measures lifecycle/projection work; browser QA checks the actual WebGL map.
async function mount(initial={prepare:false,near:false}) {
  const hooks=[],maps=[],effects=[],nodes=[],events=new Map();
  let cursor=0,dirty=false,props=initial,change,imports=0;
  const p={value:.85,get(){return this.value;}};
  class MapAdapter {
    constructor(options){this.options=options;this.handlers={};this.projects=0;this.moves=0;this.zoom=options.zoom;maps.push(this);}
    on(name,callback){this.handlers[name]=callback;}
    once(name,callback){this.handlers[name]=callback;}
    emit(name){this.handlers[name]?.();}
    jumpTo(camera){this.moves++;this.zoom=camera.zoom;this.emit("render");}
    project([x,y]){this.projects++;return{x:x*10,y:y*10};}
    getZoom(){return this.zoom;}
    resize(){} remove(){this.removed=true;}
  }
  const context=vm.createContext({DEL,BOM,ROUTE,flightState,mapStyle,workerUrl:"/local-map-worker.mjs",structuredClone,
    rendererModule:()=>{imports++;return Promise.resolve({Map:MapAdapter,setWorkerUrl(){},setWorkerCount(){}});},
    useRef:initial=>{const index=cursor++;return hooks[index]??=( {current:initial} );},
    useState:initial=>{const index=cursor++;hooks[index]??={value:initial};return[hooks[index].value,value=>{
      const next=typeof value==="function"?value(hooks[index].value):value;
      if(!Object.is(next,hooks[index].value)){hooks[index].value=next;dirty=true;}
    }];},
    useEffect:(callback,deps)=>{
      const index=cursor++,previous=hooks[index];
      if(!previous||deps.some((value,i)=>!Object.is(value,previous.deps[i]))) {
        effects.push(()=>{previous?.cleanup?.();hooks[index]={deps,cleanup:callback()};});
      }
    },
    useMotionValueEvent:(_p,_name,callback)=>{change=callback;},
    React:{createElement:(type,attributes,...children)=>{
      if(attributes?.ref&&!attributes.ref.current){
        const node={style:{},setAttribute(name,value){this[name]=value;},className:attributes.className};
        attributes.ref.current=node;nodes.push(node);
      }
      return{type,attributes,children};
    }},
    window:{innerWidth:1280,innerHeight:720,devicePixelRatio:2},
    document:{hidden:false,addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:name=>events.delete(name)},
    ResizeObserver:class{observe(){}disconnect(){}},
    setTimeout:()=>1,clearTimeout(){},
  });
  let source=readFileSync(new URL("./FlightMap.jsx",import.meta.url),"utf8")
    .replace(/^import .*;\r?$/gm,"")
    .replace('const loadRenderer = () => import("maplibre-gl");','const loadRenderer = rendererModule;')
    .replace(/^export default /gm,"");
  source=transformSync(source,{loader:"jsx",jsx:"transform"}).code;
  vm.runInContext(source,context);
  const render=next=>{
    props=next||props;
    do {dirty=false;cursor=0;context.FlightMap({p,...props});while(effects.length)effects.shift()();} while(dirty);
  };
  render();await Promise.resolve();render();
  return {maps,nodes,context,imports:()=>imports,render,
    change:value=>{p.value=value;change();},
    ready:()=>{maps[0].emit("load");render();},
    dispose:()=>hooks.forEach(hook=>hook?.cleanup?.()),
  };
}

test("map renderer starts only near its section and survives departure and return",async()=>{
  const app=await mount();assert.equal(app.imports(),0);
  app.render({prepare:true,near:false});await Promise.resolve();app.ready();
  assert.equal(app.maps.length,1);assert.equal(app.maps[0].projects,0);
  app.render({prepare:true,near:true});assert.ok(app.maps[0].projects>0);
  app.render({prepare:false,near:false});app.change(.8);
  assert.equal(app.maps[0].removed,undefined);assert.equal(app.imports(),1);
  app.render({prepare:true,near:true});assert.equal(app.maps.length,1);
  app.dispose();assert.equal(app.maps[0].removed,true);
});

test("tile arrivals never repeat route projections when the camera has not moved",async()=>{
  const app=await mount({prepare:true,near:true});app.ready();
  const map=app.maps[0],before=map.projects;
  for(let i=0;i<100;i++)map.emit("render");
  assert.equal(map.projects,before);
  app.change(.86);assert.ok(map.projects>before);
  const after=map.projects;map.emit("render");assert.equal(map.projects,after);
  app.dispose();
});

test("hidden or inactive flights skip camera and overlay updates",async()=>{
  const app=await mount({prepare:true,near:true});app.ready();
  const map=app.maps[0],before=map.projects,moves=map.moves;
  app.context.document.hidden=true;app.change(.82);map.emit("render");
  assert.equal(map.projects,before);assert.equal(map.moves,moves);
  app.dispose();
});
