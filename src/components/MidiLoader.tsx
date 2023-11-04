import { FileInput } from "@/ui/FileInput";
import { parseMidiData } from "@/model/midi";
import { useCounter } from "@/counter";
import { useAtom, useSetAtom } from "jotai";
import { enabledTracksAtom, midiDataAtom } from "@/atoms";
import { formatTime } from "@/util";

export const MidiLoader = () => {
  useCounter("MidiLoader");
  const [midiData, setMidiData] = useAtom(midiDataAtom);
  const setEnabledTracks = useSetAtom(enabledTracksAtom);
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const midiData = parseMidiData(buffer);
      setMidiData(midiData);
      setEnabledTracks(
        [...Array(midiData.tracks.length).keys()].map(() => true),
      );
    })();
  };
  return (
    <label>
      <span>MIDI:</span>
      <FileInput onLoad={handleLoadMidi} extensions={[".mid", "midi"]} />
      {midiData && <span>{formatTime(midiData.endSec)}</span>}
    </label>
  );
};
