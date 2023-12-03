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
  ],
} as const satisfies ModuleConfig;

type CustomProps = ModulePropsType<typeof config>;

function calculateNote({
  size,
  note,
  elapsedSec,
  minNote,
  maxNote,
  timeRangeSec,
  saturation,
  minHue,
  maxHue,
  thickness,
}: CustomProps & {
  size: Size;
  note: Note;
  elapsedSec: number;
}) {
  const outOfNoteRange = note.noteNumber < minNote || note.noteNumber > maxNote;
  const padding = 50;
  const centerX = size.width / 2;
  const centerY = size.height - padding;
  const rangeAngle = Math.PI;
  const midAngle = Math.PI * 1.5;
  const minAngle = midAngle - rangeAngle / 2;
  const maxAngle = midAngle + rangeAngle / 2;
  const maxBarLength = 50;
  const archRadius = size.height - padding * 2 - maxBarLength;

  const noteAngle = putInRange(
    minAngle,
    maxAngle,
    ratio(minNote, maxNote, note.noteNumber),
  );
  const edgeX = centerX + Math.cos(noteAngle) * archRadius;
  const edgeY = centerY + Math.sin(noteAngle) * archRadius;

  const barWidth =
    ((archRadius * rangeAngle) / (maxNote - minNote)) * thickness;
  const circleRadius = barWidth / 2;
  const distancePerSec = archRadius / timeRangeSec;
  const hue = putInRange(
    minHue,
    maxHue,
    ratio(minNote, maxNote, note.noteNumber),
  );
  const distance =
    (timeRangeSec - (note.fromSec - elapsedSec)) * distancePerSec;
  const circleX = centerX + Math.cos(noteAngle) * distance;
  const circleY = centerY + Math.sin(noteAngle) * distance;
  const circle = {
    cx: circleX,
    cy: circleY,
    r: circleRadius,
    fill:
      outOfNoteRange || distance < 0 || distance > archRadius
        ? "transparent"
        : `hsl(${hue}, ${saturation}%, 50%)`,
  };
  const barLength =
    calcEnvelope({
      base: 0,
      peak: 1,
      active: 0.8,
      end: 0,
      decaySec: 0.2,
      releaseSec: 0.5,
      fromSec: note.fromSec,
      toSec: note.toSec,
      elapsedSec,
    }) * maxBarLength;

  const barEndX = centerX + Math.cos(noteAngle) * (archRadius + barLength);
  const barEndY = centerY + Math.sin(noteAngle) * (archRadius + barLength);
  const line = {
    x1: edgeX,
    y1: edgeY,
    x2: barEndX,
    y2: barEndY,
    stroke:
      outOfNoteRange || barLength < 1
        ? "transparent"
        : `hsl(${hue}, ${saturation}%, 50%)`,
    "stroke-width": barWidth,
    "stroke-linecap": "round",
  };
  return {
    circle,
    line,
    ended: elapsedSec > note.toSec && barLength < 1,
    started: elapsedSec >= note.fromSec - timeRangeSec,
  };
}

export function init(svg: SVGSVGElement, { notes }: InitOptions) {
  for (const _note of notes) {
    const g = createSvgElement("g");
    const line = createSvgElement("line");
    const circle = createSvgElement("circle");
    g.appendChild(line);
    g.appendChild(circle);
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
  const groups = svg.querySelectorAll(".note") as NodeListOf<SVGGElement>;
  for (const [index, note] of notes.entries()) {
    const group = groups[index];
    const line = group.children[0] as SVGLineElement;
    const circle = group.children[1] as SVGCircleElement;
    if (playing && getStyle(group, "display") === "none") {
      continue;
    }
    const {
      circle: circlePatch,
      line: linePatch,
      ended,
      started,
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
      display: !enabledTracks[note.trackIndex] ? "none" : "block",
    };
    setStyles(circle, stylePatch);
    setStyles(line, stylePatch);
    circlePatch && setAttributes(circle, circlePatch);
    linePatch && setAttributes(line, linePatch);
  }
}
