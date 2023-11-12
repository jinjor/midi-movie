import z from "zod";

const namespace = "MidiMovie.";
const schemas = {
  midiOffset: z.number().default(0),
  opacity: z.number().default(0.6),
  volume: z.number().default(1),
};
type Schemas = typeof schemas;
export type StorageKey = keyof Schemas;
export const get = (key: StorageKey): z.infer<Schemas[StorageKey]> => {
  try {
    const item = localStorage.getItem(namespace + key);
    return schemas[key].parse(item == null ? undefined : JSON.parse(item));
  } catch (e) {
    // JSON error or Zod error
    localStorage.removeItem(namespace + key);
    return schemas[key].parse(undefined);
  }
};
export const set = (
  key: StorageKey,
  value: z.infer<Schemas[StorageKey]>,
): void => {
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
