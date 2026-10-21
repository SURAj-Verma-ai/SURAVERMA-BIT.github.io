import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { clamp, fitWidth, inOut, lensShift, mix, orbit, pointer, rng, span } from "./gl.js";

/* Keys. A keyboard, the way people have spoken to computers for fifty years,
   in a warm product studio. Someone types on it. Then every key lets go of
   its switch, drifts, and comes down again as a voice: bars of keycaps
   standing on a still line made of the long keys, a wave running through
   them while it speaks. Then the voice goes quiet, the keys go, and the page
   says the rest.

   Every key is a modelled cap (tapered walls, a dished top, its legend printed
   into the dish), shot through a real lens on the close pass. The camera
   keeps the keys out of the words: while a line is on screen, the picture is
   held below it. */

const ROWS = [
  [["Esc", 1, "x"], ..."1234567890-=".split("").map((c) => [c, 1, "a"]), ["Backspace", 2, "m"]],
  [["Tab", 1.5, "m"], ..."QWERTYUIOP[]".split("").map((c) => [c, 1, "a"]), ["\\", 1.5, "m"]],
  [["Caps", 1.75, "m"], ..."ASDFGHJKL;'".split("").map((c) => [c, 1, "a"]), ["Enter", 2.25, "x"]],
  [["Shift", 2.25, "m"], ..."ZXCVBNM,./".split("").map((c) => [c, 1, "a"]), ["Shift", 2.75, "m"]],
  [["Ctrl", 1.25, "m"], ["Win", 1.25, "m"], ["Alt", 1.25, "m"], ["", 6.25, "a"], ["Alt", 1.25, "m"], ["Fn", 1.25, "m"], ["Menu", 1.25, "m"], ["Ctrl", 1.25, "m"]],
];
const TYPED = "where is that file";
const BARS = [1, 2, 3, 2, 4, 5, 3, 6, 5, 4, 6, 4, 3, 2, 1, 1, 1];

const LOOK = {
  bg: "#efeae1",
  caps: { a: ["#ebe6dd", "#2b2622"], m: ["#b9ae9f", "#2b2622"], x: ["#c9743f", "#fff6ec"] },
  caseColor: "#2a2826", plate: "#1b1a19", housing: "#232120", stem: "#d9824a",
  capRough: 0.6, env: 0.55,
};

/* ── The keycap ─────────────────────────────────────────────────────────── */

function ringPoints(hw, hd, r, seg = 6) {
  const pts = [];
  [[hw - r, hd - r, 0], [-(hw - r), hd - r, Math.PI / 2], [-(hw - r), -(hd - r), Math.PI], [hw - r, -(hd - r), Math.PI * 1.5]].forEach(([cx, cz, a0]) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
    }
  });
  return pts;
}

function capGeometry(THREE, w, uvOf) {
  const W = w - 0.07, D = 0.93, H = 0.36, RIM = 0.385, DISH = 0.03;
  const bottom = { hw: W / 2, hd: D / 2, r: 0.07 };
  const top = { hw: W / 2 - 0.11, hd: D / 2 - 0.1, r: 0.13 };
  const rings = [];
  for (let k = 0; k <= 5; k++) {
    const t = k / 5, s = Math.pow(t, 1.7);
    rings.push({ y: H * t, hw: mix(bottom.hw, top.hw, s), hd: mix(bottom.hd, top.hd, s), r: mix(bottom.r, top.r, s), part: "wall" });
  }
  rings.push({ y: RIM, hw: top.hw - 0.025, hd: top.hd - 0.025, r: top.r - 0.02, part: "top" });
  for (let j = 1; j <= 7; j++) {
    const s = 1 - j / 7;
    rings.push({ y: RIM - DISH * (1 - s * s), hw: (top.hw - 0.04) * s, hd: (top.hd - 0.04) * s, r: Math.max(0.001, (top.r - 0.03) * s), part: "top" });
  }
  const pos = [], uv = [], idx = [], rowStart = [];
  rings.forEach((rg) => {
    rowStart.push(pos.length / 3);
    const pts = rg.hw < 0.002 ? [[0, 0]] : ringPoints(rg.hw, rg.hd, rg.r);
    pts.forEach(([x, z]) => { pos.push(x, rg.y, z); uv.push(...uvOf(x, z)); });
    rg.n = pts.length;
  });
  const P = (i) => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
  const tri = (a, b, c, want) => {
    const A = P(a), B = P(b), C = P(c);
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2];
    const vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
    const wv = want(A);
    const d = (uy * vz - uz * vy) * wv[0] + (uz * vx - ux * vz) * wv[1] + (ux * vy - uy * vx) * wv[2];
    if (d < 0) idx.push(a, c, b); else idx.push(a, b, c);
  };
  const outward = (A) => [A[0], 0.0001, A[2]];
  const up = () => [0, 1, 0];
  for (let k = 0; k < rings.length - 1; k++) {
    const r0 = rings[k], r1 = rings[k + 1], want = r1.part === "wall" ? outward : up;
    const s0 = rowStart[k], s1 = rowStart[k + 1];
    if (r1.n === 1) { for (let i = 0; i < r0.n; i++) tri(s0 + i, s0 + ((i + 1) % r0.n), s1, want); continue; }
    for (let i = 0; i < r0.n; i++) {
      const a = s0 + i, b = s0 + ((i + 1) % r0.n), c = s1 + ((i + 1) % r1.n), d = s1 + i;
      tri(a, b, c, want); tri(a, c, d, want);
    }
  }
  for (let i = 1; i < rings[0].n - 1; i++) tri(0, i, i + 1, () => [0, -1, 0]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ── Legends, printed into an atlas ────────────────────────────────────── */

function drawReturn(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.09; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(x + s * 0.5, y - s * 0.35); ctx.lineTo(x + s * 0.5, y + s * 0.05); ctx.lineTo(x - s * 0.4, y + s * 0.05); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * 0.18, y - s * 0.2); ctx.lineTo(x - s * 0.42, y + s * 0.05); ctx.lineTo(x - s * 0.18, y + s * 0.3); ctx.stroke();
}

function buildAtlas(THREE, keys, look, U, anisotropy, invalidate) {
  const PAD = Math.round(U * 0.11), AW = Math.min(4096, Math.max(...keys.map((k) => Math.ceil(k.w * U) + PAD * 2), 2048));
  let x = 0, y = 0;
  keys.forEach((k) => {
    const cw = Math.ceil(k.w * U) + PAD * 2;
    if (x + cw > AW) { x = 0; y += U + PAD * 2; }
    k.cell = { x, y, cw, ch: U + PAD * 2 };
    x += cw;
  });
  const AH = 1 << Math.ceil(Math.log2(y + U + PAD * 2));
  const cv = document.createElement("canvas");
  cv.width = AW; cv.height = AH;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  const draw = () => {
    const ctx = cv.getContext("2d");
    keys.forEach((k) => {
      const { x: cx, y: cy, cw, ch } = k.cell;
      const [cap, ink] = look.caps[k.kind];
      ctx.fillStyle = cap; ctx.fillRect(cx, cy, cw, ch);
      if (!k.label) return;
      const small = k.label.length > 1;
      ctx.fillStyle = ink;
      ctx.font = `500 ${Math.round(U * (small ? 0.17 : 0.31))}px Inter, "Segoe UI", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (k.label === "Enter") {
        ctx.fillText("Enter", cx + cw / 2 - U * 0.16, cy + ch / 2 + U * 0.01);
        drawReturn(ctx, cx + cw / 2 + U * 0.5, cy + ch / 2, U * 0.22, ink);
      } else ctx.fillText(k.label, cx + cw / 2, cy + ch / 2 + U * 0.01);
    });
    tex.needsUpdate = true;
    invalidate();
  };
  draw();
  document.fonts?.load?.("500 40px Inter").then(draw, () => {});
  const rectFor = (k) => {
    const { x: cx, y: cy, cw, ch } = k.cell;
    return [(cx + PAD) / AW, 1 - (cy + ch - PAD) / AH, (cw - PAD * 2) / AW, (ch - PAD * 2) / AH];
  };
  return { tex, rectFor };
}

// The background colour that comes out of the tone mapper as exactly `hex`,
// so the rendered stage and the page around it are one colour.
function untoned(THREE, hex) {
  const target = new THREE.Color(hex);
  const T = [target.r, target.g, target.b];
  const neutral = (c) => {
    const start = 0.76, desat = 0.15;
    const x = Math.min(...c), off = x < 0.08 ? x - 6.25 * x * x : 0.04;
    let v = c.map((q) => q - off);
    const peak = Math.max(...v);
    if (peak < start) return v;
    const d = 1 - start, np = 1 - (d * d) / (peak + d - start);
    v = v.map((q) => (q * np) / peak);
    const g = 1 - 1 / (desat * (peak - np) + 1);
    return v.map((q) => q + (np - q) * g);
  };
  let c = [...T];
  for (let i = 0; i < 60; i++) { const o = neutral(c); c = c.map((q, j) => q + (T[j] - o[j]) * 0.9); }
  return new THREE.Color(c[0], c[1], c[2]);
}

/* ── The scene ──────────────────────────────────────────────────────────── */

export function buildKeys({ THREE, renderer, scene, camera, size, invalidate }, getP) {
  const look = LOOK;
  const R = rng(7);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const backgroundForLens = untoned(THREE, look.bg);
  const backgroundForDirect = new THREE.Color(look.bg);
  scene.background = backgroundForLens;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const keys = [];
  ROWS.forEach((row, r) => {
    let cx = 0;
    row.forEach(([label, w, kind]) => { keys.push({ label, w, kind, row: r, x: -7.5 + cx + w / 2, z: -2 + r }); cx += w; });
  });
  const atlas = buildAtlas(THREE, keys, look, 160, aniso, invalidate);
  const capMat = new THREE.MeshStandardMaterial({ map: atlas.tex, roughness: look.capRough, envMapIntensity: look.env });
  capMat.onBeforeCompile = (shader) => {
    shader.vertexShader = 'attribute vec4 instanceAtlas;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nvMapUv = vMapUv * instanceAtlas.zw + instanceAtlas.xy;');
  };
  capMat.customProgramCacheKey = () => 'keycap-atlas-instances';

  const board = new THREE.Group();
  scene.add(board);
  const shell = new THREE.Mesh(new RoundedBoxGeometry(15.55, 0.62, 5.55, 5, 0.2),
    new THREE.MeshPhysicalMaterial({ color: look.caseColor, metalness: 0.78, roughness: 0.34, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.9 }));
  shell.position.y = -0.31;
  shell.castShadow = shell.receiveShadow = true;
  board.add(shell);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(15.1, 0.02, 5.1), new THREE.MeshStandardMaterial({ color: look.plate, roughness: 0.7, metalness: 0.4 }));
  plate.position.y = 0.005;
  plate.receiveShadow = true;
  board.add(plate);
  const housing = new THREE.InstancedMesh(new RoundedBoxGeometry(0.62, 0.2, 0.62, 2, 0.05), new THREE.MeshStandardMaterial({ color: look.housing, roughness: 0.55 }), keys.length);
  const stemMat = new THREE.MeshStandardMaterial({ color: look.stem, roughness: 0.42 });
  const stemA = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.16, 0.05), stemMat, keys.length);
  const stemB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.16, 0.17), stemMat, keys.length);
  const m4 = new THREE.Matrix4();
  keys.forEach((k, i) => {
    m4.makeTranslation(k.x, 0.1, k.z); housing.setMatrixAt(i, m4);
    m4.makeTranslation(k.x, 0.27, k.z); stemA.setMatrixAt(i, m4); stemB.setMatrixAt(i, m4);
  });
  [housing, stemA, stemB].forEach((m) => { m.castShadow = m.receiveShadow = true; board.add(m); });
  const boardMats = [shell.material, plate.material, housing.material, stemMat];

  const REST_Y = 0.2;
  keys.forEach((k, i) => {
    // Lightweight transforms retain every cap's choreography. Caps of equal
    // width share one instanced draw, with their own atlas legends.
    const mesh = new THREE.Object3D();
    mesh.position.set(k.x, REST_Y, k.z);
    mesh.userData.i = i;
    Object.assign(k, { mesh, seed: R(), delay: (k.x + 7.5) / 15 });
    k.cloud = new THREE.Vector3(k.x * 1.02 + (R() - 0.5) * 1.6, 2.4 + R() * 3.2 + (k.z + 2) * 0.25, k.z * 0.8 + (R() - 0.5) * 2.4);
    k.cloudQ = new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * 1.8, (R() - 0.5) * 1.6, (R() - 0.5) * 1.8));
  });
  const capBatches = [...new Set(keys.map(k => k.w))].map(width => {
    const mine = keys.filter(k => k.w === width);
    const geo = capGeometry(THREE, width, (x, z) => [clamp(x / width + .5, .01, .99), 1 - clamp(z + .5, .01, .99)]);
    geo.setAttribute('instanceAtlas', new THREE.InstancedBufferAttribute(new Float32Array(mine.flatMap(atlas.rectFor)), 4));
    const batch = new THREE.InstancedMesh(geo, capMat, mine.length);
    batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    batch.castShadow = batch.receiveShadow = true;
    batch.frustumCulled = false;
    batch.userData.keys = mine;
    scene.add(batch);
    return batch;
  });

  // The voice: the long keys lie still as its line; the rest stand in bars on it.
  const longKeys = keys.filter((k) => k.w >= 1.5).sort((a, b) => a.x - b.x);
  const shortKeys = keys.filter((k) => k.w < 1.5).sort((a, b) => a.x - b.x || a.row - b.row);
  const LINE_Y = 1.0, STEP = 1.04, STRETCH = 0.46;
  const lineW = longKeys.reduce((s, k) => s + k.w, 0) + (longKeys.length - 1) * 0.12;
  let lx = -lineW / 2;
  longKeys.forEach((k, li) => { k.wave = { x: lx + k.w / 2, bar: -1, j: 0, li }; lx += k.w + 0.12; });
  let si = 0;
  BARS.forEach((n, c) => {
    for (let j = 0; j < n && si < shortKeys.length; j++, si++) shortKeys[si].wave = { x: (c - (BARS.length - 1) / 2) * 1.16, bar: c, j };
  });
  // The tallest the voice ever stands, so the framing never chases the wave.
  keys.forEach((k) => { k.wave.top = k.wave.bar < 0 ? LINE_Y : LINE_Y + STEP + k.wave.j * (STEP + STRETCH); });
  const WAVE_MID = LINE_Y + 3.4;
  const faceQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  const restQ = new THREE.Quaternion();

  const typed = [];
  TYPED.split("").forEach((ch, j) => {
    const k = ch === " " ? keys.find((q) => q.w > 6) : keys.find((q) => q.label.toLowerCase() === ch);
    if (k) typed.push({ k, at: 0.15 + j * (0.14 / TYPED.length) });
  });

  // Light: a soft studio sky, and one warm key light low on the left.
  scene.add(new THREE.HemisphereLight("#fff8ee", "#b9a991", 0.55));
  const sun = new THREE.DirectionalLight("#fff1dc", 2.6);
  sun.position.set(-13, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 60 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#e9eef2", 0.35);
  fill.position.set(9, 5, 6);
  scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.ShadowMaterial({ color: "#3b2a1c", opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.62; floor.receiveShadow = true;
  scene.add(floor);

  // The lens.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = new BokehPass(scene, camera, { focus: 20, aperture: 0.002, maxblur: 0.008 });
  composer.addPass(bokeh);
  composer.addPass(new OutputPass());

  // The camera's path. A shot frames a width (fit) or sits at a distance (dist).
  const SHOTS = [
    { p: 0, elev: 46, azim: -18, t: [0, 0, 0.3], fit: [16, 0.74], ap: 1.2 },
    { p: 0.12, elev: 40, azim: -12, t: [0, 0, 0.3], fit: [16, 0.78], ap: 1.4 },
    { p: 0.3, elev: 16, azim: -32, t: [-2.6, 0.5, 0.4], dist: 9.5, ap: 1.9 },
    { p: 0.45, elev: 14, azim: -6, t: [0, 3, 0], fit: [21, 0.9], ap: 1.4 },
    { p: 0.62, elev: 2.5, azim: -3, t: [0, WAVE_MID, 0], fit: [22.5, 0.9], ap: 0.5 },
    // While it speaks, the camera eases in: a slow push, square on by the end.
    { p: 0.8, elev: 2, azim: 0, t: [0, WAVE_MID, 0], fit: [22.5, 0.93], ap: 0.5 },
    { p: 1, elev: 2, azim: 0, t: [0, WAVE_MID, 0], fit: [22.5, 0.93], ap: 0.5 },
  ];
  // The full board needs side clearance on portrait screens. Increasing the
  // filled fraction here used to zoom in and crop both ends on phones.
  const distOf = (s, portrait) => (s.dist ? s.dist * (portrait ? 1.8 : 1) : fitWidth(camera, s.fit[0], portrait ? Math.min(.88, s.fit[1] + .08) : s.fit[1]));
  const shot = (p, portrait) => {
    let i = 0;
    while (i < SHOTS.length - 2 && p > SHOTS[i + 1].p) i++;
    const A = SHOTS[i], B = SHOTS[i + 1], e = inOut(span(p, A.p, B.p));
    return {
      elev: mix(A.elev, B.elev, e), azim: mix(A.azim, B.azim, e),
      t: [mix(A.t[0], B.t[0], e), mix(A.t[1], B.t[1], e), mix(A.t[2], B.t[2], e)],
      dist: mix(distOf(A, portrait), distOf(B, portrait), e), ap: mix(A.ap, B.ap, e),
    };
  };
  // Where words are on screen, the picture stays below them: the lowest NDC
  // y the top of the keys may reach, by scroll. (Words sit in the top third.)
  const ZONES = [[0, 0.11, 0.2], [0.12, 0.34, 0.3], [0.63, 0.94, 0.32]];
  const RAMP = 0.06;
  const ceiling = (p) => {
    let c = 2;
    ZONES.forEach(([a, b, lim]) => { const w = inOut(span(p, a - RAMP, a)) * (1 - inOut(span(p, b, b + RAMP))); c = Math.min(c, mix(2, lim, w)); });
    return c;
  };

  const target = new THREE.Vector3();
  const ptr = pointer(invalidate);
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const capMeshes = capBatches;
  const press = new Float32Array(keys.length);
  let pressMoving = false;
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3(), w3 = new THREE.Vector3(), camUp = new THREE.Vector3();
  const tilt = new THREE.Quaternion(), XAXIS = new THREE.Vector3(1, 0, 0);
  let shift = 0.2;
  const absent = new THREE.Matrix4().makeScale(0, 0, 0);

  const placeKeys = (p, t, dt, hover) => {
    // While it speaks, a wave runs through the bars, left to right; the line stays put.
    const speaking = span(p, 0.62, 0.67) * (1 - span(p, 0.77, 0.8));
    const swell = 0.75 + 0.25 * Math.sin(t * 0.9);
    pressMoving = false;
    keys.forEach((k, i) => {
      let down0 = hover === i ? 1 : 0;
      typed.forEach((s) => { if (s.k === k) down0 = Math.max(down0, 1 - Math.abs(p - s.at) / 0.008); });
      press[i] += (clamp(down0) - press[i]) * Math.min(1, dt * 18);
      if (Math.abs(clamp(down0) - press[i]) > .0001) pressMoving = true;
      const drop = 1 - clamp((t - 0.2 - (Math.abs(k.x) / 7.5) * 0.5 - k.seed * 0.15) / 0.9);
      const a = inOut(span(p, 0.33 + k.delay * 0.08, 0.43 + k.delay * 0.08));
      // The line lands first, then each bar builds on it, bottom key first, left to right.
      const b = k.wave.bar < 0
        ? inOut(span(p, 0.46 + k.wave.li * 0.006, 0.54 + k.wave.li * 0.006))
        : inOut(span(p, 0.52 + k.wave.bar * 0.004 + k.wave.j * 0.006, 0.59 + k.wave.bar * 0.004 + k.wave.j * 0.006));
      k.form = b;

      v.set(k.x, REST_Y - press[i] * 0.14 + drop * drop * 3.2, k.z).lerp(k.cloud, a);
      v.y += Math.sin(a * Math.PI) * 1.4;
      const drift = a * (1 - b);
      v.x += Math.sin(t * 0.5 + k.seed * 9) * 0.22 * drift;
      v.y += Math.sin(t * 0.7 + k.seed * 13) * 0.28 * drift;
      q.copy(restQ).slerp(k.cloudQ, a);
      if (b > 0) {
        let y = LINE_Y;
        if (k.wave.bar >= 0) {
          const c = k.wave.bar;
          const wv = 0.5 + 0.5 * Math.sin(t * 2.7 - c * 0.62) * swell + 0.12 * Math.sin(t * 6.1 + c * 1.9);
          y = LINE_Y + STEP + k.wave.j * (STEP + STRETCH * speaking * clamp(wv));
        }
        v.lerp(w3.set(k.wave.x, y, 0), b);
        v.z += Math.sin(b * Math.PI) * 2.2;
        q.slerp(faceQ, b);
      }
      // Then the voice has said it: the whole of it drops away down the frame,
      // left to right, the way the board went, as the words rise in.
      const xn = (k.wave.x + 11) / 22;
      const fall = span(p, 0.78 + xn * 0.025, 0.835 + xn * 0.025);
      if (fall > 0) {
        const e = fall * fall * (3 - 2 * fall) * fall;
        v.y -= e * 22;
        q.multiply(tilt.setFromAxisAngle(XAXIS, e * 0.5 * (k.seed - 0.3)));
      }
      k.mesh.visible = fall < 1;
      k.mesh.position.copy(v);
      k.mesh.quaternion.copy(q);
      k.mesh.scale.setScalar(1);
    });
    capBatches.forEach(batch => {
      batch.userData.keys.forEach((k, i) => {
        k.mesh.updateMatrix(); batch.setMatrixAt(i, k.mesh.visible ? k.mesh.matrix : absent);
      });
      batch.instanceMatrix.needsUpdate = true;
      batch.boundingSphere = null;
    });
  };

  return {
    isVisible: () => getP() < .87,
    isAnimating(t) {
      const p = getP();
      return t < 2 || ptr.isMoving() || pressMoving
        || (p > .33 && p < .8);
    },
    tick(t, dt) {
      const p = getP();
      ptr.step(dt);
      const portrait = size.w < size.h;
      const c = shot(p, portrait);
      target.set(...c.t);
      const look = 1 - span(p, 0.3, 0.5);
      orbit(camera, target, c.dist, c.elev - ptr.y * 2.2 * look, c.azim + ptr.x * 4 * look);

      let hover = -1;
      if (p < 0.3 && ptr.active) {
        lensShift(camera, shift);
        ndc.set((ptr.cx / size.w) * 2 - 1, -(ptr.cy / size.h) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(capMeshes, false)[0];
        if (hit) hover = hit.object.userData.keys[hit.instanceId].mesh.userData.i;
      }
      placeKeys(p, t, dt, hover);

      // Hold the picture below the words. As each key reaches the voice, count
      // it at its tallest reach, not where the wave happens to be, so nothing
      // bobs; and everything here follows the scroll exactly, so nothing jumps.
      const measure = () => {
        lensShift(camera, 0);
        camera.updateMatrixWorld();
        camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
        let top = -2, bot = 2;
        keys.forEach((k) => {
          if (!k.mesh.visible || k.mesh.scale.x < 0.05) return;
          w3.copy(k.mesh.position);
          w3.y = mix(w3.y, Math.max(w3.y, k.wave.top), k.form);
          const r = 0.62 * k.mesh.scale.x;
          v.copy(w3).addScaledVector(camUp, r).project(camera);
          if (v.z < 1) top = Math.max(top, v.y);
          v.copy(w3).addScaledVector(camUp, -r).project(camera);
          if (v.z < 1) bot = Math.min(bot, v.y);
        });
        return [top, bot];
      };
      let [top, bot] = measure();
      const lim = ceiling(p);
      const floorY = portrait ? -0.86 : -0.9;
      // Once the voice is forming, it must fit whole on screen (under the words
      // when there are words): if it doesn't, the camera steps back. This is
      // what keeps a wide window from cropping it at the bottom.
      const fitting = span(p, 0.5, 0.58);
      const roof = Math.min(lim, 0.86);
      if (fitting > 0 && top - bot > roof - floorY) {
        const m = mix(1, (top - bot) / (roof - floorY), fitting);
        orbit(camera, target, c.dist * m, c.elev, c.azim);
        [top, bot] = measure();
      }
      let want = Math.max(portrait ? 0.08 : 0.12, top - lim);
      shift = want;
      lensShift(camera, shift);

      // The lens, on the close pass: focus on what the shot is about.
      bokeh.enabled = p > 0.16 && p < 0.44;
      if (bokeh.enabled) {
        bokeh.uniforms.focus.value = camera.position.distanceTo(target);
        bokeh.uniforms.aperture.value = 0.0012 * c.ap * (portrait ? 0.7 : 1);
      }
      // The empty board sinks away below the frame as the camera rises to the
      // voice, and is only let go of once it is out of sight.
      const sink = inOut(span(p, 0.42, 0.6));
      board.position.y = -sink * 9;
      const gone = span(p, 0.57, 0.62);
      boardMats.forEach((m) => { m.opacity = 1 - gone; m.transparent = gone > 0; m.depthWrite = gone === 0; });
      board.visible = gone < 1;
      // The shadows on the floor go before the line comes down to the words.
      floor.material.opacity = 0.16 * (1 - span(p, 0.77, 0.82));
    },
    resize({ w, h }) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); },
    // The cinematic close-up needs depth of field. Other shots use the same
    // tone mapper directly, avoiding extra full-screen render targets/passes.
    render() {
      scene.background = bokeh.enabled ? backgroundForLens : backgroundForDirect;
      if (bokeh.enabled) composer.render(); else renderer.render(scene, camera);
    },
    dispose() { ptr.dispose(); composer.passes.forEach(pass => pass.dispose()); composer.dispose(); },
  };
}
