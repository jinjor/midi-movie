import { atom, createStore } from "jotai";
import { MidiData, PlayingState } from "./model/types";
import { RendererState } from "./model/render";
import { StorageKey, StorageValue, get, set } from "./storage";

const subscribeFns: ((store: ReturnType<typeof createStore>) => void)[] = [];
const atomWithStorage = <K extends StorageKey>(
  key: K,
  defaultValue: StorageValue<K>,
) => {
  const a = atom(get(key, defaultValue));
  subscribeFns.push((store) => {
    store.sub(a, () => {
      set(key, store.get(a));
    });
  });
  return a;
};
export const createStoreWithStorage = () => {
  const store = createStore();
  for (const fn of subscribeFns) {
    fn(store);
  }
  return store;
};
export const midiFileAtom = atomWithStorage("midiFile", null);
export const imageFileAtom = atomWithStorage("imageFile", null);
export const audioFileAtom = atomWithStorage("audioFile", null);
export const midiOffsetAtom = atomWithStorage("midiOffset", 0);
export const opacityAtom = atomWithStorage("opacity", 0.6);
export const volumeAtom = atomWithStorage("volume", 1);
export const selectedRendererAtom = atomWithStorage(
  "selectedRenderer",
  "Default",
);
export const allTrackPropsAtom = atomWithStorage("allTrackProps", {});
export const allRendererPropsAtom = atomWithStorage("allRendererProps", {});
export const selectedMidiFileAtom = atom<string | null>(null);
export const imageUrlAtom = atom<string | null>(null);
export const imageSizeAtom = atom({
  width: 512,
  height: 512 * (9 / 16),
});
export const midiDataAtom = atom<MidiData | null>(null);
export const audioBufferAtom = atom<AudioBuffer | null>(null);
export const playingStateAtom = atom<PlayingState | null>(null);
export const rendererAtom = atom<RendererState>({
  type: "Loading",
});
