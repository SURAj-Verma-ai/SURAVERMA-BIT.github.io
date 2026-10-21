import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { clamp, inOut, mix, orbit, pointer, rng, span } from "../welcome/gl.js";

/* City. A city at night from the air, out to the horizon. Most of it is dark:
   a few cold windows, the street lights, traffic. Then one window lights,
   warm, at the centre, and the warmth spreads out from it street by street
   until the whole city is lit. Then morning comes up through the haze and
   washes it into the paper the page continues on.

   Every building is one instance of one box; its windows are drawn by the
   shader from where it stands, so the city is a single draw. */

const LOT = 6;
const N = 90;
const STREET = 4;

const BUILDING_VS = /* glsl */ `
  attribute float aSeed;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vSeed;
  varying float vDepth;
  void main() {
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vSeed = aSeed;
    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const BUILDING_FS = /* glsl */ `
  uniform float uRadius;
  uniform vec3 uFog;
  uniform float uFogDensity;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vSeed;
  varying float vDepth;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 n = normalize(vNormal);
    float moon = 0.35 + 0.65 * max(dot(n, normalize(vec3(-0.45, 0.7, 0.55))), 0.0);
    vec3 col = vec3(0.011, 0.013, 0.019) * moon;
    float d = length(vWorld.xz);
    float inside = smoothstep(uRadius, uRadius - 36.0, d);
    if (abs(n.y) < 0.5) {
      float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
      vec2 cell = vec2(u / 0.95, (vWorld.y - 0.8) / 1.25);
      vec2 id = floor(cell);
      vec2 f = fract(cell);
      float win = step(0.24, f.x) * step(f.x, 0.76) * step(0.26, f.y) * step(f.y, 0.74) * step(0.0, cell.y);
      float px = max(fwidth(cell.x), fwidth(cell.y));
      float aa = clamp(1.5 - px * 2.0, 0.0, 1.0);
      // Whole floors tend to be lit together, the way offices and homes are.
      float floorOn = hash(vec2(id.y, vSeed * 91.0));
      float r = hash(id + vec2(vSeed * 31.7, sign(n.x + n.z) * 7.3));
      float density = mix(0.07, 0.36, inside);
      float lit = step(r, density) * step(0.25 * (1.0 - inside), floorOn);
      float front = exp(-pow((d - uRadius) / 10.0, 2.0)) * step(r, 0.85) * step(2.0, uRadius);
      vec3 warm = mix(vec3(1.0, 0.56, 0.24), vec3(1.0, 0.8, 0.52), hash(id * 1.7 + vSeed)) * 2.1;
      vec3 cold = mix(vec3(0.42, 0.55, 0.85), vec3(0.75, 0.82, 0.95), hash(id + 3.1)) * 1.1;
      vec3 lamp = mix(cold, warm, inside);
      float coverage = mix(density * 0.12, win * lit, aa);
      col += vec3(0.008, 0.011, 0.02) * mix(0.3, win, aa);
      col += lamp * coverage;
      col += vec3(1.0, 0.86, 0.6) * 3.2 * front * mix(0.3, win, aa);
    } else if (n.y > 0.5) {
      col += vec3(0.03, 0.018, 0.008) * inside;
    }
    float fogF = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    gl_FragColor = vec4(mix(col, uFog, clamp(fogF, 0.0, 1.0)), 1.0);
  }
`;

// Points: cars, street lights and the red lights on top of the towers.
const POINT_VS = /* glsl */ `
  attribute vec4 aRoad;   // axis, street, lane, direction  (cars)
  attribute vec4 aMove;   // speed, phase, kind, size
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uSpan;
  uniform float uScale;
  varying vec3 vColor;
  varying float vDepth;
  varying float vBlink;
  void main() {
    vec3 p = position;
    if (aMove.z < 0.5) {
      float t = mod(aMove.y + uTime * aMove.x, 2.0 * uSpan) - uSpan;
      float along = t * aRoad.w;
      p = aRoad.x < 0.5 ? vec3(along, 0.4, aRoad.y + aRoad.z) : vec3(aRoad.y + aRoad.z, 0.4, along);
    }
    vBlink = aMove.z > 1.5 ? step(0.55, fract(uTime * 0.5 + aMove.y)) : 1.0;
    vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    vColor = aColor;
    gl_PointSize = clamp(uScale * aMove.w / vDepth, 1.0, 10.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const POINT_FS = /* glsl */ `
  uniform vec3 uFog;
  uniform float uFogDensity;
  varying vec3 vColor;
  varying float vDepth;
  varying float vBlink;
  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    float fogF = clamp(1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth), 0.0, 1.0);
    gl_FragColor = vec4(vColor * a * vBlink * (1.0 - fogF), 1.0);
  }
`;

const SKY_FS = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  varying vec3 vDir;
  uniform float uStars;
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uZenith, smoothstep(-0.02, 0.45, h));
    col += uGlow * exp(-max(h, 0.0) * 7.0);
    // Stars, thinning toward the city's glow at the horizon.
    vec3 cell = floor(d * 380.0);
    float s = step(0.9972, hash3(cell)) * smoothstep(0.06, 0.4, h);
    col += vec3(0.85, 0.9, 1.0) * s * (0.35 + 0.65 * hash3(cell + 7.0)) * uStars;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// The sky and the haze through the night and into the morning.
// The sky through the night, toward the first light; the fog always matches the horizon.
const KEYS = [
  { t: 0, zen: "#020309", hor: "#141a2b", glow: "#2e2015", fog: "#141a2b" },
  { t: 0.5, zen: "#04060d", hor: "#191a25", glow: "#2a1c13", fog: "#191a25" },
  { t: 1, zen: "#070912", hor: "#1d1c27", glow: "#3a2519", fog: "#1d1c27" },
];

export function buildCity({ THREE, renderer, scene, camera, size }, getP) {
  const R = rng(11);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  camera.far = 4000;
  camera.updateProjectionMatrix();

  const lin = (hex) => new THREE.Color(hex);
  const keys = KEYS.map((k) => ({ t: k.t, zen: lin(k.zen), hor: lin(k.hor), glow: lin(k.glow), fog: lin(k.fog) }));

  const uniforms = {
    uRadius: { value: 0 },
    uFog: { value: keys[0].fog.clone() },
    uFogDensity: { value: 0.0016 },
    uTime: { value: 0 },
    uSpan: { value: N * LOT },
    uScale: { value: 900 },
  };

  // The sky.
  const skyU = { uZenith: { value: keys[0].zen.clone() }, uHorizon: { value: keys[0].hor.clone() }, uGlow: { value: keys[0].glow.clone() }, uStars: { value: 1 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false,
    vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
    fragmentShader: SKY_FS,
  }));
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  scene.add(sky);

  // Buildings: a downtown, a few landmarks, then the city thinning to houses.
  const lots = [];
  const towers = [];
  for (let i = -N; i <= N; i++) {
    for (let j = -N; j <= N; j++) {
      if (i % STREET === 0 || j % STREET === 0) continue;
      const x = i * LOT, z = j * LOT;
      const d = Math.hypot(x, z);
      if (d > N * LOT) continue;
      const core = Math.exp(-Math.pow(d / 85, 2));
      const mid = Math.exp(-Math.pow((d - 190) / 55, 2)) * 0.3;
      const r = R();
      let h = 3 + r * r * (7 + core * 58 + mid * 24) + core * 12 * R();
      let w = LOT * (0.64 + R() * 0.2), dd = LOT * (0.64 + R() * 0.2);
      // A few landmarks downtown: taller, and broad enough to stand as towers, not needles.
      if (core > 0.5 && R() < 0.03) { h = 88 + R() * 34; w = dd = LOT * 0.9; }
      lots.push({ x: x + (R() - 0.5) * 0.5, z: z + (R() - 0.5) * 0.5, w, d: dd, h });
      if (h > 70) towers.push([x, h + 1.2, z]);
    }
  }
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);
  const seeds = new Float32Array(lots.length);
  const city = new THREE.InstancedMesh(box, new THREE.ShaderMaterial({ vertexShader: BUILDING_VS, fragmentShader: BUILDING_FS, uniforms }), lots.length);
  const m = new THREE.Matrix4();
  lots.forEach((l, i) => { m.makeScale(l.w, l.h, l.d).setPosition(l.x, 0, l.z); city.setMatrixAt(i, m); seeds[i] = R(); });
  box.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  city.frustumCulled = false;
  scene.add(city);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `varying vec3 vW; varying float vDepth; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; vec4 mv = viewMatrix * wp; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uFog; uniform float uFogDensity; uniform float uRadius;
      varying vec3 vW; varying float vDepth;
      void main(){
        float d = length(vW.xz);
        vec3 col = vec3(0.006, 0.007, 0.01) + vec3(0.04, 0.022, 0.008) * smoothstep(uRadius, uRadius - 70.0, d);
        float fogF = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
        gl_FragColor = vec4(mix(col, uFog, clamp(fogF, 0.0, 1.0)), 1.0);
      }`,
  }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Cars both ways on every street; sodium lamps along them; red lights on the towers.
  const pts = [];
  const CARS = 3400, SPAN = N * LOT;
  for (let c = 0; c < CARS; c++) {
    const axis = R() < 0.5 ? 0 : 1;
    const street = Math.round((R() - 0.5) * 2 * (N / STREET)) * STREET * LOT;
    const dir = R() < 0.5 ? 1 : -1;
    const head = R() < 0.5;
    pts.push({ pos: [0, 0, 0], road: [axis, street, dir * 0.9, dir], move: [5 + R() * 10, R() * SPAN * 2, 0, 1.4], color: head ? [1.6, 1.45, 1.2] : [1.4, 0.18, 0.1] });
  }
  for (let s = -N; s <= N; s += STREET) {
    for (let a = -N * LOT; a <= N * LOT; a += LOT * 1.5) {
      [[s * LOT + 2.6, a], [a, s * LOT + 2.6]].forEach(([x, z]) => {
        if (Math.hypot(x, z) > N * LOT) return;
        pts.push({ pos: [x, 3, z], road: [0, 0, 0, 0], move: [0, 0, 1, 1.1], color: [1.1, 0.55, 0.2] });
      });
    }
  }
  towers.forEach(([x, y, z]) => pts.push({ pos: [x, y, z], road: [0, 0, 0, 0], move: [0, R(), 2, 2.2], color: [2.4, 0.15, 0.08] }));
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.Float32BufferAttribute(pts.flatMap((q) => q.pos), 3));
  pg.setAttribute("aRoad", new THREE.Float32BufferAttribute(pts.flatMap((q) => q.road), 4));
  pg.setAttribute("aMove", new THREE.Float32BufferAttribute(pts.flatMap((q) => q.move), 4));
  pg.setAttribute("aColor", new THREE.Float32BufferAttribute(pts.flatMap((q) => q.color), 3));
  const lights = new THREE.Points(pg, new THREE.ShaderMaterial({
    vertexShader: POINT_VS, fragmentShader: POINT_FS, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  lights.frustumCulled = false;
  scene.add(lights);

  // Light bleeds from the bright windows the way it does on a lens.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.75, 0.5, 0.72);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const SHOTS = [
    { p: 0, t: [0, 34, 0], dist: 560, elev: 6.5, azim: 26 },
    { p: 0.12, t: [0, 30, 0], dist: 480, elev: 6.5, azim: 20 },
    { p: 0.33, t: [0, 40, 0], dist: 360, elev: 3.5, azim: 8 },
    { p: 0.58, t: [0, 0, 0], dist: 470, elev: 19, azim: -8 },
    { p: 0.7, t: [0, 24, 0], dist: 600, elev: 13, azim: -22 },
    // Last, a slow push toward the lit skyline.
    { p: 0.88, t: [0, 50, 0], dist: 330, elev: 7, azim: -32 },
    { p: 1, t: [0, 50, 0], dist: 300, elev: 7, azim: -34 },
  ];
  const target = new THREE.Vector3();
  const ptr = pointer();
  const c1 = new THREE.Color(), c2 = new THREE.Color();
  const blend = (field, t, out) => {
    const i = t <= keys[1].t ? 0 : 1;
    const e = clamp((t - keys[i].t) / (keys[i + 1].t - keys[i].t));
    return out.copy(keys[i][field]).lerp(keys[i + 1][field], e);
  };

  return {
    tick(t, dt) {
      const p = getP();
      ptr.step(dt);
      let i = 0;
      while (i < SHOTS.length - 2 && p > SHOTS[i + 1].p) i++;
      const A = SHOTS[i], B = SHOTS[i + 1], e = inOut(span(p, A.p, B.p));
      const portrait = size.w < size.h;
      target.set(mix(A.t[0], B.t[0], e), mix(A.t[1], B.t[1], e), mix(A.t[2], B.t[2], e));
      orbit(camera, target, mix(A.dist, B.dist, e) * (portrait ? 1.45 : 1),
        mix(A.elev, B.elev, e) + (portrait ? 3 : 0) - ptr.y * 1.2, mix(A.azim, B.azim, e) + ptr.x * 2.5 + t * 0.12);

      const spread = span(p, 0.4, 0.75);
      uniforms.uRadius.value = p < 0.385 ? 0 : 4 + Math.pow(spread, 1.7) * 560;
      const dawn = span(p, 0.4, 0.75) * 0.5;
      blend("zen", dawn, c1); skyU.uZenith.value.copy(c1);
      blend("hor", dawn, c2); skyU.uHorizon.value.copy(c2);
      blend("glow", dawn, c1); skyU.uGlow.value.copy(c1).multiplyScalar(mix(0.6 + 0.6 * span(p, 0.4, 0.75), 1, dawn));
      // The haze is the colour of the sky right at the horizon, glow included, so they meet without a seam.
      uniforms.uFog.value.copy(c2).add(skyU.uGlow.value);
      // Looking straight down there is less air between you and the city.
      uniforms.uFogDensity.value = 0.0017;
      uniforms.uTime.value = t;
      uniforms.uScale.value = size.h * 1.2;

    },
    resize({ w, h }) {
      const r = renderer.getPixelRatio();
      composer.setPixelRatio(r);
      composer.setSize(w, h);
      // The glow is soft anyway: work it out at half size.
      bloom.setSize(Math.round((w * r) / 2), Math.round((h * r) / 2));
    },
    render() { composer.render(); },
    dispose() { ptr.dispose(); composer.dispose(); },
  };
}
