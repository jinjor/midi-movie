export type Size = { width: number; height: number };
export type Image = {
  url: string | null;
  size: Size;
};
export type Track = {
  number: number;
  name: string;
};
export type Event = {
  time: number;
} & (
  | {
      type: "noteOn";
      trackIndex: number;
      noteNumber: number;
    }
  | {
      type: "noteOff";
      trackIndex: number;
      noteNumber: number;
    }
  | {
      type: "setTempo";
      microsecondsPerBeat: number;
    }
);
export type Note = {
  index: number;
  trackIndex: number;
  fromSec: number;
  toSec: number;
  noteNumber: number;
};
export type StoredFile = {
  name: string;
  type: string;
  loadedAt: number;
  data: ArrayBuffer;
};
export type MidiData = {
  tracks: Track[];
  notes: Note[];
  events: Event[];
  endSec: number;
};
export type PlayingState = {
  startTime: number;
  timer: number;
};
export type TrackOptions = {
  enabled: boolean;
  order: number;
};
export type InitOptions<T> = {
  size: Size;
  notes: Note[];
  minNote: number;
  maxNote: number;
  tracks: TrackOptions[];
  customProps: T;
};
export type UpdateOptions<T> = {
  size: Size;
  notes: Note[];
  tracks: TrackOptions[];
  elapsedSec: number;
  minNote: number;
  maxNote: number;
  customProps: T;
  playing: boolean;
};
export type ModulePropDef =
  | {
      id: string;
      name: string;
      type: "number";
      min: number;
      max: number;
      step: number;
      defaultValue: number;
    }
  | {
      id: string;
      name: string;
      type: "boolean";
      min: 0;
      max: 1;
      step: 1;
      defaultValue: 0 | 1;
    };
export type ModuleConfig = {
  props: readonly ModulePropDef[];
};
export type ModulePropsType<C extends ModuleConfig> = {
  [key in C["props"][number]["id"]]: number;
};
