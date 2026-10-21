import test from "node:test";
import assert from "node:assert/strict";
import {createPriceMotion, priceCharacters, priceMotionDuration, reelDestination, reelPosition} from "./priceMotion.js";
import {planCatalog, planQuote} from "./planCatalog.js";

test("currency and grouping changes preserve the identities of decimal places", () => {
  const american = new Map(priceCharacters("33,274.68").map(item => [item.key, item.character]));
  const indian = new Map(priceCharacters("3,19,436.88").map(item => [item.key, item.character]));
  assert.equal(american.get("integer-0"), "4");
  assert.equal(indian.get("integer-0"), "6");
  assert.equal(american.get("group-3"), ",");
  assert.equal(indian.get("group-3"), ",");
  assert.equal(indian.get("group-5"), ",");
  assert.equal(american.get("fraction-1"), indian.get("fraction-1"));
});

test("every plan/currency/billing price settles to its exact formatted digits", () => {
  for (const plan of planCatalog) for (const currency of ["USD", "INR"]) for (const billing of ["monthly", "yearly"]) {
    const {digits} = planQuote(plan, currency, billing);
    const characters = priceCharacters(digits);
    assert.equal(characters.map(item => item.character).join(""), digits);
    assert.equal(new Set(characters.map(item => item.key)).size, characters.length);
    for (const {character} of characters) if (/\d/.test(character)) {
      for (let previous = 0; previous < 30; previous += .5) {
        const {from, to} = reelDestination(previous, Number(character));
        assert.equal(reelPosition(from, to, priceMotionDuration), to);
        assert.equal(to % 10, Number(character));
        assert.ok(Math.abs(to - from) <= 5, "a digit must not spin through a full cycle");
        assert.ok(from >= 10 && from < 20 && to >= 0 && to <= 29);
      }
    }
  }
});

test("rapid reversal resumes from the visible fractional position without snapping", () => {
  const first = reelDestination(10, 6, -1);
  const visible = reelPosition(first.from, first.to, 117);
  const second = reelDestination(visible, 0, 1);
  assert.ok(Math.abs(((second.from - visible) % 10 + 10) % 10) < 1e-10);
  assert.equal(reelPosition(second.from, second.to, 0), second.from);
  assert.equal(reelPosition(second.from, second.to, 380) % 10, 0);
  const checkpoints = [0, 60, 120, 180, 240, 300, 380].map(time => reelPosition(second.from, second.to, time));
  for (let index = 1; index < checkpoints.length; index++) assert.ok(checkpoints[index] >= checkpoints[index - 1]);
});

test("motion cancellation cannot restore an old quote; disabled motion settles immediately", async () => {
  const running = [];
  class Element {
    constructor(text = "") { this.children = []; this.value = text; this.style = {}; }
    get textContent() { return this.children.length ? this.children.map(child => child.textContent).join("") : this.value; }
    set textContent(text) { this.value = text; this.children = []; }
    append(child) { this.children.push(child); }
    replaceChildren(...children) { this.children = children; this.value = ""; }
    getBoundingClientRect() { return {left:0}; }
    animate(keyframes, options) {
      let resolve, reject;
      const animation = {
        keyframes, options, currentTime:0, cancelled:false,
        finished:new Promise((yes, no) => { resolve = yes; reject = no; }),
        cancel() { this.cancelled = true; reject(new Error("cancelled")); },
        complete() { this.currentTime = options.duration; resolve(); },
      };
      running.push(animation);
      return animation;
    }
  }
  const previousDocument = globalThis.document;
  globalThis.document = {createElement:() => new Element()};
  try {
    const digits = new Element("60");
    const motion = createPriceMotion(digits, new Element("/ month"));
    motion.change("60", false);
    assert.equal(digits.textContent, "60");
    motion.change("48", true, -1);
    assert.ok(running.length > 0);
    running.forEach(animation => { animation.currentTime = 117; });
    motion.stop();
    const previousCount = running.length;
    motion.change("60", true, 1);
    assert.ok(running.slice(0, previousCount).every(animation => animation.cancelled));
    running.slice(previousCount).forEach(animation => animation.complete());
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(digits.textContent, "60", "cancelled callbacks must not restore 48");
    motion.change("5,704.23", true);
    motion.settle(); // Offscreen/hidden-tab/reduced-motion handlers share this path.
    assert.equal(digits.textContent, "5,704.23");
    const count = running.length;
    motion.change("4,563.38", false);
    assert.equal(digits.textContent, "4,563.38");
    assert.equal(running.length, count, "disabled motion must start no animations");
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(digits.textContent, "4,563.38");
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
