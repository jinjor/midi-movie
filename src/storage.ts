import { number, parse, Output } from "valibot";

const namespace = "MidiMovie.";
const schemas = {
  midiOffset: number(),
  opacity: number(),
  volume: number(),
};
type Schemas = typeof schemas;
export type StorageKey = keyof Schemas;
export type StorageValue<K extends StorageKey> = Output<Schemas[K]>;
export const get = (
  key: StorageKey,
  defaultValue: StorageValue<StorageKey>,
): StorageValue<StorageKey> => {
  try {
    const item = localStorage.getItem(namespace + key);
    return parse(schemas[key], item == null ? undefined : JSON.parse(item));
  } catch (e) {
    // JSON error or schema error
    localStorage.removeItem(namespace + key);
    return defaultValue;
  }
};
export const set = (key: StorageKey, value: StorageValue<StorageKey>): void => {
  localStorage.setItem(namespace + key, JSON.stringify(value));
};

// clean up old keys
for (const key of Object.keys(localStorage)) {
  if (!key.startsWith(namespace)) {
    continue;
  }
  const k = key.slice(namespace.length);
  if (k in schemas) {
    continue;
  }
  localStorage.removeItem(key);
}
