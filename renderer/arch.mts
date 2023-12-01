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
  calcEnvelope,
} from "./util/util.mts";

export const config = {
  props: [
    {
      id: "minNote",
      name: "Min Note",
      type: "number",
      min: 0,
      max: 127,
      step: 1,
      defaultValue: 0,
    },
    {
      id: "maxNote",
      name: "Max Note",
      type: "number",
      min: 0,
      max: 127,
      step: 1,
      defaultValue: 127,
    },
    {
      id: "timeRangeSec",
      name: "Time Range (sec)",
      type: "number",
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 6,
    },
    {
      id: "minHue",
      name: "Min Hue",
      type: "number",
      min: -360,
      max: 360,
      step: 5,
      defaultValue: 0,
    },
    {
      id: "maxHue",
      name: "Max Hue",
      type: "number",
      min: -360,
      max: 360,
      step: 5,
      defaultValue: 240,
    },
    {
      id: "thickness",
      name: "Thickness",
      type: "number",
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.6,
    },
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
  const maxBarLength = 50;
  const archRadius = size.height - padding * 2 - maxBarLength;

  const noteAngle =
    ((note.noteNumber - minNote) / (maxNote - minNote)) * rangeAngle + minAngle;
  const edgeX = centerX + Math.cos(noteAngle) * archRadius;
  const edgeY = centerY + Math.sin(noteAngle) * archRadius;

  const barWidth =
    ((archRadius * rangeAngle) / (maxNote - minNote)) * thickness;
  const circleRadius = barWidth / 2;
  const distancePerSec = archRadius / timeRangeSec;
  const hue =
    ((note.noteNumber - minNote) / (maxNote - minNote)) * (maxHue - minHue) +
    minHue;
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
        : `hsl(${hue}, 20%, 50%)`,
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
      outOfNoteRange || barLength < 1 ? "transparent" : `hsl(${hue}, 20%, 50%)`,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
