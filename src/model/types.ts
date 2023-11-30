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
  trackIndex: number;
  fromSec: number;
  toSec: number;
  noteNumber: number;
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
export type InitOptions = {
  size: Size;
  notes: Note[];
};
export type UpdateOptions<T> = {
  notes: Note[];
  size: Size;
  enabledTracks: boolean[];
  elapsedSec: number;
  customProps: T;
  playing: boolean;
};
export type ModulePropDef = {
  id: string;
  name: string;
  type: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};
export type ModuleConfig = {
  props: readonly ModulePropDef[];
};
export type ModulePropsType<C extends ModuleConfig> = {
  [key in C["props"][number]["id"]]: number;
};
