import { FileInput } from "@/ui/FileInput";
import { parseMidiData } from "@/model/midi";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { midiDataAtom, selectedMidiFileAtom } from "@/atoms";
import { formatTime } from "@/util";

export const MidiLoader = () => {
  useCounter("MidiLoader");
  const [selectedMidiFile, setSelectedMidiFile] = useAtom(selectedMidiFileAtom);
  const [midiData, setMidiData] = useAtom(midiDataAtom);
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const midiData = parseMidiData(buffer);
      setSelectedMidiFile(file.name);
      setMidiData(midiData);
    })();
  };
  return (
    <label>
      <span>MIDI:</span>
      <FileInput onLoad={handleLoadMidi} extensions={[".mid", "midi"]}>
        {selectedMidiFile && midiData && (
          <>
            <span>{selectedMidiFile}</span> |{" "}
            <span>{formatTime(midiData.endSec)}</span>
          </>
        )}
      </FileInput>
    </label>
  );
};
