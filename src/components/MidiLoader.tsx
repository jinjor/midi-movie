import { FileInput } from "@/ui/FileInput";
import { parseMidiData } from "@/model/midi";
import { useCounter } from "@/counter";
import { useSetAtom } from "jotai";
import { enabledTracksAtom, notesAtom, tracksAtom } from "@/atoms";

export const MidiLoader = () => {
  useCounter("MidiLoader");
  const setNotes = useSetAtom(notesAtom);
  const setTracks = useSetAtom(tracksAtom);
  const setEnabledTracks = useSetAtom(enabledTracksAtom);
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const { notes, tracks } = parseMidiData(buffer);
      setNotes(notes);
      setTracks(tracks);
      setEnabledTracks(new Set([...Array(tracks.length).keys()]));
    })();
  };
  return (
    <label>
      <span>MIDI:</span>
      <FileInput onLoad={handleLoadMidi} extensions={[".mid", "midi"]} />
    </label>
  );
};
