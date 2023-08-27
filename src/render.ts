import { Note, Size } from "./model";

export function createPatch(
  size: Size,
  note: Note,
  elapsedSec: number,
  minNote: number,
  maxNote: number,
  timeRangeSec: number,
  force: boolean
): Record<string, string | number> | null {
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
  if (!force && (x + width < 0 || x > size.width)) {
    return null;
  }
  return {
    x,
    y,
    width,
    height,
    fill: `hsl(${hue}, 20%, ${lightness}%)`,
  };
}
export function applyPatch(
  el: SVGElement,
  patch: Record<string, string | number>
) {
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}
