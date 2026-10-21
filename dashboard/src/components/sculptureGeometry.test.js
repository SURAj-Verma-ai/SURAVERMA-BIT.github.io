import test from "node:test";
import assert from "node:assert/strict";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createRibGeometry, sculpturePixelRatio } from "./sculptureGeometry.js";

test("indexed ribs preserve every triangle and lighting normal", () => {
  const original = new RoundedBoxGeometry(.115, 1, .48, 2, .05);
  const indexed = createRibGeometry();
  assert.ok(indexed.attributes.position.count < original.attributes.position.count / 5);
  assert.equal(indexed.index.count, original.attributes.position.count);
  const expanded = indexed.toNonIndexed();
  for (const attribute of ["position", "normal"]) {
    const before = original.attributes[attribute].array;
    const after = expanded.attributes[attribute].array;
    assert.equal(after.length, before.length);
    for (let i = 0; i < before.length; i++) assert.ok(Math.abs(before[i] - after[i]) < 1e-6, `${attribute}[${i}]`);
  }
  original.dispose(); indexed.dispose(); expanded.dispose();
});

test("waveform buffers stay bounded across mobile, desktop and ultrawide sizes", () => {
  for (const [w, h] of [[390, 240], [1522, 342], [3840, 480], [7680, 960]]) {
    for (const dpr of [1, 1.25, 1.5, 2, 3]) {
      const ratio = sculpturePixelRatio(w, h, dpr, true);
      assert.ok(ratio > 0 && ratio <= dpr);
      assert.ok(Math.floor(w * ratio) * Math.floor(h * ratio) <= 600000);
    }
  }
  assert.equal(sculpturePixelRatio(390, 240, 2, true), 1.25);
  assert.equal(sculpturePixelRatio(1522, 342, 2, false), 1.5);
});
