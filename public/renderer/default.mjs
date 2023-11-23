import {
  setAttributes,
  getStyle,
  setStyles,
  createSvgElement,
  calcEnvelope,
  flipSize,
  flipLine,
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
      defaultValue: 10,
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
      id: "baseLightness",
      name: "Base Lightness",
      type: "number",
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 30,
    },
    {
      id: "peakLightness",
      name: "Peak Lightness",
      type: "number",
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 100,
    },
    {
      id: "activeLightness",
      name: "Active Lightness",
      type: "number",
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 80,
    },
    {
      id: "baseThickness",
      name: "Base Thickness",
      type: "number",
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.4,
    },
    {
      id: "peakThickness",
      name: "Peak Thickness",
      type: "number",
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 1,
    },
    {
      id: "activeThickness",
      name: "Active Thickness",
      type: "number",
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.6,
    },
    {
      id: "vertical",
      name: "Vertical",
      type: "number",
      min: 0,
      max: 1,
      step: 1,
      defaultValue: 0,
    },
  ],
};

function calculateBarForLandscape({ size }) {
  return {
    x1: size.width / 2,
    x2: size.width / 2,
    y1: 0,
    y2: size.height,
    ["stroke-width"]: 0.5,
    stroke: "#aaa",
  };
}

function calculateBar({ size, vertical }) {
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
  minHue,
  maxHue,
  baseLightness,
  peakLightness,
  activeLightness,
  baseThickness,
  peakThickness,
  activeThickness,
}) {
  const decaySec = 0.2;
  const releaseSec = 0.4;
  const fullHeightPerNote = size.height / (maxNote - minNote + 1);
  const widthPerSec = size.width / timeRangeSec;
  const hue =
    ((note.noteNumber - minNote) / (maxNote - minNote)) * (maxHue - minHue) +
    minHue;
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
    ["stroke-width"]: strokeWidth,
    stroke: `hsl(${hue}, 20%, ${lightness}%)`,
  };
  return {
    line,
    started: line.x1 <= size.width,
    ended: line.x2 < 0,
  };
}

function calculateNote({ size, vertical, ...restParams }) {
  const { line, ...rest } = calculateNoteForLandscape({
    size: vertical ? flipSize(size) : size,
    ...restParams,
  });
  return { line: vertical ? flipLine(line, size) : line, ...rest };
}

export function init(svg, { size, notes }) {
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
  svg,
  { notes, size, enabledTracks, elapsedSec, customProps, playing },
) {
  const bar = svg.getElementById("bar");
  const barPatch = calculateBar({ size, ...customProps });
  setAttributes(bar, barPatch);

  const groups = svg.querySelectorAll(".note");
  for (const [index, note] of notes.entries()) {
    const group = groups[index];
    const line = group.children[0];
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
      display: !enabledTracks[note.trackIndex] ? "none" : "block",
    };
    setStyles(line, stylePatch);
    setAttributes(line, linePatch);
  }
}
