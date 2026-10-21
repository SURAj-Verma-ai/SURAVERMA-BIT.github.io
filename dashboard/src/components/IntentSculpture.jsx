import { useEffect, useRef, useState } from "react";
import "./IntentSculpture.css";

/** Decorative physical forms. Nothing is recorded or sampled from a microphone.
 * Three loads only near the scene; rendering stops off screen and in hidden tabs. */
export default function IntentSculpture({ mode = "voice", className = "" }) {
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const el = host.current;
    let disposed = false, visible = false, started = false, frame = 0, last = 0, nextFrame = 0, idle = null;
    let renderer, scene, camera, group, resize, render, compiled = false;
    const materials = [], geometries = [], batches = [];
    let environment, generator, room, painted = false, door, opening = 0, entrance = 0;
    setReady(false); setUnavailable(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0 };
    let bounds;
    const measurePointer = () => { bounds = el.getBoundingClientRect(); };
    const invalidateBounds = () => { bounds = undefined; };
    const move = (e) => {
      if (reduced.matches) return;
      if (!bounds) measurePointer();
      const box = bounds;
      if (!box || !box.width || !box.height) return;
      pointer.x = (e.clientX - box.left) / box.width - .5;
      pointer.y = (e.clientY - box.top) / box.height - .5;
      resume();
    };
    const leave = () => { pointer.x = 0; pointer.y = 0; resume(); };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; nextFrame = 0; };
    const resume = () => { if (compiled && render && visible && !document.hidden && !frame) frame = requestAnimationFrame(render); };
    const visibility = () => { last = 0; if (document.hidden) stop(); else { if (visible) start(); resume(); } };
    const start = async () => {
      if (started || disposed || document.hidden) return;
      started = true;
      try {
        const [T, { RoundedBoxGeometry }, { RoomEnvironment }, { createRibGeometry, sculpturePixelRatio }] = await Promise.all([
          import("three"), import("three/examples/jsm/geometries/RoundedBoxGeometry.js"), import("three/examples/jsm/environments/RoomEnvironment.js"),
          import("./sculptureGeometry.js"),
        ]);
        if (disposed) return;
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.domElement.setAttribute("aria-hidden", "true");
        el.appendChild(renderer.domElement);
        scene = new T.Scene();
        camera = new T.PerspectiveCamera(32, 1, .1, 60);
        camera.position.set(mode === "voice" ? 0 : 1.5, mode === "voice" ? 2.6 : 1.7, mode === "voice" ? 7 : 12);
        camera.lookAt(0, 0, 0);
        generator = new T.PMREMGenerator(renderer);
        room = new RoomEnvironment();
        environment = generator.fromScene(room, .04);
        scene.environment = environment.texture;
        room.dispose(); room = null; generator.dispose(); generator = null;
        scene.add(new T.HemisphereLight(0xffffff, 0x88705c, 1.3));
        const key = new T.DirectionalLight(0xfff5e4, 3.5);
        key.position.set(-4, 8, 6); key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
        key.shadow.normalBias = .04;
        scene.add(key);
        const rim = new T.DirectionalLight(0xd4e4ee, 2);
        rim.position.set(4, 2, -5); scene.add(rim);
        const silver = new T.MeshStandardMaterial({ color: 0xa8a79f, metalness: .9, roughness: .26 });
        const copper = new T.MeshStandardMaterial({ color: 0xb76634, metalness: .8, roughness: .27 });
        const dark = new T.MeshStandardMaterial({ color: 0x323432, metalness: .8, roughness: .32 });
        materials.push(silver, copper, dark);
        group = new T.Group(); scene.add(group);
        if (mode === "voice") {
          const geo = createRibGeometry(); geometries.push(geo);
          // Two batches keep the original finishes and all 49 moving ribs,
          // without 49 individual draw calls in both the colour and shadow pass.
          for (const [material, indices] of [
            [silver, Array.from({ length: 49 }, (_, i) => i).filter(i => i <= 20 || i >= 28)],
            [copper, Array.from({ length: 7 }, (_, i) => i + 21)],
          ]) {
            const ribs = new T.InstancedMesh(geo, material, indices.length);
            ribs.instanceMatrix.setUsage(T.DynamicDrawUsage);
            ribs.castShadow = true; ribs.receiveShadow = true;
            ribs.frustumCulled = false;
            group.add(ribs); batches.push({ ribs, indices });
          }
          group.rotation.set(-.12, -.12, -.06);
        } else {
          // A single open architectural threshold, with a warm inner reveal.
          // Its silhouette is an opening rather than a decorative lettermark.
          const stone = new T.MeshStandardMaterial({ color: 0xc6c5bd, metalness: .72, roughness: .24 });
          const reveal = new T.MeshStandardMaterial({ color: 0xc49962, metalness: .82, roughness: .23 });
          materials.push(stone, reveal);
          const beam = (w, h, d, x, y, z, material) => {
            const geometry = new RoundedBoxGeometry(w, h, d, 3, .045);
            geometries.push(geometry);
            const mesh = new T.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true; mesh.receiveShadow = true;
            group.add(mesh);
            return mesh;
          };
          beam(.28, 4.75, .56, -1.46, -.04, 0, stone);
          beam(.28, 4.75, .56, 1.46, -.04, 0, stone);
          beam(3.2, .28, .56, 0, 2.2, 0, stone);
          beam(.032, 4.45, .5, -1.3, -.15, 0, reveal);
          beam(.032, 4.45, .5, 1.3, -.15, 0, reveal);
          beam(2.65, .032, .5, 0, 2.045, 0, reveal);
          beam(3.65, .08, 2.7, 0, -2.43, .75, stone);
          // A partly open aluminium door gives the entrance real depth.
          door = new T.Group(); door.position.set(-1.28, -.16, .23);
          const doorGeo = new RoundedBoxGeometry(2.56, 4.38, .09, 3, .035);
          geometries.push(doorGeo);
          const panel = new T.Mesh(doorGeo, stone);
          panel.position.x = 1.28; panel.castShadow = true; panel.receiveShadow = true;
          door.add(panel); door.rotation.y = reduced.matches ? -1.25 : 0; group.add(door);
          const handleGeo = new RoundedBoxGeometry(.025, .62, .035, 2, .009);
          geometries.push(handleGeo);
          const handle = new T.Mesh(handleGeo, reveal); handle.position.set(2.35,-.05,.075); door.add(handle);
          group.rotation.set(0, -.36, 0);
        }
        const floorGeo = new T.PlaneGeometry(40, 40);
        const floorMat = new T.ShadowMaterial({ color: 0x4b3523, opacity: .12 });
        geometries.push(floorGeo); materials.push(floorMat);
        const floor = new T.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2; floor.position.y = mode === "voice" ? -1.65 : -2.47; floor.receiveShadow = true; scene.add(floor);
        let fittedWidth = 0, fittedHeight = 0, fittedRatio = 0;
        const fit = () => {
          const w = el.clientWidth, h = el.clientHeight;
          if (!w || !h) return;
          const ratio = sculpturePixelRatio(w, h, window.devicePixelRatio, mode === "voice");
          if (w === fittedWidth && h === fittedHeight && ratio === fittedRatio) return;
          fittedWidth = w; fittedHeight = h; fittedRatio = ratio;
          if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
          renderer.setSize(w, h, false); camera.aspect = w / h;
          camera.position.z = mode === "voice" ? Math.max(6, 16 / camera.aspect) : Math.max(12, 7.1 / camera.aspect);
          camera.updateProjectionMatrix(); resume();
        };
        // Fit before the first render, rather than waiting for the observer.
        // Otherwise the default square camera flashes before the real framing.
        fit();
        resize = new ResizeObserver(fit);
        resize.observe(el);
        const ribTransform = new T.Object3D();
        render = (time) => {
          frame = 0;
          if (disposed || !visible || document.hidden) return;
          if (time + .1 < nextFrame && !reduced.matches) { resume(); return; }
          // Carry fractional frame time on 90/120/165 Hz screens. Rounding each
          // frame up to 32ms previously produced only ~28fps at 165Hz.
          const interval = 1000 / 60;
          nextFrame = time + interval - (nextFrame ? Math.min(interval, time - nextFrame) : 0);
          const elapsed = last ? Math.min((time - last) / 1000, .05) : 0;
          last = time;
          const t = reduced.matches ? 0 : time * .00055;
          if (mode === "voice") {
            batches.forEach(({ ribs, indices }) => {
              indices.forEach((i, instance) => {
                const x = (i - 24) / 24;
                const envelope = Math.exp(-x * x * 2.8);
                ribTransform.scale.y = .22 + envelope * (1.1 + .78 * Math.sin(i * .23 - t * 2) + .3 * Math.cos(i * .41 + t));
                ribTransform.position.set((i - 24) * .16, Math.sin(i * .15 + t) * .08, 0);
                ribTransform.updateMatrix(); ribs.setMatrixAt(instance, ribTransform.matrix);
              });
              ribs.instanceMatrix.needsUpdate = true;
            });
            group.rotation.y += ((-.12 + pointer.x * .2) - group.rotation.y) * (1 - Math.exp(-elapsed * 1.8));
          } else {
            // Let the complete, closed door fade in before it starts moving.
            // The loading placeholder must never crossfade into a different pose.
            entrance += elapsed;
            opening = reduced.matches ? 1 : Math.min(1, opening + (entrance > .7 ? elapsed / 4.2 : 0));
            const reveal = Math.max(0, (opening - .1) / .9);
            door.rotation.y = -1.38 * (reveal * reveal * (3 - 2 * reveal));
            group.rotation.y += ((-.36 + pointer.x * .12) - group.rotation.y) * .06;
            group.rotation.x += ((pointer.y * .025) - group.rotation.x) * .06;
          }
          renderer.render(scene, camera);
          if (!painted) { painted = true; setReady(true); }
          const unsettled = mode === "voice" || opening < 1 || Math.abs(group.rotation.y - (-.36 + pointer.x * .12)) > .0001 || Math.abs(group.rotation.x - pointer.y * .025) > .0001;
          if (!reduced.matches && unsettled) resume();
        };
        // Warm the shaders while nearby, before scrolling reveals the bars.
        await renderer.compileAsync(scene, camera);
        if (!disposed) { compiled = true; resume(); }
      } catch { if (!disposed) setUnavailable(true); }
    };
    const cancelPrepare = () => { if (idle !== null) window.cancelIdleCallback?.(idle); idle = null; };
    const prepare = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { cancelPrepare(); return; }
      if (!started && idle === null && window.requestIdleCallback) {
        idle = window.requestIdleCallback(() => { idle = null; if (!disposed && !document.hidden) start(); });
      }
    }, { rootMargin: "400px 0px" });
    prepare.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) last = 0;
      if (visible) { cancelPrepare(); start(); resume(); } else stop();
    });
    io.observe(el);
    el.addEventListener("pointerenter", measurePointer, { passive: true });
    window.addEventListener("scroll", invalidateBounds, { passive: true });
    window.addEventListener("resize", invalidateBounds, { passive: true });
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", resume);
    return () => {
      disposed = true; stop(); cancelPrepare(); prepare.disconnect(); io.disconnect(); resize?.disconnect();
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerenter", measurePointer);
      window.removeEventListener("scroll", invalidateBounds); window.removeEventListener("resize", invalidateBounds);
      document.removeEventListener("visibilitychange", visibility); reduced.removeEventListener("change", resume);
      geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose());
      batches.forEach(({ ribs }) => ribs.dispose());
      scene?.traverse((o) => { if (o.isLight) o.shadow?.dispose(); });
      environment?.dispose(); generator?.dispose(); room?.dispose();
      renderer?.dispose(); renderer?.domElement.remove();
    };
  }, [mode]);
  return <div ref={host} className={`intent-sculpture intent-mode-${mode} ${ready ? "is-ready" : ""} ${unavailable ? "is-unavailable" : ""} ${className}`} aria-hidden="true">
    <div className={`intent-fallback intent-fallback-${mode}`}>
      {mode === "voice" ? Array.from({ length: 39 }, (_, i) => <i key={i} style={{ height: `${18 + 70 * Math.exp(-(((i - 19) / 10) ** 2)) * (.65 + .35 * Math.cos(i * .65))}%` }} />) : <span><i /></span>}
    </div>
  </div>;
}
