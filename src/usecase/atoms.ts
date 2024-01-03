import { atom, createStore } from "jotai";
import { MidiData, PlayingState } from "../domain/types";
import { RendererState } from "../domain/render";
import { StorageKey, StorageValue, get, set } from "../repository/storage";

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
export const opacityAtom = atomWithStorage("opacity", undefined);
export const volumeAtom = atomWithStorage("volume", undefined);
export const selectedRendererAtom = atomWithStorage(
  "selectedRenderer",
  "Pianoroll",
);
export const midiSpecificPropsAtom = atomWithStorage("midiSpecificProps", {});
export const allRendererPropsAtom = atomWithStorage("allRendererProps", {});
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
