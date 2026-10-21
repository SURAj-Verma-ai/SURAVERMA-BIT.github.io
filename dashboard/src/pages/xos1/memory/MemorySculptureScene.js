import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MEMORY_TYPES } from "./memoryData.js";

const PAPER = 0xefeae1;
const clamp = v => Math.max(0, Math.min(1, v));
const smooth = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
function texture(width, height, paint) {
  const cv = document.createElement("canvas"); cv.width = width; cv.height = height;
  const ctx = cv.getContext("2d"); paint(ctx, width, height);
  const tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4;
  return tx;
}

export function createMemorySculpture(canvas, kind, progress, selection, reduced) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=.9;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(); scene.background = new T.Color(PAPER);
  const pmrem = new T.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture; scene.environmentIntensity = .65;
  room.dispose(); pmrem.dispose();
  const camera = new T.PerspectiveCamera(32, 1, .1, 80);
  scene.add(new T.HemisphereLight(0xfffcf4, 0xb6b1a8, .8));
  const light = new T.DirectionalLight(0xfffaf3, 2.1); light.position.set(-6, 12, 8); light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024); Object.assign(light.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
  light.shadow.bias = -.001; light.shadow.normalBias = .04; scene.add(light);
  const shadow = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ color: 0x685943, opacity: .065 }));
  shadow.rotation.x = -Math.PI / 2; shadow.receiveShadow = true; scene.add(shadow);
  const model = new T.Group(); scene.add(model);
  const softShadow = texture(256, 256, ctx => {
    const gradient = ctx.createRadialGradient(128,128,8,128,128,126);
    gradient.addColorStop(0,"rgba(86,71,50,.18)"); gradient.addColorStop(1,"rgba(86,71,50,0)");
    ctx.fillStyle=gradient; ctx.fillRect(0,0,256,256);
  });
  const contact = new T.Mesh(new T.PlaneGeometry(12,9),new T.MeshBasicMaterial({map:softShadow,transparent:true,depthWrite:false,toneMapped:false}));
  contact.rotation.x=-Math.PI/2; contact.position.y=.008; scene.add(contact);
  const grain=texture(128,128,ctx=>{
    const pixels=ctx.createImageData(128,128);let seed=374;
    for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=120+(seed%17);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);
  });
  grain.colorSpace=T.NoColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(14,14);
  const matte = color => new T.MeshStandardMaterial({ color, roughness: .72, metalness: .02, envMapIntensity:.35 });
  const metalMaterial = color => new T.MeshPhysicalMaterial({color, metalness:.82,roughness:.36,bumpMap:grain,bumpScale:.003,clearcoat:.08,clearcoatRoughness:.45});
  function box(parent, w, h, d, radius, material, x = 0, y = 0, z = 0) {
    const mesh = new T.Mesh(new RoundedBoxGeometry(w, h, d, 4, radius), material);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function face(parent, w, h, tx, x, y, z, rx = 0) {
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tx, toneMapped: false }));
    mesh.position.set(x, y, z); mesh.rotation.x = rx; parent.add(mesh); return mesh;
  }
  let update;
  if (kind === "types") {
    const layers = MEMORY_TYPES.map((type, i) => {
      const group = new T.Group(); model.add(group);
      box(group, 5.9, .16, 3.5, .055, metalMaterial(0xc7c1b6));
      box(group, 5.84, .035, 3.44, .014, matte(type.color), 0, -.055);
      const top = texture(1024, 600, ctx => {
        ctx.fillStyle = "#faf6ed"; ctx.fillRect(0, 0, 1024, 600);
        ctx.fillStyle = type.color; ctx.fillRect(64, 62, 12, 12);
        ctx.font = "500 26px Arial"; ctx.fillText(type.name.toUpperCase(), 96, 82);
        ctx.fillStyle = "#443b30"; ctx.font = "500 45px Arial"; ctx.fillText(type.sample.split(" · ")[0], 64, 250);
        ctx.fillStyle = "#8a7f6d"; ctx.font = "28px Arial"; ctx.fillText(type.sample.split(" · ")[1], 64, 310);
        ctx.strokeStyle = type.color; ctx.fillStyle = type.color; ctx.lineWidth = 5;
        ctx.save(); ctx.translate(800,250);
        const ring=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
        const person=(x)=>{ring(x,-40,28);ctx.beginPath();ctx.arc(x,62,58,Math.PI,Math.PI*2);ctx.stroke();};
        if(i===0) person(0);
        if(i===1) { ring(0,0,70); ctx.beginPath();ctx.moveTo(0,-45);ctx.lineTo(0,0);ctx.lineTo(36,24);ctx.stroke(); }
        if(i===2) { for(let k=0;k<5;k++)ctx.strokeRect(-65+k*27,-55,27,110); for(let k of [0,1,3])ctx.fillRect(-46+k*27,-55,14,62); }
        if(i===3) { person(-44);person(44); }
        if(i===4) { ring(0,0,73);ring(0,0,51);ring(0,0,29);ring(0,0,6); }
        if(i===5) { ctx.strokeRect(-67,-64,134,128);ctx.font="500 65px Arial";ctx.textAlign="center";ctx.fillText("14",0,35);ctx.beginPath();ctx.moveTo(-67,-26);ctx.lineTo(67,-26);ctx.stroke(); }
        ctx.restore();
        ctx.font="22px Arial";ctx.fillStyle="#9c9180";ctx.fillText("XOS1 MEMORY",64,522);
      });
      face(group, 5.7, 3.3, top, 0, .085, 0, -Math.PI / 2);
      const edge = texture(1024, 100, ctx => {
        ctx.fillStyle = "#e9e2d6"; ctx.fillRect(0, 0, 1024, 100);
        ctx.fillStyle = type.color; ctx.fillRect(40, 37, 13, 25);
        ctx.fillStyle = "#574d40"; ctx.font = "500 34px Arial"; ctx.fillText(type.name, 78, 62);
      });
      face(group, 5.68, .14, edge, 0, 0, 1.751);
      return group;
    });
    update = (p, mobile, weights) => {
      const spread = reduced ? 1 : smooth((p - .02) / .45);
      layers.forEach((layer, i) => {
        const active = weights[i];
        layer.position.set(-.18 * i * spread, .23 + (5 - i) * (.20 + .56 * spread) + active * .12, i * .14 * spread + active * .8);
      });
      model.rotation.y = -.34;
      camera.position.set(mobile ? 6 : 7, 7.4, 12.8);
      camera.lookAt(-.45, 2.05, .1);
    };
  } else {
    const metal = metalMaterial(0xc4c3be), bezel = matte(0x191a18);
    box(model, 6.8, .22, 4.1, .09, metal, 0, .18, .65);
    const lid = new T.Group(); lid.position.set(0, .29, -1.28); model.add(lid);
    box(lid, 6.75, 4.22, .13, .06, metal, 0, 2.12);
    box(lid, 6.54, 4.01, .045, .02, bezel, 0, 2.12, .086);
    const screens = [0, 1, 2].map(state => texture(1536, 940, (ctx, w, h) => {
      ctx.fillStyle = "#f7f3eb"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7b7163"; ctx.font = "500 24px Arial"; ctx.fillText("XOS1  /  Memory", 90, 86);
      ctx.fillStyle = "#8d8477"; ctx.font = "22px Arial"; ctx.textAlign = "right"; ctx.fillText("Stored on this device", w - 90, 86); ctx.textAlign = "left";
      ctx.strokeStyle = "#dfd7c9"; ctx.beginPath(); ctx.moveTo(90, 118); ctx.lineTo(w - 90, 118); ctx.stroke();
      ctx.fillStyle = "#988364"; ctx.font = "500 24px Arial"; ctx.fillText(state === 2 ? "MEMORY DELETED" : "HABITS", 90, 250);
      ctx.fillStyle = "#302b25"; ctx.font = "500 72px Arial";
      ctx.fillText(state === 2 ? "Forgotten." : "Your coffee preference.", 90, 355);
      ctx.font = "42px Arial"; ctx.fillStyle = "#7b7163";
      ctx.fillText(["Coffee in the evening.", "No coffee after 4 pm.", "This preference is no longer stored."][state], 90, 440);
      if (state !== 2) {
        ctx.font = "25px Arial"; ctx.fillStyle = "#948979";
        ctx.fillText(state === 0 ? "Remembered from your conversation." : "Updated from your latest conversation.", 90, 514);
      }
      ctx.fillStyle = "#eae3d7"; ctx.fillRect(90, 738, 1356, 1);
      ctx.fillStyle = "#7b7163"; ctx.font = "25px Arial"; ctx.fillText(["Saved", "Updated", "Deleted"][state], 90, 799);
      ctx.textAlign = "right"; ctx.fillText("Your memory. Your choice.", w - 90, 799);
    }));
    const display = face(lid, 6.30, 3.86, screens[0], 0, 2.13, .114);
    box(lid, .046, .046, .014, .006, bezel, 0, 4.145, .089);
    const hinge=new T.Mesh(new T.CylinderGeometry(.105,.105,5.55,24),metal);
    hinge.rotation.z=Math.PI/2;hinge.position.set(0,.30,-1.27);model.add(hinge);
    box(model, 5.66, .02, 2.1, .008, matte(0x21231f), 0, .302, -.20);
    const rows = [
      ["esc","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"],
      ["`","1","2","3","4","5","6","7","8","9","0","-","=",["delete",1.6]],
      [["tab",1.5],"Q","W","E","R","T","Y","U","I","O","P","[","]"],
      [["caps",1.7],"A","S","D","F","G","H","J","K","L",";",["return",1.7]],
      [["shift",2],"Z","X","C","V","B","N","M",",",".","/",["shift",2]],
      [["ctrl",1.2],"fn",["alt",1.2],["cmd",1.2],["",5.5],["cmd",1.2],"◀","▲","▶"],
    ];
    const placements=[];
    rows.forEach((row,r)=>{
      const total=row.reduce((sum,key)=>sum+(Array.isArray(key)?key[1]:1),0),unit=5.4/total;
      let x=-2.7;
      row.forEach(key=>{
        const [label,units]=Array.isArray(key)?key:[key,1],w=unit*units;
        placements.push({label,x:x+w/2,z:-1.06+r*.35,w:w-.048,h:r===0?.18:.27});x+=w;
      });
    });
    const keys = new T.InstancedMesh(new RoundedBoxGeometry(1, .056, 1, 3, .016), matte(0x272825), placements.length);
    const dummy = new T.Object3D();
    placements.forEach((key,i)=>{dummy.position.set(key.x,.35,key.z);dummy.scale.set(key.w,1,key.h);dummy.updateMatrix();keys.setMatrixAt(i,dummy.matrix);});
    keys.castShadow = true; model.add(keys);
    const legends=texture(1536,640,ctx=>{
      ctx.clearRect(0,0,1536,640);ctx.fillStyle="#bfbfb9";ctx.textAlign="center";ctx.textBaseline="middle";
      placements.forEach(key=>{ctx.font=`${key.label.length>1?13:19}px Arial`;ctx.fillText(key.label,(key.x/5.4+.5)*1536,((key.z+1.26)/2.24)*640);});
    });
    const legendFace=face(model,5.4,2.24,legends,0,.380,-.14,-Math.PI/2);
    legendFace.material.transparent=true;legendFace.material.alphaTest=.05;legendFace.material.depthWrite=false;
    const perforations=new T.InstancedMesh(new T.CylinderGeometry(.008,.008,.006,6),matte(0x575751),288);
    for(let i=0;i<288;i++){const side=i<144?-1:1,j=i%144;dummy.position.set(side*(3.00+(j%4)*.058),.294,-.94+Math.floor(j/4)*.05);dummy.scale.set(1,1,1);dummy.updateMatrix();perforations.setMatrixAt(i,dummy.matrix);}
    model.add(perforations);
    box(model, 2.29, .016, 1.03, .007, matte(0x898a82), 0, .296, 1.70);
    const touchSurface=new T.MeshStandardMaterial({color:0xb6b7b2,metalness:.5,roughness:.58,bumpMap:grain,bumpScale:.002});
    box(model, 2.26, .016, 1.00, .007, touchSurface, 0, .310, 1.70);
    box(model,.72,.033,.016,.007,matte(0x7e8179),0,.214,2.696);
    for(let side of [-1,1])for(let j=0;j<2;j++)box(model,.012,.060,.24,.005,bezel,side*3.40,.177,-.8+j*.38);
    const lens=new T.Mesh(new T.SphereGeometry(.025,12,8),new T.MeshPhysicalMaterial({color:0x152024,metalness:.2,roughness:.08,clearcoat:1}));
    lens.position.set(0,4.145,.10);lid.add(lens);
    display.material.transparent=true;
    const incoming=face(lid,6.30,3.86,screens[1],0,2.13,.115);
    incoming.material.transparent=true;incoming.material.opacity=0;
    update = (p, mobile) => {
      const transition = p < .69 ? smooth((p-.33)/.10) : smooth((p-.69)/.10);
      display.material.map=screens[p<.69?0:1];
      incoming.material.map=screens[p<.69?1:2];
      incoming.material.opacity=transition;
      lid.rotation.x = -.12 - .10 * (reduced ? 1 : smooth(p / .25));
      model.rotation.y = reduced ? .03 : .13 - .20 * smooth(p);
      camera.position.set(mobile ? 1.3 : 2.2, 5.1, mobile ? 14.4 : 11.4);
      camera.lookAt(0, 2.1, .1);
    };
    // Dispose textures that are not on the display when the scene is released.
    display.userData.extraTextures = screens;
  }

  let width = 1, height = 1, visible = false, disposed = false, frame = 0;
  const corner=new T.Vector3(),fitObjects=[];
  model.traverse(obj=>{
    if(!obj.geometry)return;
    if(obj.isInstancedMesh)obj.computeBoundingBox();
    else if(!obj.geometry.boundingBox)obj.geometry.computeBoundingBox();
    fitObjects.push(obj);
  });
  function fitCamera() {
    model.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    let tangent=0;
    for(const obj of fitObjects){
      const bounds=obj.isInstancedMesh?obj.boundingBox:obj.geometry.boundingBox;
      for(let i=0;i<8;i++){
        corner.set(i&1?bounds.max.x:bounds.min.x,i&2?bounds.max.y:bounds.min.y,i&4?bounds.max.z:bounds.min.z).applyMatrix4(obj.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
        const depth=Math.max(.1,-corner.z);
        tangent=Math.max(tangent,Math.abs(corner.y)/depth,Math.abs(corner.x)/depth/camera.aspect);
      }
    }
    camera.fov=T.MathUtils.radToDeg(2*Math.atan(tangent/.92));
    camera.updateProjectionMatrix();
  }
  const weights=MEMORY_TYPES.map((_,i)=>i===selection.get()?1:0);
  let last = 0;
  function draw(time) {
    frame = 0; if (!visible || document.hidden || disposed) return;
    const dt = Math.min((time - last) / 1000 || .016, .04); last = time;
    let moving=false;
    for(let i=0;i<weights.length;i++){
      const target=i===selection.get()?1:0;
      weights[i]=reduced?target:T.MathUtils.lerp(weights[i],target,1-Math.exp(-dt*12));
      if(Math.abs(weights[i]-target)<.001)weights[i]=target;else moving=true;
    }
    update(clamp(progress.get()), width < 600, weights);
    fitCamera();
    renderer.render(scene, camera);
    if (moving) schedule();
  }
  function schedule() { if (!frame && visible && !disposed && !document.hidden) frame = requestAnimationFrame(draw); }
  const ro = new ResizeObserver(() => {
    width = canvas.clientWidth || 1; height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); schedule();
  }); ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule(); else { cancelAnimationFrame(frame); frame = 0; }
  }); io.observe(canvas);
  const unscroll = progress.on("change", schedule), unselect = selection.on("change", schedule);
  document.addEventListener("visibilitychange", schedule);
  return () => {
    disposed = true; cancelAnimationFrame(frame); ro.disconnect(); io.disconnect(); unscroll(); unselect();
    document.removeEventListener("visibilitychange", schedule);
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene.traverse(obj => { if (obj.geometry) geometries.add(obj.geometry); if (obj.material) materials.add(obj.material); obj.userData.extraTextures?.forEach(tx => textures.add(tx)); });
    materials.forEach(mat => { if (mat.map) textures.add(mat.map); mat.dispose(); });
    textures.add(grain);textures.forEach(tx => tx.dispose()); geometries.forEach(geo => geo.dispose()); environment.dispose(); light.shadow.dispose(); renderer.dispose();
  };
}
