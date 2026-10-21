import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { inOut, mix, pointer, rng, span } from "../welcome/gl.js";

/* The wall of apps. Since the 1980s, an app for everything: the camera starts
   close on a few tiles and pulls back until the wall of them fills the world.
   AI arrives as one more tile, copper, in the middle of it. Then every tile
   streams into one line: the conversation. Twenty glyphs, one instanced mesh
   each; matrices are rewritten only while something is actually moving. */

const COLS = 51, ROWS = 23, GAP = 1.24, RADIUS = 46;

function tileTexture(THREE, path, ai) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const c = cv.getContext("2d");
  const g = c.createLinearGradient(0, 0, 0, 256);
  if (ai) { g.addColorStop(0, "#d98c5c"); g.addColorStop(1, "#ad6236"); } else { g.addColorStop(0, "#fcfaf6"); g.addColorStop(1, "#e6ddcf"); }
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  if (ai) {
    c.fillStyle = "#fff8ef"; c.font = '600 92px Inter, "Segoe UI", sans-serif'; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("AI", 128, 134);
  } else {
    c.save(); c.translate(128 - 48, 128 - 48); c.scale(4, 4);
    c.strokeStyle = "#2e2925"; c.lineWidth = 1.5; c.lineCap = "round"; c.lineJoin = "round";
    c.stroke(new Path2D(path)); c.restore();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

export function buildWall({ THREE, renderer, scene, camera, size, invalidate }, getP, glyphs) {
  const R = rng(3);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  camera.fov = 32; camera.far = 400; camera.updateProjectionMatrix();
  // A raking key light, so every tile has a lit edge and a shaded one.
  scene.add(new THREE.HemisphereLight("#fffaf2", "#a8977e", 0.55));
  const key = new THREE.DirectionalLight("#fff1dc", 2.4); key.position.set(-14, 10, 9); scene.add(key);
  const rim = new THREE.DirectionalLight("#e8eef4", 0.5); rim.position.set(12, -4, 6); scene.add(rim);

  const geo = new RoundedBoxGeometry(1, 1, 0.22, 2, 0.2);
  const kinds = glyphs.length;
  // Every slot on the curved wall, in a fixed shuffled order of glyphs.
  const slots = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cc = c - (COLS - 1) / 2, rr = (ROWS - 1) / 2 - r;
      if (cc === 0 && rr === 0) continue; // the AI tile's place
      const th = (cc * GAP) / RADIUS;
      slots.push({
        home: new THREE.Vector3(Math.sin(th) * RADIUS, rr * GAP, -RADIUS + Math.cos(th) * RADIUS),
        rotY: -th, kind: Math.floor(R() * kinds), cc, rr, d: Math.hypot(cc, rr * 1.6), seed: R(),
      });
    }
  }
  const meshes = glyphs.map((path, k) => {
    const mine = slots.filter((s) => s.kind === k);
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ map: tileTexture(THREE, path, false), roughness: 0.5, envMapIntensity: 0.6 }), mine.length);
    m.userData.slots = mine;
    m.frustumCulled = false;
    scene.add(m);
    return m;
  });
  const ai = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tileTexture(THREE, "", true), roughness: 0.4, envMapIntensity: 0.8 }));
  scene.add(ai);

  const ptr = pointer(invalidate);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sc = new THREE.Vector3(), E = new THREE.Euler();
  let lastP = -1;

  const place = (p) => {
    // The fold: from the AI tile outward, every other tile falls back into
    // the dark and is gone, so only the AI tile is left.
    const fold = (s) => inOut(span(p, 0.6 + Math.min(1, s.d / 26) * 0.1, 0.68 + Math.min(1, s.d / 26) * 0.1));
    meshes.forEach((m) => {
      m.userData.slots.forEach((s, i) => {
        const f = fold(s);
        V.copy(s.home);
        V.z -= f * f * 40;
        E.set(0, s.rotY, 0); Q.setFromEuler(E);
        const k = Math.max(0.0001, 1 - f);
        Sc.set(k, k, k);
        M.compose(V, Q, Sc);
        m.setMatrixAt(i, M);
      });
      m.instanceMatrix.needsUpdate = true;
    });
    // The AI tile drops into its place, and stays: the camera comes to it.
    const drop = inOut(span(p, 0.33, 0.42));
    ai.position.set(0, mix(9, 0, drop), mix(4, 0, drop));
    ai.rotation.set(mix(-0.9, 0, drop), 0, mix(0.4, 0, drop));
    ai.scale.setScalar(drop > 0 ? 1 : 0.0001);
  };

  return {
    isVisible: () => getP() < .84,
    isAnimating: () => ptr.isMoving(),
    tick(t, dt) {
      const p = getP();
      ptr.step(dt);
      // Rewrite the instances only when the scroll has moved.
      // Before the AI tile arrives nothing on the wall moves, so nothing is rewritten.
      const moving = p > 0.3 || lastP > 0.3 || lastP < 0;
      if (moving && Math.abs(p - lastP) > 0.0004) { place(p); lastP = p; }
      // Close on a few tiles, then back until the wall is the world; then in, for the line.
      const back = inOut(span(p, 0.06, 0.3));
      const forward = inOut(span(p, 0.62, 0.82));
      const portrait = size.w < size.h;
      const dist = mix(mix(11, 40, back), 16, forward) * (portrait ? 1.6 : 1);
      camera.position.set(ptr.x * 0.6 * (1 - forward), mix(-1.2, -3, back) * (1 - forward) - ptr.y * 0.4, dist);
      camera.lookAt(0, mix(-0.4, -2.4, back) * (1 - forward), 0);
    },
    dispose() { ptr.dispose(); },
  };
}
