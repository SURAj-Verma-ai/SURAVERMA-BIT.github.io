// Finger travel stays 1:1. Only the distance travelled after release is bounded,
// so a quick fling doesn't coast through several chapters of a pinned scene.
export function sceneGlide(position, velocity, height, limit) {
  const distance = Math.max(-height * 0.55, Math.min(height * 0.55, velocity * 160));
  return { target: Math.max(0, Math.min(limit, position + distance)),
    duration: 0.18 + 0.14 * Math.min(1, Math.abs(distance) / Math.max(1, height * 0.55)) };
}

export function createSceneTouch({ eligible, position, height, limit, scrollTo }) {
  let gesture = null;
  return {
    cancel() { gesture = null; },
    handle({ deltaX, deltaY, event }) {
      if (!event.type.startsWith("touch")) return true;
      if (event.type === "touchstart") {
        gesture = event.touches.length === 1 && eligible(event.target)
          ? { time: event.timeStamp, velocity: 0, moved: false } : null;
        return true;
      }
      if (!gesture) return true;
      if (event.type === "touchcancel" || event.touches.length > 1) { gesture = null; return true; }
      if (event.type === "touchmove") {
        if ((!gesture.moved && Math.abs(deltaX) > Math.abs(deltaY)) || !event.cancelable) {
          gesture = null; return true;
        }
        if (!deltaY) return true;
        event.preventDefault();
        const dt = Math.max(8, Math.min(50, event.timeStamp - gesture.time));
        gesture.velocity = 0.65 * deltaY / dt + 0.35 * gesture.velocity;
        gesture.time = event.timeStamp;
        gesture.moved = true;
        scrollTo(position() + deltaY, { immediate: true });
        return false;
      }
      if (event.type === "touchend") {
        const last = gesture;
        gesture = null;
        if (!last.moved) return true;
        if (event.cancelable) event.preventDefault();
        const velocity = event.timeStamp - last.time > 100 ? 0 : last.velocity;
        const glide = sceneGlide(position(), velocity, height(), limit());
        if (Math.abs(glide.target - position()) > 1) {
          scrollTo(glide.target, { duration: glide.duration, lerp: undefined, easing: t => 1 - (1 - t) ** 3 });
        }
        return false;
      }
      return true;
    },
  };
}
