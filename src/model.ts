export type Size = { width: number; height: number };
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
};
export type Mutables = {
  minNote: number;
  maxNote: number;
  size: Size;
};
