import { Size } from "@/model/types";

export function getStyle(el: SVGElement, key: string) {
  return el.style.getPropertyValue(key);
}
export function setStyles(
  el: SVGElement,
  patch: Record<string, string | number>,
) {
  for (const [key, value] of Object.entries(patch)) {
    el.style.setProperty(key, String(value));
  }
}
export function setAttributes(
  el: SVGElement,
  patch: Record<string, string | number>,
) {
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}
export function createSvgElement(kind: string) {
  return document.createElementNS("http://www.w3.org/2000/svg", kind);
}

type EnvelopeOptions = {
  base: number;
  peak: number;
  active: number;
  end?: number;
  decaySec: number;
  releaseSec: number;
  fromSec: number;
  toSec: number;
  elapsedSec: number;
};
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
}: EnvelopeOptions) {
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
}: EnvelopeOptions) {
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
}: EnvelopeOptions) {
  end ??= base;
  return elapsedSec < fromSec
    ? base
    : elapsedSec < toSec
      ? peak -
        (peak - active) *
          (1 - ((decaySec - (elapsedSec - fromSec)) / decaySec) ** 2)
      : active -
        (active - end) *
          (1 - ((decaySec - (elapsedSec - toSec)) / releaseSec) ** 2);
}
export function flipSize({ width, height }: Size) {
  return {
    width: height,
    height: width,
  };
}
export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
export type Circle = {
  cx: number;
  cy: number;
  r: number;
};
export function flipRect(
  { x, y, width, height, ...rest }: Rect,
  { width: sizeWidth, height: sizeHeight }: Size,
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
  { x1, y1, x2, y2, ...rest }: Line,
  { width: sizeWidth, height: sizeHeight }: Size,
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
  { cx, cy, ...rest }: Circle,
  { width: sizeWidth, height: sizeHeight }: Size,
) {
  return {
    ...rest,
    cx: sizeWidth - cy,
    cy: sizeHeight - cx,
  };
}
