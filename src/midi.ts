import * as midiManager from "midi-file";
import { MidiData, Note, Track, Event } from "./model";

export function parseMidiData(buffer: ArrayBuffer): MidiData {
  const parsed = midiManager.parseMidi(new Uint8Array(buffer));
  const tracks = collectTracks(parsed);
  const events = collectEvents(parsed);
  const notes = collectNotes(parsed.header.timeDivision ?? 480, events);
  return { tracks, events, notes };
}
function collectTracks(parsed: midiManager.MidiData): Track[] {
  const tracks: Track[] = [];
  for (const [index, track] of parsed.tracks.entries()) {
    let name = "";
    for (const e of track) {
      if (e.type === "trackName") {
        name = e.text;
      }
    }
    tracks.push({ number: index + 1, name });
  }
  return tracks;
}
function collectEvents(parsed: midiManager.MidiData): Event[] {
  const events: Event[] = [];
  for (const [index, track] of parsed.tracks.entries()) {
    let time = 0;
    for (const e of track) {
      time += e.deltaTime;
      if (e.type === "setTempo") {
        events.push({
          time,
          type: "setTempo",
          microsecondsPerBeat: (e as any).microsecondsPerBeat,
        });
      } else if (e.type === "noteOn") {
        events.push({
          time,
          type: "noteOn",
          trackIndex: index,
          noteNumber: e.noteNumber,
        });
      } else if (e.type === "noteOff") {
        events.push({
          time,
          type: "noteOff",
          trackIndex: index,
          noteNumber: e.noteNumber,
        });
      }
    }
  }
  return events.sort((a, b) => a.time - b.time);
}
function collectNotes(timeDivision: number, events: Event[]): Note[] {
  const notes: Note[] = [];
  const noteMap = new Map<string, Note>();
  let microsecondsPerBeat = 500000; // bpm=120
  let time = 0;
  let sec = 0;
  for (const event of events) {
    sec +=
      ((event.time - time) / timeDivision) * (microsecondsPerBeat / 1000000);
    time = event.time;
    if (event.type === "setTempo") {
      microsecondsPerBeat = event.microsecondsPerBeat;
    } else if (event.type === "noteOn") {
      const key = `${event.trackIndex}-${event.noteNumber}`;
      noteMap.set(key, {
        trackIndex: event.trackIndex,
        fromSec: sec,
        toSec: -1,
        noteNumber: event.noteNumber,
      });
    } else if (event.type === "noteOff") {
      const key = `${event.trackIndex}-${event.noteNumber}`;
      const note = noteMap.get(key);
      if (note) {
        note.toSec = sec;
        notes.push(note);
      }
      noteMap.delete(key);
    }
  }
  return notes.sort((a, b) => a.fromSec - b.fromSec);
}
