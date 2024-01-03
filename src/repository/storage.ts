import {
  number,
  parse,
  Output,
  string,
  record,
  array,
  object,
  boolean,
  optional,
} from "valibot";

const namespace = "MidiMovie.";

const schemas = {
  opacity: optional(number()),
  volume: optional(number()),
  selectedRenderer: optional(string()),
  midiSpecificProps: record(
    string(),
    object({
      midiOffset: number(),
      minNote: number(),
      maxNote: number(),
      tracks: array(
        object({
          order: number(),
          enabled: boolean(),
        }),
      ),
    }),
  ),
  allRendererProps: record(string(), record(string(), number())),
};
type Schemas = typeof schemas;
export type StorageKey = keyof Schemas;
export type StorageValue<K extends StorageKey> = Output<Schemas[K]>;
export const get = <K extends StorageKey>(
  key: K,
  defaultValue: StorageValue<K>,
): StorageValue<K> => {
  try {
    const item = localStorage.getItem(namespace + key);
    return parse(schemas[key], item == null ? undefined : JSON.parse(item));
  } catch (e) {
    // JSON error or schema error
    localStorage.removeItem(namespace + key);
    return defaultValue;
  }
};
export const set = <K extends StorageKey>(
  key: K,
  value: StorageValue<K>,
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
