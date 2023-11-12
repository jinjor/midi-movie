import { atom, createStore } from "jotai";
import { MidiData, PlayingState } from "./model/types";
import { RendererState, renderers } from "./model/render";
import { StorageKey, get, set } from "./storage";

export const store = createStore();
const atomWithStorage = (key: StorageKey) => {
  const a = atom(get(key));
  store.sub(a, () => set(key, store.get(a)));
  return a;
};

export const midiOffsetAtom = atomWithStorage("midiOffset");
export const opacityAtom = atomWithStorage("opacity");
export const volumeAtom = atomWithStorage("volume");
export const imageUrlAtom = atom<string | null>(null);
export const imageSizeAtom = atom({
  width: 512,
  height: 512 * (9 / 16),
});
export const midiDataAtom = atom<MidiData | null>(null);
export const enabledTracksAtom = atom<boolean[]>([]);
export const audioBufferAtom = atom<AudioBuffer | null>(null);
export const playingStateAtom = atom<PlayingState | null>(null);
export const rendererAtom = atom<RendererState>({
  type: "Loading",
  info: renderers[0],
});
