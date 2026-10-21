import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function createRibGeometry() {
  const source = new RoundedBoxGeometry(.115, 1, .48, 2, .05);
  // These metal materials have no UV textures. Removing unused UV seams lets
  // identical position/normal pairs share vertices without altering a triangle.
  source.deleteAttribute("uv");
  const indexed = mergeVertices(source);
  source.dispose();
  return indexed;
}

export function sculpturePixelRatio(width, height, dpr, voice) {
  const maximum = Math.min(dpr || 1, width < 600 ? 1.25 : 1.5);
  // Bound the wide waveform's drawing buffer on large/HiDPI displays. MSAA
  // stays enabled; CSS size, geometry and materials are intact.
  return voice ? Math.min(maximum, Math.sqrt(600000 / Math.max(1, width * height))) : maximum;
}
