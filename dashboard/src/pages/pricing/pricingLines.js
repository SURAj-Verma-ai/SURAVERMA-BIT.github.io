// Four equally long routes, mirrored around the horizontal and vertical axes.
// Upper edge origins meet at bottom centre; lower origins meet at top centre.
export function pricingLines(width, height, centreWidth) {
  const mid = width / 2;
  const left = mid - centreWidth / 2;
  const right = mid + centreWidth / 2;
  const top = 1;
  const bottom = height - 1;
  const inner = Math.min(66, centreWidth / 5, height / 6);
  const outer = Math.min(inner * 1.4, left * .8);
  const strokes = [
    `M0 ${top} H${left - outer} Q${left} ${top} ${left} ${top + outer} V${bottom - inner} Q${left} ${bottom} ${left + inner} ${bottom} H${mid}`,
    `M${width} ${top} H${right + outer} Q${right} ${top} ${right} ${top + outer} V${bottom - inner} Q${right} ${bottom} ${right - inner} ${bottom} H${mid}`,
    `M0 ${bottom} H${left - outer} Q${left} ${bottom} ${left} ${bottom - outer} V${top + inner} Q${left} ${top} ${left + inner} ${top} H${mid}`,
    `M${width} ${bottom} H${right + outer} Q${right} ${bottom} ${right} ${bottom - outer} V${top + inner} Q${right} ${top} ${right - inner} ${top} H${mid}`,
  ];
  const fills = [
    `M0 ${top} H${left - outer} Q${left} ${top} ${left} ${top + outer} V${bottom - outer} Q${left} ${bottom} ${left - outer} ${bottom} H0 Z`,
    `M${left + inner} ${top} H${right - inner} Q${right} ${top} ${right} ${top + inner} V${bottom - inner} Q${right} ${bottom} ${right - inner} ${bottom} H${left + inner} Q${left} ${bottom} ${left} ${bottom - inner} V${top + inner} Q${left} ${top} ${left + inner} ${top} Z`,
    `M${width} ${top} H${right + outer} Q${right} ${top} ${right} ${top + outer} V${bottom - outer} Q${right} ${bottom} ${right + outer} ${bottom} H${width} Z`,
  ];
  return { strokes, fills };
}
