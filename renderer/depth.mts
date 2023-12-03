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
  colorByTrack,
  depth,
  lineCap,
  maxHue,
  maxNote,
  minHue,
  minNote,
  peakLightness,
  peakThickness,
  reverseDepth,
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
    colorByTrack(1),
    depth(2),
    reverseDepth(0),
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
  colorByTrack,
  depth,
  reverseDepth,
  numberOfTracks,
}: Omit<CustomProps, "vertical"> & {
  size: Size;
  note: Note;
  elapsedSec: number;
  numberOfTracks: number;
}) {
  const maxTrackIndex = numberOfTracks - 1;
  const shallowestScale = 1;
  const deepestScale = shallowestScale / depth;
  const scale = putInRange(
    shallowestScale,
    deepestScale,
    note.trackIndex / maxTrackIndex,
    !!reverseDepth,
  );
  const height = size.height * scale;
  const bottom = size.height / 2 + height / 2;
  const scaledTimeRangeSec = timeRangeSec / scale;

  const decaySec = 0.2;
  const releaseSec = 0.4;
  const fullHeightPerNote = height / (maxNote - minNote + 1);
  const widthPerSec = size.width / scaledTimeRangeSec;
  const hue = colorByTrack
    ? putInRange(minHue, maxHue, note.trackIndex / maxTrackIndex)
    : putInRange(minHue, maxHue, ratio(minNote, maxNote, note.noteNumber));
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
  const x1 = (note.fromSec - elapsedSec + scaledTimeRangeSec / 2) * widthPerSec;
  const x2 = (note.toSec - elapsedSec + scaledTimeRangeSec / 2) * widthPerSec;
  const y = bottom - (note.noteNumber - minNote) * fullHeightPerNote;
  const strokeWidth = fullHeightPerNote * thickness;
  const hidden = note.noteNumber < minNote || note.noteNumber > maxNote;
  const line = {
    x1,
    x2,
    y1: y,
    y2: y,
    "stroke-width": strokeWidth,
    stroke: hidden
      ? "transparent"
      : `hsl(${hue}, ${saturation}%, ${lightness}%)`,
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
}: CustomProps & {
  size: Size;
  note: Note;
  elapsedSec: number;
  numberOfTracks: number;
}) {
  const { line, ...rest } = calculateNoteForLandscape({
    size: vertical ? flipSize(size) : size,
    ...restParams,
  });
  return { line: vertical ? flipLine(line, size) : line, ...rest };
}

export function init(
  svg: SVGSVGElement,
  { notes, customProps }: InitOptions<CustomProps>,
) {
  const bar = createSvgElement("line");
  setAttributes(bar, {
    id: "bar",
  });
  svg.appendChild(bar);
  notes.sort((a, b) => b.trackIndex - a.trackIndex);
  if (customProps.reverseDepth) {
    notes.reverse();
  }
  for (const note of notes) {
    const g = createSvgElement("g");
    const line = createSvgElement("line");
    g.appendChild(line);
    setAttributes(g, {
      id: `note-${note.index}`,
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
    enabledTracks,
    elapsedSec,
    customProps,
    playing,
  }: UpdateOptions<CustomProps>,
) {
  const bar = svg.getElementById("bar") as SVGElement;
  const barPatch = calculateBar({ size, ...customProps });
  setAttributes(bar, barPatch);

  for (const note of notes) {
    const group = document.getElementById(
      `note-${note.index}`,
    ) as unknown as SVGGElement;
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
      numberOfTracks: enabledTracks.length,
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
      display: !enabledTracks[note.trackIndex] ? "none" : "block",
    };
    setStyles(line, stylePatch);
    setAttributes(line, linePatch);
  }
}