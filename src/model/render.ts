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

export function init(svg: SVGSVGElement, size: Size, notes: Note[]) {
  const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  setAttributes(bar, {
    x: size.width / 2,
    y: 0,
    width: 0.5,
    height: size.height,
  });
  svg.appendChild(bar);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _note of notes) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    setAttributes(rect, {
      class: "note",
    });
    svg.appendChild(rect);
  }
}

function createPatch(
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

export function update(
  svg: SVGSVGElement,
  mod: RenderModule,
  {
    notes,
    minNote,
    maxNote,
    size,
    enabledTracks,
    elapsedSec,
    timeRangeSec,
    force,
  }: {
    notes: Note[];
    minNote: number;
    maxNote: number;
    size: Size;
    enabledTracks: Set<number>;
    elapsedSec: number;
    timeRangeSec: number;
    force: boolean;
  },
) {
  const rects = svg.querySelectorAll(
    ".note",
  ) as unknown as NodeListOf<SVGRectElement>;
  for (const [index, note] of notes.entries()) {
    const rect = rects[index];
    const hidden =
      !enabledTracks.has(note.trackIndex) ||
      note.noteNumber < minNote ||
      note.noteNumber > maxNote;
    const patch = createPatch(
      mod,
      {
        size,
        note,
        elapsedSec,
        minNote,
        maxNote,
        timeRangeSec,
      },
      force,
    );
    const stylePatch = { display: hidden ? "none" : "block" };
    setStyles(rect, stylePatch);
    setAttributes(rect, patch ?? {});
  }
}

function setStyles(el: SVGElement, patch: Record<string, string | number>) {
  for (const [key, value] of Object.entries(patch)) {
    el.style.setProperty(key, String(value));
  }
}

function setAttributes(el: SVGElement, patch: Record<string, string | number>) {
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}
