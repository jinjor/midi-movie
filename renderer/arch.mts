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
      id: "angleRange",
      name: "Angle Range",
      type: "number",
      min: 10,
      max: 350,
      step: 1,
      defaultValue: 180,
    },
    {
      id: "barLength",
      name: "Bar Length",
      type: "number",
      min: 10,
      max: 200,
      step: 1,
      defaultValue: 50,
    },
    {
      id: "padding",
      name: "Padding",
      type: "number",
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 30,
    },
  ],
} as const satisfies ModuleConfig;

type CustomProps = ModulePropsType<typeof config>;

type Arch = {
  minAngle: number;
  maxAngle: number;
  centerX: number;
  centerY: number;
  archRadius: number;
  angleRange: number;
};

function calculateArch({
  size,
  angleRange: angleRangeDeg,
  barLength: maxBarLength,
  padding,
}: CustomProps & {
  size: Size;
}): Arch {
  const angleRange = (angleRangeDeg / 180) * Math.PI;
  const midAngle = Math.PI * 1.5;
  const minAngle = midAngle - angleRange / 2;
  const maxAngle = midAngle + angleRange / 2;

  const innerWidth = size.width - padding * 2;
  const innerHeight = size.height - padding * 2;
  const containerAspectRatio = innerWidth / innerHeight;
  const archAspectRatio =
    angleRange >= Math.PI
      ? 2 / (Math.sin(maxAngle) + 1)
      : (2 * Math.cos(maxAngle)) / 1;
  const archOuterRadius =
    containerAspectRatio > archAspectRatio
      ? innerHeight / (angleRange >= Math.PI ? 1 + Math.sin(maxAngle) : 1)
      : innerWidth / 2 / (angleRange >= Math.PI ? 1 : Math.cos(maxAngle));
  const centerX = size.width / 2;
  const centerY =
    containerAspectRatio > archAspectRatio
      ? padding + archOuterRadius
      : padding +
        (innerHeight - (innerHeight * containerAspectRatio) / archAspectRatio) /
          2 +
        archOuterRadius;
  const archRadius = archOuterRadius - maxBarLength;
  return {
    minAngle,
    maxAngle,
    centerX,
    centerY,
    archRadius,
    angleRange,
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
  barLength: maxBarLength,
  arch,
}: CustomProps & {
  note: Note;
  elapsedSec: number;
  arch: Arch;
}) {
  const { minAngle, maxAngle, centerX, centerY, angleRange, archRadius } = arch;

  const outOfNoteRange = note.noteNumber < minNote || note.noteNumber > maxNote;
  const noteAngle = putInRange(
    minAngle,
    maxAngle,
    ratio(minNote, maxNote, note.noteNumber),
  );
  const edgeX = centerX + Math.cos(noteAngle) * archRadius;
  const edgeY = centerY + Math.sin(noteAngle) * archRadius;

  const barWidth =
    ((archRadius * angleRange) / (maxNote - minNote)) * thickness;
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

export function init(svg: SVGSVGElement, { notes }: InitOptions<CustomProps>) {
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

  const arch = calculateArch({
    size,
    ...customProps,
  });
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
      arch,
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
