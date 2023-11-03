import { Note, Size } from "./types";

type CreatePatchProps = {
  size: Size;
  note: Note;
  elapsedSec: number;
  minNote: number;
  maxNote: number;
  timeRangeSec: number;
};

export type RenderModule = {
  createPatch: (props: CreatePatchProps) => {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: number;
  };
};

export function createPatch(
  module: RenderModule,
  props: CreatePatchProps,
  force: boolean,
): Record<string, string | number> | null {
  const { x, y, width, height, fill } = module.createPatch(props);
  if (!force && (x + width < 0 || x > props.size.width)) {
    return null;
  }
  return {
    x,
    y,
    width,
    height,
    fill,
  };
}
export function applyPatch(
  el: SVGElement,
  styles: Record<string, string | number>,
  patch: Record<string, string | number>,
) {
  for (const [key, value] of Object.entries(styles)) {
    el.style.setProperty(key, String(value));
  }
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}
