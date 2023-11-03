import { setAttributes, setStyles, createSvgElement } from "./util.mjs";

function createPatch({
  size,
  note,
  elapsedSec,
  minNote,
  maxNote,
  timeRangeSec,
}) {
  const heightPerNote = size.height / (maxNote - minNote);
  const widthPerSec = size.width / timeRangeSec;
  const decaySec = 0.2;
  const releaseSec = 0.4;
  const minHue = 0;
  const maxHue = 240;
  const hue =
    ((note.noteNumber - minNote) / (maxNote - minNote)) * (maxHue - minHue) +
    minHue;
  const peakLightness = 100;
  const activeLightness = 80;
  const baseLightness = 30;
  const lightness =
    elapsedSec < note.fromSec
      ? baseLightness
      : elapsedSec < note.toSec
      ? activeLightness +
        (peakLightness - activeLightness) *
          Math.exp(-(elapsedSec - note.fromSec) / decaySec)
      : baseLightness +
        (activeLightness - baseLightness) *
          Math.exp(-(elapsedSec - note.toSec) / releaseSec);
  const x = (note.fromSec - elapsedSec + timeRangeSec / 2) * widthPerSec;
  const y = size.height - (note.noteNumber - minNote) * heightPerNote;
  const width = (note.toSec - note.fromSec) * widthPerSec;
  const height = heightPerNote;
  return {
    x,
    y,
    width,
    height,
    fill: `hsl(${hue}, 20%, ${lightness}%)`,
  };
}

export function init(svg, { size, notes }) {
  const bar = createSvgElement("rect");
  setAttributes(bar, {
    x: size.width / 2,
    y: 0,
    width: 0.5,
    height: size.height,
  });
  svg.appendChild(bar);
  for (const _note of notes) {
    const rect = createSvgElement("rect");
    setAttributes(rect, {
      class: "note",
    });
    svg.appendChild(rect);
  }
}

export function update(
  svg,
  {
    notes,
    minNote,
    maxNote,
    size,
    enabledTracks,
    elapsedSec,
    timeRangeSec,
    force,
  },
) {
  const rects = svg.querySelectorAll(".note");
  for (const [index, note] of notes.entries()) {
    const rect = rects[index];
    const hidden =
      !enabledTracks.has(note.trackIndex) ||
      note.noteNumber < minNote ||
      note.noteNumber > maxNote;
    const patch = createPatch({
      size,
      note,
      elapsedSec,
      minNote,
      maxNote,
      timeRangeSec,
    });
    const stylePatch = { display: hidden ? "none" : "block" };
    setStyles(rect, stylePatch);
    if (!force && (patch.x + patch.width < 0 || patch.x > size.width)) {
      continue;
    }
    setAttributes(rect, patch);
  }
}
