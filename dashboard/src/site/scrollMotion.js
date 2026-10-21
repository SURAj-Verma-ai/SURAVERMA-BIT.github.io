// A cubic glide carries its incoming velocity across wheel notches. Restarting
// an ease-out at its peak speed caused a surge on every event. With an initial
// slope in [0, 1.5], this curve is monotone and its derivative never exceeds 1.5.
export const SCREENS_PER_SECOND = 1.45;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function scrollMotion(position, queued, requested, viewport, limit, velocity = 0) {
  const height = Math.max(1, viewport);
  const delta = requested - queued;
  const ahead = queued - position;
  const desired = ahead * delta < 0 ? position + delta : requested;
  const runway = height * .65;
  const target = Math.max(0, Math.min(limit, position + Math.max(-runway, Math.min(runway, desired - position))));
  const distance = target - position;
  const length = Math.abs(distance);
  const direction = Math.sign(distance);
  const speedLimit = height * SCREENS_PER_SECOND;
  // Reversing cancels forward momentum immediately, as before. Same-direction
  // input retains velocity; position and speed therefore stay continuous.
  const incoming = clamp(velocity * direction, 0, speedLimit);
  let duration = Math.max(.12, 1.5 * length / speedLimit);
  if (incoming && length) duration = Math.min(duration, 1.5 * length / incoming);
  const slope = length ? incoming * duration / length : 0;
  const easing = (value) => {
    const t = clamp(value, 0, 1);
    return t * (slope + t * (3 - 2 * slope + t * (slope - 2)));
  };
  const velocityAt = (value) => {
    const t = clamp(value, 0, 1);
    return distance / duration * (slope + t * (6 - 4 * slope + t * (3 * slope - 6)));
  };
  return { target, duration, easing, velocityAt };
}
