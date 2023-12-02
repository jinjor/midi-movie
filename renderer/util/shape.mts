import { Size } from "@/model/types";

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
