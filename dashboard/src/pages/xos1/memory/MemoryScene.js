import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const PAPER = 0xefeae1;
const clamp = v => Math.max(0, Math.min(1, v));
const smooth = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
const span = (p, a, b) => smooth((p - a) / (b - a));
const mix = T.MathUtils.lerp;
const MEMORIES = [
  ["PERSONAL", "Home in Mumbai", "Five minutes from the sea.", "12 JUL · 09:41", "#647769"],
  ["HABITS", "Sunday mornings", "A walk. Then coffee.", "08 MAR · 07:30", "#9c855c"],
  ["SKILLS", "Learn the piano.", "After my exams.", "14 JUN · 20:02", "#8b7364"],
  ["RELATIONSHIPS", "Home, on a call.", "Your brother. Every Sunday.", "19 APR · 18:12", "#8d766c"],
  ["MEDIA", "Play that again.", "The song from the drive home.", "24 MAY · 22:15", "#75828b"],
  ["YOUR STORIES", "The first time.", "Nervous. Then quietly proud.", "21 JUN · 22:16", "#97856e"],
];

function labelTexture(item, focus = false) {
  const cv = document.createElement("canvas"); cv.width = 768; cv.height = 512;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#faf6ed"; ctx.fillRect(0, 0, 768, 512);
  ctx.fillStyle = item[4]; ctx.fillRect(56, 53, 7, 7);
  ctx.font = "500 16px Arial"; ctx.fillText(focus ? "YOU SAID" : item[0], 82, 65);
  ctx.fillStyle = "#3e372e"; ctx.font = "500 45px Arial";
  ctx.fillText(focus ? "I want to learn the piano" : item[1], 56, 224);
  ctx.fillStyle = "#8b8071"; ctx.font = "22px Arial";
  ctx.font = focus ? "40px Arial" : "22px Arial";
  ctx.fillText(focus ? "after my exams." : item[2], 56, 280);
  if (focus) {
    ctx.fillStyle = "#ac9982"; ctx.font = "18px Arial";
    ctx.fillText("After your final exam. You felt hopeful.", 56, 325);
  }
  ctx.fillStyle = "#9a8d7a"; ctx.font = "15px Arial"; ctx.fillText(focus ? "14 JUNE · 8:02 PM" : item[3], 56, 454);
  const tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4;
  return tx;
}

// One instanced physical archive. No per-memory animation or React render.
// The camera renders only on scroll/resize, and only when the stage is visible.
export function createMemoryScene(canvas, progress, reduced) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(PAPER);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new T.Scene(); scene.background = new T.Color(PAPER);
  const generator=new T.PMREMGenerator(renderer),studio=new RoomEnvironment();
  const environment=generator.fromScene(studio,.04); scene.environment=environment.texture;scene.environmentIntensity=.5;
  studio.dispose();generator.dispose();
  scene.fog = new T.Fog(PAPER, 28, 100);
  const camera = new T.PerspectiveCamera(33, 1, .1, 240);
  scene.add(new T.HemisphereLight(0xfffaf0, 0xb8a68c, .85));
  const light = new T.DirectionalLight(0xfff8e8, 2);
  light.position.set(-12, 22, 10); light.castShadow = true;
  light.shadow.mapSize.set(1536, 1536);
  Object.assign(light.shadow.camera, { left:-24, right:24, top:24, bottom:-24, near:1, far:90 });
  light.shadow.bias = -.001; light.shadow.normalBias = .03;
  scene.add(light);
  const ground = new T.Mesh(new T.PlaneGeometry(500, 500), new T.MeshBasicMaterial({ color:PAPER, toneMapped:false }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.13; ground.receiveShadow = true; scene.add(ground);
  const groundShadow = new T.Mesh(ground.geometry,new T.ShadowMaterial({color:0x6b5942,opacity:.1}));
  groundShadow.rotation.x=-Math.PI/2;groundShadow.position.y=-.129;groundShadow.receiveShadow=true;scene.add(groundShadow);
  const geometry = new RoundedBoxGeometry(2.7, .075, 1.8, 2, .035);
  const bodyMaterial = new T.MeshPhysicalMaterial({ color:0xcac4b8, roughness:.32, metalness:.65, clearcoat:.1, transparent:true });
  const faceGeometry = new T.PlaneGeometry(2.62, 1.72);
  faceGeometry.rotateX(-Math.PI / 2);
  const faceMaterials = MEMORIES.map(item => new T.MeshBasicMaterial({ map:labelTexture(item), transparent:true, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-1 }));
  const positions = [];
  for (let row = -12; row < 44; row++) for (let col = -19; col <= 19; col++) {
    if (row === 2 && col === 0) continue;
    positions.push({ x:col*3.02+(row%2)*.15, y:.12+(Math.sin(col*.24+row*.18)+1)*.65, z:9-row*2.16, kind:((row+Math.abs(col))%6+6)%6, tilt:Math.sin(row*.3+col*.25)*.08 });
  }
  const archive = new T.Group(); scene.add(archive);
  const body = new T.InstancedMesh(geometry, bodyMaterial, positions.length);
  body.castShadow = true; body.receiveShadow = true; archive.add(body);
  const dummy = new T.Object3D();
  const buckets = MEMORIES.map((_, i) => positions.filter(q => q.kind === i));
  const faces = buckets.map((points, i) => {
    const mesh = new T.InstancedMesh(faceGeometry, faceMaterials[i], points.length);
    mesh.receiveShadow = true; archive.add(mesh); return mesh;
  });
  positions.forEach((q, i) => { dummy.position.set(q.x,q.y,q.z); dummy.rotation.set(q.tilt,0,0); dummy.updateMatrix(); body.setMatrixAt(i,dummy.matrix); });
  buckets.forEach((points, kind) => points.forEach((q,i) => { dummy.position.set(q.x,q.y+.041,q.z); dummy.rotation.set(q.tilt,0,0); dummy.updateMatrix(); faces[kind].setMatrixAt(i,dummy.matrix); }));
  const focus = new T.Group(); scene.add(focus);
  const focusBody = new T.Mesh(geometry, bodyMaterial.clone()); focusBody.castShadow = true; focus.add(focusBody);
  const focusMat = new T.MeshBasicMaterial({ map:labelTexture(MEMORIES[2],true), toneMapped:false });
  const focusFace = new T.Mesh(faceGeometry,focusMat); focusFace.position.y = .042; focus.add(focusFace);
  const home = new T.Vector3(0,1.4,4.68);
  const target = new T.Vector3();
  let frame = 0, visible = false, w = 1, h = 1, disposed = false, lastShadow = -1, archiveWasVisible = true;
  const draw = () => {
    frame = 0;
    if (!visible || document.hidden || disposed) return;
    const p = reduced ? .1 : clamp(progress.get());
    const expand = span(p,.12,.56), recall = span(p,.61,.85);
    const mobile = w/h < 1.1, far = 1-recall;
    const distance = mix(mobile ? 14 : 11, mobile ? 13 : 10, recall) + expand*40*far;
    const angle = mix(.52,.79,expand*far);
    camera.position.set(mix(4,14,expand)*far,distance*Math.sin(angle)+recall*4.1,4.68+distance*Math.cos(angle));
    target.set(0,mix(.4,-7,expand)*far+recall*4.1,mix(0,-9,expand)*far+recall*4.68);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.projectionMatrix.elements[9] = mix(.10,0,recall);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    const archiveOpacity = 1-span(p,.68,.87);
    archive.visible = archiveOpacity>.001;
    if(archive.visible!==archiveWasVisible){renderer.shadowMap.needsUpdate=true;archiveWasVisible=archive.visible;}
    bodyMaterial.opacity=archiveOpacity;
    faceMaterials.forEach(m=>{m.opacity=archiveOpacity;});
    focus.position.copy(home); focus.position.y += recall*2.7;
    focus.rotation.set(mix(-.10,.74,recall),0,mix(-.04,0,recall));
    focus.scale.setScalar(mix(1,mobile?1.95:2.05,recall));
    scene.fog.near = mix(26,65,expand*far); scene.fog.far = mix(75,150,expand*far);
    if(Math.abs(recall-lastShadow)>.015){renderer.shadowMap.needsUpdate=true;lastShadow=recall;}
    renderer.render(scene,camera);
  };
  const schedule = () => { if (!frame && visible && !document.hidden && !disposed) frame=requestAnimationFrame(draw); };
  const resize = () => { w=canvas.clientWidth||1; h=canvas.clientHeight||1; renderer.setSize(w,h,false); camera.aspect=w/h; schedule(); };
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible=entry.isIntersecting;
    if(visible) schedule(); else { cancelAnimationFrame(frame); frame=0; }
  }); io.observe(canvas);
  const unsubscribe = progress.on("change",schedule);
  document.addEventListener("visibilitychange",schedule);
  const lost = e => { e.preventDefault(); cancelAnimationFrame(frame); frame=0; };
  canvas.addEventListener("webglcontextlost",lost); canvas.addEventListener("webglcontextrestored",schedule);
  resize();
  return () => {
    disposed=true; cancelAnimationFrame(frame); ro.disconnect(); io.disconnect(); unsubscribe();
    document.removeEventListener("visibilitychange",schedule);
    canvas.removeEventListener("webglcontextlost",lost); canvas.removeEventListener("webglcontextrestored",schedule);
    const geometries=new Set(), materials=new Set();
    scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);if(o.isInstancedMesh)o.dispose();});
    geometries.forEach(g=>g.dispose()); materials.forEach(m=>{m.map?.dispose();m.dispose();});
    environment.dispose(); light.shadow.dispose(); renderer.dispose();
  };
}
