import test from "node:test";
import assert from "node:assert/strict";
import { scrollMotion, SCREENS_PER_SECOND } from "./scrollMotion.js";

test("rapid input bursts stay below the speed cap at different frame rates", () => {
  for (const height of [568, 844, 1080]) for (const fps of [30, 60, 120, 240]) {
    let position = 5000, queued = 5000, elapsed = 0, from = position, motion;
    const dt = 1 / fps;
    for (let frame = 0; frame < fps * 6; frame++) {
      if (frame % 3 === 0) {
        const delta = frame < fps * 3 ? (frame % 2 ? 24 : 9000) : -4500;
        const velocity = motion ? motion.velocityAt(elapsed / motion.duration) : 0;
        motion = scrollMotion(position, queued, queued + delta, height, 100000, velocity);
        queued = motion.target; from = position; elapsed = 0;
      }
      elapsed += dt;
      const next = from + (queued - from) * motion.easing(Math.min(1, elapsed / motion.duration));
      assert.ok(Math.abs(next - position) / dt <= height * SCREENS_PER_SECOND + 1e-7);
      assert.ok(Math.abs(queued - next) <= height * .65 + 1e-7);
      position = next;
    }
  }
});

test("reversing cancels forward momentum and boundaries cannot overshoot", () => {
  assert.ok(scrollMotion(1000, 1400, 1300, 800, 10000).target < 1000);
  assert.equal(scrollMotion(10, 10, -2000, 800, 10000).target, 0);
  assert.equal(scrollMotion(9900, 9900, 14000, 800, 10000).target, 10000);
});

test("small gestures respond promptly without exceeding the speed limit", () => {
  const motion = scrollMotion(1000, 1000, 1024, 844, 10000);
  assert.ok(motion.duration <= .15);
  assert.equal(motion.target, 1024);
  for (let i = 0; i <= 100; i++) assert.ok(Math.abs(motion.velocityAt(i / 100)) <= 844 * SCREENS_PER_SECOND);
});

test("a large gesture remains controlled and settles sooner than the old cap", () => {
  const motion = scrollMotion(1000,1000,10000,844,100000);
  assert.ok(motion.duration < 1.2);
  for (let i = 0; i <= 100; i++) assert.ok(Math.abs(motion.velocityAt(i / 100)) <= 844 * SCREENS_PER_SECOND + 1e-7);
});

test("successive wheel notches preserve velocity instead of surging at each input", () => {
  let from = 1000, queued = from, motion = scrollMotion(from, queued, queued + 120, 900, 100000);
  assert.equal(motion.velocityAt(0), 0);
  for (let i = 0; i < 30; i++) {
    const phase = .045 / motion.duration;
    const position = from + (motion.target - from) * motion.easing(phase);
    const incoming = motion.velocityAt(phase);
    queued = motion.target;
    const next = scrollMotion(position, queued, queued + 120, 900, 100000, incoming);
    assert.ok(Math.abs(next.velocityAt(0) - incoming) < 1e-7);
    assert.equal(next.easing(0), 0);
    from = position; motion = next;
  }
});

test("glides start and stop softly, stay monotone, and never overshoot", () => {
  for (const distance of [.1, 1, 24, 120, 500]) for (const velocity of [0, 20, 500, 1305]) {
    for (const direction of [-1, 1]) {
      const m = scrollMotion(5000, 5000, 5000 + distance * direction, 900, 100000, velocity * direction);
      let previous = 0;
      for (let i = 0; i <= 500; i++) {
        const t = i / 500, value = m.easing(t);
        assert.ok(value >= previous - 1e-12 && value <= 1 + 1e-12);
        assert.ok(Math.abs(m.velocityAt(t)) <= 1305 + 1e-7);
        previous = value;
      }
      assert.ok(Math.abs(m.easing(1) - 1) < 1e-12);
      assert.ok(Math.abs(m.velocityAt(1)) < 1e-7);
    }
  }
  const stopped = scrollMotion(1000, 1000, 1000, 900, 100000, 500);
  assert.equal(stopped.velocityAt(0), 0);
  const reverse = scrollMotion(1000, 1200, 1100, 900, 100000, 500);
  assert.equal(Math.abs(reverse.velocityAt(0)), 0);
  assert.ok(reverse.target < 1000 && reverse.velocityAt(.25) < 0);
});

test("the same gesture has the same positions at 60, 120 and 240 Hz", () => {
  const trajectories = [60, 120, 240].map(fps => {
    let from = 5000, position = from, queued = from, elapsed = 0, motion;
    const points = [];
    for (let frame = 0; frame < fps; frame++) {
      if (frame % (fps / 20) === 0 && frame < fps / 2) {
        const velocity = motion ? motion.velocityAt(elapsed / motion.duration) : 0;
        motion = scrollMotion(position, queued, queued + 90, 900, 100000, velocity);
        from = position; queued = motion.target; elapsed = 0;
      }
      elapsed += 1 / fps;
      position = from + (motion.target - from) * motion.easing(elapsed / motion.duration);
      if ((frame + 1) % (fps / 60) === 0) points.push(position);
    }
    return points;
  });
  for (const trajectory of trajectories) trajectory.forEach((position, i) => assert.ok(Math.abs(position - trajectories[0][i]) < 1e-7));
});
