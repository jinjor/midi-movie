import { atom } from "jotai";
import { MidiData } from "./model/types";

export const midiOffsetAtom = atom(0);
export const audioOffsetAtom = atom(0);
export const minNoteAtom = atom(0);
export const maxNoteAtom = atom(127);
export const imageUrlAtom = atom<string | null>(null);
export const imageSizeAtom = atom({
  width: 512,
  height: 512 * (9 / 16),
});
export const midiDataAtom = atom<MidiData | null>(null);
export const enabledTracksAtom = atom(new Set<number>());
export const audioBufferAtom = atom<AudioBuffer | null>(null);
export const currentTimeInSecAtom = atom<number | null>(null);
export const opacityAtom = atom(0.6);
export const volumeAtom = atom(1);
export const gainNodeAtom = atom<GainNode | null>(null);
