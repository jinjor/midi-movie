import {
  setAttributes,
  setStyles,
  createSvgElement,
  calcEnvelope,
} from "./util.mjs";

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
  ],
};

function calculateNote({
  size,
  note,
  elapsedSec,
  minNote,
  maxNote,
  timeRangeSec,
  minHue,
  maxHue,
}) {
  const fullHeightPerNote = size.height / (maxNote - minNote);
  const widthPerSec = size.width / timeRangeSec;
  const hue =
    ((note.noteNumber - minNote) / (maxNote - minNote)) * (maxHue - minHue) +
    minHue;
  const x = (note.fromSec - elapsedSec + timeRangeSec / 2) * widthPerSec;
  const cy =
    size.height - (note.noteNumber - minNote - 0.5) * fullHeightPerNote;
  const width = (note.toSec - note.fromSec) * widthPerSec;
  const r = fullHeightPerNote / 2;
  const circle = {
    cx: x > size.width / 2 ? x : size.width / 2,
    cy,
    r,
    fill:
      x + width < size.width / 2
        ? "transparent"
        : x < size.width / 2
        ? `hsl(${hue}, 20%, 50%)`
        : `transparent`,
    ["stroke-width"]: x < size.width / 2 ? 0 : 1,
    stroke: x < size.width / 2 ? `transparent` : `hsl(${hue}, 20%, 50%)`,
  };
  const lineLength =
    calcEnvelope({
      base: 0,
      peak: 1,
      active: 1,
      end: 0,
      decaySec: 0.2,
      releaseSec: 0.5,
      fromSec: note.fromSec,
      toSec: note.toSec,
      elapsedSec,
    }) * 50;
  const line =
    lineLength < 0.1
      ? null
      : {
          x1: size.width / 2,
          y1: cy,
          x2: size.width / 2 - lineLength,
          y2: cy,
          stroke: `hsl(${hue}, 20%, 50%)`,
          ["stroke-width"]: r * 2,
          ["stroke-linecap"]: "round",
        };
  return { circle, line };
}

export function init(svg, { size, notes }) {
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
  svg,
  { notes, size, enabledTracks, elapsedSec, customProps, playing },
) {
  const { minNote, maxNote, minHue, maxHue, timeRangeSec } = customProps;

  const groups = svg.querySelectorAll(".note");
  for (const [index, note] of notes.entries()) {
    if (note.noteNumber < minNote || note.noteNumber > maxNote) {
      continue;
    }
    const group = groups[index];
    const line = group.children[0];
    const circle = group.children[1];
    if (
      playing &&
      line.getAttribute("x2") + line.getAttribute("stroke-width") < 0
    ) {
      continue;
    }
    const { circle: circlePatch, line: linePatch } = calculateNote({
      size,
      note,
      elapsedSec,
      minNote,
      maxNote,
      timeRangeSec,
      minHue,
      maxHue,
    });
    if (playing && circlePatch && circlePatch.x - circlePatch.r > size.width) {
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
