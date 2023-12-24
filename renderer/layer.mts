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
  setStyles,
  getStyle,
  createSvgElement,
} from "./util/svg.mts";
import { calcEnvelope } from "./util/envelope.mts";
import {
  maxHue,
  maxNote,
  minHue,
  minNote,
  saturation,
  thickness,
  timeRangeSec,
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
    thickness(0.6),
    {
      id: "barLength",
      name: "Bar Length",
      type: "number",
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.9,
    },
    {
      id: "barSustain",
      name: "Bar Sustain",
      type: "number",
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.7,
    },
    {
      id: "padding",
      name: "Padding",
      type: "number",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 30,
    },
  ],
} as const satisfies ModuleConfig;

type CustomProps = ModulePropsType<typeof config>;

type Positions = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function calculatePositions({
  size,
  padding,
}: CustomProps & {
  size: Size;
}): Positions {
  const minX = padding;
  const maxX = size.width - padding;
  const minY = padding;
  const maxY = size.height - padding;
  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

function calculatePlaceholder({
  trackIndex,
  noteNumber,
  enabledTracks,
  minNote,
  maxNote,
  saturation,
  minHue,
  maxHue,
  thickness,
  positions,
}: CustomProps & {
  trackIndex: number;
  noteNumber: number;
  enabledTracks: boolean[];
  positions: Positions;
}) {
  const { minX, maxX, minY, maxY } = positions;
  const trackIndices = enabledTracks
    .map((enabled, index) => [enabled, index])
    .filter(([enabled]) => enabled)
    .map(([, index]) => index);

  const outOfNoteRange = noteNumber < minNote || noteNumber > maxNote;
  const barWidth = ((maxX - minX) / (maxNote - minNote)) * thickness;
  const circleRadius = barWidth / 2;
  const hue = putInRange(minHue, maxHue, ratio(minNote, maxNote, noteNumber));
  const circleX =
    minX + ((maxX - minX) / (maxNote - minNote)) * (noteNumber - minNote);
  const circleY =
    minY +
    ((maxY - minY) / (trackIndices.length - 1)) *
      trackIndices.indexOf(trackIndex);
  return {
    cx: circleX,
    cy: circleY,
    r: circleRadius - 1,
    stroke:
      outOfNoteRange || !enabledTracks[trackIndex]
        ? "transparent"
        : `hsl(${hue}, ${saturation}%, 50%)`,
    strokeWidth: 1,
    fill: "transparent",
  };
}

function calculateNote({
  note,
  elapsedSec,
  minNote,
  maxNote,
  timeRangeSec,
  saturation,
  minHue,
  maxHue,
  thickness,
  barLength: barRatio,
  barSustain,
  enabledTracks,
  positions,
}: CustomProps & {
  note: Note;
  elapsedSec: number;
  enabledTracks: boolean[];
  positions: Positions;
}) {
  const { minX, maxX, minY, maxY } = positions;

  const trackIndices = enabledTracks
    .map((enabled, index) => [enabled, index])
    .filter(([enabled]) => enabled)
    .map(([, index]) => index);

  const outOfNoteRange = note.noteNumber < minNote || note.noteNumber > maxNote;
  const x = putInRange(minX, maxX, ratio(minNote, maxNote, note.noteNumber));
  const y1 = putInRange(
    minY,
    maxY,
    trackIndices.indexOf(note.trackIndex) / (trackIndices.length - 1),
  );
  const maxBarLength = ((maxY - minY) / (trackIndices.length - 1)) * barRatio;
  const barWidth = ((maxX - minX) / (maxNote - minNote)) * thickness;
  const hue = putInRange(
    minHue,
    maxHue,
    ratio(minNote, maxNote, note.noteNumber),
  );

  const barLength =
    calcEnvelope({
      base: 0,
      peak: 1,
      active: barSustain,
      end: 0,
      decaySec: 0.3,
      releaseSec: 0.5,
      fromSec: note.fromSec,
      toSec: note.toSec,
      elapsedSec,
    }) * maxBarLength;

  const line = {
    x1: x,
    y1,
    x2: x,
    y2: y1 - barLength,
    stroke:
      outOfNoteRange || barLength < 1
        ? "transparent"
        : `hsl(${hue}, ${saturation}%, 50%)`,
    "stroke-width": barWidth,
    "stroke-linecap": "round",
  };
  return {
    line,
    ended: elapsedSec > note.toSec && barLength < 1,
    started: elapsedSec >= note.fromSec - timeRangeSec,
  };
}

export function init(
  svg: SVGSVGElement,
  { notes, enabledTracks }: InitOptions<CustomProps>,
) {
  for (let i = 0; i < enabledTracks.length; i++) {
    const g = createSvgElement("g");
    setAttributes(g, {
      class: "placeholder",
    });
    for (let j = 0; j < 128; j++) {
      const circle = createSvgElement("circle");
      g.appendChild(circle);
    }
    svg.appendChild(g);
  }
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
    enabledTracks,
    elapsedSec,
    customProps,
    playing,
  }: UpdateOptions<CustomProps>,
) {
  const placeholders = svg.querySelectorAll(
    ".placeholder",
  ) as NodeListOf<SVGGElement>;
  const groups = svg.querySelectorAll(".note") as NodeListOf<SVGGElement>;

  const positions = calculatePositions({
    size,
    ...customProps,
  });
  for (let trackIndex = 0; trackIndex < enabledTracks.length; trackIndex++) {
    const circles = placeholders[trackIndex]
      .childNodes as NodeListOf<SVGCircleElement>;
    for (let noteNumber = 0; noteNumber < 128; noteNumber++) {
      const circlePatch = calculatePlaceholder({
        positions,
        noteNumber,
        trackIndex,
        enabledTracks,
        ...customProps,
      });
      setAttributes(circles[noteNumber], circlePatch);
    }
  }
  for (const [index, note] of notes.entries()) {
    const group = groups[index];
    const line = group.children[0] as SVGLineElement;
    if (playing && getStyle(group, "display") === "none") {
      continue;
    }
    const {
      line: linePatch,
      ended,
      started,
    } = calculateNote({
      positions,
      note,
      elapsedSec,
      enabledTracks,
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
    linePatch && setAttributes(line, linePatch);
  }
}
