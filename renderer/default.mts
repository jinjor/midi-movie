import {
  InitOptions,
  ModuleConfig,
  ModulePropsType,
  Note,
  Size,
  UpdateOptions,
} from "@/model/types";
import {
  setAttributes,
  getStyle,
  setStyles,
  createSvgElement,
} from "./util/svg.mts";
import { flipLine, flipSize } from "./util/shape.mts";
import { calcEnvelope } from "./util/envelope.mts";
import {
  activeLightness,
  activeThickness,
  baseLightness,
  baseThickness,
  lineCap,
  maxHue,
  maxNote,
  minHue,
  minNote,
  peakLightness,
  peakThickness,
  saturation,
  timeRangeSec,
  vertical,
} from "./util/props.mts";
import { putInRange, ratio } from "./util/calc.mts";

export const config = {
  props: [
    minNote(0),
    maxNote(127),
    timeRangeSec(6),
    minHue(0),
    maxHue(240),
    saturation(40),
    baseLightness(30),
    peakLightness(100),
    activeLightness(80),
    baseThickness(0.4),
    peakThickness(1),
    activeThickness(0.6),
    vertical(0),
    lineCap(0),
  ],
} as const satisfies ModuleConfig;

type CustomProps = ModulePropsType<typeof config>;

function calculateBarForLandscape({ size }: { size: Size }) {
  return {
    x1: size.width / 2,
    x2: size.width / 2,
    y1: 0,
    y2: size.height,
    "stroke-width": 0.5,
    stroke: "#aaa",
  };
}

function calculateBar({ size, vertical }: { size: Size; vertical: number }) {
  const barPatch = calculateBarForLandscape({
    size: vertical ? flipSize(size) : size,
  });
  return vertical ? flipLine(barPatch, size) : barPatch;
}

function calculateNoteForLandscape({
  size,
  note,
  elapsedSec,
  minNote,
  maxNote,
  timeRangeSec,
  saturation,
  minHue,
  maxHue,
  baseLightness,
  peakLightness,
  activeLightness,
  baseThickness,
  peakThickness,
  activeThickness,
  lineCap,
}: Omit<CustomProps, "vertical"> & {
  size: Size;
  note: Note;
  elapsedSec: number;
}) {
  const decaySec = 0.2;
  const releaseSec = 0.4;
  const fullHeightPerNote = size.height / (maxNote - minNote + 1);
  const widthPerSec = size.width / timeRangeSec;
  const hue = putInRange(
    minHue,
    maxHue,
    ratio(minNote, maxNote, note.noteNumber),
  );
  const lightness = calcEnvelope({
    base: baseLightness,
    peak: peakLightness,
    active: activeLightness,
    decaySec,
    releaseSec,
    fromSec: note.fromSec,
    toSec: note.toSec,
    elapsedSec,
  });
  const thickness = calcEnvelope({
    base: baseThickness,
    peak: peakThickness,
    active: activeThickness,
    decaySec,
    releaseSec,
    fromSec: note.fromSec,
    toSec: note.toSec,
    elapsedSec,
  });
  const x1 = (note.fromSec - elapsedSec + timeRangeSec / 2) * widthPerSec;
  const x2 = (note.toSec - elapsedSec + timeRangeSec / 2) * widthPerSec;
  const y = size.height - (note.noteNumber - minNote) * fullHeightPerNote;
  const strokeWidth = fullHeightPerNote * thickness;
  const line = {
    x1,
    x2,
    y1: y,
    y2: y,
    "stroke-width": strokeWidth,
    stroke: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    "stroke-linecap": lineCap ? "round" : "butt",
  };
  return {
    line,
    started: line.x1 <= size.width,
    ended: line.x2 < 0,
  };
}

function calculateNote({
  size,
  vertical,
  ...restParams
}: CustomProps & { size: Size; note: Note; elapsedSec: number }) {
  const { line, ...rest } = calculateNoteForLandscape({
    size: vertical ? flipSize(size) : size,
    ...restParams,
  });
  return { line: vertical ? flipLine(line, size) : line, ...rest };
}

export function init(svg: SVGSVGElement, { notes }: InitOptions<CustomProps>) {
  const bar = createSvgElement("line");
  setAttributes(bar, {
    id: "bar",
  });
  svg.appendChild(bar);
  for (const _note of notes) {
    const g = createSvgElement("g");
    const line = createSvgElement("line");
    g.appendChild(line);
    setAttributes(g, {
      class: "note",
    });
    svg.appendChild(g);
  }
}

export function update(
  svg: SVGSVGElement,
  {
    notes,
    size,
    tracks,
    elapsedSec,
    customProps,
    playing,
  }: UpdateOptions<CustomProps>,
) {
  const bar = svg.getElementById("bar") as SVGElement;
  const barPatch = calculateBar({ size, ...customProps });
  setAttributes(bar, barPatch);

  const groups = svg.querySelectorAll(".note");
  for (const [index, note] of notes.entries()) {
    const group = groups[index] as SVGGElement;
    const line = group.children[0] as SVGLineElement;
    if (playing && getStyle(group, "display") === "none") {
      continue;
    }
    const {
      line: linePatch,
      started,
      ended,
    } = calculateNote({
      size,
      note,
      elapsedSec,
      ...customProps,
    });
    if (playing && ended) {
      setStyles(group, {
        display: "none",
      });
      continue;
    }
    if (playing && !started) {
      continue;
    }
    const stylePatch = {
      display: !tracks[note.trackIndex].enabled ? "none" : "block",
    };
    setStyles(line, stylePatch);
    setAttributes(line, linePatch);
  }
}
