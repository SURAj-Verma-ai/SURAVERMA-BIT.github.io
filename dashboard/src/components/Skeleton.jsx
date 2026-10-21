import "./Skeleton.css";

// Skeleton primitives for loading states. Each shape matches its real
// counterpart so the page layout is stable before and after data arrives.
export function SkeletonLine({ width = "100%", height = 14, className = "" }) {
  return <span className={`skel skel-line ${className}`} style={{ width, height }} />;
}

export function SkeletonBlock({ width = "100%", height = 80, radius, className = "" }) {
  return <span className={`skel skel-block ${className}`} style={{ width, height, borderRadius: radius }} />;
}

export function SkeletonCircle({ size = 40 }) {
  return <span className="skel skel-circle" style={{ width: size, height: size }} />;
}

// A row of skeleton lines, like a table or a card list.
export function SkeletonRows({ count = 4, gap = 18 }) {
  return <div className="skel-rows" style={{ gap }}>
    {Array.from({ length: count }, (_, i) => (
      <div className="skel-row" key={i}>
        <SkeletonLine width={`${55 + (i % 3) * 15}%`} height={13} />
        <SkeletonLine width={90} height={11} />
      </div>
    ))}
  </div>;
}
