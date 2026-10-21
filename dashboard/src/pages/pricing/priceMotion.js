export const priceMotionDuration = 380;
const easing = "cubic-bezier(.333333,1,.666667,1)";
const ease = progress => 1 - (1 - Math.min(1, Math.max(0, progress))) ** 3;

// Keys describe decimal places, so a currency/grouping change retains the same
// numeral rather than treating a comma as a different digit.
export function priceCharacters(text) {
  const [integer, fraction] = text.split(".");
  let place = 0;
  const characters = [...integer].reverse().map(character => ({
    key: /\d/.test(character) ? `integer-${place++}` : `group-${place}`,
    character,
  })).reverse();
  if (fraction !== undefined) {
    characters.push({key:"decimal", character:"."});
    [...fraction].forEach((character, index) => characters.push({key:`fraction-${index}`, character}));
  }
  return characters;
}

export function reelDestination(position, digit, direction = 1) {
  const normalized = ((position % 10) + 10) % 10 + 10;
  const destinations = [digit, digit + 10, digit + 20];
  destinations.sort((a, b) => Math.abs(a - normalized) - Math.abs(b - normalized) || direction * (b - a));
  return {from:normalized, to:destinations[0]};
}

export function reelPosition(from, to, elapsed) {
  return from + (to - from) * ease(elapsed / priceMotionDuration);
}

// Only transforms/opacity animate. There is no per-frame text replacement,
// number formatting, React render, or layout measurement.
export function createPriceMotion(element, period) {
  let cells = new Map();
  let animations = [];
  let generation = 0;
  let target = element.textContent;
  let pendingRects = null;

  const measure = () => ({
    cells:new Map([...cells].map(([key, cell]) => [key, cell.node.getBoundingClientRect()])),
    period:period.getBoundingClientRect(),
  });
  const stop = () => {
    pendingRects ??= measure();
    ++generation;
    for (const cell of cells.values()) {
      if (cell.motion) {
        const {animation, from, to} = cell.motion;
        cell.position = reelPosition(from, to, Number(animation.currentTime) || 0);
        cell.motion = null;
      }
    }
    animations.forEach(animation => animation.cancel());
    animations = [];
  };
  const row = character => {
    const node = document.createElement("span");
    node.className = "billing-numeral-row";
    node.textContent = character;
    return node;
  };
  const makeCell = character => {
    const node = document.createElement("span");
    const numeric = /\d/.test(character);
    node.className = numeric ? "billing-numeral" : "billing-separator";
    const track = document.createElement("span");
    track.className = "billing-numeral-track";
    track.append(row(character));
    node.append(track);
    return {node, track, character, position:numeric ? Number(character) + 10 : 0, motion:null};
  };
  const rebuild = text => {
    const next = new Map();
    for (const {key, character} of priceCharacters(text)) {
      const cell = cells.get(key) || makeCell(character);
      cell.character = character;
      next.set(key, cell);
    }
    cells = next;
    element.replaceChildren(...[...cells.values()].map(cell => cell.node));
  };
  const settle = () => {
    stop();
    rebuild(target);
    for (const cell of cells.values()) {
      cell.track.replaceChildren(row(cell.character));
      cell.track.style.transform = "";
      cell.position = /\d/.test(cell.character) ? Number(cell.character) + 10 : 0;
    }
    pendingRects = null;
  };
  const animate = (node, keyframes) => {
    const animation = node.animate(keyframes, {duration:priceMotionDuration, easing, fill:"both"});
    animations.push(animation);
    return animation;
  };
  const change = (text, enabled, direction = 1) => {
    stop();
    const before = pendingRects;
    pendingRects = null;
    target = text;
    if (!enabled || typeof element.animate !== "function") { settle(); return; }
    rebuild(text);
    const after = measure();
    for (const [key, cell] of cells) {
      const previous = before.cells.get(key);
      const numeric = /\d/.test(cell.character);
      if (numeric) {
        const {from, to} = reelDestination(cell.position, Number(cell.character), direction);
        if (Math.abs(from - to) > .001) {
          cell.track.replaceChildren(...Array.from({length:30}, (_, index) => row(String(index % 10))));
          const animation = animate(cell.track, [
            {transform:`translateY(${-from * 100 / 30}%)`},
            {transform:`translateY(${-to * 100 / 30}%)`},
          ]);
          cell.motion = {animation, from, to};
        } else {
          cell.track.replaceChildren(row(cell.character));
          cell.track.style.transform = "";
        }
      }
      const distance = previous ? previous.left - after.cells.get(key).left : 0;
      if (previous && Math.abs(distance) > .5) {
        animate(cell.node, [{transform:`translateX(${distance}px)`}, {transform:"translateX(0)"}]);
      } else if (!previous) {
        animate(cell.node, [{opacity:0, transform:"translateY(.12em)"}, {opacity:1, transform:"translateY(0)"}]);
      }
    }
    const distance = before.period.left - after.period.left;
    if (Math.abs(distance) > .5) animate(period, [{transform:`translateX(${distance}px)`}, {transform:"translateX(0)"}]);
    const token = generation;
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (token === generation) settle();
    }).catch(() => {}); // Cancellation is expected during a rapid toggle.
  };
  return {change, settle, stop};
}
