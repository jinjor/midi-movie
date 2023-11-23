export function getStyle(el, key) {
  return el.style.getPropertyValue(key);
}

export function setStyles(el, patch) {
  for (const [key, value] of Object.entries(patch)) {
    el.style.setProperty(key, String(value));
  }
}

export function setAttributes(el, patch) {
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}

export function createSvgElement(kind) {
  return document.createElementNS("http://www.w3.org/2000/svg", kind);
}

export function calcEnvelope({
  base,
  peak,
  active,
  end,
  decaySec,
  releaseSec,
  fromSec,
  toSec,
  elapsedSec,
}) {
  end ??= base;
  return elapsedSec < fromSec
    ? base
    : elapsedSec < toSec
    ? active + (peak - active) * Math.exp(-(elapsedSec - fromSec) / decaySec)
    : end + (active - end) * Math.exp(-(elapsedSec - toSec) / releaseSec);
}
export function calcLinearEnvelope({
  base,
  peak,
  active,
  end,
  decaySec,
  releaseSec,
  fromSec,
  toSec,
  elapsedSec,
}) {
  end ??= base;
  return elapsedSec < fromSec
    ? base
    : elapsedSec < toSec
    ? peak - (peak - active) * ((elapsedSec - fromSec) / decaySec)
    : active - (active - end) * ((elapsedSec - toSec) / releaseSec);
}
export function calcQuadraticEnvelope({
  base,
  peak,
  active,
  end,
  decaySec,
  releaseSec,
  fromSec,
  toSec,
  elapsedSec,
}) {
  end ??= base;
  return elapsedSec < fromSec
    ? base
    : elapsedSec < toSec
    ? peak -
      (peak - active) *
        (1 - Math.pow((decaySec - (elapsedSec - fromSec)) / decaySec, 2))
    : active -
      (active - end) *
        (1 - Math.pow((decaySec - (elapsedSec - toSec)) / releaseSec, 2));
}
export function flipSize({ width, height }) {
  return {
    width: height,
    height: width,
  };
}
export function flipRect(
  { x, y, width, height, ...rest },
  { width: sizeWidth, height: sizeHeight },
) {
  return {
    ...rest,
    x: sizeWidth - y - height,
    y: sizeHeight - x - width,
    width: height,
    height: width,
  };
}
export function flipLine(
  { x1, y1, x2, y2, ...rest },
  { width: sizeWidth, height: sizeHeight },
) {
  return {
    ...rest,
    x1: sizeWidth - y1,
    x2: sizeWidth - y2,
    y1: sizeHeight - x1,
    y2: sizeHeight - x2,
  };
}
export function flipCircle(
  { cx, cy, ...rest },
  { width: sizeWidth, height: sizeHeight },
) {
  return {
    ...rest,
    cx: sizeWidth - cy,
    cy: sizeHeight - cx,
  };
}
