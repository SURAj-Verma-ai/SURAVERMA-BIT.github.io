export const DEL = [77.1, 28.56], BOM = [72.87, 19.09];

// The great circle between the two, sampled.
const clamp = value => Math.max(0,Math.min(1,value));
const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
function greatCircle(a, b, n) {
  const [l1, p1] = [rad(a[0]), rad(a[1])], [l2, p2] = [rad(b[0]), rad(b[1])];
  const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  return Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    return [deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.hypot(x, y)))];
  });
}
export const ROUTE = greatCircle(DEL, BOM, 160);
export const at = (t) => {
  const f = clamp(t) * (ROUTE.length - 1), i = Math.min(ROUTE.length - 2, Math.floor(f)), k = f - i;
  return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * k, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * k];
};
const BEARING = 208; // Delhi to Mumbai, roughly south-south-west

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (p, a, b) => clamp((p - a) / (b - a));
const mix = (a, b, t) => a + (b - a) * t;

export function flightState(value,portrait) {
  const progress=ease(span(value,.78,.92));
  const dive=ease(span(value,.76,.81))*(1-ease(span(value,.92,.97)));
  const here=at(progress);
  return {progress,here,
    before:at(Math.max(0,progress-.002)),after:at(Math.min(1,progress+.002)),
    camera:{center:[mix(79,here[0],dive),mix(22,here[1],dive)],
      zoom:mix(portrait?3.4:3.9,portrait?5.6:6.3,dive),pitch:58*dive,bearing:BEARING*dive}};
}
