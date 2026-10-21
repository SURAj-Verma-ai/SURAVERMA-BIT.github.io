import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { cardTexture } from "./cards.js";
import { inOut, mix, pointer, rng, span } from "./gl.js";

/* Spatial. Everything a computer does, as things in a space: the weather, a
   portfolio, a flight on a map, a deck, notes, a calendar, music, the news, a
   game of chess, documents, sheets, files, the PC's own health. They hang in
   a long tunnel; its mouth is a ring around the welcome. The camera flies in,
   through them, close enough to read, the lens finding each as it passes,
   and out the far end into open light. */

const KINDS = ["weather", "stocks", "map", "photo", "slide", "note", "calendar", "focus", "music", "news", "chess", "doc", "sheet", "files", "health", "sound", "alarm"];
const COUNT = 180;
const DEPTH = 420;
const BG = "#efeae1";

export function buildSpatial({ THREE, renderer, scene, camera, size }, getP) {
  const R = rng(5);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  camera.fov = 40;
  camera.far = 700;
  camera.updateProjectionMatrix();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 36, 150);

  scene.add(new THREE.HemisphereLight("#ffffff", "#e3d9ca", 1.35));
  const key = new THREE.DirectionalLight("#fff4e6", 1.5);
  key.position.set(-6, 10, 8);
  scene.add(key);

  const art = Object.fromEntries(KINDS.map((k) => [k, cardTexture(THREE, k, renderer.capabilities.getMaxAnisotropy())]));
  document.fonts?.ready?.then(() => Object.values(art).forEach((a) => a.paint()));
  const edge = new THREE.MeshPhysicalMaterial({ color: "#fbfaf7", roughness: 0.45, clearcoat: 0.5 });
  const back = new THREE.MeshStandardMaterial({ color: "#e7e1d7", roughness: 0.7 });
  const faces = Object.fromEntries(KINDS.map((k) => [k, new THREE.MeshPhysicalMaterial({ map: art[k].tex, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.18 })]));
  const geos = Object.fromEntries(KINDS.map((k) => [k, new RoundedBoxGeometry(art[k].w, art[k].h, 0.04, 3, 0.035)]));

  const up = new THREE.Vector3(0, 1, 0);
  const flip = new THREE.Quaternion().setFromAxisAngle(up, Math.PI);
  const cards = [];
  let last = "";
  for (let i = 0; i < COUNT; i++) {
    let kind = KINDS[Math.floor(R() * KINDS.length)];
    if (kind === last) kind = KINDS[(KINDS.indexOf(kind) + 5) % KINDS.length];
    last = kind;
    const mesh = new THREE.Mesh(geos[kind], [edge, edge, edge, edge, faces[kind], back]);
    // The mouth of the tunnel is a ring; deeper in, the things crowd closer to the path.
    const MOUTH = 30;
    const mouth = i < MOUTH;
    const z = mouth ? 4 - R() * 8 : -10 - ((i - MOUTH) / (COUNT - MOUTH)) * DEPTH - R() * 2;
    const th = mouth ? (i / MOUTH) * Math.PI * 2 + R() * 0.15 : i * 2.39996 + R() * 0.5;
    const r = mouth ? 13 + R() * 5 : 6.4 + Math.pow(R(), 1.2) * 8;
    const home = new THREE.Vector3(Math.cos(th) * r * 1.5, Math.sin(th) * r * 0.82, z);
    const S = mouth ? 4 + R() * 1.6 : 2.8 + R() * 2;
    const look = new THREE.Vector3(home.x * 0.3, home.y * 0.3, z + 30);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(home, look, up)).multiply(flip);
    q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * 0.5, (R() - 0.5) * 0.7, (R() - 0.5) * 0.35)));
    mesh.scale.setScalar(S);
    mesh.position.copy(home);
    mesh.quaternion.copy(q);
    cards.push({ mesh, home, q, seed: R() });
    scene.add(mesh);
  }

  // A real lens: whatever is at the focus distance is sharp, the rest falls away.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = new BokehPass(scene, camera, { focus: 30, aperture: 0.0035, maxblur: 0.009 });
  composer.addPass(bokeh);
  composer.addPass(new OutputPass());

  const ptr = pointer();
  const v = new THREE.Vector3(), qq = new THREE.Quaternion(), wobble = new THREE.Quaternion(), eul = new THREE.Euler();

  return {
    tick(t, dt) {
      const p = getP();
      ptr.step(dt);
      const portrait = size.w < size.h;
      // From in front of the mouth, through the tunnel, and out the far end.
      // Steady through the middle, easing only at the ends, so the tunnel lasts.
      const ft = span(p, 0.02, 0.9);
      const fly = mix(ft, inOut(ft), 0.35);
      const camZ = mix(portrait ? 80 : 56, -DEPTH - 40, fly);
      camera.position.set(ptr.x * 1.8 + Math.sin(fly * 6.2) * 1.4, -ptr.y * 1.1 + Math.sin(fly * 4.1) * 0.9, camZ);
      camera.lookAt(ptr.x * 0.6, -ptr.y * 0.4, camZ - 40);
      camera.rotateZ(Math.sin(fly * 3.3) * 0.06);
      // Focus on the things just ahead; at the mouth, on the ring.
      bokeh.uniforms.focus.value = Math.max(24, camZ - 2);
      // At the start only the ring is there; the depth opens as you go in.
      scene.fog.far = mix(84, 150, span(p, 0.02, 0.14));
      scene.fog.near = mix(54, 36, span(p, 0.02, 0.14));
      bokeh.uniforms.aperture.value = mix(0.0022, 0.0045, span(p, 0.05, 0.2));

      cards.forEach((c) => {
        v.copy(c.home);
        v.x += Math.sin(t * 0.3 + c.seed * 20) * 0.3;
        v.y += Math.cos(t * 0.26 + c.seed * 17) * 0.3;
        eul.set(Math.sin(t * 0.2 + c.seed * 9) * 0.07, Math.cos(t * 0.17 + c.seed * 7) * 0.09, 0);
        qq.copy(c.q).multiply(wobble.setFromEuler(eul));
        c.mesh.position.copy(v);
        c.mesh.quaternion.copy(qq);
      });
    },
    resize({ w, h }) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
    },
    render() { composer.render(); },
    dispose() { ptr.dispose(); composer.dispose(); },
  };
}
