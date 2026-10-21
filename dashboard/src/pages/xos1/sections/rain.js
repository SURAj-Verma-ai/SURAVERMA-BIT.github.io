import { rng, span } from "../welcome/gl.js";

/* Rain across the whole screen, for the Lumen Visuals journey. Streaks fall
   through a deep volume, so near ones are long and far ones fine. One draw
   call; the falling is done in the shader, and the scene sleeps when dry. */

export function buildRain({ THREE, renderer, scene, camera, canvas }, getP, getUmbrella = () => null) {
  const R = rng(21);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  camera.fov = 40; camera.far = 100; camera.updateProjectionMatrix();
  camera.position.set(0, 4, 14); camera.lookAt(0, 4, 0);

  const N = 1800;
  const pos = new Float32Array(N * 2 * 3), end = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const x = (R() - 0.5) * 34, y = R() * 18, z = -22 + R() * 30;
    for (let k = 0; k < 2; k++) { pos.set([x, y, z], (i * 2 + k) * 3); end[i * 2 + k] = k; }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
  const canopyData = new Uint8Array(128 * 4);
  const canopyTexture = new THREE.DataTexture(canopyData, 128, 1, THREE.RGBAFormat);
  canopyTexture.minFilter = THREE.LinearFilter;
  canopyTexture.magFilter = THREE.LinearFilter;
  canopyTexture.needsUpdate = true;
  let sampledImage = null;
  const u = {
    uTime: { value: 0 }, uRain: { value: 0 },
    uCanopy: { value: canopyTexture }, uShelter: { value: 0 },
    uScreen: { value: new THREE.Vector2(1, 1) },
    uOrigin: { value: new THREE.Vector2() },
    uUmbrellaSize: { value: new THREE.Vector2(1, 1) },
    uRotation: { value: new THREE.Vector2(1, 0) },
  };

  // Read the real canopy silhouette once. The shaft and handle must not
  // create a second, narrow rain shadow beneath the umbrella.
  const sampleCanopy = image => {
    if (image === sampledImage || !image.complete || !image.naturalWidth) return;
    const surface = document.createElement("canvas");
    surface.width = 128; surface.height = 128;
    const context = surface.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, 128, 128);
    const pixels = context.getImageData(0, 0, 128, 128).data;
    for (let x = 0; x < 128; x++) {
      for (let y = 0; y < 73; y++) {
        const at = (y * 128 + x) * 4;
        const red = pixels[at], green = pixels[at + 1], blue = pixels[at + 2];
        if (pixels[at + 3] > 100 && red > 70 && red > green * 1.15 && red > blue * 1.15) {
          const to = x * 4;
          canopyData[to] = Math.round(y / 127 * 255);
          canopyData[to + 3] = 255;
          break;
        }
      }
    }
    canopyTexture.needsUpdate = true;
    sampledImage = image;
  };

  const updateShelter = () => {
    u.uShelter.value = 0;
    const image = getUmbrella();
    if (!image?.complete || !image.naturalWidth) return;
    sampleCanopy(image);
    const style = getComputedStyle(image);
    const opacity = Number(style.opacity);
    if (opacity < .01) return;
    const box = image.getBoundingClientRect(), stage = canvas.getBoundingClientRect();
    if (box.bottom < stage.top || box.top > stage.bottom) return;
    const angle = (parseFloat(style.rotate) || 0) * Math.PI / 180;
    const c = Math.cos(angle), s = Math.sin(angle);
    const width = image.offsetWidth, height = image.offsetHeight;
    // Recover the transformed local origin from the rotated bounding box.
    // This follows the image's sway, responsive sizing and scroll translation.
    const minX = Math.min(0, c * width, -s * height, c * width - s * height);
    const minY = Math.min(0, s * width, c * height, s * width + c * height);
    u.uOrigin.value.set(box.left - stage.left - minX, box.top - stage.top - minY);
    u.uUmbrellaSize.value.set(width, height);
    u.uRotation.value.set(c, s);
    u.uScreen.value.set(stage.width, stage.height);
    u.uShelter.value = opacity;
  };
  const rain = new THREE.LineSegments(geo, new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false,
    vertexShader: /* glsl */ `attribute float aEnd; uniform float uTime; varying float vA;
      void main(){ vec3 p = position; p.y = mod(position.y - uTime * 10.0, 18.0) - 3.0; p += aEnd * vec3(0.05, -0.55, 0.0);
        vA = (1.0 - aEnd * 0.7) * smoothstep(-24.0, -4.0, p.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uRain, uShelter;
      uniform sampler2D uCanopy;
      uniform vec2 uScreen, uOrigin, uUmbrellaSize, uRotation;
      varying float vA;
      void main(){
        float shelter = 0.0;
        if (uShelter > 0.0) {
          // Fragment coordinates to CSS pixels, then into the moving image.
          vec2 pixel = gl_FragCoord.xy / ${renderer.getPixelRatio().toFixed(4)};
          pixel.y = uScreen.y - pixel.y;
          vec2 d = pixel - uOrigin;
          vec2 local = vec2(uRotation.x*d.x + uRotation.y*d.y,
                           -uRotation.y*d.x + uRotation.x*d.y);
          vec2 direction = vec2(0.091*uRotation.x + uRotation.y,
                               uRotation.x - 0.091*uRotation.y);
          float slope = direction.x / max(direction.y, 0.1);
          // Trace the rain up to the roof. Two samples follow its curved edge.
          float roofY = uUmbrellaSize.y * 0.25;
          float roofX = (local.x - (local.y-roofY)*slope) / uUmbrellaSize.x;
          vec4 roof = texture2D(uCanopy, vec2(clamp(roofX,0.0,1.0),0.5));
          roofY = roof.r * uUmbrellaSize.y;
          roofX = (local.x - (local.y-roofY)*slope) / uUmbrellaSize.x;
          roof = texture2D(uCanopy, vec2(clamp(roofX,0.0,1.0),0.5));
          float inside = step(0.0,roofX)*step(roofX,1.0);
          float below = step(roof.r*uUmbrellaSize.y,local.y);
          shelter = inside*below*roof.a*uShelter;
        }
        gl_FragColor = vec4(0.24,0.21,0.18,0.3*uRain*vA*(1.0-shelter));
      }`,
  }));
  rain.frustumCulled = false;
  scene.add(rain);

  return {
    isVisible: () => getP() > .12 && getP() < .31,
    isAnimating: () => rain.visible,
    tick(t) {
      const p = getP();
      u.uTime.value = t;
      // Rain through the afternoon, clearing as the forecast says it will.
      u.uRain.value = span(p, 0.12, 0.16) * (1 - span(p, 0.25, 0.31));
      rain.visible = u.uRain.value > 0.001;
      if (rain.visible) updateShelter();
    },
    dispose() { canopyTexture.dispose(); },
  };
}
