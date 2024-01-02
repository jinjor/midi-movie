import { FileInput } from "@/ui/FileInput";
import { parseMidiData } from "@/domain/midi";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { midiDataAtom } from "@/usecase/atoms";
import { formatTime } from "@/util";
import { useEffect } from "react";
import { useFileStorage } from "@/repository/fileStorage";

export const MidiLoader = () => {
  useCounter("MidiLoader");
  const { status, save, data: midiFile } = useFileStorage("midi");
  const [midiData, setMidiData] = useAtom(midiDataAtom);
  useEffect(() => {
    if (midiFile) {
      const midiData = parseMidiData(midiFile.data);
      setMidiData({
        ...midiData,
        fileName: midiFile.name,
      });
    }
  }, [midiFile, setMidiData]);
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const midiData = parseMidiData(buffer);
      setMidiData({
        ...midiData,
        fileName: file.name,
      });
      await save({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: buffer,
      });
    })();
  };
  return (
    <FileInput
      disabled={status === "loading"}
      onLoad={handleLoadMidi}
      extensions={[".mid", "midi"]}
    >
      {midiData && (
        <>
          <span>{midiData.fileName}</span> |{" "}
          <span>{formatTime(midiData.endSec)}</span>
        </>
      )}
    </FileInput>
  );
};
