import { FileInput } from "@/ui/FileInput";
import { parseMidiData } from "@/model/midi";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { midiDataAtom, selectedMidiFileAtom } from "@/atoms";
import { formatTime } from "@/util";
import { useEffect } from "react";
import { useFileStorage } from "@/fileStorage";

export const MidiLoader = () => {
  useCounter("MidiLoader");
  const { status, save, data: midiFile } = useFileStorage("midi");
  const [selectedMidiFile, setSelectedMidiFile] = useAtom(selectedMidiFileAtom);
  const [midiData, setMidiData] = useAtom(midiDataAtom);
  useEffect(() => {
    if (midiFile) {
      const midiData = parseMidiData(midiFile.data);
      setSelectedMidiFile(midiFile.name);
      setMidiData(midiData);
    }
  }, [midiFile, setSelectedMidiFile, setMidiData]);
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const midiData = parseMidiData(buffer);
      setSelectedMidiFile(file.name);
      setMidiData(midiData);
      await save({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: buffer,
      });
    })();
  };
  return (
    <label>
      <span>MIDI:</span>
      <FileInput
        disabled={status === "loading"}
        onLoad={handleLoadMidi}
        extensions={[".mid", "midi"]}
      >
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
