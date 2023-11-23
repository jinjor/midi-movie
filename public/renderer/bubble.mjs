import {
  setAttributes,
  getStyle,
  setStyles,
  createSvgElement,
  calcQuadraticEnvelope,
  flipSize,
  flipCircle,
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
      id: "beforeLightness",
      name: "Before Lightness",
      type: "number",
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 45,
    },
    {
      id: "peakLightness",
      name: "Peak Lightness",
      type: "number",
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 75,
    },
    {
      id: "afterLightness",
      name: "After Lightness",
      type: "number",
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 45,
    },
    {
      id: "beforeThickness",
      name: "Before Thickness",
      type: "number",
      min: 0,
      max: 10,
      step: 0.1,
      defaultValue: 2,
    },
    {
      id: "peakThickness",
      name: "Peak Thickness",
      type: "number",
      min: 0,
      max: 10,
      step: 0.1,
      defaultValue: 3,
    },
    {
      id: "afterThickness",
      name: "After Thickness",
      type: "number",
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.4,
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

function calculateBar({ size }) {
  return {
    x1: size.width / 2,
    x2: size.width / 2,
    y1: 0,
    y2: size.height,
    ["stroke-width"]: 0.5,
    stroke: "#aaa",
  };
}

function calculateNote({
  size,
  note,
  elapsedSec,
  minNote,
  maxNote,
  timeRangeSec,
  minHue,
  maxHue,
  beforeLightness,
  peakLightness,
  afterLightness,
  beforeThickness,
  peakThickness,
  afterThickness,
}) {
  const outOfNoteRange = note.noteNumber < minNote || note.noteNumber > maxNote;
  const fullHeightPerNote = size.height / (maxNote - minNote);
  const widthPerSec = size.width / timeRangeSec;
  const hue =
    ((note.noteNumber - minNote) / (maxNote - minNote)) * (maxHue - minHue) +
    minHue;
  const decaySec = note.toSec - note.fromSec;
  const releaseSec = 0.1;
  const lightness = calcQuadraticEnvelope({
    base: beforeLightness,
    peak: peakLightness,
    active: afterLightness,
    end: afterLightness,
    decaySec,
    releaseSec,
    fromSec: note.fromSec,
    toSec: note.toSec,
    elapsedSec,
  });
  const thickness = calcQuadraticEnvelope({
    base: beforeThickness * Math.sqrt((note.toSec - note.fromSec) * 4),
    peak: peakThickness * Math.sqrt((note.toSec - note.fromSec) * 4),
    active: afterThickness,
    end: afterThickness,
    decaySec,
    releaseSec,
    fromSec: note.fromSec,
    toSec: note.toSec,
    elapsedSec,
  });
  const x = (note.fromSec - elapsedSec + timeRangeSec / 2) * widthPerSec;
  const cy =
    size.height - (note.noteNumber - minNote - 0.5) * fullHeightPerNote;
  const width = (note.toSec - note.fromSec) * widthPerSec;
  const r = (fullHeightPerNote * thickness) / 2;
  const circle = {
    cx: x > size.width / 2 ? x : size.width / 2,
    cy,
    r,
    fill:
      outOfNoteRange || x + width < size.width / 2 || x > size.width / 2
        ? "transparent"
        : `hsl(${hue}, 20%, ${lightness}%)`,
    ["stroke-width"]: x < size.width / 2 ? 0 : 1,
    stroke:
      outOfNoteRange || x < size.width / 2
        ? `transparent`
        : `hsl(${hue}, 20%, ${lightness}%)`,
  };
  const line = {
    x1: x,
    y1: cy,
    x2: x + width < size.width / 2 ? x + width : size.width / 2,
    y2: cy,
    stroke:
      outOfNoteRange || x > size.width / 2
        ? "transparent"
        : `hsl(${hue}, 20%, ${afterLightness}%)`,
    ["stroke-width"]: r * 2,
    ["stroke-linecap"]: "round",
  };
  return {
    circle,
    line,
    ended: line.x2 + r < 0,
    started: circle.cx - r <= size.width,
  };
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
  const vertical = customProps.vertical > 0;
  const bar = svg.getElementById("bar");
  const barPatch = calculateBar({ size: vertical ? flipSize(size) : size });
  setAttributes(bar, vertical ? flipLine(barPatch, size) : barPatch);

  const groups = svg.querySelectorAll(".note");
  for (const [index, note] of notes.entries()) {
    const group = groups[index];
    const line = group.children[0];
    const circle = group.children[1];
    if (playing && getStyle(group, "display") === "none") {
      continue;
    }
    const {
      circle: circlePatch,
      line: linePatch,
      ended,
      started,
    } = calculateNote({
      size: vertical ? flipSize(size) : size,
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
    setAttributes(
      circle,
      vertical ? flipCircle(circlePatch, size) : circlePatch,
    );
    setAttributes(line, vertical ? flipLine(linePatch, size) : linePatch);
  }
}
