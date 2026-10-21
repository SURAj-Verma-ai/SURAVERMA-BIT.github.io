import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* The 3D runtime behind the welcome scenes. One renderer per scene, drawn
   only while its section is on screen, at no more than twice the CSS pixels.
   A scene module gets the renderer, scene and camera, and returns a frame
   function; everything it made is disposed of when the page leaves. */

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const span = (p, a, b) => clamp((p - a) / (b - a));
export const smooth = (t) => t * t * (3 - 2 * t);
export const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const outCubic = (t) => 1 - Math.pow(1 - t, 3);
export const outBack = (t, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

// Seeded random, so every visit builds the same scene.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Distance at which a width `w` (world units) fills `frac` of the view. */
export function fitWidth(camera, w, frac) {
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  return w / (frac * h * camera.aspect);
}
export function fitHeight(camera, hgt, frac) {
  return hgt / (frac * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
}

/** Place a camera on a sphere around `target`: elevation and azimuth in degrees. */
export function orbit(camera, target, dist, elev, azim) {
  const e = THREE.MathUtils.degToRad(elev), a = THREE.MathUtils.degToRad(azim);
  camera.position.set(
    target.x + dist * Math.cos(e) * Math.sin(a),
    target.y + dist * Math.sin(e),
    target.z + dist * Math.cos(e) * Math.cos(a),
  );
  camera.lookAt(target);
}

/** Slide the picture up or down without turning the camera (a lens shift):
 *  +shift moves what you see down the screen. Call after any projection change. */
export function lensShift(camera, shift) {
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[9] = shift;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

export function createStage(canvas, build, { fov = 30, env = true, shadows = false, exposure = 1, progress, still = false } = {}) {
  let renderer, scene, camera, frame, pmrem, environment, ro;
  let raf = 0, last = 0, elapsed = 0, visible = false, disposed = false, painted = false, idle = null;
  const size = { w: 1, h: 1 };
  const schedule = () => {
    if (!disposed && visible && !document.hidden && frame && !raf) raf = requestAnimationFrame(loop);
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
  const loop = (now) => {
    raf = 0;
    if (disposed || !visible || document.hidden) { last = 0; return; }
    if (frame.isVisible?.() === false) {
      // Clear once on departure; no blank GPU pass for every remaining scroll frame.
      if (painted) { renderer.clear(); painted = false; }
      last = 0; return;
    }
    const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60;
    last = now; elapsed += dt;
    frame.tick(elapsed, dt);
    if (frame.render) frame.render(); else renderer.render(scene, camera);
    painted = true;
    // Scroll scenes redraw on input. Only actual motion keeps the loop alive.
    if (!still && (frame.isAnimating ? frame.isAnimating(elapsed) : !progress)) schedule();
    else last = 0;
  };
  const initialize = () => {
    if (disposed || document.hidden) return;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = exposure;
    renderer.setClearColor(0x000000, 0);
    if (shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 400);
    if (env) {
      pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
      room.dispose();
    }

    frame = build({ THREE, renderer, scene, camera, size, canvas, invalidate: schedule });

    const resize = () => {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      if (w === size.w && h === size.h) return;
      size.w = w; size.h = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frame.resize?.(size);
      schedule();
    };
    resize();
    ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // Warm shaders with parallel compilation while the adjacent scene is prepared.
    // Geometry, materials, resolution and visible animation remain unchanged.
    renderer.compileAsync(scene, camera).catch(() => {});
  };
  const cancelPrepare = () => {
    if (idle !== null) window.cancelIdleCallback?.(idle);
    idle = null;
  };
  // Prepare the adjacent scene, but animate only the actual viewport.
  const prepare = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { cancelPrepare(); return; }
    if (!renderer && idle === null && window.requestIdleCallback) {
      idle = window.requestIdleCallback(() => { idle = null; if (!renderer) initialize(); });
    }
  }, { rootMargin: `${window.innerHeight}px 0px` });
  prepare.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { cancelPrepare(); if (!renderer) initialize(); schedule(); }
    else stop();
  });
  io.observe(canvas);
  const unsubscribe = still ? undefined : progress?.on("change", schedule);
  const visibility = () => {
    if (document.hidden) stop();
    else if (visible) { if (!renderer) initialize(); schedule(); }
  };
  document.addEventListener("visibilitychange", visibility);

  return () => {
    disposed = true; stop(); cancelPrepare(); unsubscribe?.();
    document.removeEventListener("visibilitychange", visibility);
    ro?.disconnect();
    io.disconnect(); prepare.disconnect();
    frame?.dispose?.();
    scene?.traverse((o) => {
      o.geometry?.dispose();
      if (o.isLight) o.shadow?.dispose();
      if (o.isInstancedMesh) o.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => {
        Object.values(m).forEach((v) => v && v.isTexture && v.dispose());
        m.dispose();
      });
    });
    environment?.dispose();
    pmrem?.dispose();
    renderer?.dispose();
  };
}

/** A pointer, smoothed, in -1..1 across the window. Ignores moves that aren't moves. */
export function pointer(invalidate = () => {}) {
  const p = { x: 0, y: 0, tx: 0, ty: 0, cx: -1, cy: -1, active: false };
  const move = (e) => {
    if (e.clientX === p.cx && e.clientY === p.cy) return;
    p.cx = e.clientX; p.cy = e.clientY; p.active = true;
    p.tx = (e.clientX / window.innerWidth) * 2 - 1;
    p.ty = (e.clientY / window.innerHeight) * 2 - 1;
    invalidate();
  };
  window.addEventListener("pointermove", move, { passive: true });
  p.step = (dt) => {
    const k = 1 - Math.exp(-dt * 4);
    p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k;
  };
  p.dispose = () => window.removeEventListener("pointermove", move);
  p.isMoving = () => Math.abs(p.tx - p.x) > .0001 || Math.abs(p.ty - p.y) > .0001;
  return p;
}
