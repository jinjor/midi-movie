import { FileInput } from "@/ui/FileInput";
import { parseMidiData } from "@/model/midi";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { midiDataAtom, midiFileAtom, selectedMidiFileAtom } from "@/atoms";
import { formatTime } from "@/util";
import { useEffect } from "react";
import { arrayBufferToBase64, base64ToArrayBuffer } from "@/model/base64";

export const MidiLoader = () => {
  useCounter("MidiLoader");
  const [midiFile, setMidiFile] = useAtom(midiFileAtom);
  const [selectedMidiFile, setSelectedMidiFile] = useAtom(selectedMidiFileAtom);
  const [midiData, setMidiData] = useAtom(midiDataAtom);
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const midiData = parseMidiData(buffer);
      setSelectedMidiFile(file.name);
      setMidiData(midiData);
      setMidiFile({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: arrayBufferToBase64(buffer),
      });
    })();
  };
  useEffect(() => {
    if (midiFile) {
      const midiData = parseMidiData(base64ToArrayBuffer(midiFile.data));
      setSelectedMidiFile(midiFile.name);
      setMidiData(midiData);
    }
  }, [midiFile, setSelectedMidiFile, setMidiData]);
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
